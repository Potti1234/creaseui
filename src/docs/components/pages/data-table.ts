import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as DataTable from '@/ui/data-table';

type Payment = Readonly<{ id: string; status: string; email: string; amount: number }>;

const payments: ReadonlyArray<Payment> = [
  { id: '728ed52f', status: 'success', email: 'm@example.com', amount: 100 },
  { id: '489e1d42', status: 'pending', email: 'a@example.com', amount: 125 },
  { id: 'f7a4b3c2', status: 'processing', email: 's@example.com', amount: 250 },
  { id: 'aa91df03', status: 'success', email: 'j@example.com', amount: 75 },
  { id: '6dc9a830', status: 'failed', email: 'r@example.com', amount: 340 },
  { id: '4cb3d780', status: 'pending', email: 't@example.com', amount: 88 },
];

const columns = (): ReadonlyArray<DataTable.DataTableColumn<Payment>> => [
  { key: 'status', header: 'Status', cell: row => row.status, sortValue: row => row.status },
  { key: 'email', header: 'Email', cell: row => row.email, sortValue: row => row.email },
  { key: 'amount', header: 'Amount', class: 'text-right', cell: row => `$${row.amount.toFixed(2)}`, sortValue: row => row.amount },
];

const source = (name: string, pageSize: number, filter: boolean): string => foldkitApplication({
  title: `Data Table — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as DataTable from '@/ui/data-table'`,
  model: `type Payment = Readonly<{ id: string; status: string; email: string; amount: number }>

const payments: ReadonlyArray<Payment> = [
  { id: '728ed52f', status: 'success', email: 'm@example.com', amount: 100 },
  { id: '489e1d42', status: 'pending', email: 'a@example.com', amount: 125 },
  { id: 'f7a4b3c2', status: 'processing', email: 's@example.com', amount: 250 },
  { id: 'aa91df03', status: 'success', email: 'j@example.com', amount: 75 },
  { id: '6dc9a830', status: 'failed', email: 'r@example.com', amount: 340 },
  { id: '4cb3d780', status: 'pending', email: 't@example.com', amount: 88 },
]

export const Model = S.Struct({ table: DataTable.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotDataTableMessage = m('GotDataTableMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: DataTable.Message })
export const Message = S.Union([GotDataTableMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { table: DataTable.init(${String(pageSize)}) },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotDataTableMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [{ ...model, table: DataTable.update(model.table, message.message) }, []]
  }
}`,
  view: `const columns: ReadonlyArray<DataTable.DataTableColumn<Payment>> = [
  { key: 'status', header: 'Status', cell: row => row.status, sortValue: row => row.status },
  { key: 'email', header: 'Email', cell: row => row.email, sortValue: row => row.email },
  { key: 'amount', header: 'Amount', class: 'text-right', cell: row => \`$\${row.amount.toFixed(2)}\`, sortValue: row => row.amount },
]

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Data Table — ${name}',
  body: h.main([h.Class('mx-auto max-w-3xl p-8')], [
    DataTable.dataTable({
      model: model.table,
      toParentMessage: message => GotDataTableMessage({ message }),
      rows: payments,
      columns,
      rowKey: row => row.id,${filter ? "\n      filterText: row => `${row.status} ${row.email}`,\n      filterPlaceholder: 'Filter payments…'," : ''}
      enableRowSelection: true,
      enableColumnVisibility: true,
      pageSizeOptions: [5, 10, 20],
      ariaLabel: 'Payments',
    }, h),
  ]),
})`,
});

const GotDataTablePreviewMessage = m('GotDataTablePreviewMessage', { message: DataTable.Message });
type GotDataTablePreviewMessage = typeof GotDataTablePreviewMessage.Type;
const DataTablePreviewModel = S.Struct({ _docsPage: S.Literal('data-table'), table: DataTable.Model });
type DataTablePreviewModel = typeof DataTablePreviewModel.Type;
const previewProgram = definePreviewProgram<DataTablePreviewModel, GotDataTablePreviewMessage>({
  Model: DataTablePreviewModel, Message: GotDataTablePreviewMessage,
  init: () => ({ _docsPage: 'data-table', table: DataTable.init(5) }),
  update: (model, message) => [{ ...model, table: DataTable.update(model.table, message.message) }, []],
  view: (index, model, h) => DataTable.dataTable({ model: model.table, toParentMessage: message => GotDataTablePreviewMessage({ message }), rows: payments, columns: columns(), rowKey: row => row.id, ...(index === 1 ? { filterText: (row: Payment) => `${row.status} ${row.email}`, filterPlaceholder: 'Filter payments…' } : {}), enableRowSelection: true, enableColumnVisibility: true, pageSizeOptions: [5, 10, 20], ariaLabel: 'Payments' }, h),
});

export const dataTablePage = authoredPage({
  slug: 'data-table', title: 'Data Table', kind: 'recipe',
  previewProgram,
  definition: {
    kind: 'recipe', description: 'A typed, controlled data-grid recipe with filtering, sorting, selection, column visibility, formatting, and pagination.',
    architecture: 'The application owns rows and typed column definitions. DataTable.Model stores interaction state—filter text, sort choice, page size, selected row keys, and hidden column keys—and its pure update is delegated by the parent.',
    apiHref: 'https://foldkit.dev/guide/state',
    composition: 'Parent Model\n├── domain rows\n└── DataTable interaction Model\n    ├── filter query\n    ├── sort key + direction\n    ├── page + page size\n    ├── selected row keys\n    └── hidden column keys\nView inputs\n└── typed columns, keys, formatting',
    styling: 'Column definitions own alignment classes and cell formatting. The table keeps an overflow boundary; place it in a width-aware container on narrow screens.',
    accessibility: 'Use a descriptive table label, stable row keys, and text equivalents for formatted values. Sortable headers expose aria-sort and remain keyboard-operable buttons.',
    keyboard: [['Tab', 'Moves through the filter, sortable headers, and pagination controls.'], ['Enter / Space', 'Changes sort direction or activates pagination.']],
    examples: [
      { title: 'Sortable payments', description: 'Typed columns provide renderers and comparable values while update owns sort direction and page reset.',  code: source('Sortable payments', 5, false), previewClass: 'justify-stretch' },
      { title: 'Filter and paginate', description: 'Filtering derives from parent-owned rows, resets the current page, and paginates the resulting collection.',  code: source('Filter and paginate', 5, true), previewClass: 'justify-stretch' },
    ],
  },
});

