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
  readonly previousYearsPageLabel?: string
  readonly nextYearsPageLabel?: string
  readonly daysHeadingButtonLabel?: string
  readonly monthsHeadingButtonLabel?: string
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

const captionStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  backgroundColor: 'transparent',
  color: 'inherit',
  border: '0',
  borderRadius: 'calc(var(--radius) - 2px)',
  fontFamily: 'inherit',
  minHeight: '2rem',
  paddingInline: '0.375rem',
  cursor: 'pointer',
} satisfies Html.Style

const row = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '0.25rem',
} satisfies Html.Style

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
    previousYearsPageLabel,
    nextYearsPageLabel,
    daysHeadingButtonLabel,
    monthsHeadingButtonLabel,
  }: VisualOptions,
  styles: typeof calendarClasses,
  {
    min,
    max,
    disabled,
    locale,
  }: Pick<CalendarOptions<Msg>['props'], 'min' | 'max' | 'disabled' | 'locale'>,
) => {
  const rtl = direction === 'rtl'
  const captionChevron = h
    .el('svg')
    .attrs({
      viewBox: '0 0 16 16',
      width: '14',
      height: '14',
      fill: 'none',
      stroke: 'var(--muted-foreground, currentColor)',
      'stroke-width': '1.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
    })
    .children(h.el('path').attr('d', 'm4 6 4 4 4-4'))
  const root = calendar.root(
    h.div.class(styles.root, className).attrs({
      'data-slot': 'calendar',
      dir: direction,
      'data-calendar-mode': calendar.navigation.mode,
    }),
  )
  const navigation = calendar.navigation
  const earlier = rtl ? '›' : '‹'
  const later = rtl ? '‹' : '›'
  if (navigation.mode !== 'days') {
    const months = navigation.mode === 'months'
    const yearNumber = new Intl.NumberFormat(locale, { useGrouping: false })
    const shortMonth = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      month: 'short',
    })
    const longMonth = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      month: 'long',
      year: 'numeric',
    })
    const cells = months
      ? navigation.months.map(({ date, selected, unavailable, today }) => {
          const value = new Date(date + 'T00:00:00Z')
          return {
            key: date,
            label: shortMonth.format(value),
            name: longMonth.format(value),
            selected,
            unavailable,
            today,
            message: navigation.pickMonth(date),
          }
        })
      : navigation.years.map(({ year, selected, unavailable, today }) => ({
          key: String(year),
          label: yearNumber.format(year),
          name: yearNumber.format(year),
          selected,
          unavailable,
          today,
          message: navigation.pickYear(year),
        }))
    const selectedIndex = cells.findIndex(
      cell => cell.selected && !cell.unavailable,
    )
    const first =
      selectedIndex < 0
        ? cells.findIndex(cell => !cell.unavailable)
        : selectedIndex
    const label = months ? 'Choose a month' : 'Choose a year'
    return root.children(
      h.div.class(styles.header).children(
        months
          ? undefined
          : navigation
              .button(
                h.button
                  .class(styles.navigation)
                  .attr(
                    'aria-label',
                    previousYearsPageLabel ?? 'Previous years',
                  )
                  .disabled(!navigation.canPreviousPage),
                navigation.page(navigation.year - 12),
              )
              .children(earlier),
        h.h2.class(styles.month).children(
          months
            ? navigation
                .button(
                  h.button
                    .class(styles.month)
                    .style(captionStyle)
                    .attrs({
                      'aria-label':
                        monthsHeadingButtonLabel ??
                        `Choose year, ${yearNumber.format(navigation.year)}`,
                      'aria-haspopup': 'grid',
                    }),
                  navigation.show('years'),
                )
                .children(yearNumber.format(navigation.year), captionChevron)
            : `${yearNumber.format(navigation.firstYear)}–${yearNumber.format(navigation.lastYear)}`,
        ),
        months
          ? undefined
          : navigation
              .button(
                h.button
                  .class(styles.navigation)
                  .attr('aria-label', nextYearsPageLabel ?? 'Next years')
                  .disabled(!navigation.canNextPage),
                navigation.page(navigation.year + 12),
              )
              .children(later),
      ),
      navigation
        .grid(
          h.div
            .key(
              months
                ? `months-${navigation.year}`
                : `years-${navigation.firstYear}`,
            )
            .attrs({
              role: 'grid',
              'aria-label': label,
              'data-slot': months
                ? 'calendar-month-grid'
                : 'calendar-year-grid',
            })
            .style({
              minWidth: '15.75rem',
              display: 'grid',
              rowGap: '0.25rem',
            }),
        )
        .children(
          Array.from({ length: Math.ceil(cells.length / 3) }, (_, index) =>
            h.div
              .key(String(index))
              .attr('role', 'row')
              .style(row)
              .children(
                cells.slice(index * 3, index * 3 + 3).map((cell, column) =>
                  navigation
                    .button(
                      h.button
                        .key(cell.key)
                        .class(styles.day)
                        .attrs({
                          role: 'gridcell',
                          'data-calendar-choice': '',
                          'aria-label': cell.name,
                          'aria-selected': String(cell.selected),
                          'aria-current': cell.today ? 'date' : undefined,
                          'data-selected': cell.selected ? '' : undefined,
                          'data-disabled': cell.unavailable ? '' : undefined,
                          tabindex: index * 3 + column === first ? '0' : '-1',
                        })
                        .disabled(cell.unavailable)
                        .style({ width: '100%' }),
                      cell.message,
                    )
                    .children(cell.label),
                ),
              ),
          ),
        ),
      navigation
        .button(
          h.button.class(styles.month).style(captionStyle),
          navigation.show('days'),
        )
        .children('Back to calendar'),
    )
  }
  return root.children(
    h.div.class(styles.header).children(
      calendar
        .previous(
          h.button
            .class(styles.navigation)
            .attr('aria-label', previousMonthLabel ?? 'Previous month'),
        )
        .children(earlier),
      calendar.heading(h.h2.class(styles.month)).children(
        captionLayout === 'label' || disabled
          ? calendar.title
          : navigation
              .caption(
                h.button.class(styles.month).style(captionStyle).attrs({
                  'aria-haspopup': 'grid',
                  'aria-label': daysHeadingButtonLabel,
                  'data-slot': 'calendar-caption-trigger',
                }),
              )
              .children(calendar.title, captionChevron),
      ),
      calendar
        .next(
          h.button
            .class(styles.navigation)
            .attr('aria-label', nextMonthLabel ?? 'Next month'),
        )
        .children(later),
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
