import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import * as TableState from '@/lib/tanstack-table-state'

describe('TanStack Table Foldkit adapter', () => {
  it('keeps controlled feature state serializable and deterministic', () => {
    const initial = TableState.init()
    const filtered = TableState.update(initial, TableState.ChangedGlobalFilter({ value: 'audit' }))
    const selected = TableState.update(filtered, TableState.ToggledRow({ rowId: 'TSK-101', isSelected: true }))
    const grouped = TableState.update(selected, TableState.ToggledGrouping({ columnId: 'team' }))

    assert.equal(filtered.pageIndex, 0)
    assert.deepEqual(selected.selectedRowIds, ['TSK-101'])
    assert.deepEqual(grouped.grouping, ['team'])
    assert.doesNotThrow(() => JSON.stringify(grouped))
  })

  it('cycles additive sorting through ascending, descending, and removed', () => {
    const ascending = TableState.nextSorting([], 'status')
    const descending = TableState.nextSorting(ascending, 'status')
    const removed = TableState.nextSorting(descending, 'status')

    assert.deepEqual(ascending, [{ id: 'status', desc: false }])
    assert.deepEqual(descending, [{ id: 'status', desc: true }])
    assert.deepEqual(removed, [])
  })

  it('controls typed column filters and restorable column layouts', () => {
    const initial = TableState.init({ layoutVersion: 3 })
    const filtered = TableState.update(initial, TableState.ChangedColumnFilter({
      filter: TableState.columnFilter('points', 'number', { operator: 'between', value: '2', secondaryValue: '8' }),
    }))
    const resized = TableState.update(filtered, TableState.ResizedColumn({ columnId: 'points', width: 180 }))
    const pinned = TableState.update(resized, TableState.ToggledColumnPin({ columnId: 'points' }))
    const restored = TableState.update(initial, TableState.RestoredTableLayout({ ...TableState.layoutSnapshot(pinned) }))

    assert.equal(filtered.columnFilters[0]?.operator, 'between')
    assert.equal(resized.columnWidths[0]?.width, 180)
    assert.equal(pinned.columnOrder[1], 'points')
    assert.deepEqual(TableState.layoutSnapshot(restored), TableState.layoutSnapshot(pinned))
  })

  it('models popovers, calendar drafts, and direct column resizing', () => {
    const initial = TableState.init()
    const opened = TableState.update(initial, TableState.ToggledFilterPopover({ columnId: 'due', draft: '', secondaryDraft: '', operator: 'eq' }))
    const custom = TableState.update(opened, TableState.ChangedDateCustomOpen({ isOpen: true }))
    const previousMonth = TableState.update(custom, TableState.ShiftedCalendarMonth({ delta: -1 }))
    const ranged = TableState.update(previousMonth, TableState.ChangedDateRangeDraft({ from: '2026-09-01T00:00', to: '2026-09-02T23:59' }))
    const resizing = TableState.update(ranged, TableState.StartedColumnResize({ columnId: 'title', screenX: 200, width: 280 }))
    const resized = TableState.update(resizing, TableState.DraggedColumnResize({ screenX: 260 }))

    assert.equal(opened.openFilterColumnId, 'due')
    assert.equal(custom.dateCustomOpen, true)
    assert.equal(previousMonth.calendarMonthOffset, -1)
    assert.equal(ranged.filterSecondaryDraft, '2026-09-02T23:59')
    assert.equal(resized.columnWidths[0]?.width, 340)
  })

  it('uses vanilla table-core without a framework adapter', () => {
    const source = readFileSync('src/stylex/tanstack/data-table.ts', 'utf8')
    assert.match(source, /from '@tanstack\/table-core'/u)
    assert.doesNotMatch(source, /@tanstack\/(react|vue|solid|svelte)-table/u)
    assert.match(source, /getFilteredRowModel/u)
    assert.match(source, /getPaginationRowModel/u)
    assert.match(source, /matchesColumnFilter/u)
    assert.match(source, /enableExpandableRows/u)
    assert.match(source, /ResetTableLayout/u)
    assert.match(source, /calendarMonth/u)
    assert.match(source, /StartedColumnResize/u)
  })

  it('keeps the reusable recipe constrained and migrates both consumers', () => {
    const recipe = readFileSync('src/stylex/tanstack/data-table.ts', 'utf8')
    const showcase = readFileSync('src/demo/blocks-stylex/tanstack-table-page.ts', 'utf8')
    const dashboard = readFileSync('src/demo/blocks-stylex/featured-page.ts', 'utf8')

    assert.doesNotMatch(recipe, /className\??\s*:/u)
    assert.doesNotMatch(recipe, /style\??\s*:/u)
    assert.match(showcase, /tanStackDataTable\(props, h\)/u)
    assert.match(dashboard, /tanStackDataTable<DashboardRow, Message>/u)
    assert.doesNotMatch(dashboard, /@\/stylex\/data-table/u)
  })

  it('commits persisted widths only when pointer resizing ends and keeps committed reset state visible', () => {
    const recipe = readFileSync('src/stylex/tanstack/data-table.ts', 'utf8')
    const playground = readFileSync('src/demo/blocks-stylex/tanstack-table-page.ts', 'utf8')

    assert.match(recipe, /hasCommittedWidthChanges/u)
    assert.match(recipe, /entry\.columnId !== props\.model\.resizingColumnId/u)
    assert.match(recipe, /widthDiffersFromDefault\(props\.model\.resizingColumnId, props\.model\.resizeStartWidth\)/u)
    assert.match(recipe, /index === visible\.length - 1 \? `minmax/u)
    assert.match(playground, /FEATURE_STORAGE_KEY = 'playground-features'/u)
    assert.match(playground, /'EndedTanStackColumnResize'/u)
    assert.doesNotMatch(playground, /message\.table === 'features' \? \[PersistFeatureLayout/u)
  })

  it('keeps row separators spanning the scroller when columns are narrower than the viewport', () => {
    const styles = readFileSync('src/stylex/tanstack/data-table.stylex.ts', 'utf8')

    assert.match(styles, /grid: \{[^}]*minWidth: '100%'[^}]*width: 'max-content'/su)
    assert.match(styles, /rows: \{[^}]*minWidth: '100%'[^}]*width: 'max-content'/su)
    assert.doesNotMatch(styles, /row: \{[^}]*width: 'fit-content'/su)
  })

  it('keeps pinned selection gutters opaque and above horizontally scrolling cells', () => {
    const recipe = readFileSync('src/stylex/tanstack/data-table.ts', 'utf8')
    const styles = readFileSync('src/stylex/tanstack/data-table.stylex.ts', 'utf8')
    const tokens = readFileSync('src/stylex/complex-tokens.stylex.ts', 'utf8')

    assert.match(tokens, /opaqueMutedSurface/u)
    assert.match(tokens, /opaqueAccentSurface/u)
    assert.match(styles, /stickyHeader: \{[^}]*zIndex: 50/u)
    assert.match(styles, /stickyPrefixHeader: \{ zIndex: 55 \}/u)
    assert.match(styles, /stickyPrefixBody: \{ zIndex: 20 \}/u)
    assert.match(styles, /filterControl: \{[^}]*zIndex: 0/u)
    assert.match(styles, /resizeHandle: \{.*?zIndex: 35/su)
    assert.match(styles, /stickyLeading: \{[^}]*transform: 'translateX\(-1rem\)'/su)
    assert.match(recipe, /styles\.stickyPrefixHeader/u)
    assert.match(recipe, /styles\.stickyPrefixBody/u)
    assert.match(recipe, /type: 'scroll'[^}]*ClosedTableOverlays\(\)/su)
  })
})

