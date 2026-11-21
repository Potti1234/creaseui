import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Option, Schema } from 'effect'

import * as Spans from '../src/lib/behaviors/spans.ts'

const Booking = Schema.Struct({ ...Spans.Span.fields, title: Schema.String })
const spans = Spans.create(Booking)
const { Message } = spans
const a = { id: 'a', track: 'A', start: 20, end: 40, title: 'Design' }
const b = { id: 'b', track: 'B', start: 50, end: 70, title: 'Build' }
const rect = { track: 'A', left: 0, top: 0, width: 100, height: 30, rtl: false }
const rects = [rect, { ...rect, track: 'B', top: 40 }]
const options = {
  axis: 'x',
  tracks: ['A', 'B'],
  step: 10,
  overlap: false,
} as const
const drawOptions = {
  ...options,
  size: 30,
  maxSize: 30,
  create: (range: Omit<Spans.Span, 'id'>) =>
    Option.some({
      ...range,
      id: 'new',
      title: 'New',
    }),
}

const press = (edge?: 'start' | 'end') =>
  Message.PressedSpan({
    id: 'a',
    edge: Option.fromNullishOr(edge),
    rect,
    point: { x: edge === 'end' ? 40 : 23, y: 15 },
    pointerId: 1,
  })
const pressTrack = (x: number) =>
  Message.PressedTrack({ rect, point: { x, y: 15 }, pointerId: 1 })
const move = (x: number, y = 15, pointerId = 1) =>
  Message.MovedPointer({ rects, point: { x, y }, pointerId })
const release = Message.ReleasedPointer({ pointerId: 1 })
const key = (key: string, shift = false, rtl = false) =>
  Message.PressedKey({ id: 'a', key, shift, rtl })

describe('Spans', () => {
  it('keeps pointer movement in a Schema-validated draft and commits once on release', () => {
    const initial = spans.init([a, b])
    const pressed = spans.update(initial, press(), options).model
    assert.equal(spans.update(pressed, move(25), options).model, pressed)
    assert.equal(spans.update(pressed, move(30, 50, 2), options).model, pressed)
    const { model, outMessage } = spans.update(pressed, move(34, 50), options)
    const moved = { ...a, start: 30, end: 50, track: 'B' }
    assert.equal(outMessage, undefined)
    assert.deepEqual(model.spans, [a, b])
    assert.deepEqual(Schema.decodeUnknownSync(spans.Model)(model), model)
    assert.deepEqual(spans.spansOn(model, 'B'), [moved, b])
    assert.equal(spans.spanAttrs(model, 'a')['data-dragging'], '')
    const blocked = spans.update(model, move(54, 50), options).model
    assert.deepEqual(spans.spans(blocked), [moved, b])
    const dropped = spans.update(blocked, release, options)
    assert.deepEqual(
      dropped.outMessage,
      spans.OutMessage.ChangedSpans({
        spans: [moved, b],
        span: moved,
        reason: 'drag',
        action: 'move',
        movedTrack: true,
      }),
    )
    assert.deepEqual(dropped.model.drag, Option.none())
    assert.equal(
      spans.update(dropped.model, release, options).outMessage,
      undefined,
    )
  })

  it('draws backward from the first cell and fits click creation at the end of a track', () => {
    const initial = spans.init()
    const pressed = spans.update(initial, pressTrack(44), drawOptions).model
    const preview = spans.update(pressed, move(17), drawOptions).model
    const booking = { id: 'new', title: 'New', track: 'A', start: 20, end: 50 }
    assert.deepEqual(spans.action(preview, 'new'), Option.some('draw'))
    assert.deepEqual(spans.action(initial, 'new'), Option.none())
    assert.deepEqual(spans.spans(preview), [booking])
    assert.deepEqual(spans.update(preview, release, drawOptions).model.spans, [
      booking,
    ])
    const nearEnd = spans.update(initial, pressTrack(95), drawOptions).model
    assert.deepEqual(spans.update(nearEnd, release, drawOptions).model.spans, [
      { ...booking, start: 70, end: 100 },
    ])
    assert.equal(spans.update(initial, pressTrack(95), options).model, initial)
    assert.equal(
      spans.update(initial, pressTrack(95), {
        ...drawOptions,
        create: Option.none,
      }).model,
      initial,
    )
    assert.equal(
      spans.update(pressed, release, { ...drawOptions, size: 0 }).model.spans[0]
        ?.end,
      50,
    )
  })

  it('resizes either edge, cancels without committing, and announces the restored span', () => {
    const initial = spans.init([a])
    const pressed = spans.update(initial, press('end'), drawOptions).model
    const preview = spans.update(pressed, move(80), drawOptions).model
    assert.deepEqual(spans.spans(preview), [{ ...a, end: 50 }])
    assert.equal(spans.spanAttrs(preview, 'a')['data-resizing'], '')
    const cancelled = spans.update(
      preview,
      Message.CancelledDrag(),
      drawOptions,
    )
    assert.deepEqual(cancelled.model, initial)
    assert.deepEqual(
      cancelled.outMessage,
      spans.OutMessage.CancelledEdit({ span: a }),
    )
    assert.equal(Spans.spansMessage('cancel', a.title), 'Put back Design.')
    const startPressed = spans.update(
      initial,
      press('start'),
      drawOptions,
    ).model
    const startPreview = spans.update(startPressed, move(38), drawOptions).model
    assert.deepEqual(
      spans.update(startPreview, release, drawOptions).model.spans,
      [{ ...a, start: 30 }],
    )
  })

  it('reconciles owner changes, including metadata, removed spans and new overlaps', () => {
    const pressed = spans.update(spans.init([a]), press(), options).model
    const preview = spans.update(pressed, move(34, 50), options).model
    const retitled = { ...a, title: 'Updated' }
    const rebased = spans.update(
      preview,
      Message.ReflectedSpans({ spans: [retitled, b] }),
      options,
    ).model
    assert.deepEqual(spans.update(rebased, release, options).model.spans, [
      { ...retitled, track: 'B', start: 30, end: 50 },
      b,
    ])
    assert.deepEqual(
      spans.update(preview, Message.ReflectedSpans({ spans: [b] }), options)
        .model.drag,
      Option.none(),
    )
    assert.deepEqual(
      spans.update(
        preview,
        Message.ReflectedSpans({ spans: [a, { ...b, start: 49 }] }),
        options,
      ).model.drag,
      Option.none(),
    )
  })

  it('moves and resizes via the keyboard, handles RTL, tracks and Delete, and respects disabled', () => {
    const initial = spans.init([a, b])
    const moved = spans.update(initial, key('ArrowLeft', false, true), options)
    assert.deepEqual(moved.model.spans, [{ ...a, start: 30, end: 50 }, b])
    const resized = spans.update(moved.model, key('ArrowLeft', true), options)
    assert.deepEqual(resized.model.spans, [{ ...a, start: 30, end: 40 }, b])
    const crossed = spans.update(resized.model, key('ArrowDown'), options)
    assert.equal(crossed.model.spans[0]?.track, 'B')
    assert.equal(
      crossed.outMessage?._tag === 'ChangedSpans' &&
        crossed.outMessage.movedTrack,
      true,
    )
    const removed = spans.update(crossed.model, key('Backspace'), options)
    assert.deepEqual(removed.model.spans, [b])
    assert.equal(
      removed.outMessage?._tag === 'ChangedSpans' && removed.outMessage.reason,
      'remove-press',
    )
    assert.equal(
      spans.update(initial, key('Delete'), {
        ...options,
        isDisabled: () => true,
      }).model,
      initial,
    )
    assert.equal(
      spans.update(initial, press(), { ...options, isDisabled: () => true })
        .model,
      initial,
    )
    assert.equal(
      spans.update(initial, key('ArrowRight', false, true), {
        ...options,
        axis: 'y',
      }).model,
      initial,
    )
  })

  it('moves by one step from an off-grid start without decimal overlap drift', () => {
    const offGrid = { ...a, start: 0.05, end: 0.2 }
    const adjacent = { ...b, track: 'A', start: 0.3, end: 0.5 }
    const initial = spans.init([offGrid, adjacent])
    const moved = spans.update(initial, key('ArrowRight'), {
      ...options,
      max: 1,
      step: 0.1,
    })
    assert.deepEqual(moved.model.spans, [
      { ...offGrid, start: 0.15, end: 0.3 },
      adjacent,
    ])
  })

  it('edits and removes imperatively even if disabled, but still enforces overlap', () => {
    const initial = spans.init([a, b])
    const disabled = { ...options, isDisabled: () => true }
    assert.equal(
      spans.edit(initial, 'a', { track: 'B', end: 60 }, disabled).model,
      initial,
    )
    const edited = spans.edit(
      initial,
      'a',
      { track: 'B', start: 30, title: 'Updated' },
      disabled,
    )
    assert.equal(
      edited.outMessage?._tag === 'ChangedSpans' && edited.outMessage.reason,
      'imperative',
    )
    assert.equal(
      edited.outMessage?._tag === 'ChangedSpans' &&
        edited.outMessage.movedTrack,
      true,
    )
    assert.deepEqual(edited.model.spans, [
      { ...a, title: 'Updated', track: 'B', start: 30 },
      b,
    ])
    assert.deepEqual(
      spans.update(edited.model, Message.RemovedSpan({ id: 'a' }), disabled)
        .model.spans,
      [b],
    )
  })

  it('maps positions to snapped values and stacks connected overlaps by track', () => {
    assert.equal(
      Spans.valueAt({ ...rect, rtl: true }, { x: 67, y: 0 }, options),
      30,
    )
    assert.equal(
      Spans.valueAt(rect, { x: 0, y: 100 }, { min: 10, max: 20 }),
      20,
    )
    const c = { ...a, id: 'c', start: 30, end: 50 }
    const d = { ...a, id: 'd', start: 40, end: 60 }
    const e = { ...a, id: 'e', start: 60, end: 70 }
    assert.equal(Spans.isSpanFree([a, b], d), true)
    assert.equal(Spans.isSpanFree([a, b], c), false)
    const lanes = Spans.stackSpans([d, a, c, b, e])
    assert.deepEqual(
      [...lanes],
      [
        ['a', { lane: 0, lanes: 2 }],
        ['c', { lane: 1, lanes: 2 }],
        ['d', { lane: 0, lanes: 2 }],
        ['e', { lane: 0, lanes: 1 }],
        ['b', { lane: 0, lanes: 1 }],
      ],
    )
    assert.equal(
      Spans.spanStyle(a, options, lanes.get('a')),
      'position:absolute;inset-inline-start:20%;width:20%;top:0%;height:50%;--span-start:0.2;--span-size:0.2',
    )
  })
})
