import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type ListDensity = 'compact' | 'balanced' | 'spacious'
export type ListMarkerStyle = 'none' | 'disc' | 'decimal' | 'circle'
export type ListItem<Msg, R = never> = {
  readonly key: string
  readonly label: View.Input<Msg, R>
  readonly description?: View.Input<Msg, R>
  readonly startContent?: View.Input<Msg, R>
  readonly endContent?: View.Input<Msg, R>
  readonly disabled?: boolean
  readonly selected?: boolean
  readonly href?: string
  readonly target?: string
  readonly rel?: string
  readonly onClick?: Msg
  readonly className?: string
}
export type ListProps<Msg, R = never> = {
  readonly id: string
  readonly items: readonly ListItem<Msg, R>[]
  readonly header?: View.Input<Msg, R>
  readonly density?: ListDensity
  readonly listStyle?: ListMarkerStyle
  readonly edgeCompensation?: 'inline'
  readonly hasDividers?: boolean
  readonly start?: number
  readonly className?: string
}
type Classes = Partial<
  Record<
    | 'root'
    | 'header'
    | 'list'
    | 'item'
    | 'row'
    | 'control'
    | 'description'
    | 'side',
    string
  >
>

export const ListBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    items,
    header,
    density = 'balanced',
    listStyle = 'none',
    edgeCompensation,
    hasDividers,
    start = 1,
    className,
  }: ListProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const ordered = listStyle === 'decimal'
  const list = h.el(ordered ? 'ol' : 'ul')
  const headerId = header === undefined ? undefined : `${id}-header`
  const listStyleValue = h.span.style({
    listStyleType: listStyle,
    paddingInlineStart: listStyle === 'none' ? '0' : '1.5rem',
  }).elementAttrs.style
  return h.div.class(styles.root, className).children(
    header === undefined
      ? undefined
      : h.div.class(styles.header).attr('id', headerId).children(header),
    list
      .attrs({
        class: styles.list,
        style: listStyleValue,
        id,
        role: 'list',
        'aria-labelledby': headerId,
        'data-slot': 'list',
        'data-dividers': hasDividers ? '' : undefined,
        start: ordered ? String(start) : undefined,
      })
      .children(
        items.map(
          ({
            key,
            label,
            description,
            startContent,
            endContent,
            disabled,
            selected,
            href,
            target,
            rel,
            onClick,
            className: itemClass,
          }) => {
            const shared = { 'aria-disabled': disabled ? 'true' : undefined }
            const content = [
              h.span.attr('data-slot', 'list-item-label').children(label),
              description === undefined
                ? undefined
                : h.span
                    .class(styles.description)
                    .attr('data-slot', 'list-item-description')
                    .children(description),
            ]
            const control =
              href !== undefined
                ? h.a
                    .class(styles.control)
                    .attrs({
                      ...shared,
                      'data-slot': 'list-item-anchor',
                      href: disabled ? undefined : href,
                      target: disabled ? undefined : target,
                      tabindex: disabled ? '-1' : undefined,
                      rel:
                        target === '_blank'
                          ? [
                              ...new Set([
                                ...(rel?.split(/\s+/).filter(Boolean) ?? []),
                                'noopener',
                                'noreferrer',
                              ]),
                            ].join(' ')
                          : rel,
                    })
                    .children(content)
                : onClick === undefined
                  ? h.span
                      .class(styles.control)
                      .attr('data-slot', 'list-item-content')
                      .children(content)
                  : h.button
                      .class(styles.control)
                      .attrs({
                        ...shared,
                        'data-slot': 'list-item-button',
                        type: 'button',
                      })
                      .disabled(disabled === true)
                      .on('click', onClick)
                      .children(content)
            const side = (
              slot: string,
              child: View.Input<Msg, R> | undefined,
            ) =>
              child === undefined
                ? undefined
                : h.span
                    .class(styles.side)
                    .attr('data-slot', slot)
                    .children(child)
            return h.li
              .key(key)
              .class(styles.item, itemClass)
              .attrs({
                ...shared,
                'data-slot': 'list-item',
                'data-density': density,
                'data-dividers': hasDividers ? '' : undefined,
                'data-edge-compensation': edgeCompensation,
                'aria-current': selected ? 'true' : undefined,
              })
              .children(
                h.div
                  .class(styles.row)
                  .children(
                    side('list-item-start', startContent),
                    control,
                    side('list-item-end', endContent),
                  ),
              )
          },
        ),
      ),
  )
}
