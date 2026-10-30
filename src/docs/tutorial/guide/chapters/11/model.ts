import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Model = S.Struct({ caseIndex: S.Number, isRuleBroken: S.Boolean })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseCase: { index: S.Number },
  ToggledRule: {},
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { caseIndex: 3, isRuleBroken: false },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseCase: ({ index }) => ({ model: { ...model, caseIndex: index } }),
      ToggledRule: () => ({
        model: { ...model, isRuleBroken: !model.isRuleBroken },
      }),
    }),
  )
