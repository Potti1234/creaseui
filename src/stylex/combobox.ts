import type { Option } from 'effect';
import { childAttributes, type Html, type HtmlBuilder } from 'foldkit/html';

import { Combobox as ComboboxPrimitive } from '@foldkit/ui';

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

/* shadcn's combobox is a Popover + Command composition rather than a
   standalone primitive. This ports that look onto foldkit's single-select,
   config-driven Combobox submodel.

   Command's selected/highlighted state is driven by foldkit's data-active
   attribute, and its disabled input/item styles use foldkit's data-disabled
   and aria-disabled signals. Popup animation uses a finite data-closed
   transition; pass isAnimated: true to init.

   PORT NOTE: foldkit Combobox only accepts strings as its internal items, so
   arbitrary consumer items are projected through itemToValue before being
   handed to the primitive. Values must be unique.

   PORT NOTE: foldkit Combobox exposes its input-wrapper suffix as a toggle
   button rather than an arbitrary decorative slot. The search icon uses that
   button and is visually ordered before the input. Per-item data attributes
   are not exposed, so command-item is placed on the inner content span. */

export const Model = ComboboxPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = ComboboxPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = ComboboxPrimitive.OutMessage;
export type OutMessage<Value extends string = string> =
  ComboboxPrimitive.OutMessage<Value>;

export const init = ComboboxPrimitive.init;
export const create = ComboboxPrimitive.create;
export const update = ComboboxPrimitive.create().update;

const ROOT_CLASS = overlayStyles.root

const INPUT_WRAPPER_CLASS = overlayStyles.inputWrapper

const INPUT_CLASS = overlayStyles.input

const CONTENT_CLASS = overlayStyles.panel

const LIST_CLASS = overlayStyles.list

const ITEM_CLASS = overlayStyles.item

const INDICATOR_CLASS = overlayStyles.indicator

const GROUP_CLASS = overlayStyles.group

const SEPARATOR_CLASS = overlayStyles.separator

const BACKDROP_CLASS = overlayStyles.backdrop

export type ComboboxSize = 'sm' | 'default';

export type ComboboxItemConfig = Readonly<{
  content?: Html | string;
  searchText?: string;
  layoutStyle?: ComponentLayoutStyle;
  isDisabled?: boolean;
}>;

export type ComboboxProps<Item, Value extends string, Msg> = Readonly<{
  model: Model;
  maybeSelectedValue: Option.Option<Value>;
  restingInputValue: string;
  toParentMessage: (message: Message) => Msg;
  items: ReadonlyArray<Item>;
  itemToValue: (item: Item) => Value;
  itemToLabel: (item: Item) => string;
  itemToConfig?: (item: Item) => ComboboxItemConfig;
  placeholder?: string;
  triggerLayoutStyle?: ComponentLayoutStyle;
  size?: ComboboxSize;
  ariaLabel?: string;
  itemGroupKey?: (item: Item, index: number) => string;
  groupToHeading?: (groupKey: string) => string | undefined;
}>;

export const combobox = <Item, Value extends string, Msg>(
  props: ComboboxProps<Item, Value, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const hc = h;
  const comboboxPrimitive = ComboboxPrimitive.create<Value>();
  const itemForValue = (value: Value): Item | undefined =>
    props.items.find((item) => props.itemToValue(item) === value);
  const labelForValue = (value: Value): string => {
    const item = itemForValue(value);
    return item === undefined ? value : props.itemToLabel(item);
  };
  const query = props.model.inputValue.trim().toLocaleLowerCase();
  const isShowingSelectedLabel =
    props.restingInputValue === props.model.inputValue;
  const values = props.items
    .filter(
      (item) =>
        query === '' ||
        isShowingSelectedLabel ||
        (props.itemToConfig?.(item).searchText ?? props.itemToLabel(item))
          .toLocaleLowerCase()
          .includes(query),
    )
    .map(props.itemToValue);

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: comboboxPrimitive.view,
    viewInputs: {
      maybeSelectedValue: props.maybeSelectedValue,
      restingInputValue: props.restingInputValue,
      items: values,
      itemToValue: (value) => value,
      itemToDisplayText: labelForValue,
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
          content: hc.span(
            [hc.DataAttribute('slot', 'command-item'), hc.Class(className(styles.contents))],
            [
              hc.span([], [config?.content ?? labelForValue(value)]),
              hc.span(
                [hc.Class(className(INDICATOR_CLASS))],
                [Icon.check({ class: className(overlayStyles.icon) }, h)],
              ),
            ],
          ),
        };
      },
      inputClassName: className(INPUT_CLASS),
      inputAttributes: childAttributes([
        hc.DataAttribute('slot', 'command-input'),
      ]),
      ...(props.placeholder === undefined
        ? {}
        : { inputPlaceholder: props.placeholder }),
      inputWrapperClassName: cn(INPUT_WRAPPER_CLASS, props.triggerLayoutStyle),
      inputWrapperAttributes: childAttributes([
        hc.DataAttribute('slot', 'command-input-wrapper'),
        hc.DataAttribute('size', props.size ?? 'default'),
      ]),
      openOnFocus: true,
      itemsClassName: className(CONTENT_CLASS),
      itemsAttributes: childAttributes([
        hc.DataAttribute('slot', 'command-list'),
      ]),
      itemsScrollClassName: className(LIST_CLASS),
      backdropClassName: className(BACKDROP_CLASS),
      className: className(ROOT_CLASS),
      attributes: childAttributes([hc.DataAttribute('slot', 'command')]),
      anchor: themedAnchor({ placement: 'bottom-start', gap: 4 }),
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
                    content: hc.span(
                      [hc.DataAttribute('slot', 'combobox-group-heading')],
                      [heading],
                    ),
                  };
            },
            groupClassName: className(GROUP_CLASS),
            groupAttributes: childAttributes([
              hc.DataAttribute('slot', 'command-group'),
            ]),
            separatorClassName: className(SEPARATOR_CLASS),
            separatorAttributes: childAttributes([
              hc.DataAttribute('slot', 'command-separator'),
            ]),
          }),
      ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
    },
    toParentMessage: props.toParentMessage,
  });
};

/*
   Minimal wiring:

   type Framework = Readonly<{ value: 'foldkit' | 'elm'; label: string }>
   const FrameworkCombobox = create<Framework['value']>()

   // Model: { frameworkCombobox: Model }
   // Message: GotFrameworkComboboxMessage({ message: Message })
   // Init: frameworkCombobox: init({ id: 'framework', isAnimated: true })
   //
   // Update:
   // const [frameworkCombobox, commands, maybeOutMessage] =
   //   FrameworkCombobox.update(model.frameworkCombobox, message)
   //
   // View:
   // combobox<Framework, Framework['value'], AppMessage>({
   //   model: model.frameworkCombobox,
   //   toParentMessage: message => GotFrameworkComboboxMessage({ message }),
   //   items: frameworks,
   //   itemToValue: framework => framework.value,
   //   itemToLabel: framework => framework.label,
   //   placeholder: 'Search frameworks...',
   // })
*/

