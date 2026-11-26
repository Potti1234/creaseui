import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { IconBehavior } from '../behaviors/icon'
import { SidebarBehavior } from '../behaviors/sidebar'

type Options<Msg> = Parameters<typeof SidebarBehavior<Msg>>[1]
type Slot<Msg, R> = {
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}
type Side = 'left' | 'right'
const tailwind = {
  root: 'flex w-full min-w-0 items-stretch gap-2 data-[side=right]:flex-row-reverse data-[variant=inset]:bg-sidebar',
  panel:
    'relative flex min-w-0 shrink-0 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground [width:var(--sidebar-width)] data-icon-only:[width:var(--sidebar-icon-width)] data-[side=left]:border-e data-[side=right]:border-s data-[variant=floating]:m-2 data-[variant=floating]:rounded-lg data-[variant=floating]:border data-[variant=inset]:m-2 data-[variant=inset]:rounded-lg data-[presentation=application]:min-h-svh',
  inset:
    'relative flex min-w-0 flex-1 flex-col gap-2 p-2 data-[variant=inset]:my-2 data-[variant=inset]:rounded-lg data-[variant=inset]:bg-background',
  header: 'flex min-w-0 flex-col gap-2 p-2',
  footer: 'mt-auto flex min-w-0 flex-col gap-2 p-2',
  content: 'flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-auto p-2',
  group: 'grid min-w-0 gap-1',
  groupLabel:
    'truncate px-2 py-1 text-xs font-medium text-sidebar-foreground/70 data-icon-only:sr-only',
  menu: 'm-0 grid min-w-0 list-none gap-0.5 p-0',
  menuItem: 'relative min-w-0',
  menuButton:
    'flex min-h-8 w-full min-w-0 items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1 text-start text-sm text-inherit no-underline outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-active:bg-sidebar-accent data-active:font-medium data-[variant=outline]:ring-1 data-[variant=outline]:ring-sidebar-border data-[variant=primary]:bg-primary data-[variant=primary]:text-primary-foreground data-[size=sm]:min-h-7 data-[size=lg]:min-h-10 data-icon-only:justify-center aria-disabled:opacity-50 disabled:opacity-50',
  menuText: 'min-w-0 truncate data-icon-only:sr-only',
  menuIcon: 'inline-grid size-4 shrink-0 place-items-center',
  menuBadge: 'ms-auto shrink-0 px-1 text-xs tabular-nums data-icon-only:hidden',
  menuAction:
    'inline-grid size-7 shrink-0 place-items-center rounded-md border-0 bg-transparent text-inherit hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring data-icon-only:hidden',
  menuSub:
    'ms-3 grid min-w-0 list-none gap-0.5 border-s border-sidebar-border ps-2 data-icon-only:hidden',
  separator: 'my-1 h-px bg-sidebar-border',
  input:
    'h-8 min-w-0 rounded-md border border-sidebar-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring data-icon-only:hidden',
  skeleton: 'h-3 rounded-sm bg-sidebar-accent motion-safe:animate-pulse',
  toggle:
    'inline-grid size-8 place-items-center self-start rounded-md border-0 bg-transparent text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
  rail: 'absolute inset-y-0 z-10 w-2 border-0 bg-transparent p-0 hover:bg-sidebar-border data-[side=left]:-end-1 data-[side=right]:-start-1 data-[side=left]:cursor-w-resize data-[side=right]:cursor-e-resize',
  backdrop: 'fixed inset-0 bg-black/50 data-ending-style:invisible',
  viewport: 'fixed inset-0 flex data-[side=right]:justify-end',
  drawer:
    'relative flex h-full min-h-0 w-full min-w-0 max-w-(--sidebar-mobile-width) flex-col gap-2 overflow-hidden border bg-sidebar p-2 text-sidebar-foreground shadow-lg outline-none transition-transform duration-300 data-ending-style:invisible motion-reduce:transition-none',
  drawerHeader: 'flex items-center justify-between gap-2 px-2',
  drawerTitle: 'm-0 text-base font-semibold',
}
type Classes = typeof tailwind

const slots = <Msg>(h: Html.H<Msg>, styles: Classes, iconOnly: boolean) => {
  const marker = iconOnly ? '' : undefined
  const slot =
    (
      name:
        | 'header'
        | 'footer'
        | 'content'
        | 'group'
        | 'groupLabel'
        | 'menuBadge',
    ) =>
    <R = never>({ className, children }: Slot<NoInfer<Msg>, R>) =>
      h.div
        .class(styles[name], className)
        .attrs({ 'data-slot': `sidebar-${name}`, 'data-icon-only': marker })
        .children(children)
  return {
    header: slot('header'),
    footer: slot('footer'),
    content: slot('content'),
    group: slot('group'),
    groupLabel: slot('groupLabel'),
    badge: slot('menuBadge'),
    separator: () =>
      h.div
        .class(styles.separator)
        .attrs({ 'data-slot': 'sidebar-separator', 'aria-hidden': 'true' }),
    menu: <R = never>({ children, className }: Slot<NoInfer<Msg>, R>) =>
      h.ul
        .class(styles.menu, className)
        .attrs({ 'data-slot': 'sidebar-menu', role: 'list' })
        .children(children),
    item: <R = never>({
      children,
      className,
      key,
    }: Slot<NoInfer<Msg>, R> & { readonly key?: string }) =>
      (key === undefined ? h.li : h.li.key(key))
        .class(styles.menuItem, className)
        .attr('data-slot', 'sidebar-menu-item')
        .children(children),
    subMenu: <R = never>({ children, className }: Slot<NoInfer<Msg>, R>) =>
      h.ul
        .class(styles.menuSub, className)
        .attrs({ 'data-slot': 'sidebar-menu-sub', 'data-icon-only': marker })
        .children(children),
    link: <R = never>({
      label,
      href,
      onSelect,
      icon,
      active,
      disabled,
      expanded,
      badge,
      variant = 'default',
      size = 'default',
      className,
    }: {
      readonly label: string
      readonly href?: string
      readonly onSelect?: NoInfer<Msg>
      readonly icon?: View.Input<NoInfer<Msg>, R>
      readonly badge?: View.Input<NoInfer<Msg>, R>
      readonly active?: boolean
      readonly disabled?: boolean
      readonly expanded?: boolean
      readonly variant?: 'default' | 'outline' | 'primary'
      readonly size?: 'sm' | 'default' | 'lg'
      readonly className?: string
    }) => {
      const attributes = {
        'data-slot': 'sidebar-menu-button',
        'data-active': active ? '' : undefined,
        'data-icon-only': marker,
        'data-variant': variant,
        'data-size': size,
        'aria-disabled': disabled ? 'true' : undefined,
        'aria-expanded': expanded === undefined ? undefined : String(expanded),
        'aria-label': iconOnly ? label : undefined,
        title: iconOnly ? label : undefined,
      }
      const content = [
        icon === undefined
          ? iconOnly
            ? h.span
                .class(styles.menuIcon)
                .attr('aria-hidden', 'true')
                .children(label.slice(0, 1))
            : undefined
          : h.span
              .class(styles.menuIcon)
              .attr('aria-hidden', 'true')
              .children(icon),
        h.span
          .class(styles.menuText)
          .attr('data-icon-only', marker)
          .children(label),
        badge === undefined
          ? undefined
          : h.span
              .class(styles.menuBadge)
              .attr('data-icon-only', marker)
              .children(badge),
      ]
      return href === undefined
        ? h.button
            .class(styles.menuButton, className)
            .attrs({
              ...attributes,
              type: 'button',
              'aria-pressed': active === undefined ? undefined : String(active),
            })
            .disabled(disabled === true)
            .on('click', () => onSelect)
            .children(content)
        : h.a
            .class(styles.menuButton, className)
            .attrs({
              ...attributes,
              href: disabled ? undefined : href,
              'aria-current': active ? 'page' : undefined,
              tabindex: disabled ? '-1' : undefined,
            })
            .on('click', () => (disabled ? undefined : onSelect))
            .children(content)
    },
    action: <R = never>({
      label,
      onSelect,
      children,
    }: Slot<NoInfer<Msg>, R> & {
      readonly label: string
      readonly onSelect: NoInfer<Msg>
    }) =>
      h.button
        .class(styles.menuAction)
        .attrs({
          type: 'button',
          'aria-label': label,
          'data-icon-only': marker,
          'data-slot': 'sidebar-menu-action',
        })
        .on('click', onSelect)
        .children(children),
    input: <R = never>(
      element: Html.VoidElement<
        NoInfer<Msg>,
        R,
        Html.EventsOf<'input'>,
        HTMLInputElement,
        'input'
      >,
    ) =>
      element
        .class(styles.input, element.elementAttrs.class)
        .attrs({ 'data-icon-only': marker, 'data-slot': 'sidebar-input' }),
    skeleton: (width = '68%') =>
      h.div.class(styles.skeleton).attr('aria-hidden', 'true').style({ width }),
  }
}

export type SidebarProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly label?: string
  readonly triggerLabel?: string
  readonly closeLabel?: string
  readonly variant?: 'sidebar' | 'floating' | 'inset'
  readonly collapsible?: 'offcanvas' | 'icon' | 'none'
  readonly presentation?: 'application' | 'contained'
  readonly width?: string
  readonly mobileWidth?: string
  readonly iconWidth?: string
  readonly rail?: boolean
  readonly className?: string
  readonly navigation: (
    sidebar: ReturnType<typeof slots<Msg>>,
  ) => View.Input<Msg, R>
  readonly children: View.Children<Msg, R>
}

export const Sidebar = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    label = 'Navigation',
    triggerLabel = 'Toggle sidebar',
    closeLabel = 'Close sidebar',
    variant = 'sidebar',
    collapsible = 'offcanvas',
    presentation = 'application',
    width = '16rem',
    mobileWidth = '18rem',
    iconWidth = '3rem',
    rail,
    navigation,
    children,
    className,
    ...options
  }: SidebarProps<NoInfer<Msg>, R>,
  styles: Classes = tailwind,
) =>
  SidebarBehavior(h, {
    ...options,
    props,
    key: options.key ?? props.id,
    view: sidebar => {
      const { id, side = 'left' } = props
      const iconOnly =
        !sidebar.mobile && !sidebar.open && collapsible === 'icon'
      const toggleElement = h.button.class(styles.toggle).attrs({
        'data-slot': 'sidebar-trigger',
        'aria-label': triggerLabel,
      })
      const toggle = (
        sidebar.mobile
          ? sidebar.drawer.trigger(toggleElement)
          : sidebar.toggle(toggleElement)
      ).children(IconBehavior(h, { name: 'panel-left', size: 'sm' }))
      const body = navigation(slots(h, styles, iconOnly))
      const variables = {
        '--sidebar-width': width,
        '--sidebar-mobile-width': mobileWidth,
        '--sidebar-icon-width': iconWidth,
      }
      return sidebar
        .root(
          h.div
            .class(styles.root, className)
            .attrs({
              'data-slot': 'sidebar-wrapper',
              'data-side': side,
              'data-variant': variant,
              'data-state': sidebar.open ? 'expanded' : 'collapsed',
            })
            .style(variables),
        )
        .children(
          sidebar.mobile || (!sidebar.open && collapsible === 'offcanvas')
            ? undefined
            : h.aside
                .class(styles.panel)
                .attrs({
                  id: `${id}-panel`,
                  'aria-label': label,
                  'data-slot': 'sidebar',
                  'data-side': side,
                  'data-variant': variant,
                  'data-icon-only': iconOnly ? '' : undefined,
                  'data-presentation': presentation,
                })
                .children(
                  body,
                  rail
                    ? sidebar.toggle(
                        h.button.class(styles.rail).attrs({
                          'data-slot': 'sidebar-rail',
                          'data-side': side,
                          'aria-label': triggerLabel,
                          tabindex: '-1',
                        }),
                      )
                    : undefined,
                ),
          h.div
            .class(styles.inset)
            .attrs({ 'data-slot': 'sidebar-inset', 'data-variant': variant })
            .children(
              collapsible === 'none' && !sidebar.mobile ? undefined : toggle,
              children,
            ),
          sidebar.mobile
            ? sidebar.drawer
                .portal(h.dialog.attr('data-slot', 'sidebar-mobile'))
                ?.children(
                  sidebar.drawer.backdrop(h.div.class(styles.backdrop)),
                  sidebar.drawer
                    .viewport(
                      h.div.class(styles.viewport).attr('data-side', side),
                    )
                    .children(
                      sidebar.drawer
                        .popup(
                          h.div
                            .class(styles.drawer)
                            .attrs({
                              id: `${id}-panel`,
                              'data-slot': 'sidebar-mobile-panel',
                            })
                            .style(variables),
                        )
                        .children(
                          h.div
                            .class(styles.drawerHeader)
                            .children(
                              sidebar.drawer
                                .title(h.h2.class(styles.drawerTitle))
                                .children(label),
                              sidebar.drawer
                                .close(
                                  h.button
                                    .class(styles.toggle)
                                    .attr('aria-label', closeLabel),
                                )
                                .children(
                                  IconBehavior(h, { name: 'x', size: 'sm' }),
                                ),
                            ),
                          sidebar.drawer
                            .content(h.div.class(styles.content))
                            .children(body),
                        ),
                    ),
                )
            : undefined,
        )
    },
  })
