import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import * as DataTable from '@/lib/data-table-state'

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
})

