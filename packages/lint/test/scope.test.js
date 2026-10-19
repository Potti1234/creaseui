import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const BIN = fileURLToPath(new URL('../bin/creaseui-lint.js', import.meta.url))

const receipt = files => ({
  artifacts: [
    {
      exports: [
        {
          contract: 'tasks.row',
          file: 'src/design/row.ts',
          name: 'row',
          variants: { tone: ['default'] },
        },
      ],
      files,
      id: 'tasks/row',
    },
  ],
  policyVersion: 'crease-default-v1',
  renderer: 'tailwind',
  schemaVersion: 1,
})

const write = (root, name, value) =>
  writeFileSync(
    path.join(root, name),
    typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  )

const scope = (root, ...args) =>
  spawnSync(process.execPath, [BIN, 'scope', '--root', root, ...args], {
    encoding: 'utf8',
  })

test('scope reports enforcement changes against a trusted baseline', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-scope-'))
  const git = (...args) =>
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args],
      { cwd: root },
    )
  git('init', '-q')
  write(
    root,
    'crease.lock.json',
    receipt([
      {
        path: 'src/design/row.ts',
        rawElements: ['svg'],
        rawRendering: true,
        role: 'renderer',
      },
    ]),
  )
  write(root, 'package.json', { scripts: { lint: 'eslint .' } })
  write(root, 'eslint.config.js', 'export default []\n')
  git('add', '.')
  git('commit', '-q', '-m', 'baseline')

  const clean = scope(root, '--baseline', 'HEAD')
  assert.equal(clean.status, 0, clean.stdout + clean.stderr)

  write(
    root,
    'crease.lock.json',
    receipt([
      { path: 'src/design/row.ts', rawRendering: true, role: 'renderer' },
      { path: 'src/features/board.ts', rawRendering: true, role: 'renderer' },
    ]),
  )
  write(root, 'package.json', { scripts: { lint: 'eslint src/features' } })
  write(
    root,
    'eslint.config.js',
    "export default [{ ignores: ['src/design/**'] }]\n",
  )
  const loosened = scope(root, '--baseline', 'HEAD')
  assert.equal(loosened.status, 1, loosened.stdout + loosened.stderr)
  for (const message of [
    'widens rawElements for src/design/row.ts',
    'registers src/features/board.ts with rawRendering',
    'changes script lint',
    'changes eslint.config.js',
  ])
    assert.match(
      loosened.stdout,
      new RegExp(message.replaceAll('.', '\\.'), 'u'),
    )

  const system = scope(
    root,
    '--baseline',
    'HEAD',
    '--allow-enforcement-changes',
  )
  assert.equal(system.status, 0, system.stdout + system.stderr)
  assert.match(system.stdout, /accepted as a system change/u)

  assert.equal(scope(root, '--baseline', 'no-such-ref').status, 2)
  assert.equal(scope(root).status, 2)
  rmSync(root, { force: true, recursive: true })
})

test('scope follows imported policy modules and every receipt field', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-scope-'))
  const git = (...args) =>
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args],
      { cwd: root },
    )
  git('init', '-q')
  const files = [
    {
      path: 'src/design/row.ts',
      rawElements: ['svg', 'path'],
      rawRendering: true,
      role: 'renderer',
    },
  ]
  write(root, 'crease.lock.json', receipt(files))
  write(
    root,
    'eslint.config.js',
    "import policy from './config/policy.mjs'\nexport default [...policy]\n",
  )
  mkdirSync(path.join(root, 'config'))
  write(
    root,
    'config/policy.mjs',
    "import extra from './extra.mjs'\nexport default [...extra]\n",
  )
  write(root, 'config/extra.mjs', 'export default []\n')
  git('add', '.')
  git('commit', '-q', '-m', 'baseline')
  assert.equal(scope(root, '--baseline', 'HEAD').status, 0)

  write(
    root,
    'config/extra.mjs',
    "export default [{ files: ['src/design/row.ts'], rules: { 'crease/no-raw-controls': 'off' } }]\n",
  )
  const policy = scope(root, '--baseline', 'HEAD')
  assert.equal(policy.status, 1, policy.stdout + policy.stderr)
  assert.match(policy.stdout, /changes config\/extra\.mjs/u)
  write(root, 'config/extra.mjs', 'export default []\n')

  const moved = receipt(files)
  moved.artifacts[0].exports[0].propsArgument = 2
  write(root, 'crease.lock.json', moved)
  const field = scope(root, '--baseline', 'HEAD')
  assert.equal(field.status, 1, field.stdout + field.stderr)
  assert.match(
    field.stdout,
    /changes propsArgument of src\/design\/row\.ts#row/u,
  )
  rmSync(root, { force: true, recursive: true })
})
