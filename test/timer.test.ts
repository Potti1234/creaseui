import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as Timer from '../src/ui/timer.ts'

describe('Timer', () => {
  it('defaults to the elapsed format', () => {
    const model = Timer.init({ id: 't', startTimeMs: 500, nowMs: 1_000 })
    assert.equal(model.format, 'elapsed')
    assert.equal(model.nowMs, 1_000)
    assert.equal(model.startTimeMs, 500)
  })

  it('honours an explicit start time and clock format', () => {
    const model = Timer.init({
      id: 't',
      startTimeMs: 500,
      format: 'clock',
      nowMs: 900,
    })
    assert.equal(model.startTimeMs, 500)
    assert.equal(model.format, 'clock')
    assert.equal(model.nowMs, 900)
  })
})
