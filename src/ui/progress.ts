import type { Html, HtmlBuilder } from 'foldkit/html'

import { normalizeProgress, progressAttributes } from '@/lib/progress'
import { cn } from '@/lib/utils'

export type ProgressProps = Readonly<{
  /** `null` renders an indeterminate progress indicator. */
  value: number | null
  max?: number
  ariaLabel?: string
  valueText?: string
  id?: string
  direction?: 'ltr' | 'rtl'
  class?: string
}>

export const progress = <Msg>(
  props: ProgressProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const normalized = normalizeProgress(props.value, props.max)
  return h.div(
    [
      ...progressAttributes(
        { ...props, value: normalized.value, max: normalized.max },
        h,
      ),
      ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
      h.DataAttribute('state', normalized.state),
      h.DataAttribute('slot', 'progress'),
      h.Class(
        cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
          props.class,
        ),
      ),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'progress-indicator'),
          h.Class(
            'h-full w-full flex-1 bg-primary transition-all motion-reduce:transition-none',
          ),
          h.Style({
            transform:
              normalized.percentage === null
                ? 'translateX(-60%)'
                : `translateX(${(props.direction === 'rtl' ? 1 : -1) * (100 - normalized.percentage)}%)`,
          }),
          ...(normalized.value === null
            ? [
                h.Class(
                  'animate-[progress-indeterminate_1.5s_ease-in-out_infinite] motion-reduce:animate-none',
                ),
              ]
            : []),
        ],
        [],
      ),
    ],
  )
}
