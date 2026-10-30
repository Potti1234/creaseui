import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Screen = S.Literals(['all', 'mine', 'search'])
export type Screen = typeof Screen.Type

export const LintMode = S.Literals(['migration', 'strict'])
export type LintMode = typeof LintMode.Type

export const Model = S.Struct({
  artifact: S.String,
  screen: Screen,
  lintMode: LintMode,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseArtifact: { id: S.String },
  ChoseScreen: { screen: Screen },
  ChoseLintMode: { mode: LintMode },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { artifact: 'crease/button', screen: 'all', lintMode: 'migration' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseArtifact: ({ id }) => ({ model: { ...model, artifact: id } }),
      ChoseScreen: ({ screen }) => ({ model: { ...model, screen } }),
      ChoseLintMode: ({ mode }) => ({ model: { ...model, lintMode: mode } }),
    }),
  )
