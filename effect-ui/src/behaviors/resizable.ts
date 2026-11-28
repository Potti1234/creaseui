import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Queue, Schema, Stream } from 'effect'

export const Orientation = Schema.Literals(['horizontal', 'vertical'])
export type ResizeOrientation = typeof Orientation.Type

export const normalizeSizes = (
  count: number,
  sizes?: readonly number[],
): number[] => {
  if (count < 1) return []
  const usable =
    sizes?.length === count
      ? sizes.map(value => (Number.isFinite(value) ? Math.max(0, value) : 0))
      : []
  const total = usable.reduce((sum, value) => sum + value, 0)
  return total > 0
    ? usable.map(value => (value * 100) / total)
    : Array.from({ length: count }, () => 100 / count)
}

export const resizePair = (
  sizes: readonly number[],
  index: number,
  delta: number,
  minSize: number,
) => {
  const before = sizes[index]
  const after = sizes[index + 1]
  if (before === undefined || after === undefined) return sizes
  const total = before + after
  const minimum = Math.min(Math.max(0, minSize), total / 2)
  const width = Math.max(minimum, Math.min(total - minimum, before + delta))
  const next = sizes.slice()
  next[index] = width
  next[index + 1] = total - width
  return next
}

const Drag = Schema.Struct({
  handle: Schema.Number,
  sizes: Schema.Array(Schema.Number),
})
const Message = UiSchema.TaggedEnum({
  Started: { handle: Schema.Number },
  Moved: { delta: Schema.Number },
  Finished: {},
  Nudged: { handle: Schema.Number, delta: Schema.Number },
})
type Message = typeof Message.Type
const Events = UiSchema.TaggedEnum({
  Resized: { sizes: Schema.Array(Schema.Number) },
  Committed: { sizes: Schema.Array(Schema.Number) },
})

const Observe = Mount.makeStream(
  'ObserveCreaseResizable',
  { args: {} },
  (root: HTMLDivElement) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        let drag:
          | {
              readonly id: number
              readonly origin: number
              readonly handle: HTMLElement
              readonly extent: number
              readonly vertical: boolean
              readonly sign: number
            }
          | undefined
        const target = (event: Event) => {
          const element =
            event.target instanceof Element
              ? event.target.closest<HTMLElement>(
                  '[data-slot="resizable-handle"]',
                )
              : null
          return element?.closest('[data-slot="resizable-panel-group"]') ===
            root && element.getAttribute('aria-disabled') !== 'true'
            ? element
            : null
        }
        const axis = () => {
          const vertical = root.dataset.orientation === 'vertical'
          return {
            vertical,
            sign:
              !vertical && getComputedStyle(root).direction === 'rtl' ? -1 : 1,
          }
        }
        const coordinate = (event: PointerEvent, vertical: boolean) =>
          vertical ? event.clientY : event.clientX
        const start = (event: PointerEvent) => {
          const handle = target(event)
          if (event.button !== 0 || drag !== undefined || handle === null)
            return
          const { vertical, sign } = axis()
          const box = root.getBoundingClientRect()
          const extent = vertical ? box.height : box.width
          if (extent <= 0) return
          handle.focus()
          handle.setPointerCapture(event.pointerId)
          drag = {
            id: event.pointerId,
            handle,
            origin: coordinate(event, vertical),
            extent,
            vertical,
            sign,
          }
          Queue.offerUnsafe(
            queue,
            Message.Started({ handle: Number(handle.dataset.handle) }),
          )
          event.preventDefault()
        }
        const move = (event: PointerEvent) => {
          if (drag === undefined || drag.id !== event.pointerId) return
          const delta =
            (100 *
              drag.sign *
              (coordinate(event, drag.vertical) - drag.origin)) /
            drag.extent
          Queue.offerUnsafe(queue, Message.Moved({ delta }))
        }
        const end = (event: PointerEvent) => {
          if (drag === undefined || event.pointerId !== drag.id) return
          const active = drag
          drag = undefined
          if (active.handle.hasPointerCapture(active.id))
            active.handle.releasePointerCapture(active.id)
          Queue.offerUnsafe(queue, Message.Finished())
        }
        const keyDown = (event: KeyboardEvent) => {
          const handle = target(event)
          if (handle === null || event.altKey || event.metaKey || event.ctrlKey)
            return
          const { vertical, sign } = axis()
          const [back, forward] = vertical
            ? ['ArrowUp', 'ArrowDown']
            : ['ArrowLeft', 'ArrowRight']
          const step = event.shiftKey ? 10 : 2
          const delta =
            event.key === back
              ? -sign * step
              : event.key === forward
                ? sign * step
                : event.key === 'Home'
                  ? -100
                  : event.key === 'End'
                    ? 100
                    : undefined
          if (delta === undefined) return
          event.preventDefault()
          Queue.offerUnsafe(
            queue,
            Message.Nudged({ handle: Number(handle.dataset.handle), delta }),
          )
        }
        const controller = new AbortController()
        const { signal } = controller
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            root.addEventListener('pointerdown', start, { signal })
            root.addEventListener('pointermove', move, { signal })
            root.addEventListener('pointerup', end, { signal })
            root.addEventListener('pointercancel', end, { signal })
            root.addEventListener('lostpointercapture', end, { signal })
            root.addEventListener('keydown', keyDown, { signal })
          }),
          () =>
            Effect.sync(() => {
              controller.abort()
              if (drag?.handle.hasPointerCapture(drag.id))
                drag.handle.releasePointerCapture(drag.id)
            }),
        )
        return yield* Effect.never
      }),
    ),
)

const Props = Schema.Struct({
  count: Schema.Number,
  sizes: Schema.optional(Schema.Array(Schema.Number)),
  defaultSizes: Schema.optional(Schema.Array(Schema.Number)),
  minSize: Schema.optional(Schema.Number),
  orientation: Schema.optional(Orientation),
})
const Model = Schema.Struct({
  sizes: Schema.Array(Schema.Number),
  drag: Schema.NullOr(Drag),
})
const current = (props: typeof Props.Type, model: typeof Model.Type) =>
  props.sizes !== undefined
    ? normalizeSizes(props.count, props.sizes)
    : model.sizes.length === props.count
      ? model.sizes
      : normalizeSizes(props.count, props.defaultSizes)

export const ResizableBehavior = Html.component({
  name: 'CreaseResizable',
  props: Props,
  model: Model,
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => ({
    sizes: normalizeSizes(props.count, props.sizes ?? props.defaultSizes),
    drag: null,
  }),
  update: {
    Started: ($, { handle }) => {
      const sizes = current($.props, $.model)
      return $.evolve({ sizes, drag: { handle, sizes } })
    },
    Moved: ($, { delta }) => {
      const { drag } = $.model
      if (drag === null) return $.model
      const sizes = resizePair(
        drag.sizes,
        drag.handle,
        delta,
        $.props.minSize ?? 10,
      )
      return $.evolve({ sizes }).emit(Events.Resized({ sizes }))
    },
    Finished: $ =>
      $.evolve({ drag: null }).emit(Events.Committed({ sizes: $.model.sizes })),
    Nudged: ($, { handle, delta }) => {
      const sizes = resizePair(
        current($.props, $.model),
        handle,
        delta,
        $.props.minSize ?? 10,
      )
      return $.evolve({ sizes })
        .emit(Events.Resized({ sizes }))
        .emit(Events.Committed({ sizes }))
    },
  },
  parts: (p, model) => ({
    sizes: current(p.props, model),
    dragging: model.drag !== null,
    root: p.part('div', element =>
      element
        .onMount(Observe())
        .attr('data-orientation', p.props.orientation ?? 'horizontal'),
    ),
  }),
})
