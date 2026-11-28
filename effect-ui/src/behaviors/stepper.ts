import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Queue, Schema, Stream } from 'effect'

export type StepperProgress = 'completed' | 'in-progress' | 'not-started'
export const stepProgress = (index: number, active: number): StepperProgress =>
  index === active
    ? 'in-progress'
    : index < active
      ? 'completed'
      : 'not-started'

const connectorSpanMs = 300
const toTime = (share: number) =>
  `${Math.round(connectorSpanMs * share * 10_000) / 10_000}ms`

/** The departing and arriving segments share one forward step's timeline. */
export const stepConnectorTimings = ({
  active,
  previous,
  index,
  orientation,
  onTrack,
  hasContent,
}: {
  readonly active: number
  readonly previous: number
  readonly index: number
  readonly orientation: 'horizontal' | 'vertical'
  readonly onTrack: boolean
  readonly hasContent: boolean
}) => {
  const timing = (span: number, offset: number, share: number) =>
    active === previous + 1 && span === previous
      ? { duration: toTime(share), delay: toTime(offset) }
      : { duration: '0ms', delay: '0ms' }
  const arrival = !onTrack ? 1 : orientation === 'horizontal' ? 0.5 : 0.3
  const departure = 1 - arrival
  const rail =
    hasContent && orientation === 'vertical' ? departure * 0.25 : departure
  return {
    entry: timing(index - 1, departure, arrival),
    rail: timing(index, 0, rail),
    content: timing(index, rail, departure - rail),
  }
}

const Message = UiSchema.TaggedEnum({
  Measured: { width: Schema.Number },
  SeenActive: { index: Schema.Number },
  Picked: { index: Schema.Number },
})
type Message = typeof Message.Type
const Events = UiSchema.TaggedEnum({ Picked: { index: Schema.Number } })
const Orientation = Schema.Literals(['horizontal', 'vertical'])
const Watch = Mount.makeStream(
  'ObserveCreaseStepper',
  { args: { active: Schema.Number } },
  (root: HTMLDivElement, _args, changes) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        const emit = () =>
          Queue.offerUnsafe(
            queue,
            Message.Measured({ width: root.clientWidth }),
          )
        const observer = new ResizeObserver(emit)
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            observer.observe(root)
            emit()
          }),
          () => Effect.sync(() => observer.disconnect()),
        )
        yield* Stream.runForEach(changes, ({ active }) =>
          Effect.sync(() =>
            Queue.offerUnsafe(queue, Message.SeenActive({ index: active })),
          ),
        )
        return yield* Effect.never
      }),
    ),
)
const current = (count: number, active: number) =>
  count > 0 ? Math.min(count - 1, Math.max(0, Math.trunc(active))) : 0

export const StepperBehavior = Html.component({
  name: 'CreaseStepper',
  props: Schema.Struct({
    active: Schema.Number,
    count: Schema.Number,
    orientation: Schema.optional(Orientation),
    minimumStepWidth: Schema.optional(Schema.Number),
  }),
  model: Schema.Struct({
    width: Schema.NullOr(Schema.Number),
    seen: Schema.Number,
    previous: Schema.Number,
  }),
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => ({
    width: null,
    seen: props.active,
    previous: props.active,
  }),
  update: {
    Measured: ($, { width }) =>
      $.model.width === width ? $.model : $.evolve({ width }),
    SeenActive: ($, { index }) =>
      $.model.seen === index
        ? $.model
        : $.evolve({ previous: $.model.seen, seen: index }),
    Picked: ($, { index }) =>
      $.emit(Events.Picked({ index: current($.props.count, index) })),
  },
  parts: (p, model) => {
    const orientation = p.props.orientation ?? 'horizontal'
    const { count } = p.props
    const active = current(count, p.props.active)
    const previous = current(
      count,
      active === model.seen ? model.previous : model.seen,
    )
    return {
      active,
      previous,
      orientation,
      compact:
        orientation === 'horizontal' &&
        count > 0 &&
        model.width !== null &&
        model.width > 0 &&
        model.width / count < (p.props.minimumStepWidth ?? 104),
      root: p.part('div', element => element.onMount(Watch({ active }))),
      pick: p.part('button', (element, index: number) =>
        element.attr('type', 'button').on('click', Message.Picked({ index })),
      ),
    }
  },
})
