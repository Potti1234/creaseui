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

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  Message.match<Update.Return<Model, Message>>(message, {
    MovedFocus: ({ key }) => ({
      model: { ...model, maybeFocusedKey: Option.some(key) },
      commands: [FocusItem({ id: model.id, key })],
    }),
    FocusedItem: ({ key }) => ({
      model: { ...model, maybeFocusedKey: Option.some(key) },
    }),
    CompletedFocusItem: () => ({ model }),
  })

export const Orientation = Schema.Literals(['Horizontal', 'Vertical', 'Both'])
export type Orientation = typeof Orientation.Type

export const Direction = Schema.Literals(['ltr', 'rtl'])
export type Direction = typeof Direction.Type

export type NavigationInput<Key extends string> = Readonly<{
  keys: ReadonlyArray<Key>
  currentKey: Key
  pressedKey: string
  orientation?: Orientation
  direction?: Direction
  loop?: boolean
  isDisabled?: (key: Key, index: number) => boolean
}>

export const navigate = <Key extends string>({
  keys,
  currentKey,
  pressedKey,
  orientation = 'Horizontal',
  direction = 'ltr',
  loop = true,
  isDisabled = () => false,
}: NavigationInput<Key>): Option.Option<Key> => {
  const enabled = keys.filter((key, index) => !isDisabled(key, index))
  if (pressedKey === 'Home') return Option.fromUndefinedOr(enabled[0])
  if (pressedKey === 'End') return Option.fromUndefinedOr(enabled.at(-1))

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
  if ((!forward && !backward) || keys.length === 0) return Option.none()

  const step = forward ? 1 : -1
  const currentIndex = keys.indexOf(currentKey)
  const start = currentIndex < 0 && backward ? keys.length : currentIndex
  for (let distance = 1; distance <= keys.length; distance++) {
    const index = start + distance * step
    if (!loop && (index < 0 || index >= keys.length)) return Option.none()
    const wrappedIndex = ((index % keys.length) + keys.length) % keys.length
    const key = keys[wrappedIndex]
    if (key !== undefined && !isDisabled(key, wrappedIndex))
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

export type ViewInputs<Key extends string = string> = Readonly<{
  keys: ReadonlyArray<Key>
  orientation?: Orientation
  direction?: Direction
  loop?: boolean
  isDisabled?: (key: Key, index: number) => boolean
  preferredKey?: Key
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
    const enabled = inputs.keys.filter((key, index) => !isDisabled(key, index))
    const tabStop =
      enabled.find(key => Option.contains(model.maybeFocusedKey, key)) ??
      enabled.find(key => key === inputs.preferredKey) ??
      enabled[0]
    return inputs.toView(
      inputs.keys.map((key, index) => ({
        key,
        index,
        isTabStop: key === tabStop,
        isDisabled: isDisabled(key, index),
        attributes: childAttributes([
          h.Id(itemId(model.id, key)),
          h.Tabindex(key === tabStop ? 0 : -1),
          h.OnFocus(Message.FocusedItem({ key })),
          h.OnKeyDownPreventDefault(pressedKey =>
            isDisabled(key, index)
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
