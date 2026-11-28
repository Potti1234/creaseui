import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, DataTable } from '#components'
import { initDataTable } from '../../behaviors/data-table'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const rows = [
  { id: '728ed52f', status: 'success', email: 'm@example.com', amount: 100 },
  { id: '489e1d42', status: 'pending', email: 'a@example.com', amount: 125 },
  { id: 'f7a4b3c2', status: 'processing', email: 's@example.com', amount: 250 },
  { id: 'aa91df03', status: 'success', email: 'j@example.com', amount: 75 },
  { id: '6dc9a830', status: 'failed', email: 'r@example.com', amount: 340 },
  { id: '4cb3d780', status: 'pending', email: 't@example.com', amount: 88 },
  { id: '91be24c7', status: 'success', email: 'k@example.com', amount: 410 },
  { id: 'c37fa912', status: 'processing', email: 'd@example.com', amount: 64 },
  { id: '5e08d1b4', status: 'failed', email: 'n@example.com', amount: 190 },
  { id: '8b2f6e51', status: 'pending', email: 'p@example.com', amount: 230 },
  { id: '0d94ab68', status: 'success', email: 'g@example.com', amount: 155 },
  { id: 'f61c3d29', status: 'processing', email: 'w@example.com', amount: 99 },
  { id: '3a7e90b5', status: 'pending', email: 'v@example.com', amount: 275 },
  { id: 'be5417c8', status: 'success', email: 'l@example.com', amount: 320 },
  { id: '72d8f4a1', status: 'failed', email: 'o@example.com', amount: 48 },
  { id: 'a9c35b76', status: 'pending', email: 'u@example.com', amount: 132 },
]
const Message = UiSchema.TaggedEnum({ TableEvent: {} })
const DataTableDemo = Html.component({
  name: 'DocsDataTableDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Null,
  message: Message,
}).make({
  init: () => null,
  update: { TableEvent: $ => $ },
  view: h => {
    const kind = h.props.kind
    const styled = kind === 'styling'
    return DataTable(h, {
      id: `${h.props.idPrefix}-${kind}`,
      ariaLabel: 'Payments',
      rows: ['sortable', 'filter', 'server', 'rtl'].includes(kind)
        ? rows.slice(0, 6)
        : rows,
      rowKey: (row: any) => row.id,
      columns: [
        {
          key: 'status',
          header: 'Status',
          get: (row: any) => row.status,
          sortValue: (row: any) => row.status,
          filterVariant: 'options',
          options: ['success', 'pending', 'processing', 'failed'].map(
            value => ({
              value,
              label: value,
            }),
          ),
          cell: (row: any) =>
            styled
              ? h.span
                  .class('rounded-full bg-muted px-2 py-0.5 text-xs capitalize')
                  .children(row.status)
              : row.status,
        },
        {
          key: 'email',
          header: 'Email',
          get: (row: any) => row.email,
          sortValue: (row: any) => row.email,
          cell: (row: any) => row.email,
        },
        {
          key: 'amount',
          header: 'Amount',
          get: (row: any) => String(row.amount),
          sortValue: (row: any) => String(row.amount),
          align: 'right',
          className: styled ? 'font-mono text-primary' : undefined,
          cell: (row: any) => `$${row.amount.toFixed(2)}`,
        },
      ],
      variant: kind === 'faceted' ? 'faceted' : undefined,
      props: { defaultState: initDataTable(5) },
      mode: kind === 'server' ? 'server' : undefined,
      rowCount: kind === 'server' ? 100 : undefined,
      enableRowSelection: kind !== 'styling',
      enableColumnVisibility: kind !== 'styling',
      rowMenu: kind === 'actions',
      ...(kind === 'filter'
        ? {
            filterText: (row: any) => `${row.status} ${row.email}`,
            searchColumnKey: 'email',
            searchPlaceholder: 'Filter payments…',
          }
        : {}),
      pageSizeOptions: [5, 10, 20],
      direction: kind === 'rtl' ? 'rtl' : undefined,
      toolbarContent: kind === 'filter' ? undefined : undefined,
      actionBar: (selection: any) =>
        Button(h, {
          variant: 'destructive',
          size: 'sm',
          onPress: Message.TableEvent(),
        }).children(`Delete ${selection.length} selected`),
      onEmit: () => Message.TableEvent(),
    } as any)
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    DataTableDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { DataTable } from '@/ui/effect/ui'`,
  body: `DataTable(h, {
  id: 'payments',
  ariaLabel: 'Payments',
  rows,
  rowKey: (row: any) => row.id,
  columns,
  props: { defaultState: initDataTable(10) },
  onEmit,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { DataTable } from '@/ui/effect/ui'\n\nDataTable(h, { rows, rowKey, columns, onEmit })`,
  examples: [
    { title: 'Sortable payments', view: view('sortable'), source },
    { title: 'Filter and paginate', view: view('filter'), source },
    { title: 'Server-owned query', view: view('server'), source },
    { title: 'RTL', view: view('rtl'), source },
    { title: 'Faceted filters', view: view('faceted'), source },
    { title: 'Row action menu', view: view('actions'), source },
    { title: 'Bulk actions', view: view('bulk'), source },
    { title: 'Pagination', view: view('pagination'), source },
    { title: 'Cell styling', view: view('styling'), source },
  ],
})
