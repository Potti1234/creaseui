import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const WallGrouping = S.Literals(['file', 'class'])
export type WallGrouping = typeof WallGrouping.Type

/** Who a class in a component call belongs to. */
export const Owner = S.Literals(['component', 'parent', 'theme', 'nobody'])
export type Owner = typeof Owner.Type

export const Version = S.Literals(['chapter-04', 'chapter-05'])
export type Version = typeof Version.Type

export const Model = S.Struct({
  wall: WallGrouping,
  answers: S.Record(S.String, Owner),
  version: Version,
  width: S.Number,
  keepOnly: S.Boolean,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseWallGrouping: { grouping: WallGrouping },
  Answered: { id: S.String, owner: Owner },
  ResetAnswers: {},
  ChoseVersion: { version: Version },
  ChangedWidth: { width: S.Number },
  ToggledKeepOnly: {},
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: {
    wall: 'file',
    answers: {},
    version: 'chapter-04',
    width: 520,
    keepOnly: false,
  },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseWallGrouping: ({ grouping }) => ({
        model: { ...model, wall: grouping },
      }),
      Answered: ({ id, owner }) => ({
        model: { ...model, answers: { ...model.answers, [id]: owner } },
      }),
      ResetAnswers: () => ({ model: { ...model, answers: {} } }),
      ChoseVersion: ({ version }) => ({ model: { ...model, version } }),
      ChangedWidth: ({ width }) => ({ model: { ...model, width } }),
      ToggledKeepOnly: () => ({
        model: { ...model, keepOnly: !model.keepOnly },
      }),
    }),
  )
