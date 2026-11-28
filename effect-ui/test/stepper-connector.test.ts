import assert from 'node:assert/strict'
import { test } from 'node:test'

import { stepConnectorTimings } from '../src/behaviors/stepper'

const advance = { active: 2, previous: 1, hasContent: false }
const instant = { duration: '0ms', delay: '0ms' }

test('separated connectors fill the next step over the entire span', () => {
  for (const orientation of ['horizontal', 'vertical'] as const) {
    const options = { ...advance, orientation, onTrack: false }
    assert.deepEqual(stepConnectorTimings({ ...options, index: 2 }).entry, {
      duration: '300ms',
      delay: '0ms',
    })
    assert.deepEqual(
      stepConnectorTimings({ ...options, index: 1 }).entry,
      instant,
    )
  }
})

test('on-track connectors divide the span between leaving, content and arrival', () => {
  const horizontal = {
    ...advance,
    orientation: 'horizontal',
    onTrack: true,
  } as const
  assert.deepEqual(stepConnectorTimings({ ...horizontal, index: 1 }).rail, {
    duration: '150ms',
    delay: '0ms',
  })
  assert.deepEqual(stepConnectorTimings({ ...horizontal, index: 2 }).entry, {
    duration: '150ms',
    delay: '150ms',
  })

  const vertical = { ...horizontal, orientation: 'vertical' } as const
  const departing = stepConnectorTimings({
    ...vertical,
    index: 1,
    hasContent: true,
  })
  assert.deepEqual(departing.rail, { duration: '52.5ms', delay: '0ms' })
  assert.deepEqual(departing.content, { duration: '157.5ms', delay: '52.5ms' })
  assert.deepEqual(stepConnectorTimings({ ...vertical, index: 1 }).rail, {
    duration: '210ms',
    delay: '0ms',
  })
  assert.deepEqual(stepConnectorTimings({ ...vertical, index: 2 }).entry, {
    duration: '90ms',
    delay: '210ms',
  })
})

test('initial, backward, and multi-step changes settle immediately', () => {
  for (const [active, previous] of [
    [2, 2],
    [1, 2],
    [3, 1],
  ] as const) {
    const times = stepConnectorTimings({
      active,
      previous,
      index: 2,
      orientation: 'vertical',
      onTrack: true,
      hasContent: true,
    })
    assert.deepEqual(times, { entry: instant, rail: instant, content: instant })
  }
})
