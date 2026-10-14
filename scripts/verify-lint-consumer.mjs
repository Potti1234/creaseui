#!/usr/bin/env node
// Packs @creaseui/lint and runs init, doctor and strict ESLint in fresh
// consumers (one per renderer, different component dirs, aliases and
// package managers) outside this repository.
import { execFileSync, spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = fileURLToPath(new URL('..', import.meta.url))
const work = mkdtempSync(path.join(tmpdir(), 'creaseui-lint-consumers-'))
const versions = JSON.parse(
  readFileSync(path.join(repo, 'package.json'), 'utf8'),
)
const dep = name =>
  versions.dependencies?.[name] ?? versions.devDependencies?.[name]
/* Package managers are launched as `node <cli.js>` so this works on Windows,
   where `npm`/`pnpm` on PATH are .cmd shims that spawn cannot execute. */
const nodeCli = (name, relative) => {
  const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)
  const nodeDir = path.dirname(process.execPath)
  const candidates = [
    process.env.npm_execpath,
    ...[nodeDir, ...dirs].flatMap(dir => [
      path.join(dir, 'node_modules', relative),
      path.join(dir, '..', 'lib', 'node_modules', relative),
    ]),
    ...dirs
      .map(dir => path.join(dir, name))
      .filter(file => existsSync(file))
      .map(file => realpathSync(file)),
  ]
  return candidates.find(
    file =>
      file !== undefined &&
      /\.c?js$/u.test(file) &&
      file.replaceAll('\\', '/').includes(`/${name}/`) &&
      existsSync(file),
  )
}
const npmCli = nodeCli('npm', 'npm/bin/npm-cli.js')
const pnpmCli = nodeCli('pnpm', 'pnpm/bin/pnpm.cjs')
if (npmCli === undefined) {
  console.error(
    'MISSING: npm CLI (npm-cli.js) not found next to node or on PATH',
  )
  process.exit(2)
}
const missing = []

const tarball = execFileSync(
  process.execPath,
  [npmCli, 'pack', '--silent', '--pack-destination', work],
  {
    cwd: path.join(repo, 'packages/lint'),
    encoding: 'utf8',
  },
).trim()

const managers = {
  npm: [
    process.execPath,
    [npmCli, 'install', '--no-audit', '--no-fund', '--loglevel=error'],
  ],
}
if (
  pnpmCli !== undefined &&
  spawnSync(process.execPath, [pnpmCli, '--version']).status === 0
)
  managers.pnpm = [process.execPath, [pnpmCli, 'install', '--silent']]
else
  missing.push(
    'pnpm: not found, so the pnpm consumer was installed with npm and pnpm resolution is NOT verified',
  )

const consumers = [
  {
    alias: '@ui',
    components: 'src/components/ui',
    manager: 'npm',
    renderer: 'tailwind',
    typedJs: false,
  },
  {
    alias: '~design',
    components: 'src/design',
    manager: 'npm',
    renderer: 'stylex',
    typedJs: true,
  },
  {
    alias: '#crease',
    components: 'lib/crease',
    manager: managers.pnpm ? 'pnpm' : 'npm',
    renderer: 'pleat',
    typedJs: false,
  },
]

const header = "import type { Html, HtmlBuilder } from 'foldkit/html'\n"
const write = (file, content) => {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, content)
}
const failures = []
const expect = (label, condition, detail = '') => {
  console.log(`${condition ? 'ok  ' : 'FAIL'} ${label}`)
  if (!condition) failures.push(`${label}\n${detail}`)
}

for (const consumer of consumers) {
  const root = path.join(work, consumer.renderer)
  const components = path.join(root, consumer.components)
  write(
    path.join(root, 'package.json'),
    JSON.stringify(
      {
        name: `consumer-${consumer.renderer}`,
        private: true,
        type: 'module',
        devDependencies: {
          '@creaseui/lint': `file:${path.join(work, tarball)}`,
          eslint: dep('eslint'),
          foldkit: dep('foldkit'),
          effect: dep('effect'),
          typescript: dep('typescript'),
        },
      },
      null,
      2,
    ),
  )
  write(
    path.join(root, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          allowJs: true,
          checkJs: true,
          module: 'ESNext',
          moduleResolution: 'Bundler',
          noEmit: true,
          paths: { [`${consumer.alias}/*`]: [`./${consumer.components}/*`] },
          skipLibCheck: true,
          strict: true,
          target: 'ES2022',
        },
        include: ['src', 'lib'],
      },
      null,
      2,
    ),
  )
  write(
    path.join(components, 'button.ts'),
    `${header}export const button = <M>(props: { variant?: 'default' | 'outline'; children: ReadonlyArray<string> }, h: HtmlBuilder<M>): Html =>\n  h.button([h.DataAttribute('slot', 'button')], [...props.children])\n`,
  )
  write(
    path.join(components, 'stack.ts'),
    `${header}export const stack = <M>(props: { children: ReadonlyArray<Html> }, h: HtmlBuilder<M>): Html =>\n  h.div([h.DataAttribute('slot', 'stack')], [...props.children])\n`,
  )
  write(
    path.join(root, 'src/app/good.ts'),
    `${header}import { button } from '${consumer.alias}/button'\nimport { stack } from '${consumer.alias}/stack'\nexport const view = <M>(h: HtmlBuilder<M>): Html => stack({ children: [button({ variant: 'outline', children: ['Save'] }, h)] }, h)\n`,
  )
  write(
    path.join(root, 'src/app/bad.ts'),
    `${header}export const view = <M>(h: HtmlBuilder<M>): Html => h.section([h.Class('p-4')], [h.button([], ['x'])])\n`,
  )
  if (consumer.typedJs)
    write(
      path.join(root, 'src/app/typed.js'),
      `/** @template M @param {import('foldkit/html').HtmlBuilder<M>} h */\nexport const view = h => h.input([], [])\n`,
    )

  const [command, args] = managers[consumer.manager]
  const install = spawnSync(command, args, { cwd: root, encoding: 'utf8' })
  expect(
    `${consumer.renderer}: ${consumer.manager} install`,
    install.status === 0,
    install.stderr,
  )
  if (install.status !== 0) continue
  const bin = path.join(
    root,
    'node_modules/@creaseui/lint/bin/creaseui-lint.js',
  )
  const init = spawnSync(
    process.execPath,
    [
      bin,
      'init',
      '--renderer',
      consumer.renderer,
      '--components',
      consumer.components,
    ],
    { cwd: root, encoding: 'utf8' },
  )
  expect(
    `${consumer.renderer}: init`,
    init.status === 0,
    init.stdout + init.stderr,
  )
  const doctor = spawnSync(process.execPath, [bin, 'doctor'], {
    cwd: root,
    encoding: 'utf8',
  })
  expect(
    `${consumer.renderer}: doctor`,
    doctor.status === 0 && /0 uncovered UI modules/u.test(doctor.stdout),
    doctor.stdout + doctor.stderr,
  )
  const eslint = path.join(root, 'node_modules/eslint/bin/eslint.js')
  const good = spawnSync(
    process.execPath,
    [eslint, 'src/app/good.ts', consumer.components],
    { cwd: root, encoding: 'utf8' },
  )
  expect(
    `${consumer.renderer}: approved composition and registered implementation pass`,
    good.status === 0,
    good.stdout + good.stderr,
  )
  const bad = spawnSync(
    process.execPath,
    [eslint, '--format', 'json', 'src/app'],
    { cwd: root, encoding: 'utf8' },
  )
  const rules =
    bad.status === 1
      ? JSON.parse(bad.stdout)
          .flatMap(result =>
            result.messages.map(
              message => `${path.basename(result.filePath)}:${message.ruleId}`,
            ),
          )
          .sort()
      : []
  const wanted = [
    'bad.ts:crease/no-application-styles',
    'bad.ts:crease/no-raw-composition',
    'bad.ts:crease/no-raw-controls',
    ...(consumer.typedJs ? ['typed.js:crease/no-raw-controls'] : []),
  ].sort()
  expect(
    `${consumer.renderer}: raw rendering and styles fail (${wanted.length} diagnostics)`,
    JSON.stringify(rules) === JSON.stringify(wanted),
    `${JSON.stringify(rules)}\n${bad.stderr}`,
  )
  const types = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import { creaseui, STRICT_RULE_IDS } from '@creaseui/lint'; if (typeof creaseui !== 'function' || STRICT_RULE_IDS.length !== 6) process.exit(1)",
    ],
    { cwd: root, encoding: 'utf8' },
  )
  expect(
    `${consumer.renderer}: public exports`,
    types.status === 0,
    types.stderr,
  )
}

if (process.env.KEEP_CONSUMERS === undefined)
  rmSync(work, { force: true, recursive: true })
else console.log(`kept ${work}`)
for (const gap of missing) console.warn(`MISSING COVERAGE: ${gap}`)
if (missing.length > 0 && process.env.CREASE_REQUIRE_ALL_MANAGERS === '1')
  failures.push(`missing package-manager coverage:\n${missing.join('\n')}`)
if (failures.length > 0) {
  console.error(`\n${failures.join('\n\n')}`)
  process.exit(1)
}
