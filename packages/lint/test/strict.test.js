import assert from 'node:assert/strict'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'

import {
  CreaseConfigError,
  createStrictContext,
  creaseui,
  plugin,
} from '../index.js'

const root = fileURLToPath(new URL('./fixtures/strict-app/', import.meta.url))
const strict = createStrictContext({
  rootDir: root,
  renderer: 'pleat',
  tsconfig: './tsconfig.json',
  typeInformation: 'syntactic',
})
const RULES = [
  'no-raw-controls',
  'no-raw-composition',
  'no-unapproved-renderer',
  'no-application-styles',
  'component-contract',
  'no-unverifiable-ui',
]

const lint = (code, file = 'src/feature.ts', context = strict) =>
  new Linter({ configType: 'flat' }).verify(
    code,
    [
      {
        files: ['**/*.ts'],
        languageOptions: { parser: tseslint.parser, sourceType: 'module' },
        plugins: { crease: plugin },
        rules: Object.fromEntries(
          RULES.map(rule => [`crease/${rule}`, 'error']),
        ),
        settings: { creaseui: context },
      },
    ],
    { filename: path.join(root, file) },
  )

const HEADER = `import type { Html, HtmlBuilder } from 'foldkit/html'\n`
const ids = messages => messages.map(message => message.ruleId).sort()

test('raw controls and composition fail with installed replacements', () => {
  const messages = lint(`${HEADER}
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      h.div([], [h.button([], ['Save']), h.h1([], ['Title']), h.a([], ['x']), h.form([], [])])`)
  assert.deepEqual(ids(messages), [
    'crease/no-raw-composition',
    'crease/no-raw-composition',
    'crease/no-raw-composition',
    'crease/no-raw-composition',
    'crease/no-raw-controls',
  ])
  const buttonMessage = messages.find(
    message => message.ruleId === 'crease/no-raw-controls',
  )
  assert.match(buttonMessage.message, /Use `button` from '\.\/design\/button'/u)
  const heading = messages.find(message => /`h1`/u.test(message.message))
  assert.match(
    heading.message,
    /npx shadcn@latest add Potti1234\/creaseui\/pleat-heading/u,
  )
  assert.equal(messages.length, 5)
})

test('aliases, destructuring, computed constants and keyed are caught', () => {
  const messages = lint(`${HEADER}
    type B<M> = HtmlBuilder<M>
    const TAG = 'button'
    export const view = <M>(h: B<M>): Html => {
      const b = h
      const { input, div: box } = b
      const make = h[TAG]
      return box([], [input([], []), make([], []), h.keyed('textarea')('k', [], [])])
    }`)
  assert.deepEqual(ids(messages), [
    'crease/no-raw-composition',
    'crease/no-raw-controls',
    'crease/no-raw-controls',
    'crease/no-raw-controls',
  ])
})

test('unrelated objects named h and shadowing produce no diagnostics', () => {
  const messages = lint(`${HEADER}
    import { button } from '@design/button'
    const h = { div: (x: number) => x, Class: 1 }
    h.div(1)
    export const view = <M>(builder: HtmlBuilder<M>): Html => {
      const run = (h: { button: () => void }) => h.button()
      run({ button: () => undefined })
      return button({ children: ['ok'] }, builder)
    }`)
  assert.deepEqual(messages, [])
})

test('composed feature through alias barrel and re-export passes', () => {
  const messages = lint(`${HEADER}
    import { button, stack, copy } from '@design/index'
    import * as Design from '../src/design/index'
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      stack({ children: [copy({ children: ['Hi'] }, h), Design.button({ variant: 'outline', children: ['Save'] }, h)] }, h)`)
  assert.deepEqual(messages, [])
})

test('registered implementation may render raw but stays contract checked; a nearby wrapper may not', () => {
  assert.deepEqual(
    lint(
      `${HEADER}
    export const button = <M>(h: HtmlBuilder<M>): Html => h.button([h.Class('x')], [])`,
      'src/design/button.ts',
    ),
    [],
  )
  const wrapper = lint(
    `${HEADER}
    export const fancy = <M>(h: HtmlBuilder<M>): Html => h.button([], [])`,
    'src/design/fancy-button.ts',
  )
  assert.deepEqual(ids(wrapper), ['crease/no-raw-controls'])
})

test('styling escapes fail', () => {
  const messages = lint(`${HEADER}
    import './page.css'
    import * as stylex from '@stylexjs/stylex'
    import { stack } from '@design/stack'
    export const view = <M>(h: HtmlBuilder<M>, el: HTMLElement): Html => {
      el.style.color = 'red'
      el.innerHTML = '<b>x</b>'
      const { Attribute } = h
      return stack({ children: [h.empty], attributes: [h.Style({ color: 'red' }), Attribute('class', 'x')] }, h)
    }`)
  const styles = messages.filter(
    message => message.ruleId === 'crease/no-application-styles',
  )
  assert.equal(styles.length, 6)
  assert.ok(
    messages.some(
      message =>
        message.ruleId === 'crease/component-contract' &&
        /`attributes`/u.test(message.message),
    ),
  )
})

test('StyleX apps place components with stylex.create entries', () => {
  const manifest = JSON.parse(
    readFileSync(path.join(root, 'crease.lock.json'), 'utf8'),
  )
  const stylexContext = createStrictContext({
    rootDir: root,
    manifest: { ...manifest, renderer: 'stylex' },
    renderer: 'stylex',
    tsconfig: './tsconfig.json',
    typeInformation: 'syntactic',
  })
  const view = (styles, use) =>
    lint(
      `${HEADER}
    import * as stylex from '@stylexjs/stylex'
    import { stack } from '@design/stack'
    const styles = stylex.create({ ${styles} })
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      stack({ layoutStyle: ${use}, children: [] }, h)`,
      'src/feature.ts',
      stylexContext,
    )
  assert.deepEqual(
    view("page: { marginInline: 'auto', maxWidth: '42rem' }", 'styles.page'),
    [],
  )
  assert.deepEqual(ids(view("page: { color: 'red' }", 'styles.page')), [
    'crease/component-contract',
  ])
  assert.deepEqual(
    ids(view("page: { maxWidth: '42rem' }", "styles['missing']")),
    ['crease/no-unverifiable-ui'],
  )
  const props = lint(
    `${HEADER}
    import * as stylex from '@stylexjs/stylex'
    const styles = stylex.create({ page: { color: 'red' } })
    export const attrs = stylex.props(styles.page)`,
    'src/feature.ts',
    stylexContext,
  )
  assert.deepEqual(ids(props), ['crease/no-application-styles'])
  const pleatApp = lint(`${HEADER}
    import * as stylex from '@stylexjs/stylex'
    export const styles = stylex.create({ page: { maxWidth: '42rem' } })`)
  assert.deepEqual(ids(pleatApp), ['crease/no-application-styles'])
})

test('positioning in the parent is a placement property', () => {
  const messages = lint(`${HEADER}
    import { stack } from '@design/stack'
    import { layoutStyle } from '@design/contracts'
    const pinned = layoutStyle({ position: 'absolute', insetInline: 0, top: '50%' })
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      stack({ children: [stack({ layoutStyle: pinned, children: [] }, h)] }, h)`)
  assert.deepEqual(
    messages.filter(message => message.ruleId === 'crease/component-contract'),
    [],
  )
})

test('component contract: appearance props, layout values, variants and string children', () => {
  const messages = lint(`${HEADER}
    import { button } from '@design/button'
    import { stack } from '@design/stack'
    import { layoutStyle } from '@design/contracts'
    const place = layoutStyle({ gridColumn: 'span 2', padding: '4px' })
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      stack({ children: ['bare string', button({ variant: 'shiny', layoutStyle: place, style: 'x', children: [] }, h)] }, h)`)
  const contract = messages
    .filter(message => message.ruleId === 'crease/component-contract')
    .map(message => message.message)
  assert.equal(contract.length, 4, contract.join('\n'))
  assert.ok(
    contract.some(message =>
      /`padding` is not a placement property/u.test(message),
    ),
  )
  assert.ok(contract.some(message => /shiny/u.test(message)))
  assert.ok(contract.some(message => /Direct string children/u.test(message)))
  assert.ok(
    contract.some(message =>
      /`style` is an appearance override/u.test(message),
    ),
  )
})

/* `input` (control.input) has no `size` prop: the override advice must not
   name a prop that does not exist. `button` keeps the named-size advice. */
test('geometry override names the size prop only when the component has one', () => {
  const manifest = JSON.parse(
    readFileSync(path.join(root, 'crease.lock.json'), 'utf8'),
  )
  const contextFor = renderer =>
    createStrictContext({
      rootDir: root,
      manifest: { ...manifest, renderer },
      renderer,
      tsconfig: './tsconfig.json',
      typeInformation: 'syntactic',
    })
  const contractMessages = code =>
    lint(code, 'src/feature.ts', contextFor('tailwind')).filter(
      message => message.ruleId === 'crease/component-contract',
    )

  const inputClass = contractMessages(`${HEADER}
    import { input } from '@design/input'
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      input({ class: 'h-7', placeholder: 'x' }, h)`)
  assert.equal(inputClass.length, 1, JSON.stringify(inputClass))
  assert.match(
    inputClass[0].message,
    /change it in the component or the theme/u,
  )
  assert.doesNotMatch(inputClass[0].message, /`size` option/u)

  const buttonClass = contractMessages(`${HEADER}
    import { button } from '@design/button'
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      button({ class: 'h-7', children: [] }, h)`)
  assert.ok(
    buttonClass.some(message => /use its `size` option/u.test(message.message)),
    JSON.stringify(buttonClass),
  )

  const inputLayout = lint(
    `${HEADER}
    import { input } from '@design/input'
    import { layoutStyle } from '@design/contracts'
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      input({ layoutStyle: layoutStyle({ height: 32 }), placeholder: 'x' }, h)`,
    'src/feature.ts',
    contextFor('stylex'),
  ).filter(message => message.ruleId === 'crease/component-contract')
  assert.equal(inputLayout.length, 1, JSON.stringify(inputLayout))
  assert.match(
    inputLayout[0].message,
    /change it in the component or the theme/u,
  )
  assert.doesNotMatch(inputLayout[0].message, /`size` option/u)
})

/* The fixture receipt records input.variants = { level: [4], disabled: [false] }:
   non-string variant values must be enforced too, compared by type. */
test('numeric and boolean receipt variants are enforced', () => {
  const contractMessages = code =>
    lint(code).filter(message => message.ruleId === 'crease/component-contract')
  const bad = contractMessages(`${HEADER}
    import { input } from '@design/input'
    const lvl = 3
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      input({ level: 2, placeholder: 'x' }, h) ?? input({ level: lvl }, h) ?? input({ disabled: true }, h)`)
  assert.equal(bad.length, 3, JSON.stringify(bad))
  assert.match(
    bad[0].message,
    /`level: 2` is not a `input` \(control\.input\) variant \(allowed: 4\)/u,
  )
  assert.match(bad[1].message, /`level: 3` is not a `input`/u)
  assert.match(bad[2].message, /`disabled: true` is not a `input`/u)
  /* Type-sensitive: '4' is not 4. */
  const stringChoice = contractMessages(`${HEADER}
    import { input } from '@design/input'
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      input({ level: '4' }, h)`)
  assert.equal(stringChoice.length, 1, JSON.stringify(stringChoice))
  const good = contractMessages(`${HEADER}
    import { input } from '@design/input'
    const ok = 4
    export const view = <M>(h: HtmlBuilder<M>): Html =>
      input({ level: ok, disabled: false, placeholder: 'x' }, h)`)
  assert.deepEqual(good, [])
})

test('unverifiable: opaque spread, forged layout, computed tag, missing settings', () => {
  const messages = lint(`${HEADER}
    import { button } from '@design/button'
    import type { ComponentLayoutStyle } from '@design/contracts'
    export const view = <M>(h: HtmlBuilder<M>, props: any, tag: string): Html =>
      h.empty ?? button({ ...props, layoutStyle: { padding: 1 } as ComponentLayoutStyle, children: [] }, h) ?? h[tag]`)
  assert.deepEqual(ids(messages), [
    'crease/no-unverifiable-ui',
    'crease/no-unverifiable-ui',
    'crease/no-unverifiable-ui',
  ])
  const missing = lint(`export const x = 1`, 'src/feature.ts', null)
  assert.deepEqual(ids(missing), ['crease/no-unverifiable-ui'])
  const typed = createStrictContext({ rootDir: root, renderer: 'pleat' })
  assert.match(
    lint(`export const x = 1`, 'src/feature.ts', typed)[0].message,
    /Type information is unavailable/u,
  )
})

test('unapproved renderers: headless views, implementation exports, external providers', () => {
  const messages = lint(`${HEADER}
    import { view as buttonView } from '@foldkit/ui/button'
    import { Dialog } from '@foldkit/ui'
    import { renderButton } from '@design/behavior/button'
    import { h as vnode } from 'snabbdom'
    export const view = <M>(h: HtmlBuilder<M>): Html => Dialog.view({} as never, h)`)
  assert.equal(
    messages.filter(
      message => message.ruleId === 'crease/no-unapproved-renderer',
    ).length,
    4,
  )
})

test('Html types, Messages, empty and submodel transport are allowed', () => {
  assert.deepEqual(
    lint(`${HEADER}
    import { button } from '@design/button'
    export const view = <M>(h: HtmlBuilder<M>, child: unknown): Html =>
      h.empty ?? h.submodel(child as never) ?? button({ children: ['x'] }, h)`),
    [],
  )
})

test('configuration failures are errors, not clean results', () => {
  assert.throws(
    () => createStrictContext({ rootDir: 'relative' }),
    CreaseConfigError,
  )
  assert.throws(
    () => createStrictContext({ rootDir: root, renderer: 'stylex' }),
    /conflicts with manifest renderer/u,
  )
  assert.throws(
    () =>
      createStrictContext({
        rootDir: root,
        manifest: {
          schemaVersion: 2,
          policyVersion: 'x',
          renderer: 'pleat',
          artifacts: [
            {
              id: 'a',
              files: [
                { path: '../outside.ts', role: 'renderer' },
                { path: 'src/**/*.ts', role: 'renderer' },
                { path: 'src/feature.ts', role: 'theme', rawRendering: true },
              ],
            },
          ],
        },
      }),
    error => {
      assert.equal(error.problems.length, 5, error.problems.join('\n'))
      return true
    },
  )
  assert.throws(
    () =>
      createStrictContext({
        rootDir: root,
        manifest: {
          schemaVersion: 1,
          policyVersion: 'crease-default-v1',
          renderer: 'pleat',
          artifacts: [
            {
              id: 'a',
              files: [
                {
                  path: 'src/feature.ts',
                  role: 'renderer',
                  rawRendering: true,
                },
              ],
            },
            { id: 'b', files: [{ path: 'src/feature.ts', role: 'theme' }] },
          ],
        },
      }),
    /already owned by a/u,
  )
})

test('creaseui() returns scoped entries with exact implementation files', () => {
  const entries = creaseui({
    rootDir: root,
    renderer: 'pleat',
    tsconfig: './tsconfig.json',
  })
  const byName = Object.fromEntries(entries.map(entry => [entry.name, entry]))
  assert.ok(
    byName['@creaseui/lint/strict/application'].ignores.includes(
      'src/design/button.ts',
    ),
  )
  assert.deepEqual(
    byName['@creaseui/lint/strict/implementation'].files.sort(),
    [
      'src/design/behavior/button.ts',
      'src/design/button.ts',
      'src/design/input.ts',
      'src/design/stack.ts',
      'src/design/text.ts',
    ],
  )
  assert.equal(
    byName['@creaseui/lint/strict/implementation'].rules[
      'crease/component-contract'
    ],
    'error',
  )
  assert.deepEqual(byName['@creaseui/lint/strict/theme'].files, [
    'src/design/contracts.ts',
  ])
})

/* A registered stylesheet is checked by `creaseui-lint css`, not parsed by
   ESLint: no config block may name a `.css` path in `files`. */
test('creaseui() keeps registered stylesheets out of ESLint file lists', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'creaseui-css-ext-'))
  mkdirSync(path.join(directory, 'src/theme'), { recursive: true })
  writeFileSync(
    path.join(directory, 'src/theme/geometry.css'),
    ':root { --x: 1; }\n',
  )
  writeFileSync(
    path.join(directory, 'src/theme/mode.ts'),
    'export const mode = 1\n',
  )
  for (const renderer of ['tailwind', 'stylex']) {
    const entries = creaseui({
      extensions: [
        {
          id: 'theme-preset',
          reason: 'Generated theme stylesheet',
          role: 'theme',
          files: ['src/theme/geometry.css', 'src/theme/mode.ts'],
        },
      ],
      manifest: {
        artifacts: [],
        policyVersion: 'crease-default-v1',
        renderer,
        schemaVersion: 1,
      },
      renderer,
      rootDir: directory,
    })
    for (const entry of entries)
      for (const file of entry.files ?? [])
        assert.doesNotMatch(file, /\.css$/u, `${renderer}: ${entry.name}`)
    assert.ok(
      entries.some(entry => (entry.files ?? []).includes('src/theme/mode.ts')),
      `${renderer}: script extension keeps its role`,
    )
  }
  rmSync(directory, { force: true, recursive: true })
})
