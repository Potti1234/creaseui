import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type VisuallyHiddenProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly as?:
    | 'article'
    | 'aside'
    | 'code'
    | 'div'
    | 'em'
    | 'footer'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'header'
    | 'label'
    | 'li'
    | 'main'
    | 'nav'
    | 'p'
    | 'section'
    | 'small'
    | 'span'
    | 'strong'
    | 'ul'
    | 'ol'
  readonly ariaLive?: 'polite' | 'assertive' | 'off'
  readonly role?: string
  readonly id?: string
}

export const VisuallyHiddenBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    as = 'span',
    children,
    ariaLive,
    role,
    id,
  }: VisuallyHiddenProps<NoInfer<Msg>, R>,
  className?: string,
) =>
  h
    .el(as)
    .attrs({
      id,
      role,
      class: className,
      'aria-live': ariaLive,
      'data-slot': 'visually-hidden',
    })
    .children(children)
