import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { fileOwners, sourceDependencies } from './registry-dependencies.mjs'

const root = process.cwd()
const directory = join(root, 'src', 'pleat')
const vendorDirectory = join(root, 'packages')
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const packageVersions = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}
const frameworkPackages = new Set([
  '@effect/platform-browser',
  '@foldkit/ui',
  '@pleat/core',
  '@pleat/foldkit',
  'effect',
  'foldkit',
])

const collectTypeScriptFiles = currentDirectory =>
  readdirSync(currentDirectory, { withFileTypes: true })
    .flatMap(entry => {
      const path = join(currentDirectory, entry.name)
      return entry.isDirectory()
        ? collectTypeScriptFiles(path)
        : entry.name.endsWith('.ts')
          ? [path]
          : []
    })
    .sort()

const indexSource = readFileSync(join(directory, 'index.ts'), 'utf8')
const publicFiles = new Set(
  [...indexSource.matchAll(/^export \* as \w+ from '\.\/([^']+)\.js'$/gm)].map(
    match => `${match[1]}.ts`,
  ),
)
const files = collectTypeScriptFiles(directory)
  .map(path => relative(directory, path).replaceAll('\\', '/'))
  .filter(path => path !== 'index.ts')

const itemName = path =>
  `pleat-${path.replace(/\.ts$/u, '').replaceAll(/[/.]/gu, '-')}`
const names = new Set()
for (const path of files) {
  const name = itemName(path)
  if (names.has(name)) throw new Error(`Duplicate Pleat registry item: ${name}`)
  names.add(name)
}

const title = value =>
  value
    .split('-')
    .map(part =>
      part === 'kbd' ? 'Kbd' : part[0].toUpperCase() + part.slice(1),
    )
    .join(' ')
const versionedPackages = packages =>
  [...packages]
    .filter(dependency => !frameworkPackages.has(dependency))
    .sort()
    .map(dependency =>
      packageVersions[dependency] === undefined
        ? dependency
        : `${dependency}@${packageVersions[dependency]}`,
    )

const items = files.map(path => {
  const name = itemName(path)
  const isComponent = publicFiles.has(path)
  return {
    name,
    type: isComponent ? 'registry:ui' : 'registry:lib',
    title: isComponent
      ? title(basename(path, '.ts'))
      : `Pleat ${title(path.replace(/\.ts$/u, '').replaceAll(/[/.]/gu, '-'))} Source`,
    description: isComponent
      ? `The Pleat ${title(basename(path, '.ts'))} component for Foldkit.`
      : `A shared Pleat source module used by Crease UI components.`,
    files: [
      {
        path,
        type: isComponent ? 'registry:ui' : 'registry:lib',
        target: `@ui/pleat/${path}`,
      },
    ],
  }
})

const vendorItems = [
  {
    package: 'pleat-core',
    source: join(root, 'packages', 'pleat-core'),
    target: '@lib/pleat/core',
    title: 'Pleat Core',
    name: 'pleat-core',
    dependencies: ['csstype@^3.2.3'],
  },
  {
    package: 'pleat-foldkit',
    source: join(root, 'packages', 'pleat-foldkit'),
    target: '@lib/pleat/foldkit',
    title: 'Pleat Foldkit',
    name: 'pleat-foldkit',
  },
].map(vendor => ({
  name: vendor.name,
  type: 'registry:lib',
  title: vendor.title,
  ...(vendor.dependencies ? { dependencies: vendor.dependencies } : {}),
  description: `The vendored @pleat/${vendor.package.replace('pleat-', '')} sources used by Pleat components. Pleat is not published to npm; install this item and map '@pleat/${vendor.package.replace('pleat-', '')}' to the installed ${vendor.target} sources (tsconfig paths or bundler alias).`,
  files: [
    // The ./server entry targets Foldkit's experimental SSR API and is not
    // needed by installed components.
    ...collectTypeScriptFiles(vendor.source)
      .filter(
        path =>
          relative(vendor.source, path).replaceAll('\\', '/') !==
          'src/server.ts',
      )
      .map(path => {
        const relativePath = relative(vendor.source, path).replaceAll('\\', '/')
        return {
          path: relative(vendorDirectory, path).replaceAll('\\', '/'),
          type: 'registry:lib',
          target: `${vendor.target}/${relativePath}`,
        }
      }),
    // Upstream attribution travels with the installed sources.
    ...['LICENSE', 'VENDORED.md'].map(file => ({
      path: relative(vendorDirectory, join(vendor.source, file)).replaceAll(
        '\\',
        '/',
      ),
      type: 'registry:file',
      target: `${vendor.target}/${file}`,
    })),
  ],
}))

const libraryRegistry = JSON.parse(
  readFileSync(join(root, 'src', 'lib', 'registry.json'), 'utf8'),
)
const owners = fileOwners(root, [
  { directory: 'src/lib', items: libraryRegistry.items },
  { directory: 'src/pleat', items },
])

for (const item of items) {
  if (vendorItems.some(vendor => vendor.name === item.name)) continue
  const sourcePath = join(directory, item.files[0].path)
  const graph = sourceDependencies(root, sourcePath, owners, item.name)
  const dependencies = versionedPackages(graph.packages)
  if (dependencies.length) item.dependencies = dependencies
  if (graph.registry.size)
    item.registryDependencies = [...graph.registry].sort()
  const source = readFileSync(sourcePath, 'utf8')
  if (source.includes("'@pleat/core'"))
    item.registryDependencies = [
      ...new Set([
        ...(item.registryDependencies ?? []),
        'Potti1234/creaseui/pleat-core',
      ]),
    ].sort()
  if (source.includes("'@pleat/foldkit'"))
    item.registryDependencies = [
      ...new Set([
        ...(item.registryDependencies ?? []),
        'Potti1234/creaseui/pleat-foldkit',
      ]),
    ].sort()
}

writeFileSync(
  join(directory, 'registry.json'),
  `${JSON.stringify(
    { $schema: 'https://ui.shadcn.com/schema/registry.json', items },
    null,
    2,
  )}\n`,
)

// shadcn rejects parent-directory traversal, so the vendored sources get
// their own manifest next to them in packages/.
writeFileSync(
  join(vendorDirectory, 'registry.json'),
  `${JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      items: vendorItems,
    },
    null,
    2,
  )}\n`,
)

console.log(
  `Generated ${items.length} Pleat registry items (${publicFiles.size} components).`,
)
