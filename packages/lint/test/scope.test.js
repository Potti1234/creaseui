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

test('scope ignores line-ending-only differences', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-scope-crlf-'))
  const git = (...args) =>
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args],
      { cwd: root },
    )
  git('init', '-q')
  write(root, 'crease.lock.json', receipt([]))
  write(root, 'package.json', { scripts: { lint: 'eslint .' } })
  write(root, 'eslint.config.js', 'export default []\n')
  git('add', '.')
  git('commit', '-q', '-m', 'baseline')

  /* Working tree checked out with CRLF (core.autocrlf), content unchanged. */
  const crlf = name => {
    const absolute = path.join(root, name)
    const text = execFileSync('git', ['show', `HEAD:./${name}`], {
      cwd: root,
      encoding: 'utf8',
    })
    writeFileSync(absolute, text.replace(/\r?\n/gu, '\r\n'))
  }
  for (const name of ['crease.lock.json', 'package.json', 'eslint.config.js'])
    crlf(name)
  const clean = scope(root, '--baseline', 'HEAD')
  assert.equal(clean.status, 0, clean.stdout + clean.stderr)

  writeFileSync(
    path.join(root, 'eslint.config.js'),
    "export default [{ ignores: ['src/design/**'] }]\r\n",
  )
  const loosened = scope(root, '--baseline', 'HEAD')
  assert.equal(loosened.status, 1, loosened.stdout + loosened.stderr)
  assert.match(loosened.stdout, /changes eslint\.config\.js/u)
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

/* Review F4: the packages that select the lint implementation are
   enforcement inputs too. */
test('scope tracks lint dependency specs, lockfiles and local artifacts', async () => {
  const { enforcementChanges } = await import('../lib/strict/scope.js')
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-scope-deps-'))
  const git = (...args) =>
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args],
      { cwd: root },
    )
  git('init', '-q')
  const manifest = spec => ({
    devDependencies: { '@creaseui/lint': spec, 'left-pad': '1.0.0' },
    name: 'app',
  })
  const lock = (resolved, leftPad = '1.0.0') => ({
    lockfileVersion: 3,
    packages: {
      '': { devDependencies: { '@creaseui/lint': 'file:vendor/lint.tgz' } },
      'node_modules/@creaseui/lint': { resolved, version: '0.1.0' },
      'node_modules/left-pad': { version: leftPad },
    },
  })
  mkdirSync(path.join(root, 'vendor'))
  write(root, 'package.json', manifest('file:vendor/lint.tgz'))
  write(root, 'package-lock.json', lock('file:vendor/lint.tgz'))
  writeFileSync(path.join(root, 'vendor/lint.tgz'), Buffer.from([1, 2, 3]))
  writeFileSync(path.join(root, 'vendor/previous-lint.tgz'), Buffer.from([4]))
  git('add', '.')
  git('commit', '-qm', 'baseline')
  const changes = () => enforcementChanges({ baseline: 'HEAD', rootDir: root })
  assert.deepEqual(changes(), [])

  /* unrelated dependency updates stay out of scope */
  write(root, 'package-lock.json', lock('file:vendor/lint.tgz', '1.3.0'))
  assert.deepEqual(changes(), [])
  git('checkout', '-q', '--', '.')

  writeFileSync(path.join(root, 'vendor/lint.tgz'), Buffer.from([9, 9, 9]))
  assert.deepEqual(changes(), [
    'changes the local lint/policy package vendor/lint.tgz',
  ])
  git('checkout', '-q', '--', '.')

  write(root, 'package.json', manifest('file:vendor/previous-lint.tgz'))
  assert.match(
    changes().join('\n'),
    /package\.json changes devDependencies @creaseui\/lint/u,
  )
  git('checkout', '-q', '--', '.')

  write(root, 'package-lock.json', lock('file:vendor/previous-lint.tgz'))
  assert.deepEqual(changes(), [
    'package-lock.json changes the resolved lint/policy packages',
  ])
  rmSync(root, { force: true, recursive: true })
})

test('scope compares complete text lockfile records, not only named lines', async () => {
  const { enforcementChanges } = await import('../lib/strict/scope.js')
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-scope-text-lock-'))
  const git = (...args) =>
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args],
      { cwd: root },
    )
  git('init', '-q')
  const pnpm = ({
    integrity = 'sha512-AAAA',
    leftPad = '1.0.0',
    override = '0.1.0',
    patch = 'aaaa',
  } = {}) =>
    [
      "lockfileVersion: '9.0'",
      '',
      'overrides:',
      `  '@creaseui/lint': ${override}`,
      '',
      'patchedDependencies:',
      '  eslint-plugin-x@1.0.0:',
      `    hash: ${patch}`,
      '    path: patches/eslint-plugin-x.patch',
      '',
      'importers:',
      '  .:',
      '    devDependencies:',
      "      '@creaseui/lint':",
      '        specifier: 0.1.0',
      '        version: 0.1.0',
      '      left-pad:',
      `        specifier: ${leftPad}`,
      `        version: ${leftPad}`,
      '',
      'packages:',
      "  '@creaseui/lint@0.1.0':",
      `    resolution: {integrity: ${integrity}}`,
      '',
      `  left-pad@${leftPad}:`,
      `    resolution: {integrity: sha512-${leftPad}}`,
      '',
    ].join('\n')
  const yarn = (resolved = 'lint-a.tgz') =>
    [
      '"@creaseui/lint@0.1.0":',
      '  version "0.1.0"',
      `  resolved "https://registry.example/${resolved}#abc"`,
      '  integrity sha512-BBBB',
      '',
    ].join('\n')
  const bun = (integrity = 'sha512-CCCC') =>
    [
      '{',
      '  "packages": {',
      '    "@creaseui/lint": [',
      '      "@creaseui/lint@0.1.0",',
      '      "",',
      '      {},',
      `      "${integrity}"`,
      '    ],',
      '  }',
      '}',
      '',
    ].join('\n')
  write(root, 'package.json', { name: 'app' })
  writeFileSync(path.join(root, 'pnpm-lock.yaml'), pnpm())
  writeFileSync(path.join(root, 'yarn.lock'), yarn())
  writeFileSync(path.join(root, 'bun.lock'), bun())
  git('add', '.')
  git('commit', '-qm', 'baseline')
  const changes = () => enforcementChanges({ baseline: 'HEAD', rootDir: root })
  assert.deepEqual(changes(), [])

  /* Unrelated packages stay out of scope. */
  writeFileSync(path.join(root, 'pnpm-lock.yaml'), pnpm({ leftPad: '1.3.0' }))
  assert.deepEqual(changes(), [])
  git('checkout', '-q', '--', '.')

  for (const [file, text] of [
    /* Review F4: the archive integrity changes on a line that doesn't name
       the package. */
    ['pnpm-lock.yaml', pnpm({ integrity: 'sha512-ZZZZ' })],
    ['pnpm-lock.yaml', pnpm({ override: '0.2.0' })],
    ['pnpm-lock.yaml', pnpm({ patch: 'bbbb' })],
    ['yarn.lock', yarn('lint-b.tgz')],
    ['bun.lock', bun('sha512-DDDD')],
  ]) {
    writeFileSync(path.join(root, file), text)
    assert.deepEqual(
      changes(),
      [`${file} changes the resolved lint/policy packages`],
      text,
    )
    git('checkout', '-q', '--', '.')
  }
  rmSync(root, { force: true, recursive: true })
})
