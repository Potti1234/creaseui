import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Transfer from '../src/lib/behaviors/transfer.ts'

const lists = { todo: ['a', 'b'], doing: ['c'], done: [] as string[] }
const options: Transfer.Options = {
  order: ['todo', 'doing', 'done'],
  accepts: (key, list) => list !== 'doing' || key !== 'b',
  disabled: key => key === 'locked',
  label: key => key.toUpperCase(),
  listLabel: list => `List ${list}`,
}
const start = () => Transfer.init({ id: 'board', lists })
const key = (
  model: Transfer.Model,
  pressedKey: string,
  item = 'a',
  direction: Transfer.Direction = 'ltr',
) =>
  Transfer.update(
    model,
    Transfer.Message.PressedKey({
      key: item,
      pressedKey,
      modified: false,
      direction,
    }),
    options,
  )
const announcement = (result: { outMessage?: Transfer.OutMessage }) =>
  result.outMessage?.announcement

describe('Transfer', () => {
  it('moves one key into a list at a clamped index', () => {
    assert.deepEqual(Transfer.transferred(lists, 'a', 'done', 9), {
      todo: ['b'],
      doing: ['c'],
      done: ['a'],
    })
    assert.deepEqual(Transfer.transferred(lists, 'b', 'todo', -1), {
      todo: ['b', 'a'],
      doing: ['c'],
      done: [],
    })
    assert.equal(Transfer.dropIndex([10, 30, 50], 40), 2)
    assert.equal(Transfer.sameLists(lists, { ...lists }), true)
  })

  it('picks up, moves across lists, and drops with announcements', () => {
    const grabbed = key(start(), ' ')
    assert.equal(Transfer.moving(grabbed.model, 'a'), true)
    assert.equal(
      announcement(grabbed),
      'Picked up A, List todo, position 1 of 2.',
    )
    const down = key(grabbed.model, 'ArrowDown')
    assert.deepEqual(Transfer.lists(down.model).todo, ['b', 'a'])
    assert.deepEqual(down.model.lists, lists)
    const right = key(down.model, 'ArrowRight')
    assert.deepEqual(Transfer.lists(right.model).doing, ['c', 'a'])
    assert.equal(announcement(right), 'A, List doing, position 2 of 2.')
    assert.equal(right.commands?.length, 1)
    const dropped = key(right.model, 'Enter')
    assert.equal(dropped.outMessage?._tag, 'Transferred')
    assert.deepEqual(dropped.model.lists, {
      todo: ['b'],
      doing: ['c', 'a'],
      done: [],
    })
    assert.equal(Option.isNone(dropped.model.draft), true)
    assert.equal(
      announcement(dropped),
      'Dropped A in List doing, position 2 of 2.',
    )
  })

  it('skips lists that refuse the item and mirrors arrows in RTL', () => {
    const grabbed = key(start(), 'Enter', 'b').model
    const across = key(grabbed, 'ArrowRight', 'b')
    assert.deepEqual(Transfer.lists(across.model).done, ['b'])
    const rtl = key(grabbed, 'ArrowLeft', 'b', 'rtl')
    assert.deepEqual(Transfer.lists(rtl.model).done, ['b'])
    assert.equal(key(grabbed, 'ArrowLeft', 'b').model, grabbed)
  })

  it('cancels with Escape or Tab and ignores disabled items', () => {
    const moved = key(key(start(), ' ').model, 'End').model
    const escaped = key(moved, 'Escape')
    assert.deepEqual(escaped.model.lists, lists)
    assert.equal(Option.isNone(escaped.model.draft), true)
    assert.equal(
      announcement(escaped),
      'Moved A back to List todo, position 1 of 2.',
    )
    assert.equal(escaped.commands?.length, 1)
    assert.deepEqual(key(moved, 'Tab').commands, [])
    const locked = Transfer.init({ id: 'board', lists: { todo: ['locked'] } })
    assert.equal(key(locked, ' ', 'locked').model, locked)
  })

  it('lets canCommit veto a drop and move commit immediately', () => {
    const veto = { ...options, canCommit: () => false }
    const moved = key(key(start(), ' ').model, 'ArrowDown').model
    const vetoed = Transfer.drop(moved, veto)
    assert.deepEqual(vetoed.model.lists, lists)
    assert.equal(vetoed.outMessage?._tag, 'Announced')
    const imperative = Transfer.move(start(), 'c', 'done', 0, options)
    assert.equal(imperative.outMessage?._tag, 'Transferred')
    assert.deepEqual(imperative.model.lists.done, ['c'])
    assert.equal(
      Transfer.move(start(), 'b', 'doing', 0, options).model.lists,
      lists,
    )
  })

  it('keeps an immediate move when an in-flight draft drops', () => {
    const grabbed = key(start(), ' ')
    const moved = Transfer.move(grabbed.model, 'c', 'done', 0, options)
    assert.deepEqual(moved.model.lists.done, ['c'])
    const dropped = key(key(moved.model, 'ArrowRight').model, ' ')
    assert.deepEqual(dropped.model.lists, {
      todo: ['b'],
      doing: ['a'],
      done: ['c'],
    })
  })

  it('never moves a draft into a list that does not exist', () => {
    const grabbed = key(start(), ' ')
    const missing = Transfer.moveTo(grabbed.model, 'archive', 0, options)
    assert.equal(missing.model, grabbed.model)
    const stale = Transfer.setLists(grabbed.model, {
      todo: ['a', 'b'],
      done: [],
    })
    const right = key(stale, 'ArrowRight')
    assert.deepEqual(Transfer.lists(right.model), { todo: ['b'], done: ['a'] })
  })

  it('rebases an in-flight draft when the lists change', () => {
    const moved = key(key(start(), ' ').model, 'ArrowRight').model
    const rebased = Transfer.setLists(
      moved,
      { todo: ['a', 'b'], doing: ['x', 'c'], done: [] },
      options,
    )
    assert.deepEqual(Transfer.lists(rebased).doing, ['a', 'x', 'c'])
    const removed = Transfer.setLists(moved, {
      todo: ['b'],
      doing: [],
      done: [],
    })
    assert.equal(Option.isNone(removed.draft), true)
  })

  it('drags with the pointer past the threshold and drops into the hovered slot', () => {
    const press = Transfer.Message.PressedItem({
      key: 'a',
      pointerId: 1,
      at: { x: 10, y: 10 },
      offset: { x: 4, y: 6 },
      size: { width: 100, height: 40 },
      focused: false,
    })
    const pressed = Transfer.update(start(), press, options).model
    const still = Transfer.update(
      pressed,
      Transfer.Message.MovedPointer({
        pointerId: 1,
        at: { x: 11, y: 11 },
        maybeSlot: Option.some({ list: 'done', index: 0 }),
      }),
      options,
    ).model
    assert.equal(Option.isNone(still.draft), true)
    const dragged = Transfer.update(
      still,
      Transfer.Message.MovedPointer({
        pointerId: 1,
        at: { x: 60, y: 90 },
        maybeSlot: Option.some({ list: 'done', index: 0 }),
      }),
      options,
    )
    assert.equal(Transfer.dragging(dragged.model, 'a'), true)
    assert.deepEqual(Transfer.lists(dragged.model).done, ['a'])
    assert.deepEqual(
      Transfer.preview(dragged.model),
      Option.some({
        key: 'a',
        x: 56,
        y: 84,
        width: 100,
        height: 40,
      }),
    )
    const released = Transfer.update(
      dragged.model,
      Transfer.Message.ReleasedPointer({ pointerId: 1 }),
      options,
    )
    assert.equal(released.outMessage?._tag, 'Transferred')
    assert.deepEqual(released.model.lists.done, ['a'])
    assert.deepEqual(released.commands, [])
  })
})
