import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'

import { creaseui } from '../creaseui.js'

const bin = fileURLToPath(new URL('../bin/creaseui-lint.js', import.meta.url))
const fixture = fileURLToPath(
  new URL('./fixtures/strict-app/', import.meta.url),
)
const run = (cwd, ...args) =>
  spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8' })

const scratch = () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'creaseui-lint-cli-'))
  cpSync(fixture, directory, { recursive: true })
  rmSync(path.join(directory, 'crease.lock.json'))
  return directory
}

test('init writes a receipt and never replaces an existing ESLint config', () => {
  const directory = scratch()
  writeFileSync(path.join(directory, 'eslint.config.js'), 'export default []\n')
  const result = run(
    directory,
    'init',
    '--renderer',
    'pleat',
    '--components',
    'src/design',
  )
  assert.equal(result.status, 0, result.stderr)
  assert.equal(
    readFileSync(path.join(directory, 'eslint.config.js'), 'utf8'),
    'export default []\n',
  )
  assert.ok(existsSync(path.join(directory, 'creaseui-lint.config.mjs')))
  const receipt = JSON.parse(
    readFileSync(path.join(directory, 'crease.lock.json'), 'utf8'),
  )
  assert.equal(receipt.renderer, 'pleat')
  const button = receipt.artifacts.find(
    artifact => artifact.id === 'crease/pleat-button',
  )
  assert.deepEqual(button.files, [
    { path: 'src/design/button.ts', rawRendering: true, role: 'renderer' },
  ])
  assert.equal(button.exports[0].contract, 'control.button')
  const again = run(
    directory,
    'init',
    '--renderer',
    'pleat',
    '--components',
    'src/design',
    '--dry-run',
  )
  assert.match(again.stdout, /keep {4}crease\.lock\.json/u)
  rmSync(directory, { force: true, recursive: true })
})

test('invalid setup exits 2', () => {
  const directory = scratch()
  assert.equal(
    run(directory, 'init', '--renderer', 'vue', '--components', 'src').status,
    2,
  )
  assert.equal(run(directory, 'doctor').status, 2)
  assert.equal(run(directory, 'unknown').status, 2)
  rmSync(directory, { force: true, recursive: true })
})

test('init and doctor cover public aliases of rendering exports', () => {
  const directory = scratch()
  /* doctor loads the generated config, which imports @creaseui/lint. */
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  const button = path.join(directory, 'src/design/button.ts')
  const lock = () =>
    JSON.parse(readFileSync(path.join(directory, 'crease.lock.json'), 'utf8'))
  const initArgs = ['init', '--renderer', 'pleat', '--components', 'src/design']
  assert.equal(run(directory, ...initArgs).status, 0)
  assert.equal(run(directory, 'doctor').status, 0)
  writeFileSync(
    button,
    `${readFileSync(button, 'utf8')}export const actionAlias = button\n`,
  )
  writeFileSync(
    path.join(directory, 'src/design/stack.ts'),
    `${readFileSync(path.join(directory, 'src/design/stack.ts'), 'utf8')}import { button as base } from './button'\nexport { base as stackAction }\n`,
  )
  const stale = run(directory, 'doctor')
  assert.equal(stale.status, 2, stale.stdout)
  assert.match(stale.stdout, /coverage feature-only/u)
  assert.match(stale.stdout, /`actionAlias` has no contract in the manifest/u)
  assert.match(stale.stdout, /`stackAction` has no contract in the manifest/u)
  rmSync(path.join(directory, 'crease.lock.json'))
  assert.equal(run(directory, ...initArgs).status, 0)
  const exports = lock().artifacts.flatMap(artifact => artifact.exports)
  const named = name => exports.find(entry => entry.name === name)
  assert.equal(named('actionAlias').contract, 'control.button')
  assert.equal(named('stackAction').contract, 'control.button')
  const fresh = run(directory, 'doctor')
  assert.equal(fresh.status, 0, fresh.stdout)
  assert.match(fresh.stdout, /0 uncovered UI modules/u)
  assert.match(fresh.stdout, /coverage complete/u)
  rmSync(directory, { force: true, recursive: true })
})

test('alias-only renderers and renamed re-exports are covered and enforced', async () => {
  const directory = scratch()
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  /* No HtmlBuilder text: only the type checker sees that this renders. */
  writeFileSync(
    path.join(directory, 'src/design/actions.ts'),
    "import { button } from './button'\nexport const aliasOnly = button\n",
  )
  writeFileSync(
    path.join(directory, 'src/design/stack.ts'),
    `${readFileSync(path.join(directory, 'src/design/stack.ts'), 'utf8')}import { button as base } from './button'\nexport { base as stackAction }\n`,
  )
  const initArgs = ['init', '--renderer', 'pleat', '--components', 'src/design']
  assert.equal(run(directory, ...initArgs).status, 0)
  const receipt = JSON.parse(
    readFileSync(path.join(directory, 'crease.lock.json'), 'utf8'),
  )
  const actions = receipt.artifacts.find(artifact =>
    artifact.files.some(file => file.path === 'src/design/actions.ts'),
  )
  assert.deepEqual(actions.files, [
    { path: 'src/design/actions.ts', rawRendering: false, role: 'renderer' },
  ])
  assert.deepEqual(
    actions.exports.map(entry => [entry.name, entry.contract]),
    [['aliasOnly', 'control.button']],
  )
  const doctor = run(directory, 'doctor')
  assert.equal(doctor.status, 0, doctor.stdout)
  assert.match(doctor.stdout, /coverage complete/u)

  writeFileSync(
    path.join(directory, 'src/consumer.ts'),
    [
      "import type { Html, HtmlBuilder } from 'foldkit/html'",
      "import { aliasOnly } from './design/actions'",
      "import { stackAction } from './design/stack'",
      "export const a = (h: HtmlBuilder<unknown>): Html => aliasOnly({ children: ['A'], class: 'text-red-500' }, h)",
      "export const b = (h: HtmlBuilder<unknown>): Html => stackAction({ children: ['B'], class: 'text-red-500' }, h)",
      "export const c = (h: HtmlBuilder<unknown>): Html => stackAction({ children: ['C'], variant: 'outline' }, h)",
      '',
    ].join('\n'),
  )
  const [result] = await new ESLint({
    cwd: directory,
    overrideConfig: creaseui({
      files: ['src/consumer.ts'],
      renderer: 'pleat',
      rootDir: directory,
    }),
    overrideConfigFile: true,
  }).lintFiles(['src/consumer.ts'])
  const lines = result.messages
    .filter(message => message.ruleId === 'crease/component-contract')
    .map(message => message.line)
  assert.deepEqual(lines, [4, 5], JSON.stringify(result.messages, null, 2))
  rmSync(directory, { force: true, recursive: true })
})

test('owned renderers without a raw grant keep every application rule', async () => {
  const directory = scratch()
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  /* The builder type below is computed from the installed Foldkit types. */
  symlinkSync(
    fileURLToPath(new URL('../../../node_modules/foldkit', import.meta.url)),
    path.join(directory, 'node_modules/foldkit'),
    'junction',
  )
  /* Review F1: no HtmlBuilder text, so init registers them with no raw grant. */
  writeFileSync(
    path.join(directory, 'src/design/wrapper.ts'),
    [
      "import { button } from './button'",
      "import { layoutStyle } from './contracts'",
      'type Builder = Parameters<typeof button>[1]',
      "export const wrapper = (h: Builder) => button({ children: ['Bad'], layoutStyle: layoutStyle({ height: '12px' }) }, h)",
      '',
    ].join('\n'),
  )
  writeFileSync(
    path.join(directory, 'src/design/raw-wrapper.ts'),
    [
      "import { button } from './button'",
      'type Builder = Parameters<typeof button>[1]',
      "export const rawWrapper = (h: Builder) => h.button([], ['Unapproved raw button'])",
      '',
    ].join('\n'),
  )
  writeFileSync(
    path.join(directory, 'src/design/approved.ts'),
    [
      "import { button } from './button'",
      'type Builder = Parameters<typeof button>[1]',
      "export const approved = (h: Builder) => button({ variant: 'outline', children: ['Fine'] }, h)",
      '',
    ].join('\n'),
  )
  const initArgs = ['init', '--renderer', 'pleat', '--components', 'src/design']
  assert.equal(run(directory, ...initArgs).status, 0)
  const receipt = JSON.parse(
    readFileSync(path.join(directory, 'crease.lock.json'), 'utf8'),
  )
  const fileOf = name =>
    receipt.artifacts
      .flatMap(artifact => artifact.files)
      .find(file => file.path === `src/design/${name}.ts`)
  for (const name of ['wrapper', 'raw-wrapper', 'approved'])
    assert.equal(fileOf(name).rawRendering, false, name)
  const files = ['wrapper', 'raw-wrapper', 'approved'].map(
    name => `src/design/${name}.ts`,
  )
  const results = await new ESLint({
    cwd: directory,
    overrideConfig: creaseui({
      files: ['src/**/*.ts'],
      renderer: 'pleat',
      rootDir: directory,
    }),
    overrideConfigFile: true,
  }).lintFiles(files)
  const rules = Object.fromEntries(
    results.map(result => [
      path.basename(result.filePath, '.ts'),
      [...new Set(result.messages.map(message => message.ruleId))].sort(),
    ]),
  )
  assert.deepEqual(rules.wrapper, ['crease/component-contract'])
  assert.ok(
    rules['raw-wrapper'].includes('crease/no-raw-controls'),
    JSON.stringify(results.map(result => result.messages)),
  )
  assert.deepEqual(rules.approved, [])
  writeFileSync(
    path.join(directory, 'src/design/raw-wrapper.ts'),
    [
      "import { button } from './button'",
      'type Builder = Parameters<typeof button>[1]',
      "export const rawWrapper = (h: Builder) => button({ children: ['Fixed'] }, h)",
      '',
    ].join('\n'),
  )
  const doctor = run(directory, 'doctor')
  assert.doesNotMatch(doctor.stdout, /lost crease\//u, doctor.stdout)
  rmSync(directory, { force: true, recursive: true })
})

test('doctor reconciles every required rule through imported policy modules', () => {
  const directory = scratch()
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  const initArgs = ['init', '--renderer', 'pleat', '--components', 'src/design']
  assert.equal(run(directory, ...initArgs).status, 0)
  const config = path.join(directory, 'eslint.config.js')
  writeFileSync(
    path.join(directory, 'crease-base.mjs'),
    readFileSync(config, 'utf8'),
  )
  writeFileSync(
    config,
    "import base from './crease-base.mjs'\nimport policy from './policy.mjs'\nexport default [...base, ...policy]\n",
  )
  writeFileSync(path.join(directory, 'policy.mjs'), 'export default []\n')
  assert.equal(run(directory, 'doctor').status, 0)
  writeFileSync(
    path.join(directory, 'policy.mjs'),
    "export default [{ files: ['src/design/button.ts'], rules: { 'crease/no-raw-controls': 'off' } }]\n",
  )
  const loosened = run(directory, 'doctor')
  assert.notEqual(loosened.status, 0, loosened.stdout)
  assert.match(
    loosened.stdout,
    /src\/design\/button\.ts \(registered renderer\) lost no-raw-controls/u,
  )
  rmSync(directory, { force: true, recursive: true })
})

test('doctor reports installed components missing from the receipt', () => {
  const directory = scratch()
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  writeFileSync(
    path.join(directory, 'components.json'),
    JSON.stringify({ aliases: { ui: '@/design' } }),
  )
  assert.equal(run(directory, 'init', '--renderer', 'pleat').status, 0)
  assert.equal(run(directory, 'doctor').status, 0)
  writeFileSync(
    path.join(directory, 'src/design/badge.ts'),
    readFileSync(path.join(directory, 'src/design/button.ts'), 'utf8'),
  )
  const stale = run(directory, 'doctor')
  assert.equal(stale.status, 2, stale.stdout)
  assert.match(
    stale.stdout,
    /src\/design\/badge\.ts is installed in src\/design but not registered in crease\.lock\.json/u,
  )
  rmSync(directory, { force: true, recursive: true })
})

test('doctor reports the archived tutorial as feature-only coverage', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'creaseui-lint-tutorial-'))
  cpSync(
    fileURLToPath(new URL('./fixtures/tutorial-attempt-01/', import.meta.url)),
    directory,
    { recursive: true },
  )
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  const result = run(directory, 'doctor')
  assert.equal(result.status, 2, result.stdout + result.stderr)
  assert.match(result.stdout, /coverage feature-only/u)
  for (const file of [
    'src/design/shell.ts',
    'src/design/primitives.ts',
    'src/ui/button.ts',
    'src/lib/icon.ts',
  ])
    assert.match(
      result.stdout,
      new RegExp(
        `${file.replaceAll('.', '\\.')} is ignored by the ESLint config`,
        'u',
      ),
    )
  assert.doesNotMatch(result.stdout, /coverage complete/u)
  assert.match(
    result.stdout,
    /src\/styles\.css:\d+ `\.product-icon` styles components from global CSS/u,
  )
  const css = run(directory, 'css')
  assert.equal(css.status, 1, css.stdout + css.stderr)
  assert.match(
    css.stdout,
    /css: 1 stylesheets, \d+ violations, 0 unverifiable/u,
  )
  rmSync(directory, { force: true, recursive: true })
})

test('css and doctor reject raw base paint and unlisted base utilities', () => {
  for (const css of [
    '@layer base { * { background: color-mix(in srgb, var(--background) 10%, hotpink); } }',
    '@layer base { * { @apply opacity-50 rotate-45; } }',
    '@layer base { * { @apply text-shadow-lg; } }',
    '@layer base { * { @apply bg-cover; } }',
  ]) {
    const directory = scratch()
    mkdirSync(path.join(directory, 'node_modules/@creaseui'), {
      recursive: true,
    })
    symlinkSync(
      fileURLToPath(new URL('..', import.meta.url)),
      path.join(directory, 'node_modules/@creaseui/lint'),
      'junction',
    )
    assert.equal(
      run(
        directory,
        'init',
        '--renderer',
        'pleat',
        '--components',
        'src/design',
      ).status,
      0,
    )
    writeFileSync(path.join(directory, 'src/global.css'), `${css}\n`)
    const result = run(directory, 'css')
    assert.equal(result.status, 1, css + result.stdout + result.stderr)
    assert.match(result.stdout, /[1-9]\d* violations/u, css)
    const doctor = run(directory, 'doctor')
    assert.notEqual(doctor.status, 0, css + doctor.stdout)
    assert.match(doctor.stdout, /src\/global\.css:1/u, css)
    rmSync(directory, { force: true, recursive: true })
  }
})

test('info and inspect report Foldkit facts and actionable gaps', () => {
  const directory = fileURLToPath(
    new URL('./fixtures/tutorial-attempt-01/', import.meta.url),
  )
  const info = run(directory, 'info', '--json')
  assert.equal(info.status, 0, info.stdout + info.stderr)
  const project = JSON.parse(info.stdout)
  assert.equal(project.renderer, 'tailwind')
  assert.equal(project.framework.foldkit.declared, '0.164.0')
  assert.ok(project.artifacts.some(artifact => artifact.id === 'tasks/shell'))

  const shell = run(directory, 'inspect', '--component', 'shell', '--json')
  assert.equal(shell.status, 0, shell.stdout + shell.stderr)
  const detail = JSON.parse(shell.stdout)
  assert.ok(detail.exports.some(record => record.contract === 'tasks.sidebar'))
  assert.ok(detail.files[0].imports.includes('@/ui/button'))
  assert.match(detail.stateOwnership, /^stateless/u)
  assert.ok(
    detail.limitations.some(entry => /may render raw elements/u.test(entry)),
  )

  const missing = run(directory, 'inspect', '--component', 'data-table')
  assert.equal(missing.status, 1)
  assert.match(
    missing.stderr,
    /data-table is not installed in this tailwind project\. Install it with `npx shadcn@latest add Potti1234\/creaseui\/data-table`/u,
  )
})

test('init reads the shadcn ui/lib targets and registers the stylesheet entry as setup', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'creaseui-lint-init-'))
  const file = (name, content) => {
    mkdirSync(path.dirname(path.join(directory, name)), { recursive: true })
    writeFileSync(path.join(directory, name), content)
  }
  file(
    'components.json',
    JSON.stringify({
      aliases: { lib: '@/lib', ui: '@/ui' },
      tailwind: { css: 'src/styles.css' },
    }),
  )
  file(
    'src/ui/button.ts',
    "import type { Html, HtmlBuilder } from 'foldkit/html'\nexport const button = <M>(h: HtmlBuilder<M>): Html => h.button([], [])\n",
  )
  file(
    'src/lib/icon.ts',
    "import type { Html, HtmlBuilder } from 'foldkit/html'\nexport const icon = <M>(h: HtmlBuilder<M>): Html => h.span([], [])\n",
  )
  file('src/styles.css', '')
  file('src/entry.ts', "import './styles.css'\n")
  file('src/app/main.ts', 'export const main = 1\n')
  const result = run(directory, 'init', '--renderer', 'tailwind')
  assert.equal(result.status, 0, result.stderr)
  const receipt = JSON.parse(
    readFileSync(path.join(directory, 'crease.lock.json'), 'utf8'),
  )
  const byPath = new Map(
    receipt.artifacts.flatMap(artifact =>
      artifact.files.map(entry => [entry.path, { artifact, entry }]),
    ),
  )
  assert.equal(byPath.get('src/ui/button.ts').entry.role, 'renderer')
  assert.equal(
    byPath.get('src/ui/button.ts').artifact.exports[0].contract,
    'control.button',
  )
  assert.equal(byPath.get('src/lib/icon.ts').entry.rawRendering, true)
  assert.equal(
    byPath.get('src/lib/icon.ts').artifact.exports[0].visibility,
    'implementation',
  )
  assert.equal(byPath.get('src/entry.ts').entry.role, 'setup')
  assert.equal(byPath.has('src/app/main.ts'), false)
  rmSync(directory, { force: true, recursive: true })
})

test('--help prints usage and unknown options exit 2 with usage', () => {
  const directory = scratch()
  for (const args of [['--help'], ['init', '--help'], ['doctor', '-h'], []]) {
    const result = run(directory, ...args)
    assert.equal(result.status, 0, args.join(' '))
    assert.match(result.stdout, /Usage:\n {2}creaseui-lint init/u)
  }
  const unknown = run(directory, 'init', '--nope')
  assert.equal(unknown.status, 2)
  assert.match(unknown.stderr, /Unknown option '--nope'[\s\S]*Usage:/u)
  assert.doesNotMatch(unknown.stderr, /\n\s+at /u)
})

test('inspect follows re-exported program parts', () => {
  const directory = scratch()
  writeFileSync(
    path.join(directory, 'src/design/sidebar-state.ts'),
    [
      'export type Model = { open: boolean }',
      "export type Message = { _tag: 'Toggled' }",
      'export const init = (): Model => ({ open: true })',
      'export const update = (model: Model, _message: Message): Model => ({ open: !model.open })',
      '',
    ].join('\n'),
  )
  writeFileSync(
    path.join(directory, 'src/design/sidebar.ts'),
    [
      "import type { Html, HtmlBuilder } from 'foldkit/html'",
      "export * from './sidebar-state'",
      "export const sidebar = (h: HtmlBuilder<unknown>): Html => h.aside([], ['Nav'])",
      '',
    ].join('\n'),
  )
  assert.equal(
    run(directory, 'init', '--renderer', 'pleat', '--components', 'src/design')
      .status,
    0,
  )
  const result = run(directory, 'inspect', '--component', 'sidebar', '--json')
  assert.equal(result.status, 0, result.stdout + result.stderr)
  const detail = JSON.parse(result.stdout)
  assert.deepEqual(detail.program, ['Model', 'Message', 'init', 'update'])
  assert.match(detail.stateOwnership, /^parent-model/u)
  assert.match(detail.docs, /forward it to its update/u)
  rmSync(directory, { force: true, recursive: true })
})

test('inspect finds renderer-directory installs by item, file or export name', () => {
  const directory = scratch()
  writeFileSync(
    path.join(directory, 'components.json'),
    JSON.stringify({ aliases: { ui: '@/design' } }),
  )
  mkdirSync(path.join(directory, 'src/design/pleat'))
  writeFileSync(
    path.join(directory, 'src/design/pleat/native-select.ts'),
    readFileSync(path.join(directory, 'src/design/button.ts'), 'utf8'),
  )
  assert.equal(run(directory, 'init', '--renderer', 'pleat').status, 0)
  const receipt = JSON.parse(
    readFileSync(path.join(directory, 'crease.lock.json'), 'utf8'),
  )
  assert.ok(
    receipt.artifacts.some(({ id }) => id === 'crease/pleat-native-select'),
    receipt.artifacts.map(({ id }) => id).join(', '),
  )
  for (const name of ['native-select', 'pleat-native-select', 'button']) {
    const result = run(directory, 'inspect', '--component', name)
    assert.equal(result.status, 0, `${name}: ${result.stderr}`)
  }
  rmSync(directory, { force: true, recursive: true })
})

test('init before any install says nothing is installed yet', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'creaseui-lint-cli-'))
  writeFileSync(
    path.join(directory, 'components.json'),
    JSON.stringify({ aliases: { lib: '@/lib', ui: '@/ui' } }),
  )
  const result = run(directory, 'init', '--renderer', 'pleat', '--dry-run')
  assert.equal(result.status, 2)
  assert.match(
    result.stderr,
    /nothing is installed yet: components\.json points ui\/lib at src\/ui, src\/lib/u,
  )
  rmSync(directory, { force: true, recursive: true })
})

test('re-running init registers new installs without rewriting the receipt or config', () => {
  const directory = scratch()
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  writeFileSync(
    path.join(directory, 'components.json'),
    JSON.stringify({ aliases: { ui: '@/design' } }),
  )
  assert.equal(run(directory, 'init', '--renderer', 'pleat').status, 0)
  const manifest = path.join(directory, 'crease.lock.json')
  const reviewed = JSON.parse(readFileSync(manifest, 'utf8'))
  reviewed.artifacts[0].reviewedNote = 'kept'
  writeFileSync(manifest, JSON.stringify(reviewed))
  writeFileSync(
    path.join(directory, 'src/design/badge.ts'),
    readFileSync(path.join(directory, 'src/design/button.ts'), 'utf8'),
  )
  const again = run(directory, 'init', '--renderer', 'pleat')
  assert.equal(again.status, 0, again.stderr)
  assert.match(
    again.stdout,
    /update {2}crease\.lock\.json \(\+1: crease\/pleat-badge\)/u,
  )
  assert.match(
    again.stdout,
    /keep {4}eslint\.config\.js \(already spreads creaseui\(\)\)/u,
  )
  assert.ok(!existsSync(path.join(directory, 'creaseui-lint.config.mjs')))
  const updated = JSON.parse(readFileSync(manifest, 'utf8'))
  assert.equal(updated.artifacts[0].reviewedNote, 'kept')
  assert.equal(updated.artifacts.length, reviewed.artifacts.length + 1)
  const doctor = run(directory, 'doctor')
  assert.equal(doctor.status, 0, doctor.stdout + doctor.stderr)
  rmSync(directory, { force: true, recursive: true })
})

test('doctor tells runtime component properties apart from missing theme roles', () => {
  const directory = scratch()
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  writeFileSync(
    path.join(directory, 'components.json'),
    JSON.stringify({ aliases: { ui: '@/design' } }),
  )
  writeFileSync(
    path.join(directory, 'src/styles.css'),
    ':root {\n  --color-border: oklch(0.9 0 0);\n}\n',
  )
  writeFileSync(path.join(directory, 'src/entry.ts'), "import './styles.css'\n")
  const tokens = path.join(directory, 'src/design/interaction-tokens.ts')
  writeFileSync(
    tokens,
    "export const tokens = { border: 'var(--color-border)', release: 'calc(var(--drawer-swipe-strength) * 400ms)' }\n",
  )
  assert.equal(run(directory, 'init', '--renderer', 'pleat').status, 0)
  const stale = run(directory, 'doctor')
  assert.equal(stale.status, 1, stale.stdout)
  assert.match(
    stale.stdout,
    /reads --drawer-swipe-strength without a fallback: runtime properties CreaseUI components set/u,
  )
  assert.doesNotMatch(stale.stdout, /no stylesheet defines/u)
  writeFileSync(
    tokens,
    "export const tokens = { border: 'var(--color-border)', release: 'calc(var(--drawer-swipe-strength, 1) * 400ms)' }\n",
  )
  assert.doesNotMatch(run(directory, 'doctor').stdout, /drawer-swipe-strength/u)
  rmSync(directory, { force: true, recursive: true })
})

test('doctor reports theme roles that installed components read but no stylesheet defines', () => {
  const directory = scratch()
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'junction',
  )
  writeFileSync(
    path.join(directory, 'components.json'),
    JSON.stringify({ aliases: { ui: '@/design' } }),
  )
  writeFileSync(
    path.join(directory, 'src/design/tokens.ts'),
    "export const tokens = { border: 'var(--color-border)', local: 'var(--local)' }\nexport const scope = { '--local': '1px' }\n",
  )
  assert.equal(run(directory, 'init', '--renderer', 'pleat').status, 0)
  const bare = run(directory, 'doctor')
  assert.equal(bare.status, 1, bare.stdout)
  assert.match(
    bare.stdout,
    /src\/design\/tokens\.ts reads --color-border, which no stylesheet defines/u,
  )
  assert.doesNotMatch(bare.stdout, /--local/u)
  writeFileSync(
    path.join(directory, 'src/styles.css'),
    ':root {\n  --color-border: oklch(0.9 0 0);\n}\n',
  )
  writeFileSync(path.join(directory, 'src/entry.ts'), "import './styles.css'\n")
  writeFileSync(
    path.join(directory, 'src/styles.css'),
    '@theme inline {\n  --color-border: var(--border);\n}\n',
  )
  writeFileSync(path.join(directory, 'src/entry.ts'), "import './styles.css'\n")
  assert.match(
    run(directory, 'doctor').stdout,
    /reads --color-border, which no stylesheet defines/u,
    'a Pleat project does not compile @theme',
  )
  writeFileSync(
    path.join(directory, 'src/styles.css'),
    ':root {\n  --color-border: oklch(0.9 0 0);\n}\n',
  )
  const themed = run(directory, 'doctor')
  assert.doesNotMatch(themed.stdout, /no stylesheet defines/u, themed.stdout)
  rmSync(directory, { force: true, recursive: true })
})

test('info --catalog lists installable components before anything is installed', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'creaseui-lint-cli-'))
  const result = run(
    directory,
    'info',
    '--catalog',
    '--renderer',
    'pleat',
    '--json',
  )
  assert.equal(result.status, 0, result.stderr)
  const { components } = JSON.parse(result.stdout)
  assert.ok(components.length > 100)
  assert.ok(components.every(entry => entry.renderer === 'pleat'))
  const select = components.find(entry => entry.component === 'native-select')
  assert.equal(
    select.install,
    'npx shadcn@latest add Potti1234/creaseui/pleat-native-select',
  )
  assert.ok(select.exports.includes('nativeSelect'))
  const text = run(directory, 'info', '--catalog', '--renderer', 'pleat')
  assert.match(text.stdout, /\n {2}sidebar {16}/u)
  assert.match(run(directory, 'info').stdout, /creaseui-lint info --catalog/u)
  rmSync(directory, { force: true, recursive: true })
})
