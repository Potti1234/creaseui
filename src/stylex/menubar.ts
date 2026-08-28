import { Option } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as DropdownMenu from './dropdown-menu';
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

const styles = stylex.create({
  root: {
    padding: '0.25rem',
    borderColor: tokens.border,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    gap: '0.25rem',
    alignItems: 'center',
    backgroundColor: tokens.background,
    boxShadow: tokens.shadowSm,
    display: 'flex',
    height: '2.25rem',
  },
  trigger: {
    borderRadius: tokens.controlRadius,
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
    backgroundColor: { default: tokens.transparent, ':hover': tokens.accent },
    fontSize: '0.875rem',
    fontWeight: 500,
  },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

export type MenubarMenu<Item extends string, Msg> = Readonly<{
  id: string;
  label: string;
  model: DropdownMenu.Model;
  toParentMessage: (message: DropdownMenu.Message) => Msg;
  items: ReadonlyArray<Item>;
  itemToConfig: (item: Item) => DropdownMenu.DropdownMenuItemConfig;
}>;

export type MenubarProps<Item extends string, Msg> = Readonly<{
  menus: ReadonlyArray<MenubarMenu<Item, Msg>>;
/** Coordinated focus/open callback used for ArrowLeft/ArrowRight menubar navigation. */
  onMove?: (index: number) => Msg;
  activeIndex?: number;
  ariaLabel?: string;
  layoutStyle?: ComponentLayoutStyle;
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
          styles.root,
          props.layoutStyle,
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
              trigger: h.span(
                [h.Class(className(styles.trigger))],
                [menu.label],
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

