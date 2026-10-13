import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
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
