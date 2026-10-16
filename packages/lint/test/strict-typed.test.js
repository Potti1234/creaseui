import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'

import { creaseui } from '../index.js'

/* Type-aware regressions for the PR 28 review (F1, F2, F7). The fixture app is
   copied next to the real fixtures so Foldkit and the DOM lib resolve. */
const fixture = fileURLToPath(
  new URL('./fixtures/strict-app/', import.meta.url),
)
const root = fileURLToPath(
  new URL(`./fixtures/.strict-typed-${process.pid}/`, import.meta.url),
)
const header = "import type { Html, HtmlBuilder } from 'foldkit/html'\n"

const support = {
  'builder-alias':
    "export type { HtmlBuilder as AppBuilder } from 'foldkit/html'\n",
  'builder-barrel': "export * from './builder-alias'\n",
  'builder-barrel-two':
    "export { type AppBuilder as UiBuilder } from './builder-barrel'\n",
  'headless-barrel': "export { Dialog } from '@foldkit/ui'\n",
  'headless-barrel-two': "export * from './headless-barrel'\n",
  'headless-renamed':
    "import { Dialog as D } from '@foldkit/ui'\nexport { D as Modal }\n",
  'plain-values': "export const config = { view: 'grid' }\n",
  'design-namespace': "export * as Button from '@design/button'\n",
  'design-namespace-two':
    "export { Button as Action } from './design-namespace'\n",
  'plain-namespace': "export * as Values from './plain-values'\n",
  'headless-star-as': "export * as UI from '@foldkit/ui'\n",
  'design-import-export':
    "import * as Button from '@design/button'\nexport { Button }\n",
  'design-import-export-renamed':
    "import * as Button from '@design/button'\nexport { Button as Action }\n",
  'design-import-export-two':
    "import { Button } from './design-import-export'\nexport { Button }\n",
  'headless-namespace-reexport':
    "import * as UI from '@foldkit/ui'\nexport { UI }\n",
  'plain-import-export':
    "import * as Values from './plain-values'\nexport { Values }\n",
  'type-import-export':
    "import type * as ButtonTypes from '@design/button'\nexport type { ButtonTypes }\n",
  'cycle-a': "import { Loop } from './cycle-b'\nexport { Loop }\n",
  'cycle-b': "import { Loop } from './cycle-a'\nexport { Loop }\n",
}

const cases = {
  'raw-grant-span': [
    `${header}export const glyph = (h: HtmlBuilder<unknown>): Html => h.span([], ['x'])`,
    [],
  ],
  'raw-grant-control': [
    `${header}export const glyph = (h: HtmlBuilder<unknown>): Html => h.span([], [h.button([], ['x']), h.div([], [])])`,
    ['crease/no-raw-composition', 'crease/no-raw-controls'],
  ],
  'styled-import-export-named': [
    `${header}import { Button } from './design-import-export'\nexport const view = (h: HtmlBuilder<unknown>): Html => Button.button({ children: ['Bad'], triggerClass: 'text-red-500' }, h)`,
    ['crease/component-contract'],
  ],
  'styled-import-export-namespace': [
    `${header}import * as Design from './design-import-export'\nexport const view = (h: HtmlBuilder<unknown>): Html => Design.Button.button({ children: ['Bad'], triggerClass: 'text-red-500' }, h)`,
    ['crease/component-contract'],
  ],
  'styled-import-export-renamed': [
    `${header}import { Action } from './design-import-export-renamed'\nexport const view = (h: HtmlBuilder<unknown>): Html => Action.button({ children: ['Bad'], triggerClass: 'text-red-500' }, h)`,
    ['crease/component-contract'],
  ],
  'styled-import-export-multi-hop': [
    `${header}import { Button } from './design-import-export-two'\nconst { button } = Button\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Bad'], triggerClass: 'text-red-500' }, h)`,
    ['crease/component-contract'],
  ],
  'styled-import-export-legal': [
    `${header}import { Button } from './design-import-export'\nexport const view = (h: HtmlBuilder<unknown>): Html => Button.button({ children: ['Ok'] }, h)`,
    [],
  ],
  'headless-import-export-named': [
    `${header}import { UI } from './headless-namespace-reexport'\nexport const rawView = UI.Dialog.view`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-import-export-messages-legal': [
    "import { UI } from './headless-namespace-reexport'\nexport const opened = UI.Dialog.Opened",
    [],
  ],
  'plain-import-export-legal': [
    "import { Values } from './plain-import-export'\nexport const layout = Values.config.view",
    [],
  ],
  'type-import-export-legal': [
    "import type { ButtonTypes } from './type-import-export'\nexport type Props = Parameters<typeof ButtonTypes.button>[0]",
    [],
  ],
  'cycle-import-export-terminates': [
    "import { Loop } from './cycle-a'\nexport const value = Loop",
    [],
  ],
  'raw-direct': [
    `${header}export const view = <M>(h: HtmlBuilder<M>): Html => h.button([], ['Raw'])`,
    ['crease/no-raw-controls'],
  ],
  'raw-imported-alias': [
    "import type { AppBuilder } from './builder-alias'\nimport type { Html } from 'foldkit/html'\nexport const view = <M>(h: AppBuilder<M>): Html => h.button([], ['Raw'])",
    ['crease/no-raw-controls'],
  ],
  'raw-multi-hop-alias': [
    "import type { UiBuilder } from './builder-barrel-two'\nimport type { Html } from 'foldkit/html'\nexport const view = <M>(h: UiBuilder<M>): Html => h.div([], [h.input([])])",
    ['crease/no-raw-composition', 'crease/no-raw-controls'],
  ],
  'raw-local-alias': [
    `${header}type Builder<M> = HtmlBuilder<M>\nexport const view = <M>(h: Builder<M>): Html => h.textarea([], [])`,
    ['crease/no-raw-controls'],
  ],
  'raw-inferred-parameter': [
    `${header}export const view: (h: HtmlBuilder<unknown>) => Html = h => h.button([], ['Raw'])`,
    ['crease/no-raw-controls'],
  ],
  'unrelated-htmlbuilder': [
    "type HtmlBuilder<M> = { button: (attributes: Array<M>, children: Array<string>) => string }\nexport const view = <M>(h: HtmlBuilder<M>): string => h.button([], ['Not Foldkit'])",
    [],
  ],
  'headless-direct': [
    `${header}import { Dialog } from '@foldkit/ui'\nexport const rawView = Dialog.view`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-computed': [
    `${header}import { Dialog } from '@foldkit/ui'\nexport const rawView = Dialog['view']`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-computed-const': [
    `${header}import { Dialog } from '@foldkit/ui'\nconst key = 'view'\nexport const rawView = Dialog[key]`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-reexport': [
    `${header}import { Dialog } from './headless-barrel'\nexport const rawView = Dialog.view`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-multi-hop': [
    `${header}import { Dialog } from './headless-barrel-two'\nexport const rawView = Dialog.view`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-import-export': [
    `${header}import { Modal } from './headless-renamed'\nexport const rawView = Modal['view']`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-messages-legal': [
    "import { Dialog } from './headless-barrel'\nexport const opened = Dialog.Opened\nexport type Model = Dialog.Model",
    [],
  ],
  'styled-computed-asserted': [
    `${header}import * as Design from '@design/button'\nexport const view = <M>(h: HtmlBuilder<M>): Html => Design['button'](({style:'color:red',children:['Bad']} as any), h)`,
    ['crease/no-unverifiable-ui'],
  ],
  'styled-dynamic-key': [
    `${header}import * as Design from '@design/button'\nexport const pick = (key: string) => Design[key as 'button']`,
    ['crease/no-unverifiable-ui'],
  ],
  'styled-namespace-alias': [
    `${header}import * as Design from '@design/button'\nconst UI = Design\nexport const view = <M>(h: HtmlBuilder<M>): Html => UI.button(({style:'color:red',children:['Bad']} as any), h)`,
    ['crease/no-unverifiable-ui'],
  ],
  'styled-destructured': [
    `${header}import * as Design from '@design/button'\nconst { button } = Design\nexport const view = <M>(h: HtmlBuilder<M>): Html => button(({style:'color:red',children:['Bad']} as any), h)`,
    ['crease/no-unverifiable-ui'],
  ],
  'styled-renamed-destructured-alias': [
    `${header}import * as Design from '@design/button'\nconst UI = Design\nconst { button: action } = UI\nconst run = action\nexport const view = <M>(h: HtmlBuilder<M>): Html => run(({style:'color:red',children:['Bad']} as any), h)`,
    ['crease/no-unverifiable-ui'],
  ],
  'styled-barrel-namespace-alias': [
    `${header}import * as Design from '@design/index'\nconst UI = Design\nexport const view = <M>(h: HtmlBuilder<M>): Html => UI['button'](({style:'color:red',children:['Bad']} as any), h)`,
    ['crease/no-unverifiable-ui'],
  ],
  'styled-dynamic-destructuring': [
    `${header}import * as Design from '@design/button'\nexport const pick = (key: string) => {\n  const { [key as 'button']: picked } = Design\n  return picked\n}`,
    ['crease/no-unverifiable-ui'],
  ],
  'styled-appearance-direct': [
    `${header}import * as Design from '@design/button'\nexport const view = <M>(h: HtmlBuilder<M>): Html => Design.button({children:['Bad'],triggerClass:'text-red-500'}, h)`,
    ['crease/component-contract'],
  ],
  'styled-appearance-alias': [
    `${header}import * as Design from '@design/button'\nconst Widgets = Design\nexport const view = <M>(h: HtmlBuilder<M>): Html => Widgets.button({children:['Bad'],triggerClass:'text-red-500'}, h)`,
    ['crease/component-contract'],
  ],
  'styled-alias-approved': [
    `${header}import * as Design from '@design/button'\nconst UI = Design\nconst { button } = UI\nexport const view = <M>(h: HtmlBuilder<M>): Html => button({children:['Good'],variant:'outline'}, h)`,
    [],
  ],
  'unrelated-object-alias': [
    "const Design = { button: (props: { style: string }) => props.style }\nconst UI = Design\nconst { button } = UI\nexport const view = () => [UI.button({ style: 'x' }), button({ style: 'y' })]",
    [],
  ],
  'headless-alias': [
    `${header}import { Dialog } from '@foldkit/ui'\nconst Modal = Dialog\nexport const rawView = Modal.view`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-destructured': [
    `${header}import { Dialog } from '@foldkit/ui'\nconst { view } = Dialog\nexport const rawView = view`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-namespace-barrel': [
    `${header}import * as Headless from './headless-barrel'\nexport const rawView = Headless.Dialog.view`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-namespace-barrel-alias': [
    `${header}import * as Headless from './headless-barrel-two'\nconst UI = Headless\nconst { Dialog } = UI\nexport const rawView = Dialog['view']`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-alias-messages-legal': [
    "import { Dialog } from '@foldkit/ui'\nimport * as Headless from './headless-barrel'\nconst Modal = Dialog\nconst { Opened } = Dialog\nexport const opened = [Modal.Opened, Opened, Headless.Dialog.Opened]",
    [],
  ],
  'local-namespace-non-rendering': [
    "import * as Plain from './plain-values'\nconst Values = Plain\nconst { config } = Values\nexport const layout = [Values.config.view, config.view]",
    [],
  ],
  'headless-namespace-export-named': [
    `${header}import { UI } from './headless-star-as'\nexport const rawView = UI.Dialog.view`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-namespace-export-namespace': [
    `${header}import * as Design from './headless-star-as'\nconst { Dialog } = Design.UI\nexport const rawView = Dialog['view']`,
    ['crease/no-unapproved-renderer'],
  ],
  'headless-namespace-export-messages-legal': [
    "import { UI } from './headless-star-as'\nexport const opened = UI.Dialog.Opened",
    [],
  ],
  'styled-namespace-export-named': [
    `${header}import { Button } from './design-namespace'\nexport const view = (h: HtmlBuilder<unknown>): Html => Button.button({ children: ['Bad'], triggerClass: 'text-red-500' }, h)`,
    ['crease/component-contract'],
  ],
  'styled-namespace-export-namespace': [
    `${header}import * as Design from './design-namespace'\nexport const view = (h: HtmlBuilder<unknown>): Html => Design.Button.button({ children: ['Bad'], triggerClass: 'text-red-500' }, h)`,
    ['crease/component-contract'],
  ],
  'styled-namespace-export-renamed': [
    `${header}import { Action } from './design-namespace-two'\nconst { button } = Action\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Bad'], triggerClass: 'text-red-500' }, h)`,
    ['crease/component-contract'],
  ],
  'styled-namespace-export-approved': [
    `${header}import { Button } from './design-namespace'\nexport const view = (h: HtmlBuilder<unknown>): Html => Button.button({ children: ['Good'], variant: 'outline' }, h)`,
    [],
  ],
  'plain-namespace-export': [
    "import { Values } from './plain-namespace'\nexport const layout = Values.config.view",
    [],
  ],
  'tailwind-icon-width': [
    `${header}import { button } from '@design/button'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['X'], size: 'icon', class: 'w-3' }, h)`,
    ['crease/component-contract'],
  ],
  'tailwind-icon-min-width': [
    `${header}import { button } from '@design/button'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['X'], size: 'icon-sm', class: 'sm:min-w-8 grow' }, h)`,
    ['crease/component-contract'],
  ],
  'tailwind-icon-conditional-branch': [
    `${header}import { button } from '@design/button'\nexport const view = (wide: boolean, h: HtmlBuilder<unknown>): Html => button({ children: ['X'], size: wide ? 'sm' : 'icon', class: 'w-full' }, h)`,
    ['crease/component-contract'],
  ],
  'tailwind-icon-typed-union': [
    `${header}import { button } from '@design/button'\nexport const view = (size: 'sm' | 'icon', h: HtmlBuilder<unknown>): Html => button({ children: ['X'], size, class: 'basis-1/2' }, h)`,
    ['crease/component-contract'],
  ],
  'tailwind-icon-open-size': [
    `${header}import { button } from '@design/button'\nexport const view = (size: any, h: HtmlBuilder<unknown>): Html => button({ children: ['X'], size, class: 'w-3' }, h)`,
    ['crease/no-unverifiable-ui'],
  ],
  'tailwind-icon-placement': [
    `${header}import { button } from '@design/button'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['X'], size: 'icon', class: 'self-end ml-2' }, h)`,
    [],
  ],
  'tailwind-text-size-fill': [
    `${header}import { button } from '@design/button'\nexport const view = (wide: boolean, h: HtmlBuilder<unknown>): Html => button({ children: ['Wide'], size: wide ? 'sm' : 'default', class: 'w-full flex-1' }, h)`,
    [],
  ],
  'styled-icon-layout-width': [
    `${header}import { button } from '@design/button'\nimport { layoutStyle } from '@design/contracts'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['X'], size: 'icon', layoutStyle: layoutStyle({ width: '12px' }) }, h)`,
    ['crease/component-contract'],
  ],
  'styled-icon-layout-inline-size': [
    `${header}import { button } from '@design/button'\nimport { layoutStyle } from '@design/contracts'\nconst narrow = layoutStyle({ flexBasis: '12px', alignSelf: 'end' })\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['X'], size: 'icon-sm', layoutStyle: narrow }, h)`,
    ['crease/component-contract'],
  ],
  'styled-text-layout-width': [
    `${header}import { button } from '@design/button'\nimport { layoutStyle } from '@design/contracts'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Wide'], size: 'sm', layoutStyle: layoutStyle({ width: '100%' }) }, h)`,
    [],
  ],
  'tailwind-control-height-override': [
    `${header}import { button } from '@design/button'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Squashed'], class: 'h-3' }, h)`,
    ['crease/component-contract'],
  ],
  'tailwind-control-size-override': [
    `${header}import { button } from '@design/button'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Squashed'], class: 'md:size-4' }, h)`,
    ['crease/component-contract'],
  ],
  'tailwind-control-placement': [
    `${header}import { button } from '@design/button'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Wide'], class: 'w-full self-end' }, h)`,
    [],
  ],
  'tailwind-control-positioning': [
    `${header}import { button } from '@design/button'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Close'], class: 'absolute top-2 -right-2 inset-x-0' }, h)`,
    [],
  ],
  'tailwind-control-fixed': [
    `${header}import { button } from '@design/button'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Pinned'], class: 'fixed top-0' }, h)`,
    ['crease/component-contract'],
  ],
  'styled-control-layout-height': [
    `${header}import { button } from '@design/button'\nimport { layoutStyle } from '@design/contracts'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Squashed'], layoutStyle: layoutStyle({ height: '12px' }) }, h)`,
    ['crease/component-contract'],
  ],
  'styled-control-layout-width': [
    `${header}import { button } from '@design/button'\nimport { layoutStyle } from '@design/contracts'\nexport const view = (h: HtmlBuilder<unknown>): Html => button({ children: ['Wide'], layoutStyle: layoutStyle({ width: '100%' }) }, h)`,
    [],
  ],
  'business-class-field': [
    "export const normalizeRecord = (input: { className: string }) => {\n  const record = { ...input }\n  record.className = 'premium'\n  return record\n}",
    [],
  ],
  'business-style-and-class-list': [
    "type Row = { style: { color: string }; classList: { add: (token: string) => void }; setAttribute: (name: string, value: string) => void }\nexport const tag = (row: Row) => {\n  row.style.color = 'gold'\n  row.classList.add('vip')\n  row.setAttribute('class', 'x')\n}",
    [],
  ],
  'dom-mutation': [
    "export const paint = (element: HTMLElement) => {\n  element.className = 'x'\n  element.style.color = 'red'\n  element.classList.add('x')\n  element.setAttribute('style', 'color: red')\n}",
    [
      'crease/no-application-styles',
      'crease/no-application-styles',
      'crease/no-application-styles',
      'crease/no-application-styles',
    ],
  ],
  'dom-style-alias': [
    "export const restyle = (element: HTMLElement) => {\n  const style = element.style\n  style.color = 'red'\n}",
    ['crease/no-application-styles'],
  ],
  'dom-style-destructured': [
    "export const restyle = (element: HTMLElement) => {\n  const { style, classList: tokens } = element\n  const again = style\n  again.color = 'red'\n  tokens.add('x')\n}",
    ['crease/no-application-styles', 'crease/no-application-styles'],
  ],
  'dom-class-list-alias': [
    "export const restyle = (element: HTMLElement) => {\n  const tokens = element.classList\n  tokens.toggle('x')\n}",
    ['crease/no-application-styles'],
  ],
  'dom-style-methods': [
    "export const restyle = (element: HTMLElement) => {\n  element.style.setProperty('color', 'red')\n  const style = element.style\n  style.cssText = 'color: red'\n  style['color'] = 'red'\n}",
    [
      'crease/no-application-styles',
      'crease/no-application-styles',
      'crease/no-application-styles',
    ],
  ],
  'business-style-alias': [
    "type Row = { style: { color: string; setProperty: (a: string, b: string) => void }; classList: { add: (token: string) => void } }\nexport const tag = (row: Row) => {\n  const style = row.style\n  style.color = 'gold'\n  style.setProperty('a', 'b')\n  const { classList } = row\n  classList.add('vip')\n}",
    [],
  ],
  approved: [
    `${header}import { button } from '@design/button'\nexport const view = <M>(h: HtmlBuilder<M>): Html => button({children:['Good'],variant:'outline'}, h)`,
    [],
  ],
}

const tailwindRoot = `${root}-tailwind`
let results
before(async () => {
  fs.cpSync(fixture, root, { recursive: true })
  const probes = path.join(root, 'src/probes')
  fs.mkdirSync(probes, { recursive: true })
  /* A narrow raw grant: the glyph helpers may render spans only. */
  const rootLock = path.join(root, 'crease.lock.json')
  const manifest = JSON.parse(fs.readFileSync(rootLock, 'utf8'))
  manifest.artifacts.push({
    id: 'probe/raw-grant',
    files: ['raw-grant-span', 'raw-grant-control'].map(name => ({
      path: `src/probes/${name}.ts`,
      rawElements: ['span'],
      rawRendering: true,
      role: 'renderer',
    })),
    exports: [],
  })
  fs.writeFileSync(rootLock, JSON.stringify(manifest, null, 2))
  /* Tailwind cases need their own manifest: the lock pins one renderer. */
  fs.cpSync(fixture, tailwindRoot, { recursive: true })
  const lock = path.join(tailwindRoot, 'crease.lock.json')
  fs.writeFileSync(
    lock,
    JSON.stringify(
      { ...JSON.parse(fs.readFileSync(lock, 'utf8')), renderer: 'tailwind' },
      null,
      2,
    ),
  )
  const tailwindProbes = path.join(tailwindRoot, 'src/probes-tailwind')
  fs.mkdirSync(tailwindProbes, { recursive: true })
  for (const [name, code] of Object.entries({
    ...support,
    ...Object.fromEntries(
      Object.entries(cases).map(([k, [code]]) => [k, code]),
    ),
  }))
    fs.writeFileSync(
      name.startsWith('tailwind-')
        ? path.join(tailwindProbes, `${name}.ts`)
        : path.join(probes, `${name}.ts`),
      `${code}\n`,
    )
  const lint = async (renderer, files) =>
    (
      await new ESLint({
        cwd: tailwindRoot,
        overrideConfig: creaseui({
          files: [files],
          renderer,
          rootDir: tailwindRoot,
          tsconfig: './tsconfig.json',
        }),
        overrideConfigFile: true,
      }).lintFiles([files])
    ).map(result => [path.basename(result.filePath, '.ts'), result.messages])
  const tailwind = await lint('tailwind', 'src/probes-tailwind/*.ts')
  const eslint = new ESLint({
    cwd: root,
    overrideConfig: creaseui({
      files: ['src/probes/*.ts'],
      renderer: 'pleat',
      rootDir: root,
      tsconfig: './tsconfig.json',
    }),
    overrideConfigFile: true,
  })
  results = new Map([
    ...(await eslint.lintFiles(['src/probes/*.ts'])).map(result => [
      path.basename(result.filePath, '.ts'),
      result.messages,
    ]),
    ...tailwind,
  ])
})
after(() => {
  fs.rmSync(root, { force: true, recursive: true })
  fs.rmSync(tailwindRoot, { force: true, recursive: true })
})

for (const [name, [, expected]] of Object.entries(cases))
  test(`typed strict probe: ${name}`, () => {
    const messages = results.get(name)
    assert.deepEqual(
      messages.map(message => message.ruleId).sort(),
      expected,
      JSON.stringify(messages, null, 2),
    )
  })

for (const name of Object.keys(support))
  test(`typed strict support module passes: ${name}`, () =>
    assert.deepEqual(results.get(name), []))
