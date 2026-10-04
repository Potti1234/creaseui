import assert from 'node:assert/strict'
import test from 'node:test'

import {
  parseLocaleNumber,
  formatEditableNumber,
  resolveNumberInputCommit,
  getSteppedValue,
  canStep,
  init,
  update,
  Message,
} from '../src/lib/number-input.ts'

test('parses plain, signed, exponent, and grouped numbers', () => {
  assert.equal(parseLocaleNumber('42'), 42)
  assert.equal(parseLocaleNumber('-3.5'), -3.5)
  assert.equal(parseLocaleNumber('1e3'), 1000)
  assert.equal(parseLocaleNumber('(12)'), -12)
  assert.equal(parseLocaleNumber('abc'), null)
  assert.equal(parseLocaleNumber(''), null)
})

test('formats the committed value exponent-free', () => {
  assert.equal(formatEditableNumber(1000), '1000')
  assert.equal(formatEditableNumber(1.5e-7, 'en-US').startsWith('0.'), true)
})

test('commit clamps to min/max and reports didClamp', () => {
  assert.deepEqual(
    resolveNumberInputCommit('150', { value: 3, min: 0, max: 100 }),
    { kind: 'commit', value: 100, didClamp: true },
  )
  assert.deepEqual(
    resolveNumberInputCommit('4', { value: 3, min: 0, max: 100 }),
    { kind: 'commit', value: 4, didClamp: false },
  )
})

test('commit reverts unparseable or non-integer drafts and clears empties', () => {
  assert.deepEqual(resolveNumberInputCommit('nope', { value: 3 }), {
    kind: 'revert',
  })
  assert.deepEqual(
    resolveNumberInputCommit('1.5', { value: 3, isIntegerOnly: true }),
    { kind: 'revert' },
  )
  assert.deepEqual(
    resolveNumberInputCommit('  ', { value: 3, hasClear: true }),
    { kind: 'clear' },
  )
  assert.deepEqual(resolveNumberInputCommit(undefined, { value: 3 }), {
    kind: 'revert',
  })
})

test('stepping snaps to the step grid and clamps', () => {
  assert.equal(getSteppedValue(1, { value: 5, step: 2, min: 0 }), 6)
  assert.equal(getSteppedValue(-1, { value: 0.1, step: 0.1, min: 0 }), 0)
  assert.equal(getSteppedValue(1, { value: 99, step: 5, max: 100 }), 100)
  assert.equal(getSteppedValue(1, { value: undefined, min: 4 }), 4)
  assert.equal(canStep(1, { value: 100, max: 100 }), false)
  assert.equal(canStep(-1, { value: 0, min: 0 }), false)
})

test('update lifts commits and clears into ChangedValue out messages', () => {
  const model = init({ id: 't' })
  const committed = update(
    model,
    Message.CommitDecided({
      resolution: { _tag: 'commit', value: 12, didClamp: false },
    }),
  )
  assert.equal(committed.outMessage?._tag, 'ChangedValue')
  const cleared = update(model, Message.ClearRequested())
  assert.equal(cleared.outMessage?._tag, 'ChangedValue')
})
