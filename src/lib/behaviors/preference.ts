import { Effect, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'
import * as Storage from './storage'

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
  const Model = Schema.Struct({ value: Schema.Literals(config.values) })

  type Model = typeof Model.Type

  const decode = (raw: string | null | undefined): Value =>
    config.values.find(value => value === raw) ?? config.defaultValue

  const init = (raw?: string | null): Model => ({ value: decode(raw) })

  const update = (
    model: Model,
    message: Message,
  ): Update.ReturnWithOutMessage<Model, Message, OutMessage> => {
    const change = (
      value: Value,
      reason: OutMessage['reason'],
    ): Update.ReturnWithOutMessage<Model, Message, OutMessage> => {
      if (value === model.value) return { model }
      return {
        model: { value },
        commands:
          reason === 'set' && config.storage
            ? [Persist({ storage: config.storage, value })]
            : [],
        outMessage: OutMessage.ChangedValue({ value, reason }),
      }
    }

    switch (message._tag) {
      case 'RequestedValue':
        if (!config.values.some(value => value === message.value))
          return { model }
        return change(decode(message.value), 'set')
      case 'RestoredValue':
        return change(decode(message.raw), 'restore')
      case 'ReceivedStoredValue':
        return change(decode(message.raw), 'storage-sync')
      case 'CompletedPersist':
        return { model }
    }
  }

  return {
    Model,
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
