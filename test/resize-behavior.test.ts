import assert from 'node:assert/strict'
import { test } from 'node:test'

import { resizeBox } from '@/lib/behaviors/resize'
import * as Resize from '@/lib/behaviors/resize'
import * as BoxResizer from '@/lib/box-resizer'
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

test('box resize drafts stay relative to committed geometry and cancel cleanly', () => {
  const box = { x: 10, y: 20, width: 40, height: 20 }
  const initial = Resize.init(box)
  const active = Resize.update(
    initial,
    Resize.Message.StartedBoxResize({ handle: 'e' }),
  )
  const preview = Resize.update(
    active,
    Resize.Message.DraggedBoxResize({ dx: 30, dy: 0, lockAspect: false }),
  )
  const corrected = Resize.update(
    preview,
    Resize.Message.DraggedBoxResize({ dx: 12, dy: 0, lockAspect: true }),
  )
  assert.equal(corrected.box, box)
  assert.deepEqual(corrected.draft?.box, {
    x: 10,
    y: 17,
    width: 52,
    height: 26,
  })
  assert.deepEqual(
    Resize.update(
      corrected,
      Resize.Message.FinishedBoxResize({ cancelled: true }),
    ),
    initial,
  )
  const committed = Resize.update(
    corrected,
    Resize.Message.FinishedBoxResize({ cancelled: false }),
  )
  assert.equal(committed.draft, null)
  assert.equal(
    Resize.resizeMessage(committed.box, 'Image'),
    'Image 52 by 26 at 10, 17',
  )
})

test('box resizer exports the shared model and message constructors', () => {
  assert.equal(BoxResizer.BoxResizeModel, Resize.Model)
  assert.equal(BoxResizer.BoxResizeMessage, Resize.Message)
  assert.equal(BoxResizer.initBoxResize, Resize.init)
  assert.equal(BoxResizer.updateBoxResize, Resize.update)
})
