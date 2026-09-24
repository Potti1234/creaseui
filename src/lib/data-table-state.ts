import { Schema as S } from 'effect'
import { defineMessageUnion } from 'foldkit/message'

export const Model = S.Struct({
  filter: S.String,
  sortKey: S.String,
  sortDirection: S.Literals(['ascending', 'descending']),
  page: S.Number,
  pageSize: S.Number,
  selectedRowKeys: S.Array(S.String),
  hiddenColumnKeys: S.Array(S.String),
  columnsMenuOpen: S.Boolean,
})
export type Model = typeof Model.Type











export const Message = defineMessageUnion({
  Filtered: { value: S.String },
  Sorted: { key: S.String },
  ChangedPage: { page: S.Number },
  ChangedPageSize: { pageSize: S.Number },
  ToggledRow: { key: S.String, isSelected: S.Boolean },
  ToggledRows: { keys: S.Array(S.String), isSelected: S.Boolean },
  ToggledColumn: { key: S.String, isVisible: S.Boolean },
  ClearedSelection: {},
  ToggledColumnsMenu: {},
  ClosedColumnsMenu: {},
});
export type Message = typeof Message.Type

export const init = (pageSize = 10): Model => ({
  filter: '',
  sortKey: '',
  sortDirection: 'ascending',
  page: 0,
  pageSize: Math.max(1, pageSize),
  selectedRowKeys: [],
  hiddenColumnKeys: [],
  columnsMenuOpen: false,
})

const withMembership = (
  values: ReadonlyArray<string>,
  key: string,
  included: boolean,
): ReadonlyArray<string> =>
  included
    ? [...new Set([...values, key])]
    : values.filter((value) => value !== key)

export const update = (model: Model, message: Message): Model => {
  switch (message._tag) {
    case 'Filtered':
      return { ...model, filter: message.value, page: 0 }
    case 'Sorted':
      return model.sortKey === message.key
        ? { ...model, sortDirection: model.sortDirection === 'ascending' ? 'descending' : 'ascending', page: 0 }
        : { ...model, sortKey: message.key, sortDirection: 'ascending', page: 0 }
    case 'ChangedPage':
      return { ...model, page: Math.max(0, message.page) }
    case 'ChangedPageSize':
      return { ...model, page: 0, pageSize: Math.max(1, message.pageSize) }
    case 'ToggledRow':
      return { ...model, selectedRowKeys: withMembership(model.selectedRowKeys, message.key, message.isSelected) }
    case 'ToggledRows':
      return { ...model, selectedRowKeys: message.keys.reduce((keys, key) => withMembership(keys, key, message.isSelected), model.selectedRowKeys) }
    case 'ToggledColumn':
      return { ...model, hiddenColumnKeys: withMembership(model.hiddenColumnKeys, message.key, !message.isVisible) }
    case 'ClearedSelection':
      return { ...model, selectedRowKeys: [] }
    case 'ToggledColumnsMenu':
      return { ...model, columnsMenuOpen: !model.columnsMenuOpen }
    case 'ClosedColumnsMenu':
      return { ...model, columnsMenuOpen: false }
  }
}

