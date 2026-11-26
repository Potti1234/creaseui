import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  paddingStyles,
  sizing,
  type LayoutPadding,
  type LayoutSize,
} from './layout'

export type SectionVariant = 'section' | 'muted' | 'transparent'
export type SectionDivider = 'top' | 'bottom' | 'start' | 'end'

const surfaces = {
  section: 'var(--card)',
  muted: 'var(--muted)',
  transparent: 'transparent',
}
const divider = '1px solid var(--border)'

export type SectionProps<Msg, R = never> = LayoutPadding &
  LayoutSize & {
    readonly variant?: SectionVariant
    readonly dividers?: readonly SectionDivider[]
    readonly className?: string
    readonly children?: View.Children<Msg, R>
  }

export const SectionBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  props: SectionProps<NoInfer<Msg>, R>,
) => {
  const { variant = 'section', dividers = [], className, children } = props
  return h.section
    .class(className)
    .attrs({ 'data-slot': 'section', 'data-variant': variant })
    .style({
      backgroundColor: surfaces[variant],
      borderTop: dividers.includes('top') ? divider : undefined,
      borderBottom: dividers.includes('bottom') ? divider : undefined,
      borderInlineStart: dividers.includes('start') ? divider : undefined,
      borderInlineEnd: dividers.includes('end') ? divider : undefined,
      ...paddingStyles({ ...props, padding: props.padding ?? 4 }),
      ...sizing(props),
    })
    .children(children)
}
