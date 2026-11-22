import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'

import * as Swipe from '../src/lib/behaviors/swipe-actions.ts'

const options: Swipe.Options = { fullSwipeEnabled: () => true }
const initial = (rtl = false, start = 100, end = 100) =>
  ['a', 'b'].reduce(
    (model, key) =>
      Swipe.update(
        model,
        Swipe.Message.MeasuredRow({
          key,
          geometry: { width: 400, start, end, rtl },
        }),
      ).model,
    Swipe.init('test'),
  )
const press = (model: Swipe.Model) =>
  Swipe.update(
    model,
    Swipe.Message.PressedRow({ key: 'a', pointerId: 1, x: 0, y: 0, time: 0 }),
  ).model
const move = (
  model: Swipe.Model,
  x: number,
  time = 100,
  y = 0,
  config: Swipe.Options = {},
) =>
  Swipe.update(
    model,
    Swipe.Message.MovedPointer({ pointerId: 1, x, y, time }),
    config,
  ).model
const release = (model: Swipe.Model, time = 200, config: Swipe.Options = {}) =>
  Swipe.update(
    model,
    Swipe.Message.ReleasedPointer({ pointerId: 1, time }),
    config,
  )
const opened = (model: Swipe.Model) => Option.getOrThrow(model.open)
const key = (model: Swipe.Model, pressedKey: string, index = -1, count = 2) =>
  Swipe.update(
    model,
    Swipe.Message.PressedKey({ key: 'a', pressedKey, index, count }),
  )

describe('SwipeActions', () => {
  it('has Schema state and leaves taps, short and vertical gestures unpromoted', () => {
    assert.equal(Schema.is(Swipe.Model)(initial()), true)
    assert.ok(Option.isNone(release(move(press(initial()), 7)).model.open))
    const vertical = move(press(initial()), 10, 10, 10)
    assert.ok(Option.isNone(move(vertical, 100, 20).draft))
    assert.ok(Option.isNone(release(vertical).model.open))
    const diagonal = move(press(initial()), 7, 10, 4)
    assert.ok(Option.isSome(diagonal.draft))
  })

  it('settles at half width, below half closes, and one row is open at a time', () => {
    assert.ok(Option.isNone(release(move(press(initial()), 49)).model.open))
    assert.deepEqual(opened(release(move(press(initial()), 50)).model), {
      key: 'a',
      side: 'start',
    })
    const shown = Swipe.show(initial(), 'a', 'start').model
    assert.deepEqual(opened(Swipe.show(shown, 'b', 'end').model), {
      key: 'b',
      side: 'end',
    })
    assert.ok(Option.isNone(Swipe.close(shown).model.open))
  })

  it('uses flick velocity and closes on opposite flick', () => {
    assert.equal(
      opened(release(move(press(initial()), 15, 10), 11).model).side,
      'start',
    )
    const reversed = move(move(press(initial()), 80, 100), 60, 110)
    assert.ok(Option.isNone(release(reversed, 111).model.open))
  })

  it('ignores stale flicks and wrong pointer releases', () => {
    const draft = move(press(initial()), 15, 10)
    assert.ok(Option.isNone(release(draft, 51).model.open))
    assert.equal(
      Swipe.update(
        draft,
        Swipe.Message.ReleasedPointer({ pointerId: 2, time: 11 }),
      ).model,
      draft,
    )
  })

  it('cancellation suppresses full actions and velocity but preserves distance settlement', () => {
    const small = move(press(initial()), 15, 10)
    assert.ok(
      Option.isNone(
        Swipe.update(
          small,
          Swipe.Message.CancelledPointer({ pointerId: 1, time: 11 }),
        ).model.open,
      ),
    )
    const full = move(press(initial()), 260, 100, 0, options)
    const result = Swipe.update(
      full,
      Swipe.Message.CancelledPointer({ pointerId: 1, time: 101 }),
      options,
    )
    assert.equal(result.outMessage, undefined)
    assert.equal(opened(result.model).side, 'start')
    assert.ok(Option.isNone(result.model.draft))
  })

  it('requests full actions at 60 percent and accepts or rejects by version', () => {
    const almost = move(press(initial()), 239, 100, 0, options)
    assert.equal(Option.getOrThrow(almost.draft).full, false)
    const full = move(almost, 240, 110, 0, options)
    const result = release(full, 200, options)
    assert.deepEqual(
      result.outMessage,
      Swipe.OutMessage.RequestedFullSwipe({
        key: 'a',
        side: 'start',
        version: 1,
      }),
    )
    const accepted = Swipe.update(
      result.model,
      Swipe.Message.ResolvedFullSwipe({ version: 1, accepted: true }),
    ).model
    assert.ok(Option.isNone(accepted.open))
    assert.ok(Option.isNone(accepted.draft))
    const rejected = Swipe.update(
      result.model,
      Swipe.Message.ResolvedFullSwipe({ version: 1, accepted: false }),
    ).model
    assert.equal(opened(rejected).side, 'start')
    assert.equal(
      Swipe.update(
        result.model,
        Swipe.Message.ResolvedFullSwipe({ version: 0, accepted: true }),
      ).model,
      result.model,
    )
  })

  it('supports custom full fraction and rubber-bands beyond the relevant limit', () => {
    const custom = { ...options, fullSwipe: 0.5 }
    assert.equal(
      Option.getOrThrow(move(press(initial()), 200, 100, 0, custom).draft).full,
      true,
    )
    const ordinary = Swipe.offset(move(press(initial()), 200), 'a')
    assert.ok(ordinary > 100 && ordinary < 200)
    assert.equal(
      Swipe.offset(move(press(initial()), 200, 100, 0, options), 'a'),
      200,
    )
    const full = Swipe.offset(move(press(initial()), 500, 100, 0, options), 'a')
    assert.ok(full > 400 && full < 500)
  })

  it('reverses logical sides in RTL and never opens absent actions', () => {
    assert.equal(
      opened(release(move(press(initial(true)), 60)).model).side,
      'end',
    )
    assert.equal(
      Swipe.offset(Swipe.show(initial(true), 'a', 'start').model, 'a'),
      -100,
    )
    const absent = initial(false, 0)
    assert.equal(Swipe.show(absent, 'a', 'start').model, absent)
    const moved = move(press(absent), 300, 100, 0, options)
    assert.equal(Option.getOrThrow(moved.draft).full, false)
    assert.ok(Option.isNone(release(moved, 200, options).model.open))
  })

  it('blocks disabled presses, shows and keyboard and closes if disabled during a drag', () => {
    const disabled = { disabled: () => true }
    const model = initial()
    assert.equal(Swipe.show(model, 'a', 'start', disabled).model, model)
    assert.equal(
      Swipe.update(
        model,
        Swipe.Message.PressedRow({
          key: 'a',
          pointerId: 1,
          x: 0,
          y: 0,
          time: 0,
        }),
        disabled,
      ).model,
      model,
    )
    assert.equal(
      Swipe.update(
        model,
        Swipe.Message.PressedKey({
          key: 'a',
          pressedKey: 'ArrowRight',
          index: -1,
          count: 1,
        }),
        disabled,
      ).model,
      model,
    )
    assert.ok(
      Option.isNone(release(move(press(model), 80), 200, disabled).model.open),
    )
  })

  it('closes on outside press or a tap on open content', () => {
    const shown = Swipe.show(initial(), 'a', 'start').model
    assert.ok(Option.isNone(release(press(shown)).model.open))
    assert.ok(
      Option.isNone(
        Swipe.update(shown, Swipe.Message.PressedOutside()).model.open,
      ),
    )
  })

  it('keyboard reveals and focuses actions, navigates, and restores row focus', () => {
    const reveal = key(initial(), 'ArrowLeft')
    assert.equal(opened(reveal.model).side, 'end')
    assert.equal(reveal.commands?.length, 1)
    assert.equal(key(reveal.model, 'ArrowRight', 0).commands?.length, 1)
    assert.equal(key(reveal.model, 'ArrowRight', 1).commands?.length, undefined)
    const escape = key(reveal.model, 'Escape')
    assert.ok(Option.isNone(escape.model.open))
    assert.equal(escape.commands?.length, 1)
    assert.ok(Option.isNone(key(reveal.model, 'ArrowLeft', 0).model.open))
    assert.equal(opened(key(initial(true), 'ArrowLeft').model).side, 'start')
  })
})
