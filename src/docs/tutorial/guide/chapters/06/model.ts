import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Layer = S.Literals([
  'features',
  'components',
  'implementations',
  'theme',
  'entry',
  'enforcement',
])
export type Layer = typeof Layer.Type

export const Cell = S.Struct({ component: S.String, className: S.String })
export type Cell = typeof Cell.Type

export const Model = S.Struct({
  layer: Layer,
  cell: S.NullOr(Cell),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseLayer: { layer: Layer },
  ChoseCell: { cell: Cell },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { layer: 'features', cell: { component: 'button', className: 'h-7' } },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseLayer: ({ layer }) => ({ model: { ...model, layer } }),
      ChoseCell: ({ cell }) => ({ model: { ...model, cell } }),
    }),
  )
