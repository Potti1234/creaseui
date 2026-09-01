import { Schema as S } from 'effect'
import { m } from 'foldkit/message'

export const Sort = S.Struct({ id: S.String, desc: S.Boolean })
export type Sort = typeof Sort.Type

export const Density = S.Literals(['comfortable', 'compact'])
export type Density = typeof Density.Type

export const Model = S.Struct({
  globalFilter: S.String,
  statusFilter: S.String,
  sorting: S.Array(Sort),
  pageIndex: S.Number,
  pageSize: S.Number,
  selectedRowIds: S.Array(S.String),
  hiddenColumnIds: S.Array(S.String),
  columnOrder: S.Array(S.String),
  pinnedColumnIds: S.Array(S.String),
  pinnedRowIds: S.Array(S.String),
  grouping: S.Array(S.String),
  expandedRowIds: S.Array(S.String),
  titleWidth: S.Number,
  density: Density,
})
export type Model = typeof Model.Type

export const ChangedGlobalFilter = m('ChangedTanStackGlobalFilter', { value: S.String })
export const ChangedStatusFilter = m('ChangedTanStackStatusFilter', { value: S.String })
export const ChangedSorting = m('ChangedTanStackSorting', { sorting: S.Array(Sort) })
export const ChangedPage = m('ChangedTanStackPage', { pageIndex: S.Number })
export const ChangedPageSize = m('ChangedTanStackPageSize', { pageSize: S.Number })
export const ToggledRow = m('ToggledTanStackRow', { rowId: S.String, isSelected: S.Boolean })
export const ToggledRows = m('ToggledTanStackRows', { rowIds: S.Array(S.String), isSelected: S.Boolean })
export const ToggledColumn = m('ToggledTanStackColumn', { columnId: S.String, isVisible: S.Boolean })
export const MovedColumn = m('MovedTanStackColumn', { columnId: S.String, direction: S.Literals(['left', 'right']) })
export const ToggledColumnPin = m('ToggledTanStackColumnPin', { columnId: S.String })
export const ToggledRowPin = m('ToggledTanStackRowPin', { rowId: S.String })
export const ToggledGrouping = m('ToggledTanStackGrouping', { columnId: S.String })
export const ToggledExpanded = m('ToggledTanStackExpanded', { rowId: S.String })
export const ChangedTitleWidth = m('ChangedTanStackTitleWidth', { width: S.Number })
export const ChangedDensity = m('ChangedTanStackDensity', { density: Density })
export const ResetTable = m('ResetTanStackTable')

export const Message = S.Union([
  ChangedGlobalFilter,
  ChangedStatusFilter,
  ChangedSorting,
  ChangedPage,
  ChangedPageSize,
  ToggledRow,
  ToggledRows,
  ToggledColumn,
  MovedColumn,
  ToggledColumnPin,
  ToggledRowPin,
  ToggledGrouping,
  ToggledExpanded,
  ChangedTitleWidth,
  ChangedDensity,
  ResetTable,
])
export type Message = typeof Message.Type

export const DEFAULT_COLUMN_ORDER = ['select', 'title', 'status', 'team', 'priority', 'points', 'assignee', 'due'] as const

export type InitOptions = Readonly<{
  columnOrder?: ReadonlyArray<string>
  pageSize?: number
  pinnedColumnIds?: ReadonlyArray<string>
  sorting?: ReadonlyArray<Sort>
}>

export const init = (options: InitOptions = {}): Model => ({
  globalFilter: '',
  statusFilter: '',
  sorting: options.sorting ?? [{ id: 'due', desc: false }],
  pageIndex: 0,
  pageSize: options.pageSize ?? 8,
  selectedRowIds: [],
  hiddenColumnIds: [],
  columnOrder: [...(options.columnOrder ?? DEFAULT_COLUMN_ORDER)],
  pinnedColumnIds: [...(options.pinnedColumnIds ?? ['select'])],
  pinnedRowIds: [],
  grouping: [],
  expandedRowIds: [],
  titleWidth: 280,
  density: 'comfortable',
})

const membership = (values: ReadonlyArray<string>, value: string, included: boolean): ReadonlyArray<string> =>
  included ? [...new Set([...values, value])] : values.filter((candidate) => candidate !== value)

const move = (values: ReadonlyArray<string>, value: string, direction: 'left' | 'right'): ReadonlyArray<string> => {
  const index = values.indexOf(value)
  const target = direction === 'left' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= values.length) return values
  const next = [...values]
  ;[next[index], next[target]] = [next[target] ?? value, next[index] ?? value]
  return next
}

export const update = (model: Model, message: Message): Model => {
  switch (message._tag) {
    case 'ChangedTanStackGlobalFilter': return { ...model, globalFilter: message.value, pageIndex: 0 }
    case 'ChangedTanStackStatusFilter': return { ...model, statusFilter: message.value, pageIndex: 0 }
    case 'ChangedTanStackSorting': return { ...model, sorting: message.sorting, pageIndex: 0 }
    case 'ChangedTanStackPage': return { ...model, pageIndex: Math.max(0, message.pageIndex) }
    case 'ChangedTanStackPageSize': return { ...model, pageIndex: 0, pageSize: Math.max(1, message.pageSize) }
    case 'ToggledTanStackRow': return { ...model, selectedRowIds: membership(model.selectedRowIds, message.rowId, message.isSelected) }
    case 'ToggledTanStackRows': return { ...model, selectedRowIds: message.rowIds.reduce((ids, id) => membership(ids, id, message.isSelected), model.selectedRowIds) }
    case 'ToggledTanStackColumn': return { ...model, hiddenColumnIds: membership(model.hiddenColumnIds, message.columnId, !message.isVisible) }
    case 'MovedTanStackColumn': return { ...model, columnOrder: move(model.columnOrder, message.columnId, message.direction) }
    case 'ToggledTanStackColumnPin': return { ...model, pinnedColumnIds: membership(model.pinnedColumnIds, message.columnId, !model.pinnedColumnIds.includes(message.columnId)) }
    case 'ToggledTanStackRowPin': return { ...model, pinnedRowIds: membership(model.pinnedRowIds, message.rowId, !model.pinnedRowIds.includes(message.rowId)) }
    case 'ToggledTanStackGrouping': return { ...model, expandedRowIds: [], grouping: membership(model.grouping, message.columnId, !model.grouping.includes(message.columnId)) }
    case 'ToggledTanStackExpanded': return { ...model, expandedRowIds: membership(model.expandedRowIds, message.rowId, !model.expandedRowIds.includes(message.rowId)) }
    case 'ChangedTanStackTitleWidth': return { ...model, titleWidth: Math.min(440, Math.max(200, message.width)) }
    case 'ChangedTanStackDensity': return { ...model, density: message.density }
    case 'ResetTanStackTable': return init()
  }
}

export const nextSorting = (sorting: ReadonlyArray<Sort>, columnId: string): ReadonlyArray<Sort> => {
  const current = sorting.find((sort) => sort.id === columnId)
  if (current === undefined) return [...sorting, { id: columnId, desc: false }]
  if (!current.desc) return sorting.map((sort) => sort.id === columnId ? { ...sort, desc: true } : sort)
  return sorting.filter((sort) => sort.id !== columnId)
}
