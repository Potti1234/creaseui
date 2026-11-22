import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Area from '../src/lib/behaviors/area.ts'

describe('Area pure geometry and keys', () => {
  it('snaps on each axis grid, clamps and handles continuous and collapsed axes', () => {
    assert.equal(Area.clamp(2), 1)
    assert.equal(Area.snap(0.305), 0.31)
    assert.equal(Area.snap(100, { min: -1, max: 1, step: 0.3 }), 0.8)
    assert.equal(Area.snap(-100, { min: -1, max: 1 }), -1)
    assert.equal(Area.snap(0.123, { step: 0 }), 0.123)
    assert.equal(Area.snap(3, { min: 2, max: 2 }), 2)
    assert.equal(Area.snap(3e-12, { step: 1e-12 }), 3e-12)
    assert.equal(Area.fractionToValue(0.25, { min: -10, max: 10 }), -5)
    assert.equal(Area.fractionToValue(2), 1)
    assert.equal(Area.valueToFraction(-5, { min: -10, max: 10 }), 0.25)
    assert.equal(Area.valueToFraction(10, { min: 2, max: 2 }), 0)
  })

  it('maps arrows, shift, pages, bounds and RTL, leaving other keys alone', () => {
    const value = { x: 0.5, y: 0.5 }
    const next = (key: string, shift = false, options: Area.Options = {}) =>
      Option.getOrThrow(Area.keyToNextValue(value, key, shift, options))
    assert.deepEqual(next('ArrowRight'), { x: 0.51, y: 0.5 })
    assert.deepEqual(next('ArrowLeft', true), { x: 0.4, y: 0.5 })
    assert.deepEqual(next('ArrowRight', false, { rtl: true }), {
      x: 0.49,
      y: 0.5,
    })
    assert.deepEqual(next('ArrowUp'), { x: 0.5, y: 0.51 })
    assert.deepEqual(next('ArrowDown', true), { x: 0.5, y: 0.4 })
    assert.deepEqual(next('PageUp'), { x: 0.5, y: 0.6 })
    assert.deepEqual(next('PageDown', true), { x: 0.5, y: 0.4 })
    assert.deepEqual(next('Home'), { x: 0, y: 0.5 })
    assert.deepEqual(next('End'), { x: 1, y: 0.5 })
    assert.ok(Option.isNone(Area.keyToNextValue(value, 'Enter')))
    assert.ok(
      Option.isNone(
        Area.keyMessage('ArrowUp', {
          shiftKey: false,
          altKey: true,
          ctrlKey: false,
          metaKey: false,
        }),
      ),
    )
  })
})

describe('Area lifecycle and attributes', () => {
  it('ignores idle movement and release, then jumps, follows and commits once', () => {
    const initial = Area.init()
    assert.deepEqual(Area.update(initial, Area.Message.ReleasedPointer({})), {
      model: initial,
    })
    assert.deepEqual(
      Area.update(
        initial,
        Area.Message.MovedPointer({ fractions: { x: 1, y: 1 } }),
      ),
      { model: initial },
    )
    const press = Area.update(
      initial,
      Area.Message.PressedTrack({ fractions: { x: 0.2, y: 0.7 } }),
    )
    assert.equal(press.outMessage?.reason, 'track-press')
    const move = Area.update(
      press.model,
      Area.Message.MovedPointer({ fractions: { x: 2, y: -1 } }),
    )
    assert.deepEqual(move.model.value, { x: 1, y: 0 })
    assert.equal(move.outMessage?.reason, 'drag')
    const end = Area.update(move.model, Area.Message.ReleasedPointer({}))
    assert.deepEqual(
      end.outMessage,
      Area.OutMessage.CommittedValue({ value: { x: 1, y: 0 }, reason: 'drag' }),
    )
    assert.ok(Option.isNone(end.model.pressReason))
    const unchanged = Area.update(
      initial,
      Area.Message.PressedTrack({ fractions: initial.value }),
    )
    assert.equal(unchanged.outMessage, undefined)
    assert.equal(
      Area.update(unchanged.model, Area.Message.ReleasedPointer({})).outMessage
        ?.reason,
      'track-press',
    )
  })

  it('commits changed keys only and reports imperative sets without committing', () => {
    const initial = Area.init()
    assert.equal(
      Area.update(
        initial,
        Area.Message.PressedKey({ key: 'Home', shift: false }),
      ).outMessage,
      undefined,
    )
    assert.equal(
      Area.update(
        initial,
        Area.Message.PressedKey({ key: 'ArrowUp', shift: false }),
      ).outMessage?._tag,
      'CommittedValue',
    )
    assert.equal(
      Area.update(
        initial,
        Area.Message.RequestedValue({ value: { x: 0.345, y: 1.2 } }),
      ).outMessage?.reason,
      'imperative',
    )
    const disabled = { disabled: true }
    for (const message of [
      Area.Message.PressedTrack({ fractions: { x: 1, y: 1 } }),
      Area.Message.PressedKey({ key: 'End', shift: false }),
      Area.Message.RequestedValue({ value: { x: 1, y: 1 } }),
    ]) {
      assert.deepEqual(Area.update(initial, message, disabled), {
        model: initial,
      })
    }
    const press = Area.update(
      initial,
      Area.Message.PressedTrack({ fractions: { x: 1, y: 1 } }),
    ).model
    const end = Area.update(press, Area.Message.ReleasedPointer({}), disabled)
    assert.ok(Option.isNone(end.model.pressReason))
    assert.equal(end.outMessage, undefined)
  })

  it('reflects owner values and derives bottom-up fractions, styles and accessible text', () => {
    const model = Area.reflect(Area.init(), { x: 0.25, y: 0.75 })
    assert.deepEqual(Area.fractions(model), model.value)
    assert.equal(Area.thumbStyle(model).top, '25%')
    assert.equal(Area.thumbStyle(model).insetInlineStart, '25%')
    assert.equal(Area.thumbStyle(model)['--area-y'], '0.75')
    assert.deepEqual(Area.axisOf(), { min: 0, max: 1, step: 0.01 })
    assert.equal(Area.thumbAttrs(model)['aria-valuetext'], 'X 25%, Y 75%')
    const attrs = Area.thumbAttrs(model, {
      x: { label: 'Width' },
      y: { label: 'Height' },
      disabled: true,
    })
    assert.equal(attrs['aria-valuetext'], 'Width 25%, Height 75%')
    assert.equal(attrs['aria-disabled'], 'true')
    assert.equal(attrs.tabindex, '-1')
    assert.equal(attrs.role, 'slider')
    assert.equal(
      Area.thumbAttrs(model, { valueText: () => 'Custom' })['aria-valuetext'],
      'Custom',
    )
  })
})
