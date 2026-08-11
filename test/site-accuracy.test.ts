import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  CHART_EXAMPLE_COUNT,
  COMPONENT_COUNT,
  SHOWCASE_CARD_COUNT,
  SIDEBAR_BLOCK_COUNT,
} from '../src/lib/project-facts.ts'
import { SIDEBAR_BLOCK_IDS } from '../src/route.ts'

const registry = JSON.parse(readFileSync('src/ui/registry.json', 'utf8')) as {
  items: ReadonlyArray<{ type: string }>
}

const sourceFilesWith = (directory: string, pattern: RegExp): number =>
  readdirSync(directory)
    .filter(file => file.endsWith('.ts'))
    .filter(file => pattern.test(readFileSync(`${directory}/${file}`, 'utf8')))
    .length

describe('public site facts', () => {
  it('keeps published inventory totals tied to the source tree', () => {
    assert.equal(
      COMPONENT_COUNT,
      registry.items.filter(item => item.type === 'registry:ui').length,
    )
    assert.equal(
      CHART_EXAMPLE_COUNT,
      sourceFilesWith('src/demo/charts/cards', /export const view/u),
    )
    assert.equal(
      SHOWCASE_CARD_COUNT,
      sourceFilesWith('src/demo/cards', /export const view/u),
    )
    assert.equal(SIDEBAR_BLOCK_COUNT, SIDEBAR_BLOCK_IDS.length)
  })

  it('publishes an available registry command without stale landing copy', () => {
    const landing = readFileSync('src/demo/landing.ts', 'utf8')

    assert.match(
      landing,
      /npx --yes shadcn@latest add Potti1234\/creaseui\/button --yes/u,
    )
    assert.doesNotMatch(landing, /coming soon|stat\('49'/iu)
  })
})
