import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'

import * as Move from '../src/lib/behaviors/move.ts'

const positions = {
  a: { x: 10, y: 20 },
  b: { x: 50, y: 50 },
  locked: { x: 90, y: 90 },
}
const options: Move.Options = {
  group: () => ['a', 'b', 'locked', 'a'],
  disabled: key => key === 'locked',
  step: 5,
  scale: 2,
  bounds: key =>
    key === 'b' ? { minX: 0, maxX: 57, minY: 0, maxY: 60 } : undefined,
}
const press = Move.Message.PressedItem({
  key: 'a',
  pointerId: 1,
  at: { x: 50, y: 20 },
})
const move = (x: number, y: number, pointerId = 1) =>
  Move.Message.MovedPointer({ pointerId, at: { x, y } })
const release = Move.Message.ReleasedPointer({ pointerId: 1 })
const activeDrag = () =>
  Move.update(
    Move.update(Move.init(positions), press, options).model,
    move(68, 33),
    options,
  ).model

describe('Move', () => {
  it('keeps sub-threshold presses, additional pointers and disabled handles from moving items', () => {
    const initial = Move.init(positions)
    const armed = Move.update(initial, press, options).model
    assert.equal(Move.update(armed, move(52, 22), options).model, armed)
    assert.equal(Move.update(armed, move(60, 40, 2), options).model, armed)
    assert.deepEqual(Move.update(armed, release, options), { model: initial })
    assert.equal(
      Move.update(
        initial,
        Move.Message.PressedItem({ ...press, key: 'locked' }),
        options,
      ).model,
      initial,
    )
  })

  it('previews a scaled group offset without changing positions and commits one snapped, bounded drop', () => {
    const draft = activeDrag()
    assert.deepEqual(draft.positions, positions)
    assert.equal(Move.dragging(draft, 'a'), true)
    assert.equal(Move.dragging(draft, 'b'), true)
    assert.equal(Move.dragging(draft, 'locked'), false)
    assert.deepEqual(Move.style(draft, 'a'), {
      translate: '9px 6.5px',
      '--move-x': '9px',
      '--move-y': '6.5px',
    })
    const completed = Move.update(draft, release, options)
    assert.deepEqual(completed.model.positions, {
      a: { x: 20, y: 25 },
      b: { x: 57, y: 55 },
      locked: positions.locked,
    })
    assert.deepEqual(
      completed.outMessage,
      Move.OutMessage.MovedItems({
        keys: ['a', 'b'],
        reason: 'drag',
        label: 'a',
        at: { x: 20, y: 25 },
        announcement: '2 items moved to 20, 25.',
      }),
    )
    assert.deepEqual(Move.style(completed.model, 'a'), {})
    assert.deepEqual(Move.update(completed.model, release, options), {
      model: completed.model,
    })
    assert.deepEqual(
      Schema.decodeUnknownSync(Move.Model)(
        Schema.encodeSync(Move.Model)(draft),
      ),
      draft,
    )
  })

  it('discards the draft on cancellation or a veto, without an announcement', () => {
    const draft = activeDrag()
    for (const message of [
      Move.Message.CancelledPointer({ pointerId: 1 }),
      Move.Message.CancelledMove(),
    ]) {
      assert.deepEqual(Move.update(draft, message), {
        model: Move.init(positions),
      })
    }
    assert.deepEqual(
      Move.update(draft, release, {
        ...options,
        canCommit: (_positions, details) => details.reason !== 'drag',
      }),
      { model: Move.init(positions) },
    )
  })

  it('nudges the enabled group, honors large steps, and reports a localizable reason', () => {
    const initial = Move.init(positions)
    const nudged = Move.update(
      initial,
      Move.Message.NudgedItem({ key: 'a', arrow: 'ArrowUp', large: true }),
      {
        ...options,
        label: () => 'First item',
        message: ({ label }) => `Moved: ${label}`,
      },
    )
    assert.deepEqual(nudged.model.positions.a, { x: 10, y: -30 })
    assert.deepEqual(nudged.model.positions.b, { x: 50, y: 0 })
    assert.deepEqual(nudged.model.positions.locked, positions.locked)
    assert.equal(nudged.outMessage?.reason, 'move-key')
    assert.equal(nudged.outMessage?.announcement, 'Moved: First item')
    assert.deepEqual(
      Move.update(
        initial,
        Move.Message.NudgedItem({
          key: 'locked',
          arrow: 'ArrowUp',
          large: false,
        }),
        options,
      ),
      { model: initial },
    )
  })

  it('announces only the items that moved when a group member is at its bounds', () => {
    const initial = Move.init({ a: { x: 10, y: 20 }, b: { x: 0, y: 20 } })
    const nudged = Move.update(
      initial,
      Move.Message.NudgedItem({ key: 'a', arrow: 'ArrowRight', large: false }),
      {
        group: () => ['a', 'b'],
        bounds: () => ({ minX: 0, maxX: 10, minY: 0, maxY: 100 }),
        step: 5,
      },
    )
    assert.deepEqual(nudged.model.positions, {
      a: { x: 10, y: 20 },
      b: { x: 5, y: 20 },
    })
    assert.deepEqual(
      nudged.outMessage,
      Move.OutMessage.MovedItems({
        keys: ['b'],
        reason: 'move-key',
        label: 'b',
        at: { x: 5, y: 20 },
        announcement: 'b moved to 5, 20.',
      }),
    )
  })

  it('supports explicit offsets and positions but does not emit for no-ops', () => {
    const initial = Move.init(positions)
    const by = Move.moveBy(initial, ['a', 'locked'], { x: 2, y: 3 }, options)
    assert.deepEqual(by.model.positions.a, { x: 12, y: 23 })
    assert.deepEqual(by.model.positions.locked, { x: 92, y: 93 })
    assert.equal(by.outMessage?.reason, 'imperative')
    const to = Move.moveTo(by.model, 'b', { x: 100, y: 100 }, options)
    assert.deepEqual(to.model.positions.b, { x: 57, y: 60 })
    assert.deepEqual(Move.moveTo(to.model, 'b', { x: 100, y: 100 }, options), {
      model: to.model,
    })
    assert.equal(Option.isNone(to.model.draft), true)
  })
})
