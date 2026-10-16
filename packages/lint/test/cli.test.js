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
  rmSync(directory, { force: true, recursive: true })
})
