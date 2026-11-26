import type { Html } from '@effect/ui/html'

import { CalendarBehavior } from '../behaviors/calendar'

type CalendarOptions<Msg> = Parameters<typeof CalendarBehavior<Msg>>[1]

const tailwind = {
  root: 'w-fit rounded-lg border bg-background p-3 text-foreground',
  header: 'mb-2 flex items-center justify-between gap-2',
  navigation:
    'grid size-9 place-items-center rounded-md border border-input bg-background text-sm hover:bg-muted focus-visible:outline-2',
  month: 'text-sm font-medium',
  table: 'border-collapse',
  weekday: 'h-8 text-xs font-normal text-muted-foreground',
  cell: 'p-0 text-center',
  day: 'size-9 rounded-md text-sm tabular-nums hover:bg-muted focus-visible:outline-2 data-outside:text-muted-foreground data-disabled:opacity-50 data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary/80',
}

export const Calendar = <Msg>(
  h: Html.H<Msg>,
  options: Omit<CalendarOptions<Msg>, 'view' | 'fallback'>,
  styles: typeof tailwind = tailwind,
) =>
  CalendarBehavior(h, {
    ...options,
    view: calendar =>
      h.div
        .class(styles.root)
        .attr('data-slot', 'calendar')
        .children(
          h.div
            .class(styles.header)
            .children(
              calendar
                .navigation(h.button.class(styles.navigation), -1)
                .children('‹'),
              calendar.month(h.h2.class(styles.month)).children(calendar.label),
              calendar
                .navigation(h.button.class(styles.navigation), 1)
                .children('›'),
            ),
          calendar
            .grid(h.table.class(styles.table))
            .children(
              h.thead(
                h.tr(
                  calendar.weekdays.map(label =>
                    h.th
                      .class(styles.weekday)
                      .attr('scope', 'col')
                      .children(label),
                  ),
                ),
              ),
              h.tbody(
                calendar.weeks.map(week =>
                  h.tr
                    .key(week[0] ?? '')
                    .children(
                      week.map(date =>
                        calendar
                          .cell(h.td.key(date).class(styles.cell), date)
                          .children(
                            calendar
                              .day(h.button.class(styles.day), date)
                              .children(String(Number(date.slice(-2)))),
                          ),
                      ),
                    ),
                ),
              ),
            ),
        ),
  })
