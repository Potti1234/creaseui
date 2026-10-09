import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileOwners, sourceDependencies } from './registry-dependencies.mjs'

const root = process.cwd()
const uiDirectory = join(root, 'src', 'ui')
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const packageVersions = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}

const title = name =>
  name
    .split('-')
    .map(part =>
      part === 'kbd' ? 'Kbd' : part[0].toUpperCase() + part.slice(1),
    )
    .join(' ')

const categories = {
  Maps: new Set([
    'map',
    'map-controls',
    'map-marker',
    'map-popup',
    'map-route',
    'map-arc',
    'map-geojson',
    'map-cluster',
    'map-styles',
    'map-localization',
  ]),
  'Data display': new Set([
    'avatar',
    'badge',
    'bubble',
    'chart',
    'data-table',
    'item',
    'kbd',
    'marker',
    'table',
    'typography',
  ]),
  Feedback: new Set([
    'alert',
    'empty',
    'message',
    'message-scroller',
    'progress',
    'skeleton',
    'spinner',
    'toast',
  ]),
  Forms: new Set([
    'button',
    'button-group',
    'checkbox',
    'combobox',
    'field',
    'form',
    'input',
    'input-group',
    'input-otp',
    'label',
    'native-select',
    'radio-group',
    'select',
    'slider',
    'switch',
    'textarea',
    'toggle',
    'toggle-group',
  ]),
  Layout: new Set([
    'aspect-ratio',
    'card',
    'carousel',
    'resizable',
    'scroll-area',
    'separator',
    'sidebar',
  ]),
  Navigation: new Set([
    'breadcrumb',
    'command',
    'menubar',
    'mobile-nav',
    'navigation-menu',
    'pagination',
    'tabs',
  ]),
  Overlay: new Set([
    'alert-dialog',
    'bottom-sheet',
    'context-menu',
    'dialog',
    'direction',
    'drawer',
    'dropdown-menu',
    'hover-card',
    'lightbox',
    'popover',
    'sheet',
    'tooltip',
  ]),
}

const category = name =>
  Object.entries(categories).find(([, names]) => names.has(name))?.[0] ??
  'Other'

const registryAddress = item => `Potti1234/creaseui/${item}`
const consumerFrameworkPackages = new Set([
  '@effect/platform-browser',
  '@foldkit/ui',
  'effect',
  'foldkit',
])

const files = readdirSync(uiDirectory)
  .filter(file => file.endsWith('.ts') && file !== 'registry.json')
  .sort()

const libraryRegistry = JSON.parse(
  readFileSync(join(root, 'src/lib/registry.json'), 'utf8'),
)
const ownedLibraryFiles = new Set(
  libraryRegistry.items.flatMap(item => item.files.map(file => file.path)),
)
for (const file of readdirSync(join(root, 'src/lib'))
  .filter(file => file.endsWith('.ts'))
  .sort()) {
  if (ownedLibraryFiles.has(file)) continue
  const name = basename(file, '.ts')
  libraryRegistry.items.push({
    name: `${name}-behavior`,
    type: 'registry:lib',
    title: `${title(name)} Behavior`,
    description: `Shared Foldkit behavior and helpers for ${title(name)}.`,
    files: [{ path: file, type: 'registry:lib', target: `@lib/${file}` }],
  })
}
const owners = fileOwners(root, [
  { directory: 'src/lib', items: libraryRegistry.items },
  {
    directory: 'src/ui',
    items: files.map(file => ({
      name: basename(file, '.ts'),
      files: [{ path: file }],
    })),
  },
])
const versionedPackages = packages =>
  [...packages]
    .filter(dependency => !consumerFrameworkPackages.has(dependency))
    .sort()
    .map(dependency =>
      packageVersions[dependency] === undefined
        ? dependency
        : `${dependency}@${packageVersions[dependency]}`,
    )

// Shared behavior can depend on other behavior. Generate that graph as well.
for (const item of libraryRegistry.items) {
  const registry = new Set()
  const packages = new Set()
  for (const file of item.files) {
    const result = sourceDependencies(
      root,
      join(root, 'src/lib', file.path),
      owners,
      item.name,
    )
    result.registry.forEach(dependency => registry.add(dependency))
    result.packages.forEach(dependency => packages.add(dependency))
  }
  const dependencies = versionedPackages(packages)
  if (dependencies.length) item.dependencies = dependencies
  else delete item.dependencies
  if (registry.size) item.registryDependencies = [...registry].sort()
  else delete item.registryDependencies
}
writeFileSync(
  join(root, 'src/lib/registry.json'),
  `${JSON.stringify(libraryRegistry, null, 2)}\n`,
)

const items = files.map(file => {
  const name = basename(file, '.ts')
  const graph = sourceDependencies(root, join(uiDirectory, file), owners, name)
  const registryDependencies = new Set([
    registryAddress('crease-theme'),
    ...graph.registry,
  ])
  const dependencies = versionedPackages(graph.packages)

  return {
    name,
    type: 'registry:ui',
    title: title(name),
    description: `A CreaseUI ${title(name)} component for Foldkit.`,
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

const escapeCell = value => value.replaceAll('|', '\\|')
const catalogRows = items.map(item => {
  const source = readFileSync(join(uiDirectory, item.files[0].path), 'utf8')
  const state =
    /export (?:type|interface) Model\b/.test(source) &&
    /export const update\b/.test(source)
      ? 'Stateful'
      : 'Stateless'
  const packages = item.dependencies ?? []
  const registryItems = item.registryDependencies
    .map(dependency => dependency.split('/').at(-1))
    .filter(dependency => dependency !== 'crease-theme')
  const requirements =
    [...packages, ...registryItems].join(', ') || 'Theme only'

  return `| ${item.title} | ${category(item.name)} | ${state} | ${escapeCell(requirements)} | \`${registryAddress(item.name)}\` |`
})

writeFileSync(
  join(root, 'docs', 'component-catalog.md'),
  `# Component catalog\n\nThis file is generated by \`npm run registry:generate\`. Every component also installs the Crease theme token contract. “Stateful” means the module owns a Foldkit child model and update function; “Stateless” modules are render helpers or controlled views.\n\n| Component | Category | State | Additional requirements | Registry install name |\n| --- | --- | --- | --- | --- |\n${catalogRows.join('\n')}\n`,
)

console.log(
  `Generated ${items.length} UI registry items and the component catalog.`,
)
