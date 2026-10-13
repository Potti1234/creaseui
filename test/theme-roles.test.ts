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
