import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

const tags = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  blockquote: 'blockquote',
  'inline-code': 'code',
  lead: 'p',
  large: 'div',
  small: 'small',
  muted: 'p',
} as const

export type TypographyVariant = keyof typeof tags
export type TypographyProps<Msg, R = never> = {
  readonly variant?: TypographyVariant
  readonly className?: string
  readonly id?: string
  readonly children?: View.Children<Msg, R>
}

export const TypographyBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { variant = 'p', className, id, children }: TypographyProps<NoInfer<Msg>, R>,
) =>
  h
    .el(tags[variant])
    .attrs({ id, class: className, 'data-slot': `typography-${variant}` })
    .children(children)
