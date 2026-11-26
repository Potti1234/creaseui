import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import {
  Calendar as CalendarPrimitive,
  RangeCalendar as RangeCalendarPrimitive,
} from '@effect/ui-kit'
import { DateTime, Schema } from 'effect'

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
      parts: calendar => ({
        ...calendar,
        unavailable: unavailable(p.props),
        monthPicker,
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
      parts: calendar => ({
        ...calendar,
        unavailable: unavailable(p.props),
        monthPicker,
      }),
    })
  },
})
