import assert from 'node:assert/strict'
import { it } from 'node:test'

import * as Gesture from '../src/lib/behaviors/gesture.ts'

it('projects signed release velocity with exponential deceleration', () => {
  assert.equal(Gesture.projectDistance(2, 0.5), 2)
  assert.equal(Gesture.projectDistance(-2, 0.5), -2)
  assert.equal(Gesture.projectDistance(2, 1), 0)
})

it('normalizes stroke sectors and ignores the dead zone', () => {
  assert.equal(Gesture.sectorOf(0, -30, 4), 0)
  assert.equal(Gesture.sectorOf(30, 0, 4), 1)
  assert.equal(Gesture.sectorOf(0, 30, 4), 2)
  assert.equal(Gesture.sectorOf(-30, 0, 4), 3)
  assert.equal(Gesture.sectorOf(30, 0, 4, { start: 0.25 }), 0)
  assert.equal(Gesture.sectorOf(3, 5, 4), -1)
})

it('matches the initial conditions and settles in all three damping regimes', () => {
  for (const ratio of [0.6, 1, 2]) {
    const spring = Gesture.solveSpring(0.4, ratio, 50, -0.2)
    assert.deepEqual(spring.sample(0), { position: 50, velocity: -0.2 })
    assert.ok(Math.abs((spring.position(0.001) - 50) / 0.001 + 0.2) < 0.001)
    assert.ok(Math.abs(spring.position(3000)) < 0.01)
    assert.ok(Math.abs(spring.velocity(3000)) < 0.01)
  }
})
