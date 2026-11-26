import { Command, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Dialog, Popover, Slider } from '@effect/ui-kit'
import { Effect, Schema } from 'effect'

import { CalendarDate, RangeCalendarBehavior } from './calendar'

export const SortEntry = Schema.Struct({
  id: Schema.String,
  desc: Schema.Boolean,
})
export type SortEntry = typeof SortEntry.Type
const Range = Schema.Struct({
  min: Schema.NullOr(Schema.Number),
  max: Schema.NullOr(Schema.Number),
})
const DateRange = Schema.Struct({ from: Schema.String, to: Schema.String })
const Facet = Schema.TaggedUnion({
  Numeric: {
    column: Schema.String,
    triggerId: Schema.String,
    min: Schema.Number,
    max: Schema.Number,
    step: Schema.Number,
  },
  Date: {
    column: Schema.String,
    triggerId: Schema.String,
    initialMonth: Schema.optional(CalendarDate),
  },
})
export type DataTableFacet = typeof Facet.Type
const ArrayOfKeys = Schema.Array(Schema.String)

export const DataTableState = Schema.Struct({
  filter: Schema.String,
  sorting: Schema.Array(SortEntry),
  optionFilters: Schema.Record(Schema.String, ArrayOfKeys),
  rangeFilters: Schema.Record(Schema.String, Range),
  dateFilters: Schema.Record(Schema.String, DateRange),
  page: Schema.Number,
  pageSize: Schema.Number,
  selectedRowKeys: ArrayOfKeys,
  anchorKey: Schema.NullOr(Schema.String),
  hiddenColumnKeys: ArrayOfKeys,
})
export type DataTableState = typeof DataTableState.Type
type DateRange = typeof DateRange.Type
type Range = typeof Range.Type
export type DataTableMode = 'client' | 'server'
export type FilterVariant = 'options' | 'range' | 'date'

export type DataTableMechanicsColumn<Row> = {
  readonly key: string
  readonly header: string
  readonly get?: (row: Row) => string
  readonly sortValue?: (row: Row) => string | number
  readonly getNumber?: (row: Row) => number
  readonly getDate?: (row: Row) => number
  readonly set?: (row: Row, value: string) => Row
}

export type DataTableConfig<Row> = Readonly<{
  columns: readonly DataTableMechanicsColumn<Row>[]
  rowKey: (row: Row) => string
  filterText?: (row: Row) => string
  searchColumnKey?: string
  isRowSelectable?: (row: Row) => boolean
}>

const natural = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})
const search = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('ς', 'σ')
const valueOf = <Row>(row: Row, column: DataTableMechanicsColumn<Row>) =>
  column.get?.(row) ?? String(column.sortValue?.(row) ?? '')
const nonNegativeInteger = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback
const sizeOf = (value: number) => Math.max(1, nonNegativeInteger(value, 10))

export const initDataTable = (
  pageSize = 10,
  sorting: readonly SortEntry[] = [],
): DataTableState => ({
  page: 0,
  pageSize: sizeOf(pageSize),
  sorting,
  filter: '',
  optionFilters: {},
  rangeFilters: {},
  dateFilters: {},
  selectedRowKeys: [],
  anchorKey: null,
  hiddenColumnKeys: [],
})

const columnsByKey = <Row>(config: DataTableConfig<Row>) =>
  new Map(config.columns.map(column => [column.key, column]))
const numericBounds = (range: Range, value: number) =>
  Number.isFinite(value) &&
  (range.min === null || value >= range.min) &&
  (range.max === null || value <= range.max)
const dateBounds = (range: DateRange, value: number) => {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return false
  const day = date.toISOString().slice(0, 10)
  return (
    (range.from === '' || day >= range.from) &&
    (range.to === '' || day <= range.to)
  )
}

export const projectDataTable = <Row>({
  rows,
  config,
  state,
  mode = 'client',
  rowCount,
}: {
  readonly rows: readonly Row[]
  readonly config: DataTableConfig<Row>
  readonly state: DataTableState
  readonly mode?: DataTableMode
  readonly rowCount?: number
}) => {
  const size = sizeOf(state.pageSize)
  const columns = columnsByKey(config)
  const filter = search(state.filter).trim()
  const searchColumns =
    config.searchColumnKey === undefined
      ? config.columns
      : config.columns.filter(column => column.key === config.searchColumnKey)
  const options = Object.entries(state.optionFilters).flatMap(
    ([key, values]) => {
      const column = columns.get(key)
      return column === undefined || values.length === 0
        ? []
        : [{ column, values: new Set(values) }]
    },
  )
  const ranges = Object.entries(state.rangeFilters).flatMap(([key, range]) => {
    const read = columns.get(key)?.getNumber
    return read === undefined || (range.min === null && range.max === null)
      ? []
      : [{ read, range }]
  })
  const dates = Object.entries(state.dateFilters).flatMap(([key, range]) => {
    const read = columns.get(key)?.getDate
    return read === undefined || (range.from === '' && range.to === '')
      ? []
      : [{ read, range }]
  })
  const sort = state.sorting.flatMap(({ id, desc }) => {
    const column = columns.get(id)
    return column === undefined ? [] : [{ column, desc }]
  })
  const filtered =
    mode === 'server'
      ? rows
      : rows.filter(
          row =>
            (filter === '' ||
              (config.filterText === undefined
                ? searchColumns.some(column =>
                    search(valueOf(row, column)).includes(filter),
                  )
                : search(config.filterText(row)).includes(filter))) &&
            options.every(({ column, values }) =>
              values.has(valueOf(row, column)),
            ) &&
            ranges.every(({ read, range }) =>
              numericBounds(range, read(row)),
            ) &&
            dates.every(({ read, range }) => dateBounds(range, read(row))),
        )
  const ordered =
    mode === 'server' || sort.length === 0
      ? filtered
      : [...filtered].sort((left, right) => {
          for (const { column, desc } of sort) {
            const a = column.sortValue?.(left) ?? valueOf(left, column)
            const b = column.sortValue?.(right) ?? valueOf(right, column)
            const compared =
              typeof a === 'number' && typeof b === 'number'
                ? a - b
                : natural.compare(String(a), String(b))
            if (Number.isFinite(compared) && compared !== 0)
              return desc ? -compared : compared
          }
          return 0
        })
  const filteredRowCount =
    mode === 'server' && rowCount !== undefined
      ? nonNegativeInteger(rowCount, rows.length)
      : ordered.length
  const pageCount = Math.max(1, Math.ceil(filteredRowCount / size))
  const page = Math.min(pageCount - 1, nonNegativeInteger(state.page, 0))
  const visible =
    mode === 'server' ? ordered : ordered.slice(page * size, (page + 1) * size)
  const selectable = visible
    .filter(row => config.isRowSelectable?.(row) ?? true)
    .map(config.rowKey)
  const selected = new Set(state.selectedRowKeys)
  return {
    rows: visible,
    page,
    pageCount,
    pageSize: size,
    filteredRowCount,
    selectableRowKeys: selectable,
    selectedVisibleCount: selectable.filter(key => selected.has(key)).length,
    filterCount:
      Number(filter !== '') + options.length + ranges.length + dates.length,
  }
}

export const rangeKeys = (
  order: readonly string[],
  anchor: string | null,
  target: string,
): readonly string[] => {
  const from = anchor === null ? -1 : order.indexOf(anchor)
  const to = order.indexOf(target)
  return from < 0 || to < 0
    ? [target]
    : order.slice(Math.min(from, to), Math.max(from, to) + 1)
}

const mutateSelection = (
  selected: readonly string[],
  keys: readonly string[],
  remove: boolean,
) => {
  if (!remove) return [...new Set([...selected, ...keys])]
  const removed = new Set(keys)
  return selected.filter(key => !removed.has(key))
}

const csvCell = (value: string) =>
  /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
export const rowsToCsv = <Row>(
  rows: readonly Row[],
  config: DataTableConfig<Row>,
): string =>
  [
    config.columns.map(column => csvCell(column.header)),
    ...rows.map(row =>
      config.columns.map(column => csvCell(valueOf(row, column))),
    ),
  ]
    .map(line => line.join(','))
    .join('\n')

export const applyBulkValue = <Row>(
  rows: readonly Row[],
  config: DataTableConfig<Row>,
  keys: readonly string[],
  column: string,
  value: string,
): readonly Row[] => {
  const setter = columnsByKey(config).get(column)?.set
  if (setter === undefined) return rows
  const ids = new Set(keys)
  return rows.map(row =>
    ids.has(config.rowKey(row)) ? setter(row, value) : row,
  )
}
export const applyColumnValue = <Row>(
  rows: readonly Row[],
  config: DataTableConfig<Row>,
  key: string,
  column: string,
  value: string,
): readonly Row[] => applyBulkValue(rows, config, [key], column, value)

export const removeRowsByKeys = <Row>(
  rows: readonly Row[],
  config: DataTableConfig<Row>,
  keys: readonly string[],
): readonly Row[] => {
  const removed = new Set(keys)
  return rows.filter(row => !removed.has(config.rowKey(row)))
}

const DownloadCsv = Command.make(
  'CreaseDownloadDataTableCsv',
  { args: { csv: Schema.String, filename: Schema.String } },
  ({ csv, filename }) =>
    Effect.sync(() => {
      const url = URL.createObjectURL(
        new Blob([csv], { type: 'text/csv;charset=utf-8' }),
      )
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    }),
)
export const downloadRowsCsv = <Row>(
  rows: readonly Row[],
  config: DataTableConfig<Row>,
  filename = 'rows.csv',
) => DownloadCsv.make({ csv: rowsToCsv(rows, config), filename })

export const DataTableAction = UiSchema.TaggedEnum({
  Filtered: { value: Schema.String },
  ClearedFilters: {},
  FilterOptionToggled: { column: Schema.String, value: Schema.String },
  RangeChanged: {
    column: Schema.String,
    endpoint: Schema.Literals(['min', 'max']),
    value: Schema.NullOr(Schema.Number),
  },
  RangeSet: { column: Schema.String, ...Range.fields },
  DateChanged: {
    column: Schema.String,
    endpoint: Schema.Literals(['from', 'to']),
    value: Schema.String,
  },
  DateSet: { column: Schema.String, ...DateRange.fields },
  Sorted: { id: Schema.String, extend: Schema.Boolean },
  SortingSet: { value: Schema.Array(SortEntry) },
  Selected: {
    key: Schema.String,
    extend: Schema.Boolean,
    visible: ArrayOfKeys,
  },
  SelectionSet: { keys: ArrayOfKeys },
  SelectedPage: { keys: ArrayOfKeys },
  ColumnToggled: { key: Schema.String },
  PageChanged: { page: Schema.Number },
  PageSizeChanged: { pageSize: Schema.Number },
})
export type DataTableAction = typeof DataTableAction.Type

export const updateDataTable = (
  state: DataTableState,
  action: DataTableAction,
): DataTableState => {
  switch (action._tag) {
    case 'Filtered':
      return { ...state, page: 0, filter: action.value }
    case 'ClearedFilters':
      return {
        ...state,
        page: 0,
        filter: '',
        optionFilters: {},
        dateFilters: {},
        rangeFilters: {},
      }
    case 'FilterOptionToggled': {
      const values = state.optionFilters[action.column] ?? []
      return {
        ...state,
        page: 0,
        optionFilters: {
          ...state.optionFilters,
          [action.column]: mutateSelection(
            values,
            [action.value],
            values.includes(action.value),
          ),
        },
      }
    }
    case 'RangeChanged':
      return {
        ...state,
        page: 0,
        rangeFilters: {
          ...state.rangeFilters,
          [action.column]: {
            ...(state.rangeFilters[action.column] ?? { min: null, max: null }),
            [action.endpoint]: action.value,
          },
        },
      }
    case 'RangeSet':
      return {
        ...state,
        page: 0,
        rangeFilters: {
          ...state.rangeFilters,
          [action.column]: { min: action.min, max: action.max },
        },
      }
    case 'DateChanged':
      return {
        ...state,
        page: 0,
        dateFilters: {
          ...state.dateFilters,
          [action.column]: {
            ...(state.dateFilters[action.column] ?? { from: '', to: '' }),
            [action.endpoint]: action.value,
          },
        },
      }
    case 'DateSet':
      return {
        ...state,
        page: 0,
        dateFilters: {
          ...state.dateFilters,
          [action.column]: { from: action.from, to: action.to },
        },
      }
    case 'Sorted': {
      const current = state.sorting.find(({ id }) => id === action.id)
      const rest = action.extend ? state.sorting : []
      const next = current?.desc
        ? []
        : [{ id: action.id, desc: current !== undefined }]
      const position = rest.findIndex(({ id }) => id === action.id)
      const sorting =
        position < 0
          ? [...rest, ...next]
          : [...rest.slice(0, position), ...next, ...rest.slice(position + 1)]
      return { ...state, page: 0, sorting }
    }
    case 'SortingSet':
      return { ...state, page: 0, sorting: action.value }
    case 'Selected':
      return {
        ...state,
        anchorKey: action.key,
        selectedRowKeys: mutateSelection(
          state.selectedRowKeys,
          action.extend
            ? rangeKeys(action.visible, state.anchorKey, action.key)
            : [action.key],
          state.selectedRowKeys.includes(action.key),
        ),
      }
    case 'SelectionSet':
      return {
        ...state,
        anchorKey: null,
        selectedRowKeys: [...new Set(action.keys)],
      }
    case 'SelectedPage': {
      const selected = new Set(state.selectedRowKeys)
      return {
        ...state,
        selectedRowKeys: mutateSelection(
          state.selectedRowKeys,
          action.keys,
          action.keys.every(key => selected.has(key)),
        ),
      }
    }
    case 'ColumnToggled':
      return {
        ...state,
        hiddenColumnKeys: mutateSelection(
          state.hiddenColumnKeys,
          [action.key],
          state.hiddenColumnKeys.includes(action.key),
        ),
      }
    case 'PageChanged':
      return { ...state, page: nonNegativeInteger(action.page, 0) }
    case 'PageSizeChanged':
      return { ...state, page: 0, pageSize: sizeOf(action.pageSize) }
  }
}

const Message = UiSchema.TaggedEnum({
  Applied: { action: DataTableAction },
  FacetOpened: { triggerId: Schema.NullOr(Schema.String) },
  FacetClosed: {},
  DeleteOpened: { keys: ArrayOfKeys },
  DeleteClosed: {},
  DeleteConfirmed: {},
  Edited: { key: Schema.String },
  ValueApplied: {
    keys: ArrayOfKeys,
    column: Schema.String,
    value: Schema.String,
  },
  ExportRequested: { keys: ArrayOfKeys },
})
export const DataTableEvents = UiSchema.TaggedEnum({
  Changed: { state: DataTableState },
  Edited: { key: Schema.String },
  Deleted: { keys: ArrayOfKeys },
  ValueApplied: {
    keys: ArrayOfKeys,
    column: Schema.String,
    value: Schema.String,
  },
  ExportRequested: { keys: ArrayOfKeys },
})

export const DataTableBehavior = Html.component({
  name: 'CreaseDataTable',
  props: Schema.Struct({
    defaultState: Schema.optional(DataTableState),
    state: Schema.optional(DataTableState),
    facets: Schema.optional(Schema.Array(Facet)),
    today: Schema.optional(CalendarDate),
    locale: Schema.optional(Schema.String),
  }),
  model: Schema.Struct({
    state: DataTableState,
    deleteKeys: ArrayOfKeys,
    facetOpen: Schema.Boolean,
    facetTrigger: Schema.NullOr(Schema.String),
  }),
  message: Message,
  events: DataTableEvents,
}).make({
  init: ({ props }) => ({
    state: props.defaultState ?? initDataTable(),
    deleteKeys: [],
    facetOpen: false,
    facetTrigger: null,
  }),
  update: {
    Applied: ($, { action }) => {
      const state = updateDataTable($.props.state ?? $.model.state, action)
      return $.evolve({ state }).emit(DataTableEvents.Changed({ state }))
    },
    FacetOpened: ($, { triggerId }) =>
      $.evolve({ facetOpen: true, facetTrigger: triggerId }),
    FacetClosed: $ => $.evolve({ facetOpen: false }),
    DeleteOpened: ($, { keys }) => $.evolve({ deleteKeys: keys }),
    DeleteClosed: $ => $.evolve({ deleteKeys: [] }),
    DeleteConfirmed: $ =>
      $.evolve({ deleteKeys: [] }).emit(
        DataTableEvents.Deleted({ keys: $.model.deleteKeys }),
      ),
    Edited: ($, event) => $.emit(event),
    ValueApplied: ($, event) => $.emit(event),
    ExportRequested: ($, event) => $.emit(event),
  },
  parts: (p, model) => {
    const state = p.props.state ?? model.state
    const facet = p.props.facets?.find(
      facet => facet.triggerId === model.facetTrigger,
    )
    const numericFacet = facet?._tag === 'Numeric' ? facet : undefined
    const dates =
      facet?._tag === 'Date' ? state.dateFilters[facet.column] : undefined
    const isDate = Schema.is(CalendarDate)
    const dateValue =
      dates !== undefined && isDate(dates.from) && isDate(dates.to)
        ? { start: dates.from, end: dates.to }
        : null
    const rangeValue =
      numericFacet === undefined
        ? undefined
        : state.rangeFilters[numericFacet.column]
    const movedRange = (value: number | readonly number[]) => {
      if (
        numericFacet === undefined ||
        typeof value === 'number' ||
        value[0] === undefined ||
        value[1] === undefined
      )
        return
      return Message.Applied({
        action: DataTableAction.RangeSet({
          column: numericFacet.column,
          min: value[0] <= numericFacet.min ? null : value[0],
          max: value[1] >= numericFacet.max ? null : value[1],
        }),
      })
    }
    const button = p.part('button', (element, action: DataTableAction) =>
      element
        .attrs({ type: 'button' })
        .on('click', Message.Applied({ action })),
    )
    const sort = p.part('button', (element, id: string, faceted: boolean) =>
      element.attrs({ type: 'button' }).on('click', ({ shift }) =>
        Message.Applied({
          action: DataTableAction.Sorted({ id, extend: faceted && shift }),
        }),
      ),
    )
    const rowSelection = p.part(
      'button',
      (element, key: string, visible: readonly string[]) =>
        element.attrs({ type: 'button' }).on('click', ({ shift }) =>
          Message.Applied({
            action: DataTableAction.Selected({ key, extend: shift, visible }),
          }),
        ),
    )
    const filter = p.part('input', element =>
      element.on('input', ({ value }) =>
        Message.Applied({ action: DataTableAction.Filtered({ value }) }),
      ),
    )
    const range = p.part(
      'input',
      (element, column: string, endpoint: 'min' | 'max') =>
        element.on('input', ({ value }) =>
          Message.Applied({
            action: DataTableAction.RangeChanged({
              column,
              endpoint,
              value:
                value === '' || !Number.isFinite(Number(value))
                  ? null
                  : Number(value),
            }),
          }),
        ),
    )
    const date = p.part(
      'input',
      (element, column: string, endpoint: 'from' | 'to') =>
        element.on('change', ({ value }) =>
          Message.Applied({
            action: DataTableAction.DateChanged({ column, endpoint, value }),
          }),
        ),
    )
    const choose = p.part(
      'select',
      (element, action: (value: string) => DataTableAction | undefined) =>
        element.on('change', ({ value }) => {
          const next = action(value)
          return next === undefined
            ? undefined
            : Message.Applied({ action: next })
        }),
    )
    const edit = p.part('button', (element, key: string) =>
      element.attrs({ type: 'button' }).on('click', Message.Edited({ key })),
    )
    const applyValue = p.part(
      'select',
      (element, keys: readonly string[], column: string) =>
        element.on('change', ({ value }) =>
          value === ''
            ? undefined
            : Message.ValueApplied({ keys, column, value }),
        ),
    )
    const requestExport = p.part('button', (element, keys: readonly string[]) =>
      element
        .attrs({ type: 'button' })
        .on('click', Message.ExportRequested({ keys })),
    )
    const requestDelete = p.part('button', (element, keys: readonly string[]) =>
      element
        .attrs({ type: 'button' })
        .on('click', Message.DeleteOpened({ keys })),
    )
    const confirmDelete = p.part('button', element =>
      element.attrs({ type: 'button' }).on('click', Message.DeleteConfirmed()),
    )
    return p.child(Dialog, {
      props: {
        open: model.deleteKeys.length > 0,
        modal: true,
        disablePointerDismissal: true,
        topLayer: true,
      },
      onEmit: {
        RequestedClose: () => Message.DeleteClosed(),
        RequestedOpen: () => undefined,
        Settled: () => undefined,
      },
      parts: alert =>
        p.child(Popover, {
          props: {
            open: model.facetOpen && facet !== undefined,
            triggerId: model.facetTrigger,
            side: 'bottom',
            align: 'start',
            sideOffset: 4,
          },
          onEmit: {
            RequestedOpen: ({ triggerId }) =>
              Message.FacetOpened({ triggerId }),
            RequestedClose: () => Message.FacetClosed(),
            Settled: () => undefined,
          },
          parts: facetPopover =>
            p.child(Slider, {
              props: {
                value: [
                  rangeValue?.min ?? numericFacet?.min ?? 0,
                  rangeValue?.max ?? numericFacet?.max ?? 100,
                ],
                min: numericFacet?.min,
                max: numericFacet?.max,
                step: numericFacet?.step,
                thumbCollisionBehavior: 'none',
              },
              onEmit: {
                Moved: ({ value }) => movedRange(value),
                Committed: () => undefined,
              },
              parts: facetSlider =>
                p.child(RangeCalendarBehavior, {
                  key: facet?._tag === 'Date' ? facet.column : undefined,
                  props: {
                    value: dateValue,
                    today:
                      p.props.today ?? new Date().toISOString().slice(0, 10),
                    locale: p.props.locale,
                    initialMonth:
                      facet?._tag === 'Date' ? facet.initialMonth : undefined,
                  },
                  onEmit: {
                    Picked: ({ start, end }) =>
                      facet?._tag !== 'Date'
                        ? undefined
                        : Message.Applied({
                            action: DataTableAction.DateSet({
                              column: facet.column,
                              from: start,
                              to: end,
                            }),
                          }),
                  },
                  parts: facetCalendar => ({
                    state,
                    facet,
                    facetPopover,
                    facetSlider,
                    facetCalendar,
                    deleteKeys: model.deleteKeys,
                    button,
                    sort,
                    rowSelection,
                    filter,
                    range,
                    date,
                    choose,
                    edit,
                    applyValue,
                    requestExport,
                    requestDelete,
                    confirmDelete,
                    alert,
                  }),
                }),
            }),
        }),
    })
  },
})
