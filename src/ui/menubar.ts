import { type Html, html } from 'foldkit/html'

import * as DropdownMenu from '@/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type MenubarMenu<Item extends string, Msg> = Readonly<{
  id: string
  label: string
  model: DropdownMenu.Model
  toParentMessage: (message: DropdownMenu.Message) => Msg
  items: ReadonlyArray<Item>
  itemToConfig: (item: Item) => DropdownMenu.DropdownMenuItemConfig
}>

export type MenubarProps<Item extends string, Msg> = Readonly<{
  menus: ReadonlyArray<MenubarMenu<Item, Msg>>
  ariaLabel?: string
  class?: string
}>

export const menubar = <Item extends string, Msg>(
  props: MenubarProps<Item, Msg>,
): Html => {
  const h = html<Msg>()
  return h.div(
    [
      h.Role('menubar'),
      h.DataAttribute('slot', 'menubar'),
      h.AriaLabel(props.ariaLabel ?? 'Application menu'),
      h.Class(cn('flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-xs', props.class)),
    ],
    props.menus.map(menu =>
      h.div(
        [h.DataAttribute('slot', 'menubar-menu')],
        [
          DropdownMenu.dropdownMenu<Item, Msg>({
            model: menu.model,
            toParentMessage: menu.toParentMessage,
            trigger: menu.label,
            triggerClass: 'rounded-sm px-2 py-1 text-sm font-medium outline-none hover:bg-accent focus-visible:bg-accent data-[state=open]:bg-accent',
            items: menu.items,
            itemToConfig: menu.itemToConfig,
            align: 'start',
            ariaLabel: menu.label,
          }),
        ],
      ),
    ),
  )
}
