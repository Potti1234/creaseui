import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Fiber, Option, Schema, Stream } from 'effect'
import * as Mount from 'foldkit/mount'
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

const nextTurn = (): Promise<void> =>
  new Promise(resolve => setImmediate(resolve))

const observe = async () => {
  const browser = new Window()
  const globals = ['document', 'PointerEvent', 'KeyboardEvent'] as const
  const descriptors = globals.map(key =>
    Object.getOwnPropertyDescriptor(globalThis, key),
  )
  globals.forEach(key =>
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: browser[key],
    }),
  )
  const surface = document.createElement('div')
  const child = document.createElement('div')
  surface.append(child)
  document.body.append(surface)
  const frames = new Map<number, FrameRequestCallback>()
  let frameId = 0
  Object.defineProperty(browser, 'requestAnimationFrame', {
    value: (callback: FrameRequestCallback) => {
      frames.set(++frameId, callback)
      return frameId
    },
  })
  Object.defineProperty(browser, 'cancelAnimationFrame', {
    value: (id: number) => {
      frames.delete(id)
    },
  })
  const messages: Array<Lasso.Message> = []
  const fiber = Effect.runFork(
    Stream.runForEach(
      Lasso.ObserveSurface().f(surface, Mount.liveViewStateChanges),
      message =>
        Effect.sync(() => {
          messages.push(message)
        }),
    ),
  )
  await nextTurn()
  const pointer = (
    type: string,
    options: PointerEventInit = {},
    target = document,
  ) => {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        isPrimary: true,
        button: 0,
        ...options,
      }),
    )
  }
  const down = (options: PointerEventInit = {}, target = surface) => {
    target.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        isPrimary: true,
        button: 0,
        ...options,
      }),
    )
  }
  const escape = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(event)
    return event
  }
  const flush = async () => {
    const callbacks = [...frames.values()]
    frames.clear()
    callbacks.forEach(callback => callback(0))
    await nextTurn()
  }
  const release = async () => {
    await Effect.runPromise(Fiber.interrupt(fiber))
  }
  return {
    browser,
    surface,
    child,
    frames,
    messages,
    pointer,
    down,
    escape,
    flush,
    release,
    close: async () => {
      await release()
      await browser.happyDOM.close()
      globals.forEach((key, index) => {
        const descriptor = descriptors[index]
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      })
    },
  }
}

describe('Lasso pointer lifecycle', () => {
  it('ignores idle events and rejected presses, coalesces the active pointer and detaches on pointerup', async () => {
    const observer = await observe()
    const { pointer, down, escape, flush, messages, frames, child } = observer
    try {
      pointer('pointermove', { clientX: 10 })
      pointer('pointerup')
      pointer('pointercancel')
      assert.equal(escape().defaultPrevented, false)
      down({ button: 2 })
      down({ isPrimary: false })
      down({}, child)
      pointer('pointermove')
      await flush()
      assert.deepEqual(messages, [])

      down({ shiftKey: true, clientX: 10, clientY: 20 })
      down({ pointerId: 2 })
      pointer('pointermove', { pointerId: 2 })
      assert.equal(frames.size, 0)
      pointer('pointermove', { clientX: 30, clientY: 40 })
      pointer('pointermove', { clientX: 50, clientY: 60 })
      assert.equal(frames.size, 1)
      await flush()
      assert.deepEqual(messages, [
        Lasso.Message.Started({
          pointerId: 1,
          point: { x: 10, y: 20 },
          shift: true,
        }),
        Lasso.Message.Moved({ pointerId: 1, point: { x: 50, y: 60 } }),
      ])
      pointer('pointermove', { clientX: 70, clientY: 80 })
      pointer('pointerup', { pointerId: 2 })
      assert.equal(frames.size, 1)
      pointer('pointerup', { clientX: 70, clientY: 80 })
      assert.equal(frames.size, 0)
      pointer('pointermove')
      pointer('pointerup')
      assert.equal(escape().defaultPrevented, false)
      await flush()
      assert.deepEqual(messages.slice(2), [
        Lasso.Message.Moved({ pointerId: 1, point: { x: 70, y: 80 } }),
        Lasso.Message.Ended({ pointerId: 1 }),
      ])
    } finally {
      await observer.close()
    }
  })

  it('commits the release position rather than the last move, with and without a pending frame', async () => {
    for (const flushBeforeRelease of [true, false]) {
      const observer = await observe()
      try {
        observer.down({ clientX: 100, clientY: 200 })
        observer.pointer('pointermove', { clientX: 145, clientY: 245 })
        if (flushBeforeRelease) await observer.flush()
        observer.pointer('pointerup', { clientX: 190, clientY: 250 })
        assert.equal(observer.frames.size, 0)
        await observer.flush()

        let model = Lasso.init({ id: 'surface' })
        let selection: Lasso.OutMessage | undefined
        for (const message of observer.messages) {
          const result = Lasso.update(model, message)
          model = result.model
          selection = result.outMessage
          if (message._tag === 'Started') {
            model = Lasso.update(
              model,
              Lasso.Message.Measured({
                version: model.version,
                box: Option.some(box),
                items,
              }),
            ).model
          }
        }
        assert.deepEqual(
          selection,
          Lasso.OutMessage.Selected({ keys: ['one', 'two'] }),
        )
        assert.equal(Option.isNone(model.session), true)
      } finally {
        await observer.close()
      }
    }
  })

  it('captures Escape only during a drag and drops queued movement on Escape and pointercancel', async () => {
    const observer = await observe()
    const { browser, pointer, down, escape, flush, messages, frames } = observer
    let bubbled = 0
    browser.document.addEventListener('keydown', () => {
      bubbled++
    })
    try {
      assert.equal(escape().defaultPrevented, false)
      assert.equal(bubbled, 1)
      down()
      pointer('pointermove')
      assert.equal(escape().defaultPrevented, true)
      assert.equal(bubbled, 1)
      assert.equal(frames.size, 0)
      pointer('pointermove')
      pointer('pointerup')
      await flush()
      assert.deepEqual(
        messages.map(message => message._tag),
        ['Started', 'Escaped'],
      )
      assert.equal(escape().defaultPrevented, false)
      assert.equal(bubbled, 2)

      down()
      pointer('pointermove')
      pointer('pointercancel', { pointerId: 2 })
      assert.equal(frames.size, 1)
      pointer('pointercancel')
      assert.equal(frames.size, 0)
      pointer('pointermove')
      pointer('pointerup')
      await flush()
      assert.deepEqual(
        messages.slice(2).map(message => message._tag),
        ['Started', 'CanceledPointer'],
      )
      assert.equal(escape().defaultPrevented, false)
    } finally {
      await observer.close()
    }
  })

  it('releases active document listeners, its pending frame and permanent pointerdown listener on unmount', async () => {
    const observer = await observe()
    try {
      observer.down()
      observer.pointer('pointermove')
      assert.equal(observer.frames.size, 1)
      await nextTurn()
      await observer.release()
      assert.equal(observer.frames.size, 0)
      observer.down()
      observer.pointer('pointermove')
      observer.pointer('pointerup')
      observer.pointer('pointercancel')
      assert.equal(observer.escape().defaultPrevented, false)
      await observer.flush()
      assert.deepEqual(
        observer.messages.map(message => message._tag),
        ['Started'],
      )
    } finally {
      await observer.close()
    }
  })
})
