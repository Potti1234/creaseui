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
  assert.equal(problems.length, 4, problems.join('\n'))
  for (const name of ['unusedClosure', 'discardedCall'])
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
