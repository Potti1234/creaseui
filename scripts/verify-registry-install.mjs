import assert from 'node:assert/strict'
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { moduleSpecifiers } from './registry-dependencies.mjs'

const root = process.cwd()
const fixture = mkdtempSync(join(tmpdir(), 'creaseui-registry-'))
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const registry = JSON.parse(
  readFileSync(join(root, 'src', 'ui', 'registry.json'), 'utf8'),
)
const recipes = JSON.parse(
  readFileSync(join(root, 'src/recipes/dashboard/registry.json'), 'utf8'),
)
const registryComponentNames = [...registry.items, ...recipes.items].map(
  item => item.name,
)
const requestedComponentNames = process.argv.slice(2)
const unknownComponentNames = requestedComponentNames.filter(
  name => !registryComponentNames.includes(name),
)
assert.deepEqual(
  unknownComponentNames,
  [],
  `Unknown registry components: ${unknownComponentNames.join(', ')}`,
)
const componentNames =
  requestedComponentNames.length === 0
    ? registryComponentNames
    : requestedComponentNames
const sourcePackage = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
)
const frameworkVersions = {
  '@effect/platform-browser':
    process.env.CREASEUI_PLATFORM_VERSION ??
    sourcePackage.dependencies['@effect/platform-browser'],
  '@foldkit/ui':
    process.env.CREASEUI_FOLDKIT_UI_VERSION ??
    sourcePackage.dependencies['@foldkit/ui'],
  effect:
    process.env.CREASEUI_EFFECT_VERSION ?? sourcePackage.dependencies.effect,
  foldkit:
    process.env.CREASEUI_FOLDKIT_VERSION ?? sourcePackage.dependencies.foldkit,
}

const registryOutput = join(root, '.registry')
const server = createServer((request, response) => {
  const name = request.url?.match(/^\/([a-z0-9-]+)\.json$/)?.[1]
  if (name === undefined) {
    response.writeHead(404).end()
    return
  }

  try {
    const item = JSON.parse(
      readFileSync(join(registryOutput, `${name}.json`), 'utf8'),
    )
    item.registryDependencies = (item.registryDependencies ?? []).map(
      dependency => {
        const dependencyName = dependency.match(/\/([^/]+)$/)?.[1]
        return dependencyName === undefined
          ? dependency
          : `http://127.0.0.1:${server.address().port}/${dependencyName}.json`
      },
    )
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(item))
  } catch {
    response.writeHead(404).end()
  }
})

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const address = server.address()
assert.notEqual(address, null)
assert.equal(typeof address, 'object')
const registryBaseUrl = `http://127.0.0.1:${address.port}`

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: fixture,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.once('error', reject)
    child.once('exit', code =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with code ${code ?? 'unknown'}`)),
    )
  })

for (const file of ['tsconfig.json']) {
  cpSync(join(root, file), join(fixture, file))
}

writeFileSync(
  join(fixture, 'package.json'),
  `${JSON.stringify(
    {
      name: 'creaseui-registry-consumer',
      private: true,
      type: 'module',
      scripts: {
        typecheck: 'tsc --noEmit',
        build: 'vite build',
      },
      dependencies: {
        ...frameworkVersions,
        tailwindcss: sourcePackage.dependencies.tailwindcss,
      },
      devDependencies: Object.fromEntries(
        ['vite', 'typescript', '@foldkit/vite-plugin', '@tailwindcss/vite'].map(
          name => [
            name,
            sourcePackage.devDependencies[name] ??
              sourcePackage.dependencies[name],
          ],
        ),
      ),
    },
    null,
    2,
  )}\n`,
)

mkdirSync(join(fixture, 'src'), { recursive: true })
writeFileSync(
  join(fixture, 'index.html'),
  '<html lang="en"><head><title>Registry consumer</title></head><body><div id="root"></div><script type="module" src="/src/entry.ts"></script></body></html>',
)
writeFileSync(
  join(fixture, 'vite.config.ts'),
  `
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { foldkit } from '@foldkit/vite-plugin'
export default defineConfig({
  plugins: [tailwindcss(), foldkit({ devToolsMcpPort: false })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
`,
)

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
    .map((name, index) =>
      name === 'dashboard-01'
        ? `import * as Component${index} from '@/components/crease-dashboard/entry'`
        : `import * as Component${index} from '@/ui/${name}'`,
    )
    .join('\n')}\n\nexport const installedComponents = [${componentNames
    .map((_name, index) => `Component${index}`)
    .join(', ')}]\n`,
)

try {
  await run(npx, [
    '--yes',
    'shadcn@latest',
    'add',
    ...componentNames.map(name => `${registryBaseUrl}/${name}.json`),
    '--yes',
  ])
  // Check what the CLI actually installed: wrong same-basename rewrites can
  // typecheck accidentally inside the source repo, but never in this fixture.
  const verifyImports = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name)
      if (entry.isDirectory()) verifyImports(file)
      else if (file.endsWith('.ts')) {
        for (const specifier of moduleSpecifiers(readFileSync(file, 'utf8'))) {
          if (!specifier.startsWith('@/') && !specifier.startsWith('.'))
            continue
          const target = specifier.startsWith('@/')
            ? resolve(fixture, 'src', specifier.slice(2))
            : resolve(dirname(file), specifier)
          assert.notEqual(
            `${target}.ts`,
            file,
            `${file} contains a self-import: ${specifier}`,
          )
          assert.ok(
            existsSync(target) || existsSync(`${target}.ts`),
            `${file} imports missing ${specifier}`,
          )
        }
      }
    }
  }
  verifyImports(join(fixture, 'src'))
  const installedPackage = JSON.parse(
    readFileSync(join(fixture, 'package.json'), 'utf8'),
  )
  for (const [packageName, expectedVersion] of Object.entries(
    frameworkVersions,
  )) {
    assert.equal(
      installedPackage.dependencies[packageName],
      expectedVersion,
      `${packageName} was changed during registry installation`,
    )
  }
  await run(npm, ['install'])
  if (requestedComponentNames.length === 0) {
    for (const iconLibrary of [
      'lucide',
      'hugeicons',
      'tabler',
      'phosphor',
      'remixicon',
    ]) {
      await run(npx, [
        '--yes',
        'shadcn@latest',
        'add',
        `${registryBaseUrl}/icons-${iconLibrary}.json`,
        '--yes',
        '--overwrite',
      ])
      assert.match(
        readFileSync(join(fixture, 'src', 'lib', 'icon.ts'), 'utf8'),
        new RegExp(`crease-icon-${iconLibrary}`),
        `${iconLibrary} adapter did not replace the consumer icon module`,
      )
      await run(npm, ['run', 'typecheck'])
    }
  }
  await run(npm, ['run', 'typecheck'])
  await run(npm, ['run', 'build'])

  console.log(`Registry installation verified in ${fixture}`)
} finally {
  server.close()
}
