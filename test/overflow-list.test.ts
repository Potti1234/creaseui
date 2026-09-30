import assert from 'node:assert/strict'
import test from 'node:test'

import * as OverflowList from '../src/lib/overflow-list.ts'

test('init is optimistic: every item visible until the first measurement', () => {
  const model = OverflowList.init({ itemCount: 5 })
  assert.equal(model.visibleCount, 5)
  assert.equal(model.collapseFrom, 'end')
  assert.deepEqual(model.hiddenIndices, [])
})

test('computeOverflow fits single-row items and reserves room for the indicator', () => {
  // 100px available, 4 x 30px items, 10px gaps, 40px indicator
  const result = OverflowList.computeOverflow({
    widths: [30, 30, 30, 30],
    gap: 10,
    availableWidth: 100,
    indicatorWidth: 40,
    minVisibleItems: 0,
    collapseFrom: 'end',
  })
  // items at index 0+1 fit (30+10+30=70) plus indicator (70+10+40=120 > 100),
  // so only 1 item + indicator fits
  assert.equal(result.visibleCount, 1)
  assert.equal(result.rows, 1)
})

test('computeOverflow honors maxVisibleItems and collapseFrom=start', () => {
  const capped = OverflowList.computeOverflow({
    widths: [10, 10, 10],
    gap: 0,
    availableWidth: 1000,
    indicatorWidth: 20,
    minVisibleItems: 0,
    maxVisibleItems: 2,
    collapseFrom: 'start',
  })
  assert.equal(capped.visibleCount, 2)
  assert.deepEqual(OverflowList.collapsedIndices(3, 2, 'start'), [0])
  assert.deepEqual(OverflowList.collapsedIndices(3, 2, 'end'), [2])
})

test('update emits OverflowChanged only when the collapsed set changes', () => {
  const model = OverflowList.init({ itemCount: 4, collapseFrom: 'end' })
  const first__ = OverflowList.update(
    model,
    OverflowList.Message.Measured({ visibleCount: 2, rows: 1, rowHeight: 32 }),
  )
  assert.deepEqual(first__.model.hiddenIndices, [2, 3])
  assert.equal(first__.outMessage?._tag, 'OverflowChanged')

  const repeat__ = OverflowList.update(
    first__.model,
    OverflowList.Message.Measured({ visibleCount: 2, rows: 1, rowHeight: 33 }),
  )
  assert.equal(repeat__.outMessage, undefined)

  const grown__ = OverflowList.update(
    first__.model,
    OverflowList.Message.Measured({ visibleCount: 4, rows: 1, rowHeight: 32 }),
  )
  assert.deepEqual(grown__.model.hiddenIndices, [])
  assert.equal(grown__.outMessage?._tag, 'OverflowChanged')
})

test('spacing steps map to astryx pixel values', () => {
  assert.equal(OverflowList.spacingToPx[0], 0)
  assert.equal(OverflowList.spacingToPx[2], 8)
  assert.equal(OverflowList.spacingToPx[10], 40)
})
