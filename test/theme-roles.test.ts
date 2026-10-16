import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import ts from 'typescript'

import { tokens as pleatTokens, tokensTheme } from '../src/pleat/tokens.ts'
import { foundationTokens as pleatFoundation } from '../src/pleat/foundations-tokens.ts'
import { complexTokens as pleatComplex } from '../src/pleat/complex-tokens.ts'
import {
  BASE_THEME_VARIABLES,
  THEME_SCHEMA_VERSION,
  scopedRoleDeclarations,
  themeRoleGroups,
  validateThemeDefinition,
} from '../src/theme/roles.ts'

const stylexSources = {
  tokens: 'src/stylex/tokens.stylex.ts',
  foundationTokens: 'src/stylex/foundations-tokens.stylex.ts',
  complexTokens: 'src/stylex/complex-tokens.stylex.ts',
} as const

const defineVarsLiterals = (file: string): Record<string, string> => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  const values: Record<string, string> = {}
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === 'stylex.defineVars'
    ) {
      const object = node.arguments[0]
      assert.ok(object && ts.isObjectLiteralExpression(object))
      for (const property of object.properties) {
        assert.ok(
          ts.isPropertyAssignment(property) &&
            ts.isStringLiteralLike(property.initializer),
          `${file}: non-literal ${property.getText(source)}`,
        )
        values[property.name.getText(source)] = property.initializer.text
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return values
}

const completeTheme = Object.fromEntries(
  BASE_THEME_VARIABLES.map(name => [
    name,
    name === 'radius' ? '0.625rem' : 'oklch(0.5 0 0)',
  ]),
)

describe('canonical theme roles', () => {
  for (const [group, file] of Object.entries(stylexSources)) {
    it(`StyleX ${group} binds exactly the canonical roles`, () => {
      assert.deepEqual(
        defineVarsLiterals(file),
        themeRoleGroups[group as keyof typeof themeRoleGroups],
      )
    })
  }

  it('Pleat token specs declare every canonical role', () => {
    for (const [group, spec] of [
      ['tokens', pleatTokens],
      ['foundationTokens', pleatFoundation],
      ['complexTokens', pleatComplex],
    ] as const)
      assert.deepEqual(
        Object.keys(spec).sort(),
        Object.keys(themeRoleGroups[group]).sort(),
        group,
      )
  })

  it('Pleat root theme values match the canonical roles', () => {
    const byName = new Map(tokensTheme.declarations)
    for (const [role, value] of Object.entries(themeRoleGroups.tokens))
      assert.equal(
        byName.get(
          String(pleatTokens[role as keyof typeof pleatTokens]).replace(
            /^var\((--[^,)]+).*/,
            '$1',
          ),
        ),
        value,
        role,
      )
  })

  it('scoped bindings include derived state colors', () => {
    const css = scopedRoleDeclarations('tokens', role => `--${role}`)
    for (const role of [
      'buttonPrimaryHover',
      'buttonSecondaryHover',
      'primaryHover',
      'secondaryHover',
      'badgePrimaryHover',
      'focusRingShadow',
    ])
      assert.match(css, new RegExp(`--${role}:[^;]*var\\(--`))
  })
})

describe('validateThemeDefinition', () => {
  const definition = (values: Record<string, string>, schemaVersion = 1) => ({
    schemaVersion,
    values,
  })

  it('accepts a complete theme', () => {
    assert.deepEqual(validateThemeDefinition(definition(completeTheme)), [])
  })
  it('rejects missing roles unless partial', () => {
    const { primary: _, ...rest } = completeTheme
    assert.deepEqual(validateThemeDefinition(definition(rest)), [
      'missing role --primary',
    ])
    assert.deepEqual(
      validateThemeDefinition(definition(rest), { partial: true }),
      [],
    )
  })
  it('rejects unknown roles, wrong kinds and versions', () => {
    assert.deepEqual(
      validateThemeDefinition(
        definition({ brand: 'red', radius: '#fff', primary: '4px' }, 2),
        { partial: true },
      ),
      [
        `unsupported schemaVersion 2`,
        'unknown role --brand',
        '--radius expects a length, got #fff',
        '--primary expects a color, got 4px',
      ],
    )
    assert.equal(THEME_SCHEMA_VERSION, 1)
  })
  it('rejects values that do not match the role kind, even in partial patches', () => {
    const errors = (values: Record<string, unknown>) =>
      validateThemeDefinition(
        {
          schemaVersion: THEME_SCHEMA_VERSION,
          values: values as Record<string, string>,
        },
        { partial: true },
      )
    for (const values of [
      { primary: 'definitely-not-a-color' },
      { radius: 'definitely-not-a-length' },
      { primary: '' },
      { primary: '   ' },
      { primary: 42 },
      { primary: 'oklch(0.5 0.1 200' },
      { primary: 'oklch()' },
      { primary: 'url(evil.png)' },
      { primary: 'blur(4px)' },
      { radius: 'calc(1rem + 2px' },
      { radius: 'oklch(0.5 0.1 200)' },
      { radius: '1furlong' },
      { primary: '#12345' },
      { primary: 'var(--not-a-role)' },
      { primary: 'rgb(banana)' },
      { primary: 'rgb(1 2)' },
      { primary: 'rgb(1, 2 3)' },
      { primary: 'oklch(0.5 0.1 200 / 50% / 1)' },
      { primary: 'oklch(0.5 0.1 red)' },
      { primary: 'color-mix(in banana, red, blue)' },
      { primary: 'color-mix(in srgb longer hue, red, blue)' },
      { primary: 'color-mix(in oklab, red 120%, blue)' },
      { primary: 'color-mix(in oklab, red)' },
      { primary: 'color(banana 1 0 0)' },
      { primary: 'light-dark(red)' },
      { primary: 'red blue' },
      { radius: 'calc(banana)' },
      { radius: 'calc(1rem + 2)' },
      { radius: 'calc(1rem * 2px)' },
      { radius: 'calc(2)' },
      { radius: 'min(red, blue)' },
      { radius: 'clamp(1px, 2px)' },
      { radius: 'var(--primary)' },
      { radius: 'calc(var(--primary) - 2px)' },
      { primary: 'var(--radius)', radius: '1rem' },
      { ring: 'color-mix(in oklab, var(--radius) 90%, transparent)' },
    ])
      assert.ok(errors(values).length > 0, JSON.stringify(values))
    for (const values of [
      { primary: 'oklch(0.205 0 0)' },
      { primary: '#0f172a' },
      { primary: 'transparent' },
      { primary: 'var(--foreground)' },
      { ring: 'color-mix(in oklab, var(--primary) 90%, transparent)' },
      { 'primary-foreground': 'oklch(0.985 0 0 / 80%)' },
      { radius: '0.625rem' },
      { radius: '0' },
      { radius: 'calc(1rem - 2px)' },
      { primary: 'rgb(1 2 3)' },
      { primary: 'rgb(1, 2, 3)' },
      { primary: 'rgba(255, 0, 0, 0.5)' },
      { primary: 'hsl(210deg 40% 50% / 0.5)' },
      { primary: 'oklch(none 0 0)' },
      { primary: 'color(display-p3 1 0 0)' },
      { primary: 'color-mix(in oklch longer hue, red 40%, blue)' },
      { primary: 'light-dark(white, var(--foreground))' },
      { primary: 'var(--foreground, oklch(0.2 0 0))' },
      { radius: 'calc(1rem + 2px)' },
      { radius: 'min(1rem, 10px)' },
      { radius: 'clamp(2px, 0.5rem + 1vw, 1rem)' },
      { radius: 'calc((1rem + 2px) * 2)' },
    ])
      assert.deepEqual(errors(values), [], JSON.stringify(values))
  })

  it('rejects alias cycles', () => {
    assert.deepEqual(
      validateThemeDefinition(
        definition({ primary: 'var(--ring)', ring: 'var(--primary)' }),
        { partial: true },
      ),
      ['alias cycle --primary -> --ring -> --primary'],
    )
  })
})
