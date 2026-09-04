import { Option, Schema as S } from 'effect';
import type { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import * as Icon from '@/lib/icon';
import * as Behavior from '@/lib/dropdown-menu-behavior';
import { cn } from '@/lib/utils';

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

const CONTENT_CLASS =
  'absolute z-50 min-w-[8rem] overflow-visible rounded-md border bg-popover p-1 text-popover-foreground shadow-md';
const ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const SUBMENU_CLASS =
  'absolute top-0 left-full ml-1 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-lg';

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
  triggerClass?: string;
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
  align: DropdownMenuAlign,
): string => {
  const sideClass = {
    top: 'bottom-full mb-1',
    right: 'left-full ml-1',
    bottom: 'top-full mt-1',
    left: 'right-full mr-1',
  }[side];
  const alignClass =
    side === 'top' || side === 'bottom'
      ? {
          start: 'left-0',
          center: 'left-1/2 -translate-x-1/2',
          end: 'right-0',
        }[align]
      : { start: 'top-0', center: 'top-1/2 -translate-y-1/2', end: 'bottom-0' }[
          align
        ];
  return `${sideClass} ${alignClass}`;
};

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
            config.isInset ? 'pl-8' : undefined,
            config.variant === 'destructive'
              ? 'text-destructive data-[active=true]:bg-destructive/10'
              : undefined,
          ),
        ),
      ],
      [
        ...(config.kind === 'checkbox' || config.kind === 'radio'
          ? [
              h.span(
                [
                  h.Class(
                    'absolute left-2 flex size-3.5 items-center justify-center',
                  ),
                ],
                [
                  checked
                    ? config.kind === 'checkbox'
                      ? Icon.check<Msg>({ class: 'size-4' }, h)
                      : Icon.circleIcon<Msg>(
                          { class: 'size-2 fill-current' },
                          h,
                        )
                    : '',
                ],
              ),
            ]
          : []),
        ...(config.icon === undefined ? [] : [config.icon]),
        h.span([h.Class('flex-1')], [config.label]),
        ...(config.shortcut === undefined
          ? []
          : [
              h.span(
                [
                  h.Class(
                    'ml-auto text-xs tracking-widest text-muted-foreground',
                  ),
                ],
                [config.shortcut],
              ),
            ]),
        ...(config.submenu === undefined
          ? []
          : [Icon.chevronRight<Msg>({ class: 'ml-auto size-4' }, h)]),
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
                  h.Class(
                    cn(
                      SUBMENU_CLASS,
                      props.direction === 'rtl'
                        ? 'right-full left-auto mr-1 ml-0'
                        : undefined,
                    ),
                  ),
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
            [h.Role('separator'), h.Class('-mx-1 my-1 h-px bg-border')],
            [],
          ),
        );
      if (config.group !== undefined)
        grouped.push(
          h.div([h.Class('px-2 py-1.5 text-sm font-medium')], [config.group]),
        );
      previousGroup = config.group;
    }
    grouped.push(renderItem(item, index, config));
  });

  return h.div(
    [
      h.DataAttribute('slot', 'dropdown-menu'),
      h.Class('relative inline-flex'),
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
          ...(props.triggerClass === undefined
            ? []
            : [h.Class(props.triggerClass)]),
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
                h.Class('fixed inset-0 z-40 cursor-default'),
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
                    anchorX !== undefined
                      ? 'fixed'
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
