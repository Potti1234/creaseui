import { Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'

import * as FocusRecovery from '@/lib/behaviors/focus-recovery'

export const Side = Schema.Literals(['selected', 'available'])
export type Side = typeof Side.Type

export const Model = Schema.Struct({
  selected: FocusRecovery.CollectionModel,
  available: FocusRecovery.CollectionModel,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChangedCollection: { side: Side, message: FocusRecovery.CollectionMessage },
})
export type Message = typeof Message.Type

export const init = (): Model => ({
  selected: FocusRecovery.initCollection(),
  available: FocusRecovery.initCollection(),
})

export const actionId = (id: string, side: Side, key: string): string =>
  `${id}-action-${side}-${key}`

export const update = (
  model: Model,
  message: Message,
  id: string,
): Update.Return<Model, Message> => {
  const result = FocusRecovery.updateCollection(
    model[message.side],
    message.message,
    {
      itemId: key => actionId(id, message.side, key),
      fallbackId: `${id}-search`,
    },
  )
  return {
    model: { ...model, [message.side]: result.model },
    commands: Command.mapMessages(result.commands ?? [], next =>
      Message.ChangedCollection({ side: message.side, message: next }),
    ),
  }
}

export const focusMount = <Msg>(side: Side, send: (message: Message) => Msg) =>
  FocusRecovery.collectionMount(
    {
      keyAttribute: 'data-transfer-list-focus-key',
      actionSelector:
        '[data-transfer-list-action]:not(:disabled):not([aria-disabled="true"])',
    },
    message => send(Message.ChangedCollection({ side, message })),
  )
