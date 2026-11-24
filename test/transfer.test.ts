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
  it('keeps a controlled drop visible until the owner accepts or rejects it', () => {
    const config = { ...options, controlled: true }
    const initial = start()
    const grabbed = Transfer.grab(initial, 'a', config).model
    const draft = Transfer.moveTo(grabbed, 'done', 0, config).model
    const { model, outMessage } = Transfer.drop(draft, config)
    assert.equal(outMessage?._tag, 'Transferred')
    assert.equal(model.lists, initial.lists)
    assert.deepEqual(Transfer.lists(model).done, ['a'])
    assert.equal(Transfer.moving(model, 'a'), false)
    assert.equal(Transfer.setLists(model, { ...initial.lists }), model)
    assert.equal(Transfer.grab(model, 'b', config).model, model)
    assert.equal(Transfer.move(model, 'b', 'done', 0, config).model, model)
    assert.ok(outMessage?._tag === 'Transferred')
    const accepted = Transfer.setLists(model, outMessage.lists)
    assert.equal(accepted.pendingLists, undefined)
    assert.deepEqual(accepted.lists.done, ['a'])
    const rejected = Transfer.settle(model, initial.lists)
    assert.equal(rejected.pendingLists, undefined)
    assert.equal(Transfer.lists(rejected), initial.lists)
    const immediate = Transfer.move(initial, 'a', 'done', 0, config).model
    assert.equal(immediate.lists, initial.lists)
    assert.deepEqual(Transfer.lists(immediate).done, ['a'])
  })

  it('moves groups in source order and requires every member to be accepted', () => {
    const model = Transfer.init({
      id: 'grid',
      lists: { source: ['a', 'b', 'c', 'locked', 'd'], target: ['e'] },
    })
    const config: Transfer.Options = {
      ...options,
      group: () => ['c', 'missing', 'locked', 'a', 'a'],
      accepts: (item, list) => list !== 'target' || item !== 'a',
    }
    const draft = Transfer.grab(model, 'c', config).model
    assert.equal(Transfer.moving(draft, 'a'), true)
    assert.equal(Transfer.moving(draft, 'locked'), false)
    assert.equal(Transfer.moveTo(draft, 'target', 0, config).model, draft)
    const moved = Transfer.moveTo(draft, 'source', 2, config).model
    assert.deepEqual(Transfer.lists(moved).source, [
      'b',
      'locked',
      'a',
      'c',
      'd',
    ])
    assert.deepEqual(Transfer.cancel(moved, config).model.lists, model.lists)
    const accepted = Transfer.moveTo(moved, 'target', 1, {
      ...config,
      accepts: () => true,
    }).model
    assert.deepEqual(Transfer.drop(accepted).model.lists, {
      source: ['b', 'locked', 'd'],
      target: ['e', 'a', 'c'],
    })
    assert.ok(
      Option.isNone(
        Transfer.setLists(accepted, {
          source: ['b', 'c', 'd'],
          target: ['e'],
        }).draft,
      ),
    )
  })

  it('uses a grid row stride and mirrors inline keyboard moves', () => {
    const model = Transfer.init({
      id: 'grid',
      lists: { photos: ['a', 'b', 'c', 'd', 'e', 'f'], archive: [] },
    })
    const draft = Transfer.grab(model, 'a').model
    const press = (model: Transfer.Model, pressedKey: string) =>
      Transfer.update(
        model,
        Transfer.Message.PressedKey({
          key: 'a',
          pressedKey,
          direction: 'rtl',
          modified: false,
          columns: 3,
        }),
      ).model
    const down = press(draft, 'ArrowDown')
    assert.deepEqual(Transfer.lists(down).photos, [
      'b',
      'c',
      'd',
      'a',
      'e',
      'f',
    ])
    assert.deepEqual(Transfer.lists(press(down, 'ArrowLeft')).photos, [
      'b',
      'c',
      'd',
      'e',
      'a',
      'f',
    ])
  })

  it('excludes selected placeholders from pointer slots and reports the preview count', () => {
    const model = Transfer.init({
      id: 'board',
      lists: { photos: ['a', 'b', 'c', 'd'] },
    })
    const config = { group: () => ['a', 'c'] }
    const pending = Transfer.update(
      model,
      Transfer.Message.PressedItem({
        key: 'c',
        pointerId: 1,
        at: { x: 5, y: 5 },
        offset: { x: 2, y: 3 },
        size: { width: 20, height: 12 },
        focused: false,
      }),
      config,
    ).model
    const dragging = Transfer.update(
      pending,
      Transfer.Message.MovedPointer({
        pointerId: 1,
        at: { x: 45, y: 55 },
        precedingKeys: ['a', 'b'],
        maybeSlot: Option.some({ list: 'photos', index: 2 }),
      }),
      config,
    ).model
    assert.deepEqual(Transfer.lists(dragging).photos, ['b', 'a', 'c', 'd'])
    assert.equal(Transfer.dragging(dragging, 'a'), true)
    assert.deepEqual(Option.getOrThrow(Transfer.preview(dragging)), {
      key: 'c',
      count: 2,
      x: 43,
      y: 52,
      width: 20,
      height: 12,
    })
    const cancelled = Transfer.update(
      dragging,
      Transfer.Message.CancelledPointer({
        pointerId: 1,
      }),
      config,
    ).model
    assert.deepEqual(Transfer.lists(cancelled), model.lists)
    assert.ok(Option.isNone(Transfer.preview(cancelled)))
  })

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
