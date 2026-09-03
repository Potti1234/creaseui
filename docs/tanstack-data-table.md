# TanStack data table

This document describes the controlled StyleX data table implemented in
`src/stylex/tanstack/data-table.ts`, its Foldkit state in
`src/lib/tanstack-table-state.ts`, and the examples at
`/blocks-stylex/table`.

The component uses `@tanstack/table-core`, not a React, Vue, Solid, or Svelte
adapter. TanStack calculates rows, sorting, filtering, and pagination. Foldkit
owns the serializable model, messages, update function, effects, and rendered
HTML. StyleX owns all visual styling.

## Source map

| Concern | Source |
| --- | --- |
| Public column and table props, TanStack adapter, rendered view | `src/stylex/tanstack/data-table.ts` |
| Serializable model, messages, reducer, layout snapshots | `src/lib/tanstack-table-state.ts` |
| StyleX layout, pinned layers, controls, panels | `src/stylex/tanstack/data-table.stylex.ts` |
| Opaque pinned-surface tokens | `src/stylex/complex-tokens.stylex.ts` |
| Complete, filter, expandable, and virtual examples | `src/demo/blocks-stylex/tanstack-table-page.ts` |
| Reducer and implementation regression tests | `test/tanstack-table.test.ts` |
| Browser playground | `/blocks-stylex/table` |

## Feature inventory

The current rendered table supports:

- controlled client-side sorting;
- text, enum, number, and date-time column filters;
- an active-filter summary and individual filter removal;
- row selection, select-all, and indeterminate selection;
- expandable rows and custom expanded content;
- optional row-click messages;
- client-side pagination, editable page size, and external total metadata;
- column visibility, ordering, pinning, and layout reset controls;
- direct pointer-based column resizing;
- content-aware default widths and an optional stretched final column;
- parent-owned layout persistence with schema versioning;
- sticky headers, sticky data columns, and sticky selection/expand prefixes;
- loading and empty states;
- custom cell rendering, tooltips, and a custom footer prefix;
- semantic table, row, column-header, cell, checkbox, separator, and status
  roles.

The component does not virtualize rows. Use the separate Foldkit VirtualList
table shown on the same playground page when mounting thousands of rows is the
primary requirement.

## Architecture and state ownership

The component is fully controlled. It never mutates application state and does
not write to `localStorage`. Every interaction emits a `State.Message` through
`toParentMessage`; the parent applies `State.update` and returns the new model.

```ts
import * as TableState from '@/lib/tanstack-table-state'
import {
  tanStackDataTable,
  type TanStackDataTableProps,
} from '@/stylex/tanstack/data-table'

type Model = Readonly<{ table: TableState.Model }>

const init = (): Model => ({
  table: TableState.init({
    pageSize: 20,
    pinnedColumnIds: ['select', 'title'],
    layoutVersion: 1,
  }),
})

const update = (model: Model, message: TableState.Message): Model => ({
  ...model,
  table: TableState.update(model.table, message),
})

const view = (model: Model, h: HtmlBuilder<TableState.Message>): Html =>
  tanStackDataTable({
    ariaLabel: 'Tasks',
    columns,
    model: model.table,
    rows,
    rowKey: row => row.id,
    toParentMessage: message => message,
  }, h)
```

An application with a larger parent message union should wrap the child
message, as the table playground does with `GotTanStackMessage`.

## Column API

`TanStackDataTableColumn<Data, Message>` defines one data column.

| Property | Required | Behavior |
| --- | --- | --- |
| `id` | yes | Stable identity used by sorting, filters, widths, visibility, ordering, pinning, and persistence. Must be unique. |
| `header` | yes | Visible header label and basis for accessible filter labels and automatic width estimation. |
| `value(row)` | yes | Raw sort/filter value and fallback cell text. Return `string` or `number`. |
| `cell(row, h)` | no | Custom rendered cell. If omitted, `value` is stringified. |
| `aggregate(value)` | no | Reserved metadata; the current rendered table does not group or aggregate rows. |
| `canGroup` | no | Reserved metadata; grouping controls are not currently rendered. |
| `canHide` | no | Currently affects automatic width allowance only. It does not yet disable the layout menu's visibility button. |
| `canSort` | no | Defaults to `true`. `false` removes header sorting behavior and its sort icon. |
| `size` | no | Explicit initial width when `defaultSize` is absent. |
| `defaultSize` | no | Preferred explicit initial width. Takes precedence over `size`. |
| `minSize` | no | Minimum for the initial width and TanStack column definition. Direct drag resizing is globally clamped to 60–960 px. |
| `headerTooltip` | no | Adds a titled, accessible information icon beside the label. |
| `sticky` | no | Marks the column as pinned when the layout menu is reset. Initial pinning still comes from the model. |
| `filterValue(row)` | no | Alternate raw value used only for filtering. Useful when `value` is formatted. |
| `filterable` | no | Set to `false` to suppress a configured filter control. |
| `filter` | no | Enables one of the four typed filter panels described below. |

Example:

```ts
const columns: ReadonlyArray<TanStackDataTableColumn<Task, Message>> = [
  {
    id: 'title',
    header: 'Task',
    headerTooltip: 'A concise description of the work item.',
    value: row => row.title,
    cell: (row, h) => h.div([h.Title(row.title)], [row.title]),
    minSize: 200,
    defaultSize: 280,
    sticky: true,
    filter: { type: 'text' },
  },
  {
    id: 'status',
    header: 'Status',
    value: row => row.status,
    filter: {
      type: 'enum',
      options: [
        { value: 'backlog', label: 'Backlog', count: 12 },
        { value: 'done', label: 'Done', count: 8, color: 'green' },
      ],
    },
  },
  {
    id: 'points',
    header: 'Points',
    value: row => row.points,
    cell: row => `${row.points} pts`,
    filter: { type: 'number', unit: 'pts', step: 1 },
  },
  {
    id: 'due',
    header: 'Due',
    value: row => row.due,
    filter: { type: 'datetime' },
  },
]
```

## Table props

### Active props

| Property | Required/default | Behavior |
| --- | --- | --- |
| `ariaLabel` | required | Accessible name on the element with `role="table"`. It also participates in the scroll subscription identity when no `storageKey` exists. |
| `columns` | required | Column definitions. |
| `model` | required | Current serializable `State.Model`. |
| `rows` | required | Dataset passed to TanStack. Filtering, sorting, and pagination operate on this array. |
| `rowKey` | required | Stable row identity. |
| `toParentMessage` | required | Maps every table message into the owning application's message type. |
| `emptyText` | `Keine Daten gefunden` | Text rendered when the current row model is empty. |
| `pageSizeOptions` | none | Enables editable page-size UI and supplies its suggested choices. Positive custom values can also be committed with Enter. |
| `enableRowSelection` | `true` | Controls the selection prefix and select-all behavior. |
| `allSelectableRowIds` | filtered row IDs | Explicit scope for select-all and selected-count calculations. |
| `enableExpandableRows` | `false` | Adds an expand prefix and expandable detail rows. |
| `expandedContent` | fallback text | Renders content below an expanded row. |
| `onRowClick` | none | Emits a custom message when a data cell is clicked. Without it, expandable tables toggle expansion. |
| `isLoading` | `false` | Replaces the scroller with a status indicator. |
| `loadingText` | `Wird geladen…` | Loading label. |
| `stretchColumns` | `false` | Makes only the last visible column `minmax(currentWidth, 1fr)`. Earlier columns keep exact widths. |
| `storageKey` | none | Enables resize handles, the modified/reset rail, and a persistent-table footer. It names behavior but does not itself read or write storage. |
| `footerContent` | none | Content inserted at the left of the footer. |
| `pagination` | derived from filtered rows | Supplies `totalCount` and optional `hasMore` metadata for page labels/buttons. The actual rows are still paginated locally. |

### Declared but currently inactive props

These properties remain in the public type for compatibility or planned work,
but the current renderer does not read them:

- `enableColumnOrder`
- `enableColumnVisibility`
- `layoutVersion` (use `model.layoutVersion` instead)
- `onResetFilters`
- `onResetSort`
- `filterPlaceholder`
- `facet`
- `grouping`
- `pinnedColumn`
- `sizing`
- `enableDensity`
- `enableRowPinning`

Column ordering, visibility, and pinning controls are currently shown whenever
the footer is rendered, regardless of their corresponding enable props.
Grouping, row pinning, density controls, global filtering, and facet controls
are represented in parts of the model or prop surface but are not rendered by
this component.

## Sorting

Clicking a sortable header replaces the active UI sort with that column:

1. a new column becomes ascending;
2. clicking the same column toggles ascending/descending;
3. switching columns starts ascending on the new column.

The exported `nextSorting` helper supports an additive three-state cycle
(ascending, descending, removed), but the current header renderer does not use
that helper. Programmatic multi-column sorting remains possible by putting
multiple entries in `model.sorting`; only the first entry receives the active
header icon behavior.

Sorting resets `pageIndex` to zero.

## Filters

Every active filter is stored as a serializable `ColumnFilter`:

```ts
type ColumnFilter = {
  columnId: string
  kind: 'text' | 'enum' | 'datetime' | 'number'
  value: string
  secondaryValue: string
  values: ReadonlyArray<string>
  operator: 'eq' | 'gte' | 'lte' | 'between'
}
```

Use `columnFilter(columnId, kind, options)` rather than constructing all fields
manually.

### Text

- Case-insensitive substring match.
- Apply with the button or Enter.
- An empty applied draft removes the filter.

### Enum

- Multi-select with immediate application.
- An empty selection removes the filter.
- Options support labels, counts, and an optional text color.
- A search input appears when more than five options exist.

### Number

- Supports equal, greater/equal, less/equal, and inclusive between.
- Optional `unit` is shown in inputs and summaries.
- Optional `step` defaults to 1.
- Invalid, missing, or reversed ranges cannot be applied.

### Date and time

- Presets cover the last hour, 6 hours, 24 hours, 7 days, 30 days, and 3 months.
- A two-month custom calendar and date-time inputs support an inclusive range.
- Future calendar days are disabled.
- Calendar navigation cannot move beyond the current month.

Filtering resets `pageIndex` to zero. When filters exist and `storageKey` is
set, the left rail exposes a filter count, summaries, individual removal, a
full-view reset, and a width-only reset.

Only one overlay is open at a time. Clicking the backdrop closes it. Scrolling
the table scroller also emits `ClosedTableOverlays`; this is essential when an
unpinned filter anchor moves underneath a pinned column.

## Selection and expansion

Selection uses accessible buttons with `role="checkbox"` and supports
`aria-checked="mixed"` for partial selection. Select-all acts on
`allSelectableRowIds` when supplied; otherwise it acts on all filtered rows,
not only the current page.

Expansion adds a 40 px prefix column. The expanded detail is a separate block
after the grid row. When both selection and expansion are enabled, their sticky
offsets are calculated independently before data-column offsets.

If at least one real data column is pinned, the selection and expansion prefix
cells are pinned as well. The synthetic `select` ID may be kept in persisted
layout metadata, but it is not a real entry in `columns`.

## Column ordering, visibility, and pinning

The footer's `Spalten anpassen` menu provides:

- move left/right;
- show/hide;
- pin/unpin;
- restore the declared column order, visibility, default pin set, and widths.

Pinning a column moves all pinned IDs to the start of `columnOrder`. Persisted
or programmatically created models should preserve the same invariant: visible
pinned columns must form the leading contiguous data-column group. Hidden
columns are automatically removed from `pinnedColumnIds`.

`sticky: true` on a column only defines the pin set used by the layout reset.
Use `State.init({ pinnedColumnIds: [...] })` for the initial pin set.

## Column sizing

### Initial widths

Width precedence is:

1. a matching entry in `model.columnWidths`;
2. `column.defaultSize`;
3. `column.size`;
4. a content-aware estimate from the header text and configured controls;
5. at least `column.minSize`, or 120 px when no minimum exists.

The content-aware estimate reserves space for sorting, help, filtering, the
resize control, padding, and the complete header label. This prevents a width
from looking valid for body content while clipping its header controls.

### Drag lifecycle

1. Pointer down emits `StartedColumnResize` with the column, pointer X, and
   current width.
2. Pointer movement emits `DraggedColumnResize` and updates the visible width.
3. Pointer up emits `EndedColumnResize` and commits the layout interaction.

Drag widths are clamped to 60–960 px. The modified/reset rail is evaluated
against committed widths: resizing the first changed column does not make the
rail flash during the drag, and beginning another resize does not incorrectly
hide an already-valid reset rail.

Persistence should occur after `EndedColumnResize`, not after every pointer
move. This avoids excessive storage writes and prevents partially dragged
layouts from becoming the saved state.

When `stretchColumns` is enabled, only the last visible column absorbs spare
horizontal space. If the explicit columns are narrower than the viewport, the
grid and row group still have `min-width: 100%`, so row borders continue to the
right edge instead of stopping after the last narrow column.

## Pinned-column layering contract

Pinned columns are more than `position: sticky`; their surfaces and layer order
must hide every scrolling element underneath them.

The current StyleX layers are:

| Layer | z-index | Purpose |
| --- | ---: | --- |
| Pinned body cells | 10 | Cover horizontally scrolling body content. |
| Pinned selection/expand body prefixes | 20 | Stay above other pinned body cells. |
| Sticky header row | 20 | Keeps the header above rows. |
| Resize handles | 35 | Remain usable in ordinary headers. |
| Pinned data headers | 50 | Cover unpinned header labels, filter triggers, and resize handles. |
| Pinned selection/expand header prefixes | 55 | Cover all other header cells. |
| Open filter panels | 60 | Render as intentional overlays until dismissal or scrolling. |

Pinned header and body surfaces use opaque theme tokens. Selected and expanded
pinned cells also use opaque variants; translucent accent colors would allow
scrolling text and controls to show through.

The leading pinned prefix is translated by the grid's 1 rem inline padding and
made 1 rem wider. This fills the left gutter so scrolling rows cannot appear
between the table frame and the selection checkbox.

Do not lower pinned header layers below resize handles, remove the opaque
surfaces, or remove scroll-based overlay dismissal without rerunning the pinned
interaction checks.

## Persistence

`storageKey` is a UI capability switch, not a storage implementation. The
parent owns storage because persistence is an effect.

Persist only `layoutSnapshot(model)`, which contains:

```ts
{
  columnOrder,
  hiddenColumnIds,
  pinnedColumnIds,
  columnWidths,
  layoutVersion,
}
```

Recommended message policy:

```ts
const persistsLayout = [
  'EndedTanStackColumnResize',
  'ResizedTanStackColumn',
  'ResetTanStackColumnWidths',
  'ResetTanStackTableLayout',
  'ResetTanStackTableView',
  'ResetTanStackTable',
  'ToggledTanStackColumn',
  'MovedTanStackColumn',
  'ToggledTanStackColumnPin',
].includes(message._tag)

const next = TableState.update(model.table, message)
const value = JSON.stringify(TableState.layoutSnapshot(next))
```

On mount, parse and validate the stored value, then emit
`RestoredTableLayout`. Restore is ignored when the stored `layoutVersion` does
not match the current model version. Increment the version whenever column IDs,
defaults, or layout semantics change incompatibly.

Do not persist transient fields such as `resizingColumnId`, open panels, filter
drafts, or pointer coordinates. Filters, sorting, pagination, and selection are
also intentionally absent from `layoutSnapshot`.

## Pagination behavior

TanStack paginates the `rows` array locally. `pagination.totalCount` changes
the displayed total/page count and `pagination.hasMore` can disable Next, but
these props do not turn the component into manual server pagination.

For the current component, pass the complete client-side dataset. A parent that
passes only one server page would need a manual-pagination extension; otherwise
TanStack applies `pageIndex` to that already-sliced page and later pages can be
empty.

## Reset semantics

The reset messages intentionally have different scopes:

| Message | Reset scope |
| --- | --- |
| `ResetColumnWidths` | All explicit widths and the legacy `titleWidth`. |
| `ResetTableLayout` | Visibility, order, pinning, widths, and `titleWidth`. |
| `ResetTableView` | Sorting, page index, filters, widths, and open filter UI. It does not reset order, visibility, or pinning. |
| `ResetTable` | Returns to `init()` defaults while preserving the current layout version. Custom initialization options are not replayed. |

The left modified rail appears only for active filters or committed width
changes. Order, visibility, and pin changes are reset from the column layout
menu instead.

## Model reference

The model contains durable interaction state and transient UI state.

### Durable data/view fields

- `sorting`, `pageIndex`, `pageSize`
- `selectedRowIds`, `expandedRowIds`
- `hiddenColumnIds`, `columnOrder`, `pinnedColumnIds`
- `columnFilters`, `columnWidths`, `layoutVersion`
- `globalFilter`, `statusFilter`, `pinnedRowIds`, `grouping`, `density`, and
  `titleWidth` remain for compatibility or future/legacy controls

### Transient fields

- filter drafts, enum search, number operator, and calendar month;
- open filter, layout, active-filter, and page-size overlays;
- active resize column, starting pointer X, and starting width.

All fields are Effect schemas and the complete model is JSON-serializable.

## Message groups

| Group | Messages |
| --- | --- |
| Filtering | `ChangedColumnFilter`, `ClearedColumnFilter`, `ClearedColumnFilters`, draft/operator/date messages, apply/clear popover messages |
| Sorting and paging | `ChangedSorting`, `ChangedPage`, `ChangedPageSize`, page-size draft/commit messages |
| Selection and expansion | `ToggledRow`, `ToggledRows`, `ToggledExpanded` |
| Layout | `ToggledColumn`, `MovedColumn`, `ToggledColumnPin`, `RestoredTableLayout`, reset messages |
| Sizing | `ResizedColumn`, `StartedColumnResize`, `DraggedColumnResize`, `EndedColumnResize`, `ResetColumnWidths` |
| Overlay lifecycle | filter/layout/menu toggles and `ClosedTableOverlays` |
| Reserved/legacy | global/status filter, grouping, row pinning, density, and title-width messages |

## Accessibility behavior

- The root has `role="table"` and the caller-provided accessible name.
- Header and body grids expose row, rowgroup, columnheader, and cell roles.
- Selection controls expose checkbox semantics, labels, checked state, and mixed
  state.
- Resize targets expose `role="separator"` and an accessible label/title.
- Filter buttons expose column-specific labels and expanded state.
- Calendar navigation and days have explicit labels; unavailable future days
  are disabled.
- Loading content has `role="status"`.
- All rendered controls are native buttons, inputs, selects, or checkboxes and
  remain keyboard reachable.

## Known constraints

- This is a client-side, non-virtualized row model.
- Header clicks currently expose one active sort, although the model can contain
  more.
- Direct resize uses the global 60–960 px clamp rather than each column's
  `minSize` or a per-column maximum.
- Pinned columns should remain the leading contiguous visible columns.
- Column order/visibility feature flags, grouping, row pinning, density, facet,
  and global-filter props are not wired into the renderer yet.
- `canHide: false` does not yet prevent hiding from the layout menu.
- `aggregate` is not used because rendered grouping is not implemented.
- `storageKey` does not perform persistence by itself.
- UI copy and date formatting in the reusable component are currently German.
- CSS anchor positioning is used for filter panels and therefore depends on the
  browser's anchor-positioning support.

## Regression history and invariants

The following problems were found through repeated browser interaction and are
now explicit invariants:

| Previous failure | Current invariant |
| --- | --- |
| Resize separators extended outside the header. | Every handle is absolutely bounded by the full header height. |
| The reset rail appeared immediately during the first drag. | Modified width state is evaluated from committed values until pointer release. |
| Starting a later resize hid an existing reset rail. | Other committed width changes remain part of the modified calculation during a drag. |
| Resizing one or several columns lost neighboring widths. | Widths are stored by column ID and the grid template is rebuilt for every visible column. |
| Resized layouts were not durable. | Parents persist the layout snapshot after resize completion. |
| Narrow columns caused row borders to stop early. | Grid and row-group widths are `max-content` with `min-width: 100%`; only the final column stretches. |
| Scrolling content showed through the pinned selection gutter. | Pinned prefix cells fill the left padding and use opaque selected/expanded surfaces. |
| Unpinned resize handles and filters appeared above pinned headers. | Pinned headers sit above normal controls, and scrolling closes open overlays. |

## Verification checklist

For changes to sizing, filters, pinning, or layout state, verify all of these:

1. Resize one column, release, and confirm the reset rail appears only after
   release.
2. Resize the same column again and then a second column; the rail must remain.
3. Reload and confirm the parent-restored widths, order, visibility, and pins.
4. Reset widths and confirm every header and cell still align.
5. Minimize all columns and confirm row separators reach the right frame edge.
6. Pin multiple columns, select a row, and scroll horizontally; no text,
   checkbox, filter icon, or resize handle may show through.
7. Open an unpinned filter and scroll it beneath a pinned column; the filter must
   close.
8. Check text, enum, numeric-between, preset-date, and custom-date filters.
9. Verify select-all with and without `allSelectableRowIds`.
10. Verify empty, loading, expanded-row, one-page, and multi-page states.
11. Run:

```powershell
node --test --import tsx --import ./test/setup.ts test/tanstack-table.test.ts
npx eslint src/stylex/tanstack/data-table.ts src/stylex/tanstack/data-table.stylex.ts test/tanstack-table.test.ts
npm run typecheck
npm run build
```

For the pinned-column interaction, use Playwright against
`http://127.0.0.1:5173/blocks-stylex/table` and test real horizontal scrolling,
not only static screenshots.

