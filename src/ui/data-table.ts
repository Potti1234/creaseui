import { Schema as S } from 'effect'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

export const Model = S.Struct({
  filter: S.String,
  sortKey: S.String,
  sortDirection: S.Literals(['ascending', 'descending']),
  page: S.Number,
  pageSize: S.Number,
})
export type Model = typeof Model.Type

export const Filtered = m('Filtered', { value: S.String })
export const Sorted = m('Sorted', { key: S.String })
export const ChangedPage = m('ChangedPage', { page: S.Number })
export const Message = S.Union([Filtered, Sorted, ChangedPage])
export type Message = typeof Message.Type

export const init = (pageSize = 10): Model => ({
  filter: '',
  sortKey: '',
  sortDirection: 'ascending',
  page: 0,
  pageSize: Math.max(1, pageSize),
})

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
  }
}

export type DataTableColumn<Row> = Readonly<{
  key: string
  header: string
  cell: (row: Row) => Html | string
  sortValue?: (row: Row) => string | number
  class?: string
}>

export type DataTableProps<Row, Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  rows: ReadonlyArray<Row>
  columns: ReadonlyArray<DataTableColumn<Row>>
  rowKey: (row: Row) => string
  filterText?: (row: Row) => string
  filterPlaceholder?: string
  emptyText?: string
  ariaLabel?: string
  class?: string
}>

const compare = (left: string | number, right: string | number): number =>
  typeof left === 'number' && typeof right === 'number'
    ? left - right
    : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' })

export const dataTable = <Row, Msg>(props: DataTableProps<Row, Msg>): Html => {
  const h = html<Msg>()
  const query = props.model.filter.trim().toLocaleLowerCase()
  const filtered = query === '' || props.filterText === undefined
    ? [...props.rows]
    : props.rows.filter(row => props.filterText?.(row).toLocaleLowerCase().includes(query) === true)
  const sortColumn = props.columns.find(column => column.key === props.model.sortKey)
  const sorted = sortColumn?.sortValue === undefined
    ? filtered
    : [...filtered].sort((left, right) => compare(sortColumn.sortValue?.(left) ?? '', sortColumn.sortValue?.(right) ?? '') * (props.model.sortDirection === 'ascending' ? 1 : -1))
  const pageCount = Math.max(1, Math.ceil(sorted.length / props.model.pageSize))
  const page = Math.min(props.model.page, pageCount - 1)
  const visible = sorted.slice(page * props.model.pageSize, (page + 1) * props.model.pageSize)

  return h.div([h.DataAttribute('slot', 'data-table'), h.Class(cn('w-full space-y-4', props.class))], [
    ...(props.filterText === undefined ? [] : [
      h.input([h.Type('search'), h.Value(props.model.filter), h.OnInput(value => props.toParentMessage(Filtered({ value }))), h.Placeholder(props.filterPlaceholder ?? 'Filter rows…'), h.AriaLabel(props.filterPlaceholder ?? 'Filter rows'), h.Class('h-8 w-full max-w-sm rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50')]),
    ]),
    h.div([h.Class('overflow-hidden rounded-md border')], [
      h.table([h.DataAttribute('slot', 'table'), h.Class('w-full caption-bottom text-sm')], [
        h.thead([h.Class('[&_tr]:border-b')], [h.tr([], props.columns.map(column => h.th([h.Scope('col'), ...(column.sortValue === undefined ? [] : [h.AriaSort(props.model.sortKey === column.key ? props.model.sortDirection : 'none')]), h.Class(cn('h-10 px-2 text-left align-middle font-medium text-foreground', column.class))], column.sortValue === undefined ? [column.header] : [h.button([h.Type('button'), h.OnClick(props.toParentMessage(Sorted({ key: column.key }))), h.Class('inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring')], [column.header, Icon.chevronsUpDown<Msg>({ class: 'size-3.5 text-muted-foreground' })])])))]),
        h.tbody([h.Class('[&_tr:last-child]:border-0')], visible.length === 0
          ? [h.tr([], [h.td([h.Colspan(props.columns.length), h.Class('h-24 text-center text-muted-foreground')], [props.emptyText ?? 'No results.'])])]
          : visible.map(row => h.tr([h.Key(props.rowKey(row)), h.Class('border-b transition-colors hover:bg-muted/50')], props.columns.map(column => h.td([h.Class(cn('p-2 align-middle', column.class))], [column.cell(row)]))))),
      ]),
    ]),
    h.div([h.Class('flex items-center justify-between gap-4')], [
      h.p([h.Class('text-sm text-muted-foreground')], [`${filtered.length} row${filtered.length === 1 ? '' : 's'}`]),
      h.div([h.Class('flex items-center gap-2')], [
        h.button([h.Type('button'), h.Disabled(page === 0), h.OnClick(props.toParentMessage(ChangedPage({ page: page - 1 }))), h.Class('h-8 rounded-md border px-3 text-sm font-medium disabled:pointer-events-none disabled:opacity-50')], ['Previous']),
        h.span([h.Class('text-sm tabular-nums')], [`${page + 1} / ${pageCount}`]),
        h.button([h.Type('button'), h.Disabled(page >= pageCount - 1), h.OnClick(props.toParentMessage(ChangedPage({ page: page + 1 }))), h.Class('h-8 rounded-md border px-3 text-sm font-medium disabled:pointer-events-none disabled:opacity-50')], ['Next']),
      ]),
    ]),
  ])
}
