import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Run = S.Literals(['first', 'final'])
export type Run = typeof Run.Type

export const Model = S.Struct({ chosen: S.String, run: Run })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseRegression: { id: S.String },
  ChoseRun: { run: Run },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { chosen: 'wrap', run: 'first' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseRegression: ({ id }) => ({ model: { ...model, chosen: id } }),
      ChoseRun: ({ run }) => ({ model: { ...model, run } }),
    }),
  )
