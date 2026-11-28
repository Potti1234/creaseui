import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import {
  Calendar as CalendarPrimitive,
  RangeCalendar as RangeCalendarPrimitive,
} from '@effect/ui-kit'
import { DateTime, Effect, Schema, Stream } from 'effect'

/** Date-only ISO values keep the public state independent of the host time zone. */
export const CalendarDate = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/u),
  Schema.makeFilter(value => {
    const date = new Date(value + 'T00:00:00Z')
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    )
  }),
)

export const CalendarRange = Schema.Struct({
  start: CalendarDate,
  end: CalendarDate,
})

const Weekday = Schema.Literals([0, 1, 2, 3, 4, 5, 6])
const CommonProps = {
  today: CalendarDate,
  initialMonth: Schema.optional(CalendarDate),
  locale: Schema.optional(Schema.String),
  weekStartsOn: Schema.optional(Weekday),
  min: Schema.optional(CalendarDate),
  max: Schema.optional(CalendarDate),
  disabled: Schema.optional(Schema.Boolean),
  readOnly: Schema.optional(Schema.Boolean),
  disabledDates: Schema.optional(Schema.Array(CalendarDate)),
  disabledDaysOfWeek: Schema.optional(Schema.Array(Weekday)),
}
const BaseProps = Schema.Struct(CommonProps)
export const CalendarBehaviorProps = Schema.Struct({
  ...CommonProps,
  value: Schema.NullOr(CalendarDate),
})
export const RangeCalendarBehaviorProps = Schema.Struct({
  ...CommonProps,
  value: Schema.NullOr(CalendarRange),
})

const Month = Schema.Struct({ month: CalendarDate })
const PickedDay = { date: CalendarDate }
const PickedRange = CalendarRange.fields
const Message = UiSchema.TaggedEnum({
  RequestedMonth: Month.fields,
  PickedDay,
  PickedRange,
})
const DayEvents = UiSchema.TaggedEnum({ Picked: PickedDay })
const RangeEvents = UiSchema.TaggedEnum({ Picked: PickedRange })

const toDate = (date: string): DateTime.Utc =>
  DateTime.makeUnsafe(date + 'T00:00:00Z')
const toIso = DateTime.formatIsoDateUtc
const kitProps = (
  {
    today,
    locale,
    min = '0000-01-01',
    max = '9999-12-31',
    weekStartsOn = 0,
    disabled,
    readOnly,
  }: typeof BaseProps.Type,
  month: string,
) => ({
  today: toDate(today),
  month: toDate(month),
  min: toDate(min),
  max: toDate(max),
  firstDayOfWeek: weekStartsOn,
  locale,
  disabled,
  readOnly,
})

const unavailable =
  ({ disabledDates, disabledDaysOfWeek }: typeof BaseProps.Type) =>
  (date: DateTime.DateTime) =>
    (disabledDates?.includes(toIso(date)) ?? false) ||
    (disabledDaysOfWeek?.some(
      day => day === DateTime.toDateUtc(date).getUTCDay(),
    ) ??
      false)

const isCalendarDate = Schema.is(CalendarDate)
const readMonth = (value: string): string | undefined => {
  const date = value + '-01'
  return isCalendarDate(date) ? date : undefined
}
const pickedDay = ({ date }: { readonly date: DateTime.Utc }) =>
  Message.PickedDay({ date: toIso(date) })
const pickedRange = ({
  start,
  end,
}: {
  readonly start: DateTime.Utc
  readonly end: DateTime.Utc
}) => Message.PickedRange({ start: toIso(start), end: toIso(end) })
const requestedMonth = ({ month }: { readonly month: DateTime.Utc }) =>
  Message.RequestedMonth({ month: toIso(month) })
const onMonthInput = ({ value }: { readonly value: string }) => {
  const month = readMonth(value)
  return month === undefined ? undefined : Message.RequestedMonth({ month })
}

const PickerMode = Schema.Literals(['days', 'months', 'years'])
type PickerMode = typeof PickerMode.Type
const navigationEvents = UiSchema.TaggedEnum({ Navigated: Month.fields })
const navigationMessage = UiSchema.TaggedEnum({
  Opened: { mode: PickerMode },
  ChoseMonth: Month.fields,
  ChoseYear: { year: Schema.Number },
  Paged: { year: Schema.Number },
})
const yearOf = (date: string) => Number(date.slice(0, 4))
const yearDate = (year: number, month: number) =>
  `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`
const yearsPerPage = 12

const ManageCalendarPickerFocus = Mount.makeStream(
  'CreaseCalendarPickerFocus',
  { args: {} },
  (node: HTMLDivElement) =>
    Stream.callback<never>(() =>
      Effect.gen(function* () {
        const buttons = () => [
          ...node.querySelectorAll<HTMLButtonElement>(
            'button[data-calendar-choice]:not(:disabled)',
          ),
        ]
        const move = (button: HTMLButtonElement) => {
          for (const item of buttons()) item.tabIndex = item === button ? 0 : -1
          button.focus({ preventScroll: true })
        }
        const onKey = (event: KeyboardEvent) => {
          const available = buttons()
          if (!(event.target instanceof HTMLButtonElement)) return
          const current = available.indexOf(event.target)
          if (current < 0) return
          const rtl = getComputedStyle(node).direction === 'rtl'
          const slots: Readonly<Record<string, number>> = {
            ArrowLeft: current + (rtl ? 1 : -1),
            ArrowRight: current + (rtl ? -1 : 1),
            ArrowUp: current - 3,
            ArrowDown: current + 3,
            Home: 0,
            End: available.length - 1,
          }
          if (!Object.hasOwn(slots, event.key)) return
          const requested = slots[event.key] ?? current
          const next =
            available[Math.min(available.length - 1, Math.max(0, requested))]
          if (next === undefined) return
          event.preventDefault()
          move(next)
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const selected =
              buttons().find(
                button => button.getAttribute('aria-selected') === 'true',
              ) ?? buttons()[0]
            if (selected !== undefined) move(selected)
            node.addEventListener('keydown', onKey)
          }),
          () => Effect.sync(() => node.removeEventListener('keydown', onKey)),
        )
        return yield* Effect.never
      }),
    ),
)

const RefocusCalendarCaption = Mount.makeStream(
  'CreaseRefocusCalendarCaption',
  { args: {} },
  (node: HTMLButtonElement) =>
    Stream.callback<never>(() =>
      Effect.gen(function* () {
        yield* Effect.sync(() => node.focus({ preventScroll: true }))
        return yield* Effect.never
      }),
    ),
)

const CalendarNavigation = Html.component({
  name: 'CreaseCalendarNavigation',
  props: Schema.Struct({
    ...Month.fields,
    today: CalendarDate,
    min: Schema.optional(CalendarDate),
    max: Schema.optional(CalendarDate),
    disabled: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({
    mode: PickerMode,
    year: Schema.Number,
    restore: Schema.Boolean,
  }),
  message: navigationMessage,
  events: navigationEvents,
}).make({
  init: ({ props }) => ({
    mode: 'days',
    year: yearOf(props.month),
    restore: false,
  }),
  update: {
    Opened: ($, { mode }) =>
      $.evolve({
        mode,
        year: $.model.mode === 'days' ? yearOf($.props.month) : $.model.year,
        restore: mode === 'days',
      }),
    ChoseMonth: ($, { month }) =>
      $.evolve({ mode: 'days', restore: true }).emit(
        navigationEvents.Navigated({ month }),
      ),
    ChoseYear: ($, { year }) => $.evolve({ year, mode: 'months' }),
    Paged: ($, { year }) => $.evolve({ year }),
  },
  parts: (p, model) => {
    const { mode, year } = model
    const minYear = yearOf(p.props.min ?? '0000-01-01')
    const maxYear = yearOf(p.props.max ?? '9999-12-31')
    const firstYear = Math.floor(year / yearsPerPage) * yearsPerPage
    const lastYear = Math.min(9999, firstYear + yearsPerPage - 1)
    const currentMonth = p.props.month.slice(0, 7)
    const currentYear = yearOf(p.props.month)
    const button = p.part(
      'button',
      (node, message: typeof navigationMessage.Type) =>
        node.attrs({ type: 'button' }).on('click', message),
    )
    return {
      mode,
      year,
      firstYear,
      lastYear,
      months: Array.from({ length: 12 }, (_, index) => {
        const date = yearDate(year, index + 1)
        const month = date.slice(0, 7)
        const unavailable =
          p.props.disabled === true ||
          (p.props.min !== undefined && month < p.props.min.slice(0, 7)) ||
          (p.props.max !== undefined && month > p.props.max.slice(0, 7))
        return {
          date,
          selected: month === currentMonth,
          unavailable,
          today: month === p.props.today.slice(0, 7),
        }
      }),
      years: Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
        const value = firstYear + index
        return {
          year: value,
          selected: value === currentYear,
          today: value === yearOf(p.props.today),
          unavailable:
            p.props.disabled === true || value < minYear || value > maxYear,
        }
      }),
      canPreviousPage: firstYear > minYear,
      canNextPage: lastYear < maxYear,
      button,
      show: (mode: PickerMode) => navigationMessage.Opened({ mode }),
      pickMonth: (month: string) => navigationMessage.ChoseMonth({ month }),
      pickYear: (year: number) => navigationMessage.ChoseYear({ year }),
      page: (year: number) => navigationMessage.Paged({ year }),
      caption: p.part('button', node => {
        const caption = node
          .attrs({ type: 'button' })
          .on('click', navigationMessage.Opened({ mode: 'months' }))
        return model.restore && mode === 'days'
          ? caption.onMount(RefocusCalendarCaption())
          : caption
      }),
      grid: p.part('div', node =>
        node
          .onMount(ManageCalendarPickerFocus())
          .on(
            'keydown',
            ({ key }) =>
              key === 'Escape'
                ? navigationMessage.Opened({ mode: 'days' })
                : undefined,
            { preventDefault: true },
          ),
      ),
    }
  },
})

const navigationProps = (props: typeof BaseProps.Type, month: string) => ({
  month,
  today: props.today,
  min: props.min,
  max: props.max,
  disabled: props.disabled,
})

/** Owns the visible month and exposes the kit's calendar parts with ISO-date events. */
export const CalendarBehavior = Html.component({
  name: 'CreaseCalendar',
  props: CalendarBehaviorProps,
  model: Month,
  message: Message,
  events: DayEvents,
}).make({
  init: ({ props }) => ({
    month: props.initialMonth ?? props.value ?? props.today,
  }),
  update: {
    RequestedMonth: ($, { month }) => $.evolve({ month }),
    PickedDay: ($, { date }) => $.emit(DayEvents.Picked({ date })),
    PickedRange: $ => $.model,
  },
  parts: (p, { month }) => {
    const monthPicker = p.part('input', input =>
      input.on('change', onMonthInput),
    )
    return p.child(CalendarPrimitive, {
      props: {
        ...kitProps(p.props, month),
        value: p.props.value === null ? null : toDate(p.props.value),
      },
      onEmit: { Picked: pickedDay, RequestedMonth: requestedMonth },
      parts: calendar =>
        p.child(CalendarNavigation, {
          props: navigationProps(p.props, month),
          onEmit: {
            Navigated: ({ month }) => Message.RequestedMonth({ month }),
          },
          parts: navigation => ({
            ...calendar,
            unavailable: unavailable(p.props),
            monthPicker,
            navigation,
          }),
        }),
    })
  },
})

/** Range preview, anchoring, and keyboard navigation are owned by the kit. */
export const RangeCalendarBehavior = Html.component({
  name: 'CreaseRangeCalendar',
  props: RangeCalendarBehaviorProps,
  model: Month,
  message: Message,
  events: RangeEvents,
}).make({
  init: ({ props }) => ({
    month: props.initialMonth ?? props.value?.start ?? props.today,
  }),
  update: {
    RequestedMonth: ($, { month }) => $.evolve({ month }),
    PickedDay: $ => $.model,
    PickedRange: ($, { start, end }) =>
      $.emit(RangeEvents.Picked({ start, end })),
  },
  parts: (p, { month }) => {
    const monthPicker = p.part('input', input =>
      input.on('change', onMonthInput),
    )
    return p.child(RangeCalendarPrimitive, {
      props: {
        ...kitProps(p.props, month),
        value:
          p.props.value === null
            ? null
            : {
                start: toDate(p.props.value.start),
                end: toDate(p.props.value.end),
              },
      },
      onEmit: { Picked: pickedRange, RequestedMonth: requestedMonth },
      parts: calendar =>
        p.child(CalendarNavigation, {
          props: navigationProps(p.props, month),
          onEmit: {
            Navigated: ({ month }) => Message.RequestedMonth({ month }),
          },
          parts: navigation => ({
            ...calendar,
            unavailable: unavailable(p.props),
            monthPicker,
            navigation,
          }),
        }),
    })
  },
})
