import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import * as VirtualTable from '@/lib/virtual-data-table-state'

describe('VirtualList data table', () => {
  it('keeps filtering, sorting, and selection in a serializable Foldkit model', () => {
    const initial = VirtualTable.init('tasks')
    const [filtered] = VirtualTable.update(initial, VirtualTable.Filtered({ value: 'platform' }))
    const [sortedOnce] = VirtualTable.update(filtered, VirtualTable.Sorted({ key: 'status' }))
    const [sortedTwice] = VirtualTable.update(sortedOnce, VirtualTable.Sorted({ key: 'status' }))
    const [selected] = VirtualTable.update(sortedTwice, VirtualTable.ToggledRow({ key: 'TSK-101', isSelected: true }))

    assert.equal(filtered.filter, 'platform')
    assert.equal(sortedOnce.sortDirection, 'ascending')
    assert.equal(sortedTwice.sortDirection, 'descending')
    assert.deepEqual(selected.selectedRowKeys, ['TSK-101'])
    assert.doesNotThrow(() => JSON.stringify(selected))
  })

  it('uses Foldkit VirtualList without depending on TanStack', () => {
    const source = readFileSync('src/stylex/virtual/data-table.ts', 'utf8')
    const playground = readFileSync('src/demo/blocks-stylex/tanstack-table-page.ts', 'utf8')

    assert.match(source, /VirtualList\.view<Row>\(\)/u)
    assert.match(source, /virtual-data-table/u)
    assert.doesNotMatch(source, /@tanstack/u)
    assert.match(playground, /VirtualDataTable\.virtualDataTable/u)
    assert.match(playground, /length: 2_000/u)
  })
})

