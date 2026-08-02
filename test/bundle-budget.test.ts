import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { describe, it } from 'node:test'

const MAX_GENERATED_ICON_BYTES = 64 * 1024
const MAX_GENERATED_ICON_COUNT = 100

describe('consumer bundle budgets', () => {
  it('keeps the generated icon catalog bounded', () => {
    const path = 'src/lib/icon-nodes.ts'
    const source = readFileSync(path, 'utf8')
    const iconCount = Array.from(source.matchAll(/^  "[^"]+": \[/gm)).length

    assert.ok(
      statSync(path).size <= MAX_GENERATED_ICON_BYTES,
      `generated icon catalog exceeds ${MAX_GENERATED_ICON_BYTES} bytes`,
    )
    assert.ok(
      iconCount <= MAX_GENERATED_ICON_COUNT,
      `generated icon catalog contains ${iconCount} icons`,
    )
  })

  it('never imports the complete Lucide node catalog in consumer source', () => {
    const source = readFileSync('src/lib/icon.ts', 'utf8')

    assert.doesNotMatch(source, /lucide-static\/icon-nodes\.json/)
    assert.doesNotMatch(source, /\?raw/)
  })
})
