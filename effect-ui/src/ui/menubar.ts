import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { DropdownMenuBehavior, type MenuItem } from '../behaviors/dropdown-menu'
import {
  MenubarBehavior,
  nextOpenMenu,
  type MenubarProps as KitProps,
} from '../behaviors/menubar'
import { MenuPopup, type MenuAppearance, menuStyles } from './dropdown-menu'

export type MenubarProps<Msg, R = never> = {
  readonly props?: KitProps
  readonly key?: string
  readonly label?: string
  readonly className?: string
  readonly direction?: 'ltr' | 'rtl'
  readonly openMenu: string | null
  readonly onOpenChange: (menu: string | null) => Msg | undefined
  readonly onPick?: (value: string, menu: string) => Msg | undefined
  readonly menus: readonly {
    readonly id: string
    readonly label: View.Input<Msg, R>
    readonly accessibleLabel?: string
    readonly disabled?: boolean
    readonly items: readonly MenuItem[]
    readonly decorateItem?: (item: MenuItem) => MenuAppearance<Msg, R>
    readonly groupLabel?: (group: string) => string
  }[]
}

const tailwind = {
  root: 'flex w-fit items-center gap-0.5 rounded-md border bg-background p-1 text-sm data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
  trigger:
    'inline-flex items-center gap-2 rounded-sm border-0 bg-transparent px-2 py-1 font-medium outline-none select-none data-popup-open:bg-accent focus-visible:bg-accent aria-disabled:opacity-50',
}

export const Menubar = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    key,
    label,
    className,
    direction,
    menus,
    openMenu,
    onOpenChange,
    onPick,
  }: MenubarProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
  popupStyles: typeof menuStyles = menuStyles,
) =>
  MenubarBehavior(h, {
    props: props ?? {},
    key,
    view: bar =>
      bar
        .root(
          h.div.class(styles.root, className).attrs({
            'data-slot': 'menubar',
            'aria-label': label,
            dir: direction,
          }),
        )
        .children(
          menus.map(
            ({
              id,
              label,
              accessibleLabel,
              disabled,
              items,
              decorateItem,
              groupLabel,
            }) =>
              DropdownMenuBehavior(h, {
                key: id,
                props: {
                  open: openMenu === id,
                  items,
                  disabled: disabled === true,
                },
                onEmit: {
                  RequestedOpen: () =>
                    onOpenChange(nextOpenMenu(openMenu, id, true)),
                  RequestedClose: () =>
                    openMenu === id
                      ? onOpenChange(nextOpenMenu(openMenu, id, false))
                      : undefined,
                  Picked: ({ value }) => onPick?.(value, id),
                  Highlighted: () => undefined,
                  RequestedQuery: () => undefined,
                  Settled: () => undefined,
                },
                view: menu =>
                  h.div
                    .key(id)
                    .attr('data-slot', 'menubar-menu')
                    .children(
                      menu
                        .trigger({
                          element: h.button.class(styles.trigger).attrs({
                            'data-slot': 'menubar-trigger',
                            'aria-label': accessibleLabel,
                          }),
                        })
                        .children(label),
                      MenuPopup(
                        h,
                        menu,
                        items,
                        {
                          ...(accessibleLabel === undefined
                            ? {}
                            : { label: accessibleLabel }),
                          ...(decorateItem === undefined
                            ? {}
                            : { decorateItem }),
                          ...(groupLabel === undefined ? {} : { groupLabel }),
                        },
                        popupStyles,
                      ),
                    ),
              }),
          ),
        ),
  })
