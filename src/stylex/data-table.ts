import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Checkbox as CheckboxPrimitive } from '@foldkit/ui'

import { ChangedPage, ChangedPageSize, Filtered, Sorted, ToggledColumn, ToggledRow, ToggledRows, type Message, type Model } from '@/lib/data-table-state'
import { projectDataTable, type DataTableMode } from '@/lib/data-table-adapter'
import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { complexTokens } from './complex-tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { tokens } from './tokens.stylex'
import * as Table from './table'

export * from '@/lib/data-table-state'

export type DataTableColumn<Row> = Readonly<{ key: string; header: string; cell: (row: Row) => Html | string; sortValue?: (row: Row) => string | number; isHideable?: boolean; layoutStyle?: ComponentLayoutStyle }>
export type DataTableProps<Row, Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; rows: ReadonlyArray<Row>; columns: ReadonlyArray<DataTableColumn<Row>>; rowKey: (row: Row) => string; filterText?: (row: Row) => string; filterPlaceholder?: string; emptyText?: string; ariaLabel?: string; id?: string; enableRowSelection?: boolean; enableColumnVisibility?: boolean; isRowSelectable?: (row: Row) => boolean; rowSelectionLabel?: (row: Row) => string; pageSizeOptions?: ReadonlyArray<number>; mode?: DataTableMode; rowCount?: number; layoutStyle?: ComponentLayoutStyle }>

const styles = stylex.create({
  button: { borderColor: tokens.border, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, paddingInline: '0.75rem', backgroundColor: { default: tokens.background, ':hover': complexTokens.mutedSurface, ':active': complexTokens.mutedSurface }, fontSize: '0.875rem', fontWeight: 500, opacity: { default: 1, ':disabled': 0.5 }, transform: { default: 'scale(1)', ':active': interactionTokens.pressTransformTactile }, transitionDuration: interactionTokens.motionFast, transitionProperty: 'transform, background-color', height: '2.5rem', },
  cell: { paddingBlock: '0.75rem', paddingInline: '0.75rem', verticalAlign: 'middle', whiteSpace: 'nowrap' },
  chooser: { position: 'relative', marginLeft: 'auto', },
  chooserOption: { gap: '0.25rem', alignItems: 'center', display: 'flex', fontSize: '0.875rem', minHeight: '2.5rem' },
  chooserPanel: { padding: '0.375rem', borderColor: tokens.border, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, backgroundColor: tokens.card, boxShadow: tokens.shadowCard, position: 'absolute', zIndex: 20, minWidth: '12rem', right: 0, top: 'calc(100% + 0.375rem)', },
  chooserSummary: { borderColor: tokens.border, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, gap: '0.5rem', listStyle: 'none', paddingInline: '0.75rem', alignItems: 'center', backgroundColor: { default: tokens.background, ':hover': complexTokens.mutedSurface }, cursor: interactionTokens.cursorAction, display: 'flex', fontSize: '0.875rem', fontWeight: 500, height: '2.5rem', },
  count: { color: tokens.mutedForeground, fontSize: '0.875rem' },
  empty: { color: tokens.mutedForeground, textAlign: 'center', height: '6rem', },
  filter: { borderColor: { default: tokens.input, ':focus-visible': tokens.ring }, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, paddingInline: '0.75rem', backgroundColor: tokens.transparent, boxShadow: { default: tokens.shadowSm, ':focus-visible': tokens.focusRingShadow }, fontSize: '0.875rem', outlineStyle: 'none', height: '2.5rem', maxWidth: '24rem', width: '100%', },
  footer: { gap: '1rem', alignItems: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', },
  head: { paddingInline: '0.75rem', color: tokens.mutedForeground, fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.025em', textAlign: 'left', textTransform: 'uppercase', verticalAlign: 'middle', whiteSpace: 'nowrap', height: '2.75rem', },
  header: { backgroundColor: complexTokens.mutedSurface },
  pageLabel: { fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums', fontWeight: 500, whiteSpace: 'nowrap' },
  root: { gap: '1rem', display: 'flex', flexDirection: 'column', width: '100%', },
  row: { backgroundColor: { default: tokens.transparent, ':hover': complexTokens.mutedSurface }, transitionProperty: 'color, background-color', borderBottomColor: tokens.border, borderBottomStyle: 'solid', borderBottomWidth: 1, },
  rowSelected: { backgroundColor: complexTokens.mutedSurface },
  select: { borderColor: tokens.border, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, paddingInline: '0.5rem', backgroundColor: tokens.background, fontSize: '0.875rem', height: '2.5rem' },
  selectionBox: { borderColor: tokens.input, borderRadius: complexTokens.smallRadius, borderStyle: 'solid', borderWidth: 1, alignItems: 'center', backgroundColor: tokens.background, color: tokens.primaryForeground, display: 'flex', justifyContent: 'center', height: '1rem', width: '1rem' },
  selectionBoxChecked: { borderColor: tokens.primary, backgroundColor: tokens.primary },
  selectionButton: { padding: 0, borderWidth: 0, alignItems: 'center', backgroundColor: tokens.transparent, display: 'inline-flex', justifyContent: 'center', opacity: { default: 1, ':disabled': 0.5 }, height: '2.5rem', width: '2.5rem', },
  selectionCell: { padding: 0, textAlign: 'center', width: '3rem' },
  selectionIcon: { height: '0.75rem', width: '0.75rem' },
  sort: { borderRadius: tokens.controlRadius, gap: '0.25rem', alignItems: 'center', display: 'inline-flex', outlineColor: { default: tokens.transparent, ':focus-visible': tokens.ring }, outlineStyle: { default: 'none', ':focus-visible': 'solid' }, outlineWidth: { default: 0, ':focus-visible': 2 }, },
  sortIcon: { height: '0.875rem', width: '0.875rem' },
  tableShell: { borderColor: tokens.border, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, overflowX: 'auto' },
  controls: { gap: '0.5rem', alignItems: 'center', display: 'flex', flexWrap: 'wrap', },
  toolbar: { gap: '0.75rem', alignItems: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' },
})

const selectionControl = <Msg>(props: Readonly<{ id: string; label: string; isChecked: boolean; isIndeterminate?: boolean; isDisabled?: boolean; onToggle: (isChecked: boolean) => Msg }>, h: HtmlBuilder<Msg>): Html => CheckboxPrimitive.view({ id: props.id, isChecked: props.isChecked, isIndeterminate: props.isIndeterminate ?? false, isDisabled: props.isDisabled ?? false, onToggle: props.onToggle, toView: ({ checkbox }) => h.button([...checkbox, h.Type('button'), h.AriaLabel(props.label), h.Class(className(styles.selectionButton))], [h.span([h.Class(className(styles.selectionBox, (props.isChecked || props.isIndeterminate === true) && styles.selectionBoxChecked))], [(props.isChecked || props.isIndeterminate === true) ? Icon.check<Msg>({ class: className(styles.selectionIcon) }, h) : ''])]) }, h)

export const dataTable = <Row, Msg>(props: DataTableProps<Row, Msg>, h: HtmlBuilder<Msg>): Html => {
  const instanceId = props.id ?? `data-table-${(props.ariaLabel ?? 'rows').toLocaleLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`
  const projection = projectDataTable({ columns: props.columns, ...(props.filterText === undefined ? {} : { filterText: props.filterText }), ...(props.isRowSelectable === undefined ? {} : { isRowSelectable: props.isRowSelectable }), ...(props.mode === undefined ? {} : { mode: props.mode }), model: props.model, ...(props.rowCount === undefined ? {} : { rowCount: props.rowCount }), rowKey: props.rowKey, rows: props.rows })
  const { filteredRowCount, page, pageCount, rows: visible, selectableRowKeys: selectableKeys, selectedRowCount: selectedCount } = projection
  const hiddenKeys = new Set(props.model.hiddenColumnKeys)
  const visibleColumns = props.columns.filter((column) => !hiddenKeys.has(column.key))
  const selectedKeys = new Set(props.model.selectedRowKeys)
  const selectedOnPage = selectableKeys.filter((key) => selectedKeys.has(key))
  const allOnPageSelected = selectableKeys.length > 0 && selectedOnPage.length === selectableKeys.length
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected
  const columnCount = visibleColumns.length + (props.enableRowSelection === true ? 1 : 0)
  const headings = visibleColumns.map((column) => h.th(
    [h.Scope('col'), ...(column.sortValue === undefined ? [] : [h.AriaSort(props.model.sortKey === column.key ? props.model.sortDirection : 'none')]), h.Class(className(styles.head, column.layoutStyle))],
    column.sortValue === undefined ? [column.header] : [h.button([h.Type('button'), h.OnClick(props.toParentMessage(Sorted({ key: column.key }))), h.Class(className(styles.sort))], [column.header, Icon.chevronsUpDown<Msg>({ class: className(styles.sortIcon) }, h)])],
  ))
  const bodyRows = visible.length === 0
    ? [h.tr([], [h.td([h.Colspan(columnCount), h.Class(className(styles.empty))], [props.emptyText ?? 'No results.'])])]
    : visible.map((row) => { const key = props.rowKey(row); const isSelected = selectedKeys.has(key); const isSelectable = props.isRowSelectable?.(row) ?? true; return h.tr([h.Key(key), ...(isSelected ? [h.DataAttribute('selected', '')] : []), h.Class(className(styles.row, isSelected && styles.rowSelected))], [...(props.enableRowSelection === true ? [h.td([h.Class(className(styles.selectionCell))], [selectionControl({ id: `${instanceId}-row-${key}`, label: props.rowSelectionLabel?.(row) ?? `Select row ${key}`, isChecked: isSelected, isDisabled: !isSelectable, onToggle: (isChecked) => props.toParentMessage(ToggledRow({ key, isSelected: isChecked })) }, h)])] : []), ...visibleColumns.map((column) => h.td([h.Class(className(styles.cell, column.layoutStyle))], [column.cell(row)]))]) })
  const pageSizes = [...new Set([...(props.pageSizeOptions ?? [10, 20, 50]), props.model.pageSize].filter((size) => size > 0))].sort((left, right) => left - right)
  return h.div([h.DataAttribute('slot', 'data-table'), ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]), h.Class(className(styles.root, props.layoutStyle))], [
    h.div([h.Class(className(styles.toolbar))], [
      ...(props.filterText === undefined ? [] : [h.input([h.Type('search'), h.Value(props.model.filter), h.OnInput((value) => props.toParentMessage(Filtered({ value }))), h.Placeholder(props.filterPlaceholder ?? 'Filter rows…'), h.AriaLabel(props.filterPlaceholder ?? 'Filter rows'), h.Class(className(styles.filter))])]),
      ...(props.enableColumnVisibility === true ? [h.details([h.Class(className(styles.chooser))], [h.summary([h.Class(className(styles.chooserSummary))], ['Columns', Icon.chevronDown<Msg>({ class: className(styles.sortIcon) }, h)]), h.div([h.Class(className(styles.chooserPanel))], props.columns.filter((column) => column.isHideable !== false && column.header.trim() !== '').map((column) => { const isVisible = !hiddenKeys.has(column.key); return h.div([h.Class(className(styles.chooserOption))], [selectionControl({ id: `data-table-column-${column.key}`, label: `${isVisible ? 'Hide' : 'Show'} ${column.header} column`, isChecked: isVisible, isDisabled: isVisible && visibleColumns.length === 1, onToggle: (nextVisible) => props.toParentMessage(ToggledColumn({ key: column.key, isVisible: nextVisible })) }, h), column.header]) }))])] : []),
    ]),
    h.div([h.Class(className(styles.tableShell))], [Table.table({ children: [
      h.thead([h.Class(className(styles.header))], [h.tr([], [...(props.enableRowSelection === true ? [h.th([h.Scope('col'), h.Class(className(styles.selectionCell))], [selectionControl({ id: `${instanceId}-select-page`, label: allOnPageSelected ? 'Deselect all rows on this page' : 'Select all rows on this page', isChecked: allOnPageSelected, isIndeterminate: someOnPageSelected, isDisabled: selectableKeys.length === 0, onToggle: (isSelected) => props.toParentMessage(ToggledRows({ keys: selectableKeys, isSelected })) }, h)])] : []), ...headings])]),
      h.tbody([], bodyRows),
    ] }, h)]),
    h.div([h.Class(className(styles.footer))], [h.p([h.Class(className(styles.count))], [props.enableRowSelection === true ? `${selectedCount} of ${filteredRowCount} row${filteredRowCount === 1 ? '' : 's'} selected.` : `${filteredRowCount} row${filteredRowCount === 1 ? '' : 's'}`]), h.div([h.Class(className(styles.controls))], [h.label([h.Class(className(styles.count)), h.For(`${instanceId}-page-size`)], ['Rows per page']), h.select([h.Id(`${instanceId}-page-size`), h.Value(String(props.model.pageSize)), h.OnChange((value) => props.toParentMessage(ChangedPageSize({ pageSize: Number(value) }))), h.Class(className(styles.select))], pageSizes.map((size) => h.option([h.Value(String(size))], [String(size)]))), h.span([h.Class(className(styles.pageLabel))], [`Page ${page + 1} of ${pageCount}`]), h.button([h.Type('button'), h.AriaLabel('First page'), h.Disabled(page === 0), h.OnClick(props.toParentMessage(ChangedPage({ page: 0 }))), h.Class(className(styles.button))], ['First']), h.button([h.Type('button'), h.AriaLabel('Previous page'), h.Disabled(page === 0), h.OnClick(props.toParentMessage(ChangedPage({ page: page - 1 }))), h.Class(className(styles.button))], ['Previous']), h.button([h.Type('button'), h.AriaLabel('Next page'), h.Disabled(page >= pageCount - 1), h.OnClick(props.toParentMessage(ChangedPage({ page: page + 1 }))), h.Class(className(styles.button))], ['Next']), h.button([h.Type('button'), h.AriaLabel('Last page'), h.Disabled(page >= pageCount - 1), h.OnClick(props.toParentMessage(ChangedPage({ page: pageCount - 1 }))), h.Class(className(styles.button))], ['Last'])])]),
  ])
}
