import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  BASE_COLORS,
  DEFAULT_CONFIG,
  THEMES,
  presetCss,
} from '../src/demo/create-preset.ts'
import {
  checkContrast,
  contrastRatio,
  declarationsFor,
  resolveColor,
  type ThemeValues,
} from '../src/theme/palette.ts'
import {
  BASE_THEME_VARIABLES,
  THEME_SCHEMA_VERSION,
  validateThemeDefinition,
} from '../src/theme/roles.ts'

const rootCss = readFileSync('src/theme.css', 'utf8')
const rootLight = declarationsFor(rootCss, ':root')
const rootDark = { ...rootLight, ...declarationsFor(rootCss, '.dark') }

/* Contrast failures present when validation was introduced. Entries may only
   be removed (by fixing the palette); a new failure or a fixed-but-listed
   entry fails the test. */
const baseline: ReadonlyArray<string> = JSON.parse(
  readFileSync('test/fixtures/palette-contrast-baseline.json', 'utf8'),
)

const baseRoles = (values: ThemeValues): ThemeValues =>
  Object.fromEntries(
    BASE_THEME_VARIABLES.flatMap(name =>
      values[name] === undefined ? [] : [[name, values[name]]],
    ),
  )

const resolvedThemes = (): ReadonlyArray<
  readonly [label: string, values: ThemeValues]
> => [
  ['root:light', rootLight],
  ['root:dark', rootDark],
  ...THEMES.flatMap(theme =>
    BASE_COLORS.flatMap(baseColor => {
      const css = presetCss({ ...DEFAULT_CONFIG, theme, baseColor })
      const light = declarationsFor(css, '.create-board-theme')
      return [
        [`${theme}:${baseColor}:light`, { ...rootLight, ...light }],
        [
          `${theme}:${baseColor}:dark`,
          {
            ...rootDark,
            ...light,
            ...declarationsFor(css, '.dark .create-board-theme'),
          },
        ],
      ] as const
    }),
  ),
]

describe('palette evaluation', () => {
  it('resolves oklch, keywords, aliases and color-mix', () => {
    const white = resolveColor('oklch(1 0 0)', {})!
    const black = resolveColor('var(--ink)', { ink: 'black' })!
    assert.ok(Math.abs(contrastRatio(white, black) - 21) < 0.01)
    const half = resolveColor(
      'color-mix(in oklab, white 50%, transparent)',
      {},
    )!
    assert.equal(half.a, 0.5)
    assert.equal(resolveColor('linear-gradient(red, blue)', {}), undefined)
    assert.equal(resolveColor('var(--a)', { a: 'var(--a)' }), undefined)
  })

  it('reports translucent or unsupported paints as unresolved', () => {
    const [result] = checkContrast(
      { foreground: 'url(x.png)', background: 'white' },
      [{ foreground: 'foreground', background: 'background', minimum: 4.5 }],
    )
    assert.equal(result!.status, 'unresolved')
  })
})

describe('theme palettes', () => {
  it('root and every preset resolve a complete, valid theme in both modes', () => {
    for (const [label, values] of resolvedThemes())
      assert.deepEqual(
        validateThemeDefinition({
          schemaVersion: THEME_SCHEMA_VERSION,
          values: baseRoles(values),
        }),
        [],
        label,
      )
  })

  it('text pairs meet WCAG AA or are recorded baseline findings', () => {
    const failures: Array<string> = []
    for (const [label, values] of resolvedThemes())
      for (const result of checkContrast(values)) {
        assert.notEqual(
          result.status,
          'unresolved',
          `${label} ${result.foreground}`,
        )
        if (result.status === 'fail')
          failures.push(`${label}:${result.foreground}/${result.background}`)
      }
    const known = new Set(baseline)
    assert.deepEqual(
      failures.filter(failure => !known.has(failure)),
      [],
      'new contrast failures',
    )
    const current = new Set(failures)
    assert.deepEqual(
      baseline.filter(entry => !current.has(entry)),
      [],
      'fixed findings still listed in the baseline',
    )
  })
})
