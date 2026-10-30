// @ts-nocheck: snapshot of creaseui-demo chapter-02:src/model.ts
import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

import { Issue, SEED } from './domain'

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
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  SelectedView: { view: View },
  ChangedQuery: { query: S.String },
  ClearedQuery: {},
  ToggledGrouping: {},
  ToggledSort: {},
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: {
    issues: SEED,
    view: 'all',
    query: '',
    isGrouped: true,
    sort: 'priority',
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
    }),
  )
