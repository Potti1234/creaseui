import { type Html, html } from 'foldkit/html'

import { cn } from '@/lib/utils'

export type ProgressProps = Readonly<{
  value: number
  class?: string
}>

export const progress = <Msg>(props: ProgressProps): Html => {
  const h = html<Msg>()
  const value = Math.min(100, Math.max(0, props.value))

  return h.div(
    [
      h.Role('progressbar'),
      h.AriaValuemin(0),
      h.AriaValuemax(100),
      h.AriaValuenow(value),
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
          h.Class('h-full w-full flex-1 bg-primary transition-all'),
          h.Style({ transform: `translateX(-${100 - value}%)` }),
        ],
        [],
      ),
    ],
  )
}
