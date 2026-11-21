import { Effect, Queue, Schema, Stream } from 'effect'
import * as Mount from 'foldkit/mount'

import { DRAG_THRESHOLD, PointerMessage, type TrackRect } from './spans'

const trackSelector = '[data-span-track]'
const spanSelector = '[data-span-id]'
const editorSelector =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

const measure = (element: Element): TrackRect => {
  const { left, top, width, height } = element.getBoundingClientRect()
  return {
    track: element.getAttribute('data-span-track') ?? '',
    left,
    top,
    width,
    height,
    rtl: getComputedStyle(element).direction === 'rtl',
  }
}

const velocity = (
  position: number,
  start: number,
  end: number,
  edge: number,
  speed: number,
): number => {
  const band = Math.min(edge, (end - start) / 3)
  if (band <= 0) return 0
  if (position < start + band)
    return -speed * Math.min(1, (start + band - position) / band)
  if (position > end - band)
    return speed * Math.min(1, (position - end + band) / band)
  return 0
}

const scrollAt = (
  root: Element,
  x: number,
  y: number,
  edge: number,
  speed: number,
): boolean => {
  let scrolledX = false
  let scrolledY = false
  const { ownerDocument } = root
  const hit = ownerDocument.elementFromPoint(x, y)
  for (
    let element = hit && root.contains(hit) ? hit : root;
    element && !(scrolledX && scrolledY);
    element = element.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(element)
    const { left, right, top, bottom } = element.getBoundingClientRect()
    if (
      !scrolledX &&
      /auto|scroll|overlay/u.test(overflowX) &&
      element.scrollWidth > element.clientWidth
    ) {
      const before = element.scrollLeft
      element.scrollLeft += velocity(x, left, right, edge, speed)
      scrolledX = before !== element.scrollLeft
    }
    if (
      !scrolledY &&
      /auto|scroll|overlay/u.test(overflowY) &&
      element.scrollHeight > element.clientHeight
    ) {
      const before = element.scrollTop
      element.scrollTop += velocity(y, top, bottom, edge, speed)
      scrolledY = before !== element.scrollTop
    }
  }
  const view = ownerDocument.defaultView
  if (view && !scrolledY) {
    const before = view.scrollY
    const by = velocity(y, 0, view.innerHeight, edge, speed)
    if (by) view.scrollBy(0, by)
    scrolledY = before !== view.scrollY
  }
  return scrolledX || scrolledY
}

export const Pointer = Mount.defineStream('SpansPointer', {
  args: {
    autoScroll: Schema.Boolean,
    edge: Schema.Finite,
    speed: Schema.Finite,
  },
  messages: [
    PointerMessage.PressedTrack,
    PointerMessage.PressedSpan,
    PointerMessage.MovedPointer,
    PointerMessage.ReleasedPointer,
    PointerMessage.CancelledPointer,
    PointerMessage.CancelledDrag,
  ],
  execute: ({ element, viewStateChanges, autoScroll, edge, speed }) =>
    Stream.switchMap(viewStateChanges, state =>
      state === 'Paused'
        ? Stream.empty
        : Stream.callback<PointerMessage>(queue =>
            Effect.acquireRelease(
              Effect.sync(() => {
                if (!(element instanceof HTMLElement)) return () => {}
                const controller = new AbortController()
                const { signal } = controller
                const view = element.ownerDocument.defaultView
                let active: Readonly<{
                  id: number
                  x: number
                  y: number
                }> | null = null
                let last: Readonly<{ x: number; y: number }> | null = null
                let frame = 0
                let dragging = false
                const send = (message: PointerMessage): void => {
                  Queue.offerUnsafe(queue, message)
                }
                const move = (
                  point: Readonly<{ x: number; y: number }>,
                ): void => {
                  if (!active) return
                  const rects = Array.from(
                    element.querySelectorAll(trackSelector),
                    measure,
                  )
                  send(
                    PointerMessage.MovedPointer({
                      pointerId: active.id,
                      point,
                      rects,
                    }),
                  )
                }
                const tick = (): void => {
                  frame = 0
                  if (
                    !active ||
                    !last ||
                    !view ||
                    !scrollAt(element, last.x, last.y, edge, speed)
                  )
                    return
                  move(last)
                  frame = view.requestAnimationFrame(tick)
                }
                const finish = (cancelled: boolean): void => {
                  if (!active) return
                  const pointerId = active.id
                  active = null
                  last = null
                  dragging = false
                  view?.cancelAnimationFrame(frame)
                  frame = 0
                  if (element.hasPointerCapture(pointerId))
                    element.releasePointerCapture(pointerId)
                  send(
                    cancelled
                      ? PointerMessage.CancelledPointer({ pointerId })
                      : PointerMessage.ReleasedPointer({ pointerId }),
                  )
                }
                const down = (event: PointerEvent): void => {
                  if (
                    active ||
                    event.defaultPrevented ||
                    !event.isPrimary ||
                    event.button !== 0 ||
                    !(event.target instanceof Element)
                  )
                    return
                  const track = event.target.closest(trackSelector)
                  if (
                    !track ||
                    !element.contains(track) ||
                    event.target.closest(editorSelector)
                  )
                    return
                  const target = event.target.closest(spanSelector)
                  if (target?.getAttribute('aria-disabled') === 'true') return
                  const edge = event.target
                    .closest('[data-span-edge]')
                    ?.getAttribute('data-span-edge')
                  const { clientX: x, clientY: y, pointerId } = event
                  const rect = measure(track)
                  const point = { x, y }
                  const id = target?.getAttribute('data-span-id')
                  active = { id: pointerId, x, y }
                  element.setPointerCapture(pointerId)
                  send(
                    id == null
                      ? PointerMessage.PressedTrack({ rect, point, pointerId })
                      : PointerMessage.PressedSpan({
                          id,
                          edge:
                            edge === 'start' || edge === 'end' ? edge : null,
                          rect,
                          point,
                          pointerId,
                        }),
                  )
                }
                const moved = (event: PointerEvent): void => {
                  if (active?.id !== event.pointerId) return
                  const point = { x: event.clientX, y: event.clientY }
                  if (
                    !dragging &&
                    Math.max(
                      Math.abs(point.x - active.x),
                      Math.abs(point.y - active.y),
                    ) < DRAG_THRESHOLD
                  )
                    return
                  dragging = true
                  last = point
                  event.preventDefault()
                  move(point)
                  if (autoScroll && !frame && view)
                    frame = view.requestAnimationFrame(tick)
                }
                const up = (event: PointerEvent): void => {
                  if (active?.id === event.pointerId) finish(false)
                }
                const cancelled = (event: PointerEvent): void => {
                  if (active?.id === event.pointerId) finish(true)
                }
                element.addEventListener('pointerdown', down, { signal })
                element.addEventListener('pointermove', moved, { signal })
                element.addEventListener('pointerup', up, { signal })
                element.addEventListener('pointercancel', cancelled, { signal })
                element.addEventListener('lostpointercapture', cancelled, {
                  signal,
                })
                view?.addEventListener('blur', () => finish(true), { signal })
                view?.addEventListener(
                  'keydown',
                  event => {
                    if (
                      !active ||
                      event.key !== 'Escape' ||
                      event.defaultPrevented
                    )
                      return
                    event.preventDefault()
                    finish(true)
                  },
                  { signal },
                )
                return () => {
                  controller.abort()
                  finish(true)
                }
              }),
              dispose => Effect.sync(dispose),
            ),
          ),
    ),
})
