import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'

import { creaseui } from '../index.js'

/* Review R10: a product narrows a layout primitive behind an owned wrapper
   (the Grid docs' metricGrid recipe) and its policy routes feature code
   through it. The restriction is scoped to the configured feature surface;
   layouts elsewhere may still use the primitive directly. */
const fixture = fileURLToPath(
  new URL('./fixtures/strict-app/', import.meta.url),
)
const root = fileURLToPath(
  new URL(`./fixtures/.product-policy-${process.pid}/`, import.meta.url),
)
after(() => fs.rmSync(root, { force: true, recursive: true }))

const header = "import type { Html, HtmlBuilder } from 'foldkit/html'\n"
const files = {
  'src/product/metric-grid.ts': `${header}import { stack } from '@design/stack'
export const metricGrid = <Msg>(props: Readonly<{ children: ReadonlyArray<Html> }>, h: HtmlBuilder<Msg>): Html =>
  stack({ children: props.children }, h)
`,
  'src/features/direct.ts': `${header}import { stack } from '@design/stack'
export const view = <Msg>(h: HtmlBuilder<Msg>): Html => stack({ children: [] }, h)
`,
  'src/features/barrel.ts': `${header}import { stack } from '@design/index'
export const view = <Msg>(h: HtmlBuilder<Msg>): Html => stack({ children: [] }, h)
`,
  'src/features/wrapped.ts': `${header}import { metricGrid } from '../product/metric-grid'
export const view = <Msg>(h: HtmlBuilder<Msg>): Html => metricGrid({ children: [] }, h)
`,
  'src/tools/matrix.ts': `${header}import { stack } from '@design/stack'
export const view = <Msg>(h: HtmlBuilder<Msg>): Html => stack({ children: [] }, h)
`,
}

const message =
  'Feature views lay out metrics with metricGrid from src/product/metric-grid.'
const policy = {
  files: ['src/features/**/*.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: '@design/stack', message },
          { name: '@design/index', importNames: ['stack'], message },
        ],
      },
    ],
  },
}

test('product policy restricts feature code to the owned wrapper only', async () => {
  fs.cpSync(fixture, root, { recursive: true })
  for (const [file, code] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    fs.writeFileSync(path.join(root, file), code)
  }
  const results = await new ESLint({
    cwd: root,
    overrideConfig: [
      ...creaseui({
        files: ['src/features/**/*.ts', 'src/tools/**/*.ts'],
        renderer: 'pleat',
        rootDir: root,
        tsconfig: './tsconfig.json',
      }),
      policy,
    ],
    overrideConfigFile: true,
  }).lintFiles(['src/features/*.ts', 'src/tools/*.ts'])
  const byFile = Object.fromEntries(
    results.map(result => [
      path.relative(root, result.filePath).split(path.sep).join('/'),
      result.messages.map(entry => `${entry.ruleId}: ${entry.message}`),
    ]),
  )
  const restricted = [
    `no-restricted-imports: '@design/stack' import is restricted from being used. ${message}`,
  ]
  assert.deepEqual(byFile['src/features/direct.ts'], restricted)
  assert.deepEqual(byFile['src/features/barrel.ts'], [
    `no-restricted-imports: 'stack' import from '@design/index' is restricted. ${message}`,
  ])
  assert.deepEqual(byFile['src/features/wrapped.ts'], [])
  assert.deepEqual(byFile['src/tools/matrix.ts'], [])
})
