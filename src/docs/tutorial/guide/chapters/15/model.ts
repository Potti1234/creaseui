import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Theme = S.Literals(['light', 'dark'])
export type Theme = typeof Theme.Type

export const Model = S.Struct({ theme: Theme })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseTheme: { theme: Theme },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { theme: 'light' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseTheme: ({ theme }) => ({ model: { ...model, theme } }),
    }),
  )
