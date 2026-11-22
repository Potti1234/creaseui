import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  initMulti,
  MultiMessage,
  MultiOutMessage,
  normalizeRange,
  normalizeMultiValues,
  normalizeRangeValues,
  snapRangeValue,
  toThumbValue,
  updateMulti,
  updateRangeValue,
  updateMultiValue,
} from '../src/lib/behaviors/slider.ts'

describe('Slider range policy', () => {
  it('orders bounds and replaces invalid steps', () => {
    assert.deepEqual(normalizeRange(100, 0, 5), { min: 0, max: 100, step: 5 })
    assert.deepEqual(normalizeRange(0, 10, 0), { min: 0, max: 10, step: 1 })
    assert.deepEqual(normalizeRange(0, 10, Number.NaN), {
      min: 0,
      max: 10,
      step: 1,
    })
  })

  it('snaps fractional values without floating-point residue', () => {
    const range = normalizeRange(0, 1, 0.1)
    assert.equal(snapRangeValue(0.26, range), 0.3)
    assert.equal(snapRangeValue(2, range), 1)
  })

  it('snaps crossed thumbs without reordering their identities', () => {
    const range = normalizeRange(0, 100, 5)
    assert.deepEqual(normalizeRangeValues([83, -2], range), [85, 0])
    assert.deepEqual(normalizeMultiValues([83, -2, 51], range), [85, 0, 50])
  })

  it('lets either range thumb cross the other on the full scale', () => {
    const range = normalizeRange(0, 5)
    assert.deepEqual(updateRangeValue([1, 3], 0, 4, range), [4, 3])
    assert.deepEqual(updateRangeValue([1, 3], 1, 0, range), [1, 0])
    assert.deepEqual(updateRangeValue([4, 3], 0, 9, range), [5, 3])
  })

  it('lets each of three thumbs cross both neighbors without moving them', () => {
    const range = normalizeRange(0, 5)
    assert.deepEqual(updateMultiValue([1, 2, 3], 0, 4, range), [4, 2, 3])
    assert.deepEqual(updateMultiValue([1, 2, 3], 1, 5, range), [1, 5, 3])
    assert.deepEqual(updateMultiValue([1, 2, 3], 2, 0, range), [1, 2, 0])
    assert.deepEqual(updateMultiValue([1, 2, 3], 1, -5, range), [1, 0, 3])
  })
})

describe('Slider behavior multi-thumb submodel', () => {
  it('routes a track press to its thumb and reports the mirrored value', () => {
    const model = initMulti({
      id: 'price',
      thumbs: 2,
      min: 0,
      max: 100,
      step: 10,
      mirrored: true,
    })
    const { model: next, outMessage } = updateMulti(
      model,
      MultiMessage.PressedTrack({
        index: 1,
        value: toThumbValue(model, 70),
        originValue: toThumbValue(model, 100),
      }),
    )
    assert.deepEqual(
      outMessage,
      MultiOutMessage.ChangedThumbValue({ index: 1, value: 70 }),
    )
    assert.equal(next.thumbs[0], model.thumbs[0])
    assert.notEqual(next.thumbs[1], model.thumbs[1])
  })
})
