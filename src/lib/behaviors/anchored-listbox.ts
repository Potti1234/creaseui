import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import type {
  ChildAttribute,
  Html,
  HtmlBuilder,
  KeyboardModifiers,
} from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import { defineView, type View } from 'foldkit/submodel'

import * as Animation from './animation'
import { navigate } from './listbox'
import * as Popup from './popup'
import * as Position from './position'
import * as Typeahead from './typeahead'

export type AnchorConfig = Position.AnchorConfig

const ActivationTrigger = Schema.Literals(['Pointer', 'Keyboard'])
export const Orientation = Schema.Literals(['Vertical', 'Horizontal'])

export const Model = Schema.Struct({
  id: Schema.String,
  isOpen: Schema.Boolean,
  isAnimated: Schema.Boolean,
  isModal: Schema.Boolean,
  orientation: Orientation,
  animation: Animation.Model,
  maybeActiveItemIndex: Schema.Option(Schema.Number),
  activationTrigger: ActivationTrigger,
  searchQuery: Schema.String,
  searchVersion: Schema.Number,
  maybeLastPointerPosition: Schema.Option(
    Schema.Struct({ screenX: Schema.Number, screenY: Schema.Number }),
  ),
  maybeLastButtonPointerType: Schema.Option(Schema.String),
})
export type Model = typeof Model.Type

export type InitConfig = Readonly<{
  id: string
  isAnimated?: boolean
  isModal?: boolean
  orientation?: typeof Orientation.Type
}>

export const buttonId = (id: string) => id + '-button'
export const itemsId = (id: string) => id + '-items'
export const itemId = (id: string, index: number) => id + '-item-' + index
const selector = (id: string) => '#' + CSS.escape(id)

export const init = (config: InitConfig): Model => ({
  id: config.id,
  isOpen: false,
  isAnimated: config.isAnimated ?? false,
  isModal: config.isModal ?? false,
  orientation: config.orientation ?? 'Vertical',
  animation: Animation.init({ id: itemsId(config.id) }),
  maybeActiveItemIndex: Option.none(),
  activationTrigger: 'Keyboard',
  searchQuery: '',
  searchVersion: 0,
  maybeLastPointerPosition: Option.none(),
  maybeLastButtonPointerType: Option.none(),
})

export const Message = defineMessageUnion({
  Opened: { maybeActiveItemIndex: Schema.Option(Schema.Number) },
  Closed: {},
  BlurredItems: {},
  ActivatedItem: { index: Schema.Number, activationTrigger: ActivationTrigger },
  DeactivatedItem: {},
  SelectedItem: { item: Schema.String },
  MovedPointerOverItem: {
    index: Schema.Number,
    screenX: Schema.Number,
    screenY: Schema.Number,
  },
  RequestedItemClick: { index: Schema.Number },
  Searched: {
    key: Schema.String,
    maybeTargetIndex: Schema.Option(Schema.Number),
  },
  CompletedDelayClearSearch: { version: Schema.Number },
  CompletedLockScroll: {},
  CompletedUnlockScroll: {},
  CompletedInertOthers: {},
  CompletedRestoreInert: {},
  CompletedFocusButton: {},
  CompletedFocusItems: {},
  CompletedScrollIntoView: {},
  CompletedClickItem: {},
  IgnoredMouseClick: {},
  SuppressedSpaceScroll: {},
  SuppressedItemCommit: {},
  CompletedAnchorListbox: {},
  CompletedPortalListboxBackdrop: {},
  GotAnimationMessage: { message: Animation.Message },
  PressedPointerOnButton: { pointerType: Schema.String, button: Schema.Number },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Selected: { value: Schema.String },
})
export type OutMessage<Value extends string = string> = Readonly<{
  _tag: 'Selected'
  value: Value
}>

const LockScroll = Command.define('LockScroll', {
  messages: [Message.CompletedLockScroll],
  execute: Dom.lockScroll.pipe(Effect.as(Message.CompletedLockScroll())),
})

const UnlockScroll = Command.define('UnlockScroll', {
  messages: [Message.CompletedUnlockScroll],
  execute: Dom.unlockScroll.pipe(Effect.as(Message.CompletedUnlockScroll())),
})

const InertOthers = Command.define('InertOthers', {
  args: { id: Schema.String },
  messages: [Message.CompletedInertOthers],
  execute: ({ id }) =>
    Dom.inertOthers(id, [selector(buttonId(id)), selector(itemsId(id))]).pipe(
      Effect.as(Message.CompletedInertOthers()),
    ),
})

const RestoreInert = Command.define('RestoreInert', {
  args: { id: Schema.String },
  messages: [Message.CompletedRestoreInert],
  execute: ({ id }) =>
    Dom.restoreInert(id).pipe(Effect.as(Message.CompletedRestoreInert())),
})

export const FocusButton = Command.define('FocusButton', {
  args: { id: Schema.String },
  messages: [Message.CompletedFocusButton],
  execute: ({ id }) =>
    Dom.focus(selector(buttonId(id))).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedFocusButton()),
    ),
})

export const FocusItems = Command.define('FocusItems', {
  args: { id: Schema.String },
  messages: [Message.CompletedFocusItems],
  execute: ({ id }) =>
    Dom.focus(selector(itemsId(id))).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedFocusItems()),
    ),
})

export const ScrollIntoView = Command.define('ScrollIntoView', {
  args: { id: Schema.String, index: Schema.Number },
  messages: [Message.CompletedScrollIntoView],
  execute: ({ id, index }) =>
    Dom.scrollIntoView(selector(itemId(id, index))).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedScrollIntoView()),
    ),
})

export const ClickItem = Command.define('ClickItem', {
  args: { id: Schema.String, index: Schema.Number },
  messages: [Message.CompletedClickItem],
  execute: ({ id, index }) =>
    Dom.clickElement(selector(itemId(id, index))).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedClickItem()),
    ),
})

export const DelayClearSearch = Command.define('DelayClearSearch', {
  args: { version: Schema.Number },
  messages: [Message.CompletedDelayClearSearch],
  execute: ({ version }) =>
    Effect.sleep('350 millis').pipe(
      Effect.as(Message.CompletedDelayClearSearch({ version })),
    ),
})

type Result<Value extends string = string> = Update.ReturnWithOutMessage<
  Model,
  Message,
  OutMessage<Value>
>

const animate = (
  model: Model,
  message: Animation.Message,
): Update.Return<Model, Message> => {
  const result = Animation.update(model.animation, message)
  const commands = [...(result.commands ?? [])]
  if (result.outMessage?._tag === 'StartedLeaveAnimating')
    commands.push(Animation.defaultLeaveCommand(result.model))
  return {
    model: { ...model, animation: result.model },
    commands: Command.mapMessages(commands, message =>
      Message.GotAnimationMessage({ message }),
    ),
  }
}

const changeOpen = (
  model: Model,
  isOpen: boolean,
  restoreFocus: boolean,
  maybeActiveItemIndex = Option.none<number>(),
): Update.Return<Model, Message> => {
  const change = Popup.update(
    Popup.init({ defaultOpen: model.isOpen }),
    isOpen
      ? Popup.Message.RequestedOpen({ reason: 'trigger-press' })
      : Popup.Message.RequestedClose({ reason: 'close-press' }),
  )
  if (!change.outMessage) return { model }

  const { id } = model
  const next: Model = {
    ...model,
    isOpen: change.model.isOpen,
    maybeActiveItemIndex,
    activationTrigger: Option.isSome(maybeActiveItemIndex)
      ? 'Keyboard'
      : 'Pointer',
    searchQuery: '',
    maybeLastPointerPosition: Option.none(),
    maybeLastButtonPointerType: Option.none(),
  }
  const result = model.isAnimated
    ? animate(
        next,
        isOpen ? Animation.Message.Showed() : Animation.Message.Hid(),
      )
    : { model: next }
  const commands = isOpen
    ? [
        ...(model.isModal ? [LockScroll(), InertOthers({ id })] : []),
        FocusItems({ id }),
      ]
    : [
        ...(model.isModal ? [UnlockScroll(), RestoreInert({ id })] : []),
        ...(restoreFocus ? [FocusButton({ id })] : []),
      ]
  return {
    model: result.model,
    commands: [...commands, ...(result.commands ?? [])],
  }
}

const updateFor =
  <Value extends string>(multiple: boolean) =>
  (model: Model, message: Message): Result<Value> => {
    const { id } = model
    switch (message._tag) {
      case 'Opened':
        return changeOpen(model, true, false, message.maybeActiveItemIndex)
      case 'Closed':
        return changeOpen(model, false, true)
      case 'BlurredItems':
        return Option.contains(model.maybeLastButtonPointerType, 'mouse')
          ? { model }
          : changeOpen(model, false, false)
      case 'PressedPointerOnButton': {
        const { pointerType, button } = message
        const next =
          pointerType === 'mouse' && button === 0
            ? changeOpen(model, !model.isOpen, model.isOpen)
            : { model }
        return {
          ...next,
          model: {
            ...next.model,
            maybeLastButtonPointerType: Option.some(pointerType),
          },
        }
      }
      case 'IgnoredMouseClick':
        return {
          model: { ...model, maybeLastButtonPointerType: Option.none() },
        }
      case 'ActivatedItem':
        return {
          model: {
            ...model,
            maybeActiveItemIndex: Option.some(message.index),
            activationTrigger: message.activationTrigger,
          },
          ...(message.activationTrigger === 'Keyboard'
            ? { commands: [ScrollIntoView({ id, index: message.index })] }
            : {}),
        }
      case 'DeactivatedItem':
        return model.activationTrigger === 'Pointer'
          ? { model: { ...model, maybeActiveItemIndex: Option.none() } }
          : { model }
      case 'MovedPointerOverItem': {
        const { index, screenX, screenY } = message
        if (
          Option.exists(
            model.maybeLastPointerPosition,
            previous =>
              previous.screenX === screenX && previous.screenY === screenY,
          )
        )
          return { model }
        return {
          model: {
            ...model,
            maybeActiveItemIndex: Option.some(index),
            activationTrigger: 'Pointer',
            maybeLastPointerPosition: Option.some({ screenX, screenY }),
          },
        }
      }
      case 'SelectedItem': {
        const next = multiple ? { model } : changeOpen(model, false, true)
        return {
          ...next,
          outMessage: { _tag: 'Selected', value: message.item as Value },
        }
      }
      case 'RequestedItemClick':
        return { model, commands: [ClickItem({ id, index: message.index })] }
      case 'Searched': {
        const version = model.searchVersion + 1
        return {
          model: {
            ...model,
            searchQuery: model.searchQuery + message.key,
            searchVersion: version,
            activationTrigger: 'Keyboard',
            maybeActiveItemIndex: Option.orElse(
              message.maybeTargetIndex,
              () => model.maybeActiveItemIndex,
            ),
          },
          commands: [DelayClearSearch({ version })],
        }
      }
      case 'CompletedDelayClearSearch':
        return message.version === model.searchVersion
          ? { model: { ...model, searchQuery: '' } }
          : { model }
      case 'GotAnimationMessage':
        return animate(model, message.message)
      default:
        return { model }
    }
  }

export const AnchorListbox = Mount.define('AnchorListbox', {
  args: { buttonId: Schema.String, anchor: Position.AnchorConfig },
  messages: [Message.CompletedAnchorListbox],
  execute: ({ element, buttonId, anchor }) =>
    Effect.acquireRelease(
      Effect.sync(() =>
        Position.bindAnchor(element, {
          buttonId,
          anchor,
          focusAfterPosition: true,
        }),
      ),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedAnchorListbox())),
})

export const PortalListboxBackdrop = Mount.define('PortalListboxBackdrop', {
  messages: [Message.CompletedPortalListboxBackdrop],
  execute: ({ element }) =>
    Effect.acquireRelease(
      Effect.sync(() => Position.portalBackdrop(element)),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.CompletedPortalListboxBackdrop())),
})

export type MultiViewInputs<Value extends string> = Readonly<{
  items: ReadonlyArray<Value>
  selectedValues: ReadonlyArray<Value>
  itemToValue?: (item: Value) => Value
  itemToConfig: (
    item: Value,
    state: Readonly<{
      isActive: boolean
      isDisabled: boolean
      isReadOnly: boolean
      isSelected: boolean
    }>,
  ) => Readonly<{ content: Html; className?: string }>
  isItemDisabled?: (item: Value, index: number) => boolean
  itemToSearchText?: (item: Value, index: number) => string
  isButtonDisabled?: boolean
  buttonContent: Html
  buttonClassName?: string
  buttonAttributes?: ReadonlyArray<ChildAttribute>
  itemsClassName?: string
  itemsAttributes?: ReadonlyArray<ChildAttribute>
  itemsScrollClassName?: string
  itemsScrollAttributes?: ReadonlyArray<ChildAttribute>
  backdropClassName?: string
  backdropAttributes?: ReadonlyArray<ChildAttribute>
  className?: string
  attributes?: ReadonlyArray<ChildAttribute>
  itemGroupKey?: (item: Value, index: number) => string
  groupToHeading?: (
    key: string,
  ) => Readonly<{ content: Html; className?: string }> | undefined
  groupClassName?: string
  groupAttributes?: ReadonlyArray<ChildAttribute>
  separatorClassName?: string
  separatorAttributes?: ReadonlyArray<ChildAttribute>
  anchor?: AnchorConfig
  hasCustomAnchor?: boolean
  name?: string
  form?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
}>

export type ViewInputs<Value extends string> = Omit<
  MultiViewInputs<Value>,
  'selectedValues'
> &
  Readonly<{
    maybeSelectedValue: Option.Option<Value>
  }>

type Decorated = Readonly<{
  className?: string
  attributes?: ReadonlyArray<ChildAttribute>
}>

const render = <Value extends string>(
  model: Model,
  props: MultiViewInputs<Value>,
  h: HtmlBuilder<Message>,
  multiple: boolean,
): Html => {
  const { id, isOpen, orientation, searchQuery, maybeLastButtonPointerType } =
    model
  const {
    items,
    selectedValues,
    isReadOnly = false,
    itemToValue = item => item,
  } = props
  const phase = model.animation.transitionState
  const leaving = phase === 'LeaveStart' || phase === 'LeaveAnimating'
  const entering = phase === 'EnterStart' || phase === 'EnterAnimating'
  const visible = isOpen || leaving
  const disabled = props.isDisabled || props.isButtonDisabled
  const triggerId = buttonId(id)
  const panelId = itemsId(id)
  const values = items.map(itemToValue)
  const isDisabled = (item: Value, index: number) =>
    props.isItemDisabled?.(item, index) ?? false
  const isDisabledKey = (_value: string, index: number) => {
    const item = items[index]
    return item === undefined || isDisabled(item, index)
  }
  const activeIndex = Option.filter(
    model.maybeActiveItemIndex,
    index => !isDisabledKey('', index),
  )
  const keys = items.map((_, index) => String(index))
  const targetIndex = (key: string) =>
    Option.map(
      navigate({
        keys,
        currentKey: Option.getOrUndefined(Option.map(activeIndex, String)),
        pressedKey:
          key === 'PageUp' ? 'Home' : key === 'PageDown' ? 'End' : key,
        isDisabled: isDisabledKey,
      }),
      Number,
    )
  const optionId = (index: number) => itemId(id, index)
  const mouse = Option.contains(maybeLastButtonPointerType, 'mouse')
  const optionalClass = (name: string | undefined) =>
    name ? [h.Class(name)] : []
  const decorated = (style: Decorated) => [
    ...optionalClass(style.className),
    ...(style.attributes ?? []),
  ]
  const itemKey = (
    key: string,
    modifiers: KeyboardModifiers,
  ): Option.Option<Message> => {
    if (key === 'Escape') return Option.some(Message.Closed())
    if (key === 'Enter' || (key === ' ' && searchQuery === ''))
      return Option.map(activeIndex, index =>
        isReadOnly
          ? Message.SuppressedItemCommit()
          : Message.RequestedItemClick({ index }),
      )
    if (orientation === 'Horizontal') {
      if (key === 'ArrowDown' || key === 'ArrowUp') return Option.none()
      if (key === 'ArrowRight') key = 'ArrowDown'
      if (key === 'ArrowLeft') key = 'ArrowUp'
    }
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown'].includes(
        key,
      )
    )
      return Option.map(targetIndex(key), index =>
        Message.ActivatedItem({ index, activationTrigger: 'Keyboard' }),
      )
    if (!Typeahead.isTypeaheadKey(key, modifiers)) return Option.none()
    const normalized =
      Typeahead.normalize(searchQuery) +
      searchQuery.slice(searchQuery.trimEnd().length)
    const search = Typeahead.search(
      {
        ...Typeahead.init(),
        query: normalized,
        lastKey: normalized.at(-1) ?? '',
        isStepping: /^(.)(\1)+$/.test(normalized),
      },
      {
        key,
        labels: items.map(
          (item, index) =>
            props.itemToSearchText?.(item, index) ?? itemToValue(item),
        ),
        currentIndex: Option.getOrElse(activeIndex, () => -1),
        isDisabled: index => isDisabledKey('', index),
      },
    )
    return Option.some(
      Message.Searched({ key, maybeTargetIndex: search.maybeIndex }),
    )
  }
  const triggerKey = (
    key: string,
    modifiers: KeyboardModifiers,
  ): Option.Option<Message> => {
    if (isOpen) return itemKey(key, modifiers)
    if (!['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key))
      return Option.none()
    const selected = values.findIndex(
      (value, index) =>
        selectedValues.includes(value) && !isDisabledKey(value, index),
    )
    return Option.some(
      Message.Opened({
        maybeActiveItemIndex:
          selected < 0
            ? targetIndex(key === 'ArrowUp' ? 'last' : 'first')
            : Option.some(selected),
      }),
    )
  }
  const spaceUp = (key: string) =>
    key === ' ' ? Option.some(Message.SuppressedSpaceScroll()) : Option.none()
  const flags = [
    ...(visible ? [h.DataAttribute('open', '')] : []),
    ...(props.isDisabled ? [h.DataAttribute('disabled', '')] : []),
    ...(isReadOnly ? [h.DataAttribute('readonly', '')] : []),
    ...(props.isInvalid ? [h.DataAttribute('invalid', '')] : []),
  ]
  const button = h.keyed('button')(
    triggerId,
    [
      h.Id(triggerId),
      h.Type('button'),
      h.AriaHasPopup('listbox'),
      h.AriaExpanded(visible),
      ...(visible
        ? [
            h.AriaControls(panelId),
            h.Style({ position: 'relative', zIndex: '1' }),
          ]
        : []),
      ...(props.ariaLabel !== undefined
        ? [h.AriaLabel(props.ariaLabel)]
        : props.ariaLabelledBy !== undefined
          ? [h.AriaLabelledBy(props.ariaLabelledBy)]
          : []),
      ...flags,
      ...(disabled
        ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
        : [
            h.OnPointerDown((pointerType, button) =>
              Option.some(
                Message.PressedPointerOnButton({ pointerType, button }),
              ),
            ),
            h.OnKeyDownPreventDefault(triggerKey),
            h.OnKeyUpPreventDefault(spaceUp),
            h.OnClick(
              mouse
                ? Message.IgnoredMouseClick()
                : isOpen
                  ? Message.Closed()
                  : Message.Opened({ maybeActiveItemIndex: Option.none() }),
            ),
          ]),
      ...optionalClass(props.buttonClassName),
      ...(props.buttonAttributes ?? []),
    ],
    [props.buttonContent],
  )
  const hiddenInputs =
    props.name === undefined
      ? []
      : (selectedValues.length > 0 ? selectedValues : [undefined]).map(value =>
          h.input([
            h.Type('hidden'),
            h.Name(props.name!),
            ...(props.form ? [h.Attribute('form', props.form)] : []),
            ...(value === undefined ? [] : [h.Value(value)]),
          ]),
        )
  const wrapper = [...decorated(props), ...flags]
  if (!visible) return h.div(wrapper, [button, ...hiddenInputs])

  const options = items.map((item, index) => {
    const value = itemToValue(item)
    const selected = selectedValues.includes(value)
    const active = Option.contains(activeIndex, index)
    const disabled = isDisabled(item, index)
    const config = props.itemToConfig(item, {
      isSelected: selected,
      isActive: active,
      isDisabled: disabled,
      isReadOnly,
    })
    const hoverable = !disabled && isOpen
    return h.keyed('div')(
      id + '-option-' + value,
      [
        h.Id(optionId(index)),
        h.Role('option'),
        h.AriaSelected(selected),
        ...(active ? [h.DataAttribute('active', '')] : []),
        ...(selected ? [h.DataAttribute('selected', '')] : []),
        ...(disabled
          ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')]
          : []),
        ...(isReadOnly ? [h.DataAttribute('readonly', '')] : []),
        ...(hoverable && !isReadOnly
          ? [h.OnClick(Message.SelectedItem({ item: value }))]
          : []),
        ...(hoverable
          ? [
              h.OnPointerMove((screenX, screenY, pointerType) =>
                pointerType === 'touch' || active
                  ? Option.none()
                  : Option.some(
                      Message.MovedPointerOverItem({
                        index,
                        screenX,
                        screenY,
                      }),
                    ),
              ),
              h.OnPointerLeave(pointerType =>
                pointerType === 'touch'
                  ? Option.none()
                  : Option.some(Message.DeactivatedItem()),
              ),
            ]
          : []),
        ...optionalClass(config.className),
      ],
      [config.content],
    )
  })
  const groups: Array<{ key: string; children: Html[] }> = []
  if (props.itemGroupKey) {
    items.forEach((item, index) => {
      const key = props.itemGroupKey!(item, index)
      const last = groups.at(-1)
      if (last?.key === key) last.children.push(options[index]!)
      else groups.push({ key, children: [options[index]!] })
    })
  }
  const seenGroups = new Set<string>()
  const children = props.itemGroupKey
    ? groups.flatMap(({ key, children }, index) => {
        const heading = props.groupToHeading?.(key)
        const groupId = id + '-group-' + index
        const headingId =
          id + '-heading-' + key + (seenGroups.has(key) ? '-' + index : '')
        seenGroups.add(key)
        return [
          ...(index > 0 &&
          (props.separatorClassName || props.separatorAttributes?.length)
            ? [
                h.keyed('div')(groupId + '-separator', [
                  h.Role('separator'),
                  ...optionalClass(props.separatorClassName),
                  ...(props.separatorAttributes ?? []),
                ]),
              ]
            : []),
          h.keyed('div')(
            groupId,
            [
              h.Role('group'),
              ...(heading ? [h.AriaLabelledBy(headingId)] : []),
              ...optionalClass(props.groupClassName),
              ...(props.groupAttributes ?? []),
            ],
            [
              ...(heading
                ? [
                    h.div(
                      [
                        h.Id(headingId),
                        h.Role('presentation'),
                        ...optionalClass(heading.className),
                      ],
                      [heading.content],
                    ),
                  ]
                : []),
              ...children,
            ],
          ),
        ]
      })
    : options
  const scrolling =
    props.itemsScrollClassName || props.itemsScrollAttributes?.length
  const panel = h.keyed('div')(
    panelId,
    [
      h.Id(panelId),
      h.Role('listbox'),
      h.AriaOrientation(
        orientation === 'Horizontal' ? 'horizontal' : 'vertical',
      ),
      h.AriaLabelledBy(triggerId),
      ...(multiple ? [h.AriaMultiSelectable(true)] : []),
      ...(isReadOnly
        ? [h.AriaReadonly(true), h.DataAttribute('readonly', '')]
        : []),
      ...Option.match(activeIndex, {
        onNone: () => [],
        onSome: index => [h.AriaActiveDescendant(optionId(index))],
      }),
      h.Tabindex(-1),
      h.Style({ position: 'absolute', margin: '0', visibility: 'hidden' }),
      ...(props.hasCustomAnchor
        ? []
        : [
            h.OnMount(
              AnchorListbox({
                buttonId: triggerId,
                anchor: props.anchor ?? {},
              }),
            ),
          ]),
      ...(phase === 'EnterStart' || phase === 'LeaveAnimating'
        ? [h.DataAttribute('closed', '')]
        : []),
      ...(entering ? [h.DataAttribute('enter', '')] : []),
      ...(leaving ? [h.DataAttribute('leave', '')] : []),
      ...(phase !== 'Idle' ? [h.DataAttribute('transition', '')] : []),
      ...(isOpen
        ? [
            h.OnKeyDownPreventDefault(itemKey),
            h.OnKeyUpPreventDefault(spaceUp),
            h.OnBlur(Message.BlurredItems()),
          ]
        : []),
      ...optionalClass(props.itemsClassName),
      ...(props.itemsAttributes ?? []),
    ],
    scrolling
      ? [
          h.div(
            [
              ...optionalClass(props.itemsScrollClassName),
              ...(props.itemsScrollAttributes ?? []),
            ],
            children,
          ),
        ]
      : children,
  )
  const backdrop = h.keyed('div')(id + '-backdrop', [
    h.OnMount(PortalListboxBackdrop()),
    ...(isOpen ? [h.OnClick(Message.Closed())] : []),
    ...optionalClass(props.backdropClassName),
    ...(props.backdropAttributes ?? []),
  ])
  return h.div(wrapper, [button, ...hiddenInputs, backdrop, panel])
}

export type Bundle<Value extends string> = Readonly<{
  view: View<Model, Message, ViewInputs<Value>>
  update: (model: Model, message: Message) => Result<Value>
}>

export const create = <Value extends string = string>(): Bundle<Value> => ({
  update: updateFor<Value>(false),
  view: defineView<Model, Message, ViewInputs<Value>>((model, props, h) =>
    render(
      model,
      { ...props, selectedValues: Option.toArray(props.maybeSelectedValue) },
      h,
      false,
    ),
  ),
})

export const createMulti = <Value extends string>() => ({
  update: updateFor<Value>(true),
  view: defineView<Model, Message, MultiViewInputs<Value>>((model, props, h) =>
    render(model, props, h, true),
  ),
})
