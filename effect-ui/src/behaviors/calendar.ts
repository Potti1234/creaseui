import { UiSchema } from '@effect/ui'
import { Html, HtmlCommand } from '@effect/ui/html'
import { Schema } from 'effect'

/** Date-only ISO values keep the model independent of the browser's time zone. */
export const CalendarDate = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/u),
  Schema.makeFilter(value => {
    const date = new Date(value + 'T00:00:00Z')
    return !Number.isNaN(date.getTime()) && isoDate(date) === value
  }),
)

const Props = Schema.Struct({
  today: CalendarDate,
  value: Schema.NullOr(CalendarDate),
  locale: Schema.optional(Schema.String),
  weekStartsOn: Schema.optional(
    Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 6 })),
  ),
  min: Schema.optional(CalendarDate),
  max: Schema.optional(CalendarDate),
  disabledDates: Schema.optional(Schema.Array(CalendarDate)),
})

const Message = UiSchema.TaggedEnum({
  FocusedDay: { date: CalendarDate },
  Moved: { date: CalendarDate },
  Paged: { months: Schema.Int },
  Picked: { date: CalendarDate },
  FocusCompleted: {},
})

const Events = UiSchema.TaggedEnum({ Picked: { date: CalendarDate } })
const activeDay = Html.ref('CreaseCalendarActiveDay', 'button')
const asDate = (value: string): Date => new Date(value + 'T00:00:00Z')
const isoDate = (date: Date): string => date.toISOString().slice(0, -14)

const addDays = (value: string, days: number): string => {
  const date = asDate(value)
  date.setUTCDate(date.getUTCDate() + days)
  return isoDate(date)
}

const addMonths = (value: string, months: number): string => {
  const date = asDate(value)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months + 1, 0)
  date.setUTCDate(Math.min(day, date.getUTCDate()))
  return isoDate(date)
}

const weekOffset = (value: string, weekStartsOn: number): number =>
  (asDate(value).getUTCDay() + 7 - weekStartsOn) % 7

const isDisabled = (props: typeof Props.Type, date: string): boolean =>
  (props.min !== undefined && date < props.min) ||
  (props.max !== undefined && date > props.max) ||
  (props.disabledDates?.includes(date) ?? false)

const keyboardTarget = (
  event: Html.KeyPayload,
  date: string,
  weekStartsOn: number,
): string | undefined => {
  if (event.composing || event.alt || event.ctrl || event.meta) return undefined
  switch (event.key) {
    case 'ArrowLeft':
      return addDays(date, -1)
    case 'ArrowRight':
      return addDays(date, 1)
    case 'ArrowUp':
      return addDays(date, -7)
    case 'ArrowDown':
      return addDays(date, 7)
    case 'Home':
      return addDays(date, -weekOffset(date, weekStartsOn))
    case 'End':
      return addDays(date, 6 - weekOffset(date, weekStartsOn))
    case 'PageUp':
      return addMonths(date, event.shift ? -12 : -1)
    case 'PageDown':
      return addMonths(date, event.shift ? 12 : 1)
    default:
      return undefined
  }
}

const isCalendarDate = Schema.is(CalendarDate)

/** Headless single-date calendar with keyboard navigation and controlled selection. */
export const CalendarBehavior = Html.component({
  name: 'CreaseCalendar',
  props: Props,
  model: Schema.Struct({ active: CalendarDate, visible: CalendarDate }),
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => {
    const active = props.value ?? props.today
    return { active, visible: active }
  },
  update: {
    FocusedDay: ($, { date }) => $.evolve({ active: date }),
    Moved: ($, { date }) =>
      $.evolve({ active: date, visible: date }).run(
        HtmlCommand.focus(activeDay, () => Message.FocusCompleted()),
      ),
    Paged: ($, { months }) => {
      const date = addMonths($.model.visible, months)
      return isCalendarDate(date)
        ? $.evolve({ active: date, visible: date })
        : $.model
    },
    Picked: ($, { date }) => $.emit(Events.Picked({ date })),
    FocusCompleted: $ => $.model,
  },
  parts: (p, { active, visible }) => {
    const { locale, today, value, weekStartsOn = 0 } = p.props
    const firstOfMonth = visible.slice(0, 7) + '-01'
    const start = addDays(firstOfMonth, -weekOffset(firstOfMonth, weekStartsOn))
    const month = new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
    const weekday = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      timeZone: 'UTC',
    })
    const fullDate = new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeZone: 'UTC',
    })
    const labelId = p.id('month')
    const label = month.format(asDate(visible))
    return {
      label,
      weekdays: Array.from({ length: 7 }, (_, index) =>
        weekday.format(asDate(addDays(start, index))),
      ),
      weeks: Array.from({ length: 6 }, (_, week) =>
        Array.from({ length: 7 }, (_, index) =>
          addDays(start, week * 7 + index),
        ),
      ),
      month: p.part('h2', heading =>
        heading.id(labelId).attr('aria-live', 'polite'),
      ),
      grid: p.part('table', table =>
        table.attrs({ role: 'grid', 'aria-labelledby': labelId }),
      ),
      cell: p.part('td', (cell, date: string) =>
        cell.attr('aria-selected', date === value ? 'true' : 'false'),
      ),
      navigation: p.part('button', (button, direction: -1 | 1) =>
        button
          .attrs({
            type: 'button',
            'aria-label': direction === -1 ? 'Previous month' : 'Next month',
          })
          .on('click', Message.Paged({ months: direction })),
      ),
      day: p.part('button', (button, date: string) => {
        const disabled = isDisabled(p.props, date) || !isCalendarDate(date)
        const day = button
          .attrs({
            type: 'button',
            tabindex: date === active ? '0' : '-1',
            'aria-disabled': disabled ? 'true' : undefined,
            'aria-label': fullDate.format(asDate(date)),
            'aria-current': date === today ? 'date' : undefined,
            'data-disabled': disabled ? '' : undefined,
            'data-selected': date === value ? '' : undefined,
            'data-outside':
              date.slice(0, 7) !== visible.slice(0, 7) ? '' : undefined,
          })
          .on('click', () => (disabled ? undefined : Message.Picked({ date })))
          .on('focus', () =>
            isCalendarDate(date) ? Message.FocusedDay({ date }) : undefined,
          )
          .on(
            'keydown',
            event => {
              const next = keyboardTarget(event, date, weekStartsOn)
              return next !== undefined && isCalendarDate(next)
                ? Message.Moved({ date: next })
                : undefined
            },
            { preventDefault: true },
          )
        return date === active ? day.ref(activeDay) : day
      }),
    }
  },
})
