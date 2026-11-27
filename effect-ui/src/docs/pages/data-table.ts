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
  {
    id: 'm5gr84i9',
    invoice: 'INV-001',
    status: 'paid',
    method: 'credit card',
    amount: 250,
    email: 'ken99@example.com',
  },
  {
    id: '3u1reuv4',
    invoice: 'INV-002',
    status: 'pending',
    method: 'paypal',
    amount: 150,
    email: 'abe45@example.com',
  },
  {
    id: 'derv1ws0',
    invoice: 'INV-003',
    status: 'unpaid',
    method: 'bank transfer',
    amount: 350,
    email: 'monserrat44@example.com',
  },
  {
    id: '5kma53ae',
    invoice: 'INV-004',
    status: 'paid',
    method: 'credit card',
    amount: 450,
    email: 'james78@example.com',
  },
  {
    id: 'bhqecj4p',
    invoice: 'INV-005',
    status: 'pending',
    method: 'paypal',
    amount: 550,
    email: 'carmella@example.com',
  },
  {
    id: 'p9k2x8lm',
    invoice: 'INV-006',
    status: 'paid',
    method: 'bank transfer',
    amount: 200,
    email: 'jordan@example.com',
  },
  {
    id: 'q7n3v5tr',
    invoice: 'INV-007',
    status: 'unpaid',
    method: 'credit card',
    amount: 300,
    email: 'maya@example.com',
  },
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
      rows,
      rowKey: (row: any) => row.id,
      columns: [
        {
          key: 'invoice',
          header: 'Invoice',
          get: (row: any) => row.invoice,
          sortValue: (row: any) => row.invoice,
          cell: (row: any) => row.invoice,
        },
        {
          key: 'status',
          header: 'Status',
          get: (row: any) => row.status,
          filterVariant: 'options',
          options: ['paid', 'pending', 'unpaid'].map(value => ({
            value,
            label: value,
          })),
          cell: (row: any) =>
            styled
              ? h.span
                  .class('rounded-full bg-muted px-2 py-0.5 text-xs capitalize')
                  .children(row.status)
              : row.status,
        },
        {
          key: 'method',
          header: 'Method',
          get: (row: any) => row.method,
          cell: (row: any) => row.method,
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
      props: { defaultState: initDataTable(kind === 'pagination' ? 3 : 10) },
      mode: kind === 'server' ? 'server' : undefined,
      rowCount: kind === 'server' ? 100 : undefined,
      enableRowSelection: kind === 'bulk' || kind === 'actions',
      enableColumnVisibility: kind === 'faceted' || kind === 'server',
      rowMenu: kind === 'actions',
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
