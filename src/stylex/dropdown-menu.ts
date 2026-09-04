const styles = stylex.create({
  backdrop: { cursor: interactionTokens.cursorDefault, inset: 0, position: 'fixed', zIndex: 40 },
  bottom: { marginTop: '0.25rem', top: '100%' },
  indicator: { alignItems: 'center', display: 'flex', height: '0.875rem', justifyContent: 'center', left: '0.5rem', position: 'absolute', width: '0.875rem' },
  destructive: { backgroundColor: tokens.destructiveSurface, color: tokens.destructive },
  inset: { paddingLeft: '2rem' },
  label: { flexGrow: 1 },
  left: { marginRight: '0.25rem', right: '100%' },
  root: { display: 'inline-flex', position: 'relative' },
  right: { left: '100%', marginLeft: '0.25rem' },
  menuContent: { minWidth: '8rem', overflow: 'visible', padding: '0.25rem', position: 'absolute', width: 'max-content' },
  submenu: { left: '100%', marginLeft: '0.25rem', minWidth: '8rem', overflow: 'visible', padding: '0.25rem', position: 'absolute', top: 0, width: 'max-content' },
  submenuRtl: { left: 'auto', marginLeft: 0, marginRight: '0.25rem', right: '100%' },
  shortcut: { color: tokens.mutedForeground, fontSize: '0.75rem', letterSpacing: '0.1em', marginLeft: 'auto' },
  top: { bottom: '100%', marginBottom: '0.25rem' },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

import { Option, Schema as S } from 'effect';
import type { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import * as Icon from '@/lib/icon';
import * as Behavior from '@/lib/dropdown-menu-behavior';
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

export const Model = S.Struct({
  id: S.String,
  isOpen: S.Boolean,
  isAnimated: S.Boolean,
  activeIndex: S.Number,
  activeSubmenuIndex: S.Number,
  openSubmenuIndex: S.Option(S.Number),
  anchorX: S.Option(S.Number),
  anchorY: S.Option(S.Number),
});
export type Model = typeof Model.Type;

export const Opened = m('Opened');
export const AnchoredAt = m('AnchoredAt', { x: S.Number, y: S.Number });
export const OpenedFromContext = m('OpenedFromContext');
export const OpenedAt = m('OpenedAt', { x: S.Number, y: S.Number });
export const Closed = m('Closed');
export const ActivatedItem = m('ActivatedItem', { index: S.Number });
export const OpenedSubmenu = m('OpenedSubmenu', { index: S.Number });
export const ActivatedSubmenuItem = m('ActivatedSubmenuItem', {
  index: S.Number,
});
export const ClosedSubmenu = m('ClosedSubmenu');
export const SelectedItem = m('SelectedItem', {
  item: S.String,
  index: S.Number,
});
export const Message = S.Union([
  Opened,
  AnchoredAt,
  OpenedFromContext,
  OpenedAt,
  Closed,
  ActivatedItem,
  OpenedSubmenu,
  ActivatedSubmenuItem,
  ClosedSubmenu,
  SelectedItem,
]);
export type Message = typeof Message.Type;

export const Selected = m('Selected', { value: S.String, index: S.Number });
export const OutMessage = S.Union([Selected]);
export type OutMessage<Item extends string = string> = Readonly<{
  _tag: 'Selected';
  value: Item;
  index: number;
}>;

export const init = (
  config: Readonly<{ id: string; isAnimated?: boolean; isModal?: boolean }>,
): Model => ({
  id: config.id,
  isOpen: false,
  isAnimated: config.isAnimated ?? false,
  activeIndex: 0,
  activeSubmenuIndex: 0,
  openSubmenuIndex: Option.none(),
  anchorX: Option.none(),
  anchorY: Option.none(),
});

type UpdateReturn<Item extends string> = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
  Option.Option<OutMessage<Item>>,
];

const updateTyped = <Item extends string>(
  model: Model,
  message: Message,
): UpdateReturn<Item> => {
  const result = Behavior.update(model, message);
  return [
    result.model,
    [],
    Option.map(result.selection, ({ item, index }) =>
      Selected({ value: item, index }) as OutMessage<Item>,
    ),
  ];
};

export const create = <Item extends string = string>() => ({
  update: (model: Model, message: Message): UpdateReturn<Item> =>
    updateTyped<Item>(model, message),
  open: (model: Model): UpdateReturn<Item> =>
    updateTyped<Item>(model, Opened()),
  openAt: (model: Model, x: number, y: number): UpdateReturn<Item> =>
    updateTyped<Item>(model, OpenedAt({ x, y })),
  close: (model: Model): UpdateReturn<Item> =>
    updateTyped<Item>(model, Closed()),
  selectItem: (model: Model, item: Item, index: number): UpdateReturn<Item> =>
    updateTyped<Item>(model, SelectedItem({ item, index })),
});

export const update = create().update;
export const open = create().open;
export const openAt = create().openAt;
export const close = create().close;
export const selectItem = create().selectItem;

const CONTENT_CLASS = overlayStyles.panel
const ITEM_CLASS = overlayStyles.item
const SUBMENU_CLASS = overlayStyles.panel

export type DropdownMenuItemConfig<Item extends string = string> = Readonly<{
  label: Html | string;
  icon?: Html;
  shortcut?: Html | string;
  variant?: 'default' | 'destructive';
  kind?: 'item' | 'checkbox' | 'radio';
  isChecked?: boolean;
  isInset?: boolean;
  isDisabled?: boolean;
  group?: string;
  submenu?: Readonly<{
    items: ReadonlyArray<Item>;
    itemToConfig: (item: Item) => DropdownMenuItemConfig<Item>;
  }>;
}>;

export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left';
export type DropdownMenuAlign = 'start' | 'center' | 'end';

export type DropdownMenuProps<Item extends string, Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  trigger: Html | string;
  triggerLayoutStyle?: ComponentLayoutStyle;
  triggerTabindex?: number;
  triggerRole?: string;
  items: ReadonlyArray<Item>;
  itemToConfig: (item: Item) => DropdownMenuItemConfig<Item>;
  align?: DropdownMenuAlign;
  side?: DropdownMenuSide;
  ariaLabel?: string;
  openOnContextMenu?: boolean;
  direction?: 'ltr' | 'rtl';
}>;

const positionClass = (
  side: DropdownMenuSide,
  _align: DropdownMenuAlign,
): StaticStyles => styles[side]

const menuKey = <Item extends string>(
  model: Model,
  items: ReadonlyArray<Item>,
  itemToConfig: (item: Item) => DropdownMenuItemConfig<Item>,
  key: string,
  direction: 'ltr' | 'rtl' = 'ltr',
): Message | undefined => {
  const toBehavior = (
    item: Item,
    config: DropdownMenuItemConfig<Item>,
  ): Behavior.MenuItemBehavior<Item> => ({
    label: typeof config.label === 'string' ? config.label : item,
    isDisabled: config.isDisabled === true,
    ...(config.submenu === undefined
      ? {}
      : {
          submenu: {
            items: config.submenu.items,
            itemToBehavior: (child: Item) =>
              toBehavior(child, config.submenu?.itemToConfig(child) ?? { label: child }),
          },
        }),
  });
  return Behavior.keyMessage(
    model,
    items,
    (item) => toBehavior(item, itemToConfig(item)),
    key,
    direction,
  );
};

export const dropdownMenu = <Item extends string, Msg>(
  props: DropdownMenuProps<Item, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const anchorX = Option.getOrUndefined(props.model.anchorX);
  const anchorY = Option.getOrUndefined(props.model.anchorY);
  const keyMessage = (key: string) => {
    const message = menuKey(
      props.model,
      props.items,
      props.itemToConfig,
      key,
      props.direction,
    );
    return message === undefined
      ? Option.none()
      : Option.some(props.toParentMessage(message));
  };

  const renderItem = (
    item: Item,
    index: number,
    config: DropdownMenuItemConfig<Item>,
    isSubmenu = false,
  ): Html => {
    const active = isSubmenu
      ? props.model.activeSubmenuIndex === index - props.items.length
      : props.model.activeIndex === index;
    const checked = config.isChecked ?? false;
    const role =
      config.kind === 'checkbox'
        ? 'menuitemcheckbox'
        : config.kind === 'radio'
          ? 'menuitemradio'
          : config.submenu === undefined
            ? 'menuitem'
            : 'menuitem';
    return h.div(
      [
        h.Role(role),
        h.Tabindex(active ? 0 : -1),
        h.DataAttribute('active', String(active)),
        ...(config.kind === 'checkbox' || config.kind === 'radio'
          ? [h.AriaChecked(checked)]
          : []),
        ...(config.isDisabled === true
          ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
          : []),
        ...(config.submenu === undefined
          ? []
          : [
              h.AriaHasPopup('menu'),
              h.AriaExpanded(
                Option.contains(props.model.openSubmenuIndex, index),
              ),
              h.AriaControls(`${props.model.id}-submenu-${String(index)}`),
            ]),
        ...(config.isDisabled === true
          ? []
          : [
              h.OnMouseEnter(
                props.toParentMessage(
                  isSubmenu
                    ? ActivatedSubmenuItem({
                        index: index - props.items.length,
                      })
                    : config.submenu === undefined
                      ? ActivatedItem({ index })
                      : OpenedSubmenu({ index }),
                ),
              ),
            ]),
        ...(config.isDisabled === true || config.submenu !== undefined
          ? []
          : [h.OnClick(props.toParentMessage(SelectedItem({ item, index })))]),
        h.Class(
          cn(
            ITEM_CLASS,
            config.isInset ? styles.inset : undefined,
            config.variant === 'destructive' ? styles.destructive : undefined,
          ),
        ),
      ],
      [
        ...(config.kind === 'checkbox' || config.kind === 'radio'
          ? [
              h.span(
                [
                  h.Class(className(styles.indicator)),
                ],
                [
                  checked
                    ? config.kind === 'checkbox'
                      ? Icon.check<Msg>({ class: className(overlayStyles.icon) }, h)
                      : Icon.circleIcon<Msg>(
                          { class: className(overlayStyles.icon) },
                          h,
                        )
                    : '',
                ],
              ),
            ]
          : []),
        ...(config.icon === undefined ? [] : [config.icon]),
        h.span([h.Class(className(styles.label))], [config.label]),
        ...(config.shortcut === undefined
          ? []
          : [
              h.span(
                [
                  h.Class(className(styles.shortcut)),
                ],
                [config.shortcut],
              ),
            ]),
        ...(config.submenu === undefined
          ? []
          : [Icon.chevronRight<Msg>({ class: className(overlayStyles.icon) }, h)]),
        ...(config.submenu === undefined ||
        !Option.contains(props.model.openSubmenuIndex, index)
          ? []
          : [
              h.div(
                [
                  h.Role('menu'),
                  h.AriaLabel(
                    `${typeof config.label === 'string' ? config.label : 'Submenu'} submenu`,
                  ),
                  h.Id(`${props.model.id}-submenu-${String(index)}`),
                  h.Class(cn(SUBMENU_CLASS, styles.submenu, props.direction === 'rtl' ? styles.submenuRtl : undefined)),
                ],
                config.submenu.items.map((child, childIndex) =>
                  renderItem(
                    child,
                    props.items.length + childIndex,
                    config.submenu?.itemToConfig(child) ?? { label: child },
                    true,
                  ),
                ),
              ),
            ]),
      ],
    );
  };

  const grouped: Array<Html> = [];
  let previousGroup: string | undefined;
  props.items.forEach((item, index) => {
    const config = props.itemToConfig(item);
    if (config.group !== previousGroup) {
      if (grouped.length > 0)
        grouped.push(
          h.div(
            [h.Role('separator'), h.Class(className(overlayStyles.separator))],
            [],
          ),
        );
      if (config.group !== undefined)
        grouped.push(
          h.div([h.Class(className(overlayStyles.label))], [config.group]),
        );
      previousGroup = config.group;
    }
    grouped.push(renderItem(item, index, config));
  });

  return h.div(
    [
      h.DataAttribute('slot', 'dropdown-menu'),
      h.Class(className(styles.root)),
      ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
    ],
    [
      h.button(
        [
          h.Type('button'),
          ...(props.triggerRole === undefined ? [] : [h.Role(props.triggerRole)]),
          h.AriaHasPopup('menu'),
          h.Id(`${props.model.id}-trigger`),
          h.AriaExpanded(props.model.isOpen),
          h.AriaControls(`${props.model.id}-content`),
          ...(props.openOnContextMenu === true
            ? [
                h.OnContextMenu(props.toParentMessage(OpenedFromContext())),
                h.OnPointerDown(
                  (
                    _pointerType,
                    button,
                    _screenX,
                    _screenY,
                    _timeStamp,
                    clientX,
                    clientY,
                  ) =>
                    button === 2
                      ? Option.some(
                          props.toParentMessage(
                            AnchoredAt({ x: clientX, y: clientY }),
                          ),
                        )
                      : Option.none(),
                ),
              ]
            : [
                h.OnClick(
                  props.toParentMessage(
                    props.model.isOpen ? Closed() : Opened(),
                  ),
                ),
              ]),
          h.DataAttribute('slot', 'dropdown-menu-trigger'),
          ...(props.triggerTabindex === undefined ? [] : [h.Tabindex(props.triggerTabindex)]),
          ...(props.triggerLayoutStyle === undefined
            ? []
            : [h.Class(className(props.triggerLayoutStyle))]),
          h.OnKeyDownPreventDefault((key, modifiers) => {
            const message = props.model.isOpen
              ? menuKey(
                  props.model,
                  props.items,
                  props.itemToConfig,
                  key,
                  props.direction,
                )
              : props.openOnContextMenu === true &&
                  (key === 'ContextMenu' || (key === 'F10' && modifiers.shiftKey))
                ? Opened()
              : key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' '
                ? Opened()
                : undefined;
            return message === undefined
              ? Option.none()
              : Option.some(props.toParentMessage(message));
          }),
        ],
        [props.trigger],
      ),
      ...(props.model.isOpen
        ? [
            h.div(
              [
                h.AriaHidden(true),
                h.OnClick(props.toParentMessage(Closed())),
                h.Class(className(styles.backdrop)),
                h.DataAttribute('slot', 'dropdown-menu-backdrop'),
              ],
              [],
            ),
            h.div(
              [
                h.Role('menu'),
                h.Id(`${props.model.id}-content`),
                h.AriaLabel(props.ariaLabel ?? 'Menu'),
                h.Tabindex(0),
                h.OnKeyDownPreventDefault(keyMessage),
                h.DataAttribute('slot', 'dropdown-menu-content'),
                ...(anchorX !== undefined && anchorY !== undefined
                  ? [
                      h.Style({
                        position: 'fixed',
                        left: `clamp(4px, ${String(anchorX)}px, calc(100vw - 164px))`,
                        top: `clamp(4px, ${String(anchorY)}px, calc(100vh - 48px))`,
                        maxHeight: 'calc(100vh - 8px)',
                      }),
                    ]
                  : []),
                h.Class(
                  cn(
                    CONTENT_CLASS,
                    styles.menuContent,
                    anchorX !== undefined
                      ? undefined
                      : positionClass(
                          props.side ?? 'bottom',
                          props.align ?? 'start',
                        ),
                  ),
                ),
              ],
              grouped,
            ),
          ]
        : []),
    ],
  );
};
