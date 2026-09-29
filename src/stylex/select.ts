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
  isReadOnly?: boolean;
  isInvalid?: boolean;
  name?: string;
  form?: string;
  direction?: 'ltr' | 'rtl';
  /**
   * 'popper' places the popup below the trigger (default). 'item-aligned'
   * shifts the popup so the selected item overlaps the trigger, matching
   * Radix's position="item-aligned" as a static offset approximation.
   */
  position?: 'popper' | 'item-aligned';
  itemGroupKey?: (item: Item, index: number) => string;
  groupToHeading?: (groupKey: string) => string | undefined;
}>;

const ITEM_ALIGNED_ITEM_HEIGHT = 32;
const ITEM_ALIGNED_BASE_OFFSET = 40;

const buildAnchor = <Item, Value extends string, Msg>(
  props: SelectProps<Item, Value, Msg>,
  values: ReadonlyArray<Value>,
): Readonly<{ anchor: ListboxPrimitive.AnchorConfig }> => {
  if (props.position !== 'item-aligned') {
    return { anchor: ANCHOR };
  }
  const selectedIndex = Option.match(props.maybeSelectedValue, {
    onNone: () => 0,
    onSome: selected =>
      Math.max(0, values.findIndex(value => value === selected)),
  });
  return {
    anchor: themedAnchor({
      placement: 'bottom-start',
      gap: -(ITEM_ALIGNED_BASE_OFFSET + selectedIndex * ITEM_ALIGNED_ITEM_HEIGHT),
    }),
  };
};

const renderSelect = <Item, Value extends string, Msg>(
  listbox: ListboxPrimitive.Bundle<Value, Value>,
  props: SelectProps<Item, Value, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const hs = h;
  const values = props.items.map(props.itemToValue);
  const itemForValue = (value: Value): Item | undefined =>
    props.items.find((item) => props.itemToValue(item) === value);
  const labelForValue = (value: Value): string => {
    const item = itemForValue(value);
    return item === undefined ? value : props.itemToLabel(item);
  };
  const selectedLabel = Option.match(props.maybeSelectedValue, {
    onNone: () => undefined,
    onSome: labelForValue,
  });
  const itemToSearchText = (value: Value): string => {
    const item = itemForValue(value);
    return item === undefined
      ? labelForValue(value)
      : (props.itemToConfig?.(item).searchText ?? labelForValue(value));
  };
  const isItemDisabled = (value: Value): boolean => {
    if (props.isDisabled ?? false) {
      return true;
    }
    const item = itemForValue(value);
    return item === undefined
      ? false
      : (props.itemToConfig?.(item).isDisabled ?? false);
  };
  const maybeSelectedItemIndex = Option.flatMap(
    props.maybeSelectedValue,
    (selected) => {
      const index = values.findIndex((value) => value === selected);
      return index === -1 ? Option.none() : Option.some(index);
    },
  );

  // Base UI commits the typeahead match on a closed, focused trigger — a
  // fresh search starts after the current selection and wraps once.
  const handleTriggerTypeaheadKeyDown = (key: string): Option.Option<Msg> => {
    if (
      props.model.isOpen ||
      (props.isReadOnly ?? false) ||
      key.length !== 1 ||
      key === ' '
    ) {
      return Option.none();
    }
    const startIndex = Option.match(maybeSelectedItemIndex, {
      onNone: () => 0,
      onSome: (index) => index + 1,
    });
    const length = values.length;
    for (let step = 0; step < length; step += 1) {
      const index = (startIndex + step) % length;
      const value = values[index];
      if (
        value !== undefined &&
        !isItemDisabled(value) &&
        itemToSearchText(value).toLowerCase().startsWith(key.toLowerCase())
      ) {
        return Option.some(
          props.toParentMessage(
            ListboxPrimitive.Message.SelectedItem({ item: value }),
          ),
        );
      }
    }
    return Option.none();
  };

  // Pointer/click opens arrive as Opened(none); seed the active item from the
  // selection so the popup highlights it like Base UI.
  const toParentMessage = (message: Message): Msg =>
    props.toParentMessage(
      message._tag === 'Opened' &&
        Option.isNone(message.maybeActiveItemIndex) &&
        Option.isSome(maybeSelectedItemIndex)
        ? ListboxPrimitive.Message.Opened({
            maybeActiveItemIndex: maybeSelectedItemIndex,
          })
        : message,
    );

  const viewInputs: ListboxPrimitive.ViewInputs<Value, Value> = {
    maybeSelectedValue: props.maybeSelectedValue,
    items: values,
    itemToValue: (value) => value,
    itemToSearchText,
    isItemDisabled,
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
          [
            hs.DataAttribute('slot', 'select-value'),
            ...(selectedLabel === undefined
              ? [hs.DataAttribute('placeholder', '')]
              : []),
          ],
          [selectedLabel ?? props.placeholder ?? ''],
        ),
        Icon.chevronDown({ class: className(overlayStyles.icon) }, h),
      ],
    ),
    buttonClassName: cn(TRIGGER_CLASS, props.triggerLayoutStyle),
    isDisabled: props.isDisabled ?? false,
    isReadOnly: props.isReadOnly ?? false,
    isInvalid: props.isInvalid ?? false,
    buttonAttributes: childAttributes([
      hs.DataAttribute('slot', 'select-trigger'),
      hs.DataAttribute('size', props.size ?? 'default'),
      hs.Role('combobox'),
      ...(selectedLabel === undefined
        ? [hs.DataAttribute('placeholder', '')]
        : []),
      ...(props.isDisabled ?? false
        ? [hs.Attribute('disabled', '')]
        : [hs.OnKeyDownPreventDefault(handleTriggerTypeaheadKeyDown)]),
      ...(props.isReadOnly ?? false ? [hs.AriaReadonly(true)] : []),
    ]),
    ...buildAnchor(props, values),
    itemsClassName: className(CONTENT_CLASS),
    itemsAttributes: childAttributes([
      hs.DataAttribute('slot', 'select-content'),
    ]),
    itemsScrollClassName: className(VIEWPORT_CLASS),
    backdropClassName: className(BACKDROP_CLASS),
    backdropAttributes: childAttributes([hs.DataAttribute('slot', 'select-backdrop')]),
    attributes: childAttributes([
      hs.DataAttribute('slot', 'select'),
      ...(props.direction === undefined ? [] : [hs.Dir(props.direction)]),
    ]),
    ...(props.itemGroupKey === undefined
      ? {}
      : {
          itemGroupKey: (value: Value, index: number): string => {
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

  // Base UI always renders the hidden form input and gives it
  // `<id>-hidden-input` only when no name is provided; foldkit's built-in
  // inputs (name only, no id) are bypassed so creaseui owns the contract.
  const hiddenInput = hs.input([
    hs.Type('hidden'),
    ...(props.name === undefined
      ? [hs.Id(`${props.model.id}-hidden-input`)]
      : [hs.Name(props.name)]),
    ...Option.match(props.maybeSelectedValue, {
      onNone: () => [],
      onSome: (value) => [hs.Value(value)],
    }),
    ...(props.form === undefined ? [] : [hs.Attribute('form', props.form)]),
    ...(props.isDisabled ?? false ? [hs.Attribute('disabled', '')] : []),
  ]);

  return h.div(
    [],
    [
      // TypeScript cannot reduce Foldkit's conditional SubmodelConfig while
      // Value is still generic; every field remains independently typed above.
      // eslint-disable-next-line no-restricted-syntax -- reason: Foldkit's generic conditional SubmodelConfig cannot be reduced here.
      h.submodel<typeof listbox.view>({
        slotId: props.model.id,
        model: props.model,
        view: listbox.view,
        viewInputs,
        toParentMessage,
      } as unknown as Parameters<typeof h.submodel<typeof listbox.view>>[0]),
      hiddenInput,
    ],
  );
};

export type SelectBundle<Value extends string> = Readonly<{
  update: ReturnType<typeof ListboxPrimitive.create<Value, Value>>['update'];
  select: <Item, Msg>(props: SelectProps<Item, Value, Msg>, h: HtmlBuilder<Msg>) => Html;
}>;

export const create = <Value extends string = string>(): SelectBundle<Value> => {
  const listbox = ListboxPrimitive.create<Value, Value>();
  return {
    update: listbox.update,
    select: (props, h) => renderSelect(listbox, props, h),
  };
};

const StringSelect = create<string>();
export const update = StringSelect.update;
export const select = StringSelect.select;

/*
   Minimal wiring:

   type Color = Readonly<{ value: 'red' | 'blue'; label: string }>
   const ColorSelect = create<Color['value']>()

   // Model: { colorSelect: Model }
   // Message: GotColorSelectMessage({ message: Message })
   // Init: colorSelect: init({ id: 'color', isAnimated: true })
   //
   // Update:
   // const colorSelectOp__ = //   ColorSelect.update(model.colorSelect, message);
    const colorSelect = colorSelectOp__.model;
    const commands = colorSelectOp__.commands ?? [];
    const maybeOutMessage = Option.fromNullishOr(colorSelectOp__.outMessage);
   //
   // View:
   // ColorSelect.select<Color, AppMessage>({
   //   model: model.colorSelect,
   //   toParentMessage: message => GotColorSelectMessage({ message }),
   //   items: colors,
   //   itemToValue: color => color.value,
   //   itemToLabel: color => color.label,
   //   placeholder: 'Select a color',
   // })
*/
