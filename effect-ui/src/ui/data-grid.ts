import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  DataGridBehavior,
  DataGridMessage as Message,
  rowHeights,
  type CellAddress,
  type DataGridRow,
  type FileCellData,
  type GridColumn,
  type RowHeightId,
} from '../behaviors/data-grid'
import { PopoverBehavior } from '../behaviors/popover'
import { calendarClasses, calendarView } from './calendar'
import { MenuPopup, menuStyles } from './dropdown-menu'
export * from '../behaviors/data-grid'

type Options<Msg> = Parameters<typeof DataGridBehavior<Msg>>[1]
export type DataGridColumn<Row, Msg = never, R = never> = GridColumn & {
  readonly width: number
  readonly icon?: View.Input<Msg, R>
  readonly get: (row: Row) => string
  readonly set?: (row: Row, value: string) => Row
  readonly getBoolean?: (row: Row) => boolean
  readonly getOptions?: (row: Row) => readonly string[]
  readonly getFiles?: (row: Row) => readonly FileCellData[]
  readonly setFiles?: (row: Row, files: readonly FileCellData[]) => Row
}
export type DataGridConfig<Row> = Readonly<{
  columns: readonly DataGridColumn<Row>[]
  rowKey: (row: Row) => string
  createRow?: (key: string) => Row
}>
export type DataGridProps<Row, Msg, R = never> = Omit<
  Options<Msg>,
  'props' | 'view' | 'fallback'
> & {
  /** Seed rows for this grid instance. Use a new key when replacing the dataset. */
  readonly rows: readonly Row[]
  readonly columns: readonly DataGridColumn<Row, Msg, R>[]
  readonly rowKey: (row: Row) => string
  readonly createRow?: (key: string) => Row
  readonly label?: string
  readonly id?: string
  readonly direction?: 'ltr' | 'rtl'
  readonly height?: number
  readonly defaultRowHeight?: RowHeightId
  readonly historyLimit?: number
  readonly disableEditing?: boolean
  readonly today?: string
  readonly className?: string
}

const serializeRow = <Row, Msg, R>(
  row: Row,
  key: string,
  columns: readonly DataGridColumn<Row, Msg, R>[],
): DataGridRow => ({
  key,
  values: Object.fromEntries(
    columns.map(column => [
      column.id,
      column.variant === 'checkbox' && column.getBoolean !== undefined
        ? String(column.getBoolean(row))
        : column.variant === 'multi-select' && column.getOptions !== undefined
          ? column.getOptions(row).join(', ')
          : column.get(row),
    ]),
  ),
  files: Object.fromEntries(
    columns.flatMap(column =>
      column.getFiles === undefined
        ? []
        : [[column.id, column.getFiles(row)] as const],
    ),
  ),
})

/** Reapply serialized edits to application rows without discarding other domain fields. */
export const applyDataGridRows = <Row>(
  current: readonly Row[],
  changed: readonly DataGridRow[],
  { columns, rowKey, createRow }: DataGridConfig<Row>,
): readonly Row[] => {
  const old = new Map(current.map(row => [rowKey(row), row]))
  return changed.flatMap(snapshot => {
    const original = old.get(snapshot.key) ?? createRow?.(snapshot.key)
    if (original === undefined) return []
    let row: Row = original
    for (const column of columns) {
      const value = snapshot.values[column.id]
      const files = snapshot.files[column.id]
      if (
        column.variant === 'file' &&
        column.setFiles !== undefined &&
        files !== undefined
      ) {
        const previous = column.getFiles?.(row) ?? []
        if (
          previous.length !== files.length ||
          previous.some(
            (file, index) =>
              file.id !== files[index]?.id ||
              file.name !== files[index]?.name ||
              file.size !== files[index]?.size ||
              file.type !== files[index]?.type ||
              file.url !== files[index]?.url,
          )
        )
          row = column.setFiles(row, files)
      } else if (column.set !== undefined && value !== undefined) {
        const previous = serializeRow(row, snapshot.key, [column]).values[
          column.id
        ]
        if (previous !== value) row = column.set(row, value)
      }
    }
    return [row]
  })
}

export const dataGridClasses = {
  root: 'relative grid min-w-0 gap-3 text-sm',
  toolbar: 'flex flex-wrap items-center gap-2',
  toolbarGroup: 'flex flex-wrap items-center gap-1.5',
  button:
    'inline-flex min-h-8 shrink-0 items-center justify-center gap-1 rounded-md border border-input bg-background px-2.5 text-sm font-medium leading-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50',
  quietButton:
    'inline-flex min-h-8 items-center gap-1.5 rounded-sm px-2 text-start text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50',
  input:
    'h-8 min-w-0 max-w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
  panel:
    'grid w-max min-w-40 max-w-[min(var(--available-width),calc(100vw-2rem))] max-h-(--available-height) justify-items-stretch gap-1 overflow-auto rounded-md border bg-popover p-2 text-sm text-popover-foreground shadow-md outline-none data-ending-style:invisible',
  panelRow: 'flex items-center justify-between gap-2',
  panelLabel: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
  muted: 'text-muted-foreground',
  frame: 'min-w-0 overflow-hidden rounded-md border',
  viewport:
    'relative w-full overflow-auto focus-visible:outline-2 focus-visible:outline-ring',
  table: 'min-w-full table-fixed border-separate border-spacing-0 text-sm',
  header: 'sticky top-0 z-10 bg-muted',
  head: 'h-9 border-e border-b bg-muted px-2 text-start align-middle font-medium whitespace-nowrap text-foreground last:border-e-0',
  selectHead: 'w-12',
  row: 'aria-selected:bg-muted/70',
  selectCell: 'w-12 border-e border-b px-3 align-middle',
  cell: 'relative max-w-0 border-e border-b p-0 align-middle outline-none select-none last:border-e-0 data-range:bg-primary/10 data-current:ring-2 data-current:ring-inset data-current:ring-primary data-match:bg-accent data-match-current:bg-yellow-100 data-match-current:text-black focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
  value: 'flex min-w-0 items-center gap-1.5 overflow-hidden px-2 py-1',
  text: 'truncate',
  tag: 'shrink-0 rounded border bg-background px-1.5 py-0.5 text-xs font-medium text-foreground',
  link: 'truncate text-primary underline underline-offset-2',
  check:
    'grid size-4 shrink-0 place-items-center rounded-sm border border-input bg-background p-0 text-[10px] leading-none shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[checked=true]:border-primary aria-[checked=true]:bg-primary aria-[checked=true]:text-primary-foreground aria-[checked=mixed]:border-primary aria-[checked=mixed]:bg-primary aria-[checked=mixed]:text-primary-foreground disabled:opacity-50',
  editor:
    'absolute inset-inline-start-0 top-0 z-30 grid w-max min-w-full max-w-[min(22rem,80vw)] gap-2 overflow-auto rounded-md border border-ring bg-popover p-2 text-popover-foreground shadow-md',
  editorInput: 'min-w-0 w-full',
  editorText: 'min-h-24 w-full resize-y px-2 py-1',
  search:
    'flex flex-wrap items-center gap-2 rounded-md border bg-popover p-2 text-sm text-popover-foreground',
  status: 'min-h-8 min-w-0 self-center py-1 text-muted-foreground tabular-nums',
  pill: 'mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full border bg-popover px-2 py-1 text-sm text-popover-foreground shadow-sm',
  empty: 'h-24 text-center text-muted-foreground',
}
export type DataGridClasses = typeof dataGridClasses

const safeLink = (value: string, file = false) => {
  const href = value.trim()
  const normalized = href.replace(/[\u0000-\u0020]/g, '')
  return /^(https?:\/\/|\/|#)/i.test(normalized) ||
    (file && /^blob:https?:\/\//i.test(normalized))
    ? href
    : undefined
}

export const DataGrid = <Row, Msg, R = never>(
  h: Html.H<Msg>,
  {
    rows,
    columns,
    rowKey,
    createRow,
    label = 'Data grid',
    id = 'data-grid',
    direction,
    height = 420,
    defaultRowHeight,
    historyLimit,
    disableEditing,
    today,
    className,
    ...options
  }: DataGridProps<Row, NoInfer<Msg>, R>,
  styles: DataGridClasses = dataGridClasses,
  contextStyles: typeof menuStyles = menuStyles,
  calendarStyles: typeof calendarClasses = calendarClasses,
) => {
  const data = rows.map(row => serializeRow(row, rowKey(row), columns))
  const gridColumns = columns.map(
    ({
      id,
      header,
      variant,
      options,
      numberMin,
      numberMax,
      numberStep,
      maxFiles,
      maxFileSize,
      readOnly,
    }) => ({
      id,
      header,
      variant,
      options,
      numberMin,
      numberMax,
      numberStep,
      maxFiles,
      maxFileSize,
      readOnly,
    }),
  )
  const byId = new Map(columns.map(column => [column.id, column]))
  const displayHeight = Number.isFinite(height) ? Math.max(120, height) : 420
  const choose = (value: string, label: string, selected = false) =>
    h.option
      .key(value)
      .attrs({ value, selected: selected ? '' : undefined })
      .children(label)
  const popover = (
    key: string,
    label: string,
    content: View.Children<Msg, R>,
  ) =>
    PopoverBehavior(h, {
      key: `${id}-${key}`,
      props: { side: 'bottom', align: 'start', sideOffset: 4 },
      view: parts =>
        h.div.children(
          parts.trigger({
            element: h.button.class(styles.button).children(label),
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

  return DataGridBehavior(h, {
    ...options,
    key: options.key ?? id,
    props: {
      rows: data,
      columns: gridColumns,
      direction,
      height: displayHeight,
      defaultRowHeight,
      historyLimit,
      disableEditing,
      today,
    },
    view: parts => {
      const { state, virtual, context } = parts
      const button = (
        label: string,
        message: typeof Message.Type,
        disabled = false,
      ) =>
        parts
          .button(h.button.class(styles.button).disabled(disabled), message)
          .children(label)
      const check = (value: boolean | 'mixed', label: string) =>
        h.button
          .class(styles.check)
          .attrs({
            role: 'checkbox',
            'aria-checked': String(value),
            'aria-label': label,
          })
          .children(value === true ? '✓' : value === 'mixed' ? '−' : undefined)
      const add = () => {
        const key = parts.nextKey
        const original = createRow?.(key)
        return original === undefined
          ? { key, values: {}, files: {} }
          : serializeRow(original, key, columns)
      }
      const labels = {
        short: 'Short',
        medium: 'Medium',
        tall: 'Tall',
        'extra-tall': 'Extra tall',
      } as const
      const activeFilters = Object.values(state.filters).filter(Boolean).length
      const selectedRows = new Set(state.selectedRows)
      const selectedVisible = parts.rows.filter(row =>
        selectedRows.has(row.key),
      ).length
      const allRows =
        parts.rows.length > 0 && selectedVisible === parts.rows.length
      const matching = new Set(
        parts.found.map(match => JSON.stringify([match.row, match.column])),
      )

      const toolbar = h.div
        .class(styles.toolbar)
        .attr('data-slot', 'data-grid-toolbar')
        .children(
          h.div.class(styles.toolbarGroup).children(
            button('Search', Message.SearchToggled()),
            popover(
              'filters',
              activeFilters === 0 ? 'Filter' : `Filter (${activeFilters})`,
              [
                h.span.class(styles.panelLabel).children('Filter columns'),
                ...columns.map(column =>
                  h.label
                    .key(column.id)
                    .class(styles.panelRow)
                    .children(
                      column.header,
                      parts.filter(
                        h.input
                          .class(styles.input)
                          .attrs({
                            type: 'search',
                            placeholder: `Filter ${column.header}`,
                          })
                          .value(state.filters[column.id] ?? ''),
                        column.id,
                      ),
                    ),
                ),
              ],
            ),
            popover('columns', 'Columns', [
              h.span
                .class(styles.panelLabel)
                .children('Show and reorder columns'),
              ...columns.map(column => {
                const visible = !state.hidden.includes(column.id)
                return h.div
                  .key(column.id)
                  .class(styles.panelRow)
                  .children(
                    parts
                      .button(
                        h.button
                          .class(styles.quietButton)
                          .attr('aria-pressed', String(visible))
                          .disabled(visible && parts.columns.length <= 1),
                        Message.ColumnToggled({ column: column.id }),
                      )
                      .children(visible ? '✓ ' : undefined, column.header),
                    button(
                      `Move ${column.header} earlier`,
                      Message.ColumnMoved({ column: column.id, delta: -1 }),
                    ),
                    button(
                      `Move ${column.header} later`,
                      Message.ColumnMoved({ column: column.id, delta: 1 }),
                    ),
                  )
              }),
            ]),
            h.label
              .class(styles.toolbarGroup)
              .children(
                'Row height',
                parts
                  .rowHeight(
                    h.select.class(styles.input).value(state.rowHeight),
                  )
                  .children(
                    (Object.keys(labels) as RowHeightId[]).map(value =>
                      choose(value, labels[value], state.rowHeight === value),
                    ),
                  ),
              ),
          ),
          h.div
            .class(styles.toolbarGroup)
            .children(
              button('Undo', Message.Undone(), state.undo.length === 0),
              button('Redo', Message.Redone(), state.redo.length === 0),
              disableEditing
                ? undefined
                : parts
                    .addRow(h.button.class(styles.button), add)
                    .children('Add row'),
            ),
        )
      const search = !state.searchOpen
        ? undefined
        : h.div
            .class(styles.search)
            .attr('data-slot', 'data-grid-search')
            .children(
              parts.search(
                h.input
                  .class(styles.input)
                  .attrs({
                    type: 'search',
                    'data-grid-search': '',
                    'aria-label': 'Search grid',
                    placeholder: 'Search grid…',
                  })
                  .value(state.query),
              ),
              h.span
                .class(styles.status)
                .attr('role', 'status')
                .children(
                  parts.found.length === 0
                    ? state.query === ''
                      ? 'Type to search'
                      : 'No matches'
                    : `${(state.match % parts.found.length) + 1} of ${parts.found.length} matches`,
                ),
              button(
                'Previous match',
                Message.MatchMoved({ delta: -1 }),
                parts.found.length === 0,
              ),
              button(
                'Next match',
                Message.MatchMoved({ delta: 1 }),
                parts.found.length === 0,
              ),
              button('Close search', Message.SearchToggled()),
            )
      const editorFor = (row: DataGridRow, column: GridColumn) => {
        const value = state.editing?.value ?? ''
        const file = column.variant === 'file'
        const label = `Edit ${column.header}`
        if (column.variant === 'date')
          return parts
            .fitEditor(
              h.div.class(styles.editor).attrs({
                'data-slot': 'data-grid-editor',
                'data-grid-date-editor': '',
                role: 'group',
                'aria-label': label,
              }),
            )
            .children(
              calendarView(
                h,
                parts.dateCalendar,
                { direction },
                calendarStyles,
                {},
              ),
            )
        const attrs = { 'data-grid-editor-input': '', 'aria-label': label }
        if (column.variant === 'select' || column.variant === 'multi-select') {
          const multiple = column.variant === 'multi-select'
          const selected = multiple
            ? value
                .split(',')
                .map(value => value.trim())
                .filter(Boolean)
            : [value]
          const query = state.editing?.optionQuery ?? ''
          const choices = (column.options ?? []).filter(option =>
            option
              .toLocaleLowerCase()
              .includes(query.toLocaleLowerCase().trim()),
          )
          const selectedIndex = choices.findIndex(option =>
            selected.includes(option),
          )
          const tabIndex = selectedIndex === -1 ? 0 : selectedIndex
          return parts
            .fitEditor(
              h.div.class(styles.editor).attrs({
                'data-slot': 'data-grid-editor',
                'data-grid-option-editor': '',
              }),
            )
            .children(
              multiple
                ? parts.optionSearch(
                    h.input
                      .class(styles.input)
                      .attrs({
                        ...attrs,
                        type: 'search',
                        placeholder: 'Filter options…',
                      })
                      .value(query),
                  )
                : undefined,
              h.div
                .attrs({
                  role: 'listbox',
                  'aria-label': label,
                  'aria-multiselectable': multiple ? 'true' : undefined,
                })
                .style({ display: 'grid' })
                .children(
                  choices.map((option, index) => {
                    const checked = selected.includes(option)
                    return parts
                      .button(
                        h.button
                          .key(option)
                          .class(styles.quietButton)
                          .attrs({
                            role: 'option',
                            'aria-selected': String(checked),
                            tabindex: index === tabIndex ? '0' : '-1',
                            'data-grid-editor-input':
                              !multiple && index === tabIndex ? '' : undefined,
                          }),
                        multiple
                          ? Message.OptionToggled({ value: option })
                          : Message.ValuePicked({ value: option }),
                      )
                      .children(checked ? '✓ ' : undefined, option)
                  }),
                  choices.length === 0
                    ? h.span
                        .class(styles.panelLabel)
                        .children('No matching options.')
                    : undefined,
                ),
              multiple
                ? h.div
                    .class(styles.toolbarGroup)
                    .children(
                      selected.length > 0
                        ? button(
                            'Clear all',
                            Message.OptionToggled({ value: null }),
                          )
                        : undefined,
                      button('Done', Message.Saved({ move: 'none' })),
                    )
                : undefined,
            )
        }
        const input =
          column.variant === 'long-text'
            ? parts.textarea(
                h.textarea
                  .class(styles.input, styles.editorText)
                  .attrs(attrs)
                  .value(value),
              )
            : file
              ? h.div.class(styles.toolbarGroup).children(
                  h.input.class(styles.input, styles.editorInput).attrs({
                    ...attrs,
                    type: 'file',
                    multiple: column.maxFiles === 1 ? undefined : '',
                    'data-grid-file-input': '',
                  }),
                  (row.files[column.id] ?? []).map(attachment =>
                    h.div
                      .key(attachment.id)
                      .class(styles.panelRow)
                      .children(
                        h.span.class(styles.text).children(attachment.name),
                        button(
                          `Remove ${attachment.name}`,
                          Message.FileRemoved({ id: attachment.id }),
                        ),
                      ),
                  ),
                )
              : parts.input(
                  h.input
                    .class(styles.input, styles.editorInput)
                    .attrs({
                      ...attrs,
                      type:
                        column.variant === 'number' || column.variant === 'url'
                          ? column.variant
                          : 'text',
                      min:
                        column.numberMin === undefined
                          ? undefined
                          : String(column.numberMin),
                      max:
                        column.numberMax === undefined
                          ? undefined
                          : String(column.numberMax),
                      step:
                        column.numberStep === undefined
                          ? undefined
                          : String(column.numberStep),
                    })
                    .value(value),
                )
        return parts
          .fitEditor(
            h.div
              .class(styles.editor)
              .attrs({ 'data-slot': 'data-grid-editor' }),
          )
          .children(
            input,
            h.div
              .class(styles.toolbarGroup)
              .children(
                button(file ? 'Done' : 'Save', Message.Saved({ move: 'none' })),
                file ? undefined : button('Cancel', Message.Canceled()),
              ),
          )
      }

      const cellValue = (
        row: DataGridRow,
        column: GridColumn,
        address: CellAddress,
      ) => {
        const value = row.values[column.id] ?? ''
        if (column.variant === 'checkbox')
          return parts.button(
            check(
              value === 'true',
              `${column.header}, row ${parts.rows.indexOf(row) + 1}`,
            )
              .disabled(column.readOnly === true || disableEditing === true)
              .attr('tabindex', '-1'),
            Message.BooleanToggled({ cell: address }),
          )
        if (column.variant === 'file')
          return (row.files[column.id] ?? []).map(file => {
            const href = safeLink(file.url, true)
            return href === undefined
              ? h.span.key(file.id).class(styles.tag).children(file.name)
              : h.a
                  .key(file.id)
                  .class(styles.tag, styles.link)
                  .attrs({ href, download: file.name, tabindex: '-1' })
                  .children(file.name)
          })
        if (column.variant === 'select' || column.variant === 'multi-select') {
          const values =
            column.variant === 'select'
              ? [value]
              : value.split(',').map(option => option.trim())
          return values
            .filter(Boolean)
            .map((option, index) =>
              h.span.key(String(index)).class(styles.tag).children(option),
            )
        }
        if (column.variant === 'url') {
          const href = safeLink(value)
          if (href !== undefined)
            return h.a
              .class(styles.link)
              .attrs({
                href,
                target: '_blank',
                rel: 'noopener noreferrer',
                tabindex: '-1',
              })
              .children(value)
        }
        return h.span
          .class(styles.text)
          .attr('title', value || undefined)
          .children(value)
      }
      const frame = h.div.class(styles.frame).children(
        virtual
          .viewport(
            h.div
              .class(styles.viewport)
              .attrs({
                'data-slot': 'data-grid-viewport',
                'aria-label': `${label} viewport`,
              })
              .style({ maxHeight: `${displayHeight}px` }),
          )
          .children(
            virtual
              .table(
                h.table.class(styles.table).attrs({
                  role: 'grid',
                  'aria-label': label,
                  'aria-multiselectable': 'true',
                  'aria-colcount': String(parts.columns.length + 1),
                }),
              )
              .children(
                h.colgroup.children(
                  h.col.class(styles.selectHead).style({ width: '48px' }),
                  parts.columns.map(column => {
                    const width = byId.get(column.id)?.width
                    return h.col.key(column.id).style({
                      width:
                        width === undefined || !Number.isFinite(width)
                          ? '160px'
                          : `${Math.max(64, width)}px`,
                    })
                  }),
                ),
                h.thead.class(styles.header).children(
                  h.tr.attrs({ 'aria-rowindex': '1' }).children(
                    h.th
                      .class(styles.head, styles.selectHead)
                      .attrs({ scope: 'col', 'aria-label': 'Row selection' })
                      .children(
                        parts.button(
                          check(
                            allRows
                              ? true
                              : selectedVisible > 0
                                ? 'mixed'
                                : false,
                            'Select all rows',
                          ),
                          Message.RowsToggled(),
                        ),
                      ),
                    parts.columns.map(column => {
                      const order = state.sorting.findIndex(
                        sort => sort.id === column.id,
                      )
                      const sort = state.sorting[order]
                      return h.th
                        .key(column.id)
                        .class(styles.head)
                        .attrs({
                          scope: 'col',
                          'aria-sort':
                            order === 0
                              ? sort?.desc
                                ? 'descending'
                                : 'ascending'
                              : undefined,
                        })
                        .children(
                          parts
                            .sort(
                              h.button
                                .class(styles.quietButton)
                                .attr('aria-label', `Sort by ${column.header}`),
                              column.id,
                            )
                            .children(
                              byId.get(column.id)?.icon,
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
                            ),
                        )
                    }),
                  ),
                ),
                virtual.list(h.tbody).children(
                  parts.rows.length === 0
                    ? h.tr.children(
                        h.td
                          .class(styles.empty)
                          .attr('colspan', String(parts.columns.length + 1))
                          .children('No results.'),
                      )
                    : virtual.items.map(index => {
                        const row = parts.rows[index]
                        if (row === undefined) return undefined
                        const rowSelected = selectedRows.has(row.key)
                        return virtual
                          .item({
                            index,
                            element: h.tr
                              .key(row.key)
                              .class(styles.row)
                              .attrs({
                                'aria-selected': String(rowSelected),
                                'data-row-key': row.key,
                              }),
                          })
                          .children(
                            h.td
                              .class(styles.selectCell)
                              .children(
                                parts.toggleRow(
                                  check(rowSelected, `Select row ${index + 1}`),
                                  row.key,
                                ),
                              ),
                            parts.columns.map((column, columnIndex) => {
                              const address = {
                                row: row.key,
                                column: column.id,
                              }
                              const focused =
                                parts.focus?.row === row.key &&
                                parts.focus.column === column.id
                              const editing =
                                state.editing?.cell.row === row.key &&
                                state.editing.cell.column === column.id
                              const selected = parts.selection.some(
                                ([start, stop, first, last]) =>
                                  index >= start &&
                                  index <= stop &&
                                  columnIndex >= first &&
                                  columnIndex <= last,
                              )
                              const match = matching.has(
                                JSON.stringify([row.key, column.id]),
                              )
                              return parts
                                .cell(
                                  h.td
                                    .key(column.id)
                                    .class(styles.cell)
                                    .attrs({
                                      role: 'gridcell',
                                      tabindex: focused ? '0' : '-1',
                                      'aria-selected': String(selected),
                                      'aria-readonly':
                                        disableEditing || column.readOnly
                                          ? 'true'
                                          : undefined,
                                      'data-grid-cell': '',
                                      'data-grid-row': row.key,
                                      'data-grid-column': column.id,
                                      'data-first-column':
                                        columnIndex === 0 ? '' : undefined,
                                      'data-last-column':
                                        columnIndex === parts.columns.length - 1
                                          ? ''
                                          : undefined,
                                      'data-current': focused ? '' : undefined,
                                      'data-range': selected ? '' : undefined,
                                      'data-match': match ? '' : undefined,
                                      'data-match-current':
                                        parts.searchMatch?.row === row.key &&
                                        parts.searchMatch.column === column.id
                                          ? ''
                                          : undefined,
                                    }),
                                  address,
                                )
                                .children(
                                  h.div
                                    .class(styles.value)
                                    .children(cellValue(row, column, address)),
                                  editing ? editorFor(row, column) : undefined,
                                )
                            }),
                          )
                      }),
                ),
              ),
          ),
      )
      return parts
        .root(
          h.div.class(styles.root, className).attrs({
            id,
            dir: direction,
            'data-slot': 'data-grid',
          }),
        )
        .children(
          toolbar,
          search,
          state.status === ''
            ? undefined
            : h.p
                .class(styles.status)
                .attr('role', 'status')
                .children(state.status),
          context.contextTrigger(h.div).children(frame),
          MenuPopup(
            h,
            context,
            parts.menuItems,
            {
              label: 'Cell actions',
              decorateItem: item =>
                item.value === 'delete'
                  ? { tone: 'destructive', separatorBefore: true }
                  : {},
            },
            contextStyles,
          ),
          state.selectedRows.length === 0
            ? undefined
            : h.div
                .class(styles.pill)
                .attr('data-slot', 'data-grid-selection')
                .children(
                  h.span
                    .class(styles.status)
                    .attr('role', 'status')
                    .children(`${state.selectedRows.length} selected`),
                  disableEditing
                    ? undefined
                    : button('Delete selected rows', Message.Deleted()),
                ),
        )
    },
  })
}
