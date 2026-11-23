import { Effect, Queue, Schema, Stream } from 'effect'

export const Point = Schema.Struct({ x: Schema.Number, y: Schema.Number })
export type Point = typeof Point.Type

export const dragThreshold = 3

export const isDrag = (dx: number, dy: number, threshold = dragThreshold) =>
  Math.abs(dx) >= threshold || Math.abs(dy) >= threshold

export type PointerSample = Point &
  Readonly<{
    movementX: number
    movementY: number
    locked: boolean
    event: PointerEvent
  }>

type BindDragOptions = Readonly<{
  threshold?: number
  capture?: boolean
  lock?: boolean
  cancelOnEscape?: boolean
  onStart?: (event: PointerEvent) => boolean | void
  onMove: (sample: PointerSample) => void
  onEnd: (event: PointerEvent, canceled: boolean) => void
}>

const captureListener = { capture: true }

const suppressDragClick = (doc: Document, view: Window, pointerId: number) => {
  const clear = () => doc.removeEventListener('click', swallow, captureListener)
  const swallow = (event: MouseEvent) => {
    if (
      event.detail === 0 ||
      ('pointerId' in event && event.pointerId !== pointerId)
    )
      return
    event.preventDefault()
    event.stopPropagation()
    clear()
  }
  doc.addEventListener('click', swallow, captureListener)
  view.setTimeout(clear, 0)
}

/** Bridge one native pointer to its owner. Only listener, capture and frame
    bookkeeping lives here; consumers reduce gesture facts in their Model. */
export const bindDrag = (
  element: HTMLElement,
  down: PointerEvent,
  options: BindDragOptions,
): (() => void) => {
  const doc = element.ownerDocument
  const view = doc.defaultView
  if (!view) return () => {}

  const { pointerId } = down
  const threshold = options.threshold ?? 0
  let started = threshold <= 0 && !options.onStart
  let crossedClickThreshold = false
  let last = down
  let pending: PointerSample | undefined
  let frame: number | undefined
  let stopped = false
  let captured = false

  if (options.capture !== false) {
    try {
      element.setPointerCapture(pointerId)
      captured = true
    } catch {
      // Document listeners still follow the pointer if capture isn't available.
    }
  }

  function flush() {
    if (frame !== undefined) view?.cancelAnimationFrame(frame)
    frame = undefined
    const sample = pending
    pending = undefined
    if (sample) options.onMove(sample)
  }

  function stop() {
    if (stopped) return
    stopped = true
    if (frame !== undefined) view?.cancelAnimationFrame(frame)
    pending = undefined
    doc.removeEventListener('pointermove', move, captureListener)
    doc.removeEventListener('pointerup', up, captureListener)
    doc.removeEventListener('pointercancel', cancel, captureListener)
    doc.removeEventListener('keydown', escape, captureListener)
    element.removeEventListener('lostpointercapture', cancel)
    view?.removeEventListener('blur', blur)
    if (captured && element.hasPointerCapture(pointerId))
      element.releasePointerCapture(pointerId)
    if (options.lock && doc.pointerLockElement === element)
      doc.exitPointerLock()
  }

  function finish(event: PointerEvent, canceled: boolean) {
    if (stopped) return
    flush()
    stop()
    options.onEnd(event, canceled)
  }

  function move(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      finish(last, true)
      return
    }
    const dx = event.clientX - down.clientX
    const dy = event.clientY - down.clientY
    if (!started) {
      if (!isDrag(dx, dy, threshold)) return
      started = true
      if (options.onStart?.(event) === false) {
        stop()
        return
      }
    }
    if (!crossedClickThreshold && isDrag(dx, dy)) {
      crossedClickThreshold = true
      if (options.lock && down.pointerType === 'mouse') {
        try {
          void element.requestPointerLock?.()?.then(
            () => {
              if (stopped && doc.pointerLockElement === element)
                doc.exitPointerLock()
            },
            () => {},
          )
        } catch {
          // Use the captured pointer if the browser declines pointer lock.
        }
      }
    }
    const locked = doc.pointerLockElement === element
    pending = {
      x: event.clientX,
      y: event.clientY,
      movementX:
        (pending?.movementX ?? 0) +
        (locked ? event.movementX : event.clientX - last.clientX),
      movementY:
        (pending?.movementY ?? 0) +
        (locked ? event.movementY : event.clientY - last.clientY),
      locked,
      event,
    }
    last = event
    frame ??= view?.requestAnimationFrame(flush)
  }

  function up(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    if (view && crossedClickThreshold) suppressDragClick(doc, view, pointerId)
    finish(event, false)
  }

  function cancel(event: PointerEvent) {
    if (event.pointerId === pointerId) finish(event, true)
  }

  function blur() {
    finish(last, true)
  }

  function escape(event: KeyboardEvent) {
    if (!started || event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    finish(last, true)
  }

  doc.addEventListener('pointermove', move, captureListener)
  doc.addEventListener('pointerup', up, captureListener)
  doc.addEventListener('pointercancel', cancel, captureListener)
  if (captured) element.addEventListener('lostpointercapture', cancel)
  if (options.cancelOnEscape)
    doc.addEventListener('keydown', escape, captureListener)
  view.addEventListener('blur', blur)
  return stop
}

type DragBinding = BindDragOptions & Readonly<{ captureElement?: HTMLElement }>

/** Scope a single-pointer binding to a Foldkit streaming Mount. */
export const observeDrag = <Message>(
  element: HTMLElement,
  bind: (
    down: PointerEvent,
    send: (message: Message) => void,
  ) => DragBinding | undefined,
): Stream.Stream<Message> =>
  Stream.callback<Message>(queue =>
    Effect.acquireRelease(
      Effect.sync(() => {
        let stop: (() => void) | undefined
        const onDown = (event: PointerEvent) => {
          if (
            stop ||
            event.defaultPrevented ||
            event.button !== 0 ||
            (!event.isPrimary && event.pointerType !== 'mouse')
          )
            return
          const options = bind(event, message => {
            Queue.offerUnsafe(queue, message)
          })
          if (!options) return
          stop = bindDrag(options.captureElement ?? element, event, {
            ...options,
            ...(options.onStart && {
              onStart: start => {
                if (options.onStart?.(start) === false) {
                  stop = undefined
                  return false
                }
              },
            }),
            onEnd: (end, canceled) => {
              stop = undefined
              options.onEnd(end, canceled)
            },
          })
        }
        element.addEventListener('pointerdown', onDown)
        return () => {
          element.removeEventListener('pointerdown', onDown)
          stop?.()
        }
      }),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.andThen(Effect.never)),
  )

export const edgeVelocity = (
  point: number,
  start: number,
  end: number,
  edge: number,
  speed: number,
): number => {
  const band = Math.min(edge, (end - start) / 3)
  if (band <= 0) return 0
  if (point < start + band)
    return -speed * Math.min(1, (start + band - point) / band)
  if (point > end - band)
    return speed * Math.min(1, (point - (end - band)) / band)
  return 0
}

type AutoScrollOptions = Readonly<{
  edge?: number
  speed?: number
  ignore?: () => Element | null | undefined
  onScroll?: () => void
}>

/** Drive edge scroll on frames while the pointer is held still. */
export const createAutoScroll = (
  doc: Document,
  { edge = 48, speed = 18, ignore, onScroll }: AutoScrollOptions = {},
) => {
  const view = doc.defaultView
  let frame: number | undefined
  let point: Point | undefined

  const schedule = () => {
    frame ??= view?.requestAnimationFrame(tick)
  }
  function tick() {
    frame = undefined
    if (!point || !view) return
    const { x, y } = point
    const ignored = ignore?.()
    let element =
      doc.elementsFromPoint(x, y).find(hit => !ignored?.contains(hit)) ?? null
    let movedX = false
    let movedY = false

    while (element && !(movedX && movedY)) {
      const rect = element.getBoundingClientRect()
      const style = view.getComputedStyle(element)
      const scrollable = /^(auto|scroll|overlay)$/
      if (
        !movedX &&
        element.scrollWidth > element.clientWidth &&
        scrollable.test(style.overflowX)
      ) {
        const before = element.scrollLeft
        element.scrollLeft += edgeVelocity(
          x,
          rect.left,
          rect.right,
          edge,
          speed,
        )
        movedX = element.scrollLeft !== before
      }
      if (
        !movedY &&
        element.scrollHeight > element.clientHeight &&
        scrollable.test(style.overflowY)
      ) {
        const before = element.scrollTop
        element.scrollTop += edgeVelocity(y, rect.top, rect.bottom, edge, speed)
        movedY = element.scrollTop !== before
      }
      element = element.parentElement
    }

    if (!movedY) {
      const dy = edgeVelocity(y, 0, view.innerHeight, edge, speed)
      const before = view.scrollY
      if (dy) view.scrollBy({ top: dy, behavior: 'instant' })
      movedY = view.scrollY !== before
    }
    if (movedX || movedY) {
      onScroll?.()
      if (point) schedule()
    }
  }

  return {
    update(x: number, y: number) {
      point = { x, y }
      schedule()
    },
    stop() {
      point = undefined
      if (frame !== undefined) view?.cancelAnimationFrame(frame)
      frame = undefined
    },
  }
}
