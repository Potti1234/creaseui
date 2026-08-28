import { Option } from 'effect';
import { childAttributes, type Html, type HtmlBuilder } from 'foldkit/html';

import { Listbox as ListboxPrimitive } from '@foldkit/ui';

import * as Icon from '@/lib/icon';
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { themedAnchor } from './overlay-boundary'
import { className } from './style'

const styles = stylex.create({
  contents: { display: 'contents' },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

/* Ported from shadcn/ui select.tsx on top of foldkit's single-select
   config-driven Listbox submodel.

   Class strings are shadcn's, with these adaptations:
   - Radix highlighted state is driven by foldkit's data-active attribute.
   - Button disabled styles use data-disabled/aria-disabled because foldkit's
     Listbox button is not natively disabled.
   - Radix keyframe animations become finite transitions driven by foldkit's
     data-closed transition phase. Pass isAnimated: true to init.
   - The panel uses foldkit Anchor's --button-width variable and forced inline
     available-height/positioning instead of Radix positioning variables.

   PORT NOTE: foldkit Listbox does not expose per-item attributes. The
   select-item data slot is therefore placed on the item's content span rather
   than the primitive's outer role=option element. Arbitrary consumer items are
   projected through itemToValue, so their values must be unique. */

export const Model = ListboxPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = ListboxPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = ListboxPrimitive.OutMessage;
export type OutMessage<Value extends string = string> =
  ListboxPrimitive.OutMessage<Value>;

export const init = ListboxPrimitive.init;
export const create = ListboxPrimitive.create;
export const update = ListboxPrimitive.create().update;

const TRIGGER_CLASS = overlayStyles.trigger

const CONTENT_CLASS = overlayStyles.panel

const VIEWPORT_CLASS = overlayStyles.viewport

const ITEM_CLASS = overlayStyles.item

const INDICATOR_CLASS = overlayStyles.indicator

const LABEL_CLASS = overlayStyles.label

const SEPARATOR_CLASS = overlayStyles.separator

const BACKDROP_CLASS = overlayStyles.backdrop

const ANCHOR: ListboxPrimitive.AnchorConfig = themedAnchor({
  placement: 'bottom-start',
  gap: 4,
})

export type SelectSize = 'sm' | 'default';

export type SelectItemConfig = Readonly<{
  content?: Html | string;
  searchText?: string;
  layoutStyle?: ComponentLayoutStyle;
  isDisabled?: boolean;
}>;

export type SelectProps<Item, Value extends string, Msg> = Readonly<{
  model: Model;
  maybeSelectedValue: Option.Option<Value>;
  toParentMessage: (message: Message) => Msg;
  items: ReadonlyArray<Item>;
  itemToValue: (item: Item) => Value;
  itemToLabel: (item: Item) => string;
  itemToConfig?: (item: Item) => SelectItemConfig;
  placeholder?: string;
  triggerLayoutStyle?: ComponentLayoutStyle;
  size?: SelectSize;
  ariaLabel?: string;
  isDisabled?: boolean;
  itemGroupKey?: (item: Item, index: number) => string;
  groupToHeading?: (groupKey: string) => string | undefined;
}>;

export const select = <Item, Value extends string, Msg>(
  props: SelectProps<Item, Value, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const hs = h;
  const listbox = ListboxPrimitive.create();
  const values = props.items.map(props.itemToValue);
  const itemForValue = (value: string): Item | undefined =>
    props.items.find((item) => props.itemToValue(item) === value);
  const labelForValue = (value: string): string => {
    const item = itemForValue(value);
    return item === undefined ? value : props.itemToLabel(item);
  };
  const selectedLabel = Option.match(props.maybeSelectedValue, {
    onNone: () => undefined,
    onSome: labelForValue,
  });

  const viewInputs: ListboxPrimitive.ViewInputs<string> = {
    maybeSelectedValue: props.maybeSelectedValue,
    items: values,
    itemToValue: (value) => value,
    itemToSearchText: (value) => {
      const item = itemForValue(value);
      return item === undefined
        ? labelForValue(value)
        : (props.itemToConfig?.(item).searchText ?? labelForValue(value));
    },
    isItemDisabled: (value) => {
      const item = itemForValue(value);
      return item === undefined
        ? false
        : (props.itemToConfig?.(item).isDisabled ?? false);
    },
    itemToConfig: (value) => {
      const item = itemForValue(value);
      const config =
        item === undefined ? undefined : props.itemToConfig?.(item);
      return {
        className: cn(ITEM_CLASS, config?.layoutStyle),
        content: hs.span(
          [hs.DataAttribute('slot', 'select-item'), hs.Class(className(styles.contents))],
          [
            hs.span(
              [
                hs.DataAttribute('slot', 'select-item-indicator'),
                hs.Class(className(INDICATOR_CLASS)),
              ],
              [Icon.check({ class: className(overlayStyles.icon) }, h)],
            ),
            hs.span([], [config?.content ?? labelForValue(value)]),
          ],
        ),
      };
    },
    buttonContent: hs.span(
      [hs.Class(className(styles.contents))],
      [
        hs.span(
          [hs.DataAttribute('slot', 'select-value')],
          [selectedLabel ?? props.placeholder ?? ''],
        ),
        Icon.chevronDown({ class: className(overlayStyles.icon) }, h),
      ],
    ),
    buttonClassName: cn(TRIGGER_CLASS, props.triggerLayoutStyle),
    isDisabled: props.isDisabled ?? false,
    buttonAttributes: childAttributes([
      hs.DataAttribute('slot', 'select-trigger'),
      hs.DataAttribute('size', props.size ?? 'default'),
      ...(selectedLabel === undefined
        ? [hs.DataAttribute('placeholder', '')]
        : []),
    ]),
    itemsClassName: className(CONTENT_CLASS),
    itemsAttributes: childAttributes([
      hs.DataAttribute('slot', 'select-content'),
    ]),
    itemsScrollClassName: className(VIEWPORT_CLASS),
    backdropClassName: className(BACKDROP_CLASS),
    anchor: ANCHOR,
    attributes: childAttributes([hs.DataAttribute('slot', 'select')]),
    ...(props.itemGroupKey === undefined
      ? {}
      : {
          itemGroupKey: (value: string, index: number): string => {
            const item = itemForValue(value);
            return item === undefined
              ? ''
              : (props.itemGroupKey?.(item, index) ?? '');
          },
          groupToHeading: (groupKey: string) => {
            const heading = props.groupToHeading?.(groupKey);
            return heading === undefined
              ? undefined
              : {
                  content: hs.span(
                    [hs.DataAttribute('slot', 'select-label')],
                    [heading],
                  ),
                  className: className(LABEL_CLASS),
                };
          },
          groupAttributes: childAttributes([
            hs.DataAttribute('slot', 'select-group'),
          ]),
          separatorClassName: className(SEPARATOR_CLASS),
          separatorAttributes: childAttributes([
            hs.DataAttribute('slot', 'select-separator'),
          ]),
        }),
    ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
  };

  return h.submodel<typeof listbox.view>({
    slotId: props.model.id,
    model: props.model,
    view: listbox.view,
    viewInputs,
    toParentMessage: props.toParentMessage,
  });
};

/*
   Minimal wiring:

   type Color = Readonly<{ value: 'red' | 'blue'; label: string }>
   const ColorSelect = create<Color['value']>()

   // Model: { colorSelect: Model }
   // Message: GotColorSelectMessage({ message: Message })
   // Init: colorSelect: init({ id: 'color', isAnimated: true })
   //
   // Update:
   // const [colorSelect, commands, maybeOutMessage] =
   //   ColorSelect.update(model.colorSelect, message)
   //
   // View:
   // select<Color, Color['value'], AppMessage>({
   //   model: model.colorSelect,
   //   toParentMessage: message => GotColorSelectMessage({ message }),
   //   items: colors,
   //   itemToValue: color => color.value,
   //   itemToLabel: color => color.label,
   //   placeholder: 'Select a color',
   // })
*/

