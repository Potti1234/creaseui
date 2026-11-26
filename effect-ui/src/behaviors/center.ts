import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  paddingStyles,
  sizing,
  type LayoutPadding,
  type LayoutSize,
} from './layout'

export type CenterProps<Msg, R = never> = LayoutPadding &
  LayoutSize & {
    readonly axis?: 'both' | 'horizontal' | 'vertical'
    readonly isInline?: boolean
    readonly children?: View.Children<Msg, R>
  }

export const CenterBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    axis = 'both',
    isInline,
    children,
    ...layout
  }: CenterProps<NoInfer<Msg>, R>,
) =>
  h.div
    .attrs({ 'data-slot': 'center', 'data-axis': axis })
    .style({
      display: isInline ? 'inline-flex' : 'flex',
      alignItems: axis === 'horizontal' ? undefined : 'center',
      justifyContent: axis === 'vertical' ? undefined : 'center',
      ...paddingStyles(layout),
      ...sizing(layout),
    })
    .children(children)
