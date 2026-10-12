import type { DocsExample } from '@/docs/components/page-definition'

/** Rewrites a StyleX-flavoured code sample to the Pleat equivalent shown on
 *  the pleat renderer's docs pages. The shared example emitters produce one
 *  source string per renderer; for pleat the shape of the calls is identical
 *  (the ported API mirrors the StyleX surface), so the text needs only a
 *  syntax rewrite: `stylex.create` objects become `Style.make(...)` pipelines,
 *  `stylex.props(...)` becomes `className(...)`, and `@/stylex/` imports move
 *  to `@/pleat/`. */

const EXACT: Record<string, string | null> = {
  ':hover': 'When.hover',
  ':focus': 'When.focus',
  ':focus-visible': 'When.focusVisible',
  ':focus-within': 'When.focusWithin',
  ':active': 'When.active',
  ':disabled': 'When.disabled',
  ':checked': 'When.checked',
  ':indeterminate': 'When.indeterminate',
  ':first-child': 'When.firstChild',
  ':last-child': 'When.lastChild',
  ':nth-child(odd)': 'When.odd',
  ':nth-child(even)': 'When.even',
  ':empty': 'When.empty',
  ':placeholder-shown': 'When.placeholderShown',
  '::before': 'When.before',
  '::after': 'When.after',
  '::placeholder': 'When.placeholder',
  '::selection': 'When.selection',
  '::backdrop': 'When.backdrop',
  '@media (prefers-reduced-motion: reduce)': 'When.reducedMotion',
  '@media (prefers-reduced-motion: no-preference)': 'When.motionSafe',
  '@media (prefers-color-scheme: dark)': 'When.dark',
  '@media (prefers-color-scheme: light)': 'When.light',
  '@media (prefers-contrast: more)': 'When.moreContrast',
  '@media (hover: hover)': 'When.canHover',
  '@media print': 'When.print',
  '@starting-style': 'When.startingStyle',
  default: null,
}

const sq = (s: string): string =>
  `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const UNWRAP = /^:(?:is|where)\((.+)\)$/

const condFor = (key: string): string => {
  if (key in EXACT) return EXACT[key] as string
  const k = key.trim()

  const media = k.match(/^@media\s+([\s\S]+)$/)
  if (media !== null) {
    const query = media[1]!.trim()
    const minWidth = query.match(/^\(min-width:\s*(.+)\)$/)
    if (minWidth !== null) return `When.minWidth(${sq(minWidth[1]!.trim())})`
    const maxWidth = query.match(/^\(max-width:\s*(.+)\)$/)
    if (maxWidth !== null) return `When.maxWidth(${sq(maxWidth[1]!.trim())})`
    return `When.media(${sq(query)})`
  }
  const supports = k.match(/^@supports\s+([\s\S]+)$/)
  if (supports !== null) return `When.supports(${sq(supports[1]!.trim())})`
  const container = k.match(/^@container(?:\s+([\w-]+))?\s*(\([\s\S]+\))$/)
  if (container !== null) {
    return `When.container(${sq(container[2]!.trim())}${container[1] !== undefined ? `, ${sq(container[1])}` : ''})`
  }

  const unwrap = k.match(UNWRAP)
  const inner = (unwrap?.[1] ?? k).trim()

  const has = inner.match(/^:has\((.+)\)$/s)
  if (has !== null) return `When.has(${condFor(has[1]!.trim())})`
  const not = inner.match(/^:not\((.+)\)$/s)
  if (not !== null) return `When.not(${condFor(not[1]!.trim())})`

  const data = inner.match(
    /^\[data-([\w-]+)(?:[~|^$*]?=["']?([^"'\]]*)["']?)?\]$/,
  )
  if (data !== null) {
    if (data[2] === undefined) return `When.data(${sq(data[1]!)})`
    if (inner.includes('~=')) return `When.pseudo(${sq(k)})`
    return `When.data(${sq(data[1]!)}, ${sq(data[2])})`
  }
  const aria = inner.match(/^\[aria-([\w-]+)(?:=["']([^"']*)["'])?\]$/)
  if (aria !== null) {
    if (aria[2] === undefined) return `When.pseudo(${sq(k)})`
    return `When.aria(${sq(aria[1]!)}, ${sq(aria[2])})`
  }
  if (/^\[[\w-]+(=["'][^\]]*["'])?\]$/.test(inner)) {
    return `When.pseudo(${sq(k)})`
  }
  return k.startsWith(':')
    ? `When.pseudo(${sq(k)})`
    : `When.pseudo(${sq(`:is(${k})`)})`
}

// ---------- object literal text helpers ----------

const OPENERS = '([{'
const CLOSERS = ')]}'

/** Splits object-literal contents at top-level commas, ignoring strings,
 *  comments, and nested brackets. */
const splitTopLevel = (body: string): Array<string> => {
  const parts: Array<string> = []
  let depth = 0
  let start = 0
  let i = 0
  while (i < body.length) {
    const ch = body[i]!
    if (ch === "'" || ch === '"' || ch === '`') {
      i++
      while (i < body.length && body[i] !== ch) {
        if (body[i] === '\\') i++
        i++
      }
      i++
      continue
    }
    if (ch === '/' && body[i + 1] === '/') {
      while (i < body.length && body[i] !== '\n') i++
      continue
    }
    if (ch === '/' && body[i + 1] === '*') {
      i += 2
      while (i < body.length && !(body[i] === '*' && body[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (OPENERS.includes(ch)) depth++
    else if (CLOSERS.includes(ch)) depth--
    else if (ch === ',' && depth === 0) {
      parts.push(body.slice(start, i))
      start = i + 1
    }
    i++
  }
  const tail = body.slice(start)
  if (tail.trim() !== '') parts.push(tail)
  return parts
}

/** Splits `key: value` at the first top-level colon. */
const entryOf = (part: string): readonly [string, string] => {
  let depth = 0
  let i = 0
  while (i < part.length) {
    const ch = part[i]!
    if (ch === "'" || ch === '"' || ch === '`') {
      i++
      while (i < part.length && part[i] !== ch) {
        if (part[i] === '\\') i++
        i++
      }
      i++
      continue
    }
    if (OPENERS.includes(ch)) depth++
    else if (CLOSERS.includes(ch)) depth--
    else if (ch === ':' && depth === 0) {
      return [part.slice(0, i).trim(), part.slice(i + 1).trim()]
    }
    i++
  }
  return [part.trim(), '']
}

const isObjectLiteral = (text: string): boolean =>
  text.startsWith('{') && text.endsWith('}')

const isConditionKey = (key: string): boolean =>
  key.startsWith(':') ||
  key.startsWith('@') ||
  key.startsWith('[') ||
  key.startsWith('when')

/** Turns a StyleX `{default: X, cond: Y, ...}` conditional value into the
 *  `[base, whens]` split, unwrapping nested `default`-keyed wrappers into
 *  `When.all(parent, child)` conditions. */
const flattenConditional = (
  entries: ReadonlyArray<readonly [string, string]>,
  whens: Array<readonly [string, string]>,
  parent?: string,
): string | undefined => {
  let base: string | undefined
  for (const [key, value] of entries) {
    if (key === 'default' || key === 'null') {
      if (value !== 'null' && value !== 'undefined') base = value
      continue
    }
    const condition =
      parent === undefined
        ? condFor(key)
        : `When.all(${parent}, ${condFor(key)})`
    if (isObjectLiteral(value)) {
      const inner = splitTopLevel(value.slice(1, -1)).map(entryOf)
      const innerBase = flattenConditional(inner, whens, condition)
      if (innerBase !== undefined) whens.push([condition, innerBase])
      continue
    }
    if (value !== 'null' && value !== 'undefined') {
      whens.push([condition, value])
    }
  }
  return base
}

/** Rewrites one `stylex.create` argument object as `{key: Style.make(...)}`. */
const pleatStylesObject = (objectText: string): string => {
  const body = objectText.trim().slice(1, -1)
  const out: Array<string> = []
  for (const part of splitTopLevel(body)) {
    const trimmed = part.trim()
    if (trimmed === '') continue
    const [key, value] = entryOf(trimmed)
    if (value === '') {
      out.push(trimmed)
      continue
    }
    if (key.startsWith('...')) {
      out.push(trimmed)
      continue
    }
    if (!isObjectLiteral(value)) {
      out.push(`${key}: ${value}`)
      continue
    }
    const base: Array<string> = []
    const whens: Array<string> = []
    for (const rule of splitTopLevel(value.slice(1, -1))) {
      const ruleText = rule.trim()
      if (ruleText === '') continue
      const [prop, propValue] = entryOf(ruleText)
      if (prop === '') {
        base.push(ruleText)
        continue
      }
      if (propValue === '') {
        base.push(ruleText)
        continue
      }
      if (isObjectLiteral(propValue)) {
        if (isConditionKey(prop)) {
          whens.push(
            `Style.when(${condFor(prop)}, ${propValue.replaceAll(' !important', '')})`,
          )
          continue
        }
        const inner = splitTopLevel(propValue.slice(1, -1)).map(entryOf)
        const innerWhens: Array<readonly [string, string]> = []
        const innerBase = flattenConditional(inner, innerWhens)
        if (innerBase !== undefined) {
          base.push(`${prop}: ${innerBase}`)
        }
        for (const [cond, v] of innerWhens) {
          whens.push(`Style.when(${cond}, {${prop}: ${v}})`)
        }
        continue
      }
      base.push(`${prop}: ${propValue}`)
    }
    let expr = `Style.make({${base.join(', ')}})`
    if (whens.length > 0) {
      expr += `.pipe(\n    ${whens.join(',\n    ')},\n  )`
    }
    out.push(`${key}: ${expr}`)
  }
  return `{${out.join(',\n')}}`
}

/** Finds the balanced `(...)` argument list starting at `open` (the index of
 *  the opening paren) and returns [argsText, endIndex]. */
const balancedCall = (
  text: string,
  open: number,
): readonly [string, number] => {
  let depth = 0
  let i = open
  while (i < text.length) {
    const ch = text[i]!
    if (ch === "'" || ch === '"' || ch === '`') {
      i++
      while (i < text.length && text[i] !== ch) {
        if (text[i] === '\\') i++
        i++
      }
      i++
      continue
    }
    if (OPENERS.includes(ch)) depth++
    else if (CLOSERS.includes(ch)) {
      depth--
      if (depth === 0) return [text.slice(open + 1, i), i + 1]
    }
    i++
  }
  return [text.slice(open + 1), text.length]
}

const WHEN_CALLS: Record<string, string> = {
  ancestor: 'within',
  siblingAfter: 'precededBy',
  descendant: 'within',
}

const whenCalls = (code: string): string =>
  code.replace(
    /stylex\.when\.(\w+)\(([^,()]+),\s*([\w$.]+)\)/g,
    (_match, name: string, selector: string, marker: string) =>
      `When.${WHEN_CALLS[name] ?? 'within'}(${marker}, ${condFor(selector.trim())})`,
  )

const usedPleatImports = (code: string): Array<string> => {
  const names: Array<string> = []
  for (const name of ['Style', 'When', 'Global', 'Token', 'Theme']) {
    if (new RegExp(`\\b${name}\\.[A-Za-z]`).test(code)) names.push(name)
  }
  return names
}

/** Applies the examples' pleat rewrite to a whole emitted source string. */
export const pleatCode = (code: string): string => {
  let out = code
  const hadStylexImport =
    /import \* as stylex from '@stylexjs\/stylex'\n?/.test(out)
  out = out.replace(/import \* as stylex from '@stylexjs\/stylex'\n?/g, '')
  out = out.replace(/import \{[^}]*\} from '@stylexjs\/stylex'\n?/g, '')

  out = out.replace(/stylex\.props\(/g, () => 'className(')
  out = out.replace(/\.className\s*\?\?\s*''/g, '')
  out = out.replace(/\.className\b/g, '')

  for (;;) {
    const at = out.indexOf('stylex.create(')
    if (at === -1) break
    const open = at + 'stylex.create'.length
    const [args, end] = balancedCall(out, open)
    const arg = args.trim()
    const replaced = isObjectLiteral(arg)
      ? pleatStylesObject(arg)
      : `Style.make(${arg})`
    out = out.slice(0, at) + replaced + out.slice(end)
  }

  out = out.replace(
    /stylex\.(defineConsts|keyframes|defineVars|createTheme|defaultMarker|defineMarker)\(/g,
    (call, name: string) => {
      switch (name) {
        case 'defaultMarker':
          return "When.marker('default-marker')("
        case 'defineMarker':
          return 'When.marker('
        case 'keyframes':
          return 'Global.keyframes('
        case 'defineVars':
          return 'Token.make('
        case 'createTheme':
          return 'Theme.patch('
        default:
          return `/* ${call} */(`
      }
    },
  )
  out = out.replace(
    /stylex\.defaultMarker\(\)\(/g,
    "When.marker('default-marker')(",
  )
  out = out.replace(
    /stylex\.defaultMarker\(\)/g,
    "When.marker('default-marker')",
  )

  out = whenCalls(out)
  out = out.replace(/stylex\.when\.(\w+)/g, 'When.$1')
  out = out.replace(/\bStaticStyles\b/g, 'Style.Style')
  out = out.replace(/\bStyleXStyles\b/g, 'Style.Style')
  out = out.replace(/\bstylex\.Style\b/g, 'Style.Style')
  out = out.replace(/(['"`])@\/stylex\//g, '$1@/pleat/')
  out = out.replace(/\bstylex\.(?!when\b)/g, 'Style.')

  if (hadStylexImport || out !== code) {
    const names = usedPleatImports(out)
    const lines: Array<string> = []
    if (names.length > 0) {
      lines.push(`import { ${names.join(', ')} } from '@pleat/core'`)
    }
    if (/\bclassName\(/.test(out)) {
      lines.push("import { className } from '@/pleat/style'")
    }
    if (lines.length > 0) {
      const insert = `${lines.join('\n')}\n`
      const lastImport = out.lastIndexOf('\nimport ')
      if (lastImport !== -1) {
        const lineEnd = out.indexOf('\n', lastImport + 1)
        out = `${out.slice(0, lineEnd + 1)}${insert}${out.slice(lineEnd + 1)}`
      } else {
        out = insert + out
      }
    }
  }
  return out
}

/** Maps a shared emitters' examples to the renderer's code text. Pleat reuses
 *  the StyleX-shaped snippets, rewritten by {@link pleatCode}. */
export const pleatExamples = (
  renderer: 'tailwind' | 'stylex' | 'pleat' | 'pleat',
  examples: ReadonlyArray<DocsExample>,
): ReadonlyArray<DocsExample> =>
  renderer === 'pleat'
    ? examples.map(example => ({ ...example, code: pleatCode(example.code) }))
    : examples
