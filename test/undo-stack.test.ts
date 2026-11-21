import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'

import * as UndoStack from '@/lib/behaviors/undo-stack'

describe('UndoStack', () => {
  it('trims capacity even when a grouped push joins', () => {
    const initial = UndoStack.push(UndoStack.init<string>(), 'a')
    const grouped = UndoStack.push(initial, 'b', { group: 'typing', now: 0 })
    const trimmed = UndoStack.push(grouped, 'c', {
      group: 'typing',
      now: 1,
      limit: 1,
    })
    assert.deepEqual(trimmed.past, ['b'])
    const disabled = UndoStack.push(trimmed, 'd', {
      group: 'typing',
      now: 2,
      limit: 0,
    })
    assert.deepEqual(disabled.past, [])
    assert.equal(Option.isNone(disabled.open), true)
    const enabled = UndoStack.push(disabled, 'e', { group: 'typing', now: 3 })
    assert.deepEqual(enabled.past, ['e'])
  })
  it('merges matching groups using a sliding, strictly exclusive time window', () => {
    const first = UndoStack.push(UndoStack.init<string>(), 'a', {
      group: 'typing',
      now: 0,
    })
    const second = UndoStack.push(first, 'b', { group: 'typing', now: 499 })
    const third = UndoStack.push(second, 'c', { group: 'typing', now: 998 })
    assert.deepEqual(third.past, ['a'])
    assert.equal(UndoStack.undo(third, 'd').present, 'a')
    assert.equal(
      UndoStack.redo(UndoStack.undo(third, 'd').model, 'a').present,
      'd',
    )
    assert.deepEqual(
      UndoStack.push(third, 'd', { group: 'typing', now: 1498 }).past,
      ['a', 'd'],
    )
    assert.deepEqual(first.open, Option.some({ group: 'typing', time: 0 }))
  })

  it('starts a new step for another group or an ungrouped push', () => {
    const first = UndoStack.push(UndoStack.init<string>(), 'a', {
      group: 'insert',
      now: 0,
    })
    assert.deepEqual(
      UndoStack.push(first, 'b', { group: 'delete', now: 1 }).past,
      ['a', 'b'],
    )
    const ungrouped = UndoStack.push(first, 'b')
    assert.equal(Option.isNone(ungrouped.open), true)
    assert.deepEqual(
      UndoStack.push(ungrouped, 'c', { group: 'insert', now: 2 }).past,
      ['a', 'b', 'c'],
    )
  })

  it('ends groups on undo, redo, seal and clear, including empty moves', () => {
    const first = UndoStack.push(UndoStack.init<string>(), 'a', {
      group: 'typing',
      now: 0,
    })
    for (const model of [
      UndoStack.undo(first, 'b').model,
      UndoStack.redo(first, 'b').model,
      UndoStack.seal(first),
      UndoStack.clear(first),
    ]) {
      assert.equal(Option.isNone(model.open), true)
      assert.equal(
        UndoStack.push(model, 'c', { group: 'typing', now: 1 }).past.length,
        model.past.length + 1,
      )
    }
    const zero = UndoStack.push(UndoStack.init<string>(), 'a', {
      group: 'typing',
      now: 0,
      limit: 0,
    })
    assert.equal(Option.isNone(UndoStack.undo(zero, 'b').model.open), true)
  })

  it('supports a configurable window and requires grouped timestamps', () => {
    const first = UndoStack.push(UndoStack.init<string>(), 'a', {
      group: 'typing',
      now: 0,
    })
    assert.deepEqual(
      UndoStack.push(first, 'b', { group: 'typing', now: 5, groupDelay: 10 })
        .past,
      ['a'],
    )
    assert.throws(
      () => UndoStack.push(first, 'b', { group: 'typing' }),
      RangeError,
    )
  })

  it('defaults to 100 undo steps and evicts oldest snapshots', () => {
    let model = UndoStack.init<number>()
    for (let index = 0; index < 102; index++)
      model = UndoStack.push(model, index)
    assert.equal(model.past.length, 100)
    assert.equal(model.past[0], 2)
  })
  it('pushes immutable snapshots and walks undo and redo in order', () => {
    const empty = UndoStack.init<string>()
    const first = UndoStack.push(empty, 'a')
    const second = UndoStack.push(first, 'b')
    assert.deepEqual(empty, { past: [], future: [], open: Option.none() })
    assert.deepEqual(first.past, ['a'])
    assert.equal(UndoStack.canUndo(second), true)
    const undone = UndoStack.undo(second, 'c')
    assert.equal(undone.present, 'b')
    assert.equal(UndoStack.canRedo(undone.model), true)
    const again = UndoStack.undo(undone.model, undone.present)
    assert.equal(again.present, 'a')
    const redone = UndoStack.redo(again.model, again.present)
    assert.equal(redone.present, 'b')
    assert.deepEqual(UndoStack.redo(redone.model, redone.present), {
      model: second,
      present: 'c',
    })
  })

  it('clears the redo branch on a new push and clears all history', () => {
    const undone = UndoStack.undo(UndoStack.push(UndoStack.init(), 'a'), 'b')
    const branched = UndoStack.push(undone.model, undone.present)
    assert.equal(UndoStack.canRedo(branched), false)
    assert.deepEqual(UndoStack.clear(branched), UndoStack.init())
  })

  it('drops oldest entries at the limit, including zero', () => {
    const model = UndoStack.push(UndoStack.push(UndoStack.init(), 'a'), 'b', {
      limit: 1,
    })
    assert.deepEqual(model.past, ['b'])
    assert.deepEqual(UndoStack.push(model, 'c', { limit: 0 }).past, [])
  })

  it('rejects invalid limits', () => {
    for (const limit of [-1, 1.5, NaN]) {
      assert.throws(
        () => UndoStack.push(UndoStack.init(), 'a', { limit }),
        RangeError,
      )
    }
  })

  it('leaves empty history and present unchanged', () => {
    const model = UndoStack.init<undefined>()
    assert.equal(UndoStack.canUndo(model), false)
    assert.equal(UndoStack.canRedo(model), false)
    for (const move of [UndoStack.undo, UndoStack.redo]) {
      const result = move(model, undefined)
      assert.equal(result.model, model)
      assert.equal(result.present, undefined)
    }
  })

  it('supports undefined entries and a parameterized schema', () => {
    const model = UndoStack.push(UndoStack.init<undefined>(), undefined)
    assert.equal(UndoStack.canUndo(model), true)
    assert.equal(
      UndoStack.canRedo(UndoStack.undo(model, undefined).model),
      true,
    )
    assert.deepEqual(
      Schema.decodeUnknownSync(UndoStack.Model(Schema.String))({
        past: ['a'],
        future: [],
        open: Option.none(),
      }),
      { past: ['a'], future: [], open: Option.none() },
    )
  })
})
