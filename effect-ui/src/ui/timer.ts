import type { Html } from '@effect/ui/html'

import { TimerBehavior } from '../behaviors/timer'
import { TextBehavior, type TextProps } from '../behaviors/text'

type Options<Msg> = Parameters<typeof TimerBehavior<Msg>>[1]
export type TimerProps<Msg> = Omit<Options<Msg>, 'view' | 'fallback'> &
  Pick<TextProps<Msg>, 'type' | 'size' | 'color' | 'weight' | 'className'>

export const Timer = <Msg>(
  h: Html.H<Msg>,
  {
    type = 'supporting',
    size,
    color = 'secondary',
    weight,
    className,
    ...options
  }: TimerProps<NoInfer<Msg>>,
) =>
  TimerBehavior(h, {
    ...options,
    view: timer =>
      timer.root(h.time.class(className).attr('data-slot', 'timer')).children(
        TextBehavior(h, {
          type,
          color,
          hasTabularNumbers: true,
          children: [timer.text],
          ...(size === undefined ? {} : { size }),
          ...(weight === undefined ? {} : { weight }),
        }),
      ),
  })
