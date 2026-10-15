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
}

const cases = {
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

let results
before(async () => {
  fs.cpSync(fixture, root, { recursive: true })
  const probes = path.join(root, 'src/probes')
  fs.mkdirSync(probes, { recursive: true })
  for (const [name, code] of Object.entries({
    ...support,
    ...Object.fromEntries(
      Object.entries(cases).map(([k, [code]]) => [k, code]),
    ),
  }))
    fs.writeFileSync(path.join(probes, `${name}.ts`), `${code}\n`)
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
  results = new Map(
    (await eslint.lintFiles(['src/probes/*.ts'])).map(result => [
      path.basename(result.filePath, '.ts'),
      result.messages,
    ]),
  )
})
after(() => fs.rmSync(root, { force: true, recursive: true }))

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
