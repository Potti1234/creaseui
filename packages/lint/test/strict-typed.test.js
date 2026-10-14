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
