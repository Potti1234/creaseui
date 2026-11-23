import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

import * as RovingFocus from './roving-focus'

export const Rect = Schema.Struct({
  left: Schema.Number,
  top: Schema.Number,
  right: Schema.Number,
  bottom: Schema.Number,
})
export type Rect = typeof Rect.Type

export const arrowDirection = (
  pressedKey: string,
): Option.Option<readonly [number, number]> => {
  switch (pressedKey) {
    case 'ArrowLeft':
      return Option.some([-1, 0])
    case 'ArrowRight':
      return Option.some([1, 0])
    case 'ArrowUp':
      return Option.some([0, -1])
    case 'ArrowDown':
      return Option.some([0, 1])
    default:
      return Option.none()
  }
}

export const nearestInDirection = <Key extends string>(
  from: Rect,
  candidates: ReadonlyArray<Readonly<{ key: Key; rect: Rect }>>,
  direction: readonly [number, number],
): Option.Option<Key> => {
  const [dx, dy] = direction
  const cx = (from.left + from.right) / 2
  const cy = (from.top + from.bottom) / 2
  let best: Readonly<{ key: Key; score: number; cone: boolean }> | undefined
  for (const { key, rect } of candidates) {
    const x = (rect.left + rect.right) / 2 - cx
    const y = (rect.top + rect.bottom) / 2 - cy
    const ahead = x * dx + y * dy
    if (ahead <= 0) continue
    const aside = Math.abs(dx ? y : x)
    const cone = aside <= ahead
    const score = ahead + aside * 2
    if (
      !best ||
      (cone && !best.cone) ||
      (cone === best.cone && score < best.score)
    )
      best = { key, score, cone }
  }
  return Option.fromUndefinedOr(best?.key)
}

export type NavigationInput<Key extends string> = Readonly<{
  currentKey: Key
  pressedKey: string
  keys: ReadonlyArray<Key>
  rects: ReadonlyMap<Key, Rect>
  isDisabled?: (key: Key, index: number) => boolean
}>

export const spatialTarget = <Key extends string>({
  currentKey,
  pressedKey,
  keys,
  rects,
  isDisabled = () => false,
}: NavigationInput<Key>): Option.Option<Key> => {
  const enabled = keys.filter((key, index) => !isDisabled(key, index))
  if (pressedKey === 'Home') return Option.fromUndefinedOr(enabled[0])
  if (pressedKey === 'End') return Option.fromUndefinedOr(enabled.at(-1))
  const from = rects.get(currentKey)
  const direction = arrowDirection(pressedKey)
  if (!from || Option.isNone(direction)) return Option.none()
  return nearestInDirection(
    from,
    enabled.flatMap(key => {
      const rect = rects.get(key)
      return key !== currentKey && rect ? [{ key, rect }] : []
    }),
    direction.value,
  )
}

export const Model = RovingFocus.Model
export type Model = typeof Model.Type
export const init = RovingFocus.init
export const itemId = RovingFocus.itemId

export const Message = defineMessageUnion({
  RequestedMove: {
    currentKey: Schema.String,
    pressedKey: Schema.String,
    keys: Schema.Array(Schema.String),
  },
  FocusedItem: { key: Schema.String },
  CompletedMove: {},
})
export type Message = typeof Message.Type

export const MoveFocus = Command.define('MoveSpatialFocus', {
  args: {
    id: Schema.String,
    currentKey: Schema.String,
    pressedKey: Schema.String,
    keys: Schema.Array(Schema.String),
  },
  messages: [Message.FocusedItem, Message.CompletedMove],
  execute: ({ id, currentKey, pressedKey, keys }) =>
    Effect.try(() => {
      const elements = new Map(
        keys.flatMap(key => {
          const element = document.getElementById(itemId(id, key))
          return element ? [[key, element] as const] : []
        }),
      )
      const rects = new Map(
        Array.from(elements, ([key, element]) => [
          key,
          element.getBoundingClientRect(),
        ]),
      )
      const target = spatialTarget({ currentKey, pressedKey, keys, rects })
      if (Option.isNone(target)) return Message.CompletedMove()
      const element = elements.get(target.value)
      if (!element) return Message.CompletedMove()
      element.focus()
      return Message.FocusedItem({ key: target.value })
    }).pipe(Effect.catch(() => Effect.succeed(Message.CompletedMove()))),
})

export const FocusItem = Command.define('FocusSpatialItem', {
  args: { id: Schema.String, key: Schema.String },
  messages: [Message.CompletedMove],
  execute: ({ id, key }) =>
    Effect.try(() => {
      document.getElementById(itemId(id, key))?.focus()
      return Message.CompletedMove()
    }).pipe(Effect.catch(() => Effect.succeed(Message.CompletedMove()))),
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
    RequestedMove: ({ currentKey, pressedKey, keys }) => ({
      model,
      commands: [MoveFocus({ id: model.id, currentKey, pressedKey, keys })],
    }),
    FocusedItem: ({ key }) => ({
      model: { ...model, maybeFocusedKey: Option.some(key) },
    }),
    CompletedMove: () => ({ model }),
  })

export type ItemInfo<Key extends string> = Readonly<{
  key: Key
  index: number
  isTabStop: boolean
  isDisabled: boolean
  attributes: ReadonlyArray<ChildAttribute>
}>
export type ViewInputs<Key extends string = string> = Readonly<{
  keys: ReadonlyArray<Key>
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
          h.OnKeyDownPreventDefault((pressedKey, modifiers) =>
            isDisabled(key, index) ||
            modifiers.altKey ||
            modifiers.ctrlKey ||
            modifiers.metaKey ||
            (pressedKey !== 'Home' &&
              pressedKey !== 'End' &&
              Option.isNone(arrowDirection(pressedKey)))
              ? Option.none()
              : Option.some(
                  Message.RequestedMove({
                    currentKey: key,
                    pressedKey,
                    keys: enabled,
                  }),
                ),
          ),
        ]),
      })),
    )
  }),
})

export const view = create().view
