import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

export const Model = Schema.Struct({
  id: Schema.String,
  maybeFocusedKey: Schema.Option(Schema.String),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  MovedFocus: { key: Schema.String },
  FocusedItem: { key: Schema.String },
  BlurredItem: { key: Schema.String },
  CompletedFocusItem: {},
})
export type Message = typeof Message.Type

export const init = (config: Readonly<{ id: string }>): Model => ({
  id: config.id,
  maybeFocusedKey: Option.none(),
})

export const itemId = (id: string, key: string): string => `${id}-item-${key}`

const itemSelector = (id: string, key: string): string =>
  `[id="${itemId(id, key).replace(
    /["\\\n\r\f]/gu,
    character => `\\${character.charCodeAt(0).toString(16)} `,
  )}"]`

export const FocusItem = Command.define('FocusItem', {
  args: { id: Schema.String, key: Schema.String },
  messages: [Message.CompletedFocusItem],
  execute: ({ id, key }) =>
    Dom.focus(itemSelector(id, key)).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedFocusItem()),
    ),
})

export const focus = (
  model: Model,
  key: string,
): Update.Return<Model, Message> => ({
  model: { ...model, maybeFocusedKey: Option.some(key) },
  commands: [FocusItem({ id: model.id, key })],
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  Message.match<Update.Return<Model, Message>>(message, {
    MovedFocus: ({ key }) => focus(model, key),
    FocusedItem: ({ key }) => ({
      model: { ...model, maybeFocusedKey: Option.some(key) },
    }),
    BlurredItem: ({ key }) => ({
      model: Option.contains(model.maybeFocusedKey, key)
        ? { ...model, maybeFocusedKey: Option.none() }
        : model,
    }),
    CompletedFocusItem: () => ({ model }),
  })

export const Orientation = Schema.Literals(['Horizontal', 'Vertical', 'Both'])
export type Orientation = typeof Orientation.Type

export const Direction = Schema.Literals(['ltr', 'rtl'])
export type Direction = typeof Direction.Type

type Items<Key> = Readonly<{
  keys: ReadonlyArray<Key>
  isDisabled?: (key: Key, index: number) => boolean
  isFocusable?: (key: Key, index: number) => boolean
  focusDisabledWithArrows?: boolean
}>

export type NavigationInput<Key> = Items<Key> &
  Readonly<{
    currentKey: Key | undefined
    pressedKey: string
    orientation?: Orientation
    direction?: Direction
    loop?: boolean
  }>

type NavigationIntent = 'First' | 'Last' | 'Next' | 'Previous'

export const navigationIntent = ({
  pressedKey,
  orientation = 'Horizontal',
  direction = 'ltr',
}: Pick<
  NavigationInput<never>,
  'pressedKey' | 'orientation' | 'direction'
>): Option.Option<NavigationIntent> => {
  if (pressedKey === 'Home') return Option.some('First')
  if (pressedKey === 'End') return Option.some('Last')

  const horizontal = orientation !== 'Vertical'
  const vertical = orientation !== 'Horizontal'
  const forward =
    (horizontal &&
      pressedKey === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')) ||
    (vertical && pressedKey === 'ArrowDown')
  const backward =
    (horizontal &&
      pressedKey === (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft')) ||
    (vertical && pressedKey === 'ArrowUp')
  if (forward) return Option.some('Next')
  if (backward) return Option.some('Previous')
  return Option.none()
}

export const navigate = <Key>(
  input: NavigationInput<Key>,
): Option.Option<Key> => {
  const { keys, currentKey, loop = true, isDisabled = () => false } = input
  const maybeIntent = navigationIntent(input)
  if (Option.isNone(maybeIntent) || keys.length === 0) return Option.none()
  const intent = maybeIntent.value
  const step = intent === 'First' || intent === 'Next' ? 1 : -1
  const boundary = step === 1 ? -1 : keys.length
  const currentIndex = currentKey === undefined ? -1 : keys.indexOf(currentKey)
  const edge = intent === 'First' || intent === 'Last'
  const start = edge || currentIndex < 0 ? boundary : currentIndex
  for (let distance = 1; distance <= keys.length; distance++) {
    const index = start + distance * step
    if ((!loop || edge) && (index < 0 || index >= keys.length))
      return Option.none()
    const wrappedIndex = ((index % keys.length) + keys.length) % keys.length
    const key = keys[wrappedIndex]
    if (
      key !== undefined &&
      (input.isFocusable?.(key, wrappedIndex) ?? true) &&
      ((!edge && input.focusDisabledWithArrows) ||
        !isDisabled(key, wrappedIndex))
    )
      return Option.some(key)
  }
  return Option.none()
}

export type ItemInfo<Key extends string> = Readonly<{
  key: Key
  index: number
  isTabStop: boolean
  isDisabled: boolean
  attributes: ReadonlyArray<ChildAttribute>
}>

type TabStopInput<Key> = Items<Key> &
  Readonly<{
    preferredKey?: Key
  }>

export const tabStop = <Key extends string>(
  model: Model,
  inputs: TabStopInput<Key>,
): Key | undefined => {
  const focusable = inputs.keys.filter(
    (key, index) => inputs.isFocusable?.(key, index) ?? true,
  )
  const enabled = inputs.keys.filter(
    (key, index) =>
      (inputs.isFocusable?.(key, index) ?? true) &&
      !inputs.isDisabled?.(key, index),
  )
  const candidates =
    enabled.length || !inputs.focusDisabledWithArrows ? enabled : focusable
  return (
    candidates.find(key => Option.contains(model.maybeFocusedKey, key)) ??
    candidates.find(key => key === inputs.preferredKey) ??
    candidates[0]
  )
}

export type ViewInputs<Key extends string = string> = TabStopInput<Key> &
  Readonly<{
    orientation?: Orientation
    direction?: Direction
    loop?: boolean
    remember?: boolean
    toView: (items: ReadonlyArray<ItemInfo<Key>>) => Html
  }>

export type Bundle<Key extends string = string> = Readonly<{
  view: SubmodelView<Model, Message, ViewInputs<Key>>
  update: typeof update
}>

export const create = <Key extends string = string>(): Bundle<Key> => ({
  update,
  view: defineView<Model, Message, ViewInputs<Key>>((model, inputs, h) => {
    const isDisabled = inputs.isDisabled ?? (() => false)
    const isFocusable = inputs.isFocusable ?? (() => true)
    const stop = tabStop(model, inputs)
    return inputs.toView(
      inputs.keys.map((key, index) => ({
        key,
        index,
        isTabStop: key === stop,
        isDisabled: isDisabled(key, index),
        attributes: childAttributes([
          h.Id(itemId(model.id, key)),
          h.Tabindex(key === stop ? 0 : -1),
          h.OnFocus(Message.FocusedItem({ key })),
          ...(inputs.remember === false
            ? [h.OnBlur(Message.BlurredItem({ key }))]
            : []),
          h.OnKeyDownPreventDefault(pressedKey =>
            !isFocusable(key, index) ||
            (isDisabled(key, index) && !inputs.focusDisabledWithArrows)
              ? Option.none()
              : navigate({
                  ...inputs,
                  currentKey: key,
                  pressedKey,
                }).pipe(
                  Option.map(target => Message.MovedFocus({ key: target })),
                ),
          ),
        ]),
      })),
    )
  }),
})

export const view = create().view
