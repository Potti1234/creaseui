import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Page = S.Literals(['all', 'team', 'mine', 'search'])
export type Page = typeof Page.Type

export const Model = S.Struct({ step: S.Number, page: Page })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseStep: { step: S.Number },
  ChosePage: { page: Page },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { step: 0, page: 'all' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseStep: ({ step }) => ({ model: { ...model, step } }),
      ChosePage: ({ page }) => ({ model: { ...model, page } }),
    }),
  )
