import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const root = process.cwd()
const uiDirectory = join(root, 'src', 'ui')
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const packageVersions = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}

const packageName = specifier => {
  if (specifier.startsWith('@')) {
    return specifier.split('/').slice(0, 2).join('/')
  }

  return specifier.split('/')[0]
}

const title = name =>
  name
    .split('-')
    .map(part => (part === 'kbd' ? 'Kbd' : part[0].toUpperCase() + part.slice(1)))
    .join(' ')

const registryAddress = item => `Potti1234/creaseui/${item}`
const libraryItems = {
  '@/lib/utils': 'utils',
  '@/lib/icon': 'icons',
  '@/lib/echarts': 'echarts-adapter',
}

const files = readdirSync(uiDirectory)
  .filter(file => file.endsWith('.ts') && file !== 'registry.json')
  .sort()

const items = files.map(file => {
  const name = basename(file, '.ts')
  const source = readFileSync(join(uiDirectory, file), 'utf8')
  const specifiers = Array.from(
    source.matchAll(/from\s+['"]([^'"]+)['"]/g),
    match => match[1],
  )
  const npmPackages = new Set()
  const registryDependencies = new Set([registryAddress('crease-theme')])

  for (const specifier of specifiers) {
    if (libraryItems[specifier] !== undefined) {
      registryDependencies.add(registryAddress(libraryItems[specifier]))
      continue
    }

    if (specifier.startsWith('@/ui/')) {
      registryDependencies.add(registryAddress(specifier.slice('@/ui/'.length)))
      continue
    }

    if (specifier.startsWith('.') || specifier.startsWith('@/')) {
      continue
    }

    npmPackages.add(packageName(specifier))
  }

  const dependencies = Array.from(npmPackages)
    .sort()
    .map(dependency => {
      const version = packageVersions[dependency]
      return version === undefined ? dependency : `${dependency}@${version}`
    })

  return {
    name,
    type: 'registry:ui',
    title: title(name),
    description: `A shadcn-styled ${title(name)} component for Foldkit.`,
    ...(dependencies.length === 0 ? {} : { dependencies }),
    registryDependencies: Array.from(registryDependencies).sort(),
    files: [
      {
        path: file,
        type: 'registry:ui',
        target: `@ui/${file}`,
      },
    ],
  }
})

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  items,
}

writeFileSync(
  join(uiDirectory, 'registry.json'),
  `${JSON.stringify(registry, null, 2)}\n`,
)

console.log(`Generated ${items.length} UI registry items.`)
