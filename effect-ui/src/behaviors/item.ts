import type { View } from '@effect/ui'
import { Html } from '@effect/ui/html'

export type ItemSlot<Msg, R> = {
  readonly children?: View.Children<Msg, R>
  readonly className?: string
}

export type ItemProps<Msg, R = never> = Omit<ItemSlot<Msg, R>, 'children'> & {
  readonly key?: string
  readonly variant?: 'default' | 'outline' | 'muted'
  readonly size?: 'default' | 'sm' | 'xs'
  readonly element?: 'div' | 'li' | 'article' | 'a'
  readonly href?: string
  readonly target?: string
  readonly rel?: string
  readonly children?:
    | View.Children<Msg, R>
    | ((parts: ReturnType<typeof itemParts<Msg>>) => View.Children<Msg, R>)
}
type Classes = Partial<
  Record<
    | 'root'
    | 'media'
    | 'content'
    | 'title'
    | 'description'
    | 'actions'
    | 'header'
    | 'footer'
    | 'group'
    | 'listItem'
    | 'separator',
    string
  >
>

const itemParts = <Msg>(h: Html.H<Msg>, styles: Classes) => {
  const slot =
    (part: keyof Classes, name: string, tag: 'div' | 'p' = 'div') =>
    <R = never>({
      className,
      children,
    }: ItemSlot<NoInfer<Msg>, R>): View.Content<Msg, R> =>
      h
        .el(tag)
        .attrs({
          class: Html.classNames(styles[part], className),
          'data-slot': name,
        })
        .children(children)
  return {
    media: <R = never>({
      className,
      children,
      variant = 'default',
    }: ItemSlot<NoInfer<Msg>, R> & {
      readonly variant?: 'default' | 'icon' | 'image'
    }) =>
      h.div
        .class(styles.media, className)
        .attrs({ 'data-slot': 'item-media', 'data-variant': variant })
        .children(children),
    content: slot('content', 'item-content'),
    title: slot('title', 'item-title'),
    description: slot('description', 'item-description', 'p'),
    actions: slot('actions', 'item-actions'),
    header: slot('header', 'item-header'),
    footer: slot('footer', 'item-footer'),
  }
}
export const ItemBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    key,
    variant = 'default',
    size = 'default',
    element = 'div',
    href,
    target,
    rel,
    children,
    className,
  }: ItemProps<NoInfer<Msg>, R>,
  styles: Classes = {},
): View.Content<Msg, R> => {
  const builder = h.el(element)
  const root = key === undefined ? builder : builder.key(key)
  return root
    .attrs({
      class: Html.classNames(styles.root, className),
      'data-slot': 'item',
      'data-variant': variant,
      'data-size': size,
      'data-element': element,
      href: element === 'a' ? href : undefined,
      target: element === 'a' ? target : undefined,
      rel:
        element === 'a' && target === '_blank'
          ? [
              ...new Set([
                ...(rel?.split(/\s+/).filter(Boolean) ?? []),
                'noopener',
                'noreferrer',
              ]),
            ].join(' ')
          : rel,
    })
    .children(
      typeof children === 'function'
        ? children(itemParts(h, styles))
        : children,
    )
}

export type ItemGroupProps<Msg, R = never> = {
  readonly className?: string
  readonly label?: string
  readonly entries: readonly {
    readonly key: string
    readonly children: View.Children<Msg, R>
    readonly separatorBefore?: boolean
  }[]
}

export const ItemGroupBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { className, label, entries }: ItemGroupProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  h.div
    .class(styles.group, className)
    .attrs({ 'data-slot': 'item-group', role: 'list', 'aria-label': label })
    .children(
      entries.flatMap(({ key, children, separatorBefore }, index) => [
        separatorBefore && index > 0
          ? h.div
              .key(`${key}-separator`)
              .class(styles.separator)
              .attrs({
                'data-slot': 'item-separator',
                role: 'none',
                'aria-hidden': 'true',
              })
          : undefined,
        h.div
          .key(key)
          .class(styles.listItem)
          .attrs({ 'data-slot': 'item-listitem', role: 'listitem' })
          .children(children),
      ]),
    )
