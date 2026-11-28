import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { formatDisplayTime, formatISOTime } from './time-input'

export const combineDateTime = (
  date: string | null,
  time: string | null,
): string | null => (date === null || time === null ? null : `${date}T${time}`)

export const timeSuggestions = (
  interval: number,
  hourFormat: '12h' | '24h',
  hasSeconds: boolean,
) => {
  const step = Math.floor(interval)
  return Number.isFinite(step) && step > 0
    ? Array.from({ length: Math.ceil(1440 / step) }, (_, index) =>
        formatDisplayTime(formatISOTime(index * step, 0, hasSeconds), {
          hourFormat,
          hasSeconds,
        }),
      )
    : []
}

export const DateTimeInputBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  options: {
    readonly id: string
    readonly label: string
    readonly date: string | null
    readonly time: string | null
    readonly name?: string | undefined
    readonly form?: string | undefined
    readonly disabled?: boolean | undefined
    readonly className?: string | undefined
    readonly labelClass?: string | undefined
    readonly children: View.Children<NoInfer<Msg>, R>
  },
) =>
  h.div
    .class(options.className)
    .attrs({
      'data-slot': 'date-time-input',
      role: 'group',
      'aria-labelledby': `${options.id}-label`,
    })
    .children(
      h.span
        .class(options.labelClass)
        .attr('id', `${options.id}-label`)
        .children(options.label),
      options.children,
      options.name === undefined
        ? undefined
        : h.input
            .attrs({
              type: 'hidden',
              name: options.name,
              form: options.form,
            })
            .disabled(options.disabled === true)
            .value(combineDateTime(options.date, options.time) ?? ''),
    )
