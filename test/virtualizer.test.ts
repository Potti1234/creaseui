import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Option, Schema, Stream } from 'effect'
import * as Scene from 'foldkit/scene'
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
    const previousStyle = Object.getOwnPropertyDescriptor(
      globalThis,
      'getComputedStyle',
    )
    Object.defineProperty(globalThis, 'document', {
      value: document,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'getComputedStyle', {
      value: document.defaultView!.getComputedStyle.bind(document.defaultView),
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
      await Effect.runPromise(
        V.ApplyScroll({
          id: 'list',
          scrollTop: 45,
          horizontal: true,
          version: 4,
        }).effect,
      )
      assert.equal(element.scrollLeft, 45)
      assert.equal(element.scrollTop, 120)
      element.style.direction = 'rtl'
      await Effect.runPromise(
        V.ApplyScroll({
          id: 'list',
          scrollTop: 60,
          horizontal: true,
          version: 5,
        }).effect,
      )
      assert.equal(element.scrollLeft, -60)
      await Effect.runPromise(
        V.ApplyScroll({
          id: 'list',
          scrollTop: 100,
          horizontal: true,
          expectedOffset: 60,
          version: 6,
        }).effect,
      )
      assert.equal(element.scrollLeft, -100)
      const skipped = await Effect.runPromise(
        V.ApplyScroll({
          id: 'list',
          scrollTop: 150,
          horizontal: true,
          expectedOffset: 60,
          version: 7,
        }).effect,
      )
      assert.equal(element.scrollLeft, -100)
      assert.deepEqual(skipped, V.Message.CompletedApplyScroll({ version: 7 }))
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
      if (previousStyle)
        Object.defineProperty(globalThis, 'getComputedStyle', previousStyle)
      else Reflect.deleteProperty(globalThis, 'getComputedStyle')
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
  it('restores the initial position only on the first measurement', () => {
    const restored = V.init({
      id: 'list',
      rowHeightPx: 20,
      initialScrollTop: 75,
    })
    const result = V.update(
      restored,
      V.Message.MeasuredContainer({ containerHeight: 100 }),
    )
    assert.deepEqual(result.model.pendingScroll, {
      _tag: 'ScrollingToIndex',
      index: 3,
      version: 1,
    })
    assert.equal(target(result), 75)
    const resized = V.update(
      result.model,
      V.Message.MeasuredContainer({ containerHeight: 120 }),
    )
    assert.equal(resized.commands, undefined)
    assert.equal(resized.model.pendingScroll, result.model.pendingScroll)
    assert.deepEqual(resized.model.measurement, {
      _tag: 'Measured',
      containerHeight: 120,
    })
  })
  it('keeps exact variable row boundaries and spacer heights', () => {
    const items = [10, 30, 80, 60, 20]
    const model = V.update(
      measured,
      V.Message.ScrolledContainer({ scrollTop: 40 }),
    ).model
    const window = V.visibleWindowVariable(model, items, height => height, 0)
    assert.deepEqual(Option.getOrThrow(window), {
      startIndex: 2,
      endIndex: 4,
      topSpacerHeight: 40,
      bottomSpacerHeight: 20,
    })
  })
  it('reuses one subview while keeping each item type', () => {
    assert.equal(V.view<string>(), V.view<number>())
  })

  it('uses horizontal spacers, intrinsic measured items and absolute ARIA positions', () => {
    const model = {
      ...V.init({
        id: 'sideways',
        orientation: 'horizontal',
        estimatedItemSize: 20,
        measureItems: true,
      }),
      measurement: measured.measurement,
      scrollTop: 20,
    }
    Scene.scene(
      {
        update: V.update,
        view: (model, h) => {
          const node = V.view<string>()(
            model,
            {
              items: Array.from({ length: 9 }, (_, index) => String(index)),
              itemToKey: value => value,
              itemToView: value => h.span([], [value]),
              overscan: 0,
            },
            h,
          )
          assert.equal(node?.data?.style?.['display'], 'flex')
          const [before, first, ...rest] = node?.children ?? []
          const after = rest.at(-1)
          assert.ok(before && typeof before !== 'string')
          assert.ok(first && typeof first !== 'string')
          assert.ok(after && typeof after !== 'string')
          assert.equal(before.data?.style?.['width'], '20px')
          assert.equal(after.data?.style?.['width'], '60px')
          assert.equal(first.data?.style?.['width'], undefined)
          return node
        },
      },
      Scene.given(model),
      Scene.expect(
        Scene.selector(
          '[aria-posinset="2"][data-virtual-list-measure-key="1"]',
        ),
      ).toExist(),
    )
    assert.equal(
      V.scrollToIndex(model, 9, 8).commands?.[0]?.args?.['horizontal'],
      true,
    )
  })

  it('accounts for leading content and sticky occlusion in windowing and alignment', () => {
    const layout = V.Layout.uniform(20, 20)
    const model = { ...measured, scrollMargin: 40 }
    assert.deepEqual(Option.getOrThrow(V.visibleRange(model, layout, 0)), {
      startIndex: 0,
      endIndex: 3,
      before: 0,
      after: 340,
    })
    const scrolled = { ...model, scrollTop: 80 }
    const sticky = {
      ...scrolled,
      stickyScrollMargin: true,
      orientation: 'horizontal' as const,
    }
    assert.deepEqual(Option.getOrThrow(V.visibleRange(scrolled, layout, 0)), {
      startIndex: 2,
      endIndex: 7,
      before: 40,
      after: 260,
    })
    assert.deepEqual(Option.getOrThrow(V.visibleRange(sticky, layout, 0)), {
      startIndex: 4,
      endIndex: 7,
      before: 80,
      after: 260,
    })
    for (const [align, ordinary, pinned] of [
      ['start', 240, 200],
      ['center', 200, 180],
      ['end', 160, 160],
      ['auto', 160, 160],
    ] as const) {
      assert.equal(
        target(V.scrollToIndexLayout(scrolled, layout, 10, { align })),
        ordinary,
      )
      const request = V.scrollToIndexLayout(sticky, layout, 10, { align })
      assert.equal(target(request), pinned)
      assert.equal(request.commands?.[0]?.args?.['horizontal'], true)
    }
    assert.equal(
      target(V.scrollToIndex(sticky, 20, 19, { align: 'start' })),
      340,
    )
    assert.equal(
      target(
        V.scrollToIndex({ ...model, scrollMargin: NaN }, 20, 10, {
          align: 'start',
        }),
      ),
      200,
    )
  })

  it('keeps disjoint rows in source order with exact spacers and measurement keys', () => {
    const model = {
      ...V.init({
        id: 'retained',
        estimatedItemSize: 20,
        measureItems: true,
        scrollMargin: 20,
      }),
      measurement: measured.measurement,
      scrollTop: 80,
      itemSizes: { 'row-0': 40, 'row-19': 50 },
    }
    const items = Array.from({ length: 20 }, (_, index) => `row-${index}`)
    const layout = V.dynamicLayout(model, { items, itemToKey: item => item })
    const range = Option.getOrThrow(V.visibleRange(model, layout, 0))
    assert.deepEqual(
      V.renderedIndices(range, items.length, [19, 0, 0, 2, -1, 20, 1.5, NaN]),
      [0, 2, 3, 4, 5, 6, 19],
    )
    assert.equal(
      V.isNearEnd(
        {
          startIndex: range.startIndex,
          endIndex: range.endIndex,
          topSpacerHeight: range.before,
          bottomSpacerHeight: range.after,
        },
        items.length,
      ),
      false,
    )
    Scene.scene(
      {
        update: V.update,
        view: (live, h) => {
          const node = V.view<string>()(
            live,
            {
              items,
              itemToKey: item => item,
              itemToView: item => h.span([], [item]),
              leadingContent: h.span([], ['Header']),
              overscan: 0,
              keep: [19, 0],
            },
            h,
          )
          const children = node?.children ?? []
          const elements = children.filter(child => typeof child !== 'string')
          assert.deepEqual(
            elements
              .map(child => child.data?.style?.['height'])
              .filter(size => size !== undefined),
            ['20px', '0px', '20px', '240px', '0px'],
          )
          assert.deepEqual(
            elements
              .filter(child => child.data?.attrs?.['role'] === 'listitem')
              .map(child => child.key),
            ['row-0', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6', 'row-19'],
          )
          return node
        },
      },
      Scene.given(model),
      Scene.expect(
        Scene.selector(
          '[aria-posinset="1"][aria-setsize="20"][data-virtual-list-measure-key="row-0"]',
        ),
      ).toExist(),
      Scene.expect(
        Scene.selector(
          '[aria-posinset="20"][aria-setsize="20"][data-virtual-list-measure-key="row-19"]',
        ),
      ).toExist(),
    )
  })

  it('measures by stable key across reorder, shares scroll offsets, and rejects stale resets', () => {
    const initial = V.init({
      id: 'dynamic',
      estimatedItemSize: 20,
      measureItems: true,
    })
    const model = V.update(
      { ...initial, measurement: measured.measurement },
      V.Message.MeasuredItems({ version: 0, sizes: { a: 70, b: 40, c: 0 } }),
    ).model
    const inputs = {
      items: ['b', 'a', 'c', 'constructor'],
      itemToKey: (key: string) => key,
    }
    const layout = V.dynamicLayout(model, inputs)
    assert.deepEqual(
      [0, 1, 2, 3, 4].map(layout.offsetAt),
      [0, 40, 110, 130, 150],
    )
    assert.deepEqual(Option.getOrThrow(V.visibleRange(model, layout, 0)), {
      startIndex: 0,
      endIndex: 2,
      before: 0,
      after: 40,
    })
    assert.equal(
      target(V.scrollToIndexLayout(model, layout, 1, { align: 'start' })),
      40,
    )
    const same = V.update(
      model,
      V.Message.MeasuredItems({ version: 0, sizes: { a: 70 } }),
    )
    assert.equal(same.model, model)
    const reset = V.resetMeasurements(model)
    assert.equal(V.dynamicLayout(reset, inputs).totalSize, 80)
    assert.equal(
      V.update(reset, V.Message.MeasuredItems({ version: 0, sizes: { a: 75 } }))
        .model,
      reset,
    )
    assert.equal(
      V.dynamicLayout(
        V.update(
          reset,
          V.Message.MeasuredItems({ version: 1, sizes: { a: 75 } }),
        ).model,
        inputs,
      ).totalSize,
      135,
    )
  })

  it('observes horizontal viewport, scroll and item sizes and disconnects on release', async () => {
    const window = new Window()
    const list = window.document.createElement('ul')
    list.id = 'observed-list'
    list.dataset['virtualListId'] = list.id
    list.style.direction = 'rtl'
    Object.defineProperty(list, 'clientWidth', { value: 200 })
    const row = window.document.createElement('li')
    row.dataset['virtualListMeasureKey'] = 'item'
    Object.defineProperty(row, 'offsetWidth', { value: 75 })
    const standIn = window.document.createElement('div')
    standIn.dataset['virtualListFindKey'] = 'row-8'
    standIn.dataset['virtualListFindIndex'] = '8'
    list.append(row, standIn)
    Object.defineProperties(window.HTMLElement.prototype, {
      hidden: {
        get(this: typeof standIn) {
          return this.getAttribute('hidden')
        },
        configurable: true,
      },
      onbeforematch: { value: null, configurable: true },
    })
    window.document.body.append(list)
    let disconnects = 0
    class TestResizeObserver {
      constructor(
        private readonly callback: (
          entries: ReadonlyArray<{ target: typeof list | typeof row }>,
        ) => void,
      ) {}
      observe(target: typeof list | typeof row) {
        queueMicrotask(() => {
          this.callback([{ target }])
          if (target === list) {
            list.scrollLeft = -50
            list.dispatchEvent(new window.Event('scroll'))
            standIn.dispatchEvent(
              new window.Event('beforematch', { bubbles: true }),
            )
          }
        })
      }
      disconnect() {
        disconnects += 1
      }
    }
    const globals = {
      document: window.document,
      HTMLElement: window.HTMLElement,
      MutationObserver: window.MutationObserver,
      ResizeObserver: TestResizeObserver,
      getComputedStyle: window.getComputedStyle.bind(window),
    }
    const previous = Object.entries(globals).map(([key, value]) => {
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, key)
      Object.defineProperty(globalThis, key, { value, configurable: true })
      return [key, descriptor] as const
    })
    try {
      const subscription = V.subscriptions.containerEvents
      const model = V.init({
        id: list.id,
        orientation: 'horizontal',
        estimatedItemSize: 20,
        measureItems: true,
        findInPage: true,
      })
      const events = await Effect.runPromise(
        subscription
          .dependenciesToStream(subscription.modelToDependencies(model))
          .pipe(Stream.take(4), Stream.runCollect, Effect.timeout('2 seconds')),
      )
      assert.deepEqual(Array.from(events), [
        V.Message.MeasuredContainer({ containerHeight: 200 }),
        V.Message.ScrolledContainer({ scrollTop: 50 }),
        V.Message.FoundItem({ key: 'row-8', index: 8 }),
        V.Message.MeasuredItems({ sizes: { item: 75 }, version: 0 }),
      ])
      assert.equal(disconnects, 2)
      const items = Array.from({ length: 12 }, (_, index) => `row-${index}`)
      const inputs = { items, itemToKey: (item: string) => item }
      const found = V.updateWithLayout(
        { ...model, measurement: measured.measurement },
        V.Message.FoundItem({ key: 'row-8', index: 9 }),
        inputs,
      )
      assert.equal(target(found), 120)
      assert.equal(found.commands?.[0]?.args?.['horizontal'], true)
      assert.equal(
        V.updateWithLayout(
          model,
          V.Message.FoundItem({ key: 'gone', index: 8 }),
          inputs,
        ).commands,
        undefined,
      )

      for (const enabled of [true, false]) {
        const searched = new Set<string>()
        Scene.scene(
          {
            update: V.update,
            view: (current, h) =>
              V.view<string>()(
                current,
                {
                  ...inputs,
                  itemToView: item => h.span([], [item]),
                  findable: item => {
                    searched.add(item)
                    return item
                  },
                  keep: [8],
                  overscan: 0,
                },
                h,
              ),
          },
          Scene.given({
            ...model,
            findInPage: enabled,
            measurement: measured.measurement,
            scrollTop: 0,
          }),
          Scene.expect(Scene.selector('[aria-posinset="9"]')).toExist(),
          Scene.expect(Scene.selector('[data-virtual-list-find-index="7"]'))[
            enabled ? 'toExist' : 'toBeAbsent'
          ](),
          Scene.expect(
            Scene.selector('[data-virtual-list-find-index="8"]'),
          ).toBeAbsent(),
        )
        assert.deepEqual(
          [...searched],
          enabled
            ? ['row-5', 'row-6', 'row-7', 'row-9', 'row-10', 'row-11']
            : [],
        )
      }
    } finally {
      for (const [key, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      }
      await window.close()
    }
  })

  it('corrects growth and shrinkage before the visible anchor with a sticky margin', () => {
    const model = {
      ...V.init({
        id: 'anchored',
        estimatedItemSize: 20,
        measureItems: true,
        preserveScrollAnchor: true,
        orientation: 'horizontal',
        scrollMargin: 30,
        stickyScrollMargin: true,
      }),
      measurement: measured.measurement,
      scrollTop: 65,
    }
    const inputs = {
      items: Array.from({ length: 20 }, (_, index) => String(index)),
      itemToKey: String,
    }
    const measure = (sizes: Record<string, number>) =>
      V.Message.MeasuredItems({ sizes, version: 0 })
    const grown = V.updateWithLayout(
      model,
      measure({ '0': 35, '1': 30, '3': 100, '7': 40 }),
      inputs,
    )
    assert.equal(target(grown), 90)
    assert.equal(grown.commands?.[0]?.args?.['expectedOffset'], 65)
    assert.equal(grown.commands?.[0]?.args?.['horizontal'], true)
    const settled = V.update(
      V.update(grown.model, V.Message.ScrolledContainer({ scrollTop: 90 }))
        .model,
      V.Message.CompletedApplyScroll({ version: 1 }),
    ).model
    assert.equal(
      target(V.updateWithLayout(settled, measure({ '0': 15 }), inputs)),
      70,
    )
    assert.equal(
      V.updateWithLayout(settled, measure({ '7': 60 }), inputs).commands,
      undefined,
    )
    assert.equal(
      V.updateWithLayout(grown.model, measure({ '0': 15 }), inputs).commands,
      undefined,
    )
    assert.equal(V.update(model, measure({ '0': 35 })).commands, undefined)
    assert.equal(
      V.updateWithLayout(
        { ...model, preserveScrollAnchor: false },
        measure({ '0': 35 }),
        inputs,
      ).commands,
      undefined,
    )
  })

  it('computes axis-neutral bounds without a rendered list', () => {
    const layout = V.Layout.variable([25, 15, 35, 25], size => size)
    assert.deepEqual(V.Layout.range(layout, 25, 50, 0), {
      startIndex: 1,
      endIndex: 3,
      before: 25,
      after: 25,
    })
    assert.deepEqual(V.Layout.range(layout, 25, 50, 1), {
      startIndex: 0,
      endIndex: 4,
      before: 0,
      after: 0,
    })
    assert.deepEqual(V.Layout.range(V.Layout.uniform(0, 20), 100, 50, 3), {
      startIndex: 0,
      endIndex: 0,
      before: 0,
      after: 0,
    })
  })

  it('exposes visible windows, near-end thresholds and row positions', () => {
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
