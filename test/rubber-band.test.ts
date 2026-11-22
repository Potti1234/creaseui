import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  rubberBand,
  rubberBandInverse,
  rubberBandSlope,
} from '../src/lib/behaviors/rubber-band.ts'

describe('RubberBand', () => {
  it('returns zero distance and unit slope for nonpositive overshoot', () => {
    for (const value of [0, -10]) {
      assert.equal(rubberBand(value, 100), 0)
      assert.equal(rubberBandInverse(value, 100), 0)
      assert.equal(rubberBandSlope(value, 100), 1)
    }
  })

  it('matches the default curve and approaches the dimension from below', () => {
    assert.equal(rubberBand(100, 100), (1 - 1 / 1.55) * 100)
    const far = rubberBand(1e10, 100)
    assert.ok(far < 100 && far > 99.999)
    assert.ok(rubberBand(20, 100) < rubberBand(40, 100))
    assert.ok(rubberBandSlope(40, 100) < rubberBandSlope(20, 100))
    assert.equal(rubberBandSlope(100, 100), 0.55 / (1.55 * 1.55))
  })

  it('round-trips the inverse with default and custom coefficients', () => {
    for (const coefficient of [0.55, 0.3, 1]) {
      for (const distance of [0.1, 10, 100, 1000]) {
        const restored = rubberBandInverse(
          rubberBand(distance, 200, coefficient),
          200,
          coefficient,
        )
        assert.ok(Math.abs(restored - distance) < 1e-9)
      }
    }
    assert.equal(rubberBandInverse(100, 100), rubberBandInverse(200, 100))
    assert.ok(Number.isFinite(rubberBandInverse(100, 100)))
  })

  it('returns zero for invalid dimensions, non-finite inputs and nonpositive coefficients', () => {
    for (const helper of [rubberBand, rubberBandInverse, rubberBandSlope]) {
      for (const dimension of [0, -1, NaN, Infinity, -Infinity])
        assert.equal(helper(10, dimension), 0)
      for (const value of [NaN, Infinity, -Infinity])
        assert.equal(helper(value, 100), 0)
      for (const coefficient of [0, -1, NaN, Infinity, -Infinity])
        assert.equal(helper(10, 100, coefficient), 0)
    }
  })
})
