import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { DateTime, Schema } from 'effect'

import { CalendarDate } from '../behaviors/calendar'
import {
  DateInputBehavior,
  DateInputPickerBehavior,
  FormattedDateInputBehavior,
  formatDateText,
  parseDateText,
  type DateFieldProps,
  type ParseDateText,
  type SharedDateFormat,
} from '../behaviors/date-input'
import { calendarClasses, calendarView } from './calendar'

export type { ParseDateText, SharedDateFormat } from '../behaviors/date-input'

const isDate = Schema.is(CalendarDate)
export const dateInputClasses = {
  root: 'grid min-w-0 gap-1.5 text-sm',
  label: 'font-medium',
  hiddenLabel: 'sr-only',
  row: 'flex min-w-0 items-center gap-1',
  control:
    'h-8 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive data-[size=sm]:h-7 data-[size=lg]:h-9 md:text-sm',
  clear:
    'grid size-7 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-muted focus-visible:outline-2',
  description: 'm-0 text-sm text-muted-foreground',
}

export type DateInputProps<Msg, R = never> = {
  readonly props: Omit<DateFieldProps, 'value'> & {
    readonly value: string | null
  }
  readonly onCommit: (value: string | null) => Msg
  readonly id: string
  readonly key?: string
  readonly label: string
  readonly hideLabel?: boolean
  readonly placeholder?: string
  readonly presentation?:
    | 'input'
    | 'native-picker'
    | 'popover'
    | 'adaptive-bottom-sheet'
  readonly format?: SharedDateFormat | ((iso: string) => string)
  readonly parse?: ParseDateText
  readonly today?: string
  readonly min?: string
  readonly max?: string
  readonly description?: string
  readonly status?: View.Input<Msg, R>
  readonly suffix?: View.Input<Msg, R>
  readonly clearable?: boolean
  readonly invalid?: boolean
  readonly size?: 'sm' | 'md' | 'lg'
  readonly className?: string
  readonly direction?: 'ltr' | 'rtl'
  readonly element?: Html.VoidElement<
    Msg,
    R,
    Html.EventsOf<'input'>,
    HTMLInputElement,
    'input'
  >
}

const calendarPanelStyle: Html.Style = {
  maxHeight: 'var(--available-height)',
  maxWidth: 'var(--available-width)',
  overflow: 'auto',
  borderRadius: 'var(--radius, 0.5rem)',
  background: 'var(--popover, Canvas)',
  color: 'var(--popover-foreground, CanvasText)',
  boxShadow: '0 4px 16px rgb(0 0 0 / 0.18)',
}

const dateSheetStyle: Html.Style = {
  display: 'grid',
  gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
  justifyItems: 'center',
  gap: '0.5rem',
  maxHeight: 'calc(100dvh - var(--drawer-keyboard-inset, 0px))',
  overflow: 'hidden',
  padding: '1rem',
  paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
  borderRadius: 'var(--radius, 0.75rem) var(--radius, 0.75rem) 0 0',
  background: 'var(--popover, Canvas)',
  color: 'var(--popover-foreground, CanvasText)',
  translate: '0 var(--drawer-swipe-movement-y, 0px)',
}

export const DateInput = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    onCommit,
    id,
    key = id,
    label,
    hideLabel,
    placeholder,
    description,
    presentation = 'input',
    format,
    parse,
    today,
    min: minValue,
    max: maxValue,
    status,
    suffix,
    clearable,
    invalid,
    size = 'md',
    className,
    direction,
    element = h.input,
  }: DateInputProps<NoInfer<Msg>, R>,
  styles: typeof dateInputClasses = dateInputClasses,
  calendarStyles: typeof calendarClasses = calendarClasses,
) => {
  const iso = props.value !== null && isDate(props.value) ? props.value : null
  const min = isDate(minValue) ? minValue : undefined
  const max = isDate(maxValue) ? maxValue : undefined
  const descId = description === undefined ? undefined : `${id}-description`
  const statusId = status === undefined ? undefined : `${id}-status`
  const errorId = `${id}-invalid`
  const error = 'Enter a valid date within the allowed range.'
  const describedBy = (invalidDraft = false) =>
    [
      descId,
      statusId,
      element.elementAttrs['aria-describedby'],
      invalidDraft ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined
  const commit = (date: string | null) =>
    date === null ||
    ((min === undefined || date >= min) && (max === undefined || date <= max))
      ? onCommit(date)
      : undefined
  const input = element
    .class(styles.control, element.elementAttrs.class)
    .attrs({
      id,
      'data-size': size,
      'data-slot': 'date-input-control',
      'aria-invalid':
        invalid === undefined
          ? element.elementAttrs['aria-invalid']
          : String(invalid),
      'aria-describedby': describedBy(),
    })
  const frame = (
    control: View.Input<NoInfer<Msg>, R>,
    trigger?: View.Input<NoInfer<Msg>, R>,
    invalidDraft = false,
  ) =>
    h.div
      .class(styles.root, className)
      .attrs({ 'data-slot': 'date-input', dir: direction })
      .children(
        h.label
          .class(hideLabel ? styles.hiddenLabel : styles.label)
          .attr('for', id)
          .children(label),
        h.div.class(styles.row).children(
          control,
          trigger,
          suffix,
          clearable && iso !== null && !props.disabled && !props.readOnly
            ? h.button
                .class(styles.clear)
                .attrs({ type: 'button', 'aria-label': `Clear ${label}` })
                .on('click', () => onCommit(null))
                .children('×')
            : undefined,
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
        invalidDraft
          ? h.p
              .class(styles.description)
              .attrs({ id: errorId, role: 'status' })
              .children(error)
          : undefined,
      )

  if (presentation === 'native-picker') {
    return frame(
      input
        .attrs({
          type: 'date',
          min,
          max,
          name: props.name,
          form: props.form,
          readonly: props.readOnly ? '' : undefined,
          required: props.required ? '' : undefined,
        })
        .value(iso ?? '')
        .disabled(props.disabled === true)
        .on('change', ({ value }) =>
          props.disabled || props.readOnly
            ? undefined
            : commit(value === '' ? null : value),
        ),
    )
  }

  const textFormat =
    format ?? (presentation === 'input' ? undefined : 'date_long')
  const renderField = (trigger?: View.Input<NoInfer<Msg>, R>) => {
    if (textFormat !== undefined || parse !== undefined) {
      const { disabled, form, locale, name, readOnly, required } = props
      const parser = parse ?? ((text: string) => parseDateText(text, locale))
      const formatted =
        iso === null
          ? ''
          : typeof textFormat === 'function'
            ? textFormat(iso)
            : formatDateText(iso, textFormat ?? 'system_date', locale)
      return FormattedDateInputBehavior(h, {
        key,
        props: { value: iso, min, max, disabled, readOnly, required },
        onEmit: { Committed: ({ value }) => commit(value) },
        view: field =>
          frame(
            [
              field.input(
                input.attrs({
                  name: undefined,
                  form,
                  placeholder:
                    placeholder ??
                    (textFormat === undefined || textFormat === 'system_date'
                      ? 'YYYY-MM-DD'
                      : undefined),
                  'aria-invalid': field.invalid
                    ? 'true'
                    : input.elementAttrs['aria-invalid'],
                  'aria-describedby': describedBy(field.invalid),
                }),
                formatted,
                parser,
                error,
              ),
              name === undefined
                ? undefined
                : h.input
                    .attrs({ type: 'hidden', name, form })
                    .value(iso ?? '')
                    .disabled(disabled === true),
            ],
            trigger,
            field.invalid,
          ),
      })
    }

    return DateInputBehavior(h, {
      key,
      props: {
        ...props,
        value: iso === null ? null : DateTime.makeUnsafe(iso + 'T00:00:00Z'),
      },
      onEmit: {
        Committed: ({ date }) =>
          commit(date === null ? null : DateTime.formatIsoDateUtc(date)),
      },
      view: field =>
        frame(
          field.input(input.attr('placeholder', placeholder ?? field.pattern)),
          trigger,
        ),
    })
  }

  if (presentation === 'input') return renderField()

  const locale =
    typeof props.locale === 'string' ? props.locale : props.locale?.[0]
  const calendarProps = {
    min,
    max,
    locale,
    disabled: props.disabled,
    readOnly: props.readOnly,
  }
  const pickerLabel = `Choose date for ${label}`
  const trigger = h.button
    .class(styles.clear)
    .attrs({
      id: `${id}-picker-trigger`,
      type: 'button',
      'aria-label': pickerLabel,
      'data-slot': 'date-input-calendar-trigger',
    })
    .disabled(props.disabled === true || props.readOnly === true)
    .children(
      h
        .el('svg')
        .attrs({
          viewBox: '0 0 24 24',
          width: '16',
          height: '16',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        })
        .children(
          h.el('path').attrs({
            d: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
          }),
        ),
    )
  return DateInputPickerBehavior(h, {
    key,
    props: {
      ...calendarProps,
      value: iso,
      today: isDate(today) ? today : new Date().toISOString().slice(0, 10),
      adaptive: presentation === 'adaptive-bottom-sheet',
    },
    onEmit: { Committed: ({ value }) => commit(value) },
    view: ({ root, compact, popover, drawer, calendar }) => {
      const picker = calendarView(
        h,
        calendar,
        { direction },
        calendarStyles,
        calendarProps,
      )
      return root(
        h.div.attrs({ 'data-slot': 'date-input-picker', dir: direction }),
      ).children(
        renderField(
          compact
            ? drawer.finalFocus(drawer.trigger(trigger))
            : popover.trigger({
                element: popover.finalFocus(trigger),
                disabled: props.disabled === true || props.readOnly === true,
              }),
        ),
        compact
          ? drawer
              .portal(h.dialog.attr('data-slot', 'date-input-sheet'))
              ?.children(
                drawer.backdrop(
                  h.div.style({
                    position: 'fixed',
                    inset: '0',
                    background: 'rgb(0 0 0 / 0.5)',
                    opacity: 'calc(1 - var(--drawer-swipe-progress, 0))',
                  }),
                ),
                drawer
                  .viewport(
                    h.div.style({
                      position: 'fixed',
                      inset: '0',
                      display: 'grid',
                      alignItems: 'end',
                      paddingBottom: 'var(--drawer-keyboard-inset, 0px)',
                    }),
                  )
                  .children(
                    drawer
                      .popup(
                        h.div.style(dateSheetStyle).attrs({
                          dir: direction,
                          'data-slot': 'date-input-sheet-content',
                        }),
                      )
                      .children(
                        h.div
                          .style({
                            width: '3rem',
                            height: '0.25rem',
                            borderRadius: '1rem',
                            background: 'var(--border, GrayText)',
                          })
                          .attr('aria-hidden', 'true'),
                        drawer
                          .title(h.h2.class(styles.label))
                          .children(pickerLabel),
                        drawer
                          .content(
                            h.div.style({
                              overflow: 'auto',
                              overscrollBehavior: 'contain',
                            }),
                          )
                          .children(picker),
                        drawer
                          .close(
                            h.button.class(styles.clear).style({
                              width: 'auto',
                              paddingInline: '0.75rem',
                            }),
                          )
                          .children('Close'),
                      ),
                  ),
              )
          : popover.portal(h.dialog.attr('aria-label', pickerLabel))?.children(
              popover.backdrop(h.div),
              popover.positioner(h.div).children(
                popover
                  .popup(
                    h.div.style(calendarPanelStyle).attrs({
                      dir: direction,
                      'data-slot': 'date-input-calendar-popover',
                    }),
                  )
                  .children(picker),
              ),
            ),
      )
    },
  })
}
