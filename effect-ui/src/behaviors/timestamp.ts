import { Command, Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Queue, Schema, Stream } from 'effect'

import {
  formatInstant,
  formatRelativeTime,
  type TimestampFormat,
} from './timestamp-format'
export * from './timestamp-format'

const Format = Schema.Literals([
  'relative',
  'relative_short',
  'auto',
  'date',
  'date_long',
  'date_weekday',
  'date_time',
  'time',
  'system_date',
  'system_date_time',
  'system_time',
  'unix_seconds',
] satisfies readonly TimestampFormat[])

const CopyState = Schema.Struct({
  index: Schema.Number,
  copied: Schema.Boolean,
})
const Message = UiSchema.TaggedEnum({
  Ticked: { now: Schema.Number },
  RequestedCopy: { index: Schema.Number, value: Schema.String },
  Copied: { state: CopyState },
  Cleared: {},
})
type Message = typeof Message.Type

const Copy = Command.make(
  'CreaseCopyTimestamp',
  { args: { index: Schema.Number, value: Schema.String }, mode: 'switch' },
  ({ index, value }) =>
    Effect.tryPromise(() => navigator.clipboard.writeText(value)).pipe(
      Effect.match({
        onSuccess: () => Message.Copied({ state: { index, copied: true } }),
        onFailure: () => Message.Copied({ state: { index, copied: false } }),
      }),
    ),
)
const Reset = Command.make(
  'CreaseResetTimestampCopy',
  { args: {}, mode: 'switch' },
  () => Effect.as(Effect.sleep('2 seconds'), Message.Cleared()),
)

const WatchClock = Mount.makeStream(
  'CreaseWatchTimestamp',
  { args: { value: Schema.Number } },
  (element: HTMLElement, { value }) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        const window = element.ownerDocument.defaultView
        if (window === null) return yield* Effect.never
        let pending: number | undefined
        const next = () => {
          const now = Date.now()
          Queue.offerUnsafe(queue, Message.Ticked({ now }))
          const difference = Math.abs(now - value)
          const delay =
            difference < 60_000
              ? 1_000
              : difference < 3_600_000
                ? 15_000
                : 60_000
          pending = window.setTimeout(next, delay)
        }
        yield* Effect.acquireRelease(Effect.sync(next), () =>
          Effect.sync(() => window.clearTimeout(pending)),
        )
        return yield* Effect.never
      }),
    ),
)

export const parseTimestamp = (value: string | number) => new Date(value)

export const TimestampBehavior = Html.component({
  name: 'CreaseTimestamp',
  props: Schema.Struct({
    value: Schema.Union([Schema.String, Schema.Number]),
    format: Schema.optional(Format),
    now: Schema.optional(Schema.Number),
    autoThreshold: Schema.optional(Schema.Number),
    timeZone: Schema.optional(Schema.String),
    showTimeZone: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({
    observed: Schema.NullOr(Schema.Number),
    copy: Schema.NullOr(CopyState),
  }),
  message: Message,
}).make({
  init: () => ({ observed: null, copy: null }),
  update: {
    Ticked: ($, { now }) => $.evolve({ observed: now }),
    RequestedCopy: ($, { value, index }) =>
      $.run(Copy.make({ value, index })).run(Command.interrupt(Reset)),
    Copied: ($, { state }) => $.evolve({ copy: state }).run(Reset.make({})),
    Cleared: $ => $.evolve({ copy: null }),
  },
  parts: (p, model) => {
    const {
      value,
      format = 'relative',
      now,
      autoThreshold = 604_800,
      timeZone,
      showTimeZone,
    } = p.props
    const date = parseTimestamp(value)
    const valid = Number.isFinite(date.getTime())
    const current = new Date(now ?? model.observed ?? date.getTime())
    const mode =
      format === 'auto'
        ? Math.abs(current.getTime() - date.getTime()) <= autoThreshold * 1000
          ? 'relative'
          : 'date'
        : format
    const text = !valid
      ? undefined
      : mode === 'relative' || mode === 'relative_short'
        ? formatRelativeTime(
            date,
            current,
            mode === 'relative' ? 'long' : 'narrow',
          )
        : formatInstant(date, mode, {
            ...(timeZone === undefined ? {} : { timeZone }),
            ...(showTimeZone === undefined
              ? {}
              : { isTimezoneShown: showTimeZone }),
          })
    return {
      date,
      text,
      dateTime: valid ? date.toISOString() : undefined,
      copyState: model.copy,
      root: p.part('div', element =>
        now === undefined &&
        valid &&
        (format === 'auto' ||
          format === 'relative' ||
          format === 'relative_short')
          ? element.onMount(WatchClock({ value: date.getTime() }))
          : element,
      ),
      copy: p.part('button', (element, index: number, value: string) =>
        element
          .attr('type', 'button')
          .on('click', Message.RequestedCopy({ index, value })),
      ),
    }
  },
})
