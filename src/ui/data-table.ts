import type { Html, HtmlBuilder } from 'foldkit/html';
import { Checkbox as CheckboxPrimitive } from '@foldkit/ui';

import { ChangedPage, ChangedPageSize, Filtered, Sorted, ToggledColumn, ToggledRow, ToggledRows, type Message, type Model } from '@/lib/data-table-state';
import { projectDataTable, type DataTableMode } from '@/lib/data-table-adapter';
import * as Icon from '@/lib/icon';
import { cn } from '@/lib/utils';
import * as Table from '@/ui/table';

export * from '@/lib/data-table-state';

export type DataTableColumn<Row> = Readonly<{
  key: string;
  header: string;
  cell: (row: Row) => Html | string;
  sortValue?: (row: Row) => string | number;
  isHideable?: boolean;
  class?: string;
}>;

export type DataTableProps<Row, Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  rows: ReadonlyArray<Row>;
  columns: ReadonlyArray<DataTableColumn<Row>>;
  rowKey: (row: Row) => string;
  filterText?: (row: Row) => string;
  filterPlaceholder?: string;
  emptyText?: string;
  ariaLabel?: string;
  id?: string;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  isRowSelectable?: (row: Row) => boolean;
  rowSelectionLabel?: (row: Row) => string;
  pageSizeOptions?: ReadonlyArray<number>;
  mode?: DataTableMode;
  rowCount?: number;
  class?: string;
}>;

const selectionControl = <Msg>(
  props: Readonly<{
    id: string;
    label: string;
    isChecked: boolean;
    isIndeterminate?: boolean;
    isDisabled?: boolean;
    onToggle: (isChecked: boolean) => Msg;
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  CheckboxPrimitive.view(
    {
      id: props.id,
      isChecked: props.isChecked,
      isIndeterminate: props.isIndeterminate ?? false,
      isDisabled: props.isDisabled ?? false,
      onToggle: props.onToggle,
      toView: ({ checkbox }) =>
        h.button(
          [
            ...checkbox,
            h.Type('button'),
            h.AriaLabel(props.label),
            h.Class('inline-flex size-10 items-center justify-center bg-transparent disabled:opacity-50'),
          ],
          [
            h.span(
              [
                h.Class(
                  cn(
                    'inline-flex size-4 items-center justify-center rounded-[4px] border border-input bg-background text-primary-foreground',
                    (props.isChecked || props.isIndeterminate === true) &&
                      'border-primary bg-primary',
                  ),
                ),
              ],
              props.isChecked || props.isIndeterminate === true
                ? [Icon.check<Msg>({ class: 'size-3' }, h)]
                : [],
            ),
          ],
        ),
    },
    h,
  );

export const dataTable = <Row, Msg>(
  props: DataTableProps<Row, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const instanceId = props.id ?? `data-table-${(props.ariaLabel ?? 'rows').toLocaleLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;
  const projection = projectDataTable({
    columns: props.columns,
    ...(props.filterText === undefined ? {} : { filterText: props.filterText }),
    ...(props.isRowSelectable === undefined ? {} : { isRowSelectable: props.isRowSelectable }),
    ...(props.mode === undefined ? {} : { mode: props.mode }),
    model: props.model,
    ...(props.rowCount === undefined ? {} : { rowCount: props.rowCount }),
    rowKey: props.rowKey,
    rows: props.rows,
  });
  const { filteredRowCount, page, pageCount, rows: visible, selectableRowKeys: selectableKeys, selectedRowCount: selectedCount } = projection;
  const hiddenKeys = new Set(props.model.hiddenColumnKeys);
  const visibleColumns = props.columns.filter(
    (column) => !hiddenKeys.has(column.key),
  );
  const selectedKeys = new Set(props.model.selectedRowKeys);
  const selectedOnPage = selectableKeys.filter((key) => selectedKeys.has(key));
  const allOnPageSelected =
    selectableKeys.length > 0 && selectedOnPage.length === selectableKeys.length;
  const someOnPageSelected =
    selectedOnPage.length > 0 && !allOnPageSelected;
  const columnCount =
    visibleColumns.length + (props.enableRowSelection === true ? 1 : 0);
  const pageSizes = [
    ...new Set(
      [...(props.pageSizeOptions ?? [10, 20, 50]), props.model.pageSize].filter(
        (size) => size > 0,
      ),
    ),
  ].sort((left, right) => left - right);

  return h.div(
    [
      h.DataAttribute('slot', 'data-table'),
      h.Class(cn('w-full space-y-4', props.class)),
    ],
    [
      h.div(
        [h.Class('flex flex-wrap items-center justify-between gap-3')],
        [
          ...(props.filterText === undefined
            ? []
            : [
                h.input([
                  h.Type('search'),
                  h.Value(props.model.filter),
                  h.OnInput((value) =>
                    props.toParentMessage(Filtered({ value })),
                  ),
                  h.Placeholder(props.filterPlaceholder ?? 'Filter rows…'),
                  h.AriaLabel(props.filterPlaceholder ?? 'Filter rows'),
                  h.Class(
                    'h-10 w-full max-w-sm rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  ),
                ]),
              ]),
          ...(props.enableColumnVisibility === true
            ? [
                h.details(
                  [h.Class('relative ml-auto')],
                  [
                    h.summary(
                      [
                        h.Class(
                          'flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted/50',
                        ),
                      ],
                      [
                        'Columns',
                        Icon.chevronDown<Msg>({ class: 'size-3.5' }, h),
                      ],
                    ),
                    h.div(
                      [
                        h.Class(
                          'absolute right-0 top-[calc(100%+0.375rem)] z-20 min-w-48 rounded-md border bg-card p-1.5 shadow-md',
                        ),
                      ],
                      props.columns
                        .filter(
                          (column) =>
                            column.isHideable !== false &&
                            column.header.trim() !== '',
                        )
                        .map((column) => {
                          const isVisible = !hiddenKeys.has(column.key);
                          return h.div(
                            [h.Class('flex min-h-10 items-center gap-1 text-sm')],
                            [
                              selectionControl(
                                {
                                  id: `data-table-column-${column.key}`,
                                  label: `${isVisible ? 'Hide' : 'Show'} ${column.header} column`,
                                  isChecked: isVisible,
                                  isDisabled:
                                    isVisible && visibleColumns.length === 1,
                                  onToggle: (nextVisible) =>
                                    props.toParentMessage(
                                      ToggledColumn({
                                        key: column.key,
                                        isVisible: nextVisible,
                                      }),
                                    ),
                                },
                                h,
                              ),
                              column.header,
                            ],
                          );
                        }),
                    ),
                  ],
                ),
              ]
            : []),
        ],
      ),
      h.div(
        [h.Class('overflow-hidden rounded-md border')],
        [
          Table.table({ class: 'w-full', children: [
              Table.tableHeader({ children: [
                  Table.tableRow({ children:
                    [
                      ...(props.enableRowSelection === true
                        ? [
                            h.th(
                              [h.Scope('col'), h.Class('w-12 p-0 text-center')],
                              [
                                selectionControl(
                                  {
                                    id: `${instanceId}-select-page`,
                                    label: allOnPageSelected
                                      ? 'Deselect all rows on this page'
                                      : 'Select all rows on this page',
                                    isChecked: allOnPageSelected,
                                    isIndeterminate: someOnPageSelected,
                                    isDisabled: selectableKeys.length === 0,
                                    onToggle: (isSelected) =>
                                      props.toParentMessage(
                                        ToggledRows({
                                          keys: selectableKeys,
                                          isSelected,
                                        }),
                                      ),
                                  },
                                  h,
                                ),
                              ],
                            ),
                          ]
                        : []),
                      ...visibleColumns.map((column) =>
                      h.th(
                        [
                          h.Scope('col'),
                          ...(column.sortValue === undefined
                            ? []
                            : [
                                h.AriaSort(
                                  props.model.sortKey === column.key
                                    ? props.model.sortDirection
                                    : 'none',
                                ),
                              ]),
                          h.Class(
                            cn(
                              'h-10 px-2 text-left align-middle font-medium text-foreground',
                              column.class,
                            ),
                          ),
                        ],
                        column.sortValue === undefined
                          ? [column.header]
                          : [
                              h.button(
                                [
                                  h.Type('button'),
                                  h.OnClick(
                                    props.toParentMessage(
                                      Sorted({ key: column.key }),
                                    ),
                                  ),
                                  h.Class(
                                    'inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                  ),
                                ],
                                [
                                  column.header,
                                  Icon.chevronsUpDown<Msg>(
                                    { class: 'size-3.5 text-muted-foreground' },
                                    h,
                                  ),
                                ],
                              ),
                            ],
                      ),
                      ),
                    ],
                  }, h),
                ] }, h),
              Table.tableBody({ children: visible.length === 0
                  ? [
                      h.tr(
                        [],
                        [
                          h.td(
                            [
                              h.Colspan(columnCount),
                              h.Class('h-24 text-center text-muted-foreground'),
                            ],
                            [props.emptyText ?? 'No results.'],
                          ),
                        ],
                      ),
                    ]
                  : visible.map((row) => {
                      const key = props.rowKey(row);
                      const isSelected = selectedKeys.has(key);
                      const isSelectable = props.isRowSelectable?.(row) ?? true;
                      return h.tr(
                        [
                          h.Key(key),
                          ...(isSelected
                            ? [h.DataAttribute('selected', '')]
                            : []),
                          h.Class(
                            cn(
                              'border-b transition-colors hover:bg-muted/50',
                              isSelected && 'bg-muted/50',
                            ),
                          ),
                        ],
                        [
                          ...(props.enableRowSelection === true
                            ? [
                                h.td(
                                  [h.Class('w-12 p-0 text-center')],
                                  [
                                    selectionControl(
                                      {
                                        id: `${instanceId}-row-${key}`,
                                        label:
                                          props.rowSelectionLabel?.(row) ??
                                          `Select row ${key}`,
                                        isChecked: isSelected,
                                        isDisabled: !isSelectable,
                                        onToggle: (nextSelected) =>
                                          props.toParentMessage(
                                            ToggledRow({
                                              key,
                                              isSelected: nextSelected,
                                            }),
                                          ),
                                      },
                                      h,
                                    ),
                                  ],
                                ),
                              ]
                            : []),
                          ...visibleColumns.map((column) =>
                            h.td(
                              [
                                h.Class(
                                  cn(
                                    'whitespace-nowrap p-3 align-middle',
                                    column.class,
                                  ),
                                ),
                              ],
                              [column.cell(row)],
                            ),
                          ),
                        ],
                      );
                    }),
              }, h),
            ] }, h),
        ],
      ),
      h.div(
        [h.Class('flex flex-wrap items-center justify-between gap-4')],
        [
          h.p(
            [h.Class('text-sm text-muted-foreground')],
            [
              props.enableRowSelection === true
                ? `${selectedCount} of ${filteredRowCount} row${filteredRowCount === 1 ? '' : 's'} selected.`
                : `${filteredRowCount} row${filteredRowCount === 1 ? '' : 's'}`,
            ],
          ),
          h.div(
            [h.Class('flex flex-wrap items-center gap-2')],
            [
              h.label(
                [
                  h.For(`${instanceId}-page-size`),
                  h.Class('text-sm text-muted-foreground'),
                ],
                ['Rows per page'],
              ),
              h.select(
                [
                  h.Id(`${instanceId}-page-size`),
                  h.Value(String(props.model.pageSize)),
                  h.OnChange((value) =>
                    props.toParentMessage(
                      ChangedPageSize({ pageSize: Number(value) }),
                    ),
                  ),
                  h.Class('h-10 rounded-md border bg-background px-2 text-sm'),
                ],
                pageSizes.map((size) =>
                  h.option([h.Value(String(size))], [String(size)]),
                ),
              ),
              h.span(
                [h.Class('whitespace-nowrap text-sm font-medium tabular-nums')],
                [`Page ${page + 1} of ${pageCount}`],
              ),
              h.button(
                [
                  h.Type('button'),
                  h.AriaLabel('First page'),
                  h.Disabled(page === 0),
                  h.OnClick(props.toParentMessage(ChangedPage({ page: 0 }))),
                  h.Class(
                    'h-10 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50',
                  ),
                ],
                ['First'],
              ),
              h.button(
                [
                  h.Type('button'),
                  h.Disabled(page === 0),
                  h.OnClick(
                    props.toParentMessage(ChangedPage({ page: page - 1 })),
                  ),
                  h.Class(
                    'h-10 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50',
                  ),
                ],
                ['Previous'],
              ),
              h.button(
                [
                  h.Type('button'),
                  h.Disabled(page >= pageCount - 1),
                  h.OnClick(
                    props.toParentMessage(ChangedPage({ page: page + 1 })),
                  ),
                  h.Class(
                    'h-10 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50',
                  ),
                ],
                ['Next'],
              ),
              h.button(
                [
                  h.Type('button'),
                  h.AriaLabel('Last page'),
                  h.Disabled(page >= pageCount - 1),
                  h.OnClick(
                    props.toParentMessage(
                      ChangedPage({ page: pageCount - 1 }),
                    ),
                  ),
                  h.Class(
                    'h-10 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50',
                  ),
                ],
                ['Last'],
              ),
            ],
          ),
        ],
      ),
    ],
  );
};
