import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Stage = S.Literals(['proposal', 'adopted'])
export type Stage = typeof Stage.Type

export const Model = S.Struct({ stage: Stage, step: S.Number })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseStage: { stage: Stage },
  ChoseStep: { step: S.Number },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { stage: 'proposal', step: 0 },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseStage: ({ stage }) => ({ model: { ...model, stage } }),
      ChoseStep: ({ step }) => ({ model: { ...model, step } }),
    }),
  )
