import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { Option } from 'effect'

import {
  TimeInputBehavior,
  resolveTimePart,
  timePartOptions,
  timePartValue,
  type TimeProps,
  type TimePart,
} from '../behaviors/time-input'

export const timeInputClasses = {
  root: 'grid min-w-0 gap-1.5 text-sm',
  label: 'font-medium',
  hiddenLabel: 'sr-only',
  row: 'flex min-w-0 flex-wrap items-center gap-1',
  control:
    'h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive data-[size=sm]:h-7 data-[size=lg]:h-9 md:text-sm',
  segment:
    'h-8 min-w-0 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50',
  clear:
    'grid size-7 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-muted focus-visible:outline-2',
  description: 'm-0 text-sm text-muted-foreground',
}

export type TimeInputProps<Msg, R = never> = {
  readonly props: TimeProps
  readonly id: string
  readonly key?: string
  readonly label: string
  readonly description?: string
  readonly hideLabel?: boolean
  readonly placeholder?: string
  readonly clearable?: boolean
  readonly invalid?: boolean
  readonly presentation?: 'input' | 'select'
  readonly size?: 'sm' | 'md' | 'lg'
  readonly status?: View.Input<Msg, R>
  readonly options?: readonly string[]
  readonly onCommit: (value: string | null) => Msg
  readonly className?: string
  readonly direction?: 'ltr' | 'rtl'
}

export const TimeInput = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    id,
    key = id,
    label,
    description,
    hideLabel,
    placeholder,
    clearable,
    invalid,
    presentation = 'input',
    size = 'md',
    status,
    options,
    onCommit,
    className,
    direction,
  }: TimeInputProps<NoInfer<Msg>, R>,
  styles: typeof timeInputClasses = timeInputClasses,
) =>
  TimeInputBehavior(h, {
    key,
    props,
    onEmit: { Committed: ({ value }) => onCommit(value) },
    view: time => {
      const { hourFormat, hasSeconds } = time.pickerOptions
      const parts: readonly TimePart[] = [
        'hour',
        'minute',
        ...(hasSeconds ? ['second' as const] : []),
        ...(hourFormat === '12h' ? ['period' as const] : []),
      ]
      const descId = description === undefined ? undefined : `${id}-description`
      const statusId = status === undefined ? undefined : `${id}-status`
      const describedBy =
        [descId, statusId].filter(Boolean).join(' ') || undefined
      const optionsId = options === undefined ? undefined : `${id}-suggestions`
      return h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'time-input', dir: direction })
        .children(
          h.label
            .class(hideLabel ? styles.hiddenLabel : styles.label)
            .attr('for', id)
            .children(label),
          h.div.class(styles.row).children(
            presentation === 'select'
              ? parts.map((part, index) => {
                  const selected = Option.getOrElse(
                    timePartValue(time.value, part, hourFormat),
                    () => '',
                  )
                  return time
                    .segment(
                      h.select
                        .key(part)
                        .class(styles.segment)
                        .attrs({
                          id: index === 0 ? id : `${id}-${part}`,
                          form: props.form,
                          required: props.required ? '' : undefined,
                          'aria-label': `${label}, ${part}`,
                          'aria-describedby': describedBy,
                          'aria-invalid': invalid ? 'true' : undefined,
                        }),
                      part,
                    )
                    .children(
                      selected === ''
                        ? h.option
                            .attrs({ value: '', selected: '', disabled: '' })
                            .children('–')
                        : undefined,
                      timePartOptions(part, hourFormat).map(value =>
                        h.option
                          .key(value)
                          .attrs({
                            value,
                            selected: value === selected ? '' : undefined,
                            disabled:
                              resolveTimePart(
                                time.value,
                                part,
                                value,
                                time.pickerOptions,
                              ) === null
                                ? ''
                                : undefined,
                          })
                          .children(value),
                      ),
                    )
                })
              : time.input(
                  h.input.class(styles.control).attrs({
                    id,
                    placeholder:
                      placeholder ??
                      (hourFormat === '12h' ? 'h:mm AM' : 'HH:mm'),
                    list: optionsId,
                    autocomplete: 'off',
                    'data-size': size,
                    'data-slot': 'time-input-control',
                    'aria-describedby': describedBy,
                    'aria-invalid':
                      invalid || time.invalid ? 'true' : undefined,
                  }),
                ),
            clearable &&
              time.value !== null &&
              !props.disabled &&
              !props.readOnly
              ? time
                  .clear(
                    h.button
                      .class(styles.clear)
                      .attr('aria-label', `Clear ${label}`),
                  )
                  .children('×')
              : undefined,
          ),
          optionsId === undefined
            ? undefined
            : h.datalist
                .attr('id', optionsId)
                .children(
                  options?.map(value =>
                    h.option.key(value).attr('value', value),
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
          props.name === undefined ? undefined : time.submitted(h.input),
        )
    },
  })
