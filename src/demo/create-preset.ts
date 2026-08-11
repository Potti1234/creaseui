import { Option, Schema as S } from 'effect'

export const STYLES = ['nova', 'vega', 'maia', 'lyra', 'mira', 'luma', 'sera', 'rhea'] as const
export const BASE_COLORS = ['neutral', 'stone', 'zinc', 'gray', 'mauve', 'olive', 'mist', 'taupe'] as const
export const THEMES = ['neutral', 'stone', 'zinc', 'gray', 'amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'green', 'indigo', 'lime', 'orange', 'pink', 'purple', 'red', 'rose', 'sky', 'teal', 'violet', 'yellow', 'mauve', 'olive', 'mist', 'taupe'] as const
export const ICON_LIBRARIES = ['lucide', 'hugeicons', 'tabler', 'phosphor', 'remixicon'] as const
export const FONTS = ['inter', 'noto-sans', 'nunito-sans', 'figtree', 'roboto', 'raleway', 'dm-sans', 'public-sans', 'outfit', 'jetbrains-mono', 'geist', 'geist-mono', 'lora', 'merriweather', 'playfair-display', 'noto-serif', 'roboto-slab', 'oxanium', 'manrope', 'space-grotesk', 'montserrat', 'ibm-plex-sans', 'source-sans-3', 'instrument-sans', 'eb-garamond', 'instrument-serif'] as const
export const FONT_HEADINGS = ['inherit', ...FONTS] as const
export const RADII = ['default', 'none', 'small', 'medium', 'large'] as const
export const MENU_ACCENTS = ['subtle', 'bold'] as const
export const MENU_COLORS = ['default', 'inverted', 'default-translucent', 'inverted-translucent'] as const

export const Field = S.Literals(['style', 'baseColor', 'theme', 'chartColor', 'iconLibrary', 'font', 'fontHeading', 'radius', 'menuAccent', 'menuColor'])
export type Field = typeof Field.Type

export const Config = S.Struct({
  style: S.String,
  baseColor: S.String,
  theme: S.String,
  chartColor: S.String,
  iconLibrary: S.String,
  font: S.String,
  fontHeading: S.String,
  radius: S.String,
  menuAccent: S.String,
  menuColor: S.String,
})
export type Config = typeof Config.Type

export const DEFAULT_CONFIG: Config = {
  style: 'nova', baseColor: 'neutral', theme: 'neutral', chartColor: 'neutral',
  iconLibrary: 'lucide', font: 'inter', fontHeading: 'inherit', radius: 'default',
  menuAccent: 'subtle', menuColor: 'default',
}

const FIELDS = [
  { key: 'menuColor', values: MENU_COLORS, bits: 3 },
  { key: 'menuAccent', values: MENU_ACCENTS, bits: 3 },
  { key: 'radius', values: RADII, bits: 4 },
  { key: 'font', values: FONTS, bits: 6 },
  { key: 'iconLibrary', values: ICON_LIBRARIES, bits: 6 },
  { key: 'theme', values: THEMES, bits: 6 },
  { key: 'baseColor', values: BASE_COLORS, bits: 6 },
  { key: 'style', values: STYLES, bits: 6 },
] as const
const V2_FIELDS = [...FIELDS, { key: 'chartColor', values: THEMES, bits: 6 }, { key: 'fontHeading', values: FONT_HEADINGS, bits: 5 }] as const
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const toBase62 = (value: number): string => value === 0
  ? '0'
  : Array.from(
      { length: Math.floor(Math.log(value) / Math.log(62)) + 1 },
      (_, index) => Math.floor(value / 62 ** index) % 62,
    )
      .reverse()
      .map(index => BASE62[index])
      .join('')

const fromBase62 = (value: string): Option.Option<number> => value
  .split('')
  .reduce<Option.Option<number>>(
    (result, character) => Option.flatMap(result, current => {
      const index = BASE62.indexOf(character)
      return index < 0 ? Option.none() : Option.some(current * 62 + index)
    }),
    Option.some(0),
  )

export const encodePreset = (config: Config): string => {
  const { packed } = V2_FIELDS.reduce(
    (state, field) => ({
      packed: state.packed + Math.max(0, (field.values as readonly string[]).indexOf(config[field.key])) * 2 ** state.offset,
      offset: state.offset + field.bits,
    }),
    { packed: 0, offset: 0 },
  )
  return `b${toBase62(packed)}`
}

export const decodePreset = (code: string): Option.Option<Config> => {
  if (!/^[ab][0-9A-Za-z]{1,9}$/.test(code)) return Option.none()
  const fields = code[0] === 'a' ? FIELDS : V2_FIELDS
  return Option.map(fromBase62(code.slice(1)), packed => {
    const decoded = fields.reduce(
      (state, field) => {
        const index = Math.floor(packed / 2 ** state.offset) % 2 ** field.bits
        return {
          values: { ...state.values, [field.key]: field.values[index] ?? field.values[0] },
          offset: state.offset + field.bits,
        }
      },
      { values: {} as Record<string, string>, offset: 0 },
    ).values
    return (code[0] === 'a'
      ? { ...decoded, chartColor: decoded.theme ?? 'neutral', fontHeading: 'inherit' }
      : decoded) as Config
  })
}

export const parsePresetInput = (value: string): Option.Option<Config> => {
  const input = value.trim()
  const flagValue = input.match(/^--preset\s+(.+)$/i)?.[1]?.trim()
  let candidate = flagValue ?? input
  try {
    const url = new URL(candidate)
    candidate = url.searchParams.get('preset') ?? candidate
  } catch { /* Plain preset code. */ }
  return decodePreset(candidate)
}

const ACCENTS: Readonly<Record<string, readonly [string, string]>> = {
  neutral: ['oklch(0.205 0 0)', 'oklch(0.922 0 0)'], stone: ['oklch(0.216 0.006 56.043)', 'oklch(0.923 0.003 48.717)'], zinc: ['oklch(0.21 0.006 285.885)', 'oklch(0.92 0.004 286.32)'], gray: ['oklch(0.21 0.034 264.665)', 'oklch(0.928 0.006 264.531)'], amber: ['oklch(0.666 0.179 58.318)', 'oklch(0.769 0.188 70.08)'], blue: ['oklch(0.546 0.245 262.881)', 'oklch(0.623 0.214 259.815)'], cyan: ['oklch(0.609 0.126 221.723)', 'oklch(0.715 0.143 215.221)'], emerald: ['oklch(0.596 0.145 163.225)', 'oklch(0.696 0.17 162.48)'], fuchsia: ['oklch(0.591 0.293 322.896)', 'oklch(0.667 0.295 322.15)'], green: ['oklch(0.527 0.154 150.069)', 'oklch(0.723 0.219 149.579)'], indigo: ['oklch(0.511 0.262 276.966)', 'oklch(0.585 0.233 277.117)'], lime: ['oklch(0.648 0.2 131.684)', 'oklch(0.768 0.233 130.85)'], orange: ['oklch(0.646 0.222 41.116)', 'oklch(0.705 0.213 47.604)'], pink: ['oklch(0.592 0.249 0.584)', 'oklch(0.656 0.241 354.308)'], purple: ['oklch(0.558 0.288 302.321)', 'oklch(0.627 0.265 303.9)'], red: ['oklch(0.577 0.245 27.325)', 'oklch(0.637 0.237 25.331)'], rose: ['oklch(0.586 0.253 17.585)', 'oklch(0.645 0.246 16.439)'], sky: ['oklch(0.588 0.158 241.966)', 'oklch(0.685 0.169 237.323)'], teal: ['oklch(0.6 0.118 184.704)', 'oklch(0.704 0.14 182.503)'], violet: ['oklch(0.541 0.281 293.009)', 'oklch(0.606 0.25 292.717)'], yellow: ['oklch(0.681 0.162 75.834)', 'oklch(0.795 0.184 86.047)'], mauve: ['oklch(0.215 0.006 342.321)', 'oklch(0.922 0.005 342.5)'], olive: ['oklch(0.221 0.012 113.78)', 'oklch(0.924 0.012 113.5)'], mist: ['oklch(0.218 0.012 232)', 'oklch(0.923 0.011 232)'], taupe: ['oklch(0.218 0.01 74)', 'oklch(0.923 0.008 74)'],
}

const radiusValue = (radius: string): string => ({ none: '0', small: '0.45rem', medium: '0.625rem', large: '0.875rem' })[radius] ?? '0.625rem'
const fontFamily = (font: string): string => `"${font.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join(' ')}", ui-sans-serif, system-ui, sans-serif`

export const presetCss = (config: Config): string => {
  const accent = ACCENTS[config.theme] ?? ACCENTS.neutral!
  const chart = ACCENTS[config.chartColor] ?? accent
  const base = ACCENTS[config.baseColor] ?? ACCENTS.neutral!
  const heading = config.fontHeading === 'inherit' ? fontFamily(config.font) : fontFamily(config.fontHeading)
  const invertedMenu = config.menuColor.startsWith('inverted')
  const boldMenu = config.menuAccent === 'bold'
  return `.create-board-theme{--background:oklch(1 0 0);--foreground:${base[0]};--card:oklch(1 0 0);--card-foreground:${base[0]};--popover:oklch(1 0 0);--popover-foreground:${base[0]};--primary:${accent[0]};--primary-foreground:oklch(0.985 0 0);--secondary:${base[1]};--secondary-foreground:${base[0]};--muted:${base[1]};--muted-foreground:color-mix(in oklch,${base[0]} 62%,white);--accent:${base[1]};--accent-foreground:${base[0]};--border:color-mix(in oklch,${base[1]} 82%,${base[0]});--input:color-mix(in oklch,${base[1]} 82%,${base[0]});--ring:${accent[0]};--chart-1:${chart[0]};--chart-2:${chart[1]};--sidebar:${invertedMenu ? base[0] : base[1]};--sidebar-foreground:${invertedMenu ? 'oklch(0.985 0 0)' : base[0]};--sidebar-primary:${accent[0]};--sidebar-primary-foreground:oklch(0.985 0 0);--sidebar-accent:${boldMenu ? accent[0] : invertedMenu ? 'color-mix(in oklch,' + base[0] + ' 88%,white)' : base[1]};--sidebar-accent-foreground:${boldMenu || invertedMenu ? 'oklch(0.985 0 0)' : base[0]};--radius:${radiusValue(config.radius)};--font-sans:${fontFamily(config.font)};font-family:var(--font-sans)}.create-board-theme h1,.create-board-theme h2,.create-board-theme h3{font-family:${heading}}.dark .create-board-theme{--background:${base[0]};--foreground:oklch(0.985 0 0);--card:color-mix(in oklch,${base[0]} 92%,white);--card-foreground:oklch(0.985 0 0);--popover:color-mix(in oklch,${base[0]} 92%,white);--popover-foreground:oklch(0.985 0 0);--primary:${accent[1]};--primary-foreground:${base[0]};--secondary:color-mix(in oklch,${base[0]} 84%,white);--secondary-foreground:oklch(0.985 0 0);--muted:color-mix(in oklch,${base[0]} 84%,white);--muted-foreground:color-mix(in oklch,${base[0]} 45%,white);--accent:color-mix(in oklch,${base[0]} 84%,white);--accent-foreground:oklch(0.985 0 0);--border:oklch(1 0 0 / 10%);--input:oklch(1 0 0 / 15%);--ring:${accent[1]};--chart-1:${chart[1]};--chart-2:${chart[0]};--sidebar-primary:${accent[1]};--sidebar-primary-foreground:${base[0]}}`
}
