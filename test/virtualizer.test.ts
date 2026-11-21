import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Option, Schema } from 'effect'
import { Window } from 'happy-dom'
import * as V from '../src/lib/behaviors/virtualizer.ts'

const initial = V.init({ id: 'list', rowHeightPx: 20 })
const measured = V.update(
  initial,
  V.Message.MeasuredContainer({ containerHeight: 100 }),
).model
const target = (result: ReturnType<typeof V.scrollToIndex>) =>
  result.commands?.[0]?.args?.['scrollTop']

describe('Virtualizer', () => {
  it('applies scroll and completes even when the container has unmounted', async () => {
    const document = new Window().document
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'document')
    Object.defineProperty(globalThis, 'document', {
      value: document,
      configurable: true,
    })
    try {
      const element = document.createElement('div')
      element.id = 'list'
      document.body.append(element)
      const completion = await Effect.runPromise(
        V.ApplyScroll({ id: 'list', scrollTop: 120, version: 3 }).effect,
      )
      assert.equal(element.scrollTop, 120)
      assert.deepEqual(
        completion,
        V.Message.CompletedApplyScroll({ version: 3 }),
      )
      element.remove()
      assert.deepEqual(
        await Effect.runPromise(
          V.ApplyScroll({ id: 'list', scrollTop: 100, version: 4 }).effect,
        ),
        V.Message.CompletedApplyScroll({ version: 4 }),
      )
    } finally {
      if (previous) Object.defineProperty(globalThis, 'document', previous)
      else Reflect.deleteProperty(globalThis, 'document')
    }
  })
  it('aligns uniform and supplied variable heights in every mode', () => {
    for (const [align, expected] of [
      ['start', 200],
      ['center', 160],
      ['end', 120],
      ['auto', 120],
    ] as const) {
      assert.equal(
        target(V.scrollToIndex(measured, 100, 10, { align })),
        expected,
      )
      assert.equal(
        target(
          V.scrollToIndexVariable(
            measured,
            Array.from({ length: 100 }, () => 20),
            height => height,
            10,
            { align },
          ),
        ),
        expected,
      )
    }
    assert.equal(
      target(
        V.scrollToIndexVariable(
          measured,
          [10, 30, 80, 60],
          height => height,
          2,
          { align: 'start' },
        ),
      ),
      40,
    )
  })
  it('accounts for margin before the first row, including total height', () => {
    assert.equal(
      target(
        V.scrollToIndex(measured, 100, 10, {
          align: 'center',
          scrollMargin: 30,
        }),
      ),
      190,
    )
    assert.equal(
      target(
        V.scrollToIndex(measured, 100, 999, {
          align: 'start',
          scrollMargin: 30,
        }),
      ),
      1930,
    )
    assert.equal(
      target(
        V.scrollToIndexVariable(measured, [20, 20], height => height, 0, {
          align: 'start',
          scrollMargin: 200,
        }),
      ),
      140,
    )
  })
  it('clamps both edges and falls back to start before measurement', () => {
    assert.equal(
      target(V.scrollToIndex(measured, 100, -10, { align: 'end' })),
      0,
    )
    assert.equal(
      target(V.scrollToIndex(measured, 100, 999, { align: 'start' })),
      1900,
    )
    assert.equal(
      target(
        V.scrollToIndexVariable(measured, [20, 200], height => height, 99, {
          align: 'start',
        }),
      ),
      20,
    )
    for (const align of ['start', 'center', 'end', 'auto'] as const) {
      assert.equal(target(V.scrollToIndex(initial, 100, 10, { align })), 200)
      assert.equal(
        target(
          V.scrollToIndexVariable(initial, [30, 70], height => height, 1, {
            align,
          }),
        ),
        30,
      )
    }
  })
  it('auto is command-free when visible and scrolls only to the nearest edge', () => {
    assert.deepEqual(V.scrollToIndex(measured, 100, 2), { model: measured })
    const scrolled = { ...measured, scrollTop: 200 }
    assert.equal(target(V.scrollToIndex(scrolled, 100, 9)), 180)
    assert.equal(target(V.scrollToIndex(scrolled, 100, 15)), 220)
    assert.deepEqual(
      V.scrollToIndexVariable(measured, [20, 30], height => height, 1),
      { model: measured },
    )
  })
  it('returns no commands for empty collections or invalid indices', () => {
    assert.deepEqual(V.scrollToIndex(measured, 0, 0), { model: measured })
    assert.deepEqual(V.scrollToIndex(measured, 10, NaN), { model: measured })
    assert.deepEqual(
      V.scrollToIndexVariable(measured, [], () => 20, 0),
      { model: measured },
    )
    assert.deepEqual(
      V.scrollToIndexVariable(measured, [20], x => x, Infinity),
      { model: measured },
    )
  })
  it('keeps the Schema model and version guards Foldkit completion', () => {
    const first = V.scrollToIndex(measured, 100, 10)
    const second = V.scrollToIndex(first.model, 100, 20)
    assert.ok(Schema.is(V.Model)(second.model))
    assert.equal(second.model.pendingScrollVersion, 2)
    assert.deepEqual(second.model.pendingScroll, {
      _tag: 'ScrollingToIndex',
      index: 20,
      version: 2,
    })
    assert.equal(
      V.update(second.model, V.Message.CompletedApplyScroll({ version: 1 }))
        .model,
      second.model,
    )
    assert.equal(
      V.update(second.model, V.Message.CompletedApplyScroll({ version: 2 }))
        .model.pendingScroll._tag,
      'Idle',
    )
    assert.equal(
      V.update(second.model, V.Message.ScrolledContainer({ scrollTop: 320 }))
        .model.scrollTop,
      320,
    )
  })
  it('exposes Foldkit windows, near-end thresholds and row positions', () => {
    assert.ok(Option.isNone(V.visibleWindow(initial, 100, 2)))
    const window = Option.getOrThrow(
      V.visibleWindow({ ...measured, scrollTop: 1800 }, 100, 0),
    )
    assert.equal(V.isNearEnd(window, 100), true)
    assert.equal(V.isNearEnd(window, 100, 4), false)
    assert.equal(V.isNearEnd({ ...window, endIndex: 100 }, 100, 0), true)
    assert.equal(V.isNearEnd({ ...window, endIndex: 0 }, 0), false)
    assert.deepEqual(V.rowPosition(0, 100), {
      'aria-posinset': 1,
      'aria-setsize': 100,
    })
    assert.deepEqual(V.rowPosition(99, 100), {
      'aria-posinset': 100,
      'aria-setsize': 100,
    })
  })
})
