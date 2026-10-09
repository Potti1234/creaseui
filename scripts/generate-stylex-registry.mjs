import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { fileOwners, sourceDependencies } from './registry-dependencies.mjs'

const root = process.cwd()
const directory = join(root, 'src', 'stylex')
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const packageVersions = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}
const frameworkPackages = new Set([
  '@effect/platform-browser',
  '@foldkit/ui',
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
  `stylex-${path.replace(/\.ts$/u, '').replaceAll(/[/.]/gu, '-')}`
const names = new Set()
for (const path of files) {
  const name = itemName(path)
  if (names.has(name))
    throw new Error(`Duplicate StyleX registry item: ${name}`)
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
      : `StyleX ${title(path.replace(/\.ts$/u, '').replaceAll(/[/.]/gu, '-'))} Source`,
    description: isComponent
      ? `The StyleX ${title(basename(path, '.ts'))} component for Foldkit.`
      : `A shared StyleX source module used by Crease UI components.`,
    files: [
      {
        path,
        type: isComponent ? 'registry:ui' : 'registry:lib',
        target: `@ui/stylex/${path}`,
      },
    ],
  }
})

const libraryRegistry = JSON.parse(
  readFileSync(join(root, 'src', 'lib', 'registry.json'), 'utf8'),
)
const owners = fileOwners(root, [
  { directory: 'src/lib', items: libraryRegistry.items },
  { directory: 'src/stylex', items },
])

for (const item of items) {
  const sourcePath = join(directory, item.files[0].path)
  const graph = sourceDependencies(root, sourcePath, owners, item.name)
  const dependencies = versionedPackages(graph.packages)
  if (dependencies.length) item.dependencies = dependencies
  if (graph.registry.size)
    item.registryDependencies = [...graph.registry].sort()
  if (publicFiles.has(item.files[0].path)) {
    item.devDependencies = [
      `@stylexjs/unplugin@${packageVersions['@stylexjs/unplugin']}`,
    ]
  }
}

writeFileSync(
  join(directory, 'registry.json'),
  `${JSON.stringify(
    { $schema: 'https://ui.shadcn.com/schema/registry.json', items },
    null,
    2,
  )}\n`,
)

console.log(
  `Generated ${items.length} StyleX registry items (${publicFiles.size} components).`,
)
