import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Queue, Schema, Stream } from 'effect'

const ONE_SECOND_MS = 1000
const ONE_MINUTE_MS = 60 * ONE_SECOND_MS
const ONE_HOUR_SECONDS = 60 * 60
const MAX_TIMEOUT_MS = 2_147_483_647

export type TimerFormat = 'elapsed' | 'clock'

type TimerPresentation = Readonly<{
  dateTime: string
  text: string
}>

const pad = (value: number): string => String(value).padStart(2, '0')

const getElapsedMilliseconds = (now: number, startTime: number): number =>
  Math.max(0, now - startTime)

export const timerPresentation = (
  elapsedMilliseconds: number,
  format: TimerFormat,
): TimerPresentation => {
  const elapsedSeconds = Math.floor(elapsedMilliseconds / ONE_SECOND_MS)

  if (format === 'clock') {
    const hours = Math.floor(elapsedSeconds / ONE_HOUR_SECONDS)
    const minutes = Math.floor((elapsedSeconds % ONE_HOUR_SECONDS) / 60)
    const seconds = elapsedSeconds % 60
    return {
      dateTime: `PT${String(elapsedSeconds)}S`,
      text:
        hours > 0
          ? `${String(hours)}:${pad(minutes)}:${pad(seconds)}`
          : `${String(minutes)}:${pad(seconds)}`,
    }
  }

  if (elapsedSeconds < 60) {
    return {
      dateTime: `PT${String(elapsedSeconds)}S`,
      text: `${String(elapsedSeconds)}s`,
    }
  }

  const totalMinutes = Math.floor(elapsedSeconds / 60)
  if (totalMinutes < 60) {
    return {
      dateTime: `PT${String(elapsedSeconds)}S`,
      text: `${String(totalMinutes)}m ${pad(elapsedSeconds % 60)}s`,
    }
  }

  const representedSeconds = totalMinutes * 60
  return {
    dateTime: `PT${String(representedSeconds)}S`,
    text: `${String(Math.floor(totalMinutes / 60))}h ${pad(totalMinutes % 60)}m`,
  }
}

const getMillisecondsUntilNextChange = (
  now: number,
  startTime: number,
  elapsedMilliseconds: number,
  format: TimerFormat,
): number => {
  if (now < startTime) {
    return Math.min(startTime - now + ONE_SECOND_MS, MAX_TIMEOUT_MS)
  }
  const precision =
    format === 'elapsed' &&
    elapsedMilliseconds >= ONE_HOUR_SECONDS * ONE_SECOND_MS
      ? ONE_MINUTE_MS
      : ONE_SECOND_MS
  return precision - (elapsedMilliseconds % precision)
}

const Format = Schema.Literals(['elapsed', 'clock'])
const Message = UiSchema.TaggedEnum({ Ticked: { time: Schema.Number } })
type Message = typeof Message.Type

const Tick = Mount.makeStream(
  'CreaseElapsedTimer',
  { args: { start: Schema.Number, format: Format } },
  (node: HTMLElement, { start, format }) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        const window = node.ownerDocument.defaultView
        if (window === null) return yield* Effect.never
        let timeout: number | undefined
        const tick = () => {
          const time = Date.now()
          Queue.offerUnsafe(queue, Message.Ticked({ time }))
          const delay = getMillisecondsUntilNextChange(
            time,
            start,
            getElapsedMilliseconds(time, start),
            format,
          )
          timeout = window.setTimeout(tick, delay)
        }
        yield* Effect.acquireRelease(Effect.sync(tick), () =>
          Effect.sync(() => window.clearTimeout(timeout)),
        )
        return yield* Effect.never
      }),
    ),
)

export const TimerBehavior = Html.component({
  name: 'CreaseTimer',
  props: Schema.Struct({
    start: Schema.Number,
    now: Schema.optional(Schema.Number),
    format: Schema.optional(Format),
  }),
  model: Schema.Struct({ observed: Schema.NullOr(Schema.Number) }),
  message: Message,
}).make({
  init: () => ({ observed: null }),
  update: { Ticked: ($, { time }) => $.evolve({ observed: time }) },
  parts: (p, model) => {
    const { start, now, format = 'elapsed' } = p.props
    const presentation = timerPresentation(
      getElapsedMilliseconds(now ?? model.observed ?? start, start),
      format,
    )
    return {
      ...presentation,
      root: p.part('time', element =>
        (now === undefined
          ? element.onMount(Tick({ start, format }))
          : element
        ).attrs({ datetime: presentation.dateTime, 'data-format': format }),
      ),
    }
  },
})
