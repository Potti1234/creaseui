import { Style, When } from '@pleat/core'
import { reset } from '@/pleat/reset'
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Checkbox as CheckboxPrimitive } from '@foldkit/ui'

import {
  type Message,
  type Model,
  Message as DataTableStateMessages,
} from '@/lib/data-table-state'
import { projectDataTable, type DataTableMode } from '@/lib/data-table-adapter'
import * as Icon from '@/lib/icon'
import { buttonVisualStyles } from './button'
import type { ComponentLayoutStyle } from './contracts'
import { input } from './input'
import * as Pagination from './pagination'
import { className } from './style'
import { complexTokens } from './complex-tokens'
import { foundationTokens } from './foundations-tokens'
import { tokens } from './tokens'
import * as Table from './table'

export * from '@/lib/data-table-state'

export type DataTableColumn<Row> = Readonly<{
  key: string
  header: string
  cell: (row: Row) => Html | string
  sortValue?: (row: Row) => string | number
  isHideable?: boolean
  align?: 'left' | 'center' | 'right'
  layoutStyle?: ComponentLayoutStyle | undefined
}>
export type DataTableProps<Row, Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  rows: ReadonlyArray<Row>
  columns: ReadonlyArray<DataTableColumn<Row>>
  rowKey: (row: Row) => string
  filterText?: (row: Row) => string
  filterPlaceholder?: string
  emptyText?: string
  ariaLabel?: string
  id?: string
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  isRowSelectable?: (row: Row) => boolean
  rowSelectionLabel?: (row: Row) => string
  pageSizeOptions?: ReadonlyArray<number>
  mode?: DataTableMode
  rowCount?: number
  /** Additional filters or bulk actions, between search and column visibility. */
  toolbarContent?: ReadonlyArray<Html | string>
  layoutStyle?: ComponentLayoutStyle | undefined
}>

// The Tailwind `shadow-md` serializes with the theme's base ring/border
// shadows — overriding tokens.shadowCard verbatim so both renderers produce
// the identical box-shadow on the open column chooser.
const SHADOW_MD =
  'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px'

const styles = {
  alignLeft: Style.make({ textAlign: 'left' }),
  alignCenter: Style.make({ textAlign: 'center' }),
  alignRight: Style.make({ textAlign: 'right' }),
  cell: Style.make({
    paddingBlock: '0.75rem',
    paddingInline: '0.75rem',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  }),
  chooser: Style.make({ position: 'relative', marginLeft: 'auto' }),
  chooserOption: Style.make({
    gap: '0.25rem',
    alignItems: 'center',
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    minHeight: '2.5rem',
  }),
  chooserPanel: Style.make({
    padding: '0.375rem',
    borderColor: tokens.border,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: tokens.card,
    boxShadow: tokens.shadowCard,
    position: 'absolute',
    zIndex: 20,
    minWidth: '12rem',
    right: 0,
    top: 'calc(100% + 0.375rem)',
  }),
  chooserSummary: Style.make({
    gap: '0.5rem',
    paddingInline: '0.75rem',
    display: 'flex',
    height: '2.5rem',
  }),
  count: Style.make({
    color: tokens.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  }),
  empty: Style.make({
    color: tokens.mutedForeground,
    textAlign: 'center',
    height: '6rem',
  }),
  filter: Style.make({
    paddingInline: '0.75rem',
    height: '2.5rem',
    maxWidth: '24rem',
  }),
  footer: Style.make({
    gap: '1rem',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  }),
  head: Style.make({
    paddingInline: '0.5rem',
    color: tokens.foreground,
    fontWeight: 500,
    textAlign: 'start',
    verticalAlign: 'middle',
    height: '2.5rem',
  }),
  headerRow: Style.make({
    borderBottomColor: tokens.border,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  }),
  pageLabel: Style.make({
    fontSize: '0.875rem',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 500,
    lineHeight: '1.25rem',
    whiteSpace: 'nowrap',
  }),
  root: Style.make({ width: '100%' }),
  row: Style.make({
    backgroundColor: tokens.transparent,
    transitionProperty: 'color, background-color',
    borderBottomColor: tokens.border,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  }).pipe(
    Style.when(When.hover, { backgroundColor: complexTokens.mutedSurface }),
    Style.when(When.lastChild, { borderBottomWidth: 0 }),
  ),
  rowSelected: Style.make({ backgroundColor: complexTokens.mutedSurface }),
  select: Style.make({
    borderColor: tokens.border,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    paddingInline: '0.5rem',
    backgroundColor: tokens.background,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    height: '2.5rem',
  }),
  selectionBox: Style.make({
    borderColor: tokens.input,
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: tokens.background,
    color: tokens.primaryForeground,
    display: 'flex',
    justifyContent: 'center',
    height: '1rem',
    width: '1rem',
  }),
  selectionBoxChecked: Style.make({
    borderColor: tokens.primary,
    backgroundColor: tokens.primary,
  }),
  selectionButton: Style.make({
    padding: 0,
    borderWidth: 0,
    alignItems: 'center',
    backgroundColor: tokens.transparent,
    display: 'inline-flex',
    justifyContent: 'center',
    opacity: 1,
    height: '2.5rem',
    width: '2.5rem',
  }).pipe(Style.when(When.disabled, { opacity: 0.5 })),
  selectionCell: Style.make({ padding: 0, textAlign: 'center', width: '3rem' }),
  selectionIcon: Style.make({ height: '0.75rem', width: '0.75rem' }),
  sort: Style.make({
    borderRadius: foundationTokens.radiusSm,
    gap: '0.25rem',
    alignItems: 'center',
    display: 'inline-flex',
    outlineColor: tokens.transparent,
    outlineStyle: 'none',
    outlineWidth: 0,
  }).pipe(
    Style.when(When.focusVisible, {
      outlineColor: tokens.ring,
      outlineStyle: 'solid',
      outlineWidth: 2,
    }),
  ),
  sortIcon: Style.make({
    color: tokens.mutedForeground,
    flexShrink: 0,
    height: '0.875rem',
    width: '0.875rem',
  }),
  sortArrowActive: Style.make({ color: tokens.primary }),
  tableShell: Style.make({
    borderColor: tokens.border,
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: '1rem',
  }),
  controls: Style.make({
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  }),
  toolbar: Style.make({
    gap: '0.75rem',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  }),
}

const selectionControl = <Msg>(
  props: Readonly<{
    id: string
    label: string
    isChecked: boolean
    isIndeterminate?: boolean
    isDisabled?: boolean
    onToggle: (isChecked: boolean) => Msg
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
            h.Class(className(reset.button, styles.selectionButton)),
          ],
          [
            h.span(
              [
                h.Class(
                  className(
                    styles.selectionBox,
                    (props.isChecked || props.isIndeterminate === true) &&
                      styles.selectionBoxChecked,
                  ),
                ),
                h.Style({ borderRadius: '4px' }),
              ],
              [
                props.isChecked || props.isIndeterminate === true
                  ? Icon.check<Msg>(
                      { class: className(styles.selectionIcon) },
                      h,
                    )
                  : '',
              ],
            ),
          ],
        ),
    },
    h,
  )

const columnAlignStyle = (align: DataTableColumn<unknown>['align']) =>
  align === 'right'
    ? styles.alignRight
    : align === 'center'
      ? styles.alignCenter
      : align === 'left'
        ? styles.alignLeft
        : undefined

export const dataTable = <Row, Msg>(
  props: DataTableProps<Row, Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const instanceId =
    props.id ??
    `data-table-${(props.ariaLabel ?? 'rows').toLocaleLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`
  const projection = projectDataTable({
    columns: props.columns,
    ...(props.filterText === undefined ? {} : { filterText: props.filterText }),
    ...(props.isRowSelectable === undefined
      ? {}
      : { isRowSelectable: props.isRowSelectable }),
    ...(props.mode === undefined ? {} : { mode: props.mode }),
    model: props.model,
    ...(props.rowCount === undefined ? {} : { rowCount: props.rowCount }),
    rowKey: props.rowKey,
    rows: props.rows,
  })
  const {
    filteredRowCount,
    page,
    pageCount,
    rows: visible,
    selectableRowKeys: selectableKeys,
    selectedRowCount: selectedCount,
  } = projection
  const hiddenKeys = new Set(props.model.hiddenColumnKeys)
  const visibleColumns = props.columns.filter(
    column => !hiddenKeys.has(column.key),
  )
  const selectedKeys = new Set(props.model.selectedRowKeys)
  const selectedOnPage = selectableKeys.filter(key => selectedKeys.has(key))
  const allOnPageSelected =
    selectableKeys.length > 0 && selectedOnPage.length === selectableKeys.length
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected
  const columnCount =
    visibleColumns.length + (props.enableRowSelection === true ? 1 : 0)
  const headings = visibleColumns.map(column =>
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
          className(
            reset.tableHeading,
            styles.head,
            columnAlignStyle(column.align),
            column.layoutStyle,
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
                    DataTableStateMessages.Sorted({ key: column.key }),
                  ),
                ),
                h.Class(className(reset.button, styles.sort)),
              ],
              [
                column.header,
                h.svg(
                  [
                    h.ViewBox('0 0 24 24'),
                    h.Fill('none'),
                    h.Stroke('currentColor'),
                    h.StrokeWidth('2'),
                    h.StrokeLinecap('round'),
                    h.StrokeLinejoin('round'),
                    h.AriaHidden(true),
                    h.Class(className(styles.sortIcon)),
                  ],
                  [
                    h.path(
                      [
                        h.D('m7 15 5 5 5-5'),
                        h.Class(
                          className(
                            props.model.sortKey === column.key &&
                              props.model.sortDirection === 'descending' &&
                              styles.sortArrowActive,
                          ),
                        ),
                      ],
                      [],
                    ),
                    h.path(
                      [
                        h.D('m7 9 5-5 5 5'),
                        h.Class(
                          className(
                            props.model.sortKey === column.key &&
                              props.model.sortDirection === 'ascending' &&
                              styles.sortArrowActive,
                          ),
                        ),
                      ],
                      [],
                    ),
                  ],
                ),
              ],
            ),
          ],
    ),
  )
  const bodyRows =
    visible.length === 0
      ? [
          h.tr(
            [],
            [
              h.td(
                [h.Colspan(columnCount), h.Class(className(styles.empty))],
                [props.emptyText ?? 'No results.'],
              ),
            ],
          ),
        ]
      : visible.map(row => {
          const key = props.rowKey(row)
          const isSelected = selectedKeys.has(key)
          const isSelectable = props.isRowSelectable?.(row) ?? true
          return h.tr(
            [
              h.Key(key),
              ...(isSelected ? [h.DataAttribute('selected', '')] : []),
              h.Class(className(styles.row, isSelected && styles.rowSelected)),
            ],
            [
              ...(props.enableRowSelection === true
                ? [
                    h.td(
                      [h.Class(className(styles.selectionCell))],
                      [
                        selectionControl(
                          {
                            id: `${instanceId}-row-${key}`,
                            label:
                              props.rowSelectionLabel?.(row) ??
                              `Select row ${key}`,
                            isChecked: isSelected,
                            isDisabled: !isSelectable,
                            onToggle: isChecked =>
                              props.toParentMessage(
                                DataTableStateMessages.ToggledRow({
                                  key,
                                  isSelected: isChecked,
                                }),
                              ),
                          },
                          h,
                        ),
                      ],
                    ),
                  ]
                : []),
              ...visibleColumns.map(column =>
                h.td(
                  [
                    h.Class(
                      className(
                        styles.cell,
                        columnAlignStyle(column.align),
                        column.layoutStyle,
                      ),
                    ),
                  ],
                  [column.cell(row)],
                ),
              ),
            ],
          )
        })
  const pageSizes = [
    ...new Set(
      [...(props.pageSizeOptions ?? [10, 20, 50]), props.model.pageSize].filter(
        size => size > 0,
      ),
    ),
  ].sort((left, right) => left - right)
  return h.div(
    [
      h.DataAttribute('slot', 'data-table'),
      h.Class(className(styles.root, props.layoutStyle)),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'data-table-toolbar'),
          h.Class(className(styles.toolbar)),
        ],
        [
          ...(props.filterText === undefined
            ? []
            : [
                input(
                  {
                    id: `${instanceId}-filter`,
                    type: 'search',
                    value: props.model.filter,
                    onInput: value =>
                      props.toParentMessage(
                        DataTableStateMessages.Filtered({ value }),
                      ),
                    placeholder: props.filterPlaceholder ?? 'Filter rows…',
                    ariaLabel: props.filterPlaceholder ?? 'Filter rows',
                    inputStyle: styles.filter,
                  },
                  h,
                ),
              ]),
          ...(props.toolbarContent ?? []),
          ...(props.enableColumnVisibility === true
            ? [
                h.div(
                  [
                    h.Class(className(styles.chooser)),
                    h.OnKeyDownPreventDefault(key =>
                      key === 'Escape' && props.model.columnsMenuOpen
                        ? Option.some(
                            props.toParentMessage(
                              DataTableStateMessages.ClosedColumnsMenu(),
                            ),
                          )
                        : Option.none(),
                    ),
                  ],
                  [
                    h.button(
                      [
                        h.Type('button'),
                        h.AriaExpanded(props.model.columnsMenuOpen),
                        h.AriaHasPopup('menu'),
                        h.OnClick(
                          props.toParentMessage(
                            DataTableStateMessages.ToggledColumnsMenu(),
                          ),
                        ),
                        h.Class(
                          className(
                            reset.button,
                            ...buttonVisualStyles({ variant: 'outline' }),
                            styles.chooserSummary,
                          ),
                        ),
                      ],
                      [
                        'Columns',
                        Icon.chevronDown<Msg>(
                          { class: className(styles.sortIcon) },
                          h,
                        ),
                      ],
                    ),
                    ...(props.model.columnsMenuOpen
                      ? [
                          h.button(
                            [
                              h.Class(className(reset.button)),
                              h.Type('button'),
                              h.Tabindex(-1),
                              h.AriaHidden(true),
                              h.Style({
                                position: 'fixed',
                                inset: '0',
                                zIndex: '10',
                                cursor: 'default',
                                border: 'none',
                                background: 'transparent',
                              }),
                              h.OnClick(
                                props.toParentMessage(
                                  DataTableStateMessages.ClosedColumnsMenu(),
                                ),
                              ),
                            ],
                            [],
                          ),
                          h.div(
                            [
                              h.Class(className(styles.chooserPanel)),
                              h.Style({ boxShadow: SHADOW_MD }),
                            ],
                            props.columns
                              .filter(
                                column =>
                                  column.isHideable !== false &&
                                  column.header.trim() !== '',
                              )
                              .map(column => {
                                const isVisible = !hiddenKeys.has(column.key)
                                return h.div(
                                  [h.Class(className(styles.chooserOption))],
                                  [
                                    selectionControl(
                                      {
                                        id: `data-table-column-${column.key}`,
                                        label: `${isVisible ? 'Hide' : 'Show'} ${column.header} column`,
                                        isChecked: isVisible,
                                        isDisabled:
                                          isVisible &&
                                          visibleColumns.length === 1,
                                        onToggle: nextVisible =>
                                          props.toParentMessage(
                                            DataTableStateMessages.ToggledColumn(
                                              {
                                                key: column.key,
                                                isVisible: nextVisible,
                                              },
                                            ),
                                          ),
                                      },
                                      h,
                                    ),
                                    column.header,
                                  ],
                                )
                              }),
                          ),
                        ]
                      : []),
                  ],
                ),
              ]
            : []),
        ],
      ),
      h.div(
        [h.Class(className(styles.tableShell))],
        [
          Table.table(
            {
              ariaLabel: props.ariaLabel,
              children: [
                h.thead(
                  [],
                  [
                    h.tr(
                      [h.Class(className(styles.headerRow))],
                      [
                        ...(props.enableRowSelection === true
                          ? [
                              h.th(
                                [
                                  h.Scope('col'),
                                  h.Class(
                                    className(
                                      reset.tableHeading,
                                      styles.selectionCell,
                                    ),
                                  ),
                                ],
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
                                      onToggle: isSelected =>
                                        props.toParentMessage(
                                          DataTableStateMessages.ToggledRows({
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
                        ...headings,
                      ],
                    ),
                  ],
                ),
                h.tbody([], bodyRows),
              ],
            },
            h,
          ),
        ],
      ),
      h.div(
        [h.Class(className(styles.footer))],
        [
          h.p(
            [h.Class(className(reset.text, styles.count))],
            [
              props.enableRowSelection === true
                ? `${selectedCount} of ${filteredRowCount} row${filteredRowCount === 1 ? '' : 's'} selected.`
                : `${filteredRowCount} row${filteredRowCount === 1 ? '' : 's'}`,
            ],
          ),
          h.div(
            [h.Class(className(styles.controls))],
            [
              h.label(
                [
                  h.Class(className(styles.count)),
                  h.For(`${instanceId}-page-size`),
                ],
                ['Rows per page'],
              ),
              h.select(
                [
                  h.Id(`${instanceId}-page-size`),
                  h.Value(String(props.model.pageSize)),
                  h.OnChange(value =>
                    props.toParentMessage(
                      DataTableStateMessages.ChangedPageSize({
                        pageSize: Number(value),
                      }),
                    ),
                  ),
                  h.Class(className(reset.input, styles.select)),
                ],
                pageSizes.map(size =>
                  h.option([h.Value(String(size))], [String(size)]),
                ),
              ),
              h.span(
                [h.Class(className(styles.pageLabel))],
                [`Page ${page + 1} of ${pageCount}`],
              ),
              h.div(
                [],
                [
                  Pagination.paginationPages(
                    {
                      page: page + 1,
                      totalPages: pageCount,
                      siblingCount: 0,
                      ariaLabel: `${props.ariaLabel ?? 'Rows'} pagination`,
                      navigation: {
                        kind: 'action',
                        onNavigate: page =>
                          props.toParentMessage(
                            DataTableStateMessages.ChangedPage({
                              page: page - 1,
                            }),
                          ),
                      },
                    },
                    h,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
