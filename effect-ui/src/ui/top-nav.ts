import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  TopNavBehavior,
  nextTopNavMenu,
  type TopNavEntry,
  type TopNavAction,
} from '../behaviors/top-nav'
import { IconBehavior } from '../behaviors/icon'
import { DropdownMenu, type MenuAppearance } from './dropdown-menu'
import { Popover } from './popover'

export type TopNavProps<Msg, R = never> = {
  readonly key?: string
  readonly label: string
  readonly direction?: 'ltr' | 'rtl'
  readonly className?: string
  readonly openMenu: string | null
  readonly onOpenChange: (menu: string | null) => Msg | undefined
  readonly heading?: {
    readonly text?: string
    readonly href?: string
    readonly overline?: string
    readonly overlineHref?: string
    readonly subtitle?: string
    readonly subtitleHref?: string
    readonly logo?: View.Input<Msg, R>
    readonly logoLabel?: string
    readonly endContent?: View.Input<Msg, R>
  }
  readonly startItems?: readonly TopNavEntry<Msg, R>[]
  readonly centerItems?: readonly TopNavEntry<Msg, R>[]
  readonly startContent?: View.Input<Msg, R>
  readonly centerContent?: View.Input<Msg, R>
  readonly endContent?: View.Input<Msg, R>
}

const tailwind = {
  root: 'relative grid w-full min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2 p-2 text-foreground max-sm:flex max-sm:flex-wrap',
  start: 'flex min-w-0 items-center gap-4 max-sm:contents',
  center:
    'flex min-w-0 items-center justify-center gap-2 max-sm:order-2 max-sm:w-full max-sm:flex-wrap',
  end: 'ms-auto flex shrink-0 items-center justify-end gap-2',
  brand: 'flex shrink-0 items-center gap-2',
  headings: 'grid min-w-0 text-start',
  heading:
    'text-base leading-tight font-semibold text-foreground no-underline hover:underline',
  subtitle: 'text-xs text-muted-foreground no-underline hover:underline',
  list: 'm-0 flex list-none flex-wrap items-center gap-1 p-0 max-sm:order-1',
  link: 'inline-flex min-h-8 items-center gap-1 rounded-md border-0 bg-transparent px-3 text-start text-sm font-medium text-muted-foreground no-underline outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:bg-accent data-active:text-foreground aria-expanded:bg-accent aria-disabled:opacity-50 disabled:opacity-50',
  mega: 'grid min-w-[min(21rem,calc(100vw-4rem))] gap-3',
  megaItem:
    'flex items-start gap-2 rounded-md border-0 bg-transparent p-2 text-start text-sm text-foreground no-underline hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-disabled:opacity-50 disabled:opacity-50',
  megaText: 'grid gap-0.5',
  featured: 'grid min-w-0 gap-2 rounded-md bg-muted p-3 text-sm',
  image: 'aspect-video w-full rounded-sm object-cover',
}

export const TopNav = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    key,
    label,
    direction,
    className,
    openMenu,
    onOpenChange,
    heading,
    startItems = [],
    centerItems = [],
    startContent,
    centerContent,
    endContent,
  }: TopNavProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
  renderDropdown: typeof DropdownMenu = DropdownMenu,
  renderPopover: typeof Popover = Popover,
) =>
  TopNavBehavior(h, {
    key: key ?? label,
    view: nav => {
      const text = (
        label: string | undefined,
        href: string | undefined,
        className: string,
      ) =>
        label === undefined
          ? undefined
          : href === undefined
            ? h.span.class(className).children(label)
            : h.a.class(className).attr('href', href).children(label)
      const menuButton = (entry: {
        readonly key: string
        readonly label: string
        readonly disabled?: boolean
      }) =>
        h.button
          .class(styles.link)
          .attrs({
            'data-slot': 'top-nav-trigger',
            id: `${key ?? label}-${entry.key}`.replaceAll(/\s+/g, '-'),
          })
          .disabled(entry.disabled === true)
          .children(
            entry.label,
            IconBehavior(h, { name: 'chevron-down', size: '2xs' }),
          )
      const open = (entry: string) =>
        onOpenChange(nextTopNavMenu(openMenu, entry, true))
      const close = (entry: string) =>
        openMenu === entry ? onOpenChange(null) : undefined
      const megaItem = (item: TopNavAction<Msg, R>) => {
        const content = [
          item.icon,
          h.span
            .class(styles.megaText)
            .children(
              h.strong.children(item.label),
              item.description === undefined
                ? undefined
                : h.span.class(styles.subtitle).children(item.description),
            ),
        ] as const
        return item.href !== undefined
          ? h.a
              .key(item.key)
              .class(styles.megaItem)
              .attrs({
                href: item.disabled ? undefined : item.href,
                'aria-disabled': item.disabled ? 'true' : undefined,
              })
              .on('click', () => (item.disabled ? undefined : item.onSelect))
              .children(...content)
          : h.button
              .key(item.key)
              .class(styles.megaItem)
              .attrs({ type: 'button' })
              .disabled(item.disabled === true)
              .on('click', () => item.onSelect ?? close(openMenu ?? ''))
              .children(...content)
      }
      const renderEntry = (entry: TopNavEntry<Msg, R>) => {
        if ('items' in entry) {
          if (entry.kind === 'mega-menu') {
            const featured = entry.featured
            return renderPopover(h, {
              key: entry.key,
              props: {
                open: openMenu === entry.key,
                align: 'start',
                sideOffset: 6,
                modal: false,
              },
              trigger: menuButton(entry),
              triggerOptions: { disabled: entry.disabled === true },
              ariaLabel: entry.label,
              onEmit: {
                RequestedOpen: () => open(entry.key),
                RequestedClose: () => close(entry.key),
                Settled: () => undefined,
              },
              content: h.div
                .class(styles.mega)
                .attr('data-slot', 'top-nav-mega-menu')
                .children(
                  entry.items.map(megaItem),
                  featured === undefined
                    ? undefined
                    : h.div
                        .class(styles.featured)
                        .children(
                          featured.image === undefined
                            ? undefined
                            : h.img
                                .class(styles.image)
                                .attrs({
                                  src: featured.image,
                                  alt: featured.imageAlt ?? '',
                                  loading: 'lazy',
                                }),
                          h.strong.children(featured.title),
                          featured.description,
                          text(
                            featured.linkLabel,
                            featured.href,
                            styles.heading,
                          ),
                          featured.content,
                        ),
                ),
            })
          }
          return renderDropdown(h, {
            key: entry.key,
            props: {
              open: openMenu === entry.key,
              disabled: entry.disabled === true,
              items: entry.items.map(item => ({
                value: item.key,
                label: item.label,
                disabled: item.disabled === true,
              })),
            },
            trigger: menuButton(entry),
            label: entry.label,
            onEmit: {
              RequestedOpen: () => open(entry.key),
              RequestedClose: () => close(entry.key),
              Picked: ({ value }) =>
                entry.items.find(item => item.key === value)?.onSelect,
              Highlighted: () => undefined,
              RequestedQuery: () => undefined,
              Settled: () => undefined,
            },
            decorateItem: ({ value }): MenuAppearance<Msg, R> => {
              const item = entry.items.find(item => item.key === value)
              if (item === undefined) return {}
              const visual = {
                label: h.span
                  .class(styles.megaText)
                  .children(
                    item.label,
                    item.description === undefined
                      ? undefined
                      : h.span
                          .class(styles.subtitle)
                          .children(item.description),
                  ),
                ...(item.icon === undefined ? {} : { icon: item.icon }),
              }
              return item.href === undefined
                ? visual
                : { ...visual, kind: 'link', href: item.href }
            },
          })
        }
        const attrs = {
          'data-slot': 'top-nav-item',
          'aria-label': entry.iconOnly ? entry.label : undefined,
        }
        const content = [
          entry.icon,
          entry.iconOnly ? undefined : entry.label,
        ] as const
        return entry.href !== undefined
          ? nav
              .link({
                element: h.a
                  .class(styles.link)
                  .attrs({
                    ...attrs,
                    href: entry.disabled ? undefined : entry.href,
                    'aria-disabled': entry.disabled ? 'true' : undefined,
                  })
                  .on('click', () =>
                    entry.disabled ? undefined : entry.onSelect,
                  ),
                active: entry.active === true && !entry.disabled,
              })
              .children(...content)
          : h.button
              .class(styles.link)
              .attrs({
                ...attrs,
                type: 'button',
                'aria-pressed':
                  entry.active === undefined ? undefined : String(entry.active),
              })
              .disabled(entry.disabled === true)
              .on('click', () => entry.onSelect)
              .children(...content)
      }
      const list = (entries: readonly TopNavEntry<Msg, R>[]) =>
        entries.length === 0
          ? undefined
          : nav
              .list(h.ul.class(styles.list))
              .children(
                entries.map(entry =>
                  nav.item(h.li.key(entry.key)).children(renderEntry(entry)),
                ),
              )
      return nav
        .root(
          h.nav
            .class(styles.root, className)
            .attrs({
              'data-slot': 'top-nav',
              'aria-label': label,
              dir: direction,
            }),
        )
        .children(
          h.div.class(styles.start).children(
            heading === undefined
              ? undefined
              : h.div
                  .class(styles.brand)
                  .attr('data-slot', 'top-nav-heading')
                  .children(
                    heading.logo === undefined
                      ? undefined
                      : h.span
                          .attr('aria-label', heading.logoLabel)
                          .children(heading.logo),
                    h.div
                      .class(styles.headings)
                      .children(
                        text(
                          heading.overline,
                          heading.overlineHref,
                          styles.subtitle,
                        ),
                        text(heading.text, heading.href, styles.heading),
                        text(
                          heading.subtitle,
                          heading.subtitleHref,
                          styles.subtitle,
                        ),
                      ),
                    heading.endContent,
                  ),
            list(startItems),
            startContent,
          ),
          h.div.class(styles.center).children(list(centerItems), centerContent),
          h.div.class(styles.end).children(endContent),
        )
    },
  })
