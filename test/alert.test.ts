import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { alertSemantics } from '../src/lib/alert.ts'

describe('Alert announcement policy', () => {
  it('keeps static guidance out of live regions', () => {
    assert.deepEqual(alertSemantics('static'), {})
  })

  it('maps non-urgent updates to polite status semantics', () => {
    assert.deepEqual(alertSemantics('status'), { role: 'status', live: 'polite' })
  })

  it('reserves assertive alert semantics for urgent updates', () => {
    assert.deepEqual(alertSemantics('alert'), { role: 'alert', live: 'assertive' })
  })
})
