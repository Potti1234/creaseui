import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { Icon } from './icon'
import {
  DropdownMenuBehavior,
  type MenuItem,
  type MenuParts,
} from '../behaviors/dropdown-menu'

type Options<Msg> = Parameters<typeof DropdownMenuBehavior<Msg>>[1]
type Parts = Pick<
  MenuParts,
  | 'backdrop'
  | 'positioner'
  | 'popup'
  | 'item'
  | 'linkItem'
  | 'checkboxItem'
  | 'checkboxItemIndicator'
  | 'radioGroup'
  | 'radioItem'
  | 'radioItemIndicator'
  | 'group'
  | 'groupLabel'
  | 'separator'
>

export type MenuAppearance<Msg, R = never> = {
  readonly group?: string
  readonly label?: View.Input<Msg, R>
  readonly icon?: View.Input<Msg, R>
  readonly shortcut?: string
  readonly keys?: string
  readonly tone?: 'default' | 'destructive'
  readonly inset?: boolean
  readonly separatorBefore?: boolean
  readonly closeOnClick?: boolean
} & (
  | { readonly kind?: 'item' }
  | { readonly kind: 'link'; readonly href: string }
  | { readonly kind: 'checkbox'; readonly checked: boolean }
  | { readonly kind: 'radio'; readonly selectedValue: string | null }
  | {
      readonly kind: 'submenu'
      readonly render: (
        item: MenuItem,
        parent: Pick<MenuParts, 'item'>,
      ) => View.Content<Msg, R>
    }
)

export type MenuUiOptions<Msg, R = never> = {
  readonly label?: string
  readonly className?: string
  readonly direction?: 'ltr' | 'rtl'
  readonly decorateItem?: (item: MenuItem) => MenuAppearance<Msg, R>
  readonly groupLabel?: (group: string) => string
}

export const menuStyles = {
  contextTrigger:
    'relative flex min-h-24 items-center justify-center rounded-md border border-dashed p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
  backdrop: 'fixed inset-0 bg-transparent',
  positioner:
    'z-50 m-0 overflow-visible border-0 bg-transparent p-0 outline-none',
  popup:
    'max-h-(--available-height) min-w-32 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none',
  item: "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:ps-8 data-[tone=destructive]:text-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  group: '',
  groupLabel: 'px-2 py-1.5 text-sm font-medium',
  separator: '-mx-1 my-1 h-px bg-border',
  indicator: 'absolute left-2 flex size-3.5 items-center justify-center',
  shortcut: 'ml-auto text-xs tracking-widest text-muted-foreground',
}

export const MenuPopup = <Msg, R = never>(
  h: Html.H<Msg>,
  parts: Parts,
  items: readonly MenuItem[],
  {
    label,
    className,
    decorateItem,
    groupLabel,
  }: MenuUiOptions<NoInfer<Msg>, R>,
  styles: typeof menuStyles,
  omitBackdrop = false,
) => {
  const decorated = items.map(item => ({
    item,
    visual: decorateItem?.(item) ?? {},
  }))
  const renderItem = ({ item, visual }: (typeof decorated)[number]) => {
    const { value, label } = item
    const attrs = {
      'data-slot': 'menu-item',
      'data-tone': visual.tone,
      'data-inset': visual.inset ? '' : undefined,
      'aria-keyshortcuts': visual.keys,
    }
    const content = [
      visual.icon,
      h.span.class('flex-1').children(visual.label ?? label),
      visual.shortcut === undefined
        ? undefined
        : h.span
            .class(styles.shortcut)
            .attr('aria-hidden', 'true')
            .children(visual.shortcut),
    ]
    const marker = h.span.class(styles.indicator).attr('aria-hidden', 'true')
    if (visual.kind === 'submenu') return visual.render(item, parts)
    if (visual.kind === 'link') {
      return parts
        .linkItem({
          value,
          element: h.a
            .class(styles.item)
            .attrs({ ...attrs, href: visual.href }),
          closeOnClick: visual.closeOnClick,
        })
        .children(...content)
    }
    const element = h.div.class(styles.item).attrs(attrs)
    const config = { element, value, closeOnClick: visual.closeOnClick }
    if (visual.kind === 'checkbox') {
      return parts
        .checkboxItem({ ...config, checked: visual.checked })
        .children(
          parts
            .checkboxItemIndicator({
              element: marker,
              value,
              keepMounted: true,
            })
            ?.children(
              visual.checked
                ? Icon(h, { name: 'check', size: 'sm', className: 'size-4' })
                : '',
            ),
          ...content,
        )
    }
    if (visual.kind === 'radio') {
      return parts
        .radioItem(config)
        .children(
          parts
            .radioItemIndicator({ element: marker, value, keepMounted: true })
            ?.children(
              visual.selectedValue === value
                ? Icon(h, { name: 'check', size: 'sm', className: 'size-4' })
                : '',
            ),
          ...content,
        )
    }
    return parts.item(config).children(...content)
  }
  const renderItems = (values: typeof decorated) =>
    values.flatMap(entry => [
      entry.visual.separatorBefore
        ? parts.separator(
            h.div.class(styles.separator).attr('data-slot', 'menu-separator'),
          )
        : undefined,
      renderItem(entry),
    ])
  const groups: { group: string | undefined; entries: typeof decorated }[] = []
  for (const entry of decorated) {
    const group = entry.visual.group
    const current = groups.at(-1)
    if (current !== undefined && current.group === group)
      current.entries.push(entry)
    else groups.push({ group, entries: [entry] })
  }

  const renderGroup = (entries: typeof decorated) => {
    const radio = entries.find(entry => entry.visual.kind === 'radio')?.visual
    return radio?.kind === 'radio'
      ? parts
          .radioGroup({ element: h.div, value: radio.selectedValue })
          .children(renderItems(entries))
      : renderItems(entries)
  }

  return h.div.children(
    omitBackdrop ? undefined : parts.backdrop(h.div.class(styles.backdrop)),
    parts.positioner(h.div.class(styles.positioner)).children(
      parts
        .popup(
          h.div.class(styles.popup, className).attrs({
            'aria-label': label,
            'data-slot': 'menu-content',
          }),
        )
        .children(
          groups.flatMap(({ group, entries }, index) => {
            const separator =
              index === 0
                ? undefined
                : parts.separator(
                    h.div
                      .class(styles.separator)
                      .attr('data-slot', 'menu-separator'),
                  )
            if (group === undefined) {
              const output = renderGroup(entries)
              return [separator, ...(Array.isArray(output) ? output : [output])]
            }
            const key = `group:${index}:${group}`
            return [
              separator,
              parts
                .group({
                  group: key,
                  element: h.div.key(key).class(styles.group),
                })
                .children(
                  parts
                    .groupLabel({
                      group: key,
                      element: h.div.class(styles.groupLabel),
                    })
                    .children(groupLabel?.(group) ?? group),
                  renderGroup(entries),
                ),
            ]
          }),
        ),
    ),
  )
}

type MenuButton<Msg, R> = Html.Element<
  Msg,
  R,
  Html.EventsOf<'button'>,
  HTMLButtonElement,
  'button'
>
type SubmenuItem<Msg, R> = Html.Element<
  Msg,
  R,
  Html.EventsOf<'div'>,
  HTMLDivElement,
  'div'
>

export const DropdownMenu = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Omit<Options<Msg>, 'view' | 'fallback'> &
    MenuUiOptions<NoInfer<Msg>, R> &
    (
      | {
          readonly trigger: MenuButton<NoInfer<Msg>, R>
          readonly submenuTrigger?: never
          readonly parentMenu?: never
        }
      | {
          readonly trigger?: never
          readonly submenuTrigger: SubmenuItem<NoInfer<Msg>, R>
          readonly parentMenu: Pick<MenuParts, 'item'>
          readonly props: Options<Msg>['props'] & {
            readonly parentItem: string
          }
        }
    ),
  styles: typeof menuStyles = menuStyles,
) =>
  DropdownMenuBehavior(h, {
    ...options,
    view: menu =>
      h.div.attr('dir', options.direction).children(
        options.trigger !== undefined
          ? menu.trigger({ element: options.trigger })
          : options.parentMenu.item({
              value: options.props.parentItem,
              element: menu.submenuTrigger(
                options.submenuTrigger.class(
                  styles.item,
                  options.submenuTrigger.elementAttrs.class,
                ),
              ),
            }),
        MenuPopup(
          h,
          menu,
          options.props.items,
          options,
          styles,
          options.parentMenu !== undefined,
        ),
      ),
  })
