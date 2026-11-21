import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Schema } from 'effect'

import * as UndoStack from '@/lib/behaviors/undo-stack'

describe('UndoStack', () => {
  it('pushes immutable snapshots and walks undo and redo in order', () => {
    const empty = UndoStack.init<string>()
    const first = UndoStack.push(empty, 'a')
    const second = UndoStack.push(first, 'b')
    assert.deepEqual(empty, { past: [], future: [] })
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
      }),
      { past: ['a'], future: [] },
    )
  })
})
