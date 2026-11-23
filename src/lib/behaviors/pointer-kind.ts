import { Effect, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'
import * as Subscription from 'foldkit/subscription'

export const PointerPrecision = Schema.Literals([
  'fine',
  'coarse',
  'none',
  'unknown',
])
export type PointerPrecision = typeof PointerPrecision.Type
export const PointerHover = Schema.Literals(['hover', 'none', 'unknown'])
export type PointerHover = typeof PointerHover.Type

export const Model = Schema.Struct({
  pointer: PointerPrecision,
  hover: PointerHover,
  anyPointer: PointerPrecision,
  anyHover: PointerHover,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChangedPointerKind: { state: Model },
})
export type Message = typeof Message.Type

export const init = (initial: Partial<Model> = {}): Model => ({
  pointer: initial.pointer ?? 'unknown',
  hover: initial.hover ?? 'unknown',
  anyPointer: initial.anyPointer ?? 'unknown',
  anyHover: initial.anyHover ?? 'unknown',
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  const next = message.state
  return {
    model:
      model.pointer === next.pointer &&
      model.hover === next.hover &&
      model.anyPointer === next.anyPointer &&
      model.anyHover === next.anyHover
        ? model
        : next,
  }
}

const queries = [
  '(pointer: fine)',
  '(pointer: coarse)',
  '(pointer: none)',
  '(hover: hover)',
  '(hover: none)',
  '(any-pointer: fine)',
  '(any-pointer: coarse)',
  '(any-pointer: none)',
  '(any-hover: hover)',
  '(any-hover: none)',
] as const

export const read = (
  matchMedia: (query: string) => { matches: boolean },
): Model => {
  const matches = queries.map(query => matchMedia(query).matches)
  const precision = (offset: number): PointerPrecision =>
    matches[offset]
      ? 'fine'
      : matches[offset + 1]
        ? 'coarse'
        : matches[offset + 2]
          ? 'none'
          : 'unknown'
  const hover = (offset: number): PointerHover =>
    matches[offset] ? 'hover' : matches[offset + 1] ? 'none' : 'unknown'
  return {
    pointer: precision(0),
    hover: hover(3),
    anyPointer: precision(5),
    anyHover: hover(8),
  }
}

export const pointerKindOf = (mobileHint?: string | null): Partial<Model> => {
  const hint = mobileHint?.trim()
  return hint === '?1'
    ? { pointer: 'coarse', hover: 'none' }
    : hint === '?0'
      ? { pointer: 'fine', hover: 'hover' }
      : {}
}

export const canHover = (model: Model): boolean => model.hover === 'hover'

export const ReadPointerKind = Command.define('ReadPointerKind', {
  args: {},
  messages: [Message.ChangedPointerKind],
  execute: () =>
    Effect.sync(() =>
      Message.ChangedPointerKind({
        state:
          typeof window === 'undefined' ||
          typeof window.matchMedia !== 'function'
            ? init()
            : read(query => window.matchMedia(query)),
      }),
    ),
})

export const changes = (): Stream.Stream<Message> =>
  Stream.suspend(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return Stream.empty
    const lists = new Map(
      queries.map(query => [query as string, window.matchMedia(query)]),
    )
    const mapEvent = () =>
      Message.ChangedPointerKind({
        state: read(query => lists.get(query) ?? { matches: false }),
      })
    return Stream.mergeAll(
      Array.from(lists.values(), target =>
        Subscription.fromEvent({ target, type: 'change', mapEvent }),
      ),
      { concurrency: 'unbounded' },
    )
  })

export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  pointerKind: entry(
    {},
    {
      modelToDependencies: () => ({}),
      dependenciesToStream: changes,
    },
  ),
}))
