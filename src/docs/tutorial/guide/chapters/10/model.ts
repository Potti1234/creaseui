import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Version = S.Literals(['chapter-09', 'chapter-10'])
export type Version = typeof Version.Type

export const Model = S.Struct({ call: S.String, version: Version })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseCall: { id: S.String },
  ChoseVersion: { version: Version },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { call: 'text-lg', version: 'chapter-09' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseCall: ({ id }) => ({ model: { ...model, call: id } }),
      ChoseVersion: ({ version }) => ({ model: { ...model, version } }),
    }),
  )
