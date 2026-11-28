import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Dialog, DialogDismissReason, DialogProps } from '@effect/ui-kit'
import { Effect, Queue, Schema, Stream } from 'effect'

export const ZOOMED_SCALE = 2
export const KEYBOARD_PAN_STEP = 50

const Pose = Schema.Struct({
  x: Schema.Number,
  y: Schema.Number,
  zoom: Schema.Number,
})
export type LightboxPose = typeof Pose.Type
const identity: LightboxPose = { x: 0, y: 0, zoom: 1 }
const Frame = Schema.Struct({ width: Schema.Number, height: Schema.Number })

interface Movement {
  readonly zoom: number
  readonly x: number
  readonly y: number
  readonly focalX?: number
  readonly focalY?: number
}

export const constrainLightboxPose = (
  pose: LightboxPose,
  frame: typeof Frame.Type,
  movement: Movement,
): LightboxPose => {
  const zoom = Math.min(ZOOMED_SCALE, Math.max(1, movement.zoom))
  const ratio = zoom / pose.zoom
  const axis = (offset: number, delta: number, focal: number, size: number) => {
    if (zoom === 1) return 0
    const target = (offset - focal) * ratio + focal + delta
    // The first key press can arrive before the loaded image is measured.
    if (size <= 0) return target
    const boundary = (size * (zoom - 1)) / 2
    return Math.min(boundary, Math.max(-boundary, target))
  }
  return {
    zoom,
    x: axis(pose.x, movement.x, movement.focalX ?? 0, frame.width),
    y: axis(pose.y, movement.y, movement.focalY ?? 0, frame.height),
  }
}

const Message = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: { reason: DialogDismissReason },
  ObservedClosed: {},
  Navigated: { offset: Schema.Number },
  Zoomed: { command: Schema.Literals(['toggle', 'in', 'out']) },
  Panned: { x: Schema.Number, y: Schema.Number },
  Measured: { index: Schema.Number, frame: Frame },
  Dragged: {
    index: Schema.Number,
    x: Schema.Number,
    y: Schema.Number,
    focalX: Schema.Number,
    focalY: Schema.Number,
    scaleRatio: Schema.Number,
  },
  GestureChanged: { index: Schema.Number, active: Schema.Boolean },
})
type FrameMessage = Extract<
  typeof Message.Type,
  { _tag: 'Measured' | 'Dragged' | 'GestureChanged' }
>

const WatchVisibility = Mount.makeStream(
  'WatchCreaseLightboxVisibility',
  { args: { open: Schema.Boolean } },
  (_root: HTMLDivElement, _initial, changes) =>
    changes.pipe(
      Stream.filter(({ open }) => !open),
      Stream.map(() => Message.ObservedClosed()),
    ),
)

const WatchFrame = Mount.makeStream(
  'WatchCreaseLightboxFrame',
  { args: { index: Schema.Number } },
  (frame: HTMLDivElement, { index }) =>
    Stream.callback<FrameMessage>(queue =>
      Effect.gen(function* () {
        const pointers = new Map<number, { x: number; y: number }>()
        const reportSize = () =>
          Queue.offerUnsafe(
            queue,
            Message.Measured({
              index,
              frame: { width: frame.clientWidth, height: frame.clientHeight },
            }),
          )
        const geometry = () => {
          const [first, second] = [...pointers.values()]
          if (first === undefined) return { x: 0, y: 0, distance: 0 }
          if (second === undefined) return { ...first, distance: 0 }
          return {
            x: (first.x + second.x) / 2,
            y: (first.y + second.y) / 2,
            distance: Math.hypot(first.x - second.x, first.y - second.y),
          }
        }
        const down = (event: PointerEvent) => {
          if (
            (!frame.hasAttribute('data-zoomed') && pointers.size === 0) ||
            event.button !== 0 ||
            pointers.size >= 2
          )
            return
          pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
          frame.setPointerCapture(event.pointerId)
          if (pointers.size === 1) {
            Queue.offerUnsafe(
              queue,
              Message.GestureChanged({ index, active: true }),
            )
          }
        }
        const move = (event: PointerEvent) => {
          if (!pointers.has(event.pointerId)) return
          const before = geometry()
          pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
          const after = geometry()
          const bounds = frame.getBoundingClientRect()
          Queue.offerUnsafe(
            queue,
            Message.Dragged({
              index,
              x: after.x - before.x,
              y: after.y - before.y,
              focalX: before.x - bounds.left - bounds.width / 2,
              focalY: before.y - bounds.top - bounds.height / 2,
              scaleRatio:
                before.distance > 0 && after.distance > 0
                  ? after.distance / before.distance
                  : 1,
            }),
          )
        }
        const release = (event: PointerEvent) => {
          if (!pointers.delete(event.pointerId) || pointers.size > 0) return
          Queue.offerUnsafe(
            queue,
            Message.GestureChanged({ index, active: false }),
          )
        }
        const observer = new ResizeObserver(reportSize)
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            frame.addEventListener('pointerdown', down)
            frame.addEventListener('pointermove', move)
            frame.addEventListener('pointerup', release)
            frame.addEventListener('pointercancel', release)
            frame.addEventListener('lostpointercapture', release)
            observer.observe(frame)
            reportSize()
          }),
          () =>
            Effect.sync(() => {
              frame.removeEventListener('pointerdown', down)
              frame.removeEventListener('pointermove', move)
              frame.removeEventListener('pointerup', release)
              frame.removeEventListener('pointercancel', release)
              frame.removeEventListener('lostpointercapture', release)
              observer.disconnect()
            }),
        )
        return yield* Effect.never
      }),
    ),
)

const Props = Schema.Struct({
  ...DialogProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
  itemCount: Schema.Number,
  index: Schema.optional(Schema.Number),
  defaultIndex: Schema.optional(Schema.Number),
  zoomableIndices: Schema.optional(Schema.Array(Schema.Number)),
})
const Model = Schema.Struct({
  open: Schema.Boolean,
  index: Schema.Number,
  poseIndex: Schema.Number,
  pose: Pose,
  frame: Frame,
  dragging: Schema.Boolean,
})
const Events = UiSchema.TaggedEnum({
  Opened: {},
  Closed: { reason: DialogDismissReason },
  Selected: { index: Schema.Number },
})

const indexOf = (
  props: typeof Props.Type,
  model: Pick<typeof Model.Type, 'index'>,
) =>
  Math.min(
    Math.max(0, props.itemCount - 1),
    Math.max(0, Math.trunc(props.index ?? model.index)),
  )
const reset = (index: number) => ({
  poseIndex: index,
  pose: identity,
  frame: { width: 0, height: 0 },
  dragging: false,
})
const poseOf = (model: typeof Model.Type, index: number) =>
  model.poseIndex === index ? model : reset(index)

export const LightboxBehavior = Html.component({
  name: 'CreaseLightbox',
  props: Props,
  model: Model,
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => {
    const index = indexOf(props, { index: props.defaultIndex ?? 0 })
    return { open: props.defaultOpen ?? false, index, ...reset(index) }
  },
  update: {
    RequestedOpen: $ =>
      $.evolve({ open: true, ...reset(indexOf($.props, $.model)) }).emit(
        Events.Opened(),
      ),
    RequestedClose: ($, { reason }) =>
      $.evolve({ open: false }).emit(Events.Closed({ reason })),
    ObservedClosed: $ =>
      ($.props.open ?? $.model.open)
        ? $.model
        : $.evolve(reset(indexOf($.props, $.model))),
    Navigated: ($, { offset }) => {
      const current = indexOf($.props, $.model)
      const index = indexOf({ ...$.props, index: current + offset }, $.model)
      return index === current
        ? $.model
        : $.evolve({ index, ...reset(index) }).emit(Events.Selected({ index }))
    },
    Zoomed: ($, { command }) => {
      const index = indexOf($.props, $.model)
      if (!$.props.zoomableIndices?.includes(index)) return $.model
      const current = poseOf($.model, index)
      const zoom =
        command === 'out' || (command === 'toggle' && current.pose.zoom > 1)
          ? 1
          : ZOOMED_SCALE
      return $.evolve({
        ...current,
        pose: constrainLightboxPose(current.pose, current.frame, {
          zoom,
          x: 0,
          y: 0,
        }),
      })
    },
    Panned: ($, { x, y }) => {
      const index = indexOf($.props, $.model)
      const current = poseOf($.model, index)
      return $.evolve({
        poseIndex: index,
        pose: constrainLightboxPose(current.pose, current.frame, {
          zoom: current.pose.zoom,
          x,
          y,
        }),
      })
    },
    Measured: ($, { index, frame }) => {
      if (index !== indexOf($.props, $.model)) return $.model
      const current = poseOf($.model, index)
      const pose = constrainLightboxPose(current.pose, frame, {
        zoom: current.pose.zoom,
        x: 0,
        y: 0,
      })
      return $.evolve({ poseIndex: index, pose, frame })
    },
    Dragged: ($, gesture) => {
      if (gesture.index !== indexOf($.props, $.model) || !$.model.dragging)
        return $.model
      const pose = constrainLightboxPose($.model.pose, $.model.frame, {
        zoom: $.model.pose.zoom * gesture.scaleRatio,
        x: gesture.x,
        y: gesture.y,
        focalX: gesture.focalX,
        focalY: gesture.focalY,
      })
      return $.evolve({ pose })
    },
    GestureChanged: ($, { index, active }) =>
      index === indexOf($.props, $.model)
        ? $.evolve({ dragging: active })
        : $.model,
  },
  parts: (p, model) => {
    const {
      open = model.open,
      defaultOpen: _defaultOpen,
      defaultIndex: _defaultIndex,
      index: _index,
      itemCount,
      zoomableIndices,
      ...options
    } = p.props
    const index = indexOf(p.props, model)
    const { pose, dragging } = poseOf(model, index)
    const zoomable = zoomableIndices?.includes(index) ?? false
    const zoomed = zoomable && pose.zoom > 1
    const handleKey = (event: Html.KeyPayload, toggle = false) => {
      if (
        event.editable ||
        event.composing ||
        event.ctrl ||
        event.alt ||
        event.meta
      )
        return undefined
      if (toggle && (event.key === 'Enter' || event.key === ' '))
        return Message.Zoomed({ command: 'toggle' })
      if (zoomable && (event.key === '+' || event.key === '='))
        return Message.Zoomed({ command: 'in' })
      if (zoomable && (event.key === '-' || event.key === '_'))
        return Message.Zoomed({ command: 'out' })
      if (!zoomed) {
        if (event.key === 'ArrowLeft' && index > 0)
          return Message.Navigated({ offset: -1 })
        if (event.key === 'ArrowRight' && index + 1 < itemCount)
          return Message.Navigated({ offset: 1 })
        return undefined
      }
      switch (event.key) {
        case 'ArrowLeft':
          return Message.Panned({ x: KEYBOARD_PAN_STEP, y: 0 })
        case 'ArrowRight':
          return Message.Panned({ x: -KEYBOARD_PAN_STEP, y: 0 })
        case 'ArrowUp':
          return Message.Panned({ x: 0, y: KEYBOARD_PAN_STEP })
        case 'ArrowDown':
          return Message.Panned({ x: 0, y: -KEYBOARD_PAN_STEP })
      }
    }
    const keys = p.part('div', element =>
      element.on('keydown', handleKey, { preventDefault: true }),
    )
    const frame = p.part('div', element =>
      !zoomable
        ? element
        : element
            .attrs({
              role: 'button',
              tabindex: '0',
              'aria-pressed': String(zoomed),
              'aria-label': zoomed
                ? 'Zoom out. Use arrow keys or drag to pan.'
                : 'Zoom in. Double-click or press Enter to zoom.',
              'data-zoomable': '',
              'data-zoomed': zoomed ? '' : undefined,
              'data-panning': dragging ? '' : undefined,
            })
            .on('dblclick', Message.Zoomed({ command: 'toggle' }))
            .on('keydown', event => handleKey(event, true), {
              preventDefault: true,
            })
            .onMount(WatchFrame({ index })),
    )
    const navigate = p.part('button', (element, offset: number) =>
      element
        .attr('type', 'button')
        .disabled(index + offset < 0 || index + offset >= itemCount)
        .on('click', Message.Navigated({ offset })),
    )
    const root = p.part('div', element =>
      element.onMount(WatchVisibility({ open: open && itemCount > 0 })),
    )
    return p.child(Dialog, {
      props: { ...options, open: open && itemCount > 0 },
      onEmit: {
        RequestedOpen: () => Message.RequestedOpen(),
        RequestedClose: ({ reason }) => Message.RequestedClose({ reason }),
        Settled: () => undefined,
      },
      parts: dialog => ({
        dialog,
        index,
        zoomed,
        dragging,
        pose,
        root,
        keys,
        frame,
        navigate,
      }),
    })
  },
})
