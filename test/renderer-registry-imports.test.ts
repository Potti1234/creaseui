import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, posix, resolve } from 'node:path'
import { describe, it } from 'node:test'
import { moduleSpecifiers } from '../scripts/registry-dependencies.mjs'

type Item = {
  name: string
  registryDependencies?: string[]
  files: { path: string; target: string }[]
}

const directories = [
  'src/lib',
  'src/stylex',
  'src/pleat',
  'registry/theme',
  'packages',
]
const registries = directories.map(directory => ({
  directory,
  items: JSON.parse(readFileSync(`${directory}/registry.json`, 'utf8'))
    .items as Item[],
}))
const items = new Map(
  registries.flatMap(({ items }) =>
    items.map(item => [item.name, item] as const),
  ),
)
const installedPath = (target: string) =>
  target.replace(/^@(ui|lib)\//u, '/src/$1/')

const closureTargets = (
  item: Item,
  visited = new Set<string>(),
): Set<string> => {
  if (visited.has(item.name)) return new Set()
  visited.add(item.name)
  const targets = new Set(item.files.map(file => installedPath(file.target)))
  for (const dependency of item.registryDependencies ?? []) {
    const name = dependency.split('/').at(-1)!
    const owned = items.get(name)
    assert.ok(owned, `${item.name}: unknown dependency ${dependency}`)
    for (const target of closureTargets(owned, visited)) targets.add(target)
  }
  return targets
}

describe('renderer registry install imports', () => {
  for (const { directory, items } of registries.filter(({ directory }) =>
    ['src/stylex', 'src/pleat'].includes(directory),
  )) {
    it(`${directory} imports resolve exactly within each install closure`, () => {
      const errors: string[] = []
      for (const item of items) {
        const targets = closureTargets(item)
        for (const file of item.files) {
          const source = readFileSync(resolve(directory, file.path), 'utf8')
          for (const specifier of moduleSpecifiers(source)) {
            if (!specifier.startsWith('@/') && !specifier.startsWith('.'))
              continue
            const imported = specifier.startsWith('@/')
              ? `/src/${specifier.slice(2)}`
              : posix.resolve(dirname(installedPath(file.target)), specifier)
            const path = imported.replace(/\.js$/u, '.ts')
            if (!targets.has(path) && !targets.has(`${path}.ts`)) {
              errors.push(
                `${item.name}: ${specifier} has no exact installed target ${path}`,
              )
            }
          }
        }
      }
      assert.deepEqual(errors, [])
    })
  }
})
