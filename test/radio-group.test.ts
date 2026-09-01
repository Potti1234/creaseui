import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('Radio Group renderer contract', () => {
  it('binds one string-valued primitive bundle in the shared module', () => {
    const shared = readFileSync('src/lib/radio-group.ts', 'utf8')
    assert.match(shared, /RadioGroupPrimitive\.create<string>\(\)/u)
    assert.match(shared, /isOptionDisabled/u)
  })
})
