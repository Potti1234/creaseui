import type { Cell, ColumnDef, Row, Table } from '@tanstack/table-core'
import {
  createTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/table-core'
import { Checkbox as CheckboxPrimitive } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as State from '@/lib/tanstack-table-state'
import { button } from '../button'
import { inline, stack, text } from '../composition'
import { className } from '../style'
import { styles } from './data-table.stylex'

export * from '@/lib/tanstack-table-state'

export type TanStackDataTableColumn<Data, Message> = Readonly<{
  id: string
  header: string
  value: (row: Data) => string | number
  cell?: (row: Data, h: HtmlBuilder<Message>) => Html | string
  aggregate?: (value: unknown) => string
  canGroup?: boolean
  canHide?: boolean
  canSort?: boolean
  size?: number
  minSize?: number
}>

export type TanStackDataTableFacet = Readonly<{
  columnId: string
  label: string
  options: ReadonlyArray<string>
}>

export type TanStackDataTableFeature = Readonly<{
  columnId: string
  label: string
}>

export type TanStackDataTableSizing = TanStackDataTableFeature & Readonly<{
  min: number
  max: number
  step: number
}>

export type TanStackDataTableProps<Data, Message> = Readonly<{
  ariaLabel: string
  columns: ReadonlyArray<TanStackDataTableColumn<Data, Message>>
  model: State.Model
  rows: ReadonlyArray<Data>
  rowKey: (row: Data) => string
  toParentMessage: (message: State.Message) => Message
  emptyText?: string
  filterPlaceholder?: string
  pageSizeOptions?: ReadonlyArray<number>
  facet?: TanStackDataTableFacet
  grouping?: TanStackDataTableFeature
  pinnedColumn?: TanStackDataTableFeature
  sizing?: TanStackDataTableSizing
  enableColumnOrder?: boolean
  enableColumnVisibility?: boolean
  enableDensity?: boolean
  enableRowPinning?: boolean
  enableRowSelection?: boolean
}>

const truthMap = (values: ReadonlyArray<string>): Record<string, boolean> =>
  Object.fromEntries(values.map((value) => [value, true]))

const hiddenMap = (values: ReadonlyArray<string>): Record<string, boolean> =>
  Object.fromEntries(values.map((value) => [value, false]))

export const createTanStackTable = <Data, Message>(
  props: TanStackDataTableProps<Data, Message>,
): Table<Data> => {
  const columns: Array<ColumnDef<Data>> = [
    ...(props.enableRowSelection === false ? [] : [{ id: 'select', header: '', enableHiding: false, enableGrouping: false, enableSorting: false, size: 48 } satisfies ColumnDef<Data>]),
    ...props.columns.map((column): ColumnDef<Data> => ({
      id: column.id,
      accessorFn: column.value,
      header: column.header,
      enableGrouping: column.canGroup ?? true,
      enableHiding: column.canHide ?? true,
      enableSorting: column.canSort ?? true,
      ...(column.aggregate === undefined ? {} : { aggregationFn: 'sum' }),
      ...(column.minSize === undefined ? {} : { minSize: column.minSize }),
      ...(column.size === undefined ? {} : { size: column.size }),
      ...(props.facet?.columnId === column.id ? { filterFn: 'equalsString' } : {}),
    })),
  ]
  return createTable<Data>({
    autoResetAll: false,
    columns,
    data: [...props.rows],
    enableMultiSort: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: (row) => row.subRows.length > 0,
    getRowId: props.rowKey,
    keepPinnedRows: true,
    onStateChange: () => undefined,
    renderFallbackValue: '—',
    state: {
      columnFilters: props.facet === undefined || props.model.statusFilter === '' ? [] : [{ id: props.facet.columnId, value: props.model.statusFilter }],
      columnOrder: [...props.model.columnOrder],
      columnPinning: { left: [...props.model.pinnedColumnIds], right: [] },
      columnSizing: Object.fromEntries([
        ['select', 48],
        ...(props.sizing === undefined ? [] : [[props.sizing.columnId, props.model.titleWidth] as const]),
      ]),
      columnVisibility: hiddenMap(props.model.hiddenColumnIds),
      expanded: truthMap(props.model.expandedRowIds),
      globalFilter: props.model.globalFilter,
      grouping: [...props.model.grouping],
      pagination: { pageIndex: props.model.pageIndex, pageSize: props.model.pageSize },
      rowPinning: { top: [...props.model.pinnedRowIds], bottom: [] },
      rowSelection: truthMap(props.model.selectedRowIds),
      sorting: props.model.sorting.map((sort) => ({ ...sort })),
    },
  })
}

const selectionControl = <Message>(
  props: Readonly<{ id: string; label: string; checked: boolean; indeterminate?: boolean; onToggle: (checked: boolean) => Message }>,
  h: HtmlBuilder<Message>,
): Html => CheckboxPrimitive.view({
  id: props.id,
  isChecked: props.checked,
  isDisabled: false,
  isIndeterminate: props.indeterminate ?? false,
  onToggle: props.onToggle,
  toView: ({ checkbox }) => h.button(
    [...checkbox, h.Type('button'), h.AriaLabel(props.label), h.Class(className(styles.checkboxButton))],
    [h.span([h.Class(className(styles.checkboxBox, (props.checked || props.indeterminate === true) && styles.checkboxBoxChecked))], [props.checked || props.indeterminate === true ? '✓' : ''])],
  ),
}, h)

const sortingLabel = (sorting: ReadonlyArray<State.Sort>, id: string): string => {
  const index = sorting.findIndex((sort) => sort.id === id)
  if (index < 0) return 'Not sorted'
  return `${sorting[index]?.desc === true ? 'Descending' : 'Ascending'}, priority ${index + 1}`
}

const cellAttributes = <Data, Message>(cell: Cell<Data, unknown>, model: State.Model, h: HtmlBuilder<Message>) => {
  const pinned = cell.column.getIsPinned()
  return [
    h.Class(className(styles.cell, model.density === 'compact' && styles.cellCompact, pinned && styles.pinned)),
    h.Style({
      ...(pinned === 'left' ? { left: `${cell.column.getStart('left')}px` } : {}),
      width: `${cell.column.getSize()}px`,
    }),
  ]
}

const cellValue = <Data, Message>(
  row: Row<Data>,
  cell: Cell<Data, unknown>,
  props: TanStackDataTableProps<Data, Message>,
  columns: ReadonlyMap<string, TanStackDataTableColumn<Data, Message>>,
  h: HtmlBuilder<Message>,
): Html | string => {
  if (cell.getIsPlaceholder()) return ''
  if (cell.getIsGrouped()) {
    const expanded = row.getIsExpanded()
    return h.button(
      [h.Type('button'), h.OnClick(props.toParentMessage(State.ToggledExpanded({ rowId: row.id }))), h.AriaExpanded(expanded), h.Class(className(styles.sortButton))],
      [`${expanded ? '▾' : '▸'} ${String(cell.getValue())} (${row.subRows.length})`],
    )
  }
  const column = columns.get(cell.column.id)
  if (cell.getIsAggregated()) {
    const value = cell.getValue()
    return column?.aggregate?.(value) ?? (value === undefined ? '—' : String(value))
  }
  if (cell.column.id === 'select') return selectionControl({
    id: `select-${row.id}`,
    label: `Select row ${row.id}`,
    checked: row.getIsSelected(),
    onToggle: (checked) => props.toParentMessage(State.ToggledRow({ rowId: row.id, isSelected: checked })),
  }, h)
  return column?.cell?.(row.original, h) ?? String(cell.getValue())
}

const columnChooser = <Data, Message>(
  table: Table<Data>,
  props: TanStackDataTableProps<Data, Message>,
  h: HtmlBuilder<Message>,
): Html => h.details(
  [h.Class(className(styles.chooser))],
  [
    h.summary(
      [h.Class(className(styles.chooserSummary))],
      [props.enableColumnOrder === false ? 'Columns' : 'Columns & order'],
    ),
    h.div(
      [h.Class(className(styles.chooserPanel))],
      table.getAllLeafColumns().filter((column) => column.id !== 'select').map((column) =>
        h.div([h.Class(className(styles.option))], [
          selectionControl({
            id: `column-${column.id}`,
            label: `${column.getIsVisible() ? 'Hide' : 'Show'} ${column.id}`,
            checked: column.getIsVisible(),
            onToggle: (checked) => props.toParentMessage(State.ToggledColumn({ columnId: column.id, isVisible: checked })),
          }, h),
          h.span([], [String(column.columnDef.header)]),
          ...(props.enableColumnOrder === false ? [] : [
            button({ children: ['←'], size: 'icon', variant: 'ghost', onClick: props.toParentMessage(State.MovedColumn({ columnId: column.id, direction: 'left' })) }, h),
            button({ children: ['→'], size: 'icon', variant: 'ghost', onClick: props.toParentMessage(State.MovedColumn({ columnId: column.id, direction: 'right' })) }, h),
          ]),
        ])),
    ),
  ],
)

export const tanStackDataTable = <Data, Message>(
  props: TanStackDataTableProps<Data, Message>,
  h: HtmlBuilder<Message>,
): Html => {
  const table = createTanStackTable(props)
  const columns = new Map(props.columns.map((column) => [column.id, column]))
  const visibleRows = [...table.getTopRows(), ...table.getCenterRows(), ...table.getBottomRows()]
  const pageRows = table.getRowModel().rows
  const selectablePageIds = pageRows.filter((row) => !row.getIsGrouped()).map((row) => row.id)
  const selectedOnPage = selectablePageIds.filter((id) => props.model.selectedRowIds.includes(id))
  const allSelected = selectablePageIds.length > 0 && selectedOnPage.length === selectablePageIds.length
  const someSelected = selectedOnPage.length > 0 && !allSelected
  const pageCount = Math.max(1, table.getPageCount())
  const visibleColumnCount = table.getVisibleLeafColumns().length
  const pageSizes = [...new Set([...(props.pageSizeOptions ?? [10, 20, 50]), props.model.pageSize])].sort((left, right) => left - right)

  return stack({ gap: 'md', children: [
    inline({ align: 'end', gap: 'sm', wrap: true, width: 'full', children: [
      h.div([], [h.label([h.For(`${props.ariaLabel}-search`)], [text({ as: 'span', children: ['Search'], variant: 'caption' }, h)]), h.input([h.Id(`${props.ariaLabel}-search`), h.Type('search'), h.Value(props.model.globalFilter), h.OnInput((value) => props.toParentMessage(State.ChangedGlobalFilter({ value }))), h.Placeholder(props.filterPlaceholder ?? 'Search rows…'), h.Class(className(styles.filter))])]),
      ...(props.facet === undefined ? [] : [h.div([], [h.label([h.For(`${props.ariaLabel}-facet`)], [text({ as: 'span', children: [props.facet.label], variant: 'caption' }, h)]), h.select([h.Id(`${props.ariaLabel}-facet`), h.Value(props.model.statusFilter), h.OnChange((value) => props.toParentMessage(State.ChangedStatusFilter({ value }))), h.Class(className(styles.select))], [h.option([h.Value('')], [`All ${props.facet.label.toLocaleLowerCase()}`]), ...props.facet.options.map((option) => h.option([h.Value(option)], [`${option} (${String(table.getColumn(props.facet?.columnId ?? '')?.getFacetedUniqueValues().get(option) ?? 0)})`]))])])]),
      ...(props.grouping === undefined ? [] : [button({ children: [props.model.grouping.includes(props.grouping.columnId) ? `Ungroup ${props.grouping.label}` : `Group by ${props.grouping.label}`], variant: props.model.grouping.includes(props.grouping.columnId) ? 'default' : 'outline', onClick: props.toParentMessage(State.ToggledGrouping({ columnId: props.grouping.columnId })) }, h)]),
      ...(props.pinnedColumn === undefined ? [] : [button({ children: [props.model.pinnedColumnIds.includes(props.pinnedColumn.columnId) ? `Unpin ${props.pinnedColumn.label}` : `Pin ${props.pinnedColumn.label}`], variant: 'outline', onClick: props.toParentMessage(State.ToggledColumnPin({ columnId: props.pinnedColumn.columnId })) }, h)]),
      ...(props.enableColumnVisibility === false ? [] : [columnChooser(table, props, h)]),
    ] }, h),
    ...((props.sizing === undefined && props.enableDensity !== true) ? [] : [inline({
      align: 'center',
      gap: 'md',
      wrap: true,
      children: [
        ...(props.sizing === undefined ? [] : [h.label([], [
          text({ children: [`${props.sizing.label} ${props.model.titleWidth}px`], tone: 'secondary', variant: 'caption' }, h),
          h.input([
            h.Type('range'),
            h.Min(String(props.sizing.min)),
            h.Max(String(props.sizing.max)),
            h.Step(String(props.sizing.step)),
            h.Value(String(props.model.titleWidth)),
            h.OnInput((value) => props.toParentMessage(State.ChangedTitleWidth({ width: Number(value) }))),
            h.Class(className(styles.range)),
          ]),
        ])]),
        ...(props.enableDensity !== true ? [] : [h.label([], [
          text({ children: ['Density'], tone: 'secondary', variant: 'caption' }, h),
          h.select(
            [h.Value(props.model.density), h.OnChange((value) => props.toParentMessage(State.ChangedDensity({ density: value === 'compact' ? 'compact' : 'comfortable' }))), h.Class(className(styles.select))],
            [h.option([h.Value('comfortable')], ['Comfortable']), h.option([h.Value('compact')], ['Compact'])],
          ),
        ])]),
        text({ children: ['Click headers to build a multi-sort. Third click removes a sort.'], tone: 'secondary', variant: 'caption' }, h),
      ],
    }, h)]),
    h.div([h.Class(className(styles.tableShell))], [h.table([h.AriaLabel(props.ariaLabel), h.Class(className(styles.table))], [
      h.thead([h.Class(className(styles.header))], table.getHeaderGroups().map((headerGroup) => h.tr([h.Key(headerGroup.id)], headerGroup.headers.map((header) => {
        const column = header.column
        const pinned = column.getIsPinned()
        const sort = props.model.sorting.find((entry) => entry.id === column.id)
        const content = column.id === 'select'
          ? selectionControl({ id: `${props.ariaLabel}-select-page`, label: allSelected ? 'Deselect current page' : 'Select current page', checked: allSelected, indeterminate: someSelected, onToggle: (checked) => props.toParentMessage(State.ToggledRows({ rowIds: selectablePageIds, isSelected: checked })) }, h)
          : column.getCanSort()
            ? h.button([h.Type('button'), h.OnClick(props.toParentMessage(State.ChangedSorting({ sorting: State.nextSorting(props.model.sorting, column.id) }))), h.AriaLabel(`${String(column.columnDef.header)}. ${sortingLabel(props.model.sorting, column.id)}`), h.Class(className(styles.sortButton))], [String(column.columnDef.header), sort === undefined ? ' ↕' : sort.desc ? ' ↓' : ' ↑', ...(sort === undefined ? [] : [` ${String(props.model.sorting.indexOf(sort) + 1)}`])])
            : String(column.columnDef.header)
        return h.th([h.Scope('col'), h.Class(className(styles.head, pinned && styles.pinned)), h.Style({ ...(pinned === 'left' ? { left: `${column.getStart('left')}px` } : {}), width: `${column.getSize()}px` })], [content])
      })) )),
      h.tbody([], visibleRows.length === 0 ? [h.tr([], [h.td([h.Colspan(visibleColumnCount), h.Class(className(styles.empty))], [props.emptyText ?? 'No matching rows.'])])] : visibleRows.map((row) => h.tr([h.Key(`${String(row.getIsPinned() || 'center')}-${row.id}`), ...(row.getIsSelected() ? [h.DataAttribute('selected', '')] : []), h.Class(className(styles.row, row.getIsSelected() && styles.rowSelected, row.getIsPinned() && styles.pinnedRow))], row.getVisibleCells().map((cell) => h.td(cellAttributes(cell, props.model, h), [cellValue(row, cell, props, columns, h)]))))),
    ])]),
    inline({ align: 'center', justify: 'between', gap: 'md', wrap: true, width: 'full', children: [
      inline({ align: 'center', gap: 'sm', wrap: true, children: [text({ children: [`${props.model.selectedRowIds.length} selected · ${table.getFilteredRowModel().rows.length} filtered`], tone: 'secondary', variant: 'caption' }, h), ...(props.enableRowPinning !== true || props.model.selectedRowIds.length === 0 ? [] : [button({ children: [props.model.pinnedRowIds.includes(props.model.selectedRowIds[0] ?? '') ? 'Unpin first selected' : 'Pin first selected'], size: 'sm', variant: 'outline', onClick: props.toParentMessage(State.ToggledRowPin({ rowId: props.model.selectedRowIds[0] ?? '' })) }, h)])] }, h),
      inline({ align: 'center', gap: 'sm', wrap: true, children: [h.label([h.For(`${props.ariaLabel}-page-size`)], ['Rows']), h.select([h.Id(`${props.ariaLabel}-page-size`), h.Value(String(props.model.pageSize)), h.OnChange((value) => props.toParentMessage(State.ChangedPageSize({ pageSize: Number(value) }))), h.Class(className(styles.select))], pageSizes.map((size) => h.option([h.Value(String(size))], [String(size)]))), text({ children: [`Page ${props.model.pageIndex + 1} of ${pageCount}`], variant: 'label' }, h), button({ children: ['First'], size: 'sm', variant: 'outline', isDisabled: !table.getCanPreviousPage(), onClick: props.toParentMessage(State.ChangedPage({ pageIndex: 0 })) }, h), button({ children: ['Previous'], size: 'sm', variant: 'outline', isDisabled: !table.getCanPreviousPage(), onClick: props.toParentMessage(State.ChangedPage({ pageIndex: props.model.pageIndex - 1 })) }, h), button({ children: ['Next'], size: 'sm', variant: 'outline', isDisabled: !table.getCanNextPage(), onClick: props.toParentMessage(State.ChangedPage({ pageIndex: props.model.pageIndex + 1 })) }, h), button({ children: ['Last'], size: 'sm', variant: 'outline', isDisabled: !table.getCanNextPage(), onClick: props.toParentMessage(State.ChangedPage({ pageIndex: pageCount - 1 })) }, h)] }, h),
    ] }, h),
  ] }, h)
}
