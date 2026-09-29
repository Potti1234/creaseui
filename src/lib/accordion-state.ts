import type { Update } from 'foldkit'
import { Option, Schema as S } from 'effect'
import type { Command } from 'foldkit'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/**
 * Skin-neutral Accordion behavior shared by every Crease renderer.
 *
 * Item definitions remain per-render inputs. The Model stores only stable
 * open values, so inserting or reordering items never moves interaction state
 * to another item.
 */

export const AccordionType = S.Literals(['single', 'multiple'])
export type AccordionType = typeof AccordionType.Type

export const Model = S.Struct({
  id: S.String,
  type: AccordionType,
  value: S.Array(S.String),
})
export type Model = typeof Model.Type



export const Message = defineMessageUnion({
  ToggledItem: {
  value: S.String,
  isOpen: S.Boolean,
},
  /**
   * A Space keydown landed on an item's trigger and was consumed: the default
   * is suppressed so the browser neither scrolls nor arms the native
   * keyup→click activation. The toggle itself is dispatched on Space keyup,
   * matching Base UI's activation timing. The update ignores this message.
   */
  PressedSpaceOnItem: {
  value: S.String,
},
});
export type Message = typeof Message.Type



export const OutMessage = defineMessageUnion({
  ChangedValue: {
  value: S.Array(S.String),
  toggledValue: S.String,
  isOpen: S.Boolean,
},
});
export type OutMessage = typeof OutMessage.Type

/** @deprecated Prefer `InitConfig.value`. Retained for registry compatibility. */
export type AccordionInitItem = Readonly<{
  value: string
  isOpen?: boolean
}>

export type InitConfig = Readonly<{
  id: string
  type?: AccordionType
  /** Stable values that start open. */
  value?: ReadonlyArray<string>
  /** @deprecated Use `value`. */
  items?: ReadonlyArray<AccordionInitItem>
}>

export type AccordionItem = Readonly<{
  value: string
  trigger: Html | string
  content: Html | string
  isDisabled?: boolean
}>

const normalizeValue = (
  type: AccordionType,
  value: ReadonlyArray<string>,
): ReadonlyArray<string> => {
  const unique = [...new Set(value)]
  return type === 'single' ? unique.slice(0, 1) : unique
}

export const init = (config: InitConfig): Model => {
  const type = config.type ?? 'single'
  const initialValue =
    config.value ??
    config.items
      ?.filter((item) => item.isOpen === true)
      .map((item) => item.value) ??
    []

  return {
    id: config.id,
    type,
    value: [...normalizeValue(type, initialValue)],
  }
}

/**
 * Conforms externally-owned open values without emitting an OutMessage.
 * Useful for route, storage, and domain-state reflection.
 */
export const reflect = (model: Model, value: ReadonlyArray<string>): Model => ({
  ...model,
  value: [...normalizeValue(model.type, value)],
})

export type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag === 'PressedSpaceOnItem') {
    return { model }
  }

  const value = message.isOpen
    ? model.type === 'single'
      ? [message.value]
      : [...normalizeValue('multiple', [...model.value, message.value])]
    : model.value.filter((currentValue) => currentValue !== message.value)

  return { model: { ...model, value }, outMessage: OutMessage.ChangedValue({
        value,
        toggledValue: message.value,
        isOpen: message.isOpen,
      }), }
}

/**
 * The DOM id every renderer gives an item's Disclosure root; the primitive
 * derives `<domId>-button` / `<domId>-panel` part ids from it.
 */
export const itemDomId = (accordionId: string, value: string): string =>
  `${accordionId}-item-${encodeURIComponent(value)}`

/**
 * Base UI's shared item state hooks: `data-index`, `data-open`/`data-closed`,
 * and `data-disabled`. Stamped on the item, header, and panel elements.
 */
export const itemStateAttributes = <Msg>(args: Readonly<{
  h: HtmlBuilder<Msg>
  item: AccordionItem
  index: number
  isOpen: boolean
}>): ReadonlyArray<Attribute<Msg>> => {
  const { h, item, index, isOpen } = args
  return [
    h.DataAttribute('index', String(index)),
    h.DataAttribute(isOpen ? 'open' : 'closed', ''),
    ...(item.isDisabled === true ? [h.DataAttribute('disabled', '')] : []),
  ]
}

/**
 * Normalizes the Disclosure `button` bundle to the Base UI Accordion.Trigger
 * contract, shared by every renderer so the skins cannot drift:
 *
 *  - `data-panel-open` replaces the primitive's `data-open` on the trigger;
 *  - `data-index` is stamped for positional styling;
 *  - a disabled trigger carries the native `disabled` attribute and leaves
 *    the tab order (the primitive's `aria-disabled` + `tabIndex` are dropped);
 *  - Enter still activates on keydown, while Space activates on keyup — the
 *    keydown is consumed through {@link Message.PressedSpaceOnItem} so the
 *    browser default (page scroll and the native keyup→click) is suppressed
 *    without toggling.
 */
export const triggerAttributes = <Msg>(
  button: ReadonlyArray<Attribute<Msg>>,
  args: Readonly<{
    h: HtmlBuilder<Msg>
    item: AccordionItem
    index: number
    isOpen: boolean
    toMessage: (message: Message) => Msg
  }>,
): ReadonlyArray<Attribute<Msg>> => {
  const { h, item, index, isOpen, toMessage } = args
  const isDisabled = item.isDisabled === true
  const toggle = (): Msg =>
    toMessage(Message.ToggledItem({ value: item.value, isOpen: !isOpen }))
  return [
    ...button.filter(
      (attribute) =>
        attribute._tag !== 'OnKeyDownPreventDefault' &&
        attribute._tag !== 'AriaDisabled' &&
        !(attribute._tag === 'DataAttribute' && attribute.key === 'open') &&
        !(isDisabled && attribute._tag === 'Tabindex'),
    ),
    ...(isOpen ? [h.DataAttribute('panel-open', '')] : []),
    h.DataAttribute('index', String(index)),
    ...(isDisabled
      ? [h.Attribute('disabled', '')]
      : [
          h.OnKeyDownPreventDefault((key) =>
            key === 'Enter'
              ? Option.some(toggle())
              : key === ' '
                ? Option.some(
                    toMessage(
                      Message.PressedSpaceOnItem({ value: item.value }),
                    ),
                  )
                : Option.none(),
          ),
          h.OnKeyUpPreventDefault((key) =>
            key === ' ' ? Option.some(toggle()) : Option.none(),
          ),
        ]),
  ]
}

/**
 * Normalizes the Disclosure `panel` bundle to the Base UI Accordion.Panel
 * contract: `role="region"`, `aria-labelledby` pointing at the trigger, and
 * the shared item state hooks (`data-index`, `data-closed` while closed,
 * `data-disabled`). The bundle's own `data-open` already marks the open panel.
 */
export const panelAttributes = <Msg>(
  panel: ReadonlyArray<Attribute<Msg>>,
  args: Readonly<{
    h: HtmlBuilder<Msg>
    item: AccordionItem
    index: number
    isOpen: boolean
    labelledBy: string
  }>,
): ReadonlyArray<Attribute<Msg>> => {
  const { h, item, index, isOpen, labelledBy } = args
  return [
    ...panel,
    h.Role('region'),
    h.AriaLabelledBy(labelledBy),
    h.DataAttribute('index', String(index)),
    ...(isOpen ? [] : [h.DataAttribute('closed', '')]),
    ...(item.isDisabled === true ? [h.DataAttribute('disabled', '')] : []),
  ]
}
