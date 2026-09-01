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

  it('uses vanilla table-core without a framework adapter', () => {
    const source = readFileSync('src/stylex/tanstack/data-table.ts', 'utf8')
    assert.match(source, /from '@tanstack\/table-core'/u)
    assert.doesNotMatch(source, /@tanstack\/(react|vue|solid|svelte)-table/u)
    assert.match(source, /getFilteredRowModel/u)
    assert.match(source, /getGroupedRowModel/u)
    assert.match(source, /getPaginationRowModel/u)
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
})
