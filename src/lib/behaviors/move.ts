import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

export const Point = Schema.Struct({ x: Schema.Finite, y: Schema.Finite })
export type Point = typeof Point.Type
export const Positions = Schema.Record(Schema.String, Point)
export type Positions = typeof Positions.Type

const Keys = Schema.Array(Schema.String)
const Pointer = Schema.Struct({
  id: Schema.Int,
  key: Schema.String,
  origin: Point,
})
const Draft = Schema.Struct({
  keys: Keys,
  dx: Schema.Finite,
  dy: Schema.Finite,
})
export const Model = Schema.Struct({
  positions: Positions,
  pointer: Schema.Option(Pointer),
  draft: Schema.Option(Draft),
})
export type Model = typeof Model.Type

const Arrow = Schema.Literals([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
])
const isArrow = Schema.is(Arrow)
const arrows = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
} satisfies Record<typeof Arrow.Type, Point>

export const Message = defineMessageUnion({
  PressedItem: { key: Schema.String, pointerId: Schema.Int, at: Point },
  MovedPointer: { pointerId: Schema.Int, at: Point },
  ReleasedPointer: { pointerId: Schema.Int },
  CancelledPointer: { pointerId: Schema.Int },
  CancelledMove: {},
  NudgedItem: { key: Schema.String, arrow: Arrow, large: Schema.Boolean },
})
export type Message = typeof Message.Type

export const Reason = Schema.Literals(['drag', 'move-key', 'imperative'])
export type Reason = typeof Reason.Type
const Movement = Schema.Struct({ keys: Keys, label: Schema.String, at: Point })
type Movement = typeof Movement.Type
export const OutMessage = defineMessageUnion({
  MovedItems: {
    ...Movement.fields,
    reason: Reason,
    announcement: Schema.String,
  },
})
export type OutMessage = typeof OutMessage.Type

export type Options = Readonly<{
  group?: (key: string) => ReadonlyArray<string>
  step?: number
  largeStep?: number
  scale?: number
  bounds?: (
    key: string,
  ) =>
    | Readonly<{ minX: number; minY: number; maxX: number; maxY: number }>
    | undefined
  disabled?: (key: string) => boolean
  label?: (key: string) => string | undefined
  message?: (movement: Movement) => string
  canCommit?: (
    positions: Positions,
    details: Readonly<{ keys: ReadonlyArray<string>; reason: Reason }>,
  ) => boolean
}>

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const init = (positions: Positions = {}): Model => ({
  positions: { ...positions },
  pointer: Option.none(),
  draft: Option.none(),
})

const origin = { x: 0, y: 0 }
export const position = (model: Model, key: string): Point =>
  Object.hasOwn(model.positions, key)
    ? (model.positions[key] ?? origin)
    : origin

const positive = (value: number | undefined, fallback: number): number =>
  value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback
const enabledKeys = (keys: ReadonlyArray<string>, options: Options) =>
  [...new Set(keys)].filter(key => options.disabled?.(key) !== true)
const group = (key: string, options: Options) =>
  enabledKeys(options.group?.(key) ?? [key], options)

export const moveMessage = ({ keys, label, at }: Movement): string =>
  `${keys.length > 1 ? `${keys.length} items` : label} moved to ${at.x}, ${at.y}.`

const commit = (
  model: Model,
  keys: ReadonlyArray<string>,
  by: Point,
  reason: Reason,
  options: Options,
): UpdateReturn => {
  if (keys.length === 0 || !Number.isFinite(by.x) || !Number.isFinite(by.y))
    return { model }

  const step = reason === 'drag' ? positive(options.step, 1) : 1
  const snap = (value: number) => Math.round(value / step) * step + 0
  const entries = keys.map(key => {
    const at = position(model, key)
    const x = snap(at.x + by.x)
    const y = snap(at.y + by.y)
    const box = options.bounds?.(key)
    const point =
      box === undefined
        ? { x, y }
        : {
            x: Math.min(box.maxX, Math.max(box.minX, x)),
            y: Math.min(box.maxY, Math.max(box.minY, y)),
          }
    return [key, point] as const
  })
  if (
    entries.some(
      ([, point]) => !Number.isFinite(point.x) || !Number.isFinite(point.y),
    )
  )
    return { model }
  const changed = entries.filter(
    ([key, point]) =>
      !Object.hasOwn(model.positions, key) ||
      point.x !== model.positions[key]?.x ||
      point.y !== model.positions[key]?.y,
  )
  const first = changed[0]
  if (first === undefined) return { model }
  const [key, at] = first
  const positions = { ...model.positions, ...Object.fromEntries(changed) }
  if (options.canCommit?.(positions, { keys, reason }) === false)
    return { model }
  const movement = {
    keys: changed.map(([key]) => key),
    label: options.label?.(key) ?? key,
    at,
  }
  return {
    model: { ...model, positions },
    outMessage: OutMessage.MovedItems({
      ...movement,
      reason,
      announcement: (options.message ?? moveMessage)(movement),
    }),
  }
}

export const moveBy = (
  model: Model,
  keys: ReadonlyArray<string>,
  by: Point,
  options: Options = {},
): UpdateReturn => commit(model, [...new Set(keys)], by, 'imperative', options)

export const moveTo = (
  model: Model,
  key: string,
  to: Point,
  options: Options = {},
): UpdateReturn => {
  const at = position(model, key)
  return moveBy(model, [key], { x: to.x - at.x, y: to.y - at.y }, options)
}

export const dragThreshold = 3
const crossedThreshold = (dx: number, dy: number) =>
  Math.max(Math.abs(dx), Math.abs(dy)) >= dragThreshold
const clearPointer = (model: Model): Model =>
  Option.isNone(model.pointer)
    ? model
    : { ...model, pointer: Option.none(), draft: Option.none() }

export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): UpdateReturn => {
  const pointer = Option.getOrUndefined(model.pointer)
  const draft = Option.getOrUndefined(model.draft)
  return Message.match<UpdateReturn>(message, {
    PressedItem: ({ key, pointerId, at }) =>
      pointer !== undefined || options.disabled?.(key) === true
        ? { model }
        : {
            model: {
              ...model,
              pointer: Option.some({ key, id: pointerId, origin: at }),
            },
          },
    MovedPointer: ({ pointerId, at }) => {
      if (pointer?.id !== pointerId) return { model }
      const dx = at.x - pointer.origin.x
      const dy = at.y - pointer.origin.y
      if (draft === undefined && !crossedThreshold(dx, dy)) return { model }
      const scale = positive(options.scale, 1)
      if (!Number.isFinite(dx / scale) || !Number.isFinite(dy / scale))
        return { model }
      const keys = draft?.keys ?? group(pointer.key, options)
      return {
        model: {
          ...model,
          draft: Option.some({ keys, dx: dx / scale, dy: dy / scale }),
        },
      }
    },
    ReleasedPointer: ({ pointerId }) => {
      if (pointer?.id !== pointerId) return { model }
      const cleared = clearPointer(model)
      return draft === undefined ||
        (draft.dx === 0 && draft.dy === 0) ||
        options.disabled?.(pointer.key) === true
        ? { model: cleared }
        : commit(
            cleared,
            enabledKeys(draft.keys, options),
            { x: draft.dx, y: draft.dy },
            'drag',
            options,
          )
    },
    CancelledPointer: ({ pointerId }) => ({
      model: pointer?.id === pointerId ? clearPointer(model) : model,
    }),
    CancelledMove: () => ({ model: clearPointer(model) }),
    NudgedItem: ({ key, arrow, large }) => {
      if (options.disabled?.(key) === true) return { model }
      const step = positive(options.step, 1)
      const distance = large ? positive(options.largeStep, 10 * step) : step
      const direction = arrows[arrow]
      return commit(
        model,
        group(key, options),
        { x: direction.x * distance, y: direction.y * distance },
        'move-key',
        options,
      )
    },
  })
}

const draftFor = (model: Model, key: string) =>
  Option.filter(model.draft, draft => draft.keys.includes(key))

export const dragging = (model: Model, key: string): boolean =>
  Option.isSome(draftFor(model, key))

export const style = (model: Model, key: string): Record<string, string> =>
  Option.match(draftFor(model, key), {
    onNone: () => ({}),
    onSome: ({ dx, dy }) => ({
      translate: `${dx}px ${dy}px`,
      '--move-x': `${dx}px`,
      '--move-y': `${dy}px`,
    }),
  })

type InputMessage =
  | typeof Message.PressedItem.Type
  | typeof Message.MovedPointer.Type
  | typeof Message.ReleasedPointer.Type
  | typeof Message.CancelledPointer.Type
  | typeof Message.NudgedItem.Type

const surfaceSelector = '[data-move-surface]'
const handleSelector = '[data-move-key]'
const clientPoint = (event: PointerEvent): Point => ({
  x: event.clientX,
  y: event.clientY,
})

const trackPointer = (
  target: Element,
  down: PointerEvent,
  send: (message: InputMessage) => void,
  onDrag: () => void,
  onFinish: () => void,
): (() => void) => {
  const doc = target.ownerDocument
  const { pointerId } = down
  const origin = clientPoint(down)
  const tracking = new AbortController()
  const listener = { capture: true, signal: tracking.signal }
  let didDrag = false

  const stop = () => {
    tracking.abort()
    if (target.hasPointerCapture(pointerId))
      target.releasePointerCapture(pointerId)
  }
  const finish = (cancelled: boolean) => {
    stop()
    onFinish()
    send(
      cancelled
        ? Message.CancelledPointer({ pointerId })
        : Message.ReleasedPointer({ pointerId }),
    )
  }

  try {
    target.setPointerCapture(pointerId)
  } catch {
    // Document listeners also work when capture is unavailable.
  }
  doc.addEventListener(
    'pointermove',
    event => {
      if (event.pointerId !== pointerId) return
      if (event.pointerType === 'mouse' && event.buttons === 0) {
        finish(false)
        return
      }
      const at = clientPoint(event)
      // The Model owns draft activation; this guard only controls click suppression.
      if (!didDrag && crossedThreshold(at.x - origin.x, at.y - origin.y)) {
        didDrag = true
        onDrag()
      }
      send(Message.MovedPointer({ pointerId, at }))
    },
    listener,
  )
  doc.addEventListener(
    'pointerup',
    event => {
      if (event.pointerId === pointerId) finish(false)
    },
    listener,
  )
  const cancel = (event: PointerEvent) => {
    if (event.pointerId === pointerId) finish(true)
  }
  doc.addEventListener('pointercancel', cancel, listener)
  doc.addEventListener('lostpointercapture', cancel, listener)
  doc.addEventListener(
    'keydown',
    event => {
      if (!didDrag || event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      finish(true)
    },
    listener,
  )
  doc.defaultView?.addEventListener('blur', () => finish(true), {
    signal: tracking.signal,
  })
  return stop
}

const bindInput = (surface: Element, send: (message: InputMessage) => void) => {
  const root = new AbortController()
  const signal = root.signal
  let stopTracking: (() => void) | undefined
  let suppressClick: Element | undefined

  const getKey = (handle: Element | null) =>
    handle?.closest(surfaceSelector) === surface &&
    !handle.hasAttribute('data-move-disabled')
      ? handle.getAttribute('data-move-key')
      : null

  const onKeyDown = (event: Event) => {
    if (
      !(event instanceof KeyboardEvent) ||
      !(event.target instanceof Element) ||
      event.defaultPrevented ||
      !event.altKey ||
      !isArrow(event.key)
    )
      return
    const key = getKey(event.target)
    if (key === null) return
    // Leave ordinary arrows to the component's focus navigation.
    event.preventDefault()
    event.stopPropagation()
    send(Message.NudgedItem({ key, arrow: event.key, large: event.shiftKey }))
  }

  const onClick = (event: Event) => {
    if (
      event instanceof MouseEvent &&
      event.detail !== 0 &&
      suppressClick !== undefined &&
      event.composedPath().includes(suppressClick)
    ) {
      suppressClick = undefined
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const onPointerDown = (event: Event) => {
    if (
      !(event instanceof PointerEvent) ||
      stopTracking !== undefined ||
      !(event.target instanceof Element) ||
      event.target.closest(surfaceSelector) !== surface
    )
      return
    suppressClick = undefined
    const target = event.target
    const handle = target.closest(handleSelector)
    const key = getKey(handle)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      !event.isPrimary ||
      handle === null ||
      key === null
    )
      return

    send(
      Message.PressedItem({
        key,
        pointerId: event.pointerId,
        at: clientPoint(event),
      }),
    )
    stopTracking = trackPointer(
      target,
      event,
      send,
      () => {
        suppressClick = handle
      },
      () => {
        stopTracking = undefined
      },
    )
  }

  surface.addEventListener('keydown', onKeyDown, { capture: true, signal })
  surface.addEventListener('click', onClick, { capture: true, signal })
  surface.addEventListener('pointerdown', onPointerDown, { signal })
  return () => {
    root.abort()
    stopTracking?.()
  }
}

const TrackInput = Mount.defineStream('TrackMoveInput', {
  messages: [
    Message.PressedItem,
    Message.MovedPointer,
    Message.ReleasedPointer,
    Message.CancelledPointer,
    Message.NudgedItem,
  ],
  execute: ({ element }) =>
    Stream.callback<InputMessage>(queue =>
      Effect.acquireRelease(
        Effect.sync(() =>
          bindInput(element, message => Queue.offerUnsafe(queue, message)),
        ),
        cleanup => Effect.sync(cleanup),
      ).pipe(Effect.andThen(Effect.never)),
    ),
})

export type ItemInfo<Key extends string> = Readonly<{
  key: Key
  position: Point
  isDragging: boolean
  style: Record<string, string>
  attributes: ReadonlyArray<ChildAttribute>
}>

export type ViewInputs<Key extends string = string> = Readonly<{
  keys: ReadonlyArray<Key>
  disabled?: (key: Key) => boolean
  toView: (
    surface: ReadonlyArray<ChildAttribute>,
    items: ReadonlyArray<ItemInfo<Key>>,
  ) => Html
}>

export type Bundle<Key extends string = string> = Readonly<{
  view: SubmodelView<Model, Message, ViewInputs<Key>>
  update: typeof update
}>

export const create = <Key extends string = string>(): Bundle<Key> => ({
  update,
  view: defineView<Model, Message, ViewInputs<Key>>((model, inputs, h) =>
    inputs.toView(
      childAttributes([
        h.DataAttribute('move-surface', ''),
        h.OnMount(TrackInput()),
        h.OnUnmount(Message.CancelledMove()),
      ]),
      inputs.keys.map(key => {
        const isDisabled = inputs.disabled?.(key) === true
        return {
          key,
          position: position(model, key),
          isDragging: dragging(model, key),
          style: style(model, key),
          attributes: childAttributes([
            h.DataAttribute('move-key', key),
            ...(isDisabled ? [h.DataAttribute('move-disabled', '')] : []),
          ]),
        }
      }),
    ),
  ),
})

export const view = create().view
