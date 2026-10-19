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
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  classifySelector,
  createCssAudit,
  findStylesheets,
} from '../lib/strict/css.js'

const project = files => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-css-'))
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    writeFileSync(path.join(root, name), text)
  }
  return root
}

/* Receipt paths are POSIX on every platform. */
const relative = (root, file) =>
  path.relative(root, file).split(path.sep).join('/')

const audit = (files, options = {}) => {
  const root = project(files)
  const run = createCssAudit({
    isOwned: file => (options.owned ?? []).includes(relative(root, file)),
    rootDir: root,
    rootsOf: file =>
      (options.owned ?? []).includes(relative(root, file))
        ? options.roots
        : undefined,
  })
  for (const file of findStylesheets(root)) run.auditFile(file)
  rmSync(root, { force: true, recursive: true })
  return run.findings
}

const kinds = findings => findings.map(finding => finding.kind)

const SHADCN_GLOBALS = `@import 'tailwindcss';
@import '@fontsource-variable/inter';
@import './theme.css';
@custom-variant dark (&:is(.dark *));
@theme inline {
  --color-background: var(--background);
  --radius-lg: var(--radius);
}
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; font-family: 'Inter Variable', sans-serif; }
  button, input, textarea { font: inherit; letter-spacing: inherit; }
  html, body, #root { margin: 0; min-height: 100%; }
}
`
const THEME = `:root, .light { --background: oklch(1 0 0); color-scheme: light; }
.dark { --background: oklch(0.145 0 0); color-scheme: dark; }
@media (prefers-reduced-motion: reduce) { :root { --duration: 0ms; } }
`

test('framework imports, tokens and a narrow base layer pass', () => {
  assert.deepEqual(
    audit({ 'src/styles.css': SHADCN_GLOBALS, 'src/theme.css': THEME }),
    [],
  )
})

test('global component selectors fail at any depth', () => {
  for (const css of [
    '.product-icon { width: 16px; }',
    '@layer base { .card { padding: 4px; } }',
    '@media (min-width: 40rem) { [data-slot="button"] { height: 2rem; } }',
    '@layer components { @supports (display: grid) { [role="menuitem"] { color: red; } } }',
    'body { .card { color: red; } }',
    'button:focus-visible { outline: 2px solid red; }',
    '#issues li { color: red; }',
    ':global(.card) { color: red; }',
  ])
    assert.deepEqual(
      kinds(audit({ 'src/styles.css': css })),
      ['violation'],
      css,
    )
})

test('base rules only accept base properties and native resets', () => {
  assert.deepEqual(
    kinds(
      audit({ 'src/styles.css': '@layer base { body { display: grid; } }' }),
    ),
    ['violation'],
  )
  assert.deepEqual(
    kinds(audit({ 'src/styles.css': 'button { cursor: pointer; }' })),
    ['violation'],
  )
  assert.deepEqual(
    kinds(audit({ 'src/styles.css': 'button { @apply rounded-md; }' })),
    ['violation'],
  )
  assert.deepEqual(
    kinds(
      audit({
        'src/styles.css': '@theme { --color-x: red; .card { color: red; } }',
      }),
    ),
    ['violation'],
  )
  assert.deepEqual(
    kinds(
      audit({ 'src/styles.css': '@utility card-surface { padding: 4px; }' }),
    ),
    ['violation'],
  )
})

test('base rules check values, @apply and @scope, not only property names', () => {
  for (const css of [
    '@layer base { * { padding: 64px; width: 4px; background: hotpink; } }',
    '@layer base { * { @apply p-16 w-1 bg-red-500 rounded-full; } }',
    '@scope ([data-slot="button"]) { * { padding: 64px; background: hotpink; } }',
    '@layer base { body { color: #ff0000; } }',
  ])
    assert.ok(
      kinds(audit({ 'src/styles.css': css })).includes('violation'),
      css,
    )
  assert.deepEqual(
    audit({
      'src/styles.css':
        '@layer base { * { margin: 0; padding: 0; box-sizing: border-box; } html, body { height: 100%; background: var(--background); color: var(--foreground); line-height: 1.5; } }',
    }),
    [],
  )
})

test('stylesheets imported from outside src are audited', () => {
  const findings = audit({
    'src/entry.ts': "import '../styles/product.css'\n",
    'src/styles.css': "@import 'tailwindcss';\n",
    'styles/product.css': '.product-icon { width: 12px; }\n',
  })
  assert.deepEqual(
    findings.map(finding => [finding.file, finding.kind]),
    [['styles/product.css', 'violation']],
  )
})

test('imported stylesheets are followed and reported at their own path', () => {
  const findings = audit({
    'src/styles.css':
      "@import 'tailwindcss';\n@import './parts/overrides.css' layer(base);\n",
    'src/parts/overrides.css': '\n.issue-row { gap: 4px; }\n',
  })
  assert.deepEqual(
    findings.map(({ file, kind, line }) => [file, kind, line]),
    [['src/parts/overrides.css', 'violation', 2]],
  )
})

test('unresolvable input is unverifiable, never accepted', () => {
  assert.deepEqual(
    kinds(audit({ 'src/styles.css': "@import './missing.css';" })),
    ['unverifiable'],
  )
  assert.deepEqual(
    kinds(audit({ 'src/styles.css': '@frobnicate { a { color: red } }' })),
    ['unverifiable'],
  )
  assert.deepEqual(kinds(audit({ 'src/styles.css': 'body { color: red' })), [
    'unverifiable',
  ])
})

test('registered component CSS must stay inside its own scope', () => {
  const owned = { owned: ['src/design/chart.css'] }
  assert.deepEqual(
    audit(
      {
        'src/design/chart.css':
          '.crease-chart [data-slot="tick"] { fill: currentColor; }\n[data-slot="chart"]:hover { opacity: 0.9; }',
      },
      owned,
    ),
    [],
  )
  for (const css of [
    ':global(.x) { color: red; }',
    'body { color: red; }',
    'svg text { fill: red; }',
  ])
    assert.deepEqual(
      kinds(audit({ 'src/design/chart.css': css }, owned)),
      ['violation'],
      css,
    )
})

test("registered component CSS may only style its owner's roots", () => {
  const css =
    '.chart-root { gap: 4px; } [data-slot="chart-legend"] .x { gap: 2px; }'
  assert.deepEqual(
    audit(
      { 'src/chart.css': css },
      {
        owned: ['src/chart.css'],
        roots: new Set(['chart-root', 'chart-legend']),
      },
    ),
    [],
  )
  assert.deepEqual(
    kinds(
      audit(
        { 'src/chart.css': `${css} .unrelated-button { padding: 64px; }` },
        {
          owned: ['src/chart.css'],
          roots: new Set(['chart-root', 'chart-legend']),
        },
      ),
    ),
    ['violation'],
  )
})

test('selector classification', () => {
  assert.equal(classifySelector(':root.dark'), 'theme')
  assert.equal(classifySelector('.dark *::before'), 'base')
  assert.equal(classifySelector('input::placeholder'), 'element')
  assert.equal(classifySelector('[data-slot="x"]'), 'component')
  assert.equal(classifySelector('a:hover'), 'component')
})

test('registry theme items use the same policy', () => {
  const run = createCssAudit({ rootDir: '/' })
  const registry = JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL('../../../registry/theme/registry.json', import.meta.url),
      ),
      'utf8',
    ),
  )
  for (const item of registry.items) run.auditRegistryItem(item)
  for (const renderer of ['ui', 'stylex', 'pleat']) {
    const components = JSON.parse(
      readFileSync(
        fileURLToPath(
          new URL(`../../../src/${renderer}/registry.json`, import.meta.url),
        ),
        'utf8',
      ),
    )
    for (const item of components.items) run.auditRegistryItem(item)
  }
  assert.deepEqual(run.findings, [])
  run.auditRegistryItem({
    css: { '@layer components': { '.card': { padding: '4px' } } },
    cssVars: { light: { background: 'oklch(1 0 0)' } },
    name: 'bad-item',
  })
  assert.deepEqual(
    run.findings.map(({ file, kind }) => [file, kind]),
    [['registry:bad-item', 'violation']],
  )
})

test('the archived tutorial stylesheet fails', () => {
  const run = createCssAudit({
    rootDir: fileURLToPath(
      new URL('./fixtures/tutorial-attempt-01/', import.meta.url),
    ),
  })
  run.auditFile(
    fileURLToPath(
      new URL('./fixtures/tutorial-attempt-01/src/styles.css', import.meta.url),
    ),
  )
  const violations = run.findings.filter(
    finding => finding.kind === 'violation',
  )
  assert.ok(violations.length > 20, `${violations.length} violations`)
  assert.ok(violations.some(finding => /product-icon/u.test(finding.message)))
})
