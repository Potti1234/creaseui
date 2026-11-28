import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis'

export type PaginationRangeConfig = Readonly<{
  page: number
  totalPages: number
  siblingCount?: number
  boundaryCount?: number
}>

const whole = (value: number, fallback: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback

export const normalizePagination = (config: PaginationRangeConfig) => {
  const totalPages = Math.max(1, whole(config.totalPages, 1))
  return {
    page: Math.min(totalPages, Math.max(1, whole(config.page, 1))),
    totalPages,
    siblingCount: Math.min(totalPages, whole(config.siblingCount ?? 1, 1)),
    boundaryCount: Math.min(totalPages, whole(config.boundaryCount ?? 1, 1)),
  }
}

export const paginationItems = (
  config: PaginationRangeConfig,
): ReadonlyArray<PaginationItem> => {
  const { page, totalPages, siblingCount, boundaryCount } =
    normalizePagination(config)
  const pages = new Set<number>()
  for (let value = 1; value <= boundaryCount; value += 1) pages.add(value)
  for (
    let value = Math.max(1, totalPages - boundaryCount + 1);
    value <= totalPages;
    value += 1
  )
    pages.add(value)
  for (
    let value = Math.max(1, page - siblingCount);
    value <= Math.min(totalPages, page + siblingCount);
    value += 1
  )
    pages.add(value)

  const sorted = [...pages].sort((left, right) => left - right)
  const items: Array<PaginationItem> = []
  sorted.forEach((value, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && value - previous === 2)
      items.push(previous + 1)
    else if (previous !== undefined && value - previous > 2)
      items.push(previous < page ? 'start-ellipsis' : 'end-ellipsis')
    items.push(value)
  })
  return items
}

export type LinkNavigation = Readonly<{
  kind: 'link'
  href: (page: number) => string
}>

export type ActionNavigation<Msg> = Readonly<{
  kind: 'action'
  onNavigate: (page: number) => Msg
}>

export type PaginationRecipeProps<Msg> = PaginationRangeConfig &
  Readonly<{
    navigation: LinkNavigation | ActionNavigation<Msg>
    ariaLabel?: string
  }>

type Classes = Partial<Record<'root' | 'content' | 'link' | 'ellipsis', string>>

type Slot<Msg, R> = {
  readonly children?: View.Children<Msg, R>
  readonly className?: string
}

export type PaginationProps<Msg, R = never> = PaginationRecipeProps<Msg> & {
  readonly className?: string
  readonly previousLabel?: string
  readonly nextLabel?: string
  readonly pageLabel?: (page: number) => string
  readonly ellipsisLabel?: string
  readonly renderPage?: (page: number) => View.Input<Msg, R>
}

export const PaginationBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    ariaLabel = 'Pagination',
    className,
    previousLabel = 'Previous',
    nextLabel = 'Next',
    pageLabel = page => `Page ${page}`,
    ellipsisLabel = 'More pages',
    renderPage,
    navigation,
    ...config
  }: PaginationProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const { page, totalPages } = normalizePagination(config)
  const link = (
    target: number,
    label: string,
    children: View.Children<Msg, R>,
    relation?: 'prev' | 'next',
  ) => {
    const disabled = target < 1 || target > totalPages
    const attrs = {
      'data-slot': 'pagination-link',
      'aria-label': label,
      'aria-disabled': disabled ? 'true' : undefined,
      'aria-current':
        relation === undefined && target === page ? 'page' : undefined,
      'data-direction': relation,
    }
    if (navigation.kind === 'link') {
      return h.a
        .class(styles.link)
        .attrs({
          ...attrs,
          href: disabled ? undefined : navigation.href(target),
          rel: relation,
          tabindex: disabled ? '-1' : undefined,
        })
        .children(children)
    }
    return h.button
      .class(styles.link)
      .attrs({ ...attrs, type: 'button' })
      .disabled(disabled)
      .on('click', () => (disabled ? undefined : navigation.onNavigate(target)))
      .children(children)
  }
  return h.nav
    .class(styles.root, className)
    .attrs({
      'data-slot': 'pagination',
      'aria-label': ariaLabel,
    })
    .children(
      h.ul
        .class(styles.content)
        .attrs({ 'data-slot': 'pagination-content', role: 'list' })
        .children(
          PaginationItemBehavior(h, {
            children: [link(page - 1, previousLabel, [previousLabel], 'prev')],
          }),
          paginationItems(config).map(item =>
            PaginationItemBehavior(h, {
              key: String(item),
              children: [
                typeof item === 'number'
                  ? link(item, pageLabel(item), [
                      h.span.children(renderPage?.(item) ?? String(item)),
                    ])
                  : h.span
                      .class(styles.ellipsis)
                      .attrs({
                        'data-slot': 'pagination-ellipsis',
                        'aria-label': ellipsisLabel,
                        role: 'img',
                      })
                      .children('…'),
              ],
            }),
          ),
          PaginationItemBehavior(h, {
            children: [link(page + 1, nextLabel, [nextLabel], 'next')],
          }),
        ),
    )
}

export const PaginationItemBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    children,
    className,
    key,
  }: Slot<NoInfer<Msg>, R> & { readonly key?: string },
) =>
  (key === undefined ? h.li : h.li.key(key))
    .class(className)
    .attr('data-slot', 'pagination-item')
    .children(children)
