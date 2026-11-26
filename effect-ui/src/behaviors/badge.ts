import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type BadgeProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly href?: string
  readonly className?: string
  readonly variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'ghost'
    | 'link'
}

type BadgeElement<Msg, R> =
  | Html.Element<Msg, R, Html.EventsOf<'span'>, HTMLSpanElement, 'span'>
  | Html.Element<Msg, R, Html.EventsOf<'a'>, HTMLAnchorElement, 'a'>

export const BadgeBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    children,
    href,
    className,
    variant = 'default',
  }: BadgeProps<NoInfer<Msg>, R>,
): BadgeElement<Msg, R> => {
  const attrs = { 'data-slot': 'badge', 'data-variant': variant }
  return href === undefined
    ? h.span.class(className).attrs(attrs).children(children)
    : h.a
        .class(className)
        .attrs({ ...attrs, href })
        .children(children)
}
