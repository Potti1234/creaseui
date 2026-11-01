// @ts-nocheck: snapshot of creaseui-demo chapter-04:src/model.ts
import { Effect, Match as M, Schema as S } from 'effect'
import { Command, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

import { Issue, SEED } from './domain'
import { applyTheme } from './theme/mode'

export const View = S.Literals(['all', 'mine'])
export type View = typeof View.Type

export const Sort = S.Literals(['priority', 'newest'])
export type Sort = typeof Sort.Type

export const Model = S.Struct({
  issues: S.Array(Issue),
  view: View,
  query: S.String,
  isGrouped: S.Boolean,
  sort: Sort,
  isDark: S.Boolean,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  SelectedView: { view: View },
  ChangedQuery: { query: S.String },
  ClearedQuery: {},
  ToggledGrouping: {},
  ToggledSort: {},
  ToggledTheme: {},
  AppliedTheme: {},
})
export type Message = typeof Message.Type

const ApplyTheme = Command.define('ApplyTheme', {
  args: { isDark: S.Boolean },
  messages: [Message.AppliedTheme],
  execute: ({ isDark }) =>
    applyTheme(isDark).pipe(Effect.as(Message.AppliedTheme())),
})

export const init = (): Update.Return<Model, Message> => ({
  model: {
    issues: SEED,
    view: 'all',
    query: '',
    isGrouped: true,
    sort: 'priority',
    isDark: false,
  },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      SelectedView: ({ view }) => ({ model: { ...model, view, query: '' } }),
      ChangedQuery: ({ query }) => ({ model: { ...model, query } }),
      ClearedQuery: () => ({ model: { ...model, query: '' } }),
      ToggledGrouping: () => ({
        model: { ...model, isGrouped: !model.isGrouped },
      }),
      ToggledSort: () => {
        const sort: Sort = model.sort === 'priority' ? 'newest' : 'priority'
        return { model: { ...model, sort } }
      },
      ToggledTheme: () => ({
        model: { ...model, isDark: !model.isDark },
        commands: [ApplyTheme({ isDark: !model.isDark })],
      }),
      AppliedTheme: () => ({ model }),
    }),
  )
