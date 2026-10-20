import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Option } from 'effect'

import {
  colorToString,
  hex,
  hexToRgb,
  hsvToRgb,
  init,
  parseColorString,
  reflectValue,
  rgbToHex,
  rgbToHsv,
  update,
  Message,
} from '../src/lib/color-picker.ts'

describe('color conversions', () => {
  it('round-trips hex through rgb and hsv', () => {
    const rgb = hexToRgb('#3b82f6')
    assert.deepEqual(Option.getOrThrow(rgb), { r: 59, g: 130, b: 246, a: 1 })
    assert.equal(rgbToHex(Option.getOrThrow(rgb)), '#3b82f6')
  })

  it('parses three-digit and alpha-bearing hex', () => {
    assert.deepEqual(Option.getOrThrow(hexToRgb('#f0a')), {
      r: 255,
      g: 0,
      b: 170,
      a: 1,
    })
    assert.equal(Option.getOrThrow(hexToRgb('#ff000080')).a.toFixed(2), '0.50')
  })

  it('converts hsv to expected rgb primaries', () => {
    assert.deepEqual(hsvToRgb({ h: 0, s: 100, v: 100, a: 1 }), {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    })
    assert.deepEqual(hsvToRgb({ h: 120, s: 100, v: 100, a: 1 }), {
      r: 0,
      g: 255,
      b: 0,
      a: 1,
    })
    assert.deepEqual(hsvToRgb({ h: 240, s: 100, v: 100, a: 1 }), {
      r: 0,
      g: 0,
      b: 255,
      a: 1,
    })
  })

  it('round-trips rgb through hsv without hue drift', () => {
    const rgb = { r: 59, g: 130, b: 246, a: 1 }
    assert.deepEqual(hsvToRgb(rgbToHsv(rgb)), rgb)
  })
})

describe('parseColorString', () => {
  it('parses functional rgb and hsl', () => {
    assert.deepEqual(Option.getOrThrow(parseColorString('rgb(59, 130, 246)')), {
      r: 59,
      g: 130,
      b: 246,
      a: 1,
    })
    const red = Option.getOrThrow(parseColorString('hsl(0, 100%, 50%)'))
    assert.equal(red.r, 255)
    assert.equal(red.g, 0)
    assert.equal(red.b, 0)
  })

  it('parses space-separated values with slash alpha', () => {
    const parsed = Option.getOrThrow(parseColorString('rgb(255 0 0 / 50%)'))
    assert.equal(parsed.a.toFixed(1), '0.5')
  })

  it('rejects fragments and non-colors', () => {
    assert.ok(Option.isNone(parseColorString('#ff')))
    assert.ok(Option.isNone(parseColorString('oklch(0.5 0.1 20)')))
    assert.ok(Option.isNone(parseColorString('not-a-color')))
  })
})

describe('colorToString', () => {
  const red = { r: 255, g: 0, b: 0, a: 1 }
  it('formats each supported output format', () => {
    assert.equal(colorToString(red, 'hex'), '#ff0000')
    assert.equal(colorToString(red, 'rgb'), 'rgb(255, 0, 0)')
    assert.equal(colorToString(red, 'hsl'), 'hsl(0, 100%, 50%)')
    assert.equal(colorToString(red, 'hsb'), 'hsb(0, 100%, 100%)')
  })
})

describe('update', () => {
  const base = init({ id: 'picker', value: '#3b82f6' })

  it('moves the area thumb and emits the formatted value', () => {
    const pressed = update(
      base,
      Message.PressedChannel({ channel: 'area', x: 0.5, y: 0.5 }),
    )
    assert.equal(pressed.model.drag, 'area')
    const changed = pressed.outMessage
    assert.equal(changed?._tag, 'ChangedValue')
    assert.equal(changed?.value, hex(pressed.model))
    const moved = update(
      pressed.model,
      Message.MovedDragPointer({ x: 1, y: 0 }),
    )
    assert.equal(moved.model.color.s, 100)
    assert.equal(moved.model.color.v, 100)
    const released = update(moved.model, Message.ReleasedDragPointer())
    assert.equal(released.model.drag, 'idle')
  })

  it('maps hue and alpha channels to their ranges', () => {
    const hue = update(
      base,
      Message.PressedChannel({ channel: 'hue', x: 0.5, y: 0 }),
    )
    assert.equal(hue.model.color.h, 180)
    const alpha = update(
      base,
      Message.PressedChannel({ channel: 'alpha', x: 0.25, y: 0 }),
    )
    assert.equal(alpha.model.color.a, 0.25)
  })

  it('nudges channels by native-unit deltas and wraps hue', () => {
    /* Nudge deltas are native units: degrees for hue, percent for area,
       0..1 for alpha — the skin's arrow-key map supplies the step. */
    const hueNudged = update(
      base,
      Message.NudgedChannel({ channel: 'hue', x: -220, y: 0 }),
    )
    assert.ok(hueNudged.model.color.h > 350)
    const alphaNudged = update(
      base,
      Message.NudgedChannel({ channel: 'alpha', x: -0.3, y: 0 }),
    )
    assert.equal(alphaNudged.model.color.a.toFixed(2), '0.70')
  })

  it('keeps an unparseable input as a draft without emitting a value', () => {
    const typed = update(base, Message.ChangedInput({ text: '#f0' }))
    assert.equal(typed.model.draft, '#f0')
    assert.equal(typed.outMessage, undefined)
    assert.deepEqual(typed.model.color, base.color)
  })

  it('emits and adopts a parseable input immediately', () => {
    const typed = update(base, Message.ChangedInput({ text: '#22c55e' }))
    assert.equal(typed.model.draft, '#22c55e')
    const changed = typed.outMessage
    assert.equal(changed?._tag, 'ChangedValue')
    assert.equal(changed?.value, '#22c55e')
    assert.equal(hex(typed.model), '#22c55e')
  })

  it('keeps the typed text as the draft while emitting its formatted value', () => {
    /* Mid-typing a partial prefix like '#000' already parses — the draft
       must stay the typed text so the rest of '#0000ff' can append. */
    const typed = update(base, Message.ChangedInput({ text: '#000' }))
    assert.equal(typed.model.draft, '#000')
    assert.equal(typed.outMessage?.value, '#000000')
    const next = update(typed.model, Message.ChangedInput({ text: '#0000ff' }))
    assert.equal(next.model.draft, '#0000ff')
    assert.equal(next.outMessage?.value, '#0000ff')
    assert.equal(hex(next.model), '#0000ff')
  })

  it('resyncs the draft to the committed value on blur', () => {
    const typed = update(base, Message.ChangedInput({ text: 'garbage' }))
    const committed = update(typed.model, Message.CommittedInput())
    assert.equal(committed.model.draft, hex(base))
    assert.equal(committed.outMessage, undefined)
  })

  it('reformats the emitted value when the format select changes', () => {
    const next = update(base, Message.ChangedFormat({ format: 'rgb' }))
    assert.equal(next.model.format, 'rgb')
    assert.equal(next.outMessage, undefined)
    assert.ok(next.model.draft.startsWith('rgb('))
  })

  it('ignores channel input while disabled', () => {
    const disabled = init({ id: 'picker', value: '#3b82f6', disabled: true })
    const next = update(
      disabled,
      Message.PressedChannel({ channel: 'hue', x: 0.9, y: 0 }),
    )
    assert.deepEqual(next.model.color, disabled.color)
    assert.equal(next.outMessage, undefined)
  })

  it('reflectValue repoints the picker at an external hex', () => {
    const reflected = reflectValue(base, '#ef4444')
    assert.equal(hex(reflected), '#ef4444')
    assert.equal(reflected.draft, '#ef4444')
    const unchanged = reflectValue(base, 'oklch(0.5 0.1 20)')
    assert.equal(hex(unchanged), hex(base))
  })
})
