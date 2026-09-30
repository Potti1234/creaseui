import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeProgress } from '../src/lib/progress.ts'

test('normalizes determinate progress against a positive custom maximum', () => {
  assert.deepEqual(normalizeProgress(3, 4), {
    value: 3,
    max: 4,
    state: 'determinate',
    status: 'progressing',
    percentage: 75,
    defaultAriaValueText: (0.75).toLocaleString(undefined, { style: 'percent' }),
  })
  assert.equal(normalizeProgress(-2, 4).value, 0)
  assert.equal(normalizeProgress(9, 4).value, 4)
  assert.equal(normalizeProgress(9, 4).status, 'complete')
})

test('normalizes invalid numeric input and preserves indeterminate semantics', () => {
  assert.equal(normalizeProgress(Number.NaN).value, 0)
  assert.deepEqual(normalizeProgress(null, 8), {
    value: null,
    max: 8,
    state: 'indeterminate',
    status: 'indeterminate',
    percentage: null,
    defaultAriaValueText: 'indeterminate progress',
  })
  assert.equal(normalizeProgress(10, 0).max, 100)
})
