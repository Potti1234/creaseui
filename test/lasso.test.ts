import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Option, Schema } from 'effect'
import { Window } from 'happy-dom'

import * as Lasso from '../src/lib/behaviors/lasso.ts'

const box = { left: 100, top: 200, right: 500, bottom: 600 }
const items = [
  { key: 'one', rect: { left: 10, top: 10, right: 40, bottom: 40 } },
  { key: 'two', rect: { left: 50, top: 10, right: 80, bottom: 40 } },
]
const start = (options: Lasso.Options = {}) =>
  Lasso.update(
    Lasso.init({ id: 'surface' }),
    Lasso.Message.Started({
      pointerId: 1,
      point: { x: 100, y: 200 },
      shift: true,
    }),
    options,
  ).model
const measured = (options: Lasso.Options = {}) => {
  const model = start(options)
  return Lasso.update(
    model,
    Lasso.Message.Measured({
      version: model.version,
      box: Option.some(box),
      items,
    }),
    options,
  ).model
}
const move = (model: Lasso.Model, x: number, y: number) =>
  Lasso.update(model, Lasso.Message.Moved({ pointerId: 1, point: { x, y } }))
    .model

describe('Lasso geometry', () => {
  it('normalizes both drag directions and uses strict overlap', () => {
    const rect = Lasso.rectangle({ x: 40, y: 40 }, { x: 10, y: 10 })
    assert.deepEqual(rect, items[0]?.rect)
    assert.equal(
      Lasso.touches(rect, { left: 40, top: 10, right: 60, bottom: 40 }),
      false,
    )
    assert.equal(Lasso.touches(rect, rect), true)
    assert.deepEqual(Lasso.hits(rect, items), ['one'])
    assert.deepEqual(Lasso.hits(rect, []), [])
    assert.deepEqual(Lasso.hits(rect, items, ['two', 'two', 'one']), [
      'two',
      'one',
    ])
    assert.deepEqual(
      Lasso.hits(rect, items, [], () => false),
      [],
    )
    assert.deepEqual(
      Lasso.relative({ left: 110, top: 210, right: 140, bottom: 240 }, box),
      rect,
    )
  })

  it('provides singular, plural, empty and custom announcements', () => {
    assert.equal(Lasso.selectionMessage(0), '0 items selected.')
    assert.equal(Lasso.selectionMessage(1), '1 item selected.')
    assert.equal(Lasso.selectionMessage(2), '2 items selected.')
    assert.equal(
      Lasso.selectionMessage(2, count => `${count} chosen`),
      '2 chosen',
    )
  })
})

describe('Lasso update', () => {
  it('waits for three pixels on either axis and commits only a drawn rectangle', () => {
    const initial = measured()
    const below = move(initial, 102, 202)
    assert.equal(Option.isNone(below.draft), true)
    assert.equal(
      Lasso.update(below, Lasso.Message.Ended({ pointerId: 1 })).outMessage,
      undefined,
    )
    const at = move(initial, 103, 200)
    assert.equal(Option.isSome(at.draft), true)
    assert.equal(Option.isSome(move(initial, 100, 203).draft), true)
    const drawn = move(initial, 145, 245)
    assert.equal(Lasso.isTouched(drawn, 'one'), true)
    assert.equal(Lasso.isTouched(drawn, 'two'), false)
    const result = Lasso.update(drawn, Lasso.Message.Ended({ pointerId: 1 }))
    assert.deepEqual(
      result.outMessage,
      Lasso.OutMessage.Selected({ keys: ['one'] }),
    )
    assert.equal(Option.isNone(result.model.draft), true)
    assert.equal(Option.isNone(result.model.session), true)
    assert.equal(Schema.is(Lasso.Model)(result.model), true)
  })

  it('unions Shift selection base first and snapshots selectable items', () => {
    const model = move(
      measured({ selected: ['two', 'two'], selectable: key => key !== 'two' }),
      190,
      250,
    )
    assert.deepEqual(Option.getOrThrow(model.draft).keys, ['two', 'one'])
    const unshifted = Lasso.update(
      Lasso.init({ id: 'surface' }),
      Lasso.Message.Started({
        pointerId: 1,
        point: { x: 100, y: 200 },
        shift: false,
      }),
      { selected: ['two'] },
    ).model
    assert.deepEqual(Option.getOrThrow(unshifted.session).base, [])
    assert.deepEqual(
      Option.getOrThrow(
        move(measured({ selectable: () => false }), 190, 250).draft,
      ).keys,
      [],
    )
  })

  it('cancels Escape and pointercancel without selection, ignoring unrelated pointers', () => {
    const model = move(measured(), 145, 245)
    for (const message of [
      Lasso.Message.Escaped(),
      Lasso.Message.CanceledPointer({ pointerId: 1 }),
    ]) {
      const result = Lasso.update(model, message)
      assert.deepEqual(result.outMessage, Lasso.OutMessage.Canceled())
      assert.equal(Option.isNone(result.model.draft), true)
      assert.equal(Option.isNone(result.model.session), true)
    }
    for (const message of [
      Lasso.Message.Moved({ pointerId: 2, point: { x: 999, y: 999 } }),
      Lasso.Message.Ended({ pointerId: 2 }),
      Lasso.Message.CanceledPointer({ pointerId: 2 }),
    ])
      assert.deepEqual(Lasso.update(model, message), { model })
    const initial = Lasso.init({ id: 'surface' })
    assert.deepEqual(Lasso.update(initial, Lasso.Message.Escaped()), {
      model: initial,
    })
  })

  it('describes one measurement and handles delayed, missing and stale measurements', () => {
    const result = Lasso.update(
      Lasso.init({ id: 'surface' }),
      Lasso.Message.Started({
        pointerId: 1,
        point: { x: 100, y: 200 },
        shift: false,
      }),
    )
    assert.deepEqual(result.commands?.[0]?.args, { id: 'surface', version: 1 })
    const pending = move(result.model, 145, 245)
    assert.equal(Option.isNone(pending.draft), true)
    const ready = Lasso.update(
      pending,
      Lasso.Message.Measured({ version: 1, box: Option.some(box), items }),
    )
    assert.deepEqual(Option.getOrThrow(ready.model.draft), {
      left: 0,
      top: 0,
      right: 45,
      bottom: 45,
      keys: ['one'],
    })
    assert.deepEqual(ready.commands ?? [], [])
    assert.deepEqual(
      Lasso.update(
        pending,
        Lasso.Message.Measured({ version: 0, box: Option.some(box), items }),
      ),
      { model: pending },
    )
    assert.deepEqual(
      Lasso.update(
        pending,
        Lasso.Message.Measured({ version: 1, box: Option.none(), items: [] }),
      ).outMessage,
      Lasso.OutMessage.Canceled(),
    )
  })

  it('measures only owned items and converts viewport coordinates', async () => {
    const browser = new Window()
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'document')
    Object.defineProperty(globalThis, 'document', {
      value: browser.document,
      configurable: true,
    })
    const surface = document.createElement('div')
    surface.id = 'measured-surface'
    surface.getBoundingClientRect = () =>
      new browser.DOMRect(100, 200, 400, 400)
    const item = document.createElement('div')
    item.dataset.lassoItem = 'one'
    item.dataset.lassoOwner = surface.id
    item.getBoundingClientRect = () => new browser.DOMRect(110, 210, 30, 30)
    const other = document.createElement('div')
    other.dataset.lassoItem = 'other'
    other.dataset.lassoOwner = 'other-surface'
    surface.append(item, other)
    document.body.append(surface)
    try {
      const command = Lasso.Measure({ id: surface.id, version: 1 })
      const message = await Effect.runPromise(command.effect)
      assert.deepEqual(
        message,
        Lasso.Message.Measured({
          version: 1,
          box: Option.some(box),
          items: [items[0]!],
        }),
      )
    } finally {
      surface.remove()
      if (previous) Object.defineProperty(globalThis, 'document', previous)
      else Reflect.deleteProperty(globalThis, 'document')
      await browser.happyDOM.close()
    }
  })

  it('hides the rectangle when idle and emits surface-relative pixel styles', () => {
    assert.deepEqual(Lasso.rectangleStyle(measured()), { display: 'none' })
    assert.deepEqual(Lasso.rectangleStyle(move(measured(), 145, 245)), {
      position: 'absolute',
      'pointer-events': 'none',
      left: '0px',
      top: '0px',
      width: '45px',
      height: '45px',
    })
  })
})
