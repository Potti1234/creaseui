import { Option } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as DropdownMenu from '@/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type MenubarMenu<Item extends string, Msg> = Readonly<{
  id: string;
  label: string;
  model: DropdownMenu.Model;
  toParentMessage: (message: DropdownMenu.Message) => Msg;
  items: ReadonlyArray<Item>;
  itemToConfig: (item: Item) => DropdownMenu.DropdownMenuItemConfig<Item>;
}>;

export type MenubarProps<Item extends string, Msg> = Readonly<{
  menus: ReadonlyArray<MenubarMenu<Item, Msg>>;
  /** Coordinated focus/open callback used for ArrowLeft/ArrowRight menubar navigation. */
  onMove?: (index: number) => Msg;
  activeIndex?: number;
  ariaLabel?: string;
  class?: string;
}>;

export const menubar = <Item extends string, Msg>(
  props: MenubarProps<Item, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.Role('menubar'),
      h.DataAttribute('slot', 'menubar'),
      h.AriaLabel(props.ariaLabel ?? 'Application menu'),
      h.Class(
        cn(
          'flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-xs',
          props.class,
        ),
      ),
    ],
    props.menus.map((menu, index) =>
      h.div(
        [
          h.Role('none'),
          h.DataAttribute('slot', 'menubar-menu'),
          h.OnKeyDownPreventDefault((key) => {
            if (props.onMove === undefined || props.menus.length === 0)
              return Option.none();
            if (key !== 'ArrowLeft' && key !== 'ArrowRight')
              return Option.none();
            const delta = key === 'ArrowRight' ? 1 : -1;
            return Option.some(
              props.onMove(
                (index + delta + props.menus.length) % props.menus.length,
              ),
            );
          }),
        ],
        [
          DropdownMenu.dropdownMenu<Item, Msg>(
            {
              model: menu.model,
              toParentMessage: menu.toParentMessage,
              trigger: menu.label,
              triggerClass: cn(
                'rounded-sm px-2 py-1 text-sm font-medium outline-none hover:bg-accent focus-visible:bg-accent data-[state=open]:bg-accent',
                props.activeIndex === index ? 'bg-accent' : undefined,
              ),
              items: menu.items,
              itemToConfig: menu.itemToConfig,
              align: 'start',
              ariaLabel: menu.label,
            },
            h,
          ),
        ],
      ),
    ),
  );
};
