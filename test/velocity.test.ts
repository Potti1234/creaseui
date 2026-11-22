import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Schema } from 'effect'

import * as Velocity from '../src/lib/behaviors/velocity.ts'

const track = (
  samples: ReadonlyArray<readonly [number, number]>,
  options: Velocity.Options = {},
) =>
  samples.reduce(
    (model, [t, x]) => Velocity.addSample(model, t, x),
    Velocity.init(options),
  )
const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`)

describe('Velocity', () => {
  it('initializes a Schema Model and returns zero for empty or single samples', () => {
    const model = Velocity.init()
    assert.equal(Schema.is(Velocity.Model)(model), true)
    assert.deepEqual(model, {
      samples: [],
      horizon: 70,
      staleAfter: 40,
      maxSpeed: 8,
      capacity: 20,
    })
    assert.equal(Velocity.velocity(model, 0), 0)
    assert.equal(Velocity.velocity(Velocity.addSample(model, 0, 10), 0), 0)
  })

  it('uses linear least squares for two and three samples', () => {
    close(
      Velocity.velocity(
        track([
          [0, 0],
          [10, 20],
        ]),
        10,
      ),
      2,
    )
    close(
      Velocity.velocity(
        track([
          [0, 5],
          [10, 25],
          [30, 65],
        ]),
        30,
      ),
      2,
    )
    close(
      Velocity.velocity(
        track([
          [0, 0],
          [10, 5],
          [30, 40],
        ]),
        30,
      ),
      1.3928571428571428,
    )
  })

  it('fits quadratic acceleration at the newest timestamp', () => {
    for (const origin of [0, 100000]) {
      const model = track(
        [0, 10, 20, 30, 40].map(t => [origin + t, 0.01 * t * t] as const),
      )
      close(Velocity.velocity(model, origin + 40), 0.8)
    }
  })

  it('uses the newest sample horizon and exact stale boundary', () => {
    const model = track([
      [0, -1000],
      [30, 0],
      [100, 70],
    ])
    close(Velocity.velocity(model, 140), 1)
    assert.equal(Velocity.velocity(model, 140.001), 0)
    assert.equal(
      Velocity.velocity(
        track([
          [0, 0],
          [71, 70],
        ]),
        71,
      ),
      0,
    )
  })

  it('ignores duplicate, backwards and non-finite samples immutably', () => {
    const model = track([
      [10, 5],
      [20, 15],
    ])
    for (const [t, x] of [
      [20, 500],
      [19, 500],
      [NaN, 0],
      [Infinity, 0],
      [30, NaN],
      [30, Infinity],
    ])
      assert.equal(Velocity.addSample(model, t, x), model)
    assert.equal(Velocity.velocity(model, NaN), 0)
    assert.equal(Velocity.velocity(model, Infinity), 0)
    const next = Velocity.addSample(model, 30, 25)
    assert.equal(model.samples.length, 2)
    assert.equal(next.samples.length, 3)
  })

  it('evicts oldest samples at capacity and preserves options on reset', () => {
    const model = track(
      [
        [0, 0],
        [10, 100],
        [20, 20],
        [30, 30],
      ],
      { capacity: 2 },
    )
    assert.deepEqual(model.samples, [
      { time: 20, position: 20 },
      { time: 30, position: 30 },
    ])
    close(Velocity.velocity(model, 30), 1)
    const reset = Velocity.reset(model)
    assert.deepEqual(reset, { ...model, samples: [] })
    assert.equal(model.samples.length, 2)
    assert.equal(Velocity.velocity(reset, 30), 0)
    assert.equal(
      track(Array.from({ length: 25 }, (_, i) => [i, i] as const)).samples
        .length,
      20,
    )
  })

  it('clamps both signs and accepts configured limits', () => {
    for (const sign of [-1, 1]) {
      close(
        Velocity.velocity(
          track([
            [0, 0],
            [1, sign * 100],
          ]),
          1,
        ),
        sign * 8,
      )
      close(
        Velocity.velocity(
          track(
            [
              [0, 0],
              [1, sign * 100],
            ],
            { maxSpeed: 3 },
          ),
          1,
        ),
        sign * 3,
      )
    }
    assert.equal(
      Velocity.velocity(
        track(
          [
            [0, 0],
            [1, 5],
          ],
          { maxSpeed: 0 },
        ),
        1,
      ),
      0,
    )
  })

  it('falls back to linear slope for a near-singular quadratic fit', () => {
    const model = track(
      [0, 0.00001, 0.00002, 0.00003].map(t => [t, 2 * t] as const),
    )
    close(Velocity.velocity(model, 0.00003), 2)
  })

  it('defaults invalid options and honors zero windows and capacity one', () => {
    assert.deepEqual(
      Velocity.init({
        horizon: NaN,
        staleAfter: -1,
        maxSpeed: Infinity,
        capacity: 0,
      }),
      Velocity.init(),
    )
    assert.equal(Velocity.init({ capacity: 1.5 }).capacity, 20)
    assert.equal(
      Velocity.velocity(
        track(
          [
            [0, 0],
            [1, 1],
          ],
          { horizon: 0 },
        ),
        1,
      ),
      0,
    )
    assert.equal(
      Velocity.velocity(
        track(
          [
            [0, 0],
            [1, 1],
          ],
          { capacity: 1 },
        ),
        1,
      ),
      0,
    )
    assert.equal(
      Velocity.velocity(
        track(
          [
            [0, 0],
            [1, 1],
          ],
          { staleAfter: 0 },
        ),
        2,
      ),
      0,
    )
  })
})
