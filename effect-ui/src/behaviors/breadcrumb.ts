import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type BreadcrumbTrailItem =
  | { readonly kind: 'link'; readonly label: string; readonly href: string }
  | { readonly kind: 'page'; readonly label: string }
  | { readonly kind: 'ellipsis'; readonly label?: string }

export const collapseBreadcrumbItems = (
  items: readonly BreadcrumbTrailItem[],
  maxItems = 4,
): readonly BreadcrumbTrailItem[] => {
  const limit = Math.max(
    3,
    Math.floor(Number.isFinite(maxItems) ? maxItems : 4),
  )
  const first = items[0]
  if (
    first === undefined ||
    items.length <= limit ||
    items.some(item => item.kind === 'ellipsis')
  )
    return items
  return [
    first,
    { kind: 'ellipsis', label: `${items.length - limit + 1} omitted levels` },
    ...items.slice(-(limit - 2)),
  ]
}

type Classes = Partial<
  Record<
    'root' | 'list' | 'item' | 'link' | 'page' | 'separator' | 'ellipsis',
    string
  >
>

export type BreadcrumbProps<Msg, R = never> = {
  readonly items: readonly BreadcrumbTrailItem[]
  readonly ariaLabel?: string
  readonly maxItems?: number
  readonly direction?: 'ltr' | 'rtl'
  readonly separator?: View.Input<Msg, R>
  readonly className?: string
}

export const BreadcrumbBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    items,
    ariaLabel = 'Breadcrumb',
    maxItems,
    direction,
    separator,
    className,
  }: BreadcrumbProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const trail = collapseBreadcrumbItems(items, maxItems)
  return h.nav
    .class(styles.root, className)
    .attrs({
      'aria-label': ariaLabel,
      dir: direction,
      'data-slot': 'breadcrumb',
    })
    .children(
      h.ol
        .class(styles.list)
        .attrs({ 'data-slot': 'breadcrumb-list', role: 'list' })
        .children(
          trail.flatMap((item, index) => [
            index === 0
              ? undefined
              : h.li
                  .class(styles.separator)
                  .attrs({
                    role: 'presentation',
                    'aria-hidden': 'true',
                    'data-slot': 'breadcrumb-separator',
                  })
                  .children(separator ?? (direction === 'rtl' ? '‹' : '›')),
            h.li
              .class(styles.item)
              .attr('data-slot', 'breadcrumb-item')
              .children(
                item.kind === 'link'
                  ? h.a
                      .class(styles.link)
                      .attrs({
                        href: item.href,
                        'data-slot': 'breadcrumb-link',
                      })
                      .children(item.label)
                  : item.kind === 'page'
                    ? h.span
                        .class(styles.page)
                        .attrs({
                          'aria-current': 'page',
                          'data-slot': 'breadcrumb-page',
                        })
                        .children(item.label)
                    : h.span
                        .class(styles.ellipsis)
                        .attrs({
                          'data-slot': 'breadcrumb-ellipsis',
                          role: 'img',
                          'aria-label': item.label ?? 'More levels',
                        })
                        .children('…'),
              ),
          ]),
        ),
    )
}
