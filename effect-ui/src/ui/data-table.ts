import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  DataTableAction,
  DataTableBehavior,
  projectDataTable,
  type DataTableConfig,
  type DataTableMechanicsColumn,
  type DataTableMode,
  type FilterVariant,
  type SortEntry,
} from '../behaviors/data-table'
import { PopoverBehavior } from '../behaviors/popover'
import { TableBehavior } from '../behaviors/table'
export * from '../behaviors/data-table'

type Options<Msg> = Parameters<typeof DataTableBehavior<Msg>>[1]
type Choice = { readonly value: string; readonly label: string }

export type DataTableColumn<
  Row,
  Msg,
  R = never,
> = DataTableMechanicsColumn<Row> & {
  readonly cell: (row: Row) => View.Input<Msg, R>
  readonly sortable?: boolean
  readonly isHideable?: boolean
  readonly align?: 'left' | 'center' | 'right'
  readonly className?: string
  readonly filterVariant?: FilterVariant
  readonly options?: readonly Choice[]
  readonly rangeMin?: number
  readonly rangeMax?: number
  readonly rangeStep?: number
}

export type DataTableProps<Row, Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> &
  Omit<DataTableConfig<Row>, 'columns'> & {
    readonly rows: readonly Row[]
    readonly columns: readonly DataTableColumn<Row, Msg, R>[]
    readonly mode?: DataTableMode
    readonly rowCount?: number
    readonly id?: string
    readonly ariaLabel?: string
    readonly emptyText?: string
    readonly variant?: 'faceted'
    readonly enableRowSelection?: boolean
    readonly enableColumnVisibility?: boolean
    readonly rowSelectionLabel?: (row: Row) => string
    readonly filterPlaceholder?: string
    readonly searchPlaceholder?: string
    readonly searchAriaLabel?: string
    readonly pageSizeOptions?: readonly number[]
    readonly toolbarContent?: View.Children<Msg, R>
    readonly actionBar?: (selection: readonly string[]) => View.Input<Msg, R>
    readonly rowMenu?: boolean
    readonly valueMenu?: Readonly<{
      key: string
      header: string
      options: readonly Choice[]
      get: (row: Row) => string
    }>
    readonly deleteItemLabel?: string
    readonly direction?: 'ltr' | 'rtl'
    readonly className?: string
  }

export const dataTableClasses = {
  root: 'grid min-w-0 gap-4 text-sm',
  toolbar: 'flex flex-wrap items-center gap-2',
  input:
    'h-8 min-w-0 rounded-md border border-input bg-background px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring',
  search: 'w-full max-w-56',
  button:
    'inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-sm font-medium leading-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50',
  quietButton:
    'inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-start font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50',
  danger: 'text-destructive',
  checkbox:
    'grid size-4 shrink-0 place-items-center rounded-sm border border-input bg-background p-0 text-[10px] leading-none shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 aria-[checked=true]:border-primary aria-[checked=true]:bg-primary aria-[checked=true]:text-primary-foreground aria-[checked=mixed]:border-primary aria-[checked=mixed]:bg-primary aria-[checked=mixed]:text-primary-foreground',
  frame: 'min-w-0 overflow-hidden rounded-md border [&>div]:overflow-x-auto',
  tableContainer: 'relative w-full overflow-x-auto',
  table: 'w-full border-collapse caption-bottom text-sm',
  header: 'border-b',
  row: 'border-b last:border-b-0 hover:bg-muted/50 aria-selected:bg-muted',
  head: 'h-10 px-2.5 text-start align-middle font-medium whitespace-nowrap text-foreground',
  cell: 'px-2.5 py-2 align-middle whitespace-nowrap',
  empty: 'h-24 text-center text-muted-foreground',
  footer: 'flex flex-wrap items-center justify-between gap-3',
  controls: 'flex flex-wrap items-center gap-2',
  muted: 'text-muted-foreground',
  count: 'text-muted-foreground tabular-nums',
  option:
    'inline-flex min-h-8 items-center gap-2 rounded-sm px-2 text-start hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
  panel:
    'grid w-max min-w-36 max-w-[min(var(--available-width),calc(100vw-2rem))] max-h-(--available-height) justify-items-stretch gap-1 overflow-auto rounded-md border bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none data-ending-style:invisible',
  panelLabel: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
  rowActions: 'text-end',
  filterField: 'grid gap-1 px-2 py-1.5 text-xs',
  divider: 'my-1 h-px w-full bg-border',
  alertBackdrop: 'fixed inset-0 bg-black/50 data-ending-style:invisible',
  alertViewport: 'fixed inset-0 grid place-items-center overflow-y-auto p-4',
  alert:
    'relative grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none data-ending-style:invisible',
  alertTitle: 'text-lg font-semibold',
  alertActions: 'flex flex-wrap justify-end gap-2',
}
export type DataTableClasses = typeof dataTableClasses

export const DataTable = <Row, Msg, R = never>(
  h: Html.H<Msg>,
  {
    rows,
    columns,
    rowKey,
    filterText,
    searchColumnKey,
    isRowSelectable,
    mode = 'client',
    rowCount,
    id = 'data-table',
    ariaLabel = 'Data table',
    emptyText = 'No results.',
    variant,
    enableRowSelection = false,
    enableColumnVisibility = false,
    rowSelectionLabel,
    filterPlaceholder = 'Filter rows…',
    searchPlaceholder = filterPlaceholder,
    searchAriaLabel = 'Filter rows',
    pageSizeOptions = [10, 20, 30, 40, 50],
    toolbarContent,
    actionBar,
    rowMenu = variant === 'faceted',
    valueMenu,
    deleteItemLabel = 'row',
    direction,
    className,
    ...options
  }: DataTableProps<Row, NoInfer<Msg>, R>,
  styles: DataTableClasses = dataTableClasses,
) => {
  const config: DataTableConfig<Row> = {
    columns,
    rowKey,
    ...(filterText === undefined ? {} : { filterText }),
    ...(searchColumnKey === undefined ? {} : { searchColumnKey }),
    ...(isRowSelectable === undefined ? {} : { isRowSelectable }),
  }
  const faceted = variant === 'faceted'
  const sortable = (column: DataTableColumn<Row, Msg, R>) =>
    column.sortable ??
    (column.sortValue !== undefined || (faceted && column.get !== undefined))
  const displaySearch = filterText !== undefined || faceted
  const popover = (
    key: string,
    label: string,
    title: string,
    content: View.Children<Msg, R>,
  ) =>
    PopoverBehavior(h, {
      key: `${id}-${key}`,
      props: { side: 'bottom', align: 'start', sideOffset: 4 },
      view: parts =>
        h.div.children(
          parts.trigger({
            element: h.button
              .class(styles.button)
              .attr('aria-label', label)
              .children(title),
          }),
          parts
            .portal(h.dialog.attr('aria-label', label))
            ?.children(
              parts.backdrop(h.div),
              parts
                .positioner(h.div)
                .children(
                  parts.popup(h.div.class(styles.panel)).children(content),
                ),
            ),
        ),
    })
  const choice = (value: string, label: string, selected = false) =>
    h.option
      .key(value)
      .attrs({ value, selected: selected ? '' : undefined })
      .children(label)
  const check = (checked: boolean | 'mixed', label: string, disabled = false) =>
    h.button
      .class(styles.checkbox)
      .attrs({
        role: 'checkbox',
        'aria-checked': String(checked),
        'aria-label': label,
      })
      .disabled(disabled)
      .children(checked === true ? '✓' : checked === 'mixed' ? '−' : undefined)

  return DataTableBehavior(h, {
    ...options,
    key: options.key ?? id,
    view: parts => {
      const state = parts.state
      const projection = projectDataTable({
        rows,
        config,
        state,
        mode,
        ...(rowCount === undefined ? {} : { rowCount }),
      })
      const hidden = new Set(state.hiddenColumnKeys)
      const visible = columns.filter(
        column => !hidden.has(column.key) || column.isHideable === false,
      )
      const selected = new Set(state.selectedRowKeys)
      const allOnPage =
        projection.selectableRowKeys.length > 0 &&
        projection.selectedVisibleCount === projection.selectableRowKeys.length
      const shownCols =
        visible.length + Number(enableRowSelection) + Number(rowMenu)
      const sortChange = (index: number, next: SortEntry) =>
        state.sorting.map((entry, current) =>
          index === current ? next : entry,
        )
      const sortMove = (index: number, delta: number) => {
        const sorting = [...state.sorting]
        const [entry] = sorting.splice(index, 1)
        if (entry !== undefined) sorting.splice(index + delta, 0, entry)
        return DataTableAction.SortingSet({ value: sorting })
      }
      const button = (
        label: string,
        action: DataTableAction,
        disabled = false,
      ) =>
        parts
          .button(h.button.class(styles.button).disabled(disabled), action)
          .children(label)
      const valueChoice = (keys: readonly string[], current = '') =>
        valueMenu === undefined
          ? undefined
          : parts
              .applyValue(
                h.select
                  .class(styles.input)
                  .attr('aria-label', valueMenu.header),
                keys,
                valueMenu.key,
              )
              .value(current)
              .children(
                choice('', valueMenu.header),
                valueMenu.options.map(option =>
                  choice(option.value, option.label, option.value === current),
                ),
              )

      const facets = faceted
        ? columns.flatMap(column => {
            if (column.filterVariant === undefined) return []
            const { key, header } = column
            if (column.filterVariant === 'options') {
              const selected = state.optionFilters[key] ?? []
              return [
                popover(
                  `filter-${key}`,
                  `Filter ${header}`,
                  selected.length === 0
                    ? `+ ${header}`
                    : `${header} (${selected.length})`,
                  [
                    h.span
                      .class(styles.panelLabel)
                      .children(`Filter ${header}`),
                    (column.options ?? []).map(option =>
                      parts
                        .button(
                          h.button
                            .key(option.value)
                            .class(styles.option)
                            .attrs({
                              'aria-pressed': String(
                                selected.includes(option.value),
                              ),
                            }),
                          DataTableAction.FilterOptionToggled({
                            column: key,
                            value: option.value,
                          }),
                        )
                        .children(
                          selected.includes(option.value) ? '✓ ' : undefined,
                          option.label,
                        ),
                    ),
                  ].flat(),
                ),
              ]
            }
            const number = column.filterVariant === 'range'
            const range = state.rangeFilters[key]
            const date = state.dateFilters[key]
            const active = number
              ? range?.min != null || range?.max != null
              : Boolean(date?.from || date?.to)
            return [
              popover(
                `filter-${key}`,
                `Filter ${header}`,
                active ? header : `+ ${header}`,
                [
                  h.span.class(styles.panelLabel).children(`Filter ${header}`),
                  ...(['min', 'max'] as const).map((endpoint, index) => {
                    const label = number
                      ? index === 0
                        ? 'Minimum'
                        : 'Maximum'
                      : index === 0
                        ? 'From'
                        : 'To'
                    const dateEnd = index === 0 ? 'from' : 'to'
                    const element = h.input
                      .class(styles.input)
                      .attrs({
                        type: number ? 'number' : 'date',
                        min:
                          column.rangeMin === undefined
                            ? undefined
                            : String(column.rangeMin),
                        max:
                          column.rangeMax === undefined
                            ? undefined
                            : String(column.rangeMax),
                        step:
                          column.rangeStep === undefined
                            ? undefined
                            : String(column.rangeStep),
                      })
                      .value(
                        number
                          ? String(range?.[endpoint] ?? '')
                          : (date?.[dateEnd] ?? ''),
                      )
                    return h.label
                      .key(endpoint)
                      .class(styles.filterField)
                      .children(
                        label,
                        number
                          ? parts.range(element, key, endpoint)
                          : parts.date(element, key, dateEnd),
                      )
                  }),
                ],
              ),
            ]
          })
        : []
      const toolbar =
        displaySearch ||
        faceted ||
        toolbarContent !== undefined ||
        enableColumnVisibility
          ? h.div
              .class(styles.toolbar)
              .attr('data-slot', 'data-table-toolbar')
              .children(
                displaySearch
                  ? parts.filter(
                      h.input
                        .class(styles.input, styles.search)
                        .attrs({
                          type: 'search',
                          placeholder: searchPlaceholder,
                          'aria-label': searchAriaLabel,
                        })
                        .value(state.filter),
                    )
                  : undefined,
                facets,
                projection.filterCount > 0
                  ? button('Clear filters', DataTableAction.ClearedFilters())
                  : undefined,
                toolbarContent,
                faceted
                  ? popover('sort', 'Sort columns', 'Sort', [
                      h.span.class(styles.panelLabel).children('Sort columns'),
                      ...state.sorting.map((entry, index) =>
                        h.div
                          .key(entry.id)
                          .class(styles.controls)
                          .children(
                            parts
                              .choose(
                                h.select
                                  .class(styles.input)
                                  .attr(
                                    'aria-label',
                                    `Sort column ${index + 1}`,
                                  ),
                                value =>
                                  value === ''
                                    ? undefined
                                    : DataTableAction.SortingSet({
                                        value: sortChange(index, {
                                          ...entry,
                                          id: value,
                                        }),
                                      }),
                              )
                              .value(entry.id)
                              .children(
                                columns
                                  .filter(
                                    column =>
                                      sortable(column) &&
                                      (column.key === entry.id ||
                                        !state.sorting.some(
                                          other => other.id === column.key,
                                        )),
                                  )
                                  .map(column =>
                                    choice(
                                      column.key,
                                      column.header,
                                      column.key === entry.id,
                                    ),
                                  ),
                              ),
                            parts
                              .choose(
                                h.select
                                  .class(styles.input)
                                  .attr(
                                    'aria-label',
                                    `Sort direction ${index + 1}`,
                                  ),
                                value =>
                                  DataTableAction.SortingSet({
                                    value: sortChange(index, {
                                      ...entry,
                                      desc: value === 'desc',
                                    }),
                                  }),
                              )
                              .value(entry.desc ? 'desc' : 'asc')
                              .children(
                                choice('asc', 'Ascending'),
                                choice('desc', 'Descending'),
                              ),
                            button('Move up', sortMove(index, -1), index === 0),
                            button(
                              'Move down',
                              sortMove(index, 1),
                              index === state.sorting.length - 1,
                            ),
                            button(
                              'Remove sort',
                              DataTableAction.SortingSet({
                                value: state.sorting.filter(
                                  sort => sort.id !== entry.id,
                                ),
                              }),
                            ),
                          ),
                      ),
                      parts
                        .choose(
                          h.select
                            .class(styles.input)
                            .attr('aria-label', 'Add sort column'),
                          value =>
                            value === ''
                              ? undefined
                              : DataTableAction.SortingSet({
                                  value: [
                                    ...state.sorting,
                                    { id: value, desc: false },
                                  ],
                                }),
                        )
                        .value('')
                        .children(
                          choice('', 'Add sort column', true),
                          columns
                            .filter(
                              column =>
                                sortable(column) &&
                                !state.sorting.some(
                                  entry => entry.id === column.key,
                                ),
                            )
                            .map(column => choice(column.key, column.header)),
                        ),
                      state.sorting.length > 0
                        ? button(
                            'Reset sort',
                            DataTableAction.SortingSet({ value: [] }),
                          )
                        : undefined,
                    ])
                  : undefined,
                enableColumnVisibility
                  ? popover(
                      'columns',
                      'Show and hide columns',
                      faceted ? 'View' : 'Columns',
                      [
                        h.span.class(styles.panelLabel).children('Columns'),
                        ...columns
                          .filter(column => column.isHideable !== false)
                          .map(column =>
                            parts
                              .button(
                                h.button
                                  .key(column.key)
                                  .class(styles.option)
                                  .attrs({
                                    'aria-pressed': String(
                                      !hidden.has(column.key),
                                    ),
                                  })
                                  .disabled(
                                    !hidden.has(column.key) &&
                                      visible.length <= 1,
                                  ),
                                DataTableAction.ColumnToggled({
                                  key: column.key,
                                }),
                              )
                              .children(
                                hidden.has(column.key) ? undefined : '✓ ',
                                column.header,
                              ),
                          ),
                      ],
                    )
                  : undefined,
              )
          : undefined

      const table = h.div.class(styles.frame).children(
        TableBehavior(
          h,
          {
            ariaLabel,
            className: styles.table,
            children: () => [
              h.thead.class(styles.header).children(
                h.tr.children(
                  enableRowSelection
                    ? h.th
                        .class(styles.head)
                        .attrs({ scope: 'col', 'aria-label': 'Select rows' })
                        .children(
                          parts.button(
                            check(
                              allOnPage
                                ? true
                                : projection.selectedVisibleCount > 0
                                  ? 'mixed'
                                  : false,
                              'Select all rows',
                              projection.selectableRowKeys.length === 0,
                            ),
                            DataTableAction.SelectedPage({
                              keys: projection.selectableRowKeys,
                            }),
                          ),
                        )
                    : undefined,
                  visible.map(column => {
                    const index = state.sorting.findIndex(
                      entry => entry.id === column.key,
                    )
                    const sort = state.sorting[index]
                    return h.th
                      .key(column.key)
                      .class(styles.head)
                      .attrs({
                        scope: 'col',
                        'aria-sort':
                          index === 0
                            ? sort?.desc
                              ? 'descending'
                              : 'ascending'
                            : undefined,
                      })
                      .style({ textAlign: column.align })
                      .children(
                        sortable(column)
                          ? parts
                              .sort(
                                h.button
                                  .class(styles.quietButton)
                                  .attr(
                                    'aria-label',
                                    `Sort by ${column.header}`,
                                  ),
                                column.key,
                                faceted,
                              )
                              .children(
                                column.header,
                                h.span
                                  .attr('aria-hidden', 'true')
                                  .children(
                                    sort === undefined
                                      ? '↕'
                                      : sort.desc
                                        ? '↓'
                                        : '↑',
                                  ),
                              )
                          : column.header,
                      )
                  }),
                  rowMenu
                    ? h.th
                        .class(styles.head)
                        .attrs({ scope: 'col', 'aria-label': 'Actions' })
                    : undefined,
                ),
              ),
              h.tbody.children(
                projection.rows.length === 0
                  ? h.tr.children(
                      h.td
                        .class(styles.cell, styles.empty)
                        .attr('colspan', String(Math.max(1, shownCols)))
                        .children(emptyText),
                    )
                  : projection.rows.map((row, index) => {
                      const key = rowKey(row)
                      const checked = selected.has(key)
                      const label =
                        rowSelectionLabel?.(row) ??
                        `Select row ${projection.page * projection.pageSize + index + 1}`
                      return h.tr
                        .key(key)
                        .class(styles.row)
                        .attrs({
                          'data-row-key': key,
                          'aria-selected': enableRowSelection
                            ? String(checked)
                            : undefined,
                        })
                        .children(
                          enableRowSelection
                            ? h.td
                                .class(styles.cell)
                                .children(
                                  parts.rowSelection(
                                    check(
                                      checked,
                                      label,
                                      !(isRowSelectable?.(row) ?? true),
                                    ),
                                    key,
                                    projection.selectableRowKeys,
                                  ),
                                )
                            : undefined,
                          visible.map(column =>
                            h.td
                              .key(column.key)
                              .class(styles.cell, column.className)
                              .style({ textAlign: column.align })
                              .children(column.cell(row)),
                          ),
                          rowMenu
                            ? h.td
                                .class(styles.cell, styles.rowActions)
                                .children(
                                  popover(
                                    `row-${key}`,
                                    `Actions for row ${projection.page * projection.pageSize + index + 1}`,
                                    '⋯',
                                    [
                                      parts
                                        .edit(
                                          h.button.class(styles.option),
                                          key,
                                        )
                                        .children('Edit'),
                                      valueChoice([key], valueMenu?.get(row)),
                                      h.div.class(styles.divider),
                                      parts
                                        .requestDelete(
                                          h.button.class(
                                            styles.option,
                                            styles.danger,
                                          ),
                                          [key],
                                        )
                                        .children('Delete'),
                                    ],
                                  ),
                                )
                            : undefined,
                        )
                    }),
              ),
            ],
          },
          { container: styles.tableContainer },
        ),
      )

      const page = (target: number) =>
        DataTableAction.PageChanged({ page: target })
      const deleteCount = parts.deleteKeys.length
      const deleteTitle =
        deleteCount === 1
          ? `Delete this ${deleteItemLabel}?`
          : `Delete ${deleteCount} selected rows?`
      const alert = parts.alert
      return h.div
        .class(styles.root, className)
        .attrs({ 'data-slot': 'data-table', dir: direction })
        .children(
          toolbar,
          state.selectedRowKeys.length === 0
            ? undefined
            : (actionBar?.(state.selectedRowKeys) ??
                (faceted
                  ? h.div
                      .class(styles.controls)
                      .attr('data-slot', 'data-table-actions')
                      .children(
                        h.span
                          .class(styles.count)
                          .attr('role', 'status')
                          .children(`${state.selectedRowKeys.length} selected`),
                        valueChoice(state.selectedRowKeys),
                        parts
                          .requestExport(
                            h.button.class(styles.button),
                            state.selectedRowKeys,
                          )
                          .children('Export CSV'),
                        parts
                          .requestDelete(
                            h.button.class(styles.button, styles.danger),
                            state.selectedRowKeys,
                          )
                          .children('Delete'),
                        button(
                          'Clear selection',
                          DataTableAction.SelectionSet({ keys: [] }),
                        ),
                      )
                  : undefined)),
          table,
          h.div
            .class(styles.footer)
            .attr('data-slot', 'data-table-footer')
            .children(
              h.span
                .class(styles.count)
                .attr('role', 'status')
                .children(
                  enableRowSelection
                    ? `${projection.selectedVisibleCount} of ${projection.filteredRowCount} row(s) selected.`
                    : `${projection.filteredRowCount} rows`,
                ),
              h.div.class(styles.controls).children(
                h.label.class(styles.controls).children(
                  'Rows per page',
                  parts
                    .choose(
                      h.select
                        .class(styles.input)
                        .attr('aria-label', 'Rows per page'),
                      value =>
                        DataTableAction.PageSizeChanged({
                          pageSize: Number(value),
                        }),
                    )
                    .value(String(projection.pageSize))
                    .children(
                      [...new Set([...pageSizeOptions, projection.pageSize])]
                        .filter(size => Number.isInteger(size) && size > 0)
                        .sort((a, b) => a - b)
                        .map(size =>
                          choice(
                            String(size),
                            String(size),
                            size === projection.pageSize,
                          ),
                        ),
                    ),
                ),
                h.span
                  .class(styles.count)
                  .children(
                    `Page ${projection.page + 1} of ${projection.pageCount}`,
                  ),
                faceted
                  ? button('First page', page(0), projection.page === 0)
                  : undefined,
                button(
                  'Previous',
                  page(projection.page - 1),
                  projection.page === 0,
                ),
                button(
                  'Next',
                  page(projection.page + 1),
                  projection.page >= projection.pageCount - 1,
                ),
                faceted
                  ? button(
                      'Last page',
                      page(projection.pageCount - 1),
                      projection.page >= projection.pageCount - 1,
                    )
                  : undefined,
              ),
            ),
          alert
            .portal(h.dialog.attr('data-slot', 'data-table-delete'))
            ?.forward(element => element.attr('role', 'alertdialog'))
            .children(
              alert.backdrop(h.div.class(styles.alertBackdrop)),
              alert
                .viewport(h.div.class(styles.alertViewport))
                .children(
                  alert
                    .popup(h.div.class(styles.alert))
                    .children(
                      alert
                        .title(h.h2.class(styles.alertTitle))
                        .children(deleteTitle),
                      alert
                        .description(h.p.class(styles.muted))
                        .children('This action cannot be undone.'),
                      h.div
                        .class(styles.alertActions)
                        .children(
                          alert
                            .initialFocus(
                              alert.close(h.button.class(styles.button)),
                            )
                            .children('Cancel'),
                          parts
                            .confirmDelete(
                              h.button.class(styles.button, styles.danger),
                            )
                            .children('Delete'),
                        ),
                    ),
                ),
            ),
        )
    },
  })
}
