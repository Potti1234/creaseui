import assert from 'node:assert/strict'
import {
  copyFileSync,
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

import ts from 'typescript'

import { createStrictContext } from '../lib/strict/context.js'
import { verifyFoundations } from '../lib/strict/foundations.js'

const repo = fileURLToPath(new URL('../../../', import.meta.url))

/* Review of 6d6756e1 (R1): the shipped Button renders through
   `@foldkit/ui`'s `Button.view({ toView })`. Its `children` and
   `leadingIcon` reach the returned view; `onClick` does not. */
test('foundations follow props through the installed Button to its render slot', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-foundations-real-'))
  const write = (name, text) => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    writeFileSync(path.join(root, name), text)
  }
  const copy = name => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    copyFileSync(path.join(repo, name), path.join(root, name))
  }
  symlinkSync(
    path.join(repo, 'node_modules'),
    path.join(root, 'node_modules'),
    'junction',
  )
  write(
    'tsconfig.json',
    JSON.stringify({
      compilerOptions: {
        module: 'esnext',
        moduleResolution: 'bundler',
        paths: { '@/*': ['./src/*'] },
        skipLibCheck: true,
        strict: true,
      },
      include: ['src'],
    }),
  )
  for (const file of [
    'src/ui/button.ts',
    'src/lib/button.ts',
    'src/lib/utils.ts',
    'src/ui/icon.ts',
    'src/lib/icon.ts',
    'src/lib/icon-nodes.ts',
  ])
    copy(file)
  write(
    'src/sidebar.ts',
    `import type { Html, HtmlBuilder } from 'foldkit/html'
export const sidebar = (h: HtmlBuilder<unknown>): Html =>
  h.aside([], ['Base sidebar'])
`,
  )
  write(
    'src/shell.ts',
    `import type { Html, HtmlBuilder } from 'foldkit/html'
import { button, buttonLink } from './ui/button'
import { icon } from './ui/icon'
import { sidebar } from './sidebar'

export const clickMetadata = (h: HtmlBuilder<unknown>): Html =>
  button({ onClick: sidebar(h), children: ['Rebuilt shell'] }, h)
export const renderedIcon = (h: HtmlBuilder<unknown>): Html =>
  button({ leadingIcon: sidebar(h), children: ['Rebuilt shell'] }, h)
export const directIcon = (h: HtmlBuilder<unknown>): Html =>
  icon({ name: 'plus' }, h)
export const iconChild = (h: HtmlBuilder<unknown>): Html =>
  button({ children: [icon({ name: 'plus' }, h), 'Create'] }, h)
export const iconLeading = (h: HtmlBuilder<unknown>): Html =>
  button({ children: ['Create'], leadingIcon: icon({ name: 'plus' }, h) }, h)
export const iconEvent = (h: HtmlBuilder<unknown>): Html =>
  button({ children: ['Create'], onClick: icon({ name: 'plus' }, h) }, h)
export const linkIcon = (h: HtmlBuilder<unknown>): Html =>
  buttonLink({ href: '#', children: [icon({ name: 'plus' }, h), 'Create'] }, h)
`,
  )
  const claims = {
    clickMetadata: 'component.sidebar',
    directIcon: 'component.icon',
    iconChild: 'component.icon',
    iconEvent: 'component.icon',
    iconLeading: 'component.icon',
    linkIcon: 'component.icon',
    renderedIcon: 'component.sidebar',
  }
  const renderer = (id, file, exports, extra = []) => ({
    exports: exports.map(([name, contract]) => ({ contract, file, name })),
    files: [file, ...extra].map(name => ({
      path: name,
      rawRendering: true,
      role: 'renderer',
    })),
    id,
  })
  const strict = createStrictContext({
    manifest: {
      artifacts: [
        renderer('crease/sidebar', 'src/sidebar.ts', [
          ['sidebar', 'component.sidebar'],
        ]),
        renderer(
          'crease/button',
          'src/ui/button.ts',
          [
            ['button', 'component.button'],
            ['buttonLink', 'component.button-link'],
          ],
          ['src/lib/button.ts', 'src/lib/utils.ts'],
        ),
        renderer(
          'crease/icon',
          'src/ui/icon.ts',
          [['icon', 'component.icon']],
          ['src/lib/icon.ts', 'src/lib/icon-nodes.ts'],
        ),
        {
          exports: Object.entries(claims).map(([name, foundation]) => ({
            contract: 'app.shell',
            file: 'src/shell.ts',
            foundations: [foundation],
            name,
          })),
          files: [
            { path: 'src/shell.ts', rawRendering: true, role: 'renderer' },
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
  const program = ts.createProgram([path.join(root, 'src/shell.ts')], {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    paths: { '@/*': [path.join(root, 'src/*')] },
    skipLibCheck: true,
    strict: true,
  })
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .map(diagnostic =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    )
  const problems = verifyFoundations({
    ownership: strict.ownership,
    rootDir: root,
  })
  rmSync(root, { force: true, recursive: true })
  assert.deepEqual(diagnostics, [])
  const named = pattern =>
    problems
      .filter(problem => pattern.test(problem))
      .map(problem => /`(\w+)`/u.exec(problem)[1])
      .sort()
  assert.deepEqual(
    named(/the call's result does not reach the returned view/u),
    ['clickMetadata', 'iconEvent'],
    problems.join('\n'),
  )
  assert.equal(problems.length, 2, problems.join('\n'))
})
