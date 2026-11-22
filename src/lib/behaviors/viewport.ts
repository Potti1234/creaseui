import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

/* Foldkit port of ui-sdk's createViewport: a pannable, zoomable canvas whose
   `{ x, y, zoom }` lives in the Model. `x`/`y` place the canvas origin inside
   the surface in screen pixels; `zoom: 1` is normal scale. */

export const Point = Schema.Struct({ x: Schema.Finite, y: Schema.Finite })
export type Point = typeof Point.Type
export const Rect = Schema.Struct({
  left: Schema.Finite,
  top: Schema.Finite,
  right: Schema.Finite,
  bottom: Schema.Finite,
})
export type Rect = typeof Rect.Type
export const Viewport = Schema.Struct({
  x: Schema.Finite,
  y: Schema.Finite,
  zoom: Schema.Finite,
})
export type Viewport = typeof Viewport.Type
export const Frame = Schema.Struct({
  left: Schema.Finite,
  top: Schema.Finite,
  width: Schema.Finite,
  height: Schema.Finite,
})
export type Frame = typeof Frame.Type

const PointerAt = Schema.Struct({ id: Schema.Int, at: Point })
const Gesture = Schema.Struct({
  pointers: Schema.Array(PointerAt),
  center: Point,
  distance: Schema.Finite,
})
type Gesture = typeof Gesture.Type

export const Model = Schema.Struct({
  viewport: Viewport,
  frame: Schema.Option(Frame),
  gesture: Schema.Option(Gesture),
  rest: Point,
})
export type Model = typeof Model.Type

export const ZoomKey = Schema.Literals(['+', '-', '0'])
export type ZoomKey = typeof ZoomKey.Type

export const Message = defineMessageUnion({
  MeasuredFrame: { frame: Frame },
  PressedSurface: { pointerId: Schema.Int, at: Point },
  MovedPointer: { pointerId: Schema.Int, at: Point },
  ReleasedPointer: { pointerId: Schema.Int },
  CancelledGesture: {},
  Wheeled: {
    at: Point,
    deltaX: Schema.Finite,
    deltaY: Schema.Finite,
    zoom: Schema.Boolean,
  },
  PressedZoomKey: { key: ZoomKey, at: Schema.Option(Point) },
  ScrolledPane: {
    dx: Schema.Finite,
    dy: Schema.Finite,
    focusIn: Schema.Boolean,
  },
  RestedPane: { at: Point },
})
export type Message = typeof Message.Type

export const Reason = Schema.Literals([
  'wheel',
  'drag',
  'pinch',
  'zoom-key',
  'focus-in',
  'find-in-page',
  'resize',
  'imperative',
])
export type Reason = typeof Reason.Type
export const OutMessage = defineMessageUnion({
  ChangedViewport: {
    viewport: Viewport,
    reason: Reason,
    announcement: Schema.Option(Schema.String),
  },
})
export type OutMessage = typeof OutMessage.Type

export type Options = Readonly<{
  minZoom?: number
  maxZoom?: number
  /** A canvas box kept covering the surface where it can, centered on any axis where it is smaller. */
  bounds?: Rect
  /** Veto a change, like ui-sdk's `set` returning false. */
  canCommit?: (viewport: Viewport, reason: Reason) => boolean
  message?: (zoom: number) => string
}>

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const identity: Viewport = { x: 0, y: 0, zoom: 1 }

export const init = (viewport: Viewport = identity): Model => ({
  viewport,
  frame: Option.none(),
  gesture: Option.none(),
  rest: { x: 0, y: 0 },
})

const emptyFrame: Frame = { left: 0, top: 0, width: 0, height: 0 }
const frameOf = (model: Model): Frame =>
  Option.getOrElse(model.frame, () => emptyFrame)

export const zoomMessage = (zoom: number): string =>
  `Zoom ${String(Math.round(zoom * 100))}%`

const clampZoom = (zoom: number, options: Options): number =>
  Math.min(options.maxZoom ?? 4, Math.max(options.minZoom ?? 0.1, zoom))

const constrainAxis = (
  position: number,
  zoom: number,
  low: number,
  high: number,
  size: number,
): number => {
  const span = (high - low) * zoom
  if (span <= size) return (size - span) / 2 - low * zoom
  return Math.min(0 - low * zoom, Math.max(size - high * zoom, position))
}

/** The viewport after zoom limits and `bounds`, which apply once the surface is measured. */
export const constrain = (
  model: Model,
  viewport: Viewport,
  options: Options = {},
): Viewport => {
  const zoom = clampZoom(viewport.zoom, options)
  const frame = frameOf(model)
  const { bounds } = options
  if (bounds === undefined || frame.width === 0 || frame.height === 0)
    return { x: viewport.x, y: viewport.y, zoom }
  return {
    x: constrainAxis(viewport.x, zoom, bounds.left, bounds.right, frame.width),
    y: constrainAxis(viewport.y, zoom, bounds.top, bounds.bottom, frame.height),
    zoom,
  }
}

const commit = (
  model: Model,
  value: Viewport,
  reason: Reason,
  options: Options,
  announce = false,
): UpdateReturn => {
  const next = constrain(model, value, options)
  const now = model.viewport
  if (next.x === now.x && next.y === now.y && next.zoom === now.zoom)
    return { model }
  if (options.canCommit?.(next, reason) === false) return { model }
  return {
    model: { ...model, viewport: next },
    outMessage: OutMessage.ChangedViewport({
      viewport: next,
      reason,
      announcement: announce
        ? Option.some((options.message ?? zoomMessage)(next.zoom))
        : Option.none(),
    }),
  }
}

/** A point on screen, like a pointer's `clientX`/`clientY`, in canvas units. */
export const toCanvas = (model: Model, client: Point): Point => {
  const { x, y, zoom } = model.viewport
  const frame = frameOf(model)
  return {
    x: (client.x - frame.left - x) / zoom,
    y: (client.y - frame.top - y) / zoom,
  }
}

/** A canvas point on screen, in client pixels. */
export const toScreen = (model: Model, point: Point): Point => {
  const { x, y, zoom } = model.viewport
  const frame = frameOf(model)
  return {
    x: point.x * zoom + x + frame.left,
    y: point.y * zoom + y + frame.top,
  }
}

/** A client rect, like an element's `getBoundingClientRect()`, in canvas units. */
export const rectOf = (model: Model, client: Rect): Rect => {
  const a = toCanvas(model, { x: client.left, y: client.top })
  const b = toCanvas(model, { x: client.right, y: client.bottom })
  return { left: a.x, top: a.y, right: b.x, bottom: b.y }
}

/** The part of the canvas on screen now. */
export const visible = (model: Model): Rect => {
  const { x, y, zoom } = model.viewport
  const frame = frameOf(model)
  return {
    left: -x / zoom,
    top: -y / zoom,
    right: (frame.width - x) / zoom,
    bottom: (frame.height - y) / zoom,
  }
}

export const setViewport = (
  model: Model,
  viewport: Viewport,
  options: Options = {},
  reason: Reason = 'imperative',
): UpdateReturn => commit(model, viewport, reason, options)

/** Pans by screen pixels. */
export const panBy = (
  model: Model,
  by: Point,
  options: Options = {},
  reason: Reason = 'imperative',
): UpdateReturn => {
  const { x, y, zoom } = model.viewport
  return commit(model, { x: x + by.x, y: y + by.y, zoom }, reason, options)
}

const zoomViewport = (
  model: Model,
  zoom: number,
  at: Option.Option<Point>,
  options: Options,
): Viewport => {
  const view = model.viewport
  const frame = frameOf(model)
  const client = Option.getOrElse(at, () => ({
    x: frame.left + frame.width / 2,
    y: frame.top + frame.height / 2,
  }))
  const px = client.x - frame.left
  const py = client.y - frame.top
  const next = clampZoom(zoom, options)
  const k = next / view.zoom
  return { x: px - (px - view.x) * k, y: py - (py - view.y) * k, zoom: next }
}

/** Zooms to a scale, keeping the canvas point under a client point still; the surface's center by default. */
export const zoomTo = (
  model: Model,
  zoom: number,
  at: Option.Option<Point> = Option.none(),
  options: Options = {},
  reason: Reason = 'imperative',
): UpdateReturn =>
  commit(model, zoomViewport(model, zoom, at, options), reason, options)

/** Zooms by a factor, like `1.25` in and `0.8` out. */
export const zoomBy = (
  model: Model,
  factor: number,
  at: Option.Option<Point> = Option.none(),
  options: Options = {},
  reason: Reason = 'imperative',
): UpdateReturn =>
  zoomTo(model, model.viewport.zoom * factor, at, options, reason)

export type FitOptions = Readonly<{ padding?: number; maxZoom?: number }>

/** Shows a canvas box whole and centered, zooming no further in than `maxZoom` (1 by default). */
export const fit = (
  model: Model,
  rect: Rect,
  fitOptions: FitOptions = {},
  options: Options = {},
): UpdateReturn => {
  const frame = frameOf(model)
  const padding = fitOptions.padding ?? 32
  const width = Math.max(rect.right - rect.left, 1)
  const height = Math.max(rect.bottom - rect.top, 1)
  const zoom = clampZoom(
    Math.min(
      (frame.width - padding * 2) / width,
      (frame.height - padding * 2) / height,
      fitOptions.maxZoom ?? 1,
    ),
    options,
  )
  return commit(
    model,
    {
      x: frame.width / 2 - (rect.left + width / 2) * zoom,
      y: frame.height / 2 - (rect.top + height / 2) * zoom,
      zoom,
    },
    'imperative',
    options,
  )
}

const revealShift = (
  low: number,
  high: number,
  from: number,
  to: number,
  pad: number,
): number => {
  if (high - low > to - from - pad * 2)
    return (from + to) / 2 - (low + high) / 2
  if (low < from + pad) return from + pad - low
  if (high > to - pad) return to - pad - high
  return 0
}

/** Pans the least distance that brings a canvas box into view, with `padding` screen pixels around it. */
export const reveal = (
  model: Model,
  rect: Rect,
  padding = 24,
  options: Options = {},
  reason: Reason = 'focus-in',
): UpdateReturn => {
  const { zoom } = model.viewport
  const seen = visible(model)
  const pad = padding / zoom
  const dx = revealShift(rect.left, rect.right, seen.left, seen.right, pad)
  const dy = revealShift(rect.top, rect.bottom, seen.top, seen.bottom, pad)
  return dx || dy
    ? panBy(model, { x: dx * zoom, y: dy * zoom }, options, reason)
    : { model }
}

const gestureOf = (pointers: Gesture['pointers']): Option.Option<Gesture> => {
  const [first, second] = pointers
  if (first === undefined) return Option.none()
  const count = pointers.length
  return Option.some({
    pointers,
    center: {
      x: pointers.reduce((sum, { at }) => sum + at.x, 0) / count,
      y: pointers.reduce((sum, { at }) => sum + at.y, 0) / count,
    },
    distance:
      second === undefined
        ? 0
        : Math.hypot(first.at.x - second.at.x, first.at.y - second.at.y),
  })
}

const moveGesture = (
  model: Model,
  gesture: Gesture,
  pointerId: number,
  at: Point,
  options: Options,
): UpdateReturn => {
  const pointers = gesture.pointers.map(pointer =>
    pointer.id === pointerId ? { id: pointerId, at } : pointer,
  )
  const next = Option.getOrThrow(gestureOf(pointers))
  const view = model.viewport
  const frame = frameOf(model)
  const pinching = pointers.length > 1 && gesture.distance > 0
  const result = pinching
    ? (() => {
        const zoom = clampZoom(
          view.zoom * (next.distance / gesture.distance),
          options,
        )
        const cx = (gesture.center.x - frame.left - view.x) / view.zoom
        const cy = (gesture.center.y - frame.top - view.y) / view.zoom
        return commit(
          model,
          {
            x: next.center.x - frame.left - cx * zoom,
            y: next.center.y - frame.top - cy * zoom,
            zoom,
          },
          'pinch',
          options,
        )
      })()
    : commit(
        model,
        {
          x: view.x + next.center.x - gesture.center.x,
          y: view.y + next.center.y - gesture.center.y,
          zoom: view.zoom,
        },
        'drag',
        options,
      )
  // Each move is relative to the committed viewport, so a constraint never leaves a dead zone.
  return { ...result, model: { ...result.model, gesture: Option.some(next) } }
}

const zoomKeyFactors = { '+': 1.25, '-': 0.8 } as const

export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): UpdateReturn => {
  switch (message._tag) {
    case 'MeasuredFrame': {
      const measured = { ...model, frame: Option.some(message.frame) }
      return commit(measured, measured.viewport, 'resize', options)
    }
    case 'PressedSurface': {
      const pointers = Option.match(model.gesture, {
        onNone: () => [],
        onSome: ({ pointers }) =>
          pointers.filter(({ id }) => id !== message.pointerId),
      })
      return {
        model: {
          ...model,
          gesture: gestureOf([
            ...pointers,
            { id: message.pointerId, at: message.at },
          ]),
        },
      }
    }
    case 'MovedPointer': {
      const gesture = Option.getOrUndefined(model.gesture)
      if (!gesture?.pointers.some(({ id }) => id === message.pointerId))
        return { model }
      return moveGesture(model, gesture, message.pointerId, message.at, options)
    }
    case 'ReleasedPointer':
      return {
        model: {
          ...model,
          gesture: Option.flatMap(model.gesture, ({ pointers }) =>
            gestureOf(pointers.filter(({ id }) => id !== message.pointerId)),
          ),
        },
      }
    case 'CancelledGesture':
      return Option.isNone(model.gesture)
        ? { model }
        : { model: { ...model, gesture: Option.none() } }
    case 'Wheeled': {
      if (!message.zoom)
        return panBy(
          model,
          { x: -message.deltaX, y: -message.deltaY },
          options,
          'wheel',
        )
      const delta = Math.max(-50, Math.min(50, message.deltaY))
      return zoomBy(
        model,
        Math.exp(-delta * 0.01),
        Option.some(message.at),
        options,
        'wheel',
      )
    }
    case 'PressedZoomKey': {
      const zoom =
        message.key === '0'
          ? 1
          : model.viewport.zoom * zoomKeyFactors[message.key]
      return commit(
        model,
        zoomViewport(model, zoom, message.at, options),
        'zoom-key',
        options,
        true,
      )
    }
    case 'ScrolledPane':
      return panBy(
        model,
        { x: -message.dx, y: -message.dy },
        options,
        message.focusIn ? 'focus-in' : 'find-in-page',
      )
    case 'RestedPane':
      return { model: { ...model, rest: message.at } }
  }
}

/** Whether one or more pointers are panning or pinching the surface. */
export const isGesturing = (model: Model): boolean =>
  Option.isSome(model.gesture)

/** Maps a key to a zoom key: `+`/`=` zoom in, `-`/`_` out, `0` back to 100%. */
export const zoomKey = (
  key: string,
  modifiers: Readonly<{ altKey: boolean; ctrlKey: boolean; metaKey: boolean }>,
): Option.Option<ZoomKey> => {
  if (modifiers.altKey || modifiers.ctrlKey || modifiers.metaKey)
    return Option.none()
  if (key === '+' || key === '=') return Option.some('+')
  if (key === '-' || key === '_') return Option.some('-')
  if (key === '0') return Option.some('0')
  return Option.none()
}

export const surfaceStyle = {
  position: 'relative',
  overflow: 'hidden',
  touchAction: 'none',
} as const

/** The world element's style: one transform for every item, so panning lays nothing out. */
export const style = (model: Model): Record<string, string> => {
  const { x, y, zoom } = model.viewport
  return {
    transform: `translate(${String(x + model.rest.x)}px, ${String(y + model.rest.y)}px) scale(${String(zoom)})`,
    transformOrigin: '0 0',
    '--canvas-zoom': String(zoom),
  }
}

type SurfaceMessage =
  | typeof Message.MeasuredFrame.Type
  | typeof Message.PressedSurface.Type
  | typeof Message.MovedPointer.Type
  | typeof Message.ReleasedPointer.Type
  | typeof Message.CancelledGesture.Type
  | typeof Message.Wheeled.Type
  | typeof Message.PressedZoomKey.Type

const itemSelector = '[data-viewport-item]'
const clientPoint = (event: MouseEvent): Point => ({
  x: event.clientX,
  y: event.clientY,
})
const wheelUnit = (event: WheelEvent, surface: Element): number =>
  event.deltaMode === WheelEvent.DOM_DELTA_LINE
    ? 16
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
      ? surface.clientHeight
      : 1

const isEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement)

const bindSurface = (
  surface: Element,
  send: (message: SurfaceMessage) => void,
  inputs: Readonly<{ wheel: boolean; keys: boolean }>,
) => {
  const root = new AbortController()
  const signal = root.signal
  const pointers = new Set<number>()
  let measured: Frame | undefined

  const measure = () => {
    const box = surface.getBoundingClientRect()
    const frame = {
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    }
    if (
      measured?.left === frame.left &&
      measured.top === frame.top &&
      measured.width === frame.width &&
      measured.height === frame.height
    )
      return
    measured = frame
    send(Message.MeasuredFrame({ frame }))
  }

  const release = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId)) return
    send(Message.ReleasedPointer({ pointerId: event.pointerId }))
  }
  const cancel = () => {
    if (pointers.size === 0) return
    pointers.clear()
    send(Message.CancelledGesture())
  }

  surface.addEventListener(
    'pointerdown',
    event => {
      if (
        !(event instanceof PointerEvent) ||
        event.defaultPrevented ||
        (event.pointerType === 'mouse' &&
          event.button !== 0 &&
          event.button !== 1) ||
        (event.target instanceof Element &&
          event.target.closest(itemSelector) !== null)
      )
        return
      event.preventDefault()
      try {
        surface.setPointerCapture(event.pointerId)
      } catch {
        // Surface listeners still see moves inside it without capture.
      }
      measure()
      pointers.add(event.pointerId)
      send(
        Message.PressedSurface({
          pointerId: event.pointerId,
          at: clientPoint(event),
        }),
      )
    },
    { signal },
  )
  surface.addEventListener(
    'pointermove',
    event => {
      if (!(event instanceof PointerEvent) || !pointers.has(event.pointerId))
        return
      send(
        Message.MovedPointer({
          pointerId: event.pointerId,
          at: clientPoint(event),
        }),
      )
    },
    { signal },
  )
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
    surface.addEventListener(
      type,
      event => {
        if (event instanceof PointerEvent) release(event)
      },
      { signal },
    )
  surface.ownerDocument.defaultView?.addEventListener('blur', cancel, {
    signal,
  })

  if (inputs.wheel)
    surface.addEventListener(
      'wheel',
      event => {
        if (!(event instanceof WheelEvent)) return
        event.preventDefault()
        measure()
        const unit = wheelUnit(event, surface)
        send(
          Message.Wheeled({
            at: clientPoint(event),
            deltaX: event.deltaX * unit,
            deltaY: event.deltaY * unit,
            zoom: event.ctrlKey || event.metaKey,
          }),
        )
      },
      { passive: false, signal },
    )

  if (inputs.keys)
    surface.addEventListener(
      'keydown',
      event => {
        if (
          !(event instanceof KeyboardEvent) ||
          event.defaultPrevented ||
          isEditable(event.target)
        )
          return
        Option.map(zoomKey(event.key, event), key => {
          event.preventDefault()
          measure()
          send(Message.PressedZoomKey({ key, at: Option.none() }))
        })
      },
      { signal },
    )

  const resize = new ResizeObserver(measure)
  resize.observe(surface)
  measure()

  return () => {
    root.abort()
    resize.disconnect()
  }
}

/** Binds pan, pinch and measurement to the surface; `wheel` and `keys` opt into ui-sdk's wheel and `+`/`-`/`0` handlers. */
export const Surface = Mount.defineStream('TrackViewportSurface', {
  args: { wheel: Schema.Boolean, keys: Schema.Boolean },
  messages: [
    Message.MeasuredFrame,
    Message.PressedSurface,
    Message.MovedPointer,
    Message.ReleasedPointer,
    Message.CancelledGesture,
    Message.Wheeled,
    Message.PressedZoomKey,
  ],
  execute: ({ element, wheel, keys }) =>
    Stream.callback<SurfaceMessage>(queue =>
      Effect.acquireRelease(
        Effect.sync(() =>
          bindSurface(element, message => Queue.offerUnsafe(queue, message), {
            wheel,
            keys,
          }),
        ),
        cleanup => Effect.sync(cleanup),
      ).pipe(Effect.andThen(Effect.never)),
    ),
})

type PaneMessage =
  | typeof Message.ScrolledPane.Type
  | typeof Message.RestedPane.Type

/* Find in page skips what a user can't scroll, so the pane rests scrolled far
   from its origin with the world offset to match, and any browser scroll
   (find, focus, a link to an id) becomes a pan. */
const restOffset = 1e5

const bindFindable = (pane: Element, send: (message: PaneMessage) => void) => {
  const doc = pane.ownerDocument
  const view = doc.defaultView
  const spacer = doc.createElement('div')
  spacer.setAttribute('aria-hidden', 'true')
  Object.assign(spacer.style, {
    position: 'absolute',
    insetInlineStart: `${String(restOffset * 2)}px`,
    insetBlockStart: `${String(restOffset * 2)}px`,
    width: '1px',
    height: '1px',
    visibility: 'hidden',
    pointerEvents: 'none',
  })
  const root = new AbortController()
  const signal = root.signal
  let rested: Point = { x: 0, y: 0 }
  let frame = 0
  let focusing = false

  const settle = () => {
    if (signal.aborted) return
    if (!spacer.isConnected) pane.append(spacer)
    const rtl = view?.getComputedStyle(pane).direction === 'rtl'
    pane.scrollLeft = rtl ? -restOffset : restOffset
    pane.scrollTop = restOffset
    const at = { x: pane.scrollLeft, y: pane.scrollTop }
    if (at.x === rested.x && at.y === rested.y) return
    rested = at
    send(Message.RestedPane({ at }))
  }

  pane.addEventListener(
    'focusin',
    () => {
      focusing = true
      requestAnimationFrame(() => (focusing = false))
    },
    { signal },
  )
  pane.addEventListener(
    'scroll',
    () => {
      if (!spacer.isConnected || (!pane.scrollLeft && !pane.scrollTop)) {
        settle()
        return
      }
      const dx = pane.scrollLeft - rested.x
      const dy = pane.scrollTop - rested.y
      if (!dx && !dy) return
      settle()
      send(Message.ScrolledPane({ dx, dy, focusIn: focusing }))
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(settle)
    },
    { signal },
  )
  const resize = new ResizeObserver(settle)
  resize.observe(pane)
  settle()

  return () => {
    root.abort()
    cancelAnimationFrame(frame)
    resize.disconnect()
    spacer.remove()
    pane.scrollLeft = 0
    pane.scrollTop = 0
    send(Message.RestedPane({ at: { x: 0, y: 0 } }))
  }
}

/** ui-sdk's `bindFindable`: mount on a `overflow: scroll` pane that fills the surface and holds only the world. */
export const Findable = Mount.defineStream('TrackViewportFindable', {
  messages: [Message.ScrolledPane, Message.RestedPane],
  execute: ({ element }) =>
    Stream.callback<PaneMessage>(queue =>
      Effect.acquireRelease(
        Effect.sync(() =>
          bindFindable(element, message => Queue.offerUnsafe(queue, message)),
        ),
        cleanup => Effect.sync(cleanup),
      ).pipe(Effect.andThen(Effect.never)),
    ),
})

export type ViewInputs = Readonly<{
  wheel?: boolean
  keys?: boolean
  findable?: boolean
  toView: (
    parts: Readonly<{
      surface: ReadonlyArray<ChildAttribute>
      pane: ReadonlyArray<ChildAttribute>
      world: ReadonlyArray<ChildAttribute>
      isGesturing: boolean
    }>,
  ) => Html
}>

export type Bundle = Readonly<{
  view: SubmodelView<Model, Message, ViewInputs>
  update: typeof update
}>

export const create = (): Bundle => ({
  update,
  view: defineView<Model, Message, ViewInputs>((model, inputs, h) =>
    inputs.toView({
      surface: childAttributes([
        h.DataAttribute('viewport-surface', ''),
        h.Style(surfaceStyle),
        h.OnMount(
          Surface({
            wheel: inputs.wheel ?? true,
            keys: inputs.keys ?? true,
          }),
        ),
        h.OnUnmount(Message.CancelledGesture()),
      ]),
      pane:
        inputs.findable === true
          ? childAttributes([
              h.Style({ position: 'absolute', inset: '0', overflow: 'scroll' }),
              h.OnMount(Findable()),
            ])
          : [],
      world: childAttributes([
        h.Style({ position: 'absolute', left: '0', top: '0', ...style(model) }),
      ]),
      isGesturing: isGesturing(model),
    }),
  ),
})

export const view = create().view
