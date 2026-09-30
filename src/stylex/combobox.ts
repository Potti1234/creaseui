import { Option } from 'effect';
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
export const MultiModel = ComboboxPrimitive.Multi.Model;
export const multiInit = ComboboxPrimitive.Multi.init;
export type MultiModel = typeof MultiModel.Type;
export type MultiOutMessage<Value extends string = string> =
  OutMessage<Value>;

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
  ariaLabelledBy?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  formName?: string;
  direction?: 'ltr' | 'rtl';
  /**
   * Renders foldkit's input-wrapper suffix as a toggle button (chevron),
   * matching shadcn's trigger-style combobox where a button opens the popup.
   */
  trigger?: Readonly<{
    content: Html | string;
    layoutStyle?: ComponentLayoutStyle;
    ariaLabel?: string;
  }>;
  itemGroupKey?: (item: Item, index: number) => string;
  groupToHeading?: (groupKey: string) => string | undefined;
}>;

const renderCombobox = <Item, Value extends string, Msg>(
  comboboxPrimitive: ComboboxPrimitive.Bundle<Value>,
  props: ComboboxProps<Item, Value, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const hc = h;
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

  const baseInputs = buildBaseViewInputs(props, values, props.restingInputValue, hc);
  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: comboboxPrimitive.view,
    viewInputs: {
      ...baseInputs,
      maybeSelectedValue: props.maybeSelectedValue,
    },
    toParentMessage: props.toParentMessage,
  });
};

type CommonProps<Item, Value extends string, Msg> = Omit<
  ComboboxProps<Item, Value, Msg>,
  'maybeSelectedValue' | 'restingInputValue'
>;

const buildBaseViewInputs = <Item, Value extends string, Msg>(
  props: CommonProps<Item, Value, Msg>,
  values: ReadonlyArray<Value>,
  restingInputValue: string,
  hc: HtmlBuilder<Msg>,
): ComboboxPrimitive.BaseViewInputsCommon<Value> => {
  const itemForValue = (value: Value): Item | undefined =>
    props.items.find((item) => props.itemToValue(item) === value);
  const labelForValue = (value: Value): string => {
    const item = itemForValue(value);
    return item === undefined ? value : props.itemToLabel(item);
  };
  const isItemDisabled = (value: Value): boolean => {
    const item = itemForValue(value);
    return item === undefined
      ? false
      : (props.itemToConfig?.(item).isDisabled ?? false);
  };
  const isDisabled = props.isDisabled ?? false;
  const isReadOnly = props.isReadOnly ?? false;
  const firstEnabledIndex = values.findIndex(
    (value) => !isItemDisabled(value),
  );
  const lastEnabledIndex = values.reduce(
    (last, value, index) => (isItemDisabled(value) ? last : index),
    -1,
  );
  return {
      restingInputValue,
      items: values,
      itemToValue: (value) => value,
      itemToDisplayText: labelForValue,
      isItemDisabled,
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
                [Icon.check({ class: className(overlayStyles.icon) }, hc)],
              ),
            ],
          ),
        };
      },
      inputClassName: className(INPUT_CLASS),
      inputAttributes: childAttributes([
        hc.DataAttribute('slot', 'command-input'),
        // Base UI emits aria-autocomplete="none" while the input is readOnly.
        ...(isReadOnly ? [hc.Attribute('aria-autocomplete', 'none')] : []),
        ...(isDisabled
          ? []
          : [
              /* Base UI never opens the popup on focus alone (openOnInputClick
                 only). The primitive's no-op suppression marker acknowledges
                 the event so the scene DSL can still emit focus. */
              hc.OnFocus(
                props.toParentMessage(
                  ComboboxPrimitive.Message.SuppressedItemCommit(),
                ),
              ),
              ...(props.model.isOpen
                ? []
                : [
                    hc.OnClick(
                      props.toParentMessage(
                        ComboboxPrimitive.Message.Opened({
                          maybeActiveItemIndex: Option.none(),
                        }),
                      ),
                    ),
                  ]),
              /* Base UI maps PageDown/PageUp to the last/first enabled
                 option; foldkit's input keymap ignores them, so the view
                 layer fills the gap. */
              hc.OnKeyDownPreventDefault((key) => {
                if (key !== 'PageDown' && key !== 'PageUp') {
                  return Option.none();
                }
                const index =
                  key === 'PageDown' ? lastEnabledIndex : firstEnabledIndex;
                const item = index === -1 ? undefined : values[index];
                if (!props.model.isOpen || item === undefined) {
                  return Option.none();
                }
                return Option.some(
                  props.toParentMessage(
                    ComboboxPrimitive.Message.ActivatedItem({
                      index,
                      activationTrigger: 'Keyboard',
                      maybeImmediateSelection:
                        isReadOnly || !props.model.immediate
                          ? Option.none()
                          : Option.some({ item }),
                    }),
                  ),
                );
              }),
            ]),
      ]),
      ...(props.placeholder === undefined
        ? {}
        : { inputPlaceholder: props.placeholder }),
      inputWrapperClassName: cn(INPUT_WRAPPER_CLASS, props.triggerLayoutStyle),
      inputWrapperAttributes: childAttributes([
        hc.DataAttribute('slot', 'command-input-wrapper'),
        hc.DataAttribute('size', props.size ?? 'default'),
      ]),
      itemsClassName: className(CONTENT_CLASS),
      itemsAttributes: childAttributes([
        hc.DataAttribute('slot', 'command-list'),
      ]),
      itemsScrollClassName: className(LIST_CLASS),
      backdropClassName: className(BACKDROP_CLASS),
      backdropAttributes: childAttributes([hc.DataAttribute('slot', 'combobox-backdrop')]),
      className: className(ROOT_CLASS),
      attributes: childAttributes([
        hc.DataAttribute('slot', 'command'),
        ...(props.direction === undefined ? [] : [hc.Dir(props.direction)]),
      ]),
      anchor: themedAnchor({ placement: 'bottom-start', gap: 4 }),
      isDisabled,
      isReadOnly,
      isInvalid: props.isInvalid ?? false,
      ...(props.formName === undefined ? {} : { formName: props.formName }),
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
      ...(props.ariaLabelledBy === undefined ? {} : { ariaLabelledBy: props.ariaLabelledBy }),
      ...(props.trigger === undefined
        ? {}
        : {
            buttonContent: hc.span([], [props.trigger.content]),
            ...(props.trigger.layoutStyle === undefined
              ? {}
              : { buttonClassName: className(props.trigger.layoutStyle) }),
            buttonAttributes: childAttributes([
              /* Base UI's trigger is an ordinary focusable button; foldkit's
                 toggle is pointer-only (tabIndex -1). Restoring tabIndex 0
                 keeps it in the keyboard tab order. */
              ...(isDisabled ? [] : [hc.Tabindex(0)]),
              ...(props.trigger.ariaLabel === undefined
                ? []
                : [hc.AriaLabel(props.trigger.ariaLabel)]),
            ]),
          }),
    };
};

export type ComboboxBundle<Value extends string> = Readonly<{
  update: ReturnType<typeof ComboboxPrimitive.create<Value>>['update'];
  combobox: <Item, Msg>(props: ComboboxProps<Item, Value, Msg>, h: HtmlBuilder<Msg>) => Html;
}>;

export const create = <Value extends string = string>(
  config?: Readonly<{ autoHighlight?: boolean }>,
): ComboboxBundle<Value> => {
  const primitive = ComboboxPrimitive.create<Value>();
  const update = (model: Model, message: Message) => {
    const next = primitive.update(model, message);
    /* Base UI's autoHighlight only kicks in once filtering starts — neither
       opening nor typing highlights on its own when it is off. foldkit's
       UpdatedInputValue pre-activates index 0, so strip it back out. */
    const typedModel =
      message._tag === 'UpdatedInputValue' && config?.autoHighlight !== true
        ? { ...next.model, maybeActiveItemIndex: Option.none() }
        : next.model;
    /* Base UI deselects immediately when a nullable single-select input is
       emptied, while the popup stays open. */
    if (
      message._tag === 'UpdatedInputValue' &&
      message.value === '' &&
      model.nullable
    ) {
      return {
        ...next,
        model: typedModel,
        outMessage: OutMessage.ClearedSelection(),
      };
    }
    return { ...next, model: typedModel };
  };
  return {
    update,
    combobox: (props, h) => renderCombobox(primitive, props, h),
  };
};

export type ComboboxMultiProps<Item, Value extends string, Msg> = Omit<
  ComboboxProps<Item, Value, Msg>,
  'maybeSelectedValue' | 'restingInputValue'
> &
  Readonly<{
    /** The selection the parent owns; selecting an item toggles membership. */
    selectedValues: ReadonlyArray<Value>;
  }>;

export type ComboboxMultiBundle<Value extends string> = Readonly<{
  update: ReturnType<typeof ComboboxPrimitive.Multi.create<Value>>['update'];
  comboboxMulti: <Item, Msg>(
    props: ComboboxMultiProps<Item, Value, Msg>,
    h: HtmlBuilder<Msg>,
  ) => Html;
}>;

/** Multi-select combobox matching shadcn's `Combobox multiple`: selection
 *  stays open after each pick and the parent toggles value membership from
 *  the `Selected` OutMessage. `autoHighlight` activates the first matching
 *  item while typing, like base-ui's autoHighlight. */
export const createMulti = <Value extends string = string>(
  config?: Readonly<{ autoHighlight?: boolean }>,
): ComboboxMultiBundle<Value> => {
  const primitive = ComboboxPrimitive.Multi.create<Value>();
  const update = (model: MultiModel, message: Message) => {
    const next = primitive.update(model, message);
    const typedModel =
      message._tag === 'UpdatedInputValue' && config?.autoHighlight !== true
        ? { ...next.model, maybeActiveItemIndex: Option.none() }
        : next.model;
    return { ...next, model: typedModel };
  };
  const comboboxMulti = <Item, Msg>(
    props: ComboboxMultiProps<Item, Value, Msg>,
    h: HtmlBuilder<Msg>,
  ): Html => {
    const hc = h;
    const query = props.model.inputValue.trim().toLocaleLowerCase();
    const values = props.items
      .filter(
        (item) =>
          query === '' ||
          (props.itemToConfig?.(item).searchText ?? props.itemToLabel(item))
            .toLocaleLowerCase()
            .includes(query),
      )
      .map(props.itemToValue);
    const viewInputs: ComboboxPrimitive.Multi.ViewInputs<Value> = {
      ...buildBaseViewInputs(props, values, '', hc),
      selectedValues: props.selectedValues,
    };
    return h.submodel({
      slotId: props.model.id,
      model: props.model,
      view: primitive.view,
      viewInputs,
      toParentMessage: props.toParentMessage,
    });
  };
  return { update, comboboxMulti };
};

const StringCombobox = create<string>();
export const update = StringCombobox.update;
export const combobox = StringCombobox.combobox;

/*
   Minimal wiring:

   type Framework = Readonly<{ value: 'foldkit' | 'elm'; label: string }>
   const FrameworkCombobox = create<Framework['value']>()

   // Model: { frameworkCombobox: Model }
   // Message: GotFrameworkComboboxMessage({ message: Message })
   // Init: frameworkCombobox: init({ id: 'framework', isAnimated: true })
   //
   // Update:
   // const frameworkComboboxOp__ = //   FrameworkCombobox.update(model.frameworkCombobox, message);
    const frameworkCombobox = frameworkComboboxOp__.model;
    const commands = frameworkComboboxOp__.commands ?? [];
    const maybeOutMessage = Option.fromNullishOr(frameworkComboboxOp__.outMessage);
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
