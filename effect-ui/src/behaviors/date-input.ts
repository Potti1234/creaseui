import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { DateField, Drawer, Popover } from '@effect/ui-kit'
import type { DateFieldProps } from '@effect/ui-kit'
import { Effect, Queue, Schema, Stream } from 'effect'

import { CalendarBehavior, CalendarDate } from './calendar'

export { DateField as DateInputBehavior }
export type { DateFieldEvents, DateFieldProps } from '@effect/ui-kit'

export type SharedDateFormat =
  | 'date'
  | 'date_long'
  | 'date_weekday'
  | 'system_date'
type Locale = DateFieldProps['locale']
export type ParseDateText = (value: string) => string | null | undefined
const isDate = Schema.is(CalendarDate)
const DateValue = Schema.NullOr(CalendarDate)

const formatOptions = {
  date: { month: 'short', day: 'numeric', year: 'numeric' },
  date_long: { month: 'long', day: 'numeric', year: 'numeric' },
  date_weekday: {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
} satisfies Readonly<
  Record<Exclude<SharedDateFormat, 'system_date'>, Intl.DateTimeFormatOptions>
>

export const formatDateText = (
  iso: string,
  format: SharedDateFormat,
  locale?: Locale,
) =>
  format === 'system_date'
    ? iso
    : new Intl.DateTimeFormat(locale, {
        ...formatOptions[format],
        calendar: 'gregory',
        timeZone: 'UTC',
      }).format(new Date(iso + 'T00:00:00Z'))

const dateFromParts = (year: number, month: number, day: number) => {
  const value = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return isDate(value) ? value : undefined
}
const folded = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Accepts the same ISO, month-name and localized numeric inputs as the original field. */
export const parseDateText = (
  text: string,
  locale?: Locale,
  currentYear = new Date().getFullYear(),
): string | undefined => {
  const formatter = new Intl.NumberFormat(locale, { useGrouping: false })
  const digits = Array.from({ length: 10 }, (_, index) =>
    formatter.format(index),
  )
  const value = digits
    .reduce(
      (value, digit, index) => value.replaceAll(digit, String(index)),
      text,
    )
    .replace(/[\u200e\u200f\u061c]/g, '')
    .trim()
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value)
  if (iso !== null)
    return dateFromParts(Number(iso[1]), Number(iso[2]), Number(iso[3]))
  if (/^\d*$/.test(value)) return

  const numeric = /^(\d{1,2})([-/.])(\d{1,2})(?:\2(\d{4}))?$/.exec(value)
  if (numeric !== null) {
    const [, a, , b, year] = numeric
    const first = Number(a)
    const second = Number(b)
    const order = new Intl.DateTimeFormat(locale, {
      calendar: 'gregory',
      timeZone: 'UTC',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(new Date('2000-01-15T00:00:00Z'))
    const dayFirst =
      first > 12 ||
      (second <= 12 &&
        order.find(part => part.type === 'day' || part.type === 'month')
          ?.type === 'day')
    return dateFromParts(
      year === undefined ? currentYear : Number(year),
      dayFirst ? second : first,
      dayFirst ? first : second,
    )
  }
  // Keep mixed-delimiter or invalid complete numeric strings invalid.
  if (/^[\d./\s-]+$/.test(value)) return
  const monthNames = new Map<string, number>()
  for (const language of [locale, 'en']) {
    for (const month of ['long', 'short'] as const) {
      const names = new Intl.DateTimeFormat(language, {
        month,
        calendar: 'gregory',
        timeZone: 'UTC',
      })
      for (let index = 1; index <= 12; index += 1) {
        const name = names.format(new Date(Date.UTC(2000, index - 1, 1)))
        monthNames.set(folded(name.replace(/\.$/, '')), index)
      }
    }
  }
  monthNames.set('sept', 9)
  const candidates = value.match(/\p{L}[\p{L}\p{M}]*/gu) ?? []
  const month = candidates
    .map(name => monthNames.get(folded(name)))
    .find(month => month !== undefined)
  const numbers = value.match(/\d+/g) ?? []
  if (month !== undefined && numbers.length > 0 && numbers.length <= 2) {
    const year = numbers.find(value => value.length === 4)
    const day = numbers.find(value => value.length <= 2)
    return day === undefined
      ? undefined
      : dateFromParts(
          year === undefined ? currentYear : Number(year),
          month,
          Number(day),
        )
  }
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime())
    ? dateFromParts(
        parsed.getFullYear(),
        parsed.getMonth() + 1,
        parsed.getDate(),
      )
    : undefined
}

const TextMessage = UiSchema.TaggedEnum({
  Typed: { value: Schema.String },
  Parsed: { value: Schema.optional(DateValue) },
  Reverted: {},
})
const CommitEvent = UiSchema.TaggedEnum({ Committed: { value: DateValue } })

const ReportDateValidity = Mount.makeStream(
  'CreaseDateInputValidity',
  { args: { error: Schema.String } },
  (input: HTMLInputElement, initial, changes) =>
    Stream.callback<never>(() =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => input.setCustomValidity(initial.error)),
          () => Effect.sync(() => input.setCustomValidity('')),
        )
        yield* Stream.runForEach(changes, ({ error }) =>
          Effect.sync(() => input.setCustomValidity(error)),
        )
      }),
    ),
)

/** A controlled date-only field for consumer-provided display formats. */
export const FormattedDateInputBehavior = Html.component({
  name: 'CreaseFormattedDateInput',
  props: Schema.Struct({
    value: DateValue,
    min: Schema.optional(CalendarDate),
    max: Schema.optional(CalendarDate),
    disabled: Schema.optional(Schema.Boolean),
    readOnly: Schema.optional(Schema.Boolean),
    required: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({
    draft: Schema.NullOr(Schema.String),
    draftFor: DateValue,
    invalid: Schema.Boolean,
  }),
  message: TextMessage,
  events: CommitEvent,
}).make({
  init: ({ props }) => ({ draft: null, draftFor: props.value, invalid: false }),
  update: {
    Typed: ($, { value }) =>
      $.evolve({ draft: value, draftFor: $.props.value, invalid: false }),
    Parsed: ($, { value }) => {
      if (
        $.model.draft === null ||
        $.model.draftFor !== $.props.value ||
        $.props.disabled ||
        $.props.readOnly
      )
        return $.model
      if (
        value === undefined ||
        (value !== null &&
          (($.props.min !== undefined && value < $.props.min) ||
            ($.props.max !== undefined && value > $.props.max)))
      )
        return $.evolve({ invalid: true })
      const step = $.evolve({ draft: null, invalid: false })
      return value !== $.props.value
        ? step.emit(CommitEvent.Committed({ value }))
        : step
    },
    Reverted: $ => $.evolve({ draft: null, invalid: false }),
  },
  parts: (p, model) => {
    const draft = model.draftFor === p.props.value ? model.draft : null
    const invalid = draft !== null && model.invalid
    return {
      invalid,
      input: p.part(
        'input',
        (input, display: string, parse: ParseDateText, error: string) => {
          const commit = () => {
            if (draft === null) return undefined
            const text = draft.trim()
            const value = text === '' ? null : parse(text)
            return TextMessage.Parsed({
              value: value == null || isDate(value) ? value : undefined,
            })
          }
          return input
            .attrs({
              type: 'text',
              readonly: p.props.readOnly ? '' : undefined,
              required: p.props.required ? '' : undefined,
            })
            .disabled(p.props.disabled === true)
            .value(draft ?? display)
            .onMount(ReportDateValidity({ error: invalid ? error : '' }))
            .on('input', ({ value }) => TextMessage.Typed({ value }))
            .on('blur', commit)
            .on(
              'keydown',
              ({ key, composing }) =>
                composing
                  ? undefined
                  : key === 'Enter'
                    ? commit()
                    : key === 'Escape' && draft !== null
                      ? TextMessage.Reverted()
                      : undefined,
              { preventDefault: true },
            )
        },
      ),
    }
  },
})

const PickerMessage = UiSchema.TaggedEnum({
  Opened: { triggerId: Schema.NullOr(Schema.String) },
  Closed: {},
  Picked: { value: CalendarDate },
  CompactChanged: { compact: Schema.Boolean },
})
type PickerMessage = typeof PickerMessage.Type
const ResponsiveDatePicker = Mount.makeStream(
  'CreaseResponsiveDatePicker',
  { args: {} },
  (node: HTMLDivElement) =>
    Stream.callback<PickerMessage>(queue =>
      Effect.gen(function* () {
        const media =
          node.ownerDocument.defaultView?.matchMedia('(max-width: 639px)')
        if (media === undefined) return
        const update = () =>
          Queue.offerUnsafe(
            queue,
            PickerMessage.CompactChanged({ compact: media.matches }),
          )
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            media.addEventListener('change', update)
            update()
          }),
          () => Effect.sync(() => media.removeEventListener('change', update)),
        )
        return yield* Effect.never
      }),
    ),
)

const PickerProps = Schema.Struct({
  value: DateValue,
  today: CalendarDate,
  min: Schema.optional(CalendarDate),
  max: Schema.optional(CalendarDate),
  locale: Schema.optional(Schema.String),
  disabled: Schema.optional(Schema.Boolean),
  readOnly: Schema.optional(Schema.Boolean),
  adaptive: Schema.Boolean,
})

export const DateInputPickerBehavior = Html.component({
  name: 'CreaseDateInputPicker',
  props: PickerProps,
  model: Schema.Struct({
    compact: Schema.Boolean,
    open: Schema.Boolean,
    triggerId: Schema.NullOr(Schema.String),
    opened: Schema.Number,
  }),
  message: PickerMessage,
  events: CommitEvent,
}).make({
  init: () => ({ compact: false, open: false, triggerId: null, opened: 0 }),
  update: {
    Opened: ($, { triggerId }) =>
      $.props.disabled || $.props.readOnly
        ? $.model
        : $.evolve({ open: true, triggerId, opened: $.model.opened + 1 }),
    Closed: $ => $.evolve({ open: false, triggerId: null }),
    Picked: ($, { value }) =>
      $.evolve({ open: false }).emit(CommitEvent.Committed({ value })),
    CompactChanged: ($, { compact }) =>
      compact === $.model.compact
        ? $.model
        : $.evolve({ compact, open: false, triggerId: null }),
  },
  parts: (p, model) => {
    const open = model.open && !p.props.disabled && !p.props.readOnly
    const compact = model.compact && p.props.adaptive
    const root = p.part('div', element =>
      p.props.adaptive ? element.onMount(ResponsiveDatePicker()) : element,
    )
    return p.child(Popover, {
      props: {
        open: open && !compact,
        triggerId: model.triggerId,
        side: 'bottom',
        align: 'start',
        sideOffset: 4,
      },
      onEmit: {
        RequestedOpen: ({ triggerId }) => PickerMessage.Opened({ triggerId }),
        RequestedClose: () => PickerMessage.Closed(),
        Settled: () => undefined,
      },
      parts: popover =>
        p.child(Drawer, {
          props: {
            open: open && compact,
            triggerId: model.triggerId,
            swipeDirection: 'down',
            nested: false,
          },
          onEmit: {
            RequestedOpen: ({ triggerId }) =>
              PickerMessage.Opened({ triggerId }),
            RequestedClose: () => PickerMessage.Closed(),
            Settled: () => undefined,
            Snapped: () => undefined,
          },
          parts: drawer =>
            p.child(CalendarBehavior, {
              key: String(model.opened),
              props: p.props,
              onEmit: {
                Picked: ({ date }) => PickerMessage.Picked({ value: date }),
              },
              parts: calendar => ({ compact, root, popover, drawer, calendar }),
            }),
        }),
    })
  },
})
