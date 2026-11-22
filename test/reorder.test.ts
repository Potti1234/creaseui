import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'

import * as Reorder from '../src/lib/behaviors/reorder.ts'

const value = ['a', 'b', 'c', 'd']
const send = (
  model: Reorder.Model,
  message: Reorder.Message,
  config: Reorder.Config = { value },
) => Reorder.update(model, message, config)
const grab = (key = 'b') =>
  send(Reorder.init(), Reorder.Message.Grab({ key })).model
const resolved = (model: Reorder.Model, event: Reorder.Keydown) =>
  Option.getOrThrow(Reorder.keydown(model, event))

describe('Reorder', () => {
  it('ports English announcements', () => {
    const details = { label: 'Book', count: 1, position: 2, total: 4 }
    assert.equal(
      Reorder.reorderMessage({ ...details, type: 'grab' }),
      'Picked up Book, position 2 of 4.',
    )
    assert.equal(
      Reorder.reorderMessage({ ...details, type: 'move' }),
      'Book, position 2 of 4.',
    )
    assert.equal(
      Reorder.reorderMessage({ ...details, type: 'drop', count: 2 }),
      'Dropped 2 items at position 2 of 4.',
    )
    assert.equal(
      Reorder.reorderMessage({ ...details, type: 'cancel' }),
      'Moved Book back to position 2 of 4.',
    )
  })

  it('ports index and grid geometry helpers including reversed and empty inputs', () => {
    assert.equal(Reorder.dropIndex([10, 20, 30], 20), 1)
    assert.equal(Reorder.dropIndex([30, 20, 10], 20, { reversed: true }), 1)
    assert.equal(Reorder.dropIndex([], 20), 0)
    const rects = [
      { left: 0, right: 20, top: 0, bottom: 20 },
      { left: 20, right: 40, top: 0, bottom: 20 },
    ]
    assert.equal(Reorder.gridDropIndex(rects, { x: 25, y: 5 }), 1)
    assert.equal(
      Reorder.gridDropIndex(rects, { x: 25, y: 5 }, { reversed: true }),
      1,
    )
    assert.equal(Reorder.gridDropIndex(rects, { x: 0, y: 21 }), 2)
    assert.equal(Reorder.gridDropIndex([], { x: 0, y: 0 }), 0)
    assert.equal(Reorder.columnsOf([0, 0.5, 20]), 2)
    assert.equal(Reorder.columnsOf([]), 1)
  })

  it('moves groups in list order and preserves references for no-op moves', () => {
    assert.equal(Reorder.movedTo(value, 'b', 1), value)
    assert.deepEqual(Reorder.movedTo(value, ['d', 'b'], 0), [
      'b',
      'd',
      'a',
      'c',
    ])
    assert.deepEqual(Reorder.movedTo(value, 'a', 99), ['b', 'c', 'd', 'a'])
    assert.deepEqual(Reorder.movedTo(value, 'd', -5), ['d', 'a', 'b', 'c'])
  })

  it('keeps the committed value separate from a Schema draft until drop', () => {
    const initial = Reorder.init()
    assert.equal(Reorder.order(initial, value), value)
    const grabbed = send(initial, Reorder.Message.Grab({ key: 'b' }))
    assert.equal(Schema.is(Reorder.Model)(grabbed.model), true)
    assert.equal(Reorder.isMoving(grabbed.model, 'b'), true)
    assert.equal(Reorder.isMoving(initial, 'b'), false)
    assert.deepEqual(grabbed.outMessages, [
      {
        _tag: 'Announcement',
        announcement: {
          type: 'grab',
          key: 'b',
          count: 1,
          position: 2,
          total: 4,
        },
      },
    ])
    const moved = send(grabbed.model, Reorder.Message.Step({ delta: 1 }))
    assert.deepEqual(Reorder.order(moved.model, value), ['a', 'c', 'b', 'd'])
    assert.deepEqual(moved.maybeFocus, Option.some('b'))
    const dropped = send(moved.model, Reorder.Message.Drop({}))
    assert.equal(dropped.outMessages.every(Schema.is(Reorder.OutMessage)), true)
    assert.equal(Option.isNone(dropped.model.maybeDraft), true)
    assert.deepEqual(dropped.outMessages[0], {
      _tag: 'CommittedOrder',
      order: ['a', 'c', 'b', 'd'],
      reason: 'move-key',
    })
    assert.equal(dropped.outMessages.length, 2)
    assert.equal(
      send(grabbed.model, Reorder.Message.Drop({})).outMessages.length,
      1,
    )
  })

  it('rejects absent/disabled grabs and gathers only enabled group members', () => {
    const config = {
      value,
      group: () => ['d', 'b', 'a'],
      isDisabled: (key: string) => key === 'a',
    }
    const initial = Reorder.init()
    assert.equal(
      send(initial, Reorder.Message.Grab({ key: 'a' }), config).model,
      initial,
    )
    assert.equal(
      send(initial, Reorder.Message.Grab({ key: 'absent' }), config).model,
      initial,
    )
    assert.equal(
      send(initial, Reorder.Message.Grab({ key: 'b' }), { value: [] }).model,
      initial,
    )
    const grouped = send(initial, Reorder.Message.Grab({ key: 'd' }), config)
    assert.deepEqual(Reorder.order(grouped.model, value), ['a', 'c', 'b', 'd'])
    assert.equal(Reorder.isMoving(grouped.model, 'b'), true)
    assert.deepEqual(grouped.maybeFocus, Option.some('d'))
    assert.equal(
      send(grouped.model, Reorder.Message.Grab({ key: 'c' })).model,
      grouped.model,
    )
  })

  it('cancels without committing and announces the committed position', () => {
    const moved = send(grab(), Reorder.Message.MoveTo({ index: 3 })).model
    const cancelled = send(
      moved,
      Reorder.Message.Cancel({ restoreFocus: false }),
    )
    assert.equal(Option.isNone(cancelled.maybeFocus), true)
    assert.equal(Option.isNone(cancelled.model.maybeDraft), true)
    assert.deepEqual(cancelled.outMessages, [
      {
        _tag: 'Announcement',
        announcement: {
          type: 'cancel',
          key: 'b',
          count: 1,
          position: 2,
          total: 4,
        },
      },
    ])
    assert.deepEqual(
      send(moved, Reorder.Message.Cancel({ restoreFocus: true })).maybeFocus,
      Option.some('b'),
    )
  })

  it('imperative moves emit a commit and drop announcement only when changed', () => {
    const initial = Reorder.init()
    assert.deepEqual(
      send(initial, Reorder.Message.Move({ key: 'b', index: 0 }))
        .outMessages[0],
      {
        _tag: 'CommittedOrder',
        order: ['b', 'a', 'c', 'd'],
        reason: 'imperative',
      },
    )
    assert.equal(
      send(initial, Reorder.Message.Move({ key: 'b', index: 1 })).outMessages
        .length,
      0,
    )
    assert.equal(
      send(initial, Reorder.Message.Move({ key: 'missing', index: 1 }))
        .outMessages.length,
      0,
    )
    for (const message of [
      Reorder.Message.MoveTo({ index: 2 }),
      Reorder.Message.Step({ delta: 1 }),
      Reorder.Message.Drop({}),
      Reorder.Message.Cancel({ restoreFocus: true }),
      Reorder.Message.Reflect({}),
      Reorder.Message.Swallow({}),
    ]) {
      assert.equal(send(initial, message).model, initial)
    }
  })

  it('rebases owner changes before/after movement and drops missing keys', () => {
    const grabbed = grab()
    const reflected = send(grabbed, Reorder.Message.Reflect({}), {
      value: ['d', 'c', 'b', 'a'],
    })
    assert.deepEqual(Reorder.order(reflected.model, []), ['d', 'c', 'b', 'a'])
    const moved = send(grabbed, Reorder.Message.MoveTo({ index: 3 })).model
    const rebased = send(moved, Reorder.Message.Reflect({}), {
      value: ['a', 'b', 'd', 'e'],
    })
    assert.deepEqual(Reorder.order(rebased.model, []), ['a', 'd', 'b', 'e'])
    assert.equal(
      Option.isNone(
        send(moved, Reorder.Message.Reflect({}), { value: ['a'] }).model
          .maybeDraft,
      ),
      true,
    )
    const grouped = send(Reorder.init(), Reorder.Message.Grab({ key: 'b' }), {
      value,
      group: () => ['b', 'd'],
    }).model
    const shrunk = send(grouped, Reorder.Message.Reflect({}), {
      value: ['a', 'b', 'c'],
    }).model
    assert.equal(Reorder.isMoving(shrunk, 'd'), false)
  })

  it('resolves grab/drop/cancel and ignores modified idle keys', () => {
    const initial = Reorder.init()
    assert.deepEqual(
      resolved(initial, { key: ' ', itemKey: 'b' }),
      Reorder.Message.Grab({ key: 'b' }),
    )
    assert.equal(
      Option.isNone(
        Reorder.keydown(initial, { key: 'Enter', itemKey: 'b', ctrlKey: true }),
      ),
      true,
    )
    assert.equal(
      Option.isNone(Reorder.keydown(initial, { key: 'x', itemKey: 'b' })),
      true,
    )
    assert.deepEqual(
      resolved(grab(), { key: 'Enter', itemKey: 'b' }),
      Reorder.Message.Drop({}),
    )
    assert.deepEqual(
      resolved(grab(), { key: 'Tab', itemKey: 'b' }),
      Reorder.Message.Cancel({ restoreFocus: false }),
    )
    assert.deepEqual(
      resolved(grab(), { key: 'Escape', itemKey: 'b' }),
      Reorder.Message.Cancel({ restoreFocus: true }),
    )
    assert.deepEqual(
      resolved(grab(), { key: 'x', itemKey: 'b' }),
      Reorder.Message.Swallow({}),
    )
  })

  it('resolves axes, Home/End, RTL and non-wrapping grid rows', () => {
    const model = grab()
    assert.deepEqual(
      resolved(model, { key: 'ArrowUp', itemKey: 'b' }),
      Reorder.Message.Step({ delta: -1 }),
    )
    assert.deepEqual(
      resolved(model, {
        key: 'ArrowRight',
        itemKey: 'b',
        orientation: 'horizontal',
        rtl: true,
      }),
      Reorder.Message.Step({ delta: -1 }),
    )
    assert.deepEqual(
      resolved(model, {
        key: 'ArrowUp',
        itemKey: 'b',
        orientation: 'horizontal',
      }),
      Reorder.Message.Swallow({}),
    )
    assert.deepEqual(
      resolved(model, {
        key: 'ArrowDown',
        itemKey: 'b',
        orientation: 'grid',
        columns: 2,
      }),
      Reorder.Message.Step({ delta: 2 }),
    )
    assert.deepEqual(
      resolved(model, {
        key: 'ArrowUp',
        itemKey: 'b',
        orientation: 'grid',
        columns: 2,
      }),
      Reorder.Message.Swallow({}),
    )
    assert.deepEqual(
      resolved(model, { key: 'ArrowDown', itemKey: 'b', ctrlKey: true }),
      Reorder.Message.Swallow({}),
    )
    assert.deepEqual(
      resolved(model, { key: 'Home', itemKey: 'b' }),
      Reorder.Message.MoveTo({ index: 0 }),
    )
    assert.deepEqual(
      resolved(model, { key: 'End', itemKey: 'b' }),
      Reorder.Message.MoveTo({ index: 3 }),
    )
  })
})
