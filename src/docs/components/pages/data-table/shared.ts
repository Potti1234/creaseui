import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export type Payment = Readonly<{ id: string; status: string; email: string; amount: number }>;
export const payments: ReadonlyArray<Payment> = [
  { id: '728ed52f', status: 'success', email: 'm@example.com', amount: 100 },
  { id: '489e1d42', status: 'pending', email: 'a@example.com', amount: 125 },
  { id: 'f7a4b3c2', status: 'processing', email: 's@example.com', amount: 250 },
  { id: 'aa91df03', status: 'success', email: 'j@example.com', amount: 75 },
  { id: '6dc9a830', status: 'failed', email: 'r@example.com', amount: 340 },
  { id: '4cb3d780', status: 'pending', email: 't@example.com', amount: 88 },
];

export const dataTableFixtures = [
  { title: 'Sortable payments', description: 'Typed columns provide renderers and comparable values while update owns sort direction and page reset.', filter: false, server: false },
  { title: 'Filter and paginate', description: 'Filtering derives from parent-owned rows, resets the current page, and paginates the resulting collection.', filter: true, server: false },
  { title: 'Server-owned query', description: 'Server mode keeps query state controlled while rowCount describes pagination beyond the currently loaded rows.', filter: false, server: true },
] as const;

const source = (fixture: (typeof dataTableFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const stylex = renderer === 'stylex';
  return foldkitApplication({
    title: `Data Table — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
${stylex ? "import * as stylex from '@stylexjs/stylex'\n" : ''}
import * as DataTable from '@/${stylex ? 'stylex' : 'ui'}/data-table'`,
    model: `type Payment = Readonly<{ id: string; status: string; email: string; amount: number }>

const payments: ReadonlyArray<Payment> = ${JSON.stringify(payments, null, 2)}

export const Model = S.Struct({ table: DataTable.Model })
export type Model = typeof Model.Type`,
    messages: `export const GotDataTableMessage = m('GotDataTableMessage${tag}', { message: DataTable.Message })
export const Message = S.Union([GotDataTableMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [{ table: DataTable.init(5) }, []]`,
    update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotDataTableMessage${tag}': return [{ ...model, table: DataTable.update(model.table, message.message) }, []]
  }
}`,
    view: `${stylex ? "const styles = stylex.create({ amount: { display: 'block', textAlign: 'right' } })\n\n" : ''}const columns${stylex ? ' = (h: HtmlBuilder<Message>): ReadonlyArray<DataTable.DataTableColumn<Payment>> =>' : ': ReadonlyArray<DataTable.DataTableColumn<Payment>> ='} [
  { key: 'status', header: 'Status', cell: row => row.status, sortValue: row => row.status },
  { key: 'email', header: 'Email', cell: row => row.email, sortValue: row => row.email },
  { key: 'amount', header: 'Amount', ${stylex ? "cell: row => h.span([h.Class(stylex.props(styles.amount).className ?? '')], [`$${row.amount.toFixed(2)}`])" : "class: 'text-right', cell: row => `$${row.amount.toFixed(2)}`"}, sortValue: row => row.amount },
]

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Data Table — ${fixture.title}',
  body: h.main([], [DataTable.dataTable({ model: model.table, toParentMessage: message => GotDataTableMessage({ message }), rows: payments, columns${stylex ? '(h)' : ''}, rowKey: row => row.id,${fixture.filter ? " filterText: row => `${row.status} ${row.email}`, filterPlaceholder: 'Filter payments…'," : ''}${fixture.server ? " mode: 'server', rowCount: 42," : ''} enableRowSelection: true, enableColumnVisibility: true, pageSizeOptions: [5, 10, 20], ariaLabel: 'Payments' }, h)]),
})`,
  });
};

export const dataTableExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => dataTableFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: source(fixture, renderer), previewClass: 'justify-stretch' }));
