import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import * as DataTable from '@/lib/data-table-state'
import { projectDataTable } from '@/lib/data-table-adapter'

describe('data table interaction model', () => {
  it('keeps controlled selection stable by row key', () => {
      const first = DataTable.update(
        DataTable.init(10),
        DataTable.ToggledRow({ key: 'alpha', isSelected: true }),
      )
      const selected = DataTable.update(
        first,
        DataTable.ToggledRows({ keys: ['alpha', 'beta'], isSelected: true }),
      )
      assert.deepEqual(selected.selectedRowKeys, ['alpha', 'beta'])

      const deselected = DataTable.update(
        selected,
        DataTable.ToggledRows({ keys: ['alpha'], isSelected: false }),
      )
      assert.deepEqual(deselected.selectedRowKeys, ['beta'])
      assert.deepEqual(
        DataTable.update(deselected, DataTable.ClearedSelection()).selectedRowKeys,
        [],
      )
  })

  it('controls column visibility without losing other state', () => {
      const model = DataTable.update(
        DataTable.init(10),
        DataTable.ToggledColumn({ key: 'reviewer', isVisible: false }),
      )
      assert.deepEqual(model.hiddenColumnKeys, ['reviewer'])
      assert.deepEqual(
        DataTable.update(
          model,
          DataTable.ToggledColumn({ key: 'reviewer', isVisible: true }),
        ).hiddenColumnKeys,
        [],
      )
  })

  it('resets pagination when page size or filtering changes', () => {
      const onLaterPage = DataTable.update(
        DataTable.init(10),
        DataTable.ChangedPage({ page: 4 }),
      )
      const resized = DataTable.update(
        onLaterPage,
        DataTable.ChangedPageSize({ pageSize: 25 }),
      )
      assert.equal(resized.page, 0)
      assert.equal(resized.pageSize, 25)

      const filtered = DataTable.update(
        { ...resized, page: 2 },
        DataTable.Filtered({ value: 'done' }),
      )
      assert.equal(filtered.page, 0)
      assert.equal(filtered.filter, 'done')
  })

  it('keeps Tailwind and StyleX renderers on the shared state contract', () => {
    for (const file of ['src/ui/data-table.ts', 'src/stylex/data-table.ts']) {
      assert.match(readFileSync(file, 'utf8'), /export \* from '@\/lib\/data-table-state'/u)
    }
  })

  it('projects large client collections through deterministic TanStack mechanics', () => {
    const rows = Array.from({ length: 10_000 }, (_, index) => ({ id: String(index), label: `Record ${String(index).padStart(5, '0')}` }))
    const projection = projectDataTable({
      columns: [{ key: 'label', sortValue: row => row.label }],
      filterText: row => row.label,
      model: { ...DataTable.init(25), filter: 'Record 099', sortKey: 'label', sortDirection: 'descending' },
      rowKey: row => row.id,
      rows,
    })

    assert.equal(projection.filteredRowCount, 100)
    assert.equal(projection.rows.length, 25)
    assert.equal(projection.rows[0]?.label, 'Record 09999')
  })

  it('passes server-owned pages through without applying client query policy', () => {
    const rows = [{ id: 'external-2', label: 'Externally refreshed' }]
    const projection = projectDataTable({
      columns: [{ key: 'label', sortValue: row => row.label }],
      filterText: row => row.label,
      mode: 'server',
      model: { ...DataTable.init(1), filter: 'does not match', page: 2, sortKey: 'label', sortDirection: 'descending', selectedRowKeys: ['external-2'] },
      rowCount: 8,
      rowKey: row => row.id,
      rows,
    })

    assert.deepEqual(projection.rows, rows)
    assert.equal(projection.page, 2)
    assert.equal(projection.pageCount, 8)
    assert.equal(projection.selectedRowCount, 1)
  })

  it('uses the shared framework-neutral TanStack adapter and semantic Table helpers', () => {
    const adapter = readFileSync('src/lib/data-table-adapter.ts', 'utf8')
    assert.match(adapter, /from '@tanstack\/table-core'/u)
    assert.doesNotMatch(adapter, /@tanstack\/(react|vue|solid|svelte)-table/u)
    for (const file of ['src/ui/data-table.ts', 'src/stylex/data-table.ts']) {
      const source = readFileSync(file, 'utf8')
      assert.match(source, /projectDataTable/u)
      assert.match(source, /Table\.table/u)
    }
  })
})
