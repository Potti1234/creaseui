import { Schema as S } from 'effect'
import type { Update } from 'foldkit'

export const Model = S.Struct({})
export type Model = typeof Model.Type

export type Message = never

export const init = (): Update.Return<Model, Message> => ({ model: {} })

export const update = (model: Model): Update.Return<Model, Message> => ({
  model,
})
