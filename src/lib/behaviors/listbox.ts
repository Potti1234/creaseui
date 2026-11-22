import { Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

import * as RovingFocus from './roving-focus'
import * as Typeahead from './typeahead'

export const Focus = Schema.Literals(['Real', 'Virtual'])
export type Focus = typeof Focus.Type

export const Model = Schema.Struct({
  id: Schema.String,
  maybeHighlightedKey: Schema.Option(Schema.String),
  typeahead: Typeahead.Model,
})
export type Model = typeof Model.Type

export const init = ({ id }: Readonly<{ id: string }>): Model => ({
  id,
  maybeHighlightedKey: Option.none(),
  typeahead: Typeahead.init(),
})

export const Message = defineMessageUnion({
  HighlightedItem: { key: Schema.String },
  MovedHighlight: { key: Schema.String, focus: Focus },
  TypedKey: {
    key: Schema.String,
    keys: Schema.Array(Schema.String),
    labels: Schema.Array(Schema.String),
    disabledKeys: Schema.Array(Schema.String),
    focus: Focus,
  },
  GotTypeaheadMessage: { message: Typeahead.Message },
  CompletedFocusItem: {},
})
export type Message = typeof Message.Type

export const itemId = RovingFocus.itemId
export const activeId = (model: Model): Option.Option<string> =>
  Option.map(model.maybeHighlightedKey, key => itemId(model.id, key))

export const highlight = (model: Model, key: string): Model => ({
  ...model,
  maybeHighlightedKey: Option.some(key),
})

export type Filter<Item> =
  | 'contains'
  | 'startsWith'
  | ((item: Item, query: string) => boolean | number)

export const filter = <Item>(
  items: ReadonlyArray<Item>,
  query: string,
  label: (item: Item) => string,
  mode: Filter<Item> = 'contains',
): ReadonlyArray<Item> => {
  const normalized = Typeahead.normalize(query)
  if (query.trim() === '') return items
  return items
    .map(item => {
      const result =
        typeof mode === 'function'
          ? mode(item, normalized)
          : Typeahead.normalize(label(item))[
              mode === 'contains' ? 'includes' : 'startsWith'
            ](normalized)
      return {
        item,
        score: typeof result === 'number' ? result : result ? 1 : 0,
      }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

export const count = <Item>(
  items: ReadonlyArray<Item>,
  query: string,
  label: (item: Item) => string,
  mode?: Filter<Item>,
): number => filter(items, query, label, mode).length

export type NavigationInput<Key extends string> = Readonly<{
  keys: ReadonlyArray<Key>
  currentKey?: Key | undefined
  pressedKey: string
  focus?: Focus
  homeEnd?: boolean
  pageSize?: number
  loop?: boolean
  isDisabled?: (key: Key, index: number) => boolean
}>

export const navigate = <Key extends string>({
  keys,
  currentKey,
  pressedKey,
  focus = 'Real',
  homeEnd = focus === 'Real',
  pageSize = 10,
  loop = true,
  isDisabled = () => false,
}: NavigationInput<Key>): Option.Option<Key> => {
  const enabled = keys.filter((key, index) => !isDisabled(key, index))
  if (pressedKey === 'first' || (homeEnd && pressedKey === 'Home'))
    return Option.fromUndefinedOr(enabled[0])
  if (pressedKey === 'last' || (homeEnd && pressedKey === 'End'))
    return Option.fromUndefinedOr(enabled.at(-1))
  if (
    !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(pressedKey) ||
    enabled.length === 0
  )
    return Option.none()
  const forward = pressedKey === 'ArrowDown' || pressedKey === 'PageDown'
  const current = enabled.findIndex(key => key === currentKey)
  if (current < 0)
    return Option.fromUndefinedOr(forward ? enabled[0] : enabled.at(-1))
  const distance = pressedKey.startsWith('Page')
    ? Math.max(1, Math.floor(Number.isFinite(pageSize) ? pageSize : 10))
    : 1
  const target = current + (forward ? distance : -distance)
  if (!loop && (target < 0 || target >= enabled.length)) {
    if (distance === 1) return Option.none()
    return Option.fromUndefinedOr(forward ? enabled.at(-1) : enabled[0])
  }
  return Option.fromUndefinedOr(
    enabled[((target % enabled.length) + enabled.length) % enabled.length],
  )
}

const move = (
  model: Model,
  key: string,
  focus: Focus,
): Update.Return<Model, Message> => ({
  model: highlight(model, key),
  commands:
    focus === 'Real'
      ? Command.mapMessages(
          [RovingFocus.FocusItem({ id: model.id, key })],
          () => Message.CompletedFocusItem(),
        )
      : [],
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  Message.match<Update.Return<Model, Message>>(message, {
    HighlightedItem: ({ key }) => ({ model: highlight(model, key) }),
    MovedHighlight: ({ key, focus }) => move(model, key, focus),
    CompletedFocusItem: () => ({ model }),
    GotTypeaheadMessage: ({ message: child }) => ({
      model: {
        ...model,
        typeahead: Typeahead.update(model.typeahead, child).model,
      },
    }),
    TypedKey: ({ key, keys, labels, disabledKeys, focus }) => {
      if (focus !== 'Real') return { model }
      const result = Typeahead.search(model.typeahead, {
        key,
        labels,
        currentIndex: keys.findIndex(candidate =>
          Option.contains(model.maybeHighlightedKey, candidate),
        ),
        isDisabled: index => disabledKeys.includes(keys[index] ?? ''),
      })
      const target = Option.flatMap(result.maybeIndex, index =>
        Option.fromUndefinedOr(keys[index]),
      )
      const moved = Option.match(target, {
        onNone: () =>
          ({ model, commands: [] }) as Update.Return<Model, Message>,
        onSome: targetKey => move(model, targetKey, focus),
      })
      return {
        model: { ...moved.model, typeahead: result.model },
        commands: [
          ...(moved.commands ?? []),
          ...Command.mapMessages(result.commands ?? [], child =>
            Message.GotTypeaheadMessage({ message: child }),
          ),
        ],
      }
    },
  })

export type ItemInfo<Key extends string> = Readonly<{
  key: Key
  index: number
  isHighlighted: boolean
  isDisabled: boolean
  attributes: ReadonlyArray<ChildAttribute>
}>

export type ViewInputs<Key extends string = string> = Omit<
  NavigationInput<Key>,
  'currentKey' | 'pressedKey'
> &
  Readonly<{
    label: (key: Key) => string
    toView: (
      items: ReadonlyArray<ItemInfo<Key>>,
      keydown: (key: string) => Option.Option<Message>,
    ) => Html
  }>

export type Bundle<Key extends string = string> = Readonly<{
  view: SubmodelView<Model, Message, ViewInputs<Key>>
  update: typeof update
}>

export const create = <Key extends string = string>(): Bundle<Key> => ({
  update,
  view: defineView<Model, Message, ViewInputs<Key>>((model, inputs, h) => {
    const focus = inputs.focus ?? 'Real'
    const isDisabled = inputs.isDisabled ?? (() => false)
    const keydown = (key: string): Option.Option<Message> => {
      const target = navigate({
        ...inputs,
        currentKey: inputs.keys.find(candidate =>
          Option.contains(model.maybeHighlightedKey, candidate),
        ),
        pressedKey: key,
      })
      if (Option.isSome(target))
        return Option.some(Message.MovedHighlight({ key: target.value, focus }))
      return focus === 'Real' && key.length === 1
        ? Option.some(
            Message.TypedKey({
              key,
              keys: inputs.keys,
              labels: inputs.keys.map(inputs.label),
              disabledKeys: inputs.keys.filter(isDisabled),
              focus,
            }),
          )
        : Option.none()
    }
    return inputs.toView(
      inputs.keys.map((key, index) => ({
        key,
        index,
        isHighlighted: Option.contains(model.maybeHighlightedKey, key),
        isDisabled: isDisabled(key, index),
        attributes: childAttributes([
          h.Id(itemId(model.id, key)),
          ...(Option.contains(model.maybeHighlightedKey, key)
            ? [h.DataAttribute('highlighted', '')]
            : []),
          ...(isDisabled(key, index)
            ? [h.AriaDisabled(true)]
            : [
                h.OnPointerMove(() =>
                  Option.some(Message.HighlightedItem({ key })),
                ),
              ]),
        ]),
      })),
      keydown,
    )
  }),
})

export const view = create().view
