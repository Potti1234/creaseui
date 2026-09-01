import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  normalizeRange,
  normalizeRangeValues,
  snapRangeValue,
  updateRangeValue,
} from '../src/lib/slider.ts'

describe('Slider range policy', () => {
  it('orders bounds and replaces invalid steps', () => {
    assert.deepEqual(normalizeRange(100, 0, 5), { min: 0, max: 100, step: 5 })
    assert.deepEqual(normalizeRange(0, 10, 0), { min: 0, max: 10, step: 1 })
    assert.deepEqual(normalizeRange(0, 10, Number.NaN), { min: 0, max: 10, step: 1 })
  })

  it('snaps fractional values without floating-point residue', () => {
    const range = normalizeRange(0, 1, 0.1)
    assert.equal(snapRangeValue(0.26, range), 0.3)
    assert.equal(snapRangeValue(2, range), 1)
  })

  it('normalizes crossed thumbs into an ordered pair', () => {
    const range = normalizeRange(0, 100, 5)
    assert.deepEqual(normalizeRangeValues([83, -2], range), [0, 85])
  })

  it('prevents either thumb from crossing the other', () => {
    const range = normalizeRange(0, 100, 5)
    assert.deepEqual(updateRangeValue([25, 75], 0, 90, range), [75, 75])
    assert.deepEqual(updateRangeValue([25, 75], 1, 10, range), [25, 25])
  })
})
