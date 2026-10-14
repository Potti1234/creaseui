/* Canonical renderer-neutral semantic roles. Adapters (StyleX defineVars, Pleat
   Theme.make, scoped preset bindings) are generated from or checked against this. */

export const THEME_SCHEMA_VERSION = 1 as const

export const themeRoleGroups = {
  tokens: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    controlPlaceholder: 'color-mix(in oklab, currentColor 50%, transparent)',
    card: 'var(--card)',
    cardForeground: 'var(--card-foreground)',
    primary: 'var(--primary)',
    primaryForeground: 'var(--primary-foreground)',
    secondary: 'var(--secondary)',
    secondaryForeground: 'var(--secondary-foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    accent: 'var(--accent)',
    accentForeground: 'var(--accent-foreground)',
    destructive: 'var(--destructive)',
    alertInfo: 'var(--primary)',
    alertSuccess: 'var(--chart-2)',
    alertWarning: 'var(--chart-4)',
    destructiveForeground: 'oklch(0.985 0 0)',
    destructiveHover:
      'color-mix(in oklab, var(--destructive) 90%, transparent)',
    destructiveSurface: 'var(--stylex-destructive-surface)',
    softDestructiveSurface: 'var(--stylex-soft-destructive-surface)',
    softDestructiveHover: 'var(--stylex-soft-destructive-hover)',
    mutedHover: 'var(--stylex-muted-hover)',
    badgeDestructiveSurface: 'var(--stylex-soft-destructive-surface)',
    badgeDestructiveHover:
      'color-mix(in oklab, var(--destructive) 20%, transparent)',
    badgeMutedHover: 'var(--stylex-muted-hover)',
    statusPlateInk: 'oklch(0.985 0 0)',
    statusWarningInk: 'oklch(0.205 0 0)',
    badgePrimaryHover: 'color-mix(in oklab, var(--primary) 80%, transparent)',
    badgeSecondaryHover:
      'color-mix(in oklab, var(--secondary) 80%, transparent)',
    buttonPrimaryHover: 'color-mix(in oklab, var(--primary) 80%, transparent)',
    buttonSecondaryHover:
      'color-mix(in oklab, var(--secondary), var(--foreground) 5%)',
    inputSurface: 'var(--stylex-input-surface)',
    outlineSurface: 'var(--stylex-outline-surface)',
    outlineHover: 'var(--stylex-outline-hover)',
    primaryHover: 'color-mix(in oklab, var(--primary) 90%, transparent)',
    secondaryHover: 'color-mix(in oklab, var(--secondary) 80%, transparent)',
    border: 'var(--color-border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
    radius: 'var(--radius)',
    controlRadius: 'calc(var(--radius) - 2px)',
    cardRadius: 'calc(var(--radius) + 4px)',
    focusRingShadow:
      '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    focusRingOffsetShadow: '0 0 0 2px var(--background), 0 0 0 4px var(--ring)',
    destructiveRingShadow:
      '0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent)',
    shadowSm: '0 1px 2px rgb(0 0 0 / 0.05)',
    shadowCard: '0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06)',
    shadowNone: 'none',
    transparent: 'transparent',
    backdrop: 'rgb(0 0 0 / 0.5)',
    drawerBackdrop: 'rgb(0 0 0 / 0.1)',
  },
  foundationTokens: {
    muted: 'var(--muted)',
    popover: 'var(--popover)',
    popoverForeground: 'var(--popover-foreground)',
    destructiveSoft: 'color-mix(in oklab, var(--destructive) 10%, transparent)',
    destructiveMuted:
      'color-mix(in oklab, var(--destructive) 80%, transparent)',
    primarySoft: 'color-mix(in oklab, var(--primary) 10%, transparent)',
    foregroundMuted: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
    foregroundSoft: 'color-mix(in oklab, var(--foreground) 10%, transparent)',
    ringSoft: 'color-mix(in oklab, var(--ring) 50%, transparent)',
    destructiveRingSoft:
      'color-mix(in oklab, var(--destructive) 20%, transparent)',
    inputDark: 'color-mix(in oklab, var(--input) 30%, transparent)',
    mutedSoft: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    shadowXs: '0 1px 2px rgb(0 0 0 / 0.05)',
    shadowNone: 'none',
    checkboxRadius: '4px',
    radiusSm: 'calc(var(--radius) - 4px)',
    radiusMd: 'calc(var(--radius) - 2px)',
    radiusLg: 'var(--radius)',
    radiusXl: 'calc(var(--radius) + 4px)',
    radiusBase: '4px',
    radiusNested: 'calc(var(--radius) - 5px)',
    radius2xl: '1rem',
    radiusMdCap8: 'min(calc(var(--radius) - 2px), 8px)',
    radiusMdCap10: 'min(calc(var(--radius) - 2px), 10px)',
    radiusFull: '9999px',
    transparent: 'transparent',
    leadingNormal: '1.5',
    white: 'rgb(255 255 255)',
    shadowSm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    shadowMd:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    shadowLg:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    shadowXl:
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    ringShadow1: '0 0 0 1px color-mix(in oklab, var(--ring) 50%, transparent)',
    cardRing3: '0 0 0 3px var(--card)',
    ringShadow4: '0 0 0 4px color-mix(in oklab, var(--ring) 50%, transparent)',
    overlay40: 'rgb(0 0 0 / 0.4)',
    overlay50: 'rgb(0 0 0 / 0.5)',
    mutedForeground50:
      'color-mix(in oklab, var(--muted-foreground) 50%, transparent)',
    mutedForeground60:
      'color-mix(in oklab, var(--muted-foreground) 60%, transparent)',
    foregroundFaint: 'color-mix(in oklab, var(--foreground) 5%, transparent)',
    primaryFaint: 'color-mix(in oklab, var(--primary) 5%, transparent)',
    primarySoft20: 'color-mix(in oklab, var(--primary) 20%, transparent)',
    destructiveFaint: 'color-mix(in oklab, var(--destructive) 5%, transparent)',
    destructiveEdge40:
      'color-mix(in oklab, var(--destructive) 40%, transparent)',
    avatarBadgeSuccess: 'oklch(0.627 0.194 149.214)',
    nativeOptionSurface: 'Canvas',
    nativeOptionInk: 'CanvasText',
  },
  complexTokens: {
    sidebar: 'var(--sidebar)',
    sidebarForeground: 'var(--sidebar-foreground)',
    sidebarPrimary: 'var(--sidebar-primary)',
    sidebarPrimaryForeground: 'var(--sidebar-primary-foreground)',
    sidebarAccent: 'var(--sidebar-accent)',
    sidebarAccentForeground: 'var(--sidebar-accent-foreground)',
    sidebarBorder: 'var(--sidebar-border)',
    sidebarRing: 'var(--sidebar-ring)',
    chart1: 'var(--chart-1)',
    chart2: 'var(--chart-2)',
    chart3: 'var(--chart-3)',
    chart4: 'var(--chart-4)',
    chart5: 'var(--chart-5)',
    mutedSurface: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    opaqueMutedSurface:
      'color-mix(in oklab, var(--muted) 50%, var(--background))',
    accentSurface: 'color-mix(in oklab, var(--accent) 50%, transparent)',
    opaqueAccentSurface:
      'color-mix(in oklab, var(--accent) 50%, var(--background))',
    focusOutline: '1px solid var(--ring)',
    resizeShadow: '0 0 0 1px var(--ring)',
    smallRadius: '2px',
    overlaySurface: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
    transparent: 'transparent',
    sidebarEdgeRing: '0 0 0 1px var(--sidebar-border)',
    sidebarAccentRing: '0 0 0 1px var(--sidebar-accent)',
    sidebarForegroundDim:
      'color-mix(in oklab, var(--sidebar-foreground) 70%, transparent)',
    chart1Soft10: 'color-mix(in oklab, var(--chart-1) 10%, transparent)',
    chart2Soft10: 'color-mix(in oklab, var(--chart-2) 10%, transparent)',
    chart3Soft10: 'color-mix(in oklab, var(--chart-3) 10%, transparent)',
    chart2Soft15: 'color-mix(in oklab, var(--chart-2) 15%, transparent)',
    chart3Soft15: 'color-mix(in oklab, var(--chart-3) 15%, transparent)',
    chart4Soft15: 'color-mix(in oklab, var(--chart-4) 15%, transparent)',
    chart2Soft25: 'color-mix(in oklab, var(--chart-2) 25%, transparent)',
    destructiveSoft15:
      'color-mix(in oklab, var(--destructive) 15%, transparent)',
    chart2Soft20: 'color-mix(in oklab, var(--chart-2) 20%, transparent)',
    chart4Soft20: 'color-mix(in oklab, var(--chart-4) 20%, transparent)',
    destructiveSoft20:
      'color-mix(in oklab, var(--destructive) 20%, transparent)',
    chart4Soft5: 'color-mix(in srgb, var(--chart-4) 5%, transparent)',
    destructiveSoft6: 'color-mix(in srgb, var(--destructive) 6%, transparent)',
  },
} as const

export type ThemeRoleGroup = keyof typeof themeRoleGroups
export type ThemeRole<G extends ThemeRoleGroup> =
  keyof (typeof themeRoleGroups)[G] & string

/** Rebinds every role of `group` at a nested scope so derived `var()`
 *  expressions (hover mixes, soft surfaces, radii) resolve against that
 *  scope's palette instead of inheriting values computed at `:root`. */
export const scopedRoleDeclarations = <G extends ThemeRoleGroup>(
  group: G,
  variableFor: (role: ThemeRole<G>) => string,
): string =>
  Object.entries(themeRoleGroups[group])
    .map(([role, value]) => `${variableFor(role as ThemeRole<G>)}:${value}`)
    .join(';')

/** Palette inputs every theme definition must resolve (shadcn names). */
export const BASE_THEME_VARIABLES = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'border',
  'input',
  'ring',
  'radius',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
] as const
export type BaseThemeVariable = (typeof BASE_THEME_VARIABLES)[number]

const LENGTH_VARIABLES: ReadonlySet<string> = new Set(['radius'])

export type ThemeDefinition = Readonly<{
  schemaVersion: number
  values: Readonly<Record<string, string>>
}>

const REFERENCE = /var\(--([a-z0-9-]+)/g

const COLOR_FUNCTIONS: ReadonlySet<string> = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'color',
  'color-mix',
  'light-dark',
])
const LENGTH_FUNCTIONS: ReadonlySet<string> = new Set([
  'calc',
  'min',
  'max',
  'clamp',
])
/** CSS named colors plus `transparent` and `currentColor`. */
const COLOR_KEYWORDS: ReadonlySet<string> = new Set(
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen transparent currentcolor'.split(
    ' ',
  ),
)
const HEX_COLOR = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i
const LENGTH_LITERAL =
  /^(?:0|-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|%|ch|ex|vw|vh|vmin|vmax|svh|dvh|lh))$/
const SINGLE_FUNCTION = /^([a-z-]+)\((.*)\)$/is
const ALIAS = /^var\(\s*--([a-z0-9-]+)\s*(?:,(.*))?\)$/is

const balanced = (value: string): boolean => {
  let depth = 0
  for (const character of value) {
    if (character === '(') depth += 1
    else if (character === ')') depth -= 1
    if (depth < 0) return false
  }
  return depth === 0
}

/** Why `value` is not a valid `kind` value, or null when it is. Aliases
 *  (`var(--role)`) are checked separately against the resolved theme. */
const valueProblem = (
  value: string,
  kind: 'color' | 'length',
): string | null => {
  const trimmed = value.trim()
  if (trimmed === '') return 'an empty value'
  if (!balanced(trimmed)) return `malformed ${value} (unbalanced parentheses)`
  if (ALIAS.test(trimmed)) return null
  const call = SINGLE_FUNCTION.exec(trimmed)
  if (call !== null && balanced(call[2] ?? '')) {
    const name = (call[1] ?? '').toLowerCase()
    const allowed = kind === 'color' ? COLOR_FUNCTIONS : LENGTH_FUNCTIONS
    if (!allowed.has(name)) return `unsupported function ${name}() in ${value}`
    if ((call[2] ?? '').trim() === '') return `empty ${name}() in ${value}`
    return null
  }
  if (kind === 'color')
    return HEX_COLOR.test(trimmed) || COLOR_KEYWORDS.has(trimmed.toLowerCase())
      ? null
      : value
  return LENGTH_LITERAL.test(trimmed) ? null : value
}

/** Errors for a theme definition: schema version, unknown or missing
 *  roles, value kinds and alias cycles. Empty when valid. */
export const validateThemeDefinition = (
  definition: ThemeDefinition,
  { partial = false }: { partial?: boolean } = {},
): ReadonlyArray<string> => {
  const errors: Array<string> = []
  if (definition.schemaVersion !== THEME_SCHEMA_VERSION)
    errors.push(`unsupported schemaVersion ${definition.schemaVersion}`)
  const known = new Set<string>(BASE_THEME_VARIABLES)
  for (const [name, value] of Object.entries(definition.values)) {
    if (!known.has(name)) errors.push(`unknown role --${name}`)
    if (typeof value !== 'string') {
      errors.push(`--${name} must be a string value`)
      continue
    }
    const kind = LENGTH_VARIABLES.has(name) ? 'length' : 'color'
    const problem = valueProblem(value, kind)
    if (problem !== null)
      errors.push(`--${name} expects a ${kind}, got ${problem}`)
    for (const [, target] of value.matchAll(REFERENCE))
      if (
        target !== undefined &&
        !(target in definition.values) &&
        !known.has(target)
      )
        errors.push(`--${name} references unresolved alias --${target}`)
  }
  if (!partial)
    for (const name of BASE_THEME_VARIABLES)
      if (!(name in definition.values)) errors.push(`missing role --${name}`)
  const visiting = new Set<string>()
  const done = new Set<string>()
  const visit = (name: string, path: ReadonlyArray<string>): void => {
    if (done.has(name)) return
    if (visiting.has(name)) {
      errors.push(
        `alias cycle ${[...path, name].map(n => `--${n}`).join(' -> ')}`,
      )
      return
    }
    visiting.add(name)
    const raw = definition.values[name]
    for (const [, target] of (typeof raw === 'string' ? raw : '').matchAll(
      REFERENCE,
    ))
      if (target !== undefined && target in definition.values)
        visit(target, [...path, name])
    visiting.delete(name)
    done.add(name)
  }
  for (const name of Object.keys(definition.values)) visit(name, [])
  return errors
}
