import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Agent = S.Literals(['a', 'b', 'c'])
export type Agent = typeof Agent.Type

export const Model = S.Struct({ agent: Agent })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({ ChoseAgent: { agent: Agent } })
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { agent: 'a' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseAgent: ({ agent }) => ({ model: { ...model, agent } }),
    }),
  )
