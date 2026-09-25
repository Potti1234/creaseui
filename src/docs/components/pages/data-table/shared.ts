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
  { title: 'Sortable payments', description: 'Typed columns provide renderers and comparable values while update owns sort direction and page reset.', filter: false, server: false, rtl: false },
  { title: 'Filter and paginate', description: 'Filtering derives from parent-owned rows, resets the current page, and paginates the resulting collection.', filter: true, server: false, rtl: false },
  { title: 'Server-owned query', description: 'Server mode keeps query state controlled while rowCount describes pagination beyond the currently loaded rows.', filter: false, server: true, rtl: false },
  { title: 'RTL', description: 'Localized headers under a dir="rtl" wrapper mirror the full table chrome.', filter: true, server: false, rtl: true },
] as const;

const source = (fixture: (typeof dataTableFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const stylex = renderer === 'stylex';
  const filterPlaceholder = fixture.rtl ? 'بحث في المدفوعات...' : 'Filter payments…';
  return foldkitApplication({
    title: `Data Table — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
${stylex ? "import * as stylex from '@stylexjs/stylex'\n" : ''}
import * as DataTable from '@/${stylex ? 'stylex' : 'ui'}/data-table'`,
    model: `type Payment = Readonly<{ id: string; status: string; email: string; amount: number }>

const payments: ReadonlyArray<Payment> = ${JSON.stringify(payments, null, 2)}

export const Model = S.Struct({ table: DataTable.Model })
export type Model = typeof Model.Type`,
    messages: `import { taggedStruct } from 'foldkit/schema'
export const GotDataTableMessage = taggedStruct('GotDataTableMessage${tag}', { message: DataTable.Message });
export const Message = S.Union([GotDataTableMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: { table: DataTable.init(5) } })`,
    update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotDataTableMessage${tag}': return { model: { ...model, table: DataTable.update(model.table, message.message) } }
  }
}`,
    view: `${stylex ? "const styles = stylex.create({ amount: { display: 'block', textAlign: 'right' } })\n\n" : ''}const columns${stylex ? ' = (h: HtmlBuilder<Message>): ReadonlyArray<DataTable.DataTableColumn<Payment>> =>' : ': ReadonlyArray<DataTable.DataTableColumn<Payment>> ='} [
  { key: 'status', header: '${fixture.rtl ? 'الحالة' : 'Status'}', cell: row => row.status, sortValue: row => row.status },
  { key: 'email', header: '${fixture.rtl ? 'البريد الإلكتروني' : 'Email'}', cell: row => row.email, sortValue: row => row.email },
  { key: 'amount', header: '${fixture.rtl ? 'المبلغ' : 'Amount'}', ${stylex ? "cell: row => h.span([h.Class(stylex.props(styles.amount).className ?? '')], [`$${row.amount.toFixed(2)}`])" : "class: 'text-right', cell: row => `$${row.amount.toFixed(2)}`"}, sortValue: row => row.amount },
]

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Data Table — ${fixture.title}',
  body: h.main([], [h.div(${fixture.rtl ? "[h.Dir('rtl')], " : '[], '}[
    DataTable.dataTable({ model: model.table, toParentMessage: message => GotDataTableMessage({ message }), rows: payments, columns${stylex ? ': columns(h)' : ''}, rowKey: row => row.id,${fixture.filter ? ` filterText: row => \`\${row.status} \${row.email}\`, filterPlaceholder: '${filterPlaceholder}',` : ''}${fixture.server ? " mode: 'server', rowCount: 42," : ''} enableRowSelection: true, enableColumnVisibility: true, pageSizeOptions: [5, 10, 20], ariaLabel: '${fixture.rtl ? 'المدفوعات' : 'Payments'}' }, h),
  ])]),
})`,
  });
};

export const dataTableExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => dataTableFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: source(fixture, renderer), previewClass: 'justify-stretch' }));
