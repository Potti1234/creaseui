/* Model for the tablecn data-grid demo (mirrors use-data-grid state:
   focused/editing cell, selected ranges, sorting, filtering, hidden columns,
   row height, search overlay, undo/redo, clipboard). */

import { Effect, Queue, Schema as S, Stream } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

import { generatePeople, type Person } from '@/lib/tablecn-data'

export const ROW_HEIGHTS = [
  { id: 'short', label: 'Short', height: 36 },
  { id: 'medium', label: 'Medium', height: 48 },
  { id: 'tall', label: 'Tall', height: 64 },
  { id: 'extra-tall', label: 'Extra tall', height: 80 },
] as const
export type RowHeightId = (typeof ROW_HEIGHTS)[number]['id']

export const CellAddress = S.Struct({ row: S.Number, column: S.String })
export type CellAddress = typeof CellAddress.Type

export const CellRange = S.Struct({
  start: CellAddress,
  end: CellAddress,
})
export type CellRange = typeof CellRange.Type

export const Model = S.Struct({
  rows: S.Array(S.Any),
  columnOrder: S.Array(S.String),
  hiddenColumnIds: S.Array(S.String),
  sorting: S.Array(S.Struct({ id: S.String, desc: S.Boolean })),
  filters: S.Array(S.Struct({ column: S.String, value: S.String })),
  rowHeight: S.String,
  focusedCell: S.Struct({ row: S.Number, column: S.String }),
  editingCell: S.Struct({ row: S.Number, column: S.String }),
  draftValue: S.String,
  selectionAnchor: S.Struct({ row: S.Number, column: S.String }),
  selectionEnd: S.Struct({ row: S.Number, column: S.String }),
  selectedRanges: S.Array(CellRange),
  selectedRowIndexes: S.Array(S.Number),
  lastSelectedRowIndex: S.Number,
  openPanel: S.String,
  contextMenu: S.Struct({
    open: S.Boolean,
    x: S.Number,
    y: S.Number,
    row: S.Number,
    column: S.String,
  }),
  searchOpen: S.Boolean,
  searchQuery: S.String,
  matchIndex: S.Number,
  pastStates: S.Array(S.Any),
  futureStates: S.Array(S.Any),
  direction: S.Literals(['ltr', 'rtl']),
  scrollTop: S.Number,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  FocusedCell: { row: S.Number, column: S.String },
  StartedEditing: { row: S.Number, column: S.String, seed: S.String },
  ChangedDraft: { value: S.String },
  CommittedDraft: { move: S.String },
  CanceledEdit: {},
  SetCellValue: { row: S.Number, column: S.String, value: S.String },
  ToggledCellBoolean: { row: S.Number, column: S.String },
  ClearedSelection: {},
  SelectedCell: { row: S.Number, column: S.String, additive: S.Boolean },
  SelectedRange: { row: S.Number, column: S.String, extend: S.Boolean },
  SelectedRowIndex: {
    index: S.Number,
    shiftKey: S.Boolean,
    additive: S.Boolean,
  },
  ToggledAllRows: { checked: S.Boolean },
  SetSorting: { column: S.String, desc: S.Boolean },
  RemovedSort: { column: S.String },
  HidColumn: { column: S.String },
  ToggledSort: { column: S.String },
  AddedFilter: { column: S.String, value: S.String },
  RemovedFilter: { column: S.String },
  ToggledColumnHidden: { column: S.String },
  SetRowHeight: { height: S.String },
  SetPanel: { panel: S.String },
  OpenedContextMenu: {
    x: S.Number,
    y: S.Number,
    row: S.Number,
    column: S.String,
  },
  ClosedContextMenu: {},
  AppliedContextAction: { action: S.String },
  AddedRow: {},
  AddedRowAt: { index: S.Number },
  DeletedRows: { indexes: S.Array(S.Number) },
  ToggledSearch: {},
  ChangedSearchQuery: { value: S.String },
  SetMatchIndex: { index: S.Number },
  NavigatedMatch: { direction: S.String },
  Undo: {},
  Redo: {},
  SetDirection: { direction: S.Literals(['ltr', 'rtl']) },
  GridKey: {
    key: S.String,
    ctrl: S.Boolean,
    shift: S.Boolean,
    meta: S.Boolean,
  },
  Scrolled: { scrollTop: S.Number },
})
export type Message = typeof Message.Type

export const init = (count = 500): Model => ({
  rows: generatePeople(count),
  columnOrder: [
    'name',
    'age',
    'email',
    'website',
    'notes',
    'salary',
    'department',
    'status',
    'skills',
    'isActive',
    'startDate',
    'attachments',
  ],
  hiddenColumnIds: [],
  sorting: [],
  filters: [],
  rowHeight: 'short',
  focusedCell: { row: -1, column: '' },
  editingCell: { row: -1, column: '' },
  draftValue: '',
  selectionAnchor: { row: -1, column: '' },
  selectionEnd: { row: -1, column: '' },
  selectedRanges: [],
  selectedRowIndexes: [],
  lastSelectedRowIndex: -1,
  openPanel: '',
  contextMenu: { open: false, x: 0, y: 0, row: -1, column: '' },
  searchOpen: false,
  searchQuery: '',
  matchIndex: 0,
  pastStates: [],
  futureStates: [],
  direction: 'ltr',
  scrollTop: 0,
})

export const rowHeightPx = (id: string): number =>
  ROW_HEIGHTS.find(entry => entry.id === id)?.height ?? 36

const personArray = (model: Model): Array<Person> => model.rows as Array<Person>

export const cellText = (person: Person, column: string): string => {
  switch (column) {
    case 'name':
      return person.name ?? ''
    case 'age':
      return person.age === undefined ? '' : String(person.age)
    case 'email':
      return person.email ?? ''
    case 'website':
      return person.website ?? ''
    case 'notes':
      return person.notes ?? ''
    case 'salary':
      return person.salary === undefined ? '' : String(person.salary)
    case 'department':
      return person.department ?? ''
    case 'status':
      return person.status ?? ''
    case 'skills':
      return (person.skills ?? []).join(', ')
    case 'isActive':
      return person.isActive === true ? 'true' : 'false'
    case 'startDate':
      return person.startDate ?? ''
    case 'attachments':
      return (person.attachments ?? []).map(file => file.name).join(', ')
    default:
      return ''
  }
}

export const filteredPeople = (model: Model): Array<Person> => {
  const active = model.filters.filter(filter => filter.value !== '')
  return personArray(model).filter(person =>
    active.every(filter =>
      cellText(person, filter.column)
        .toLowerCase()
        .includes(filter.value.toLowerCase()),
    ),
  )
}

const numericColumns = new Set(['age', 'salary'])

export const sortedPeople = (
  people: ReadonlyArray<Person>,
  sorting: ReadonlyArray<{ id: string; desc: boolean }>,
): ReadonlyArray<Person> => {
  if (sorting.length === 0) return people
  return [...people].sort((a, b) => {
    for (const entry of sorting) {
      const av = cellText(a, entry.id)
      const bv = cellText(b, entry.id)
      let cmp: number
      if (numericColumns.has(entry.id)) {
        cmp = (Number(av) || 0) - (Number(bv) || 0)
      } else {
        cmp = av.localeCompare(bv)
      }
      if (cmp !== 0) return entry.desc ? -cmp : cmp
    }
    return 0
  })
}

const setValue = (person: Person, column: string, value: string): Person => {
  switch (column) {
    case 'name':
      return { ...person, name: value }
    case 'age':
      return { ...person, age: Number(value) || undefined }
    case 'email':
      return { ...person, email: value }
    case 'website':
      return { ...person, website: value }
    case 'notes':
      return { ...person, notes: value }
    case 'salary':
      return { ...person, salary: Number(value) || undefined }
    case 'department':
      return { ...person, department: value }
    case 'status':
      return { ...person, status: value }
    case 'skills':
      return {
        ...person,
        skills: value === '' ? [] : value.split(',').map(s => s.trim()),
      }
    case 'startDate':
      return { ...person, startDate: value }
    default:
      return person
  }
}

const commitCell = (
  model: Model,
  row: number,
  column: string,
  value: string,
): Model => {
  const people = filteredPeople(model)
  const target = people[row]
  if (target === undefined) return model
  const snapshot = model.rows
  return {
    ...model,
    pastStates: [...model.pastStates, snapshot],
    futureStates: [],
    rows: personArray(model).map(person =>
      person.id === target.id ? setValue(person, column, value) : person,
    ),
  }
}

const moveFocus = (model: Model, dRow: number, dColumn: number): Model => {
  const columns = visibleColumns(model)
  const columnIndex = columns.indexOf(model.focusedCell.column)
  const nextColumn = Math.min(
    Math.max(columnIndex + dColumn, 0),
    columns.length - 1,
  )
  const nextRow = Math.min(
    Math.max(model.focusedCell.row + dRow, 0),
    filteredPeople(model).length - 1,
  )
  return {
    ...model,
    focusedCell: { row: nextRow, column: columns[nextColumn] ?? '' },
  }
}

export const visibleColumns = (model: Model): Array<string> =>
  model.columnOrder.filter(column => !model.hiddenColumnIds.includes(column))

const emptyCell = { row: -1, column: '' }

export const update = (model: Model, message: Message): Model => {
  switch (message._tag) {
    case 'FocusedCell':
      return {
        ...model,
        focusedCell: { row: message.row, column: message.column },
        selectionAnchor: { row: message.row, column: message.column },
        selectionEnd: { row: message.row, column: message.column },
      }
    case 'StartedEditing':
      return {
        ...model,
        editingCell: { row: message.row, column: message.column },
        draftValue: message.seed,
      }
    case 'ChangedDraft':
      return { ...model, draftValue: message.value }
    case 'CommittedDraft': {
      const committed = commitCell(
        model,
        model.editingCell.row,
        model.editingCell.column,
        model.draftValue,
      )
      const moved =
        message.move === 'down'
          ? moveFocus(committed, 1, 0)
          : message.move === 'right'
            ? moveFocus(committed, 0, 1)
            : committed
      return { ...moved, editingCell: emptyCell }
    }
    case 'CanceledEdit':
      return { ...model, editingCell: emptyCell, draftValue: '' }
    case 'SetCellValue':
      return commitCell(model, message.row, message.column, message.value)
    case 'ToggledCellBoolean': {
      const people = filteredPeople(model)
      const target = people[message.row]
      if (target === undefined) return model
      return commitCell(
        model,
        message.row,
        message.column,
        target.isActive === true ? 'false' : 'true',
      )
    }
    case 'ClearedSelection':
      return {
        ...model,
        selectedRanges: [],
        selectedRowIndexes: [],
        selectionAnchor: emptyCell,
        selectionEnd: emptyCell,
      }
    case 'SelectedCell':
      return {
        ...model,
        focusedCell: { row: message.row, column: message.column },
        selectionAnchor: { row: message.row, column: message.column },
        selectionEnd: { row: message.row, column: message.column },
      }
    case 'SelectedRange': {
      const end = { row: message.row, column: message.column }
      const anchor = message.extend ? model.selectionAnchor : end
      return {
        ...model,
        focusedCell: end,
        selectionAnchor: anchor.row === -1 ? end : anchor,
        selectionEnd: end,
      }
    }
    case 'SelectedRowIndex': {
      const index = message.index
      if (message.shiftKey && model.lastSelectedRowIndex !== -1) {
        const [lo, hi] = [
          Math.min(model.lastSelectedRowIndex, index),
          Math.max(model.lastSelectedRowIndex, index),
        ]
        const range = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
        const selected = new Set(model.selectedRowIndexes)
        for (const i of range) selected.add(i)
        return {
          ...model,
          selectedRowIndexes: [...selected],
          lastSelectedRowIndex: index,
        }
      }
      const isSelected = model.selectedRowIndexes.includes(index)
      return {
        ...model,
        lastSelectedRowIndex: index,
        selectedRowIndexes: isSelected
          ? model.selectedRowIndexes.filter(i => i !== index)
          : [...model.selectedRowIndexes, index],
      }
    }
    case 'ToggledAllRows': {
      if (!message.checked) return { ...model, selectedRowIndexes: [] }
      return {
        ...model,
        selectedRowIndexes: filteredPeople(model).map((_, i) => i),
      }
    }
    case 'SetSorting':
      return {
        ...model,
        sorting:
          message.column === ''
            ? []
            : [{ id: message.column, desc: message.desc }],
        openPanel: '',
      }
    case 'RemovedSort':
      return {
        ...model,
        sorting: model.sorting.filter(s => s.id !== message.column),
        openPanel: '',
      }
    case 'HidColumn':
      return {
        ...model,
        hiddenColumnIds: model.hiddenColumnIds.includes(message.column)
          ? model.hiddenColumnIds
          : [...model.hiddenColumnIds, message.column],
        openPanel: '',
      }
    case 'ToggledSort': {
      const existing = model.sorting.find(e => e.id === message.column)
      if (existing === undefined)
        return { ...model, sorting: [{ id: message.column, desc: false }] }
      if (!existing.desc)
        return {
          ...model,
          sorting: [{ id: message.column, desc: true }],
        }
      return { ...model, sorting: [] }
    }
    case 'AddedFilter':
      return {
        ...model,
        filters: [
          ...model.filters.filter(f => f.column !== message.column),
          { column: message.column, value: message.value },
        ],
      }
    case 'RemovedFilter':
      return {
        ...model,
        filters: model.filters.filter(f => f.column !== message.column),
      }
    case 'ToggledColumnHidden':
      return {
        ...model,
        hiddenColumnIds: model.hiddenColumnIds.includes(message.column)
          ? model.hiddenColumnIds.filter(c => c !== message.column)
          : [...model.hiddenColumnIds, message.column],
      }
    case 'SetRowHeight':
      return { ...model, rowHeight: message.height, openPanel: '' }
    case 'SetPanel':
      return {
        ...model,
        openPanel: model.openPanel === message.panel ? '' : message.panel,
      }
    case 'OpenedContextMenu':
      return {
        ...model,
        contextMenu: {
          open: true,
          x: message.x,
          y: message.y,
          row: message.row,
          column: message.column,
        },
        focusedCell: { row: message.row, column: message.column },
      }
    case 'ClosedContextMenu':
      return { ...model, contextMenu: { ...model.contextMenu, open: false } }
    case 'AppliedContextAction': {
      const menu = model.contextMenu
      const closed = {
        ...model,
        contextMenu: { ...menu, open: false },
      }
      switch (message.action) {
        case 'clear-cell':
          return commitCell(closed, menu.row, menu.column, '')
        case 'add-row-above':
          return insertRow(closed, menu.row)
        case 'add-row-below':
          return insertRow(closed, menu.row + 1)
        case 'delete-row':
          return deleteRow(closed, menu.row)
        default:
          return closed
      }
    }
    case 'AddedRow':
      return insertRow(model, filteredPeople(model).length)
    case 'AddedRowAt':
      return insertRow(model, message.index)
    case 'DeletedRows': {
      const people = filteredPeople(model)
      const ids = new Set(
        message.indexes
          .map(index => people[index]?.id)
          .filter((id): id is string => id !== undefined),
      )
      return {
        ...model,
        pastStates: [...model.pastStates, model.rows],
        futureStates: [],
        rows: personArray(model).filter(person => !ids.has(person.id)),
        selectedRowIndexes: [],
      }
    }
    case 'ToggledSearch':
      return {
        ...model,
        searchOpen: !model.searchOpen,
        searchQuery: model.searchOpen ? model.searchQuery : '',
        matchIndex: 0,
      }
    case 'ChangedSearchQuery':
      return { ...model, searchQuery: message.value, matchIndex: 0 }
    case 'SetMatchIndex':
      return { ...model, matchIndex: message.index }
    case 'NavigatedMatch': {
      const matches = searchMatches(model)
      if (matches.length === 0) return model
      const delta = message.direction === 'prev' ? -1 : 1
      return {
        ...model,
        matchIndex:
          (model.matchIndex + delta + matches.length) % matches.length,
      }
    }
    case 'Undo': {
      const previous = model.pastStates[model.pastStates.length - 1]
      if (previous === undefined) return model
      return {
        ...model,
        pastStates: model.pastStates.slice(0, -1),
        futureStates: [model.rows, ...model.futureStates],
        rows: previous,
      }
    }
    case 'Redo': {
      const next = model.futureStates[0]
      if (next === undefined) return model
      return {
        ...model,
        futureStates: model.futureStates.slice(1),
        pastStates: [...model.pastStates, model.rows],
        rows: next,
      }
    }
    case 'SetDirection':
      return { ...model, direction: message.direction }
    case 'GridKey':
      return onGridKey(
        model,
        message.key,
        message.ctrl || message.meta,
        message.shift,
      )
    case 'Scrolled':
      return { ...model, scrollTop: message.scrollTop }
  }
}

const onGridKey = (
  model: Model,
  key: string,
  ctrl: boolean,
  shift: boolean,
): Model => {
  const isEditing = model.editingCell.row !== -1
  if (ctrl) {
    switch (key.toLowerCase()) {
      case 'f':
        return update(model, Message.ToggledSearch({}))
      case 'z':
        return shift
          ? update(model, Message.Redo({}))
          : update(model, Message.Undo({}))
      case 'y':
        return update(model, Message.Redo({}))
      case 'a': {
        if (isEditing) return model
        return update(model, Message.ToggledAllRows({ checked: true }))
      }
      default:
        return model
    }
  }
  if (isEditing) {
    switch (key) {
      case 'Escape':
        return update(model, Message.CanceledEdit({}))
      case 'Enter':
        return update(model, Message.CommittedDraft({ move: 'down' }))
      case 'Tab':
        return update(model, Message.CommittedDraft({ move: 'right' }))
      default:
        return model
    }
  }
  switch (key) {
    case 'Escape':
      if (model.searchOpen) return update(model, Message.ToggledSearch({}))
      if (model.contextMenu.open)
        return update(model, Message.ClosedContextMenu({}))
      return update(model, Message.ClearedSelection({}))
    case 'ArrowUp':
      return moveFocus(model, -1, 0)
    case 'ArrowDown':
      return moveFocus(model, 1, 0)
    case 'ArrowLeft':
      return moveFocus(model, 0, -1)
    case 'ArrowRight':
      return moveFocus(model, 0, 1)
    case 'Tab':
      return moveFocus(model, 0, shift ? -1 : 1)
    case 'Enter':
    case 'F2':
      if (model.focusedCell.row === -1) return model
      return update(
        model,
        Message.StartedEditing({
          row: model.focusedCell.row,
          column: model.focusedCell.column,
          seed: '',
        }),
      )
    case 'Delete':
    case 'Backspace': {
      if (model.focusedCell.row === -1) return model
      const rows = [...model.selectedRowIndexes]
      if (rows.length > 1)
        return update(model, Message.DeletedRows({ indexes: rows }))
      return commitCell(
        model,
        model.focusedCell.row,
        model.focusedCell.column,
        '',
      )
    }
    default:
      /* type-over: printable char opens editor seeded with the key */
      if (key.length === 1 && model.focusedCell.row !== -1) {
        return update(
          model,
          Message.StartedEditing({
            row: model.focusedCell.row,
            column: model.focusedCell.column,
            seed: key,
          }),
        )
      }
      return model
  }
}

const MountMessage = defineMessageUnion({
  GridKeydown: {
    key: S.String,
    ctrl: S.Boolean,
    shift: S.Boolean,
    meta: S.Boolean,
  },
  GridContextMenu: {
    x: S.Number,
    y: S.Number,
    row: S.Number,
    column: S.String,
  },
  GridScrolled: {
    scrollTop: S.Number,
  },
})
export type MountMessage = typeof MountMessage.Type

export const GridKeys = Mount.defineStream('TablecnGridKeys', {
  args: {},
  messages: [
    MountMessage.GridKeydown,
    MountMessage.GridContextMenu,
    MountMessage.GridScrolled,
  ],
  execute: ({ element }) =>
    Stream.callback<MountMessage>(queue =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            if (!(element instanceof HTMLElement)) return undefined
            const onKeyDown = (event: KeyboardEvent): void => {
              const target = event.target as HTMLElement | null
              const inEditor =
                target !== null &&
                (target.tagName === 'INPUT' ||
                  target.tagName === 'TEXTAREA' ||
                  target.isContentEditable)
              const printable = event.key.length === 1
              /* when an editor is open only Enter/Escape/Tab + ctrl combos
                 belong to the grid */
              if (inEditor && printable && !event.ctrlKey && !event.metaKey)
                return
              if (
                inEditor &&
                !['Enter', 'Escape', 'Tab'].includes(event.key) &&
                !(event.ctrlKey || event.metaKey)
              )
                return
              const handled =
                event.ctrlKey ||
                event.metaKey ||
                [
                  'ArrowUp',
                  'ArrowDown',
                  'ArrowLeft',
                  'ArrowRight',
                  'Tab',
                  'Enter',
                  'Escape',
                  'Delete',
                  'Backspace',
                  'F2',
                ].includes(event.key) ||
                printable
              if (!handled) return
              if (
                !event.ctrlKey &&
                !event.metaKey &&
                (event.key.startsWith('Arrow') ||
                  event.key === 'Tab' ||
                  event.key === 'Delete' ||
                  event.key === 'Backspace' ||
                  event.key === 'F2')
              )
                event.preventDefault()
              Queue.offerUnsafe(
                queue,
                MountMessage.GridKeydown({
                  key: event.key,
                  ctrl: event.ctrlKey,
                  shift: event.shiftKey,
                  meta: event.metaKey,
                }),
              )
            }
            const onContextMenu = (event: MouseEvent): void => {
              const target = (event.target as HTMLElement).closest(
                '[data-row-index][data-column-id]',
              ) as HTMLElement | null
              if (target === null) return
              event.preventDefault()
              Queue.offerUnsafe(
                queue,
                MountMessage.GridContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  row: Number(target.dataset['rowIndex'] ?? -1),
                  column: target.dataset['columnId'] ?? '',
                }),
              )
            }
            const onScroll = (): void => {
              Queue.offerUnsafe(
                queue,
                MountMessage.GridScrolled({ scrollTop: element.scrollTop }),
              )
            }
            element.addEventListener('keydown', onKeyDown)
            element.addEventListener('contextmenu', onContextMenu)
            element.addEventListener('scroll', onScroll, { passive: true })
            return { onKeyDown, onContextMenu, onScroll }
          }),
          resource =>
            Effect.sync(() => {
              if (resource === undefined || !(element instanceof HTMLElement))
                return
              element.removeEventListener('keydown', resource.onKeyDown)
              element.removeEventListener('contextmenu', resource.onContextMenu)
              element.removeEventListener('scroll', resource.onScroll)
            }),
        )
        return yield* Effect.never
      }),
    ),
})

export const gridKeysMount = <Msg>(
  toParentMessage: (message: MountMessage) => Msg,
) => Mount.mapMessage(GridKeys({}), toParentMessage)

const blankPerson = (id: string): Person => ({
  id,
  name: '',
  skills: [],
  attachments: [],
})

const insertRow = (model: Model, index: number): Model => {
  const people = filteredPeople(model)
  if (index >= people.length || people[index] === undefined) {
    /* append at end of the underlying array */
    return {
      ...model,
      pastStates: [...model.pastStates, model.rows],
      futureStates: [],
      rows: [...model.rows, blankPerson(`person_new_${String(Date.now())}`)],
    }
  }
  const targetId = people[index]!.id
  const rawIndex = personArray(model).findIndex(p => p.id === targetId)
  const rows = [...model.rows]
  rows.splice(
    rawIndex === -1 ? rows.length : rawIndex,
    0,
    blankPerson(`person_new_${String(Date.now())}`),
  )
  return {
    ...model,
    pastStates: [...model.pastStates, model.rows],
    futureStates: [],
    rows,
  }
}

const deleteRow = (model: Model, index: number): Model => {
  const people = filteredPeople(model)
  const target = people[index]
  if (target === undefined) return model
  return {
    ...model,
    pastStates: [...model.pastStates, model.rows],
    futureStates: [],
    rows: personArray(model).filter(p => p.id !== target.id),
  }
}

export interface GridMatch {
  row: number
  column: string
}

export const searchMatches = (model: Model): Array<GridMatch> => {
  const query = model.searchQuery.trim().toLowerCase()
  if (query === '') return []
  const columns = visibleColumns(model)
  const matches: Array<GridMatch> = []
  filteredPeople(model).forEach((person, row) => {
    for (const column of columns) {
      if (cellText(person, column).toLowerCase().includes(query)) {
        matches.push({ row, column })
      }
    }
  })
  return matches
}
