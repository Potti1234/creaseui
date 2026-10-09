import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'
import {
  fileOwners,
  moduleSpecifiers,
  sourceDependencies,
} from '../scripts/registry-dependencies.mjs'

describe('Registry dependency graph', () => {
  it('includes imports, re-exports and import types without matching comments', () => {
    assert.deepEqual(
      moduleSpecifiers(`
      // from '@/lib/not-real'
      import type { Props } from '@/lib/button'
      export * from '@/lib/sidebar-state'
      import './theme.css'
      type T = import('@/lib/field').Parts
      const loadChart = () => import('echarts/core')
    `),
      [
        '@/lib/button',
        '@/lib/sidebar-state',
        './theme.css',
        '@/lib/field',
        'echarts/core',
      ],
    )
  })

  it('every UI and behavior source declares its owned dependencies', () => {
    const root = process.cwd()
    const registries = ['src/lib', 'src/ui'].map(directory => ({
      directory,
      items: JSON.parse(readFileSync(`${directory}/registry.json`, 'utf8'))
        .items,
    }))
    const owners = fileOwners(root, registries)
    for (const { directory, items } of registries) {
      for (const item of items) {
        for (const file of item.files) {
          const graph = sourceDependencies(
            root,
            resolve(directory, file.path),
            owners,
            item.name,
          )
          for (const dependency of graph.registry) {
            assert.ok(
              item.registryDependencies?.includes(dependency),
              `${item.name} omits ${dependency}`,
            )
          }
        }
      }
    }
  })
})
