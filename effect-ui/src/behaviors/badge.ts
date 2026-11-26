import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type BadgeProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly href?: string
  readonly variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'ghost'
    | 'link'
}

export const BadgeBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { children, href, variant = 'default' }: BadgeProps<NoInfer<Msg>, R>,
) => {
  const attrs = { 'data-slot': 'badge', 'data-variant': variant }
  return href === undefined
    ? h.span.attrs(attrs).children(children)
    : h.a.attrs({ ...attrs, href }).children(children)
}
