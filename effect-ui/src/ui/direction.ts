import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { DirectionBehavior, type DirectionValue } from '../behaviors/direction'

export const Direction = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    direction,
    key,
    children,
    className,
  }: {
    readonly direction: DirectionValue
    readonly key?: string
    readonly children?: View.Children<NoInfer<Msg>, R>
    readonly className?: string
  },
) =>
  DirectionBehavior(h, {
    key,
    props: { direction },
    view: state =>
      h.div
        .class(className)
        .attrs({ dir: state.direction, 'data-slot': 'direction' })
        .children(children),
  })
