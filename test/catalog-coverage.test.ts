import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const registry = JSON.parse(readFileSync('src/ui/registry.json', 'utf8')) as {
  items: ReadonlyArray<{ name: string; type: string }>
}
const componentPage = readFileSync('src/docs/component-page.ts', 'utf8')
const catalog = readFileSync('src/docs/components/catalog.ts', 'utf8')
const roadmap = JSON.parse(readFileSync('docs/component-roadmap.json', 'utf8')) as {
  fidelity: ReadonlyArray<unknown>
  missing: ReadonlyArray<unknown>
}

const componentBlock = componentPage.match(/export const COMPONENTS = \[([\s\S]*?)\] as const/)?.[1] ?? ''
const documentedSlugs = Array.from(componentBlock.matchAll(/'([^']+)'/g), match =>
  (match[1] ?? '').toLowerCase().replaceAll(' ', '-'),
).sort()
const registrySlugs = registry.items
  .filter(item => item.type === 'registry:ui')
  .map(item => item.name)
  .sort()

describe('component catalog coverage', () => {
  it('documents every registry UI item and no stale component routes', () => {
    assert.deepEqual(documentedSlugs, registrySlugs)
  })

  it('contains no documentation placeholder copy', () => {
    assert.doesNotMatch(catalog, /being verified|Source-owned'/)
  })

  it('has no unresolved tracked fidelity or missing-component gaps', () => {
    assert.deepEqual(roadmap.fidelity, [])
    assert.deepEqual(roadmap.missing, [])
  })
})
