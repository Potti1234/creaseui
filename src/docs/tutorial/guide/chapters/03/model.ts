import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Model = S.Struct({ decision: S.String })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({ ChoseDecision: { id: S.String } })
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { decision: 'D1' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseDecision: ({ id }) => ({ model: { ...model, decision: id } }),
    }),
  )
