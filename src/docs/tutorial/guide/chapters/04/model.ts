import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Tag = S.Literals(['chapter-03', 'chapter-04'])
export type Tag = typeof Tag.Type

export const Contrast = S.Literals(['22', '6'])
export type Contrast = typeof Contrast.Type

export const Model = S.Struct({ tag: Tag, contrast: Contrast })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseTag: { tag: Tag },
  ChoseContrast: { contrast: Contrast },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { tag: 'chapter-03', contrast: '22' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseTag: ({ tag }) => ({ model: { ...model, tag } }),
      ChoseContrast: ({ contrast }) => ({ model: { ...model, contrast } }),
    }),
  )
