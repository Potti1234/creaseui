import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  bindDrag,
  createAutoScroll,
  dragThreshold,
  edgeVelocity,
  isDrag,
} from '@/lib/behaviors/drag'

const clock = () => {
  let id = 0
  const frames = new Map<number, FrameRequestCallback>()
  return {
    frames,
    requestAnimationFrame(callback: FrameRequestCallback) {
      frames.set(++id, callback)
      return id
    },
    cancelAnimationFrame: (key: number) => frames.delete(key),
    step() {
      for (const [key, callback] of [...frames]) {
        if (frames.delete(key)) callback(0)
      }
    },
  }
}

const pointer = (
  type: string,
  x = 0,
  y = 0,
  pointerId = 1,
  buttons = 1,
): PointerEvent =>
  Object.assign(new Event(type), {
    clientX: x,
    clientY: y,
    pointerId,
    buttons,
    pointerType: 'mouse',
  }) as PointerEvent

const surface = () => {
  const raf = clock()
  const window = Object.assign(new EventTarget(), {
    requestAnimationFrame: raf.requestAnimationFrame,
    cancelAnimationFrame: raf.cancelAnimationFrame,
    setTimeout,
  })
  const document = Object.assign(new EventTarget(), { defaultView: window })
  const captures = new Set<number>()
  const handle = Object.assign(new EventTarget() as HTMLElement, {
    ownerDocument: document,
    setPointerCapture: (id: number) => captures.add(id),
    releasePointerCapture: (id: number) => captures.delete(id),
    hasPointerCapture: (id: number) => captures.has(id),
  })
  return { raf, document, window, handle, captures }
}

test('drag gates by either axis, ignores other pointers, and flushes before ending', () => {
  const { raf, document, handle, captures } = surface()
  const reports: Array<unknown> = []
  bindDrag(handle, pointer('pointerdown', 40, 40), {
    threshold: dragThreshold,
    onStart: () => {
      reports.push('start')
    },
    onMove: ({ x, y, movementX, movementY }) => {
      reports.push([x, y, movementX, movementY])
    },
    onEnd: (event, canceled) => reports.push([event.clientX, canceled]),
  })

  document.dispatchEvent(pointer('pointermove', 42, 42))
  document.dispatchEvent(pointer('pointermove', 90, 90, 2))
  document.dispatchEvent(pointer('pointerup', 90, 90, 2))
  assert.deepEqual(reports, [])
  assert.deepEqual([...captures], [1])
  document.dispatchEvent(pointer('pointermove', 43, 39))
  document.dispatchEvent(pointer('pointermove', 46, 38))
  assert.deepEqual(reports, ['start'])
  assert.equal(raf.frames.size, 1)
  document.dispatchEvent(pointer('pointerup', 46, 38))
  assert.deepEqual(reports, ['start', [46, 38, 6, -2], [46, false]])
  assert.equal(captures.size, 0)
  raf.step()
  assert.equal(reports.length, 3)
})

test('lost capture cancels once and manual cleanup drops queued samples', () => {
  const { raf, document, handle, captures } = surface()
  const reports: Array<unknown> = []
  const options = {
    onMove: () => reports.push('move'),
    onEnd: (_event: PointerEvent, canceled: boolean) => reports.push(canceled),
  }
  bindDrag(handle, pointer('pointerdown'), options)
  captures.clear()
  handle.dispatchEvent(pointer('lostpointercapture'))
  document.dispatchEvent(pointer('pointercancel'))
  assert.deepEqual(reports, [true])

  const stop = bindDrag(handle, pointer('pointerdown'), options)
  document.dispatchEvent(pointer('pointermove', 20))
  stop()
  assert.equal(captures.size, 0)
  raf.step()
  document.dispatchEvent(pointer('pointerup'))
  assert.deepEqual(reports, [true])
})

test('threshold and edge-speed helpers keep a dead zone and cap speed', () => {
  assert.equal(isDrag(2, -2), false)
  assert.equal(isDrag(0, -3), true)
  assert.equal(edgeVelocity(50, 0, 100, 20, 10), 0)
  assert.equal(edgeVelocity(10, 0, 100, 20, 10), -5)
  assert.equal(edgeVelocity(95, 0, 100, 20, 10), 7.5)
  assert.equal(edgeVelocity(-100, 0, 100, 20, 10), -10)
  assert.equal(edgeVelocity(8, 0, 9, 48, 18), 12)
  assert.equal(edgeVelocity(0, 0, 0, 48, 18), 0)
})

test('autoscroll ignores overlays, falls through a full inner scroller, and stops', () => {
  const raf = clock()
  const rect = () => ({ left: 0, right: 100, top: 0, bottom: 100 })
  const outer = {
    parentElement: null,
    getBoundingClientRect: rect,
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 200,
    scrollHeight: 200,
    clientWidth: 100,
    clientHeight: 100,
  }
  const inner = {
    ...outer,
    parentElement: outer,
    get scrollTop() {
      return 100
    },
    set scrollTop(_value: number) {},
  }
  const overlay = Object.assign(new EventTarget() as Element, {
    contains: (hit: unknown) => hit === overlay,
  })
  const doc = Object.assign(new EventTarget() as Document, {
    defaultView: {
      ...raf,
      getComputedStyle: () => ({ overflowX: 'auto', overflowY: 'auto' }),
    },
    elementsFromPoint: () => [overlay, inner, outer],
  })
  let scrolls = 0
  const scrolling = createAutoScroll(doc, {
    edge: 20,
    speed: 10,
    ignore: () => overlay,
    onScroll: () => scrolls++,
  })
  scrolling.update(90, 90)
  raf.step()
  raf.step()
  assert.deepEqual(
    [inner.scrollLeft, outer.scrollLeft, outer.scrollTop],
    [10, 0, 10],
  )
  assert.equal(scrolls, 2)
  scrolling.stop()
  raf.step()
  assert.equal(outer.scrollTop, 10)
  assert.equal(raf.frames.size, 0)
})
