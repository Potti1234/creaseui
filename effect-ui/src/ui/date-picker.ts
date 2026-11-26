import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { DatePickerBehavior } from '../behaviors/date-picker'
import { calendarClasses, calendarView } from './calendar'

type Options<Msg> = Parameters<typeof DatePickerBehavior<Msg>>[1]
const tailwind = {
  root: 'flex w-fit max-w-full items-center gap-1',
  trigger:
    'flex min-h-9 min-w-32 items-center justify-start rounded-md border border-input bg-background px-3 text-start text-sm shadow-xs outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50',
  panel:
    'grid max-h-(--available-height) max-w-(--available-width) justify-items-start overflow-auto rounded-lg bg-popover text-popover-foreground shadow-md outline-none data-ending-style:invisible',
  clear:
    'grid size-8 place-items-center rounded-sm text-muted-foreground hover:bg-muted focus-visible:outline-2',
  query: 'grid w-full gap-1 px-3 py-2 text-sm',
  queryInput:
    'h-8 min-w-0 rounded-md border border-input bg-background px-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive',
  queryError: 'text-xs text-destructive',
}

export const DatePicker = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    placeholder = 'Choose date',
    formatValue,
    className,
    direction,
    clearable,
    trigger,
    captionLayout,
    query,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly label: string
    readonly placeholder?: string
    readonly formatValue?: (iso: string) => string
    readonly className?: string
    readonly direction?: 'ltr' | 'rtl' | undefined
    readonly clearable?: boolean
    readonly captionLayout?: 'label' | 'dropdown' | undefined
    readonly query?: {
      readonly value: string
      readonly label: string
      readonly error?: string
      readonly onInput: (value: string) => NoInfer<Msg>
    }
    readonly trigger?: (
      display: string,
    ) => Html.Element<
      NoInfer<Msg>,
      R,
      Html.EventsOf<'button'>,
      HTMLButtonElement,
      'button'
    >
  },
  styles: typeof tailwind = tailwind,
  calendarStyles: typeof calendarClasses = calendarClasses,
) => {
  const { value, disabled, readOnly, locale } = options.props.calendar
  const display =
    value === null
      ? placeholder
      : (formatValue?.(value) ??
        new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeZone: 'UTC',
        }).format(new Date(value + 'T00:00:00Z')))
  return DatePickerBehavior(h, {
    ...options,
    view: ({ popup, calendar, clear }) =>
      h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'date-picker', dir: direction })
        .children(
          popup.trigger({
            element: (
              trigger?.(display) ??
              h.button.class(styles.trigger).children(display)
            ).attrs({
              'data-slot': 'date-picker-trigger',
              'aria-label': `${label}, ${display}`,
            }),
            disabled: disabled === true,
          }),
          clearable && value !== null && !disabled && !readOnly
            ? clear(
                h.button
                  .class(styles.clear)
                  .attr('aria-label', `Clear ${label}`),
              ).children('×')
            : undefined,
          popup.portal(h.dialog.attr('aria-label', label))?.children(
            popup.backdrop(h.div),
            popup.positioner(h.div).children(
              popup
                .popup(
                  h.div
                    .class(styles.panel)
                    .attr('data-slot', 'date-picker-content'),
                )
                .children(
                  query === undefined
                    ? undefined
                    : h.label.class(styles.query).children(
                        query.label,
                        h.input
                          .class(styles.queryInput)
                          .attrs({
                            'aria-invalid':
                              query.error === undefined ? undefined : 'true',
                          })
                          .value(query.value)
                          .on('input', ({ value }) => query.onInput(value)),
                        query.error === undefined
                          ? undefined
                          : h.span
                              .class(styles.queryError)
                              .attr('role', 'status')
                              .children(query.error),
                      ),
                  calendarView(
                    h,
                    calendar,
                    { direction, captionLayout },
                    calendarStyles,
                    options.props.calendar,
                  ),
                ),
            ),
          ),
        ),
  })
}
