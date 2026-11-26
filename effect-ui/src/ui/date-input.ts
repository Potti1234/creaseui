import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { DateTime, Schema } from 'effect'

import { CalendarDate } from '../behaviors/calendar'
import { DateInputBehavior, type DateFieldProps } from '../behaviors/date-input'

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
  readonly presentation?: 'input' | 'native-picker'
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
    min,
    max,
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
) => {
  const value =
    props.value !== null && isDate(props.value)
      ? DateTime.makeUnsafe(props.value + 'T00:00:00Z')
      : null
  const descId = description === undefined ? undefined : `${id}-description`
  const statusId = status === undefined ? undefined : `${id}-status`
  const describedBy = [
    descId,
    statusId,
    element.elementAttrs['aria-describedby'],
  ]
    .filter(Boolean)
    .join(' ')
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
      'aria-describedby': describedBy || undefined,
    })
  const frame = (control: View.Input<NoInfer<Msg>, R>) =>
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
          suffix,
          clearable && value !== null && !props.disabled && !props.readOnly
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
        .value(props.value ?? '')
        .disabled(props.disabled === true)
        .on('change', ({ value }) =>
          props.disabled || props.readOnly
            ? undefined
            : commit(value === '' ? null : value),
        ),
    )
  }

  return DateInputBehavior(h, {
    key,
    props: { ...props, value },
    onEmit: {
      Committed: ({ date }) =>
        commit(date === null ? null : DateTime.formatIsoDateUtc(date)),
    },
    view: field =>
      frame(
        field.input(input.attr('placeholder', placeholder ?? field.pattern)),
      ),
  })
}
