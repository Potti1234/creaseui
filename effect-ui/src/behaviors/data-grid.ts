import { Command, Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Menu, VirtualList, VirtualListScrollTarget } from '@effect/ui-kit'
import { Effect, Queue, Schema, Stream } from 'effect'

export const CellVariant = Schema.Literals([
  'text',
  'number',
  'long-text',
  'select',
  'multi-select',
  'date',
  'file',
  'checkbox',
  'url',
])
export type CellVariant = typeof CellVariant.Type
export const FileCellData = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  size: Schema.Number,
  type: Schema.String,
  url: Schema.String,
})
export type FileCellData = typeof FileCellData.Type
const TextValues = Schema.Record(Schema.String, Schema.String)
const FileValues = Schema.Record(Schema.String, Schema.Array(FileCellData))
export const DataGridRow = Schema.Struct({
  key: Schema.String,
  values: TextValues,
  files: FileValues,
})
export type DataGridRow = typeof DataGridRow.Type

export const GridColumn = Schema.Struct({
  id: Schema.String,
  header: Schema.String,
  variant: CellVariant,
  options: Schema.optional(Schema.Array(Schema.String)),
  numberMin: Schema.optional(Schema.Number),
  numberMax: Schema.optional(Schema.Number),
  numberStep: Schema.optional(Schema.Number),
  maxFiles: Schema.optional(Schema.Number),
  maxFileSize: Schema.optional(Schema.Number),
  readOnly: Schema.optional(Schema.Boolean),
})
export type GridColumn = typeof GridColumn.Type

export const CellAddress = Schema.Struct({
  row: Schema.String,
  column: Schema.String,
})
export type CellAddress = typeof CellAddress.Type
const CellRange = Schema.Struct({ anchor: CellAddress, end: CellAddress })
type CellRange = typeof CellRange.Type
const Sort = Schema.Struct({ id: Schema.String, desc: Schema.Boolean })
const RowHeight = Schema.Literals(['short', 'medium', 'tall', 'extra-tall'])
export type RowHeightId = typeof RowHeight.Type
export const rowHeights: Readonly<Record<RowHeightId, number>> = {
  short: 36,
  medium: 48,
  tall: 64,
  'extra-tall': 80,
}

const Values = Schema.Struct({
  values: Schema.Record(Schema.String, TextValues),
  files: Schema.Record(Schema.String, FileValues),
  added: Schema.Array(DataGridRow),
  removed: Schema.Array(Schema.String),
})
type Values = typeof Values.Type

const State = Schema.Struct({
  baseRows: Schema.Array(DataGridRow),
  data: Values,
  undo: Schema.Array(Values),
  redo: Schema.Array(Values),
  counter: Schema.Number,
  focus: Schema.NullOr(CellAddress),
  focusVersion: Schema.Number,
  editing: Schema.NullOr(
    Schema.Struct({ cell: CellAddress, value: Schema.String }),
  ),
  range: Schema.NullOr(CellRange),
  priorRanges: Schema.Array(CellRange),
  selectedRows: Schema.Array(Schema.String),
  rowAnchor: Schema.NullOr(Schema.String),
  sorting: Schema.Array(Sort),
  hidden: Schema.Array(Schema.String),
  order: Schema.Array(Schema.String),
  filters: TextValues,
  rowHeight: RowHeight,
  searchOpen: Schema.Boolean,
  query: Schema.String,
  match: Schema.Number,
  contextOpen: Schema.Boolean,
  status: Schema.String,
})
type State = typeof State.Type
const Props = Schema.Struct({
  rows: Schema.Array(DataGridRow),
  columns: Schema.Array(GridColumn),
  direction: Schema.optional(Schema.Literals(['ltr', 'rtl'])),
  height: Schema.optional(Schema.Number),
  defaultRowHeight: Schema.optional(RowHeight),
  historyLimit: Schema.optional(Schema.Number),
  disableEditing: Schema.optional(Schema.Boolean),
})
type Props = typeof Props.Type

const Motion = Schema.Literals(['none', 'left', 'right', 'down', 'up'])
type Motion = typeof Motion.Type
const Message = UiSchema.TaggedEnum({
  Focused: {
    cell: CellAddress,
    extend: Schema.Boolean,
    append: Schema.Boolean,
    drag: Schema.Boolean,
  },
  Keyed: { key: Schema.String, shift: Schema.Boolean, mod: Schema.Boolean },
  Started: { cell: CellAddress, seed: Schema.NullOr(Schema.String) },
  Drafted: { value: Schema.String },
  ValuePicked: { value: Schema.String },
  Saved: { move: Motion },
  Canceled: {},
  BooleanToggled: { cell: CellAddress },
  OptionToggled: { value: Schema.String },
  PickedFiles: { files: Schema.Array(FileCellData) },
  FileRemoved: { id: Schema.String },
  FilesRejected: {},
  Pasted: { text: Schema.String },
  Cut: {},
  ClipboardSettled: {},
  Searched: { value: Schema.String },
  SearchToggled: {},
  MatchMoved: { delta: Schema.Number },
  Sorted: { column: Schema.String, extend: Schema.Boolean },
  Filtered: { column: Schema.String, value: Schema.String },
  ColumnToggled: { column: Schema.String },
  ColumnMoved: { column: Schema.String, delta: Schema.Number },
  HeightChanged: { value: RowHeight },
  RowToggled: { row: Schema.String, extend: Schema.Boolean },
  RowsToggled: {},
  Added: { row: DataGridRow },
  Deleted: {},
  Undone: {},
  Redone: {},
  ContextOpened: {},
  ContextClosed: {},
  ContextPicked: { value: Schema.String },
})
type Message = typeof Message.Type

export const DataGridEvents = UiSchema.TaggedEnum({
  Changed: { rows: Schema.Array(DataGridRow) },
  FilesRejected: {},
})

const collator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})
const folded = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
const sameCell = (a: CellAddress | null, b: CellAddress) =>
  a?.row === b.row && a.column === b.column
const nextId = (model: State, props: Props) => {
  const used = new Set(
    [...model.baseRows, ...props.rows, ...model.data.added].map(row => row.key),
  )
  let count = model.counter
  while (used.has(`row-${count}`)) count += 1
  return { key: `row-${count}`, counter: count + 1 }
}
const emptyData = (): Values => ({
  values: {},
  files: {},
  added: [],
  removed: [],
})

const dataRows = (rows: readonly DataGridRow[], data: Values) => {
  const removed = new Set(data.removed)
  return [...rows, ...data.added]
    .filter(row => !removed.has(row.key))
    .map(row => {
      const values = Object.hasOwn(data.values, row.key)
        ? data.values[row.key]
        : undefined
      const files = Object.hasOwn(data.files, row.key)
        ? data.files[row.key]
        : undefined
      return values === undefined && files === undefined
        ? row
        : {
            ...row,
            values: { ...row.values, ...values },
            files: { ...row.files, ...files },
          }
    })
}

const rowValue = (row: DataGridRow, column: string) => row.values[column] ?? ''
const shownColumns = (state: State, props: Props) => {
  const hidden = new Set(state.hidden)
  const byId = new Map(props.columns.map(column => [column.id, column]))
  const order = [
    ...new Set([...state.order, ...props.columns.map(column => column.id)]),
  ]
  return order.flatMap(id => {
    const column = byId.get(id)
    return column === undefined || hidden.has(id) ? [] : [column]
  })
}

const displayRows = (rows: readonly DataGridRow[], state: State) =>
  rows
    .filter(row =>
      Object.entries(state.filters).every(([column, filter]) =>
        folded(rowValue(row, column)).includes(folded(filter).trim()),
      ),
    )
    .sort((left, right) => {
      for (const { id, desc } of state.sorting) {
        const compared = collator.compare(
          rowValue(left, id),
          rowValue(right, id),
        )
        if (compared !== 0) return desc ? -compared : compared
      }
      return 0
    })

const coordinates = (
  cell: CellAddress,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
) =>
  [
    rows.findIndex(row => row.key === cell.row),
    columns.findIndex(column => column.id === cell.column),
  ] as const
const cellAt = (
  row: number,
  column: number,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
): CellAddress | null => {
  const key = rows[Math.max(0, Math.min(rows.length - 1, row))]?.key
  const id = columns[Math.max(0, Math.min(columns.length - 1, column))]?.id
  return key === undefined || id === undefined ? null : { row: key, column: id }
}

const bounds = (
  range: CellRange,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
) => {
  const [aRow, aCol] = coordinates(range.anchor, rows, columns)
  const [bRow, bCol] = coordinates(range.end, rows, columns)
  return [aRow, aCol, bRow, bCol].includes(-1)
    ? undefined
    : ([
        Math.min(aRow, bRow),
        Math.max(aRow, bRow),
        Math.min(aCol, bCol),
        Math.max(aCol, bCol),
      ] as const)
}

const selectionBounds = (
  state: State,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
) =>
  [
    ...state.priorRanges,
    ...(state.range === null ? [] : [state.range]),
  ].flatMap(range => {
    const rectangle = bounds(range, rows, columns)
    return rectangle === undefined ? [] : [rectangle]
  })

const matches = (
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
  query: string,
) => {
  const text = folded(query).trim()
  return text === ''
    ? []
    : rows.flatMap(row =>
        columns
          .filter(column => folded(rowValue(row, column.id)).includes(text))
          .map(column => ({ row: row.key, column: column.id })),
      )
}

const focusCell = (
  state: State,
  cell: CellAddress,
  extend = false,
  append = false,
  programmatic = true,
): State => ({
  ...state,
  focus: cell,
  focusVersion: state.focusVersion + Number(programmatic),
  range: {
    anchor: extend ? (state.range?.anchor ?? state.focus ?? cell) : cell,
    end: cell,
  },
  priorRanges: extend
    ? state.priorRanges
    : append && state.range !== null
      ? [...state.priorRanges, state.range]
      : [],
})

const navigated = (
  state: State,
  key: string,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
  props: Props,
  shift = false,
  mod = false,
): State => {
  const [row, col] =
    state.focus === null ? [0, 0] : coordinates(state.focus, rows, columns)
  const page = Math.max(
    1,
    Math.floor((props.height ?? 420) / rowHeights[state.rowHeight]) - 1,
  )
  const right = props.direction === 'rtl' ? -1 : 1
  const byKey: Readonly<Record<string, readonly [number, number]>> = {
    ArrowUp: [row - 1, col],
    ArrowDown: [row + 1, col],
    ArrowRight: [row, col + right],
    ArrowLeft: [row, col - right],
    Home: [mod ? 0 : row, 0],
    End: [mod ? rows.length - 1 : row, columns.length - 1],
    PageUp: [row - page, col],
    PageDown: [row + page, col],
    Tab: [row, col + (shift ? -1 : 1)],
  }
  const next = byKey[key]
  if (next === undefined) return state
  const cell = cellAt(next[0], next[1], rows, columns)
  return cell === null ? state : focusCell(state, cell, shift && key !== 'Tab')
}

const history = (state: State, data: Values, props: Props): State => {
  if (state.data === data) return state
  const limit = Math.max(0, Math.min(100, props.historyLimit ?? 30))
  return {
    ...state,
    data,
    redo: [],
    undo:
      limit === 0
        ? []
        : [...state.undo.slice(1 - limit), state.data].slice(-limit),
  }
}

const acceptedValue = (
  value: string,
  column: GridColumn,
): string | undefined => {
  if (value === '') return value
  if (column.variant === 'number') {
    const number = Number(value)
    if (
      !Number.isFinite(number) ||
      number < (column.numberMin ?? -Infinity) ||
      number > (column.numberMax ?? Infinity)
    )
      return
    return String(number)
  }
  if (
    column.variant === 'select' &&
    column.options !== undefined &&
    !column.options.includes(value)
  )
    return
  if (column.variant === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return
    const day = new Date(`${value}T00:00:00Z`)
    if (
      !Number.isFinite(day.getTime()) ||
      day.toISOString().slice(0, 10) !== value
    )
      return
  }
  if (column.variant === 'checkbox')
    return /^(true|1|yes|✓)$/i.test(value) ? 'true' : 'false'
  return value
}

const setValue = (
  data: Values,
  row: DataGridRow,
  column: GridColumn,
  value: string,
): Values => {
  if (column.readOnly || column.variant === 'file') return data
  const accepted = acceptedValue(value, column)
  if (
    accepted === undefined ||
    (data.values[row.key]?.[column.id] ?? rowValue(row, column.id)) === accepted
  )
    return data
  return {
    ...data,
    values: {
      ...data.values,
      [row.key]: { ...data.values[row.key], [column.id]: accepted },
    },
  }
}

const updatedCell = (
  state: State,
  props: Props,
  cell: CellAddress,
  value: string,
) => {
  const row = dataRows(state.baseRows, state.data).find(
    row => row.key === cell.row,
  )
  const column = props.columns.find(column => column.id === cell.column)
  return row === undefined || column === undefined || props.disableEditing
    ? state
    : history(state, setValue(state.data, row, column, value), props)
}
const updatedFiles = (
  state: State,
  props: Props,
  cell: CellAddress,
  update: (files: readonly FileCellData[]) => readonly FileCellData[],
) => {
  const row = dataRows(state.baseRows, state.data).find(
    row => row.key === cell.row,
  )
  const column = props.columns.find(column => column.id === cell.column)
  if (
    row === undefined ||
    column === undefined ||
    column.variant !== 'file' ||
    column.readOnly ||
    props.disableEditing
  )
    return state
  return history(
    state,
    {
      ...state.data,
      files: {
        ...state.data.files,
        [row.key]: {
          ...state.data.files[row.key],
          [column.id]: update(row.files[column.id] ?? []),
        },
      },
    },
    props,
  )
}

const clearCells = (
  state: State,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
  props: Props,
) => {
  if (props.disableEditing) return state
  const selected = selectionBounds(state, rows, columns)
  let data = state.data
  for (const [fromRow, toRow, fromColumn, toColumn] of selected) {
    for (const row of rows.slice(fromRow, toRow + 1)) {
      for (const column of columns.slice(fromColumn, toColumn + 1)) {
        if (column.variant === 'file' && !column.readOnly) {
          data = {
            ...data,
            files: {
              ...data.files,
              [row.key]: { ...data.files[row.key], [column.id]: [] },
            },
          }
        } else data = setValue(data, row, column, '')
      }
    }
  }
  return history(state, data, props)
}

export const gridClipboard = (
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
) =>
  rows
    .map(row =>
      columns
        .map(column => {
          const value =
            column.variant === 'file'
              ? (row.files[column.id] ?? []).map(file => file.name).join(', ')
              : rowValue(row, column.id)
          return /[\t\r\n"]/.test(value)
            ? `"${value.replaceAll('"', '""')}"`
            : value
        })
        .join('\t'),
    )
    .join('\n')

/** Browsers and spreadsheet apps use escaped TSV for multi-cell clipboard data. */
export const parseGridClipboard = (
  text: string,
): readonly (readonly string[])[] => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (quoted || cell === '') quoted = !quoted
      else cell += character
    } else if (character === '\t' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      if (character === '\r' && text[index + 1] === '\n') index += 1
    } else cell += character
  }
  if (row.length > 0 || cell !== '' || rows.length === 0)
    rows.push([...row, cell])
  return rows
}

const pasted = (
  state: State,
  text: string,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
  props: Props,
) => {
  if (state.focus === null || props.disableEditing) return state
  const [rowIndex, columnIndex] = coordinates(state.focus, rows, columns)
  if (rowIndex < 0 || columnIndex < 0) return state
  let data = state.data
  parseGridClipboard(text).forEach((line, y) => {
    const row = rows[rowIndex + y]
    if (row === undefined) return
    line.forEach((value, x) => {
      const column = columns[columnIndex + x]
      if (column !== undefined) data = setValue(data, row, column, value)
    })
  })
  return history(state, data, props)
}

const started = (
  state: State,
  props: Props,
  cell: CellAddress,
  seed: string | null,
): State => {
  const row = dataRows(state.baseRows, state.data).find(
    row => row.key === cell.row,
  )
  const column = props.columns.find(column => column.id === cell.column)
  if (
    row === undefined ||
    column === undefined ||
    column.readOnly ||
    props.disableEditing
  )
    return state
  const next = focusCell(state, cell)
  return column.variant === 'checkbox'
    ? updatedCell(
        next,
        props,
        cell,
        rowValue(row, cell.column) === 'true' ? 'false' : 'true',
      )
    : { ...next, editing: { cell, value: seed ?? rowValue(row, cell.column) } }
}

const step = (
  state: State,
  message: Message,
  props: Props,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
): State => {
  switch (message._tag) {
    case 'Focused': {
      if (
        sameCell(state.focus, message.cell) &&
        !message.extend &&
        !message.append
      )
        return state
      const edited =
        state.editing === null
          ? state
          : updatedCell(state, props, state.editing.cell, state.editing.value)
      return {
        ...focusCell(
          edited,
          message.cell,
          message.extend,
          message.append,
          !message.drag,
        ),
        editing: null,
      }
    }
    case 'Started':
      return started(state, props, message.cell, message.seed)
    case 'Drafted':
      return state.editing === null
        ? state
        : { ...state, editing: { ...state.editing, value: message.value } }
    case 'ValuePicked':
      return state.editing === null
        ? state
        : updatedCell(
            { ...state, editing: null, focusVersion: state.focusVersion + 1 },
            props,
            state.editing.cell,
            message.value,
          )
    case 'Saved': {
      if (state.editing === null) return state
      const { cell, value } = state.editing
      const column = columns.find(column => column.id === cell.column)
      if (column !== undefined && acceptedValue(value, column) === undefined)
        return state
      const next = updatedCell(
        { ...state, editing: null, focusVersion: state.focusVersion + 1 },
        props,
        cell,
        value,
      )
      const keys = {
        left: 'ArrowLeft',
        right: 'ArrowRight',
        up: 'ArrowUp',
        down: 'ArrowDown',
        none: '',
      }
      return navigated(next, keys[message.move], rows, columns, props)
    }
    case 'Canceled':
      return { ...state, editing: null, focusVersion: state.focusVersion + 1 }
    case 'BooleanToggled':
      return started(state, props, message.cell, null)
    case 'OptionToggled': {
      if (state.editing === null) return state
      const values = state.editing.value
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
      const next = values.includes(message.value)
        ? values.filter(value => value !== message.value)
        : [...values, message.value]
      const value = next.join(', ')
      return updatedCell(
        { ...state, editing: { ...state.editing, value } },
        props,
        state.editing.cell,
        value,
      )
    }
    case 'PickedFiles':
      return state.editing === null
        ? state
        : updatedFiles(state, props, state.editing.cell, files => [
            ...files,
            ...message.files,
          ])
    case 'FileRemoved':
      return state.editing === null
        ? state
        : updatedFiles(state, props, state.editing.cell, files =>
            files.filter(file => file.id !== message.id),
          )
    case 'Pasted':
      return pasted(state, message.text, rows, columns, props)
    case 'Cut':
      return clearCells(state, rows, columns, props)
    case 'Searched':
      return { ...state, query: message.value, match: 0 }
    case 'SearchToggled':
      return { ...state, searchOpen: !state.searchOpen, query: '', match: 0 }
    case 'MatchMoved': {
      const found = matches(rows, columns, state.query)
      if (found.length === 0) return state
      const match = (state.match + message.delta + found.length) % found.length
      return { ...focusCell(state, found[match]!), match }
    }
    case 'Sorted': {
      const current = state.sorting.find(entry => entry.id === message.column)
      const sorting = message.extend
        ? state.sorting.filter(entry => entry.id !== message.column)
        : []
      return {
        ...state,
        sorting: current?.desc
          ? sorting
          : [...sorting, { id: message.column, desc: current !== undefined }],
      }
    }
    case 'Filtered':
      return {
        ...state,
        filters: { ...state.filters, [message.column]: message.value },
      }
    case 'ColumnToggled':
      return state.hidden.includes(message.column)
        ? { ...state, hidden: state.hidden.filter(id => id !== message.column) }
        : columns.length <= 1
          ? state
          : { ...state, hidden: [...state.hidden, message.column] }
    case 'ColumnMoved': {
      const order = [
        ...new Set([...state.order, ...props.columns.map(column => column.id)]),
      ]
      const index = order.indexOf(message.column)
      if (index < 0) return state
      order.splice(index, 1)
      order.splice(Math.max(0, index + message.delta), 0, message.column)
      return { ...state, order }
    }
    case 'HeightChanged':
      return { ...state, rowHeight: message.value }
    case 'RowToggled': {
      const keys = rows.map(row => row.key)
      const from = state.rowAnchor === null ? -1 : keys.indexOf(state.rowAnchor)
      const to = keys.indexOf(message.row)
      const range =
        message.extend && from >= 0 && to >= 0
          ? keys.slice(Math.min(from, to), Math.max(from, to) + 1)
          : [message.row]
      const selected = new Set(state.selectedRows)
      const remove = selected.has(message.row)
      for (const row of range) {
        if (remove) selected.delete(row)
        else selected.add(row)
      }
      return { ...state, selectedRows: [...selected], rowAnchor: message.row }
    }
    case 'RowsToggled': {
      const selected = new Set(state.selectedRows)
      const checked =
        rows.length > 0 && rows.every(row => selected.has(row.key))
      for (const row of rows) {
        if (checked) selected.delete(row.key)
        else selected.add(row.key)
      }
      return { ...state, selectedRows: [...selected] }
    }
    case 'Added':
      return props.disableEditing
        ? state
        : {
            ...history(
              state,
              { ...state.data, added: [...state.data.added, message.row] },
              props,
            ),
            counter: nextId(state, props).counter,
          }
    case 'Deleted': {
      const keys =
        state.selectedRows.length > 0
          ? state.selectedRows
          : state.focus === null
            ? []
            : [state.focus.row]
      return props.disableEditing || keys.length === 0
        ? state
        : history(
            { ...state, selectedRows: [], editing: null },
            {
              ...state.data,
              removed: [...new Set([...state.data.removed, ...keys])],
            },
            props,
          )
    }
    case 'Undone': {
      const data = state.undo.at(-1)
      return data === undefined
        ? state
        : {
            ...state,
            data,
            undo: state.undo.slice(0, -1),
            redo: [...state.redo, state.data],
          }
    }
    case 'Redone': {
      const data = state.redo.at(-1)
      return data === undefined
        ? state
        : {
            ...state,
            data,
            undo: [...state.undo, state.data],
            redo: state.redo.slice(0, -1),
          }
    }
    case 'Keyed': {
      const { key, shift, mod } = message
      if (mod) {
        switch (key.toLowerCase()) {
          case 'f':
            return step(state, Message.SearchToggled(), props, rows, columns)
          case 'z':
            return step(
              state,
              shift ? Message.Redone() : Message.Undone(),
              props,
              rows,
              columns,
            )
          case 'y':
            return step(state, Message.Redone(), props, rows, columns)
          case 'a':
            return { ...state, selectedRows: rows.map(row => row.key) }
          case 'home':
          case 'end':
            return navigated(state, key, rows, columns, props, shift, mod)
          default:
            return state
        }
      }
      if (key === 'Escape')
        return state.searchOpen
          ? { ...state, searchOpen: false, query: '', match: 0 }
          : { ...state, selectedRows: [], priorRanges: [], range: null }
      if (key === 'Delete' || key === 'Backspace')
        return state.selectedRows.length > 1
          ? step(state, Message.Deleted(), props, rows, columns)
          : clearCells(state, rows, columns, props)
      const printable = key.length === 1
      if (
        (key === 'Enter' || key === 'F2' || printable) &&
        state.focus !== null
      )
        return started(state, props, state.focus, printable ? key : null)
      return navigated(state, key, rows, columns, props, shift)
    }
    case 'ContextOpened':
      return { ...state, contextOpen: true }
    case 'ContextClosed':
      return { ...state, contextOpen: false }
    case 'ContextPicked':
      return { ...state, contextOpen: false }
    case 'FilesRejected':
      return {
        ...state,
        status: 'Some files exceed the size or attachment limit.',
      }
    case 'ClipboardSettled':
      return state
  }
}

const clipboardFrom = (
  state: State,
  rows: readonly DataGridRow[],
  columns: readonly GridColumn[],
) => {
  const selected = new Set(state.selectedRows)
  if (selected.size > 0)
    return gridClipboard(
      rows.filter(row => selected.has(row.key)),
      columns,
    )
  const range =
    state.range ??
    (state.focus === null ? null : { anchor: state.focus, end: state.focus })
  if (range === null) return ''
  const rectangle = bounds(range, rows, columns)
  return rectangle === undefined
    ? ''
    : gridClipboard(
        rows.slice(rectangle[0], rectangle[1] + 1),
        columns.slice(rectangle[2], rectangle[3] + 1),
      )
}

const WriteClipboard = Command.make(
  'CreaseWriteGridClipboard',
  {
    args: { text: Schema.String, cut: Schema.Boolean },
  },
  ({ text, cut }) =>
    Effect.tryPromise(() => navigator.clipboard.writeText(text)).pipe(
      Effect.match({
        onSuccess: () => (cut ? Message.Cut() : Message.ClipboardSettled()),
        onFailure: () => Message.ClipboardSettled(),
      }),
    ),
)
const ReadClipboard = Command.make(
  'CreaseReadGridClipboard',
  { args: {} },
  () =>
    Effect.tryPromise(() => navigator.clipboard.readText()).pipe(
      Effect.match({
        onSuccess: text => Message.Pasted({ text }),
        onFailure: () => Message.ClipboardSettled(),
      }),
    ),
)

const contextActions = [
  { value: 'copy', label: 'Copy' },
  { value: 'cut', label: 'Cut' },
  { value: 'paste', label: 'Paste' },
  { value: 'clear', label: 'Clear cells' },
  { value: 'delete', label: 'Delete row' },
] as const
const pointerCell = (root: HTMLElement, target: EventTarget | null) => {
  const element =
    target instanceof Element
      ? target.closest<HTMLElement>('[data-grid-cell]')
      : null
  if (element === null || !root.contains(element)) return null
  const row = element.dataset.gridRow
  const column = element.dataset.gridColumn
  return row === undefined || column === undefined
    ? null
    : { element, address: { row, column } }
}

const GridMount = Mount.makeStream(
  'CreaseDataGridInteractions',
  {
    args: {
      focus: Schema.NullOr(CellAddress),
      focusVersion: Schema.Number,
      searchOpen: Schema.Boolean,
      clipboard: Schema.String,
      editing: Schema.Boolean,
      fileLimit: Schema.Number,
      fileSize: Schema.Number,
    },
  },
  (root: HTMLElement, initial, changes) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        let args = initial
        let dragging = false
        let frame = 0
        const urls = new Set<string>()
        const notify = (message: Message) => Queue.offerUnsafe(queue, message)
        const focus = (attempts = 8) => {
          const search = root.querySelector<HTMLElement>('[data-grid-search]')
          const editor = root.querySelector<HTMLElement>(
            '[data-grid-editor-input]',
          )
          if (args.editing && editor !== null) {
            editor.focus({ preventScroll: true })
            return
          }
          const target =
            args.focus === null
              ? undefined
              : root.querySelector<HTMLElement>(
                  `[data-grid-row="${CSS.escape(args.focus.row)}"][data-grid-column="${CSS.escape(args.focus.column)}"]`,
                )
          if (target != null) {
            target.focus({ preventScroll: true })
            const viewport = target.closest<HTMLElement>(
              '[data-slot="data-grid-viewport"]',
            )
            if (viewport === null) return
            const container = viewport.getBoundingClientRect()
            const cell = target.getBoundingClientRect()
            if (cell.left < container.left)
              viewport.scrollBy({ left: cell.left - container.left })
            else if (cell.right > container.right)
              viewport.scrollBy({ left: cell.right - container.right })
          } else if (attempts > 0 && args.focus !== null)
            frame = requestAnimationFrame(() => focus(attempts - 1))
          else if (args.searchOpen) search?.focus()
        }
        const interactive = (target: EventTarget | null) =>
          target instanceof Element &&
          target.closest(
            'input,textarea,select,button,a,[contenteditable="true"]',
          ) !== null
        const pointerDown = (event: PointerEvent) => {
          if (event.button !== 0 || interactive(event.target)) return
          const hit = pointerCell(root, event.target)
          if (hit === null) return
          dragging = true
          notify(
            Message.Focused({
              cell: hit.address,
              extend: event.shiftKey,
              append: event.metaKey || event.ctrlKey,
              drag: false,
            }),
          )
          hit.element.focus({ preventScroll: true })
        }
        const pointerOver = (event: PointerEvent) => {
          if (!dragging || event.buttons !== 1) return
          const hit = pointerCell(root, event.target)
          if (hit !== null)
            notify(
              Message.Focused({
                cell: hit.address,
                extend: true,
                append: false,
                drag: true,
              }),
            )
        }
        const pointerUp = () => {
          dragging = false
        }
        const context = (event: MouseEvent) => {
          const hit = pointerCell(root, event.target)
          if (hit !== null && event.button !== 0)
            notify(
              Message.Focused({
                cell: hit.address,
                extend: false,
                append: false,
                drag: true,
              }),
            )
        }
        const keyboard = (event: KeyboardEvent) => {
          if (event.defaultPrevented || event.isComposing || event.altKey)
            return
          if (
            args.editing &&
            event.key === 'Escape' &&
            event.target instanceof Element &&
            event.target.closest('[data-slot="data-grid-editor"]') !== null
          ) {
            event.preventDefault()
            notify(Message.Canceled())
            return
          }
          if (interactive(event.target) || args.editing) return
          const hit = pointerCell(root, event.target)
          if (hit === null) return
          const mod = event.ctrlKey || event.metaKey
          const handled = mod
            ? /^(home|end|a|f|y|z)$/i.test(event.key)
            : event.key.length === 1 ||
              /^(Arrow(Up|Down|Left|Right)|Home|End|PageUp|PageDown|Escape|Enter|F2|Delete|Backspace|Tab)$/.test(
                event.key,
              )
          if (!handled) return
          if (
            event.key === 'Tab' &&
            hit.element.hasAttribute(
              event.shiftKey ? 'data-first-column' : 'data-last-column',
            )
          )
            return
          event.preventDefault()
          notify(Message.Keyed({ key: event.key, shift: event.shiftKey, mod }))
        }
        const copy = (event: ClipboardEvent) => {
          if (
            interactive(event.target) ||
            pointerCell(root, event.target) === null ||
            event.clipboardData === null
          )
            return
          event.clipboardData.setData('text/plain', args.clipboard)
          event.preventDefault()
          if (event.type === 'cut') notify(Message.Cut())
        }
        const paste = (event: ClipboardEvent) => {
          if (
            interactive(event.target) ||
            pointerCell(root, event.target) === null ||
            event.clipboardData === null
          )
            return
          event.preventDefault()
          notify(
            Message.Pasted({ text: event.clipboardData.getData('text/plain') }),
          )
        }
        const fileChange = (event: Event) => {
          const input = event.target
          if (
            !(input instanceof HTMLInputElement) ||
            !input.hasAttribute('data-grid-file-input')
          )
            return
          const requested = Array.from(input.files ?? [])
          const accepted = requested
            .filter(file => file.size <= args.fileSize)
            .slice(0, args.fileLimit)
          if (accepted.length < requested.length)
            notify(Message.FilesRejected())
          if (accepted.length > 0)
            notify(
              Message.PickedFiles({
                files: accepted.map(file => {
                  const url = URL.createObjectURL(file)
                  urls.add(url)
                  return {
                    id: url,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url,
                  }
                }),
              }),
            )
          input.value = ''
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            root.addEventListener('pointerdown', pointerDown)
            root.addEventListener('pointerover', pointerOver)
            root.ownerDocument.addEventListener('pointerup', pointerUp)
            root.addEventListener('contextmenu', context, true)
            root.addEventListener('keydown', keyboard)
            root.addEventListener('copy', copy)
            root.addEventListener('cut', copy)
            root.addEventListener('paste', paste)
            root.addEventListener('change', fileChange)
          }),
          () =>
            Effect.sync(() => {
              cancelAnimationFrame(frame)
              root.removeEventListener('pointerdown', pointerDown)
              root.removeEventListener('pointerover', pointerOver)
              root.ownerDocument.removeEventListener('pointerup', pointerUp)
              root.removeEventListener('contextmenu', context, true)
              root.removeEventListener('keydown', keyboard)
              root.removeEventListener('copy', copy)
              root.removeEventListener('cut', copy)
              root.removeEventListener('paste', paste)
              root.removeEventListener('change', fileChange)
              for (const url of urls) URL.revokeObjectURL(url)
            }),
        )
        yield* Stream.runForEach(changes, next =>
          Effect.sync(() => {
            const old = args
            args = next
            if (!old.searchOpen && next.searchOpen) {
              cancelAnimationFrame(frame)
              frame = requestAnimationFrame(() =>
                root.querySelector<HTMLElement>('[data-grid-search]')?.focus(),
              )
            } else if (
              old.focusVersion !== next.focusVersion ||
              old.editing !== next.editing
            ) {
              cancelAnimationFrame(frame)
              frame = requestAnimationFrame(() => focus())
            }
          }),
        )
      }),
    ),
)

const FitEditor = Mount.makeStream(
  'CreaseFitGridEditor',
  { args: {} },
  (editor: HTMLDivElement) =>
    Stream.callback<never>(() =>
      Effect.gen(function* () {
        const viewport = editor.closest<HTMLElement>(
          '[data-slot="data-grid-viewport"]',
        )
        if (viewport === null) return
        const fit = () => {
          editor.style.translate = ''
          const container = viewport.getBoundingClientRect()
          editor.style.maxHeight = `${Math.max(0, container.height - 8)}px`
          const box = editor.getBoundingClientRect()
          const x =
            Math.max(
              container.left + 4,
              Math.min(container.right - box.width - 4, box.left),
            ) - box.left
          const y =
            Math.max(
              container.top + 4,
              Math.min(container.bottom - box.height - 4, box.top),
            ) - box.top
          editor.style.translate = `${Math.round(x)}px ${Math.round(y)}px`
        }
        const observer = new ResizeObserver(fit)
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            observer.observe(viewport)
            observer.observe(editor)
            viewport.addEventListener('scroll', fit, { passive: true })
            fit()
          }),
          () =>
            Effect.sync(() => {
              observer.disconnect()
              viewport.removeEventListener('scroll', fit)
            }),
        )
        return yield* Effect.never
      }),
    ),
)

const reduceGrid = (state: State, message: Message, props: Props) => {
  const rows = displayRows(dataRows(state.baseRows, state.data), state)
  const columns = shownColumns(state, props)
  return {
    state:
      message._tag === 'ContextPicked' && message.value === 'clear'
        ? clearCells({ ...state, contextOpen: false }, rows, columns, props)
        : message._tag === 'ContextPicked' && message.value === 'delete'
          ? step(
              { ...state, contextOpen: false },
              Message.Deleted(),
              props,
              rows,
              columns,
            )
          : step(state, message, props, rows, columns),
    clipboard: clipboardFrom(state, rows, columns),
  }
}

export const DataGridBehavior = Html.component({
  name: 'CreaseDataGrid',
  props: Props,
  model: State,
  message: Message,
  events: DataGridEvents,
}).make({
  init: ({ props }) => ({
    baseRows: props.rows,
    data: emptyData(),
    undo: [],
    redo: [],
    counter: props.rows.length + 1,
    focus: null,
    focusVersion: 0,
    editing: null,
    range: null,
    priorRanges: [],
    selectedRows: [],
    rowAnchor: null,
    sorting: [],
    hidden: [],
    order: [],
    filters: {},
    rowHeight: props.defaultRowHeight ?? 'short',
    searchOpen: false,
    query: '',
    match: 0,
    contextOpen: false,
    status: '',
  }),
  update: ($, message) => {
    const { state, clipboard } = reduceGrid($.model, message, $.props)
    const next = $.set(state)
    if (message._tag === 'FilesRejected')
      return next.emit(DataGridEvents.FilesRejected())
    if (message._tag === 'ContextPicked') {
      if (message.value === 'copy' || message.value === 'cut')
        return next.run(
          WriteClipboard.make({
            text: clipboard,
            cut: message.value === 'cut',
          }),
        )
      if (message.value === 'paste') return next.run(ReadClipboard.make({}))
    }
    return state.data === $.model.data
      ? next
      : next.emit(
          DataGridEvents.Changed({
            rows: dataRows(state.baseRows, state.data),
          }),
        )
  },
  parts: (p, state) => {
    const columns = shownColumns(state, p.props)
    const rows = displayRows(dataRows(state.baseRows, state.data), state)
    const focus =
      state.focus === null
        ? cellAt(0, 0, rows, columns)
        : (() => {
            const [row, column] = coordinates(state.focus, rows, columns)
            return cellAt(row, column, rows, columns)
          })()
    const found = matches(rows, columns, state.query)
    const searchMatch = found[state.match] ?? null
    const selection = selectionBounds(state, rows, columns)
    const editor = state.editing?.cell
    const editingColumn = columns.find(column => column.id === editor?.column)
    const row = rows.find(row => row.key === editor?.row)
    const files = row?.files[editor?.column ?? ''] ?? []
    const root = p.part('div', element =>
      element.onMount(
        GridMount({
          focus,
          focusVersion: state.focusVersion,
          searchOpen: state.searchOpen,
          clipboard: clipboardFrom(state, rows, columns),
          editing: editor !== undefined,
          fileLimit: Math.max(0, (editingColumn?.maxFiles ?? 8) - files.length),
          fileSize: editingColumn?.maxFileSize ?? 10_000_000,
        }),
      ),
    )
    const button = p.part('button', (element, message: Message) =>
      element.attr('type', 'button').on('click', message),
    )
    const addRow = p.part('button', (element, createRow: () => DataGridRow) =>
      element
        .attr('type', 'button')
        .on('click', () => Message.Added({ row: createRow() })),
    )
    const sort = p.part('button', (element, column: string) =>
      element
        .attr('type', 'button')
        .on('click', ({ shift }) => Message.Sorted({ column, extend: shift })),
    )
    const toggleRow = p.part('button', (element, row: string) =>
      element
        .attr('type', 'button')
        .on('click', ({ shift }) => Message.RowToggled({ row, extend: shift })),
    )
    const cell = p.part('td', (element, address: CellAddress) =>
      element
        .on(
          'focus',
          Message.Focused({
            cell: address,
            extend: false,
            append: false,
            drag: true,
          }),
        )
        .on('dblclick', Message.Started({ cell: address, seed: null })),
    )
    const editKeys = (
      key: string,
      shift: boolean,
      composing: boolean,
      multiline: boolean,
    ): Message | undefined => {
      if (composing) return
      if (key === 'Escape') return Message.Canceled()
      if (key === 'Tab')
        return Message.Saved({ move: shift ? 'left' : 'right' })
      if (key === 'Enter' && !multiline)
        return Message.Saved({ move: shift ? 'up' : 'down' })
    }
    const input = p.part('input', element =>
      element
        .on('input', ({ value }) => Message.Drafted({ value }))
        .on(
          'keydown',
          ({ key, shift, composing }) => editKeys(key, shift, composing, false),
          { preventDefault: true },
        ),
    )
    const textarea = p.part('textarea', element =>
      element
        .on('input', ({ value }) => Message.Drafted({ value }))
        .on(
          'keydown',
          ({ key, shift, composing }) => editKeys(key, shift, composing, true),
          { preventDefault: true },
        ),
    )
    const select = p.part('select', element =>
      element
        .on('change', ({ value }) => Message.ValuePicked({ value }))
        .on('keydown', ({ key }) =>
          key === 'Escape' ? Message.Canceled() : undefined,
        ),
    )
    const date = p.part('input', element =>
      element
        .on('input', ({ value }) => Message.Drafted({ value }))
        .on('change', ({ value }) => Message.ValuePicked({ value })),
    )
    const search = p.part('input', element =>
      element
        .on('input', ({ value }) => Message.Searched({ value }))
        .on('keydown', ({ key, shift }) =>
          key === 'Escape'
            ? Message.SearchToggled()
            : key === 'Enter'
              ? Message.MatchMoved({ delta: shift ? -1 : 1 })
              : undefined,
        ),
    )
    const filter = p.part('input', (element, column: string) =>
      element.on('input', ({ value }) => Message.Filtered({ column, value })),
    )
    const rowHeight = p.part('select', element =>
      element.on('change', ({ value }) =>
        Schema.is(RowHeight)(value)
          ? Message.HeightChanged({ value })
          : undefined,
      ),
    )
    const fitEditor = p.part('div', element => element.onMount(FitEditor()))
    const scroll =
      focus === null || state.focusVersion === 0
        ? undefined
        : {
            target: VirtualListScrollTarget.Key({ key: focus.row }),
            align: 'nearest' as const,
            id: state.focusVersion,
          }
    const menuItems = contextActions.map(item => ({
      ...item,
      disabled: p.props.disableEditing === true && item.value !== 'copy',
    }))
    return p.child(VirtualList, {
      props: {
        count: rows.length,
        keys: rows.map(row => row.key),
        itemSize: rowHeights[state.rowHeight],
        measure: false,
        overscan: 5,
        initialCount: Math.ceil(
          (p.props.height ?? 420) / rowHeights[state.rowHeight],
        ),
        firstPosition: 2,
        setSize: rows.length + 1,
        ...(scroll === undefined ? {} : { scrollTo: scroll }),
      },
      parts: virtual =>
        p.child(Menu, {
          props: { open: state.contextOpen, items: menuItems },
          onEmit: {
            RequestedOpen: () => Message.ContextOpened(),
            RequestedClose: () => Message.ContextClosed(),
            Picked: ({ value }) => Message.ContextPicked({ value }),
            Highlighted: () => undefined,
            RequestedQuery: () => undefined,
            Settled: () => undefined,
          },
          parts: context => ({
            state,
            rows,
            columns,
            focus,
            found,
            searchMatch,
            selection,
            menuItems,
            nextKey: nextId(state, p.props).key,
            root,
            button,
            addRow,
            sort,
            toggleRow,
            cell,
            input,
            textarea,
            select,
            date,
            search,
            filter,
            rowHeight,
            fitEditor,
            virtual,
            context,
          }),
        }),
    })
  },
})

export { Message as DataGridMessage }
