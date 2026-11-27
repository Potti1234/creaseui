import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import type { CalendarRange } from '../behaviors/calendar'
import { DateRangeInputBehavior } from '../behaviors/date-range-input'
import { IconBehavior } from '../behaviors/icon'
import { calendarClasses, calendarView } from './calendar'

type Options<Msg> = Parameters<typeof DateRangeInputBehavior<Msg>>[1]
const tailwind = {
  root: 'grid min-w-0 gap-2 text-sm',
  label:
    'flex w-fit items-center gap-2 text-sm leading-none font-medium select-none',
  description: 'm-0 text-sm text-muted-foreground',
  row: 'relative flex h-8 min-w-45 items-center gap-2 rounded-md border border-input bg-transparent px-2 py-1 shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--ring)_50%,transparent)] hover:shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--input)_30%,transparent)] aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[invalid=true]:border-destructive dark:bg-input/30 dark:data-[invalid=true]:focus-within:shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--destructive)_40%,transparent)] data-[invalid=true]:focus-within:shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--destructive)_20%,transparent)]',
  trigger:
    'block min-w-0 flex-1 cursor-pointer overflow-hidden bg-transparent text-start text-sm text-nowrap text-ellipsis outline-none disabled:cursor-default data-placeholder:text-muted-foreground',
  panel:
    'z-50 max-h-(--available-height) w-auto max-w-[calc(100vw-2rem)] overflow-auto rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none transition duration-200 ease-out data-ending-style:invisible',
  clear:
    'inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&>svg]:size-3.5',
  presets:
    'grid min-w-0 grid-cols-2 gap-1 border-b border-input p-3 sm:flex sm:min-w-35 sm:flex-col sm:border-e sm:border-b-0',
  preset:
    'block w-full cursor-pointer rounded-md bg-transparent px-2 py-1 text-start text-sm text-foreground outline-none transition-colors hover:bg-accent disabled:cursor-default disabled:text-muted-foreground disabled:opacity-50 aria-[current=true]:bg-accent aria-[current=true]:text-accent-foreground',
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
          h.div
            .class(styles.row)
            .attrs({
              'data-slot': 'date-range-input-wrapper',
              'data-invalid': invalid ? 'true' : 'false',
            })
            .children(
              h.span
                .class(
                  'inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground',
                )
                .attr('aria-hidden', 'true')
                .children(IconBehavior(h, { name: 'calendar', size: 'sm' })),
              popup.trigger({
                element: h.button
                  .class(styles.trigger)
                  .attrs({
                    id,
                    'data-slot': 'date-range-input-trigger',
                    'data-placeholder': value === null ? '' : undefined,
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
                  h.div
                    .class('flex flex-col sm:flex-row')
                    .attr('data-slot', 'popover-layout')
                    .children(
                      presets.length === 0
                        ? undefined
                        : h.div.class(styles.presets).children(
                            presets.map(({ label, value }, index) =>
                              preset(
                                h.button
                                  .key(String(index))
                                  .class(styles.preset),
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
                      calendarView(
                        h,
                        calendar,
                        { direction },
                        calendarStyles,
                        options.props.calendar,
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
