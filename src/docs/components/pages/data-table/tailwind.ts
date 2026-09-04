import { Schema as S } from 'effect';
import { m } from 'foldkit/message';
import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { dataTableFixtures, payments, type Payment } from '@/docs/components/pages/data-table/shared';
import * as DataTable from '@/ui/data-table';

const Got = m('GotDataTablePreviewMessage', { message: DataTable.Message });
type Got = typeof Got.Type;
const Model = S.Struct({ _docsPage: S.Literal('data-table'), table: DataTable.Model });
type Model = typeof Model.Type;
const columns = (): ReadonlyArray<DataTable.DataTableColumn<Payment>> => [
  { key: 'status', header: 'Status', cell: row => row.status, sortValue: row => row.status },
  { key: 'email', header: 'Email', cell: row => row.email, sortValue: row => row.email },
  { key: 'amount', header: 'Amount', class: 'text-right', cell: row => `$${row.amount.toFixed(2)}`, sortValue: row => row.amount },
];
export const dataTableTailwindPreviewProgram = definePreviewProgram<Model, Got>({
  Model, Message: Got, init: () => ({ _docsPage: 'data-table', table: DataTable.init(5) }),
  update: (model, message) => [{ ...model, table: DataTable.update(model.table, message.message) }, []],
  view: (index, model, h) => { const fixture = dataTableFixtures[index] ?? dataTableFixtures[0]; return DataTable.dataTable({ id: `docs-data-table-${String(index)}`, model: model.table, toParentMessage: message => Got({ message }), rows: payments, columns: columns(), rowKey: row => row.id, ...(fixture.filter ? { filterText: (row: Payment) => `${row.status} ${row.email}`, filterPlaceholder: 'Filter payments…' } : {}), ...(fixture.server ? { mode: 'server' as const, rowCount: 42 } : {}), enableRowSelection: true, enableColumnVisibility: true, pageSizeOptions: [5, 10, 20], ariaLabel: 'Payments' }, h); },
});
