import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { NavigationMenuBehavior } from '../behaviors/navigation-menu'
import { CollapsibleBehavior } from '../behaviors/collapsible'
import { linkTarget } from '../behaviors/link'

export type NavigationMenuLayout = 'inline' | 'scroll' | 'responsive'

type LinkItem<Msg, R> = {
  readonly key: string
  readonly label: View.Input<Msg, R>
  readonly href: string
  readonly active?: boolean
  readonly disabled?: boolean
  readonly target?: string
  readonly rel?: string
}
type Disclosure<Msg, R> = {
  readonly key: string
  readonly label: View.Input<Msg, R>
  readonly href?: never
  readonly children: View.Input<Msg, R>
  readonly defaultOpen?: boolean
  readonly disabled?: boolean
}

export type NavigationMenuProps<Msg, R = never> = {
  readonly key?: string
  readonly label: string
  readonly entries: readonly (LinkItem<Msg, R> | Disclosure<Msg, R>)[]
  readonly layout?: NavigationMenuLayout
  readonly orientation?: 'horizontal' | 'vertical'
  readonly direction?: 'ltr' | 'rtl'
  readonly className?: string
}

const tailwind = {
  root: 'relative min-w-0 max-w-full data-[layout=scroll]:overflow-x-auto data-[layout=responsive]:max-md:overflow-x-auto',
  list: 'm-0 flex list-none items-center gap-1 p-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[layout=scroll]:w-max data-[layout=responsive]:md:flex-wrap',
  item: 'shrink-0',
  link: 'inline-flex items-center gap-1 rounded-md border-0 bg-transparent px-3 py-2 text-start text-sm font-medium text-foreground no-underline outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-active:bg-accent aria-disabled:opacity-50 data-open:bg-accent',
  panel:
    'grid min-w-36 gap-2 rounded-md border bg-popover p-2 text-popover-foreground shadow-md hidden:hidden',
}

export const NavigationMenu = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    key,
    label,
    entries,
    layout = 'inline',
    orientation = 'horizontal',
    direction,
    className,
  }: NavigationMenuProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  NavigationMenuBehavior(h, {
    props: { orientation },
    key: key ?? label,
    view: menu =>
      menu
        .root(
          h.nav.class(styles.root, className).attrs({
            'data-slot': 'navigation-menu',
            'aria-label': label,
            dir: direction,
            'data-layout': layout,
          }),
        )
        .children(
          menu
            .list(
              h.ul.class(styles.list).attrs({
                'data-slot': 'navigation-menu-list',
                'data-orientation': orientation,
                'data-layout': layout,
              }),
            )
            .children(
              entries.map(item =>
                menu
                  .item(
                    h.li
                      .key(item.key)
                      .class(styles.item)
                      .attr('data-slot', 'navigation-menu-item'),
                  )
                  .children(
                    item.href !== undefined
                      ? menu
                          .link({
                            element: h.a.class(styles.link).attrs({
                              href: item.disabled ? undefined : item.href,
                              'aria-disabled': item.disabled
                                ? 'true'
                                : undefined,
                              'data-slot': 'navigation-menu-link',
                              ...linkTarget(item.target, item.rel),
                            }),
                            active: !item.disabled && item.active === true,
                          })
                          .children(item.label)
                      : CollapsibleBehavior(h, {
                          key: item.key,
                          props: {
                            defaultOpen: item.defaultOpen ?? false,
                            disabled: item.disabled === true,
                          },
                          view: disclosure =>
                            h.div
                              .attr('data-slot', 'navigation-menu-disclosure')
                              .children(
                                disclosure
                                  .trigger(
                                    h.button
                                      .class(styles.link)
                                      .attr(
                                        'data-slot',
                                        'navigation-menu-trigger',
                                      ),
                                  )
                                  .children(item.label),
                                disclosure
                                  .panel(
                                    h.div
                                      .class(styles.panel)
                                      .attr(
                                        'data-slot',
                                        'navigation-menu-content',
                                      ),
                                  )
                                  ?.children(item.children),
                              ),
                        }),
                  ),
              ),
            ),
        ),
  })
