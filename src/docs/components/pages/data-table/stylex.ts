import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { dataTableFixtures, payments, type Payment } from '@/docs/components/pages/data-table/shared';
import * as DataTable from '@/stylex/data-table';
import { className } from '@/stylex/style';

const styles = stylex.create({ amount: { display: 'block', textAlign: 'right' } });

const columns = <Msg>(h: HtmlBuilder<Msg>, rtl: boolean): ReadonlyArray<DataTable.DataTableColumn<Payment>> => [
  { key: 'status', header: rtl ? 'الحالة' : 'Status', cell: row => row.status, sortValue: row => row.status },
  { key: 'email', header: rtl ? 'البريد الإلكتروني' : 'Email', cell: row => row.email, sortValue: row => row.email },
  { key: 'amount', header: rtl ? 'المبلغ' : 'Amount', cell: row => h.span([h.Class(className(styles.amount))], [`$${row.amount.toFixed(2)}`]), sortValue: row => row.amount },
];

export const dataTableStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html | undefined => {
  const fixture = dataTableFixtures[index];
  if (fixture === undefined) return undefined;
  const preview = model as { table: DataTable.Model };
  return h.div(
    fixture.rtl ? [h.Dir('rtl')] : [],
    [
      DataTable.dataTable(
        {
          id: `docs-data-table-${String(index)}`,
          model: preview.table,
          toParentMessage: message =>
            onMessageJson(
              JSON.stringify({ _tag: 'GotDataTablePreviewMessage', message }),
            ),
          rows: payments,
          columns: columns(h, fixture.rtl),
          rowKey: row => row.id,
          ...(fixture.filter
            ? {
                filterText: (row: Payment) => `${row.status} ${row.email}`,
                filterPlaceholder: fixture.rtl ? 'بحث في المدفوعات...' : 'Filter payments…',
              }
            : {}),
          ...(fixture.server ? { mode: 'server' as const, rowCount: 42 } : {}),
          enableRowSelection: true,
          enableColumnVisibility: true,
          pageSizeOptions: [5, 10, 20],
          ariaLabel: fixture.rtl ? 'المدفوعات' : 'Payments',
        },
        h,
      ),
    ],
  );
};
