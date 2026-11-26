import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import type { CalendarRange } from '../behaviors/calendar'
import { DateRangeInputBehavior } from '../behaviors/date-range-input'
import { calendarClasses, calendarView } from './calendar'

type Options<Msg> = Parameters<typeof DateRangeInputBehavior<Msg>>[1]
const tailwind = {
  root: 'grid min-w-0 gap-1.5 text-sm',
  label: 'font-medium',
  description: 'm-0 text-sm text-muted-foreground',
  row: 'flex min-w-0 items-center gap-1',
  trigger:
    'flex min-h-9 w-full items-center justify-start rounded-md border border-input bg-background px-3 text-start text-sm shadow-xs outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive',
  panel:
    'grid max-h-(--available-height) max-w-(--available-width) justify-items-start overflow-auto rounded-lg bg-popover text-popover-foreground shadow-md outline-none data-ending-style:invisible',
  clear:
    'grid size-8 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-muted focus-visible:outline-2',
  presets: 'flex flex-wrap gap-1 p-2',
  preset:
    'rounded-md px-2 py-1 text-sm hover:bg-muted focus-visible:outline-2 disabled:opacity-50',
}

export type DateRangePreset = {
  readonly label: string
  readonly value: typeof CalendarRange.Type
}

export const DateRangeInput = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label,
    placeholder = 'Choose date range',
    description,
    status,
    clearable,
    invalid,
    className,
    direction,
    startName,
    endName,
    form,
    presets = [],
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly id: string
    readonly label: string
    readonly placeholder?: string
    readonly description?: string
    readonly status?: View.Input<NoInfer<Msg>, R>
    readonly clearable?: boolean
    readonly invalid?: boolean
    readonly className?: string
    readonly direction?: 'ltr' | 'rtl' | undefined
    readonly presets?: readonly DateRangePreset[]
    readonly startName?: string
    readonly endName?: string
    readonly form?: string
  },
  styles: typeof tailwind = tailwind,
  calendarStyles: typeof calendarClasses = calendarClasses,
) => {
  const { value, locale, disabled, readOnly, min, max } = options.props.calendar
  const descId = description === undefined ? undefined : `${id}-description`
  const statusId = status === undefined ? undefined : `${id}-status`
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const dates = value === null ? undefined : [value.start, value.end].sort()
  const display =
    value === null
      ? placeholder
      : formatter.formatRange(
          new Date((dates?.[0] ?? value.start) + 'T00:00:00Z'),
          new Date((dates?.[1] ?? value.end) + 'T00:00:00Z'),
        )
  const hidden = (name: string | undefined, value: string | undefined) =>
    name === undefined
      ? undefined
      : h.input
          .attrs({ type: 'hidden', name, form })
          .disabled(disabled === true)
          .value(value ?? '')

  return DateRangeInputBehavior(h, {
    ...options,
    key: options.key ?? id,
    view: ({ popup, calendar, preset }) =>
      h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'date-range-input', dir: direction })
        .children(
          h.label.class(styles.label).attr('for', id).children(label),
          h.div.class(styles.row).children(
            popup.trigger({
              element: h.button
                .class(styles.trigger)
                .attrs({
                  id,
                  'data-slot': 'date-range-input-trigger',
                  'aria-label': `${label}, ${display}`,
                  'aria-invalid': invalid ? 'true' : undefined,
                  'aria-describedby':
                    [descId, statusId].filter(Boolean).join(' ') || undefined,
                })
                .children(display),
              disabled: disabled === true,
            }),
            clearable && value !== null && !disabled && !readOnly
              ? preset(
                  h.button
                    .class(styles.clear)
                    .attr('aria-label', `Clear ${label}`),
                  null,
                ).children('×')
              : undefined,
          ),
          popup.portal(h.dialog.attr('aria-label', label))?.children(
            popup.backdrop(h.div),
            popup.positioner(h.div).children(
              popup
                .popup(
                  h.div
                    .class(styles.panel)
                    .attr('data-slot', 'date-range-input-content'),
                )
                .children(
                  calendarView(
                    h,
                    calendar,
                    { direction },
                    calendarStyles,
                    options.props.calendar,
                  ),
                  presets.length === 0
                    ? undefined
                    : h.div.class(styles.presets).children(
                        presets.map(({ label, value }, index) =>
                          preset(
                            h.button.key(String(index)).class(styles.preset),
                            value,
                          )
                            .disabled(
                              disabled === true ||
                                readOnly === true ||
                                value.start > value.end ||
                                (min !== undefined && value.start < min) ||
                                (max !== undefined && value.end > max),
                            )
                            .children(label),
                        ),
                      ),
                ),
            ),
          ),
          description === undefined
            ? undefined
            : h.p
                .class(styles.description)
                .attr('id', descId)
                .children(description),
          status === undefined
            ? undefined
            : h.div.attr('id', statusId).children(status),
          hidden(startName, value?.start),
          hidden(endName, value?.end),
        ),
  })
}
