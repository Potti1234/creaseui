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
    'dir',
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

test('doctor reports installed components missing from the receipt', () => {
  const directory = scratch()
  mkdirSync(path.join(directory, 'node_modules/@creaseui'), { recursive: true })
  symlinkSync(
    fileURLToPath(new URL('..', import.meta.url)),
    path.join(directory, 'node_modules/@creaseui/lint'),
    'dir',
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
    'dir',
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
