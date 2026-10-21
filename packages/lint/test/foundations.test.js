import assert from 'node:assert/strict'
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { createStrictContext } from '../lib/strict/context.js'
import { verifyFoundations } from '../lib/strict/foundations.js'

test('declared foundations must be rendered, not just imported or named', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-foundations-'))
  const write = (name, text) => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    writeFileSync(path.join(root, name), text)
  }
  write(
    'tsconfig.json',
    JSON.stringify({
      compilerOptions: {
        module: 'esnext',
        moduleResolution: 'bundler',
        strict: true,
      },
      include: ['src'],
    }),
  )
  write(
    'src/design/sidebar.ts',
    "export const sidebar = (props: { children: string[] }) => ({ tag: 'aside', children: props.children })\n",
  )
  write(
    'src/design/shell.ts',
    `import { sidebar } from './sidebar'
import * as Nav from './sidebar'
const S = sidebar
export const realShell = (items: string[]) => sidebar({ children: items })
export const namespaceShell = (items: string[]) => Nav.sidebar({ children: items })
export const aliasShell = (items: string[]) => S({ children: items })
// based on Sidebar
export const fakeShell = (items: string[]) => ({ tag: 'div', children: items, base: 'sidebar' })
export const ghostShell = (items: string[]) => sidebar({ children: items })
const nav = (items: string[]) => sidebar({ children: items })
export const helperShell = (items: string[]) => ({ tag: 'main', children: [nav(items)] })
export const mappedShell = (groups: string[][]) => ({ tag: 'main', children: groups.map(items => sidebar({ children: items })) })
export const unusedClosure = (items: string[]) => { const unused = () => sidebar({ children: items }); return { tag: 'main', children: items, unused: typeof unused } }
export const discardedCall = (items: string[]) => { sidebar({ children: items }); return { tag: 'main', children: items } }
const keep = (_view: unknown, items: string[]) => ({ tag: 'main', children: items })
export const discardedArgument = (items: string[]) => keep(sidebar({ children: items }), items)
export const stringified = (items: string[]) => ({ tag: 'main', children: [String(sidebar({ children: items }))] })
const frame = (content: unknown) => ({ tag: 'main', children: [content] })
export const framedShell = (items: string[]) => frame(sidebar({ children: items }))
const pick = ({ body }: { body: unknown }) => ({ tag: 'main', children: [body] })
export const destructuredShell = (items: string[]) => pick({ body: sidebar({ children: items }) })
`,
  )
  const shell = name => ({
    contract: 'tasks.shell',
    file: 'src/design/shell.ts',
    foundations:
      name === 'ghostShell'
        ? ['navigation.sidebar', 'data.table']
        : ['navigation.sidebar'],
    name,
  })
  const strict = createStrictContext({
    manifest: {
      artifacts: [
        {
          exports: [
            {
              contract: 'navigation.sidebar',
              file: 'src/design/sidebar.ts',
              name: 'sidebar',
            },
          ],
          files: [
            {
              path: 'src/design/sidebar.ts',
              rawRendering: true,
              role: 'renderer',
            },
          ],
          id: 'crease/sidebar',
        },
        {
          exports: [
            'realShell',
            'namespaceShell',
            'aliasShell',
            'fakeShell',
            'ghostShell',
            'helperShell',
            'mappedShell',
            'unusedClosure',
            'discardedCall',
            'discardedArgument',
            'stringified',
            'framedShell',
            'destructuredShell',
          ].map(shell),
          files: [
            {
              path: 'src/design/shell.ts',
              rawRendering: true,
              role: 'renderer',
            },
          ],
          id: 'tasks/shell',
        },
      ],
      policyVersion: 'crease-default-v1',
      renderer: 'tailwind',
      schemaVersion: 1,
    },
    rootDir: root,
  })
  const problems = verifyFoundations({
    ownership: strict.ownership,
    rootDir: root,
  })
  rmSync(root, { force: true, recursive: true })
  /* Review F6: arguments count only through parameters that reach the
     helper's output; discarded and stringified calls do not. */
  assert.equal(problems.length, 6, problems.join('\n'))
  for (const name of [
    'unusedClosure',
    'discardedCall',
    'discardedArgument',
    'stringified',
  ])
    assert.match(
      problems.join('\n'),
      new RegExp(
        `\`${name}\` declares foundation navigation\\.sidebar but never renders it: the call's result does not reach the returned view`,
        'u',
      ),
    )
  assert.match(
    problems.join('\n'),
    /`fakeShell` declares foundation navigation\.sidebar but never renders it/u,
  )
  assert.match(
    problems.join('\n'),
    /`ghostShell` declares foundation data\.table, but no installed export provides it/u,
  )
})

test('foundations flow only through foldkit builders, known collections and followed helpers', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-foundations-flow-'))
  const write = (name, text) => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    writeFileSync(path.join(root, name), text)
  }
  mkdirSync(path.join(root, 'node_modules'))
  symlinkSync(
    fileURLToPath(new URL('../../../node_modules/foldkit', import.meta.url)),
    path.join(root, 'node_modules/foldkit'),
    'junction',
  )
  write(
    'tsconfig.json',
    JSON.stringify({
      compilerOptions: {
        module: 'esnext',
        moduleResolution: 'bundler',
        skipLibCheck: true,
        strict: true,
      },
      include: ['src'],
    }),
  )
  write(
    'src/design/sidebar.ts',
    `import type { Html, HtmlBuilder } from 'foldkit/html'
export const sidebar = (h: HtmlBuilder<unknown>): Html => h.aside([], [])
`,
  )
  write(
    'src/design/shell.ts',
    `import type { Html, HtmlBuilder } from 'foldkit/html'
import { sidebar } from './sidebar'
declare const opaque: { wrap(child: Html): Html }
const methods = {
  discard(child: Html, h: HtmlBuilder<unknown>): Html {
    return h.main([], ['Rebuilt shell'])
  },
  frame(child: Html, h: HtmlBuilder<unknown>): Html {
    return h.main([], [child])
  },
  wrap: (child: Html, h: HtmlBuilder<unknown>): Html => h.main([], [child]),
}
const pick = ({ other }: { body: Html; other: Html }): Html => other
const pickBody = ({ body }: { body: Html; other: Html }): Html => body
const framed = (parts: { body: Html }, h: HtmlBuilder<unknown>): Html =>
  h.main([], [parts.body])
export const methodDiscard = (h: HtmlBuilder<unknown>): Html =>
  methods.discard(sidebar(h), h)
export const unpickedProperty = (h: HtmlBuilder<unknown>): Html =>
  pick({ body: sidebar(h), other: h.main([], ['Rebuilt shell']) })
export const stringifiedMethod = (h: HtmlBuilder<unknown>): Html =>
  h.main([], [JSON.stringify(sidebar(h))])
export const opaqueMethod = (h: HtmlBuilder<unknown>): Html =>
  h.main([], [opaque.wrap(sidebar(h))])
export const mappedAway = (h: HtmlBuilder<unknown>): Html =>
  h.main([], [sidebar(h)].map(() => h.div([], [])))
export const validDirect = (h: HtmlBuilder<unknown>): Html =>
  h.main([], [sidebar(h)])
export const passArray = (h: HtmlBuilder<unknown>): Html =>
  h.main([], [sidebar(h)].map(child => child))
export const filtered = (h: HtmlBuilder<unknown>): Html =>
  h.main([], [h.header([], [])].concat([sidebar(h)]).filter(Boolean))
export const methodFrame = (h: HtmlBuilder<unknown>): Html =>
  methods.frame(sidebar(h), h)
export const arrowMethod = (h: HtmlBuilder<unknown>): Html =>
  methods.wrap(sidebar(h), h)
export const pickedProperty = (h: HtmlBuilder<unknown>): Html =>
  pickBody({ body: sidebar(h), other: h.main([], []) })
export const accessedProperty = (h: HtmlBuilder<unknown>): Html =>
  framed({ body: sidebar(h) }, h)
`,
  )
  const negatives = [
    'methodDiscard',
    'unpickedProperty',
    'stringifiedMethod',
    'opaqueMethod',
    'mappedAway',
  ]
  const positives = [
    'validDirect',
    'passArray',
    'filtered',
    'methodFrame',
    'arrowMethod',
    'pickedProperty',
    'accessedProperty',
  ]
  const strict = createStrictContext({
    manifest: {
      artifacts: [
        {
          exports: [
            {
              contract: 'component.sidebar',
              file: 'src/design/sidebar.ts',
              name: 'sidebar',
            },
          ],
          files: [
            {
              path: 'src/design/sidebar.ts',
              rawRendering: true,
              role: 'renderer',
            },
          ],
          id: 'crease/sidebar',
        },
        {
          exports: [...negatives, ...positives].map(name => ({
            contract: 'app.shell',
            file: 'src/design/shell.ts',
            foundations: ['component.sidebar'],
            name,
          })),
          files: [
            {
              path: 'src/design/shell.ts',
              rawRendering: true,
              role: 'renderer',
            },
          ],
          id: 'app/shell',
        },
      ],
      policyVersion: 'crease-default-v1',
      renderer: 'tailwind',
      schemaVersion: 1,
    },
    rootDir: root,
  })
  const problems = verifyFoundations({
    ownership: strict.ownership,
    rootDir: root,
  })
  rmSync(root, { force: true, recursive: true })
  /* Review F6 (Oct 21): unknown methods, unpicked properties and
     stringified output are not rendered foundations. */
  assert.deepEqual(
    problems.map(problem => /`(\w+)`/u.exec(problem)[1]).sort(),
    [...negatives].sort(),
    problems.join('\n'),
  )
  for (const problem of problems)
    assert.match(problem, /the call's result does not reach the returned view/u)
})
