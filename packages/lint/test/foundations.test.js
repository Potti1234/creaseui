import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

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
