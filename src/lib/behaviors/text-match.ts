import { Schema } from 'effect'

export const MatchRange = Schema.Struct({
  start: Schema.Number,
  end: Schema.Number,
})
export type MatchRange = typeof MatchRange.Type
export const MatchSegment = Schema.Struct({
  text: Schema.String,
  match: Schema.Boolean,
})
export type MatchSegment = typeof MatchSegment.Type
export type Folder = Readonly<{ fold: (text: string) => string }>
export type MatchOptions = Readonly<{ locale?: string; folder?: Folder }>

export const createFolder = (locale?: string): Folder => {
  const collator = new Intl.Collator(locale, {
    sensitivity: 'base',
    usage: 'search',
  })
  const lowerCase = /^(tr|az|lt)\b/i.test(locale ?? '')
    ? (text: string) => text.toLocaleLowerCase(locale)
    : (text: string) => text.toLowerCase()
  const lower = (text: string): string => lowerCase(text).replaceAll('ς', 'σ')
  const chars = new Map<string, string>()
  const foldChar = (char: string): string => {
    const cached = chars.get(char)
    if (cached !== undefined) return cached
    const lowered = lower(char)
    const stripped = lower(char.normalize('NFD').replace(/\p{Diacritic}/gu, ''))
    const folded =
      char < '\x80'
        ? lowered
        : stripped.length === char.length &&
            stripped !== lowered &&
            collator.compare(char, stripped) === 0
          ? stripped
          : ((/\p{Script=Latin}/u.test(char)
              ? [...'abcdefghijklmnopqrstuvwxyz'].find(
                  letter => collator.compare(char, letter) === 0,
                )
              : undefined) ?? (lowered.length === char.length ? lowered : char))
    if (chars.size >= 4096) chars.clear()
    chars.set(char, folded)
    return folded
  }
  return { fold: text => [...text].map(foldChar).join('') }
}

const defaultFolder = createFolder(
  Intl.DateTimeFormat().resolvedOptions().locale,
)
export const foldText = (text: string): string => defaultFolder.fold(text)
const folderFor = (options: MatchOptions): Folder =>
  options.folder ??
  (options.locale === undefined ? defaultFolder : createFolder(options.locale))
const startsWord = (text: string, index: number): boolean =>
  index === 0 || ' -_/.:,()[]@#'.includes(text[index - 1] ?? '')

export const fuzzyScore = (
  text: string,
  query: string,
  options: MatchOptions = {},
): number => {
  const folder = folderFor(options)
  const needle = folder.fold(query).trim()
  const haystack = folder.fold(text).trim()
  if (!needle || haystack === needle) return 1
  const index = haystack.indexOf(needle)
  const coverage = (0.09 * needle.length) / haystack.length
  if (index === 0) return 0.9 + coverage
  if (index > 0) {
    let word = false
    for (let at = index; at !== -1; at = haystack.indexOf(needle, at + 1)) {
      if (startsWord(haystack, at)) word = true
    }
    return (word ? 0.75 : 0.6) + coverage
  }
  let position = 0
  let previous = -2
  let bonus = 0
  let letters = 0
  for (const char of needle) {
    if (char === ' ') continue
    const found = haystack.indexOf(char, position)
    if (found === -1) return 0
    letters++
    if (startsWord(haystack, found)) bonus++
    if (found === previous + 1) bonus++
    previous = found
    position = found + 1
  }
  return letters === 0 ? 0 : 0.1 + (0.4 * bonus) / (2 * letters)
}

export const fuzzyFilter = (
  item: Readonly<{ label: string; keywords?: ReadonlyArray<string> }>,
  query: string,
  options: MatchOptions = {},
): number =>
  Math.max(
    fuzzyScore(item.label, query, options),
    ...(item.keywords ?? []).map(
      keyword => fuzzyScore(keyword, query, options) * 0.95,
    ),
  )

export const matchRanges = (
  text: string,
  query: string,
  mode: 'contains' | 'startsWith' | 'fuzzy',
  options: MatchOptions = {},
): ReadonlyArray<MatchRange> => {
  const folder = folderFor(options)
  const needle = folder.fold(query.trim())
  if (!needle) return []
  const haystack = folder.fold(text)
  if (mode === 'startsWith') {
    let start = 0
    while (start < haystack.length && haystack.charCodeAt(start) <= 32) start++
    return haystack.startsWith(needle, start)
      ? [{ start, end: start + needle.length }]
      : []
  }
  const first = haystack.indexOf(needle)
  if (first !== -1) {
    let start = first
    if (mode === 'fuzzy') {
      for (let at = first; at !== -1; at = haystack.indexOf(needle, at + 1)) {
        if (startsWord(haystack, at)) {
          start = at
          break
        }
      }
    }
    return [{ start, end: start + needle.length }]
  }
  if (mode !== 'fuzzy') return []
  const ranges: Array<{ start: number; end: number }> = []
  let position = 0
  for (const char of needle) {
    if (char === ' ') continue
    const found = haystack.indexOf(char, position)
    if (found === -1) return []
    const last = ranges.at(-1)
    if (last && last.end === found) last.end = found + 1
    else ranges.push({ start: found, end: found + 1 })
    position = found + 1
  }
  return ranges
}

export const matchSegments = (
  text: string,
  ranges: ReadonlyArray<MatchRange>,
): ReadonlyArray<MatchSegment> => {
  if (!ranges.length) return [{ text, match: false }]
  const segments: Array<MatchSegment> = []
  let position = 0
  for (const { start, end } of ranges) {
    if (start > position)
      segments.push({ text: text.slice(position, start), match: false })
    segments.push({ text: text.slice(start, end), match: true })
    position = end
  }
  if (position < text.length)
    segments.push({ text: text.slice(position), match: false })
  return segments
}
