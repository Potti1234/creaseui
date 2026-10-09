import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileOwners, sourceDependencies } from './registry-dependencies.mjs'

const root = process.cwd()
const directory = 'src/recipes/dashboard'
const files = readdirSync(join(root, directory))
  .filter(file => /\.(ts|css)$/.test(file))
  .sort()
const owners = fileOwners(root, [
  ...['src/lib', 'src/ui'].map(directory => ({
    directory,
    items: JSON.parse(
      readFileSync(join(root, directory, 'registry.json'), 'utf8'),
    ).items,
  })),
  {
    directory,
    items: [{ name: 'dashboard-01', files: files.map(path => ({ path })) }],
  },
])
const registryDependencies = new Set(['Potti1234/creaseui/crease-theme'])
for (const file of files.filter(file => file.endsWith('.ts'))) {
  const graph = sourceDependencies(
    root,
    join(root, directory, file),
    owners,
    'dashboard-01',
  )
  graph.registry.forEach(dependency => registryDependencies.add(dependency))
}
mkdirSync(join(root, directory), { recursive: true })
writeFileSync(
  join(root, directory, 'registry.json'),
  `${JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      items: [
        {
          name: 'dashboard-01',
          type: 'registry:block',
          title: 'Dashboard, users and settings',
          description:
            'Complete Foldkit + Tailwind dashboard: responsive sidebar and breadcrumbs, ECharts analytics, filterable users with validated dialogs, and persisted settings.',
          registryDependencies: [...registryDependencies].sort(),
          files: files.map(file => ({
            path: file,
            type: 'registry:component',
            target: `@components/crease-dashboard/${file}`,
          })),
        },
      ],
    },
    null,
    2,
  )}\n`,
)
console.log('Generated dashboard-01 recipe registry.')
