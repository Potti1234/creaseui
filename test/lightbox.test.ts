import assert from 'node:assert/strict'
import test from 'node:test'

import { Option } from 'effect'

import * as Lightbox from '../src/lib/lightbox.ts'

const make = (mediaCount = 4) => Lightbox.init({ id: 'lb', mediaCount })

test('gallery navigation clamps at bounds and resets zoom', () => {
  const model = make()
  const zoomed = Lightbox.update(model, Lightbox.Message.ToggledZoom()).model
  assert.equal(zoomed.zoom, Lightbox.ZOOMED_SCALE)

  const next = Lightbox.update(zoomed, Lightbox.Message.NavigatedNext()).model
  assert.equal(next.index, 1)
  assert.equal(next.zoom, 1)

  const first = Lightbox.init({ id: 'lb', mediaCount: 4 })
  const prev = Lightbox.update(
    first,
    Lightbox.Message.NavigatedPrevious(),
  ).model
  assert.equal(prev.index, 0)

  const atEnd = { ...first, index: 3 }
  const past = Lightbox.update(atEnd, Lightbox.Message.NavigatedNext()).model
  assert.equal(past.index, 3)
})

test('WentToIndex clamps to the media range', () => {
  const model = make()
  const low = Lightbox.update(
    model,
    Lightbox.Message.WentToIndex({ index: -2 }),
  ).model
  assert.equal(low.index, 0)
  const high = Lightbox.update(
    model,
    Lightbox.Message.WentToIndex({ index: 99 }),
  ).model
  assert.equal(high.index, 3)
})

test('pan anchors translate deltas while unzoomed pans no-op', () => {
  const model = make()
  const idle = Lightbox.update(
    model,
    Lightbox.Message.StartedPan({ x: 10, y: 10 }),
  ).model
  assert.equal(idle.panAnchor._tag, 'None')

  const zoomed = { ...model, zoom: Lightbox.ZOOMED_SCALE }
  const started = Lightbox.update(
    zoomed,
    Lightbox.Message.StartedPan({ x: 100, y: 100 }),
  ).model
  const moved = Lightbox.update(
    started,
    Lightbox.Message.MovedPan({ x: 130, y: 90 }),
  ).model
  assert.equal(moved.panX, 30)
  assert.equal(moved.panY, -10)

  const ended = Lightbox.update(moved, Lightbox.Message.EndedPan()).model
  assert.equal(Option.isNone(ended.panAnchor), true)
  assert.equal(ended.panX, 30)
})

test('zoom out restores pan to zero', () => {
  const model = { ...make(), zoom: Lightbox.ZOOMED_SCALE, panX: 40, panY: -20 }
  const out = Lightbox.update(model, Lightbox.Message.ZoomedOut()).model
  assert.equal(out.zoom, 1)
  assert.equal(out.panX, 0)
  assert.equal(out.panY, 0)
})

test('open at an index resets transient media state', () => {
  const model = { ...make(), index: 2, zoom: Lightbox.ZOOMED_SCALE, panX: 15 }
  const opened = Lightbox.open(model, 0).model
  assert.equal(opened.index, 0)
  assert.equal(opened.zoom, 1)
  assert.equal(opened.panX, 0)
})
