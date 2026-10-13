import assert from 'node:assert/strict'
import test from 'node:test'

import { Linter } from 'eslint'

import { constrainedStylex, pleat, plugin, stylex, tailwind } from '../index.js'

const verify = (code, rule, options = []) => {
  const linter = new Linter({ configType: 'flat' })
  return linter.verify(
    code,
    [
      {
        languageOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
        },
        plugins: { crease: plugin },
        rules: { [`crease/${rule}`]: ['error', ...options] },
      },
    ],
    { filename: 'src/page.js' },
  )
}

test('no-component-restyle understands named Foldkit component calls', () => {
  const messages = verify(
    `
    import { button } from '@/ui/button'
    button({ class: 'mt-4 bg-red-500', children: ['Save'] }, h)
  `,
    'no-component-restyle',
  )
  assert.equal(messages.length, 1)
  assert.match(messages[0].message, /bg-red-500/u)
})
test('no-component-restyle understands namespace Foldkit component calls', () => {
  const messages = verify(
    `
    import * as Card from '@/ui/card'
    Card.cardTitle({ class: 'font-bold' }, h)
  `,
    'no-component-restyle',
  )
  assert.equal(messages.length, 1)
  assert.match(messages[0].message, /CardTitle/u)
})

test('component collection ignores exported variant factories', () => {
  const messages = verify(
    `
    import { buttonVariants } from '@/ui/button'
    buttonVariants({ class: 'bg-red-500' })
  `,
    'no-component-restyle',
  )
  assert.equal(messages.length, 0)
})

test('component contracts allow explicitly approved Tailwind categories', () => {
  const messages = verify(
    `
    import { cardContent } from '@/ui/card'
    cardContent({ class: 'p-6 text-lg' }, h)
  `,
    'no-component-restyle',
    [
      {
        contracts: [{ pattern: '^CardContent$', allow: ['layout', 'spacing'] }],
      },
    ],
  )
  assert.equal(messages.length, 1)
  assert.match(messages[0].message, /text-lg/u)
})

test('component contracts support class globs', () => {
  const messages = verify(
    `
    import { avatar } from '@/ui/avatar'
    avatar({ class: 'size-8 rounded-full' }, h)
  `,
    'no-component-restyle',
    [
      {
        contracts: [{ pattern: '^Avatar$', allow: ['layout', 'size-*'] }],
      },
    ],
  )
  assert.equal(messages.length, 1)
  assert.match(messages[0].message, /rounded-full/u)
})

test('require-static-class rejects runtime class construction', () => {
  const messages = verify(
    `
    import { button } from '@/ui/button'
    button({ class: getTone() }, h)
  `,
    'require-static-class',
  )
  assert.equal(messages.length, 1)
})

test('stylex component contract forbids class and accepts static layoutStyle', () => {
  const invalid = verify(
    `
    import { button } from '@/stylex/button'
    button({ class: 'w-full', layoutStyle: makeStyle() }, h)
  `,
    'stylex-component-contract',
  )
  assert.equal(invalid.length, 2)

  const valid = verify(
    `
    import * as Button from '@/stylex/button'
    Button.button({ layoutStyle: styles.fullWidth }, h)
  `,
    'stylex-component-contract',
  )
  assert.equal(valid.length, 0)
})

test('no-stylex-escape recognizes aliased StyleX namespaces', () => {
  const messages = verify(
    `
    import * as sx from '@stylexjs/stylex'
    const styles = sx.create({ root: { color: 'red' } })
    sx.props(styles.root)
  `,
    'no-stylex-escape',
  )
  assert.deepEqual(
    messages.map(message => message.messageId),
    ['create', 'props'],
  )
})

test('constrained composition rejects raw Foldkit layout builders', () => {
  const messages = verify(`h.div([], [])`, 'prefer-composition-primitives')
  assert.equal(messages.length, 1)
})

test('flat config helpers expose separate Tailwind and StyleX policies', () => {
  const tailwindConfig = tailwind({ files: ['src/ui/**/*.ts'] })
  const stylexConfig = stylex({ files: ['src/stylex/**/*.ts'] })
  const constrained = constrainedStylex({ files: ['src/page.ts'] })

  assert.equal(tailwindConfig.name, '@creaseui/lint/tailwind')
  assert.equal(stylexConfig.name, '@creaseui/lint/stylex')
  assert.equal(constrained.name, '@creaseui/lint/stylex-constrained')
  assert.ok('shadcn/no-raw-colors' in tailwindConfig.rules)
  assert.ok('@stylexjs/valid-styles' in stylexConfig.rules)
})

test('pleat-prop-limits rejects raw values outside token files', () => {
  const messages = verify(
    `
    import { Style } from '@pleat/core'
    const styles = {
      root: Style.make({ color: '#ff0000', marginTop: '1rem' }),
    }
  `,
    'pleat-prop-limits',
    [
      {
        propLimits: {
          color: {
            limit: ['transparent', 'currentColor'],
            reason: 'Use a semantic token.',
          },
        },
      },
    ],
  )
  assert.equal(messages.length, 1)
  assert.match(messages[0].message, /color/u)
})

test('pleat-prop-limits allows token files and CSS-wide keywords', () => {
  const keywordMessages = verify(
    `
    import { Style } from '@pleat/core'
    const styles = {
      root: Style.make({ color: 'inherit' }),
    }
  `,
    'pleat-prop-limits',
    [
      {
        propLimits: { color: { limit: ['transparent'], reason: 'x' } },
      },
    ],
  )
  assert.equal(keywordMessages.length, 0)

  const linter = new Linter({ configType: 'flat' })
  const tokenMessages = linter.verify(
    `
    import { Style } from '@pleat/core'
    const styles = {
      root: Style.make({ color: '#ff0000' }),
    }
  `,
    [
      {
        files: ['**/*.ts'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
        plugins: { crease: plugin },
        rules: {
          'crease/pleat-prop-limits': [
            'error',
            {
              propLimits: { color: { limit: ['transparent'], reason: 'x' } },
              tokenFiles: ['/foundations'],
            },
          ],
        },
      },
    ],
    { filename: 'src/pleat/foundations-tokens.ts' },
  )
  assert.equal(tokenMessages.length, 0)
})

const pleatColorLimits = [
  {
    propLimits: {
      color: { limit: ['transparent'], reason: 'Use a semantic token.' },
    },
  },
]

const pleatLimitMessages = code =>
  verify(code, 'pleat-prop-limits', pleatColorLimits)

test('pleat-prop-limits follows imported Style aliases and namespaces', () => {
  assert.equal(
    pleatLimitMessages(`
      import { Style as S } from '@pleat/core'
      S.make({ color: '#ff0000' })
    `).length,
    1,
  )
  assert.equal(
    pleatLimitMessages(`
      import * as Pleat from '@pleat/core'
      Pleat.Style.make({ color: '#ff0000' })
    `).length,
    1,
  )
})

test('pleat-prop-limits checks Style.when declarations', () => {
  assert.equal(
    pleatLimitMessages(`
      import { Style, When } from '@pleat/core'
      Style.empty.pipe(Style.when(When.hover, { color: '#ff0000' }))
      Style.when(Style.empty, When.focus, { color: '#00ff00' })
    `).length,
    2,
  )
  assert.equal(
    pleatLimitMessages(`
      import { Style, When } from '@pleat/core'
      Style.empty.pipe(Style.when(When.hover, { color: 'transparent' }))
    `).length,
    0,
  )
})

test('pleat-prop-limits follows local declaration objects and spreads', () => {
  assert.equal(
    pleatLimitMessages(`
      import { Style } from '@pleat/core'
      const declarations = { color: '#ff0000' }
      Style.make(declarations)
    `).length,
    1,
  )
  assert.equal(
    pleatLimitMessages(`
      import { Style } from '@pleat/core'
      const base = { color: '#ff0000' }
      const declarations = { ...base, marginTop: '1rem' }
      Style.make({ ...declarations })
    `).length,
    1,
  )
  assert.equal(
    pleatLimitMessages(`
      import { Style } from '@pleat/core'
      const declarations = { color: 'transparent' }
      Style.make({ ...declarations })
    `).length,
    0,
  )
})

test('pleat-prop-limits ignores unrelated and shadowed Style bindings', () => {
  assert.equal(
    pleatLimitMessages(`
      const Style = { make: value => value }
      Style.make({ color: '#ff0000' })
    `).length,
    0,
  )
  assert.equal(
    pleatLimitMessages(`
      import { Style } from './local-style'
      Style.make({ color: '#ff0000' })
    `).length,
    0,
  )
  assert.equal(
    pleatLimitMessages(`
      import { Style } from '@pleat/core'
      const build = Style => Style.make({ color: '#ff0000' })
      Style.make({ color: 'transparent' })
    `).length,
    0,
  )
})

test('stylex-component-contract accepts layoutStyle constructor calls for pleat', () => {
  const messages = verify(
    `
    import { button } from '@/pleat/button'
    import { layoutStyle } from '@/pleat/contracts'
    button({ layoutStyle: layoutStyle({ width: '100%' }), children: ['Save'] }, h)
  `,
    'stylex-component-contract',
    [
      {
        componentImports: ['^@/pleat(?:/|$)'],
        layoutConstructors: ['layoutStyle'],
      },
    ],
  )
  assert.equal(messages.length, 0)
})

test('pleat config exposes the Pleat styling policy', () => {
  const pleatConfig = pleat({ files: ['src/pleat/**/*.ts'] })
  assert.equal(pleatConfig.name, '@creaseui/lint/pleat')
  assert.ok('crease/pleat-prop-limits' in pleatConfig.rules)
  assert.ok('crease/stylex-component-contract' in pleatConfig.rules)
})
