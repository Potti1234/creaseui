import type { View } from '@effect/ui'
import { Html } from '@effect/ui/html'

type Slot<Msg, R> = {
  readonly className?: string
  readonly id?: string
  readonly children?: View.Children<Msg, R>
}
type Part =
  | 'root'
  | 'header'
  | 'title'
  | 'description'
  | 'action'
  | 'content'
  | 'footer'
type CardClasses = Partial<Record<Part, string>>

const cardClass = (part: string | undefined, user: string | undefined) =>
  Html.classNames(part, user)

export const CardParts = <Msg>(h: Html.H<Msg>, styles: CardClasses = {}) => {
  const part =
    (name: Exclude<Part, 'root' | 'title'>) =>
    <R = never>({ id, className, children }: Slot<NoInfer<Msg>, R>) =>
      h.div
        .class(styles[name], className)
        .attrs({ 'data-slot': `card-${name}`, id })
        .children(children)

  return {
    header: part('header'),
    title: <R = never>({
      as = 'h3',
      id,
      className,
      children,
    }: Slot<NoInfer<Msg>, R> & { readonly as?: 'h2' | 'h3' | 'h4' }) =>
      h
        .el(as)
        .attrs({
          class: cardClass(styles.title, className),
          'data-slot': 'card-title',
          id,
        })
        .children(children),
    description: part('description'),
    action: part('action'),
    content: part('content'),
    footer: part('footer'),
  }
}

export type CardProps<Msg, R = never> = Omit<Slot<Msg, R>, 'children'> & {
  readonly as?: 'div' | 'section' | 'article'
  readonly size?: 'default' | 'sm'
  readonly density?: 'default' | 'flush'
  readonly spacing?: string
  readonly children?:
    | View.Children<Msg, R>
    | ((parts: ReturnType<typeof CardParts<Msg>>) => View.Children<Msg, R>)
}

export const CardBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    as = 'div',
    id,
    className,
    size = 'default',
    density = 'default',
    spacing,
    children,
  }: CardProps<NoInfer<Msg>, R>,
  styles: CardClasses = {},
) => {
  const style = h.div.style({
    '--card-spacing': spacing ?? (size === 'sm' ? '1rem' : '1.5rem'),
    '--card-title-size': size === 'sm' ? '0.875rem' : undefined,
  }).elementAttrs.style
  return h
    .el(as)
    .attrs({
      class: cardClass(styles.root, className),
      'data-slot': 'card',
      'data-size': size,
      'data-density': density,
      id,
      style,
    })
    .children(
      typeof children === 'function'
        ? children(CardParts(h, styles))
        : children,
    )
}
