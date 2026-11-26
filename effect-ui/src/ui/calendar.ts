import type { Html } from '@effect/ui/html'
import { DateTime } from 'effect'

import { CalendarBehavior, RangeCalendarBehavior } from '../behaviors/calendar'

type CalendarOptions<Msg> = Parameters<typeof CalendarBehavior<Msg>>[1]
type RangeOptions<Msg> = Parameters<typeof RangeCalendarBehavior<Msg>>[1]
type CalendarParts = Parameters<CalendarOptions<never>['view']>[0]
type RangeParts = Parameters<RangeOptions<never>['view']>[0]

type VisualOptions = {
  readonly className?: string
  readonly direction?: 'ltr' | 'rtl' | undefined
  readonly captionLayout?: 'label' | 'dropdown' | undefined
  readonly weekNumbers?: boolean
  readonly previousMonthLabel?: string
  readonly nextMonthLabel?: string
}

export const calendarClasses = {
  root: 'w-fit rounded-lg border bg-background p-3 text-foreground',
  header: 'mb-2 flex items-center justify-between gap-2',
  navigation:
    'grid size-9 place-items-center rounded-md border border-input bg-background text-sm hover:bg-muted focus-visible:outline-2 disabled:opacity-50',
  month: 'text-sm font-medium',
  monthPicker:
    'mt-1 mb-2 rounded-md border border-input bg-background px-2 py-1 text-sm',
  table: 'border-collapse',
  weekday: 'h-8 px-1 text-xs font-normal text-muted-foreground',
  cell: 'p-0 text-center',
  day: 'size-9 rounded-md text-sm tabular-nums hover:bg-muted focus-visible:outline-2 data-outside-month:text-muted-foreground data-disabled:opacity-50 data-unavailable:opacity-50 data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary/80 data-in-range:not-data-range-start:not-data-range-end:rounded-none data-in-range:not-data-range-start:not-data-range-end:bg-accent data-in-range:not-data-range-start:not-data-range-end:text-accent-foreground data-range-start:bg-primary data-range-start:text-primary-foreground data-range-end:bg-primary data-range-end:text-primary-foreground',
}

const visualWeek = (dates: readonly DateTime.Utc[]) => {
  const thursday =
    dates[0] === undefined ? new Date(0) : DateTime.toDateUtc(dates[0])
  thursday.setUTCDate(
    thursday.getUTCDate() + ((4 + 7 - thursday.getUTCDay()) % 7),
  )
  const first = new Date(thursday.getTime())
  first.setUTCMonth(0, 1)
  return Math.ceil(
    ((thursday.getTime() - first.getTime()) / 86_400_000 + 1) / 7,
  )
}

export const calendarView = <Msg>(
  h: Html.H<Msg>,
  calendar: CalendarParts | RangeParts,
  {
    className,
    direction,
    captionLayout,
    weekNumbers,
    previousMonthLabel,
    nextMonthLabel,
  }: VisualOptions,
  styles: typeof calendarClasses,
  {
    min,
    max,
    disabled,
  }: Pick<CalendarOptions<Msg>['props'], 'min' | 'max' | 'disabled'>,
) => {
  const rtl = direction === 'rtl'
  return calendar
    .root(
      h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'calendar', dir: direction }),
    )
    .children(
      h.div
        .class(styles.header)
        .children(
          calendar
            .previous(
              h.button
                .class(styles.navigation)
                .attr('aria-label', previousMonthLabel ?? 'Previous month'),
            )
            .children(rtl ? '›' : '‹'),
          calendar.heading(h.h2.class(styles.month)).children(calendar.title),
          calendar
            .next(
              h.button
                .class(styles.navigation)
                .attr('aria-label', nextMonthLabel ?? 'Next month'),
            )
            .children(rtl ? '‹' : '›'),
        ),
      captionLayout === 'dropdown'
        ? calendar.monthPicker(
            h.input
              .class(styles.monthPicker)
              .attrs({
                type: 'month',
                'aria-label': 'Choose month and year',
                'data-slot': 'calendar-month-picker',
                min: min?.slice(0, 7),
                max: max?.slice(0, 7),
                disabled: disabled ? '' : undefined,
              })
              .value(DateTime.formatIsoDateUtc(calendar.month).slice(0, 7)),
          )
        : undefined,
      calendar.grid(h.table.class(styles.table)).children(
        h.thead.children(
          h.tr.children(
            weekNumbers
              ? h.th
                  .class(styles.weekday)
                  .attrs({ scope: 'col', 'aria-label': 'Week number' })
                  .children('Wk')
              : undefined,
            calendar.weekdays.map(({ short }, index) =>
              calendar
                .weekday({
                  element: h.th.key(String(index)).class(styles.weekday),
                  index,
                })
                .children(short),
            ),
          ),
        ),
        h.tbody.children(
          calendar.weeks.map(week =>
            h.tr.key(String(week[0]?.epochMilliseconds)).children(
              weekNumbers
                ? h.th
                    .class(styles.weekday)
                    .attr('scope', 'row')
                    .children(String(visualWeek(week)))
                : undefined,
              week.map(date => {
                const iso = DateTime.formatIsoDateUtc(date)
                return calendar
                  .cell({ date, element: h.td.key(iso).class(styles.cell) })
                  .children(
                    calendar
                      .day({
                        date,
                        unavailable: calendar.unavailable(date),
                        element: h.button.key(iso).class(styles.day),
                      })
                      .children(String(DateTime.toPartsUtc(date).day)),
                  )
              }),
            ),
          ),
        ),
      ),
    )
}

export const Calendar = <Msg>(
  h: Html.H<Msg>,
  options: Omit<CalendarOptions<Msg>, 'view' | 'fallback'> & VisualOptions,
  styles: typeof calendarClasses = calendarClasses,
) =>
  CalendarBehavior(h, {
    ...options,
    view: calendar => calendarView(h, calendar, options, styles, options.props),
  })

export const RangeCalendar = <Msg>(
  h: Html.H<Msg>,
  options: Omit<RangeOptions<Msg>, 'view' | 'fallback'> & VisualOptions,
  styles: typeof calendarClasses = calendarClasses,
) =>
  RangeCalendarBehavior(h, {
    ...options,
    view: calendar => calendarView(h, calendar, options, styles, options.props),
  })
