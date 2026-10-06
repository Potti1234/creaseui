import assert from 'node:assert/strict'
import test from 'node:test'

import * as Sheet from '../src/lib/sheet.ts'

test('computeDetentOffsets sorts, dedupes, and always starts at 0', () => {
  const offsets = Sheet.computeDetentOffsets(800, [400, 96])
  assert.deepEqual(offsets, [0, 400, 704])

  const deduped = Sheet.computeDetentOffsets(800, [790])
  assert.deepEqual(deduped, [0])

  assert.deepEqual(Sheet.computeDetentOffsets(800, []), [0])
})

test('nearestOffset picks the closest resting stop', () => {
  const detents = [0, 400, 704]
  assert.equal(Sheet.nearestOffset(30, detents), 0)
  assert.equal(Sheet.nearestOffset(380, detents), 400)
  assert.equal(Sheet.nearestOffset(600, detents), 704)
})

test('peekOffsetFor only exposes a sliver-height stop as the peek', () => {
  const sheetHeight = 800
  const withPeek = Sheet.computeDetentOffsets(sheetHeight, [96])
  assert.equal(Sheet.peekOffsetFor(withPeek, sheetHeight), 704)

  const midStop = Sheet.computeDetentOffsets(sheetHeight, [400])
  assert.equal(Sheet.peekOffsetFor(midStop, sheetHeight), null)

  assert.equal(Sheet.peekOffsetFor([0], sheetHeight), null)
})

test('scrimOpacityForOffset stays full through working stops and thins onto the peek', () => {
  const sheetHeight = 800
  const detents = Sheet.computeDetentOffsets(sheetHeight, [400, 96])
  const peek = Sheet.peekOffsetFor(detents, sheetHeight)

  assert.equal(Sheet.scrimOpacityForOffset(0, detents, 1000, peek), 1)
  assert.equal(Sheet.scrimOpacityForOffset(400, detents, 1000, peek), 1)

  const mid = Sheet.scrimOpacityForOffset((400 + 704) / 2, detents, 1000, peek)
  assert.ok(mid < 1)
  assert.ok(mid > Sheet.MIN_PEEK_SCRIM_OPACITY)

  const atPeek = Sheet.scrimOpacityForOffset(704, detents, 1000, peek)
  assert.equal(atPeek, Sheet.MIN_PEEK_SCRIM_OPACITY)
})

test('settle picks the nearest stop in the drag direction', () => {
  const detents = [0, 400, 704]
  assert.equal(Sheet.resolveSettleOffset(500, detents, 1, 0), 400)
  assert.equal(Sheet.resolveSettleOffset(300, detents, -1, 700), 400)
  assert.equal(Sheet.resolveSettleOffset(300, detents, 0, 0), 400)
})

test('magnetize pulls within range and leaves far values alone', () => {
  const detents = [0, 400]
  const near = Sheet.magnetize(380, detents)
  assert.ok(near > 380)
  assert.ok(near < 400)
  assert.equal(Sheet.magnetize(200, detents), 200)
  assert.equal(Sheet.magnetize(400, detents), 400)
})

test('openSheet marks the requested sheet active and keeps the previous', () => {
  const switcher = Sheet.initSwitcher({
    id: 'sw',
    sheets: [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ],
  })
  const first = Sheet.openSheet(switcher, 'one').model
  assert.equal(
    first.activeSheetId._tag === 'Some' && first.activeSheetId.value,
    'one',
  )

  const second = Sheet.openSheet(first, 'two').model
  assert.equal(
    second.activeSheetId._tag === 'Some' && second.activeSheetId.value,
    'two',
  )
  assert.equal(
    second.previousSheetId._tag === 'Some' && second.previousSheetId.value,
    'one',
  )
})

test('a required sheet refuses dismiss', () => {
  const required = Sheet.init({ id: 'sheet', purpose: 'required' })
  const openResult = Sheet.open(required).model
  const dismissed = Sheet.close(openResult).model
  assert.equal(dismissed.dialog.isOpen, openResult.dialog.isOpen)
})
