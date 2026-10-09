import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('Icon adapter inventory', () => {
  const mapping = JSON.parse(
    readFileSync('scripts/icon-adapter-map.json', 'utf8'),
  )
  const names = [
    ...readFileSync('src/lib/icon.ts', 'utf8').matchAll(
      /export const (\w+) = named\('([^']+)'\)/g,
    ),
  ]

  it('all named exports resolve in each interchangeable adapter', () => {
    for (const library of [
      'lucide',
      'hugeicons',
      'tabler',
      'phosphor',
      'remixicon',
    ]) {
      const source = readFileSync(`registry/icons/${library}/icon.ts`, 'utf8')
      for (const [, exportedName, iconName] of names) {
        assert.ok(mapping[iconName]?.[library], `${library} omits ${iconName}`)
        assert.ok(
          source.includes(
            `export const ${exportedName} = named('${iconName}')`,
          ),
          `${library} omits ${exportedName}`,
        )
      }
      assert.ok(
        source.includes('dataIcon?'),
        `${library} loses inline icon position metadata`,
      )
    }
  })
})
