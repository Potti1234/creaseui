import assert from 'node:assert/strict'
import { it } from 'node:test'

import * as Range from '../src/lib/behaviors/cell-range.ts'

it('retains the anchor and reports just the changed cells of an overlapping range', () => {
  const initial = Range.start({ row: 1, column: 1 })
  const earlier = Range.extend(initial, { row: 3, column: 3 })
  const previous = Range.bounds(earlier.anchor, earlier.end)
  const current = Range.bounds({ row: 2, column: 2 }, { row: 4, column: 4 })
  const { entered, left } = Range.byCellRange(previous, current)
  assert.deepEqual(entered, [
    { top: 4, bottom: 4, left: 2, right: 4 },
    { top: 2, bottom: 3, left: 4, right: 4 },
  ])
  assert.deepEqual(left, [
    { top: 1, bottom: 1, left: 1, right: 3 },
    { top: 2, bottom: 3, left: 1, right: 1 },
  ])
  assert.equal(
    Range.cellRangeMessage(current),
    '9 cells selected across 3 rows and 3 columns.',
  )
})

it('reports no changes for identical or absent ranges', () => {
  const cell = { row: 0, column: 0 }
  const range = Range.bounds(cell, cell)
  assert.deepEqual(Range.byCellRange(range, range), { entered: [], left: [] })
  assert.deepEqual(Range.byCellRange(undefined, range), {
    entered: [range],
    left: [],
  })
  assert.equal(Range.bounds(cell, { row: Infinity, column: 0 }), undefined)
})
