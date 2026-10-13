/* Model for the tablecn tasks table block (mirrors the nuqs URL state +
   tanstack table state from tablecn/src/app/components/tasks-table.tsx).
   Single open-popover id replaces React's per-component useState. */

import { Effect, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { Command } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

import {
  generateTasks,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/tablecn-data'

export const DataMode = S.Literals(['server', 'client'])
export type DataMode = typeof DataMode.Type
export const FilterMode = S.Literals(['plain', 'advanced', 'command'])
export type FilterMode = typeof FilterMode.Type

export const SortEntry = S.Struct({ id: S.String, desc: S.Boolean })
export type SortEntry = typeof SortEntry.Type

/* which overlay panel is open — one at a time, like the DOM allows */
export const OpenPanel = S.Literals([
  'none',
  'filter-status',
  'filter-priority',
  'filter-hours',
  'filter-created',
  'sort-menu',
  'view-options',
  'control-menu',
  'filter-menu',
  'command-filter',
])
export type OpenPanel = typeof OpenPanel.Type

export const Model = S.Struct({
  tasks: S.Array(S.Any),
  sorting: S.Array(SortEntry),
  titleQuery: S.String,
  statusFilter: S.Array(S.String),
  priorityFilter: S.Array(S.String),
  hoursMin: S.Number,
  hoursMax: S.Number,
  hasHoursFilter: S.Boolean,
  createdFrom: S.String,
  createdTo: S.String,
  pageIndex: S.Number,
  pageSize: S.Number,
  selectedIds: S.Array(S.String),
  anchorId: S.String,
  hiddenColumnIds: S.Array(S.String),
  openPanel: OpenPanel,
  headerMenuColumnId: S.String,
  rowMenuRowId: S.String,
  updateSheetTaskId: S.String,
  draftTitle: S.String,
  draftLabel: S.String,
  draftStatus: S.String,
  draftPriority: S.String,
  draftHours: S.String,
  deleteDialogIds: S.Array(S.String),
  dataMode: DataMode,
  filterMode: FilterMode,
  direction: S.Literals(['ltr', 'rtl']),
  actionBarMenu: S.String,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChangedTitleQuery: { value: S.String },
  ToggledStatusFilter: { value: S.String },
  ToggledPriorityFilter: { value: S.String },
  ChangedHoursMin: { value: S.String },
  ChangedHoursMax: { value: S.String },
  ChangedCreatedFrom: { value: S.String },
  ChangedCreatedTo: { value: S.String },
  ClearedFilters: {},
  ToggledSort: { columnId: S.String, desc: S.Boolean },
  AddedSort: { columnId: S.String },
  RemovedSort: { index: S.Number },
  ChangedSortDirection: { index: S.Number, desc: S.Boolean },
  ChangedSortColumn: { index: S.Number, columnId: S.String },
  MovedSort: { from: S.Number, to: S.Number },
  ResetSorting: {},
  ToggledSortMenu: {},
  SetPanel: { panel: OpenPanel },
  SetHeaderMenu: { columnId: S.String },
  SetRowMenu: { rowId: S.String },
  ToggledColumnHidden: { columnId: S.String },
  ToggledRowSelected: { id: S.String, shiftKey: S.Boolean },
  ToggledAllRows: { checked: S.Boolean },
  SetPage: { index: S.Number },
  SetPageSize: { size: S.Number },
  OpenedUpdateSheet: { taskId: S.String },
  ClosedUpdateSheet: {},
  ChangedDraftField: { field: S.String, value: S.String },
  SavedTask: {},
  OpenedDeleteDialog: { ids: S.Array(S.String) },
  ClosedDeleteDialog: {},
  ConfirmedDelete: {},
  SetDataMode: { mode: DataMode },
  SetFilterMode: { mode: FilterMode },
  SetDirection: { direction: S.Literals(['ltr', 'rtl']) },
  SetActionBarMenu: { menu: S.String },
  AppliedBulkStatus: { status: S.String },
  AppliedBulkPriority: { priority: S.String },
  ClosedActionBar: {},
  RequestedExport: {},
  CompletedExport: {},
})
export type Message = typeof Message.Type

export const init = (taskCount = 100): Model => ({
  tasks: generateTasks(taskCount),
  sorting: [{ id: 'createdAt', desc: true }],
  titleQuery: '',
  statusFilter: [],
  priorityFilter: [],
  hoursMin: 0,
  hoursMax: 0,
  hasHoursFilter: false,
  createdFrom: '',
  createdTo: '',
  pageIndex: 0,
  pageSize: 10,
  selectedIds: [],
  anchorId: '',
  hiddenColumnIds: [],
  openPanel: 'none',
  headerMenuColumnId: '',
  rowMenuRowId: '',
  updateSheetTaskId: '',
  draftTitle: '',
  draftLabel: 'bug',
  draftStatus: 'todo',
  draftPriority: 'low',
  draftHours: '',
  deleteDialogIds: [],
  dataMode: 'server',
  filterMode: 'plain',
  direction: 'ltr',
  actionBarMenu: '',
})

const taskArray = (model: Model): Array<Task> => model.tasks as Array<Task>

export const filterCount = (model: Model): number =>
  (model.titleQuery !== '' ? 1 : 0) +
  (model.statusFilter.length > 0 ? 1 : 0) +
  (model.priorityFilter.length > 0 ? 1 : 0) +
  (model.hasHoursFilter ? 1 : 0) +
  (model.createdFrom !== '' || model.createdTo !== '' ? 1 : 0)

/* All filters + sorting + pagination applied to tasks — the tanstack
   row-model equivalents, computed once for both renderers. */
export const filteredTasks = (model: Model): Array<Task> => {
  const query = model.titleQuery.trim().toLowerCase()
  return taskArray(model).filter(task => {
    if (query !== '' && !task.title.toLowerCase().includes(query)) return false
    if (
      model.statusFilter.length > 0 &&
      !model.statusFilter.includes(task.status)
    )
      return false
    if (
      model.priorityFilter.length > 0 &&
      !model.priorityFilter.includes(task.priority)
    )
      return false
    if (
      model.hasHoursFilter &&
      (task.estimatedHours < model.hoursMin ||
        (model.hoursMax > 0 && task.estimatedHours > model.hoursMax))
    )
      return false
    if (model.createdFrom !== '' || model.createdTo !== '') {
      const day = task.createdAt.toISOString().slice(0, 10)
      if (model.createdFrom !== '' && day < model.createdFrom) return false
      if (model.createdTo !== '' && day > model.createdTo) return false
    }
    return true
  })
}

const statusRank: Record<TaskStatus, number> = {
  todo: 0,
  'in-progress': 1,
  done: 2,
  canceled: 3,
}
const priorityRank: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
}

const sortValue = (task: Task, id: string): string | number => {
  switch (id) {
    case 'code':
      return task.code
    case 'title':
      return task.title
    case 'status':
      return statusRank[task.status]
    case 'priority':
      return priorityRank[task.priority]
    case 'estimatedHours':
      return task.estimatedHours
    case 'createdAt':
      return task.createdAt.getTime()
    default:
      return 0
  }
}

export const sortedTasks = (
  tasks: ReadonlyArray<Task>,
  sorting: ReadonlyArray<SortEntry>,
): ReadonlyArray<Task> => {
  if (sorting.length === 0) return tasks
  return [...tasks].sort((a, b) => {
    for (const entry of sorting) {
      const av = sortValue(a, entry.id)
      const bv = sortValue(b, entry.id)
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv))
      if (cmp !== 0) return entry.desc ? -cmp : cmp
    }
    return 0
  })
}

export const pageTasks = (
  model: Model,
): Readonly<{
  rows: ReadonlyArray<Task>
  filtered: ReadonlyArray<Task>
  pageCount: number
}> => {
  const filtered = sortedTasks(filteredTasks(model), model.sorting)
  const pageCount = Math.max(1, Math.ceil(filtered.length / model.pageSize))
  const index = Math.min(model.pageIndex, pageCount - 1)
  return {
    rows: filtered.slice(index * model.pageSize, (index + 1) * model.pageSize),
    filtered,
    pageCount,
  }
}

/* visible = rows rendered on the current page (tablecn checks
   getSelectedRowModel + pagination). */
export const visibleSelectedCount = (model: Model): number => {
  const ids = new Set(model.selectedIds)
  return pageTasks(model).rows.filter(row => ids.has(row.id)).length
}

const closePanels = (model: Model): Model => ({
  ...model,
  openPanel: 'none',
  headerMenuColumnId: '',
  rowMenuRowId: '',
  actionBarMenu: '',
})

const resetPage = (model: Model): Model => ({ ...model, pageIndex: 0 })

const toggleInList = (
  list: ReadonlyArray<string>,
  value: string,
): Array<string> =>
  list.includes(value) ? list.filter(v => v !== value) : [...list, value]

/* shift-range selection on the *filtered+sorted* row order, like
   tanstack's getToggleSelectedHandler with enableRowRangeSelection. */
const rangeIds = (model: Model, id: string): Array<string> => {
  const rows = pageTasks(model).rows
  const anchor = model.anchorId
  const aIndex = rows.findIndex(row => row.id === anchor)
  const bIndex = rows.findIndex(row => row.id === id)
  if (aIndex === -1 || bIndex === -1) return [id]
  const [lo, hi] = aIndex < bIndex ? [aIndex, bIndex] : [bIndex, aIndex]
  return rows.slice(lo, hi + 1).map(row => row.id)
}

const updateModel = (model: Model, message: Message): Model => {
  switch (message._tag) {
    case 'ChangedTitleQuery':
      return resetPage({ ...model, titleQuery: message.value })
    case 'ToggledStatusFilter':
      return resetPage({
        ...model,
        statusFilter: toggleInList(model.statusFilter, message.value),
      })
    case 'ToggledPriorityFilter':
      return resetPage({
        ...model,
        priorityFilter: toggleInList(model.priorityFilter, message.value),
      })
    case 'ChangedHoursMin': {
      const value = Number(message.value)
      return resetPage({
        ...model,
        hasHoursFilter: true,
        hoursMin: Number.isNaN(value) ? 0 : value,
      })
    }
    case 'ChangedHoursMax': {
      const value = Number(message.value)
      return resetPage({
        ...model,
        hasHoursFilter: true,
        hoursMax: Number.isNaN(value) ? 0 : value,
      })
    }
    case 'ChangedCreatedFrom':
      return resetPage({ ...model, createdFrom: message.value })
    case 'ChangedCreatedTo':
      return resetPage({ ...model, createdTo: message.value })
    case 'ClearedFilters':
      return resetPage({
        ...model,
        titleQuery: '',
        statusFilter: [],
        priorityFilter: [],
        hasHoursFilter: false,
        hoursMin: 0,
        hoursMax: 0,
        createdFrom: '',
        createdTo: '',
      })
    case 'ToggledSort': {
      const existing = model.sorting.find(
        entry => entry.id === message.columnId,
      )
      const isOnly = existing !== undefined && model.sorting.length === 1
      /* tablecn header menu: clicking active direction removes the sort;
         clicking inactive direction sets it as the only sort. */
      if (existing !== undefined && existing.desc === message.desc && isOnly)
        return resetPage({ ...model, sorting: [] })
      if (existing !== undefined && existing.desc === message.desc)
        return resetPage({
          ...model,
          sorting: model.sorting.filter(entry => entry.id !== message.columnId),
        })
      return resetPage({
        ...model,
        sorting: [
          { id: message.columnId, desc: message.desc },
          ...model.sorting.filter(entry => entry.id !== message.columnId),
        ],
      })
    }
    case 'AddedSort':
      return resetPage({
        ...model,
        sorting: [
          ...model.sorting,
          { id: message.columnId, desc: false },
        ].filter(
          (entry, index, list) =>
            list.findIndex(other => other.id === entry.id) === index,
        ),
      })
    case 'RemovedSort':
      return resetPage({
        ...model,
        sorting: model.sorting.filter((_, i) => i !== message.index),
      })
    case 'ChangedSortDirection':
      return resetPage({
        ...model,
        sorting: model.sorting.map((entry, i) =>
          i === message.index ? { ...entry, desc: message.desc } : entry,
        ),
      })
    case 'ChangedSortColumn':
      return resetPage({
        ...model,
        sorting: model.sorting.map((entry, i) =>
          i === message.index ? { ...entry, id: message.columnId } : entry,
        ),
      })
    case 'MovedSort': {
      const list = [...model.sorting]
      const [moved] = list.splice(message.from, 1)
      if (moved === undefined) return model
      list.splice(message.to, 0, moved)
      return { ...model, sorting: list }
    }
    case 'ResetSorting':
      return resetPage({ ...model, sorting: [] })
    case 'ToggledSortMenu':
      return {
        ...model,
        openPanel: model.openPanel === 'sort-menu' ? 'none' : 'sort-menu',
      }
    case 'SetPanel':
      return {
        ...model,
        openPanel: model.openPanel === message.panel ? 'none' : message.panel,
        headerMenuColumnId: '',
        rowMenuRowId: '',
        actionBarMenu: '',
      }
    case 'SetHeaderMenu':
      return {
        ...model,
        headerMenuColumnId:
          model.headerMenuColumnId === message.columnId ? '' : message.columnId,
        openPanel: 'none',
        rowMenuRowId: '',
        actionBarMenu: '',
      }
    case 'SetRowMenu':
      return {
        ...model,
        rowMenuRowId: model.rowMenuRowId === message.rowId ? '' : message.rowId,
        openPanel: 'none',
        headerMenuColumnId: '',
        actionBarMenu: '',
      }
    case 'ToggledColumnHidden':
      return {
        ...model,
        hiddenColumnIds: toggleInList(model.hiddenColumnIds, message.columnId),
      }
    case 'ToggledRowSelected': {
      const id = message.id
      const isSelected = model.selectedIds.includes(id)
      if (message.shiftKey && model.anchorId !== '') {
        const ids = rangeIds(model, id)
        const selected = new Set(model.selectedIds)
        for (const rangeId of ids) selected.add(rangeId)
        return { ...model, selectedIds: [...selected], anchorId: id }
      }
      return {
        ...model,
        anchorId: id,
        selectedIds: isSelected
          ? model.selectedIds.filter(selectedId => selectedId !== id)
          : [...model.selectedIds, id],
      }
    }
    case 'ToggledAllRows': {
      const ids = pageTasks(model).rows.map(row => row.id)
      if (!message.checked) {
        const page = new Set(ids)
        return {
          ...model,
          selectedIds: model.selectedIds.filter(id => !page.has(id)),
        }
      }
      const selected = new Set(model.selectedIds)
      for (const id of ids) selected.add(id)
      return { ...model, selectedIds: [...selected] }
    }
    case 'SetPage':
      return { ...model, pageIndex: Math.max(0, message.index) }
    case 'SetPageSize':
      return { ...model, pageSize: message.size, pageIndex: 0 }
    case 'OpenedUpdateSheet': {
      const task = taskArray(model).find(t => t.id === message.taskId)
      if (task === undefined) return model
      return {
        ...closePanels(model),
        updateSheetTaskId: task.id,
        draftTitle: task.title,
        draftLabel: task.label,
        draftStatus: task.status,
        draftPriority: task.priority,
        draftHours: String(task.estimatedHours),
      }
    }
    case 'ClosedUpdateSheet':
      return { ...model, updateSheetTaskId: '' }
    case 'ChangedDraftField': {
      switch (message.field) {
        case 'title':
          return { ...model, draftTitle: message.value }
        case 'label':
          return { ...model, draftLabel: message.value }
        case 'status':
          return { ...model, draftStatus: message.value }
        case 'priority':
          return { ...model, draftPriority: message.value }
        case 'estimatedHours':
          return { ...model, draftHours: message.value }
        default:
          return model
      }
    }
    case 'SavedTask': {
      if (model.updateSheetTaskId === '') return model
      const hours = Number(model.draftHours)
      return {
        ...model,
        updateSheetTaskId: '',
        tasks: taskArray(model).map(task =>
          task.id === model.updateSheetTaskId
            ? {
                ...task,
                title: model.draftTitle,
                label: model.draftLabel as Task['label'],
                status: model.draftStatus as TaskStatus,
                priority: model.draftPriority as TaskPriority,
                estimatedHours: Number.isNaN(hours) ? 0 : hours,
                updatedAt: new Date(),
              }
            : task,
        ),
      }
    }
    case 'OpenedDeleteDialog':
      return {
        ...closePanels(model),
        deleteDialogIds: message.ids,
      }
    case 'ClosedDeleteDialog':
      return { ...model, deleteDialogIds: [] }
    case 'ConfirmedDelete': {
      const ids = new Set(model.deleteDialogIds)
      return {
        ...resetPage(model),
        deleteDialogIds: [],
        tasks: taskArray(model).filter(task => !ids.has(task.id)),
        selectedIds: model.selectedIds.filter(id => !ids.has(id)),
      }
    }
    case 'SetDataMode':
      return { ...model, dataMode: message.mode }
    case 'SetFilterMode':
      return { ...model, filterMode: message.mode }
    case 'SetDirection':
      return { ...model, direction: message.direction }
    case 'SetActionBarMenu':
      return {
        ...model,
        actionBarMenu: model.actionBarMenu === message.menu ? '' : message.menu,
      }
    case 'AppliedBulkStatus':
      return {
        ...model,
        tasks: taskArray(model).map(task =>
          model.selectedIds.includes(task.id)
            ? { ...task, status: message.status as TaskStatus }
            : task,
        ),
      }
    case 'AppliedBulkPriority':
      return {
        ...model,
        tasks: taskArray(model).map(task =>
          model.selectedIds.includes(task.id)
            ? { ...task, priority: message.priority as TaskPriority }
            : task,
        ),
      }
    case 'ClosedActionBar':
      return { ...model, selectedIds: [], anchorId: '', actionBarMenu: '' }
    default:
      return model
  }
}

const CSV_FIELDS = [
  'id',
  'title',
  'status',
  'label',
  'priority',
  'estimatedHours',
  'createdAt',
] as const

const csvCell = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

export const tasksToCsv = (tasks: ReadonlyArray<Task>): string =>
  [
    CSV_FIELDS.join(','),
    ...tasks.map(task =>
      CSV_FIELDS.map(field => csvCell(String(task[field]))).join(','),
    ),
  ].join('\n')

const ExportTasksCsv = Command.define('ExportTablecnTasksCsv', {
  args: { csv: S.String, filename: S.String },
  messages: [Message.CompletedExport],
  execute: ({ csv, filename }) =>
    Effect.sync(() => {
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)
    }).pipe(Effect.as(Message.CompletedExport({}))),
})

type UpdateReturn = Update.Return<Model, Message>

export const update = (model: Model, message: Message): UpdateReturn =>
  message._tag === 'RequestedExport'
    ? {
        model,
        commands: [
          ExportTasksCsv({
            csv: tasksToCsv(filteredTasks(model)),
            filename: 'tasks.csv',
          }),
        ],
      }
    : { model: updateModel(model, message) }
