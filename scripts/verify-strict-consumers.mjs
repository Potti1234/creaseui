#!/usr/bin/env node
// Installs real Crease registry components into one fresh consumer per
// renderer, installs the packed @creaseui/lint, lets `init` register the
// installed files, then lints ordinary strict settings/dashboard apps built
// only from those components, typechecks them and runs a production build.
import { execFileSync, spawn } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = fileURLToPath(new URL('..', import.meta.url))
const registryOutput = path.join(repo, '.registry')
if (!existsSync(registryOutput)) {
  console.error('MISSING: .registry (run `npm run registry:build` first)')
  process.exit(2)
}
const work = mkdtempSync(path.join(tmpdir(), 'creaseui-strict-consumers-'))
const source = JSON.parse(readFileSync(path.join(repo, 'package.json'), 'utf8'))
const dep = name =>
  source.dependencies?.[name] ?? source.devDependencies?.[name]
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const shell = process.platform === 'win32'

const ITEMS = [
  'button',
  'card',
  'chart',
  'form',
  'heading',
  'input',
  'label',
  'list',
  'section',
  'stack',
  'sidebar',
  'stat',
  'switch',
  'table',
  'text',
  'toggle-group',
]
const CONSUMERS = [
  { renderer: 'tailwind', prefix: '', components: 'src/ui', alias: '@/ui' },
  {
    renderer: 'stylex',
    prefix: 'stylex-',
    components: 'src/ui/stylex',
    alias: '@/ui/stylex',
  },
  {
    renderer: 'pleat',
    prefix: 'pleat-',
    components: 'src/ui/pleat',
    alias: '@/ui/pleat',
  },
]
const pleatAliases = {
  '@pleat/core': './src/lib/pleat/core/src/index.ts',
  '@pleat/foldkit': './src/lib/pleat/foldkit/src/index.ts',
}

const server = createServer((request, response) => {
  const name = request.url?.match(/^\/([a-z0-9-]+)\.json$/u)?.[1]
  const file = name && path.join(registryOutput, `${name}.json`)
  if (!file || !existsSync(file)) return void response.writeHead(404).end()
  const item = JSON.parse(readFileSync(file, 'utf8'))
  item.registryDependencies = (item.registryDependencies ?? []).map(
    dependency => {
      const dependencyName = dependency.match(/\/([^/]+)$/u)?.[1]
      return dependencyName === undefined
        ? dependency
        : `http://127.0.0.1:${server.address().port}/${dependencyName}.json`
    },
  )
  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(JSON.stringify(item))
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const registry = `http://127.0.0.1:${server.address().port}`

const failures = []
const expect = (label, condition, detail = '') => {
  console.log(`${condition ? 'ok  ' : 'FAIL'} ${label}`)
  if (!condition) failures.push(`${label}\n${detail}`)
}
const write = (file, content) => {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, content)
}
// Async: the registry server runs in this process and must keep answering.
const run = (cwd, command, args) =>
  new Promise(resolve => {
    const child = spawn(command, args, { cwd, shell })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => (stdout += chunk))
    child.stderr.on('data', chunk => (stderr += chunk))
    child.on('error', error =>
      resolve({ status: 1, stdout, stderr: String(error) }),
    )
    child.on('close', status => resolve({ status, stdout, stderr }))
  })

const tarball = execFileSync(
  npm,
  ['pack', '--silent', '--pack-destination', work],
  { cwd: path.join(repo, 'packages/lint'), encoding: 'utf8', shell },
).trim()

/* Each renderer's way of placing a component in its parent. */
const placement = {
  tailwind: { imports: '', definitions: '', prop: "class: 'w-full max-w-md'" },
  stylex: {
    imports: "import * as stylex from '@stylexjs/stylex'\n",
    definitions:
      "\nconst styles = stylex.create({ panel: { width: '100%', maxWidth: '28rem' } })\n",
    prop: 'layoutStyle: styles.panel',
  },
  pleat: {
    imports: "import { layoutStyle } from 'ALIAS/contracts'\n",
    definitions:
      "\nconst panel = layoutStyle({ width: '100%', maxWidth: '28rem' })\n",
    prop: 'layoutStyle: panel',
  },
}

const settingsApp = (alias, renderer) => {
  const place = placement[renderer]
  return `${place.imports.replace('ALIAS', alias)}import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '${alias}/button'
import { card, cardContent, cardDescription, cardHeader, cardTitle } from '${alias}/card'
import { input } from '${alias}/input'
import { label } from '${alias}/label'
import { stack } from '${alias}/stack'
import { switchControl } from '${alias}/switch'

${place.definitions}
export type SettingsModel = Readonly<{ name: string; digest: boolean; saved: boolean }>
export type SettingsEvents<M> = Readonly<{
  named: (value: string) => M
  toggled: (isChecked: boolean) => M
  saved: M
}>

export const settingsView = <M>(
  model: SettingsModel,
  on: SettingsEvents<M>,
  h: HtmlBuilder<M>,
): Html =>
  card(
    {
      ${place.prop},
      children: [
        cardHeader(
          {
            children: [
              cardTitle({ children: ['Profile'] }, h),
              cardDescription({ children: [model.saved ? 'Saved' : 'Public details'] }, h),
            ],
          },
          h,
        ),
        cardContent(
          {
            children: [
              stack(
                {
                  gap: 3,
                  children: [
                    label({ for: 'display-name', children: ['Display name'] }, h),
                    input({ id: 'display-name', value: model.name, onInput: on.named }, h),
                    switchControl(
                      { id: 'digest', label: 'Weekly digest', isChecked: model.digest, onToggle: on.toggled },
                      h,
                    ),
                    button({ variant: 'outline', onClick: on.saved, children: ['Save'] }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
`
}

/* Consumer finding: the public `init` must build the whole model, so an
   app never fills in internals such as `maybeFocusedIndex`. */
const rangeApp = alias => `import type { Html, HtmlBuilder } from 'foldkit/html'

import * as ToggleGroup from '${alias}/toggle-group'

export const initialRange: ToggleGroup.Model = ToggleGroup.init({ id: 'range' })

export const rangeView = <M>(
  model: ToggleGroup.Model,
  toParentMessage: (message: ToggleGroup.Message) => M,
  range: '7d' | '30d',
  h: HtmlBuilder<M>,
): Html =>
  ToggleGroup.toggleGroup(
    {
      model,
      toParentMessage,
      ariaLabel: 'Range',
      value: range,
      items: [
        { value: '7d', children: ['7 days'] },
        { value: '30d', children: ['30 days'] },
      ],
    },
    h,
  )
`

const dashboardApp =
  alias => `import type { Html, HtmlBuilder } from 'foldkit/html'

import { barChart, chartContainer } from '${alias}/chart'
import { heading } from '${alias}/heading'
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuItem,
  sidebarProvider,
} from '${alias}/sidebar'
import { stack } from '${alias}/stack'
import { stat } from '${alias}/stat'
import {
  table,
  tableBody,
  tableCell,
  tableHead,
  tableHeader,
  tableRow,
} from '${alias}/table'
import { text } from '${alias}/text'

const STATS = [
  { label: 'Total revenue', value: '$1.28M', delta: { value: '+12.4%', direction: 'up' } },
  { label: 'Error rate', value: '0.42%', delta: { value: '-0.08%', direction: 'down' } },
] as const
const REGIONS = [
  { region: 'Europe', revenue: '$412k' },
  { region: 'Americas', revenue: '$655k' },
] as const
const MONTHS = [
  { label: 'Jan', value: 186 },
  { label: 'Feb', value: 305 },
  { label: 'Mar', value: 237 },
] as const

const navigation = <M>(h: HtmlBuilder<M>): Html =>
  sidebar(
    {
      collapsible: 'none',
      children: [
        sidebarContent(
          {
            children: [
              sidebarGroup(
                {
                  children: [
                    sidebarMenu(
                      {
                        children: ['Overview', 'Customers'].map((label, index) =>
                          sidebarMenuItem(
                            {
                              children: [
                                sidebarMenuButton(
                                  { href: '#' + label.toLowerCase(), isActive: index === 0, children: [label] },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                        ),
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

const regions = <M>(h: HtmlBuilder<M>): Html =>
  table(
    {
      ariaLabel: 'Revenue by region',
      children: [
        tableHeader(
          {
            children: [
              tableRow(
                {
                  children: [
                    tableHead({ children: ['Region'] }, h),
                    tableHead({ children: ['Revenue'] }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        tableBody(
          {
            children: REGIONS.map(row =>
              tableRow(
                {
                  children: [
                    tableCell({ children: [row.region] }, h),
                    tableCell({ children: [row.revenue] }, h),
                  ],
                },
                h,
              ),
            ),
          },
          h,
        ),
      ],
    },
    h,
  )

export const dashboardView = <M>(h: HtmlBuilder<M>): Html =>
  sidebarProvider(
    {
      children: [
        navigation(h),
        stack(
          {
            gap: 4,
            children: [
              heading({ level: 2, children: ['Overview'] }, h),
              text({ color: 'secondary', children: ['Last 30 days'] }, h),
              stack(
                {
                  direction: 'horizontal',
                  gap: 4,
                  children: STATS.map(entry =>
                    stat({ label: entry.label, value: entry.value, delta: entry.delta }, h),
                  ),
                },
                h,
              ),
              chartContainer(
                {
                  ariaLabel: 'Monthly revenue',
                  config: { value: { label: 'Revenue', color: 'var(--chart-1)' } },
                  children: [barChart({ data: MONTHS }, h)],
                },
                h,
              ),
              regions(h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
`

const mainApp = `import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import { stack } from 'ALIAS/stack'
import { dashboardView } from './dashboard'
import { settingsView } from './settings'

const Model = S.Struct({ name: S.String, digest: S.Boolean, saved: S.Boolean })
type Model = typeof Model.Type
const Message = defineMessageUnion({
  Named: { value: S.String },
  Toggled: { isChecked: S.Boolean },
  Saved: {},
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) => {
  switch (message._tag) {
    case 'Named':
      return { model: { ...model, name: message.value, saved: false } }
    case 'Toggled':
      return { model: { ...model, digest: message.isChecked, saved: false } }
    case 'Saved':
      return { model: { ...model, saved: true } }
  }
}

const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  stack(
    {
      gap: 6,
      children: [
        settingsView(
          model,
          {
            named: value => Message.Named({ value }),
            toggled: isChecked => Message.Toggled({ isChecked }),
            saved: Message.Saved(),
          },
          h,
        ),
        dashboardView(h),
      ],
    },
    h,
  )

export const start = () =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: { name: 'Ada', digest: false, saved: false } }),
      update,
      view,
      container: document.getElementById('root'),
      devTools: false,
    }),
  )
`

const badApp = `import type { Html, HtmlBuilder } from 'foldkit/html'
import { button } from 'ALIAS/button'

export const view = <M>(h: HtmlBuilder<M>): Html =>
  h.section([h.Class('p-4')], [h.input([]), button({ class: 'text-red-500', children: ['Bad'] } as never, h)])
`

try {
  for (const consumer of CONSUMERS) {
    const root = path.join(work, consumer.renderer)
    const label = text => `${consumer.renderer}: ${text}`
    mkdirSync(root, { recursive: true })
    const tsconfig = JSON.parse(
      readFileSync(path.join(repo, 'tsconfig.json'), 'utf8'),
    )
    tsconfig.compilerOptions.paths = {
      '@/*': ['./src/*'],
      ...(consumer.renderer === 'pleat'
        ? Object.fromEntries(
            Object.entries(pleatAliases).map(([name, target]) => [
              name,
              [target],
            ]),
          )
        : {}),
    }
    tsconfig.include = ['src']
    delete tsconfig.references
    delete tsconfig.files
    write(
      path.join(root, 'tsconfig.json'),
      `${JSON.stringify(tsconfig, null, 2)}\n`,
    )
    cpSync(
      path.join(repo, 'stylex.config.js'),
      path.join(root, 'stylex.config.js'),
    )
    write(
      path.join(root, 'package.json'),
      `${JSON.stringify(
        {
          name: `strict-consumer-${consumer.renderer}`,
          private: true,
          type: 'module',
          dependencies: Object.fromEntries(
            [
              '@effect/platform-browser',
              '@foldkit/ui',
              'effect',
              'foldkit',
              'tailwindcss',
            ].map(name => [name, dep(name)]),
          ),
          devDependencies: {
            ...Object.fromEntries(
              [
                'vite',
                'typescript',
                'eslint',
                '@foldkit/vite-plugin',
                '@tailwindcss/vite',
                '@stylexjs/unplugin',
              ].map(name => [name, dep(name)]),
            ),
            '@creaseui/lint': `file:${path.join(work, tarball)}`,
          },
        },
        null,
        2,
      )}\n`,
    )
    write(
      path.join(root, 'components.json'),
      `${JSON.stringify(
        {
          $schema: 'https://ui.shadcn.com/schema.json',
          style: 'new-york',
          rsc: false,
          tsx: true,
          tailwind: {
            config: '',
            css: 'src/styles.css',
            baseColor: 'neutral',
            cssVariables: true,
          },
          aliases: {
            components: '@/components',
            utils: '@/lib/utils',
            ui: '@/ui',
            lib: '@/lib',
            hooks: '@/hooks',
          },
        },
        null,
        2,
      )}\n`,
    )
    cpSync(path.join(repo, 'src/theme.css'), path.join(root, 'src/theme.css'))
    write(
      path.join(root, 'src/styles.css'),
      consumer.renderer === 'tailwind'
        ? '@import "tailwindcss";\n@import "./theme.css";\n'
        : '@import "./theme.css";\n',
    )
    write(
      path.join(root, 'src/vite-env.d.ts'),
      '/// <reference types="vite/client" />\n',
    )
    write(
      path.join(root, 'index.html'),
      '<html lang="en"><head><title>Strict consumer</title></head><body><div id="root"></div><script type="module" src="/src/entry.ts"></script></body></html>',
    )
    write(
      path.join(root, 'src/entry.ts'),
      "import './styles.css'\nimport { start } from './app/main'\n\nstart()\n",
    )
    write(
      path.join(root, 'vite.config.ts'),
      `import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
${consumer.renderer === 'tailwind' ? "import tailwindcss from '@tailwindcss/vite'\n" : ''}${consumer.renderer === 'stylex' ? "import stylex from '@stylexjs/unplugin'\nimport { stylexCompilerOptions } from './stylex.config.js'\n" : ''}import { foldkit } from '@foldkit/vite-plugin'
export default defineConfig({
  plugins: [${consumer.renderer === 'tailwind' ? 'tailwindcss(), ' : ''}${consumer.renderer === 'stylex' ? 'stylex.vite(stylexCompilerOptions), ' : ''}foldkit({ devToolsMcpPort: false })],
  resolve: {
    alias: {
${Object.entries(pleatAliases)
  .map(
    ([name, target]) =>
      `      '${name}': fileURLToPath(new URL('${target}', import.meta.url)),`,
  )
  .join('\n')}
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
`,
    )

    const add = await run(root, npx, [
      '--yes',
      'shadcn@latest',
      'add',
      ...ITEMS.map(item => `${registry}/${consumer.prefix}${item}.json`),
      '--yes',
    ])
    expect(label('registry install'), add.status === 0, add.stdout + add.stderr)
    if (add.status !== 0) continue
    const install = await run(root, npm, [
      'install',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
    ])
    expect(label('npm install'), install.status === 0, install.stderr)
    if (install.status !== 0) continue

    write(
      path.join(root, 'src/app/settings.ts'),
      settingsApp(consumer.alias, consumer.renderer),
    )
    write(path.join(root, 'src/app/dashboard.ts'), dashboardApp(consumer.alias))
    write(path.join(root, 'src/app/range.ts'), rangeApp(consumer.alias))
    write(
      path.join(root, 'src/app/main.ts'),
      mainApp.replace('ALIAS', consumer.alias),
    )

    const bin = path.join(
      root,
      'node_modules/@creaseui/lint/bin/creaseui-lint.js',
    )
    const init = await run(root, process.execPath, [
      bin,
      'init',
      '--renderer',
      consumer.renderer,
      '--components',
      consumer.components,
      '--components',
      'src/lib',
    ])
    expect(
      label('init registers the installed components'),
      init.status === 0,
      init.stdout + init.stderr,
    )
    const doctor = await run(root, process.execPath, [bin, 'doctor'])
    expect(
      label('doctor finds no uncovered rendering exports'),
      doctor.status === 0 && /0 uncovered UI modules/u.test(doctor.stdout),
      doctor.stdout + doctor.stderr,
    )
    const lock = JSON.parse(
      readFileSync(path.join(root, 'crease.lock.json'), 'utf8'),
    )
    const contracted = lock.artifacts.flatMap(artifact =>
      artifact.exports.filter(
        entry =>
          entry.visibility !== 'implementation' &&
          (entry.renderKind ?? 'helper') === 'helper',
      ),
    )
    write(
      path.join(root, 'src/probe/every-export.ts'),
      `import type { Html, HtmlBuilder } from 'foldkit/html'\n${contracted
        .map(
          (entry, index) =>
            `import { ${entry.name} as probe${index} } from '@/${entry.file.replace(/^src\//u, '').replace(/\.ts$/u, '')}'`,
        )
        .join(
          '\n',
        )}\n\nexport const views = (h: HtmlBuilder<unknown>): ReadonlyArray<Html> => [\n${contracted
        .map(
          (_entry, index) =>
            `  probe${index}({ children: ['Bad'], class: 'bg-red-500 text-3xl p-0' }, h),`,
        )
        .join('\n')}\n]\n`,
    )
    const eslint = path.join(root, 'node_modules/eslint/bin/eslint.js')
    const good = await run(root, process.execPath, [
      eslint,
      '--format',
      'json',
      '--ignore-pattern',
      'src/probe/**',
      '.',
    ])
    const goodMessages =
      good.stdout.trim() === ''
        ? []
        : JSON.parse(good.stdout).flatMap(result =>
            result.messages.map(
              message =>
                `${path.basename(result.filePath)}:${message.line} ${message.ruleId ?? 'parse'} ${message.message}`,
            ),
          )
    expect(
      label(
        'the whole project (installed sources, setup entry and settings/dashboard apps) passes strict lint',
      ),
      good.status === 0 && goodMessages.length === 0,
      `${goodMessages.join('\n')}\n${good.stderr}`,
    )
    write(
      path.join(root, 'src/app/bad.ts'),
      badApp.replace('ALIAS', consumer.alias),
    )
    const bad = await run(root, process.execPath, [
      eslint,
      '--format',
      'json',
      'src/app/bad.ts',
    ])
    const badRules =
      bad.stdout.trim() === ''
        ? []
        : [
            ...new Set(
              JSON.parse(bad.stdout).flatMap(result =>
                result.messages.map(message => message.ruleId),
              ),
            ),
          ].sort()
    expect(
      label('raw rendering, ad hoc classes and asserted props fail'),
      bad.status === 1 &&
        [
          'crease/no-application-styles',
          'crease/no-raw-composition',
          'crease/no-raw-controls',
          'crease/no-unverifiable-ui',
        ].every(rule => badRules.includes(rule)),
      JSON.stringify(badRules),
    )
    rmSync(path.join(root, 'src/app/bad.ts'))
    const every = await run(root, process.execPath, [
      eslint,
      '--format',
      'json',
      'src/probe/every-export.ts',
    ])
    const flagged = new Set(
      every.stdout.trim() === ''
        ? []
        : JSON.parse(every.stdout).flatMap(result =>
            result.messages.map(message => message.line),
          ),
    )
    const lines = readFileSync(
      path.join(root, 'src/probe/every-export.ts'),
      'utf8',
    ).split('\n')
    const missed = contracted.filter((_entry, index) => {
      const line =
        lines.findIndex(text => text.startsWith(`  probe${index}(`)) + 1
      return !flagged.has(line)
    })
    expect(
      label(
        `every contracted export (${contracted.length}) rejects an ad hoc class`,
      ),
      contracted.length > 0 && missed.length === 0,
      missed.map(entry => entry.name).join(', '),
    )
    rmSync(path.join(root, 'src/probe/every-export.ts'))

    const types = await run(root, npx, [
      'tsc',
      '--noEmit',
      '-p',
      'tsconfig.json',
    ])
    expect(
      label('consumer typecheck'),
      types.status === 0,
      types.stdout + types.stderr,
    )
    const build = await run(root, npx, ['vite', 'build'])
    expect(
      label('production build'),
      build.status === 0,
      build.stdout + build.stderr,
    )
    const assets = path.join(root, 'dist/assets')
    const css = existsSync(assets)
      ? readdirSync(assets)
          .filter(file => file.endsWith('.css'))
          .map(file => readFileSync(path.join(assets, file), 'utf8'))
          .join('\n')
      : ''
    const scripts = existsSync(assets)
      ? readdirSync(assets)
          .filter(file => file.endsWith('.js'))
          .map(file => readFileSync(path.join(assets, file), 'utf8'))
          .join('\n')
      : ''
    // Pleat emits its rules at runtime from the bundle; the others ship CSS.
    expect(
      label('production styles ship with the build'),
      consumer.renderer === 'pleat'
        ? /data-slot/u.test(scripts) && /--background/u.test(css + scripts)
        : css.length > 2000 && /--background/u.test(css),
      `css ${css.length} bytes`,
    )
  }
} finally {
  server.close()
}

if (process.env.KEEP_CONSUMERS === undefined)
  rmSync(work, { force: true, recursive: true })
else console.log(`kept ${work}`)
if (failures.length > 0) {
  console.error(`\n${failures.join('\n\n')}`)
  process.exit(1)
}
