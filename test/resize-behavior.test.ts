import assert from 'node:assert/strict'
import { test } from 'node:test'

import { resizeBox } from '@/lib/behaviors/resize'
import * as SplitPane from '@/lib/resizable'

test('west and north resizing preserve the opposite edges', () => {
  const box = { x: 20, y: 20, width: 60, height: 30 }
  assert.deepEqual(resizeBox(box, 'nw', -5, -10), {
    x: 15,
    y: 10,
    width: 65,
    height: 40,
  })
})

test('aspect-locked resizing centers the inactive axis and fits the boundary', () => {
  const box = { x: 10, y: 20, width: 40, height: 20 }
  assert.deepEqual(
    resizeBox(box, 'e', 80, 0, {
      aspect: 2,
      bounds: { left: 0, top: 0, right: 80, bottom: 60 },
    }),
    { x: 10, y: 12.5, width: 70, height: 35 },
  )
})

test('split pane resizing keeps its percentage limits', () => {
  const started = SplitPane.update(
    SplitPane.init('panes'),
    SplitPane.Message.StartedResize({ position: 100 }),
  )
  const dragged = SplitPane.update(
    started,
    SplitPane.Message.DraggedResize({ position: 400, extent: 200 }),
  )
  assert.equal(dragged.firstSize, 90)
  assert.equal(
    SplitPane.update(dragged, SplitPane.Message.NudgedResize({ delta: -100 }))
      .firstSize,
    10,
  )
})

test('group resizing keeps the adjacent panes within their limits', () => {
  const model = SplitPane.initGroup('panes', 3, [30, 40, 30])
  const resized = SplitPane.updateGroup(
    model,
    SplitPane.GroupMessage.NudgedGroupResize({
      handle: 0,
      delta: 90,
      minSize: 10,
    }),
  )
  assert.deepEqual(resized.sizes, [60, 10, 30])
})
