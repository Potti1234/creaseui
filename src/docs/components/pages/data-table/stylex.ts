import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { dataTableFixtures, payments, type Payment } from '@/docs/components/pages/data-table/shared';
import * as DataTable from '@/stylex/data-table';

const styles = stylex.create({ amount: { display: 'block', textAlign: 'right' } });
const columns = <Msg>(h: HtmlBuilder<Msg>): ReadonlyArray<DataTable.DataTableColumn<Payment>> => [
  { key: 'status', header: 'Status', cell: row => row.status, sortValue: row => row.status },
  { key: 'email', header: 'Email', cell: row => row.email, sortValue: row => row.email },
  { key: 'amount', header: 'Amount', cell: row => h.span([h.Class(stylex.props(styles.amount).className ?? '')], [`$${row.amount.toFixed(2)}`]), sortValue: row => row.amount },
];
export const dataTableStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => { const fixture = dataTableFixtures[index] ?? dataTableFixtures[0]; const preview = model as { table: DataTable.Model }; return DataTable.dataTable({ id: `docs-data-table-${String(index)}`, model: preview.table, toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotDataTablePreviewMessage', message })), rows: payments, columns: columns(h), rowKey: row => row.id, ...(fixture.filter ? { filterText: (row: Payment) => `${row.status} ${row.email}`, filterPlaceholder: 'Filter payments…' } : {}), ...(fixture.server ? { mode: 'server' as const, rowCount: 42 } : {}), enableRowSelection: true, enableColumnVisibility: true, pageSizeOptions: [5, 10, 20], ariaLabel: 'Payments' }, h); };
