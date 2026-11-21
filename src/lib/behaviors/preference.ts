import { Effect, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'
import * as Storage from './storage'

export const Model = Schema.Struct({ value: Schema.String })
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  RequestedValue: { value: Schema.String },
  RestoredValue: { raw: Schema.NullOr(Schema.String) },
  ReceivedStoredValue: { raw: Schema.NullOr(Schema.String) },
  CompletedPersist: {},
})
export type Message = typeof Message.Type
export const OutMessage = defineMessageUnion({
  ChangedValue: {
    value: Schema.String,
    reason: Schema.Literals(['set', 'restore', 'storage-sync']),
  },
})
export type OutMessage = typeof OutMessage.Type
export const Persist = Command.define('PersistPreference', {
  args: { storage: Storage.Descriptor, value: Schema.String },
  messages: [Message.CompletedPersist],
  execute: ({ storage, value }) =>
    Storage.set(storage, value).pipe(Effect.as(Message.CompletedPersist())),
})

export const create = <Value extends string>(
  config: Readonly<{
    values: ReadonlyArray<Value>
    defaultValue: Value
    attribute: `data-${string}`
    storage?: Storage.Descriptor
  }>,
) => {
  const decode = (raw: string | null | undefined): Value =>
    config.values.find(value => value === raw) ?? config.defaultValue
  const init = (raw?: string | null): Model => ({ value: decode(raw) })
  const update = (
    model: Model,
    message: Message,
  ): Update.ReturnWithOutMessage<Model, Message, OutMessage> => {
    if (message._tag === 'CompletedPersist') return { model }
    if (
      message._tag === 'RequestedValue' &&
      !config.values.some(value => value === message.value)
    )
      return { model }
    const value =
      message._tag === 'RequestedValue'
        ? decode(message.value)
        : decode(message.raw)
    if (value === model.value) return { model }
    return {
      model: { value },
      commands:
        message._tag === 'RequestedValue' && config.storage
          ? [Persist({ storage: config.storage, value })]
          : [],
      outMessage: OutMessage.ChangedValue({
        value,
        reason:
          message._tag === 'RequestedValue'
            ? 'set'
            : message._tag === 'RestoredValue'
              ? 'restore'
              : 'storage-sync',
      }),
    }
  }
  return {
    decode,
    init,
    update,
    attributes: (model: Model): Readonly<Record<string, string>> => ({
      [config.attribute]: decode(model.value),
    }),
    changes: (): Stream.Stream<Message> =>
      config.storage
        ? Storage.changes(config.storage).pipe(
            Stream.map(raw => Message.ReceivedStoredValue({ raw })),
          )
        : Stream.empty,
  }
}
