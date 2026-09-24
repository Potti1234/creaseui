import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import * as VirtualTable from '@/lib/virtual-data-table-state'

describe('VirtualList data table', () => {
  it('keeps filtering, sorting, and selection in a serializable Foldkit model', () => {
    const initial = VirtualTable.init('tasks')
    const op1__ = VirtualTable.update(initial, VirtualTable.Message.VirtualDataTableFiltered({ value: 'platform' })); const filtered = op1__.model;
    const op2__ = VirtualTable.update(filtered, VirtualTable.Message.VirtualDataTableSorted({ key: 'status' })); const sortedOnce = op2__.model;
    const op3__ = VirtualTable.update(sortedOnce, VirtualTable.Message.VirtualDataTableSorted({ key: 'status' })); const sortedTwice = op3__.model;
    const op4__ = VirtualTable.update(sortedTwice, VirtualTable.Message.VirtualDataTableToggledRow({ key: 'TSK-101', isSelected: true })); const selected = op4__.model;

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

