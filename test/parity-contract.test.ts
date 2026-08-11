import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const readJson = <Value>(path: string): Value =>
  JSON.parse(readFileSync(path, 'utf8')) as Value

type Dimension =
  | 'visual'
  | 'behavior'
  | 'accessibility'
  | 'composition'
  | 'documentation'
  | 'registry'

type Status = 'verified' | 'partial' | 'adapted' | 'unverified' | 'not-applicable'

const registry = readJson<{
  items: ReadonlyArray<{ name: string; type: string }>
}>('src/ui/registry.json')
const roadmap = readJson<{
  verifiedAgainst: { commit: string }
}>('docs/component-roadmap.json')
const upstream = readJson<{
  commit: string
  components: ReadonlyArray<string>
  files: ReadonlyArray<{ path: string; sha: string }>
}>('docs/upstream-shadcn.json')
const parity = readJson<{
  statuses: ReadonlyArray<Status>
  dimensions: ReadonlyArray<Dimension>
  summary: { creaseOnlyRecipes: ReadonlyArray<string> }
  components: ReadonlyArray<{
    component: string
    upstream: boolean
    classification: string
    dimensions: Readonly<Record<Dimension, Status>>
    evidence: ReadonlyArray<string>
  }>
}>('docs/component-parity.json')

describe('multidimensional component parity', () => {
  it('covers every registry item and the complete recorded upstream inventory', () => {
    const registryNames = registry.items
      .filter(item => item.type === 'registry:ui')
      .map(item => item.name)
      .sort()
    const contractNames = parity.components.map(component => component.component).sort()

    assert.deepEqual(contractNames, registryNames)
    assert.deepEqual(
      upstream.components.filter(name => !registryNames.includes(name)),
      [],
    )
    assert.deepEqual(parity.summary.creaseOnlyRecipes, [
      'data-table',
      'date-picker',
      'typography',
    ])
  })

  it('tracks every fidelity dimension with a closed status vocabulary', () => {
    const dimensions: ReadonlyArray<Dimension> = [
      'visual',
      'behavior',
      'accessibility',
      'composition',
      'documentation',
      'registry',
    ]

    for (const component of parity.components) {
      assert.deepEqual(Object.keys(component.dimensions), dimensions)
      for (const status of Object.values(component.dimensions)) {
        assert.ok(parity.statuses.includes(status), `${component.component}: ${status}`)
      }
      assert.ok(component.evidence.length >= 3)
    }
  })

  it('keeps upstream provenance pinned and source blobs unique', () => {
    assert.equal(roadmap.verifiedAgainst.commit, upstream.commit)
    assert.equal(new Set(upstream.files.map(file => file.path)).size, upstream.files.length)
    assert.ok(upstream.files.every(file => /^[0-9a-f]{40}$/u.test(file.sha)))
  })

  it('does not confuse inventory coverage with visual verification', () => {
    assert.ok(parity.components.every(component => component.dimensions.visual === 'unverified'))
    assert.ok(parity.components.some(component => component.dimensions.behavior === 'adapted'))
    assert.ok(parity.components.some(component => component.dimensions.accessibility === 'verified'))
  })
})
