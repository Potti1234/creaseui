import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const fixture = mkdtempSync(join(tmpdir(), 'creaseui-registry-'))
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const registry = JSON.parse(readFileSync(join(root, 'src', 'ui', 'registry.json'), 'utf8'))
const componentNames = registry.items.map(item => item.name)
const sourcePackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const frameworkVersions = {
  '@effect/platform-browser': process.env.CREASEUI_PLATFORM_VERSION ?? sourcePackage.dependencies['@effect/platform-browser'],
  '@foldkit/ui': process.env.CREASEUI_FOLDKIT_UI_VERSION ?? sourcePackage.dependencies['@foldkit/ui'],
  effect: process.env.CREASEUI_EFFECT_VERSION ?? sourcePackage.dependencies.effect,
  foldkit: process.env.CREASEUI_FOLDKIT_VERSION ?? sourcePackage.dependencies.foldkit,
}

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: fixture,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

for (const file of ['tsconfig.json', 'vite.config.ts', 'index.html']) {
  cpSync(join(root, file), join(fixture, file))
}

writeFileSync(
  join(fixture, 'package.json'),
  `${JSON.stringify({
    name: 'creaseui-registry-consumer',
    private: true,
    type: 'module',
    scripts: sourcePackage.scripts,
    dependencies: {
      ...sourcePackage.dependencies,
      ...frameworkVersions,
    },
    devDependencies: sourcePackage.devDependencies,
  }, null, 2)}\n`,
)

mkdirSync(join(fixture, 'src'), { recursive: true })

writeFileSync(
  join(fixture, 'components.json'),
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

writeFileSync(join(fixture, 'src', 'styles.css'), '@import "tailwindcss";\n')
writeFileSync(
  join(fixture, 'src', 'vite-env.d.ts'),
  '/// <reference types="vite/client" />\n',
)
writeFileSync(
  join(fixture, 'src', 'entry.ts'),
  `import './styles.css'\n\n${componentNames
    .map((name, index) => `import * as Component${index} from '@/ui/${name}'`)
    .join('\n')}\n\nexport const installedComponents = [${componentNames
    .map((_name, index) => `Component${index}`)
    .join(', ')}]\n`,
)

run(npx, [
  '--yes',
  'shadcn@latest',
  'add',
  ...componentNames.map(name => `Potti1234/creaseui/${name}`),
  '--yes',
])
const installedPackage = JSON.parse(
  readFileSync(join(fixture, 'package.json'), 'utf8'),
)
for (const [packageName, expectedVersion] of Object.entries(frameworkVersions)) {
  assert.equal(
    installedPackage.dependencies[packageName],
    expectedVersion,
    `${packageName} was changed during registry installation`,
  )
}
run(npm, ['install'])
run(npm, ['run', 'typecheck'])
run(npm, ['run', 'build'])

console.log(`Registry installation verified in ${fixture}`)
