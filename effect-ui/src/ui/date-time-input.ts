import type { Html } from '@effect/ui/html'

import {
  DateTimeInputBehavior,
  timeSuggestions,
} from '../behaviors/date-time-input'
import { DateInput, type DateInputProps } from './date-input'
import { TimeInput, type TimeInputProps } from './time-input'

const tailwind = {
  root: 'grid min-w-0 gap-2 text-sm',
  label: 'font-medium',
  row: 'grid min-w-0 gap-2',
  description: 'm-0 text-sm text-muted-foreground',
}

export type DateTimeInputProps<Msg, R = never> = {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly name?: string
  readonly form?: string
  readonly disabled?: boolean
  readonly className?: string
  readonly timeOptionInterval?: number
  readonly date: Omit<DateInputProps<Msg, R>, 'id' | 'key'>
  readonly time: Omit<TimeInputProps<Msg, R>, 'id' | 'key'>
}

export const DateTimeInput = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label,
    description,
    name,
    form,
    disabled,
    className,
    timeOptionInterval,
    date,
    time,
  }: DateTimeInputProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
  renderDate: typeof DateInput = DateInput,
  renderTime: typeof TimeInput = TimeInput,
) => {
  const options =
    time.options ??
    (timeOptionInterval === undefined
      ? undefined
      : timeSuggestions(
          timeOptionInterval,
          time.props.hourFormat ?? '12h',
          time.props.hasSeconds ?? false,
        ))
  return DateTimeInputBehavior(h, {
    id,
    label,
    date: date.props.value,
    time: time.props.value,
    name,
    form,
    disabled,
    className: [styles.root, className].filter(Boolean).join(' '),
    labelClass: styles.label,
    children: [
      h.div.class(styles.row).children(
        renderDate(h, {
          ...date,
          id: `${id}-date`,
          props: { ...date.props, disabled: disabled || date.props.disabled },
        }),
        renderTime(h, {
          ...time,
          id: `${id}-time`,
          ...(options === undefined ? {} : { options }),
          props: { ...time.props, disabled: disabled || time.props.disabled },
        }),
      ),
      description === undefined
        ? undefined
        : h.p.class(styles.description).children(description),
    ],
  })
}
