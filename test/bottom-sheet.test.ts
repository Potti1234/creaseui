import assert from 'node:assert/strict'
import test from 'node:test'

import * as BottomSheet from '../src/lib/bottom-sheet.ts'

test('computeDetentOffsets sorts, dedupes, and always starts at 0', () => {
  const offsets = BottomSheet.computeDetentOffsets(800, [400, 96])
  assert.deepEqual(offsets, [0, 400, 704])

  const deduped = BottomSheet.computeDetentOffsets(800, [790])
  assert.deepEqual(deduped, [0])

  assert.deepEqual(BottomSheet.computeDetentOffsets(800, []), [0])
})

test('nearestOffset picks the closest resting stop', () => {
  const detents = [0, 400, 704]
  assert.equal(BottomSheet.nearestOffset(30, detents), 0)
  assert.equal(BottomSheet.nearestOffset(380, detents), 400)
  assert.equal(BottomSheet.nearestOffset(600, detents), 704)
})

test('peekOffsetFor only exposes a sliver-height stop as the peek', () => {
  const sheetHeight = 800
  const withPeek = BottomSheet.computeDetentOffsets(sheetHeight, [96])
  assert.equal(BottomSheet.peekOffsetFor(withPeek, sheetHeight), 704)

  const midStop = BottomSheet.computeDetentOffsets(sheetHeight, [400])
  assert.equal(BottomSheet.peekOffsetFor(midStop, sheetHeight), null)

  assert.equal(BottomSheet.peekOffsetFor([0], sheetHeight), null)
})

test('scrimOpacityForOffset stays full through working stops and thins onto the peek', () => {
  const sheetHeight = 800
  const detents = BottomSheet.computeDetentOffsets(sheetHeight, [400, 96])
  const peek = BottomSheet.peekOffsetFor(detents, sheetHeight)

  assert.equal(BottomSheet.scrimOpacityForOffset(0, detents, 1000, peek), 1)
  assert.equal(BottomSheet.scrimOpacityForOffset(400, detents, 1000, peek), 1)

  const mid = BottomSheet.scrimOpacityForOffset((400 + 704) / 2, detents, 1000, peek)
  assert.ok(mid < 1)
  assert.ok(mid > BottomSheet.MIN_PEEK_SCRIM_OPACITY)

  const atPeek = BottomSheet.scrimOpacityForOffset(704, detents, 1000, peek)
  assert.equal(atPeek, BottomSheet.MIN_PEEK_SCRIM_OPACITY)
})

test('settle picks the nearest stop in the drag direction', () => {
  const detents = [0, 400, 704]
  assert.equal(BottomSheet.resolveSettleOffset(500, detents, 1, 0), 400)
  assert.equal(BottomSheet.resolveSettleOffset(300, detents, -1, 700), 400)
  assert.equal(BottomSheet.resolveSettleOffset(300, detents, 0, 0), 400)
})

test('magnetize pulls within range and leaves far values alone', () => {
  const detents = [0, 400]
  const near = BottomSheet.magnetize(380, detents)
  assert.ok(near > 380)
  assert.ok(near < 400)
  assert.equal(BottomSheet.magnetize(200, detents), 200)
  assert.equal(BottomSheet.magnetize(400, detents), 400)
})

test('openSheet marks the requested sheet active and keeps the previous', () => {
  const switcher = BottomSheet.initSwitcher({
    id: 'sw',
    sheets: [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ],
  })
  const first = BottomSheet.openSheet(switcher, 'one').model
  assert.equal(first.activeSheetId._tag === 'Some' && first.activeSheetId.value, 'one')

  const second = BottomSheet.openSheet(first, 'two').model
  assert.equal(second.activeSheetId._tag === 'Some' && second.activeSheetId.value, 'two')
  assert.equal(second.previousSheetId._tag === 'Some' && second.previousSheetId.value, 'one')
})

test('a required sheet refuses dismiss', () => {
  const required = BottomSheet.init({ id: 'sheet', purpose: 'required' })
  const openResult = BottomSheet.open(required).model
  const dismissed = BottomSheet.close(openResult).model
  assert.equal(dismissed.dialog.isOpen, openResult.dialog.isOpen)
})
