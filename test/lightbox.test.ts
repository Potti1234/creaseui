import assert from 'node:assert/strict'
import test from 'node:test'

import * as Viewport from '../src/lib/behaviors/viewport.ts'
import * as Lightbox from '../src/lib/lightbox.ts'

const step = (model: Lightbox.Model, ...messages: Lightbox.Message[]) =>
  messages.reduce(
    (next, message) => Lightbox.update(next, message).model,
    model,
  )
const viewport = (message: Viewport.Message) =>
  Lightbox.Message.GotViewportMessage({ message })
const frame = (width: number, height: number) =>
  viewport(
    Viewport.Message.MeasuredFrame({
      frame: { left: 0, top: 0, width, height },
    }),
  )
const media = (left: number, top: number, right: number, bottom: number) =>
  Lightbox.Message.MeasuredMedia({ rect: { left, top, right, bottom } })
const press = (x: number, y: number) =>
  viewport(Viewport.Message.PressedSurface({ pointerId: 1, at: { x, y } }))
const move = (x: number, y: number) =>
  viewport(Viewport.Message.MovedPointer({ pointerId: 1, at: { x, y } }))
const release = viewport(Viewport.Message.ReleasedPointer({ pointerId: 1 }))
const pan = (model: Lightbox.Model) => {
  const { x, y } = model.viewport.viewport
  return { x, y }
}

const make = (mediaCount = 4) =>
  step(
    Lightbox.init({ id: 'lb', mediaCount }),
    frame(800, 600),
    media(0, 0, 800, 600),
  )
const zoomedIn = () => step(make(), Lightbox.Message.ZoomedIn())

test('gallery navigation clamps at bounds and resets zoom', () => {
  const zoomed = step(make(), Lightbox.Message.ToggledZoom())
  assert.equal(Lightbox.zoom(zoomed), Lightbox.ZOOMED_SCALE)

  const next = step(zoomed, Lightbox.Message.NavigatedNext())
  assert.equal(next.index, 1)
  assert.equal(Lightbox.zoom(next), 1)

  const first = Lightbox.init({ id: 'lb', mediaCount: 4 })
  assert.equal(step(first, Lightbox.Message.NavigatedPrevious()).index, 0)
  const atEnd = { ...first, index: 3 }
  assert.equal(step(atEnd, Lightbox.Message.NavigatedNext()).index, 3)
})

test('WentToIndex clamps to the media range', () => {
  assert.equal(
    step(make(), Lightbox.Message.WentToIndex({ index: -2 })).index,
    0,
  )
  assert.equal(
    step(make(), Lightbox.Message.WentToIndex({ index: 99 })).index,
    3,
  )
})

test('zooming in scales about the frame center and toggling back restores it', () => {
  const zoomed = zoomedIn()
  assert.deepEqual(zoomed.viewport.viewport, { x: -400, y: -300, zoom: 2 })
  assert.equal(Lightbox.isZoomed(zoomed), true)
  const toggled = step(zoomed, Lightbox.Message.ToggledZoom())
  assert.deepEqual(toggled.viewport.viewport, Viewport.identity)
})

test('drags pan only while zoomed and end on release', () => {
  const idle = step(make(), press(10, 10))
  assert.equal(Lightbox.isPanning(idle), false)

  const dragged = step(zoomedIn(), press(100, 100), move(130, 90))
  assert.equal(Lightbox.isPanning(dragged), true)
  assert.deepEqual(pan(dragged), { x: -370, y: -310 })

  const ended = step(dragged, release)
  assert.equal(Lightbox.isPanning(ended), false)
  assert.deepEqual(pan(ended), { x: -370, y: -310 })
})

test('zoom out and open restore the resting viewport', () => {
  const panned = step(
    zoomedIn(),
    Lightbox.Message.PannedBy({ dx: 40, dy: -20 }),
  )
  assert.deepEqual(pan(panned), { x: -360, y: -320 })
  const out = step(panned, Lightbox.Message.ZoomedOut())
  assert.deepEqual(out.viewport.viewport, Viewport.identity)

  const opened = Lightbox.open({ ...panned, index: 2 }, 0).model
  assert.equal(opened.index, 0)
  assert.deepEqual(opened.viewport.viewport, Viewport.identity)
})

test('pointer and keyboard panning stop at the scaled image edges', () => {
  const keyboard = step(
    zoomedIn(),
    Lightbox.Message.PannedBy({ dx: 10000, dy: -10000 }),
  )
  assert.deepEqual(pan(keyboard), { x: 0, y: -600 })

  const dragged = step(zoomedIn(), press(0, 0), move(-10000, 10000))
  assert.deepEqual(pan(dragged), { x: -800, y: 0 })

  // Reversing immediately moves away from the edge, even after overshooting.
  const reversed = step(dragged, move(-9980, 9980))
  assert.deepEqual(pan(reversed), { x: -780, y: -20 })
})

test('new media dimensions reclamp offsets and leave fitting axes centered', () => {
  const atEdge = step(
    zoomedIn(),
    Lightbox.Message.PannedBy({ dx: 10000, dy: -10000 }),
    press(0, 0),
  )
  // A 200×100 image letterboxed in a 200×300 frame.
  const resized = step(atEdge, frame(200, 300), media(0, 100, 200, 200))
  assert.deepEqual(pan(resized), { x: 0, y: -150 })
  const moved = step(resized, move(-20, 20))
  assert.deepEqual(pan(moved), { x: -20, y: -150 })
})

test('panning waits for the image dimensions and stops after release', () => {
  const unmeasured = step(
    Lightbox.init({ id: 'lb' }),
    frame(800, 600),
    Lightbox.Message.ZoomedIn(),
  )
  const before = pan(unmeasured)
  const keyboard = step(
    unmeasured,
    Lightbox.Message.PannedBy({ dx: 100, dy: 100 }),
  )
  assert.deepEqual(pan(keyboard), before)
  assert.deepEqual(pan(step(unmeasured, press(0, 0), move(100, 100))), before)

  const released = step(zoomedIn(), press(0, 0), release, move(100, 100))
  assert.deepEqual(pan(released), { x: -400, y: -300 })
})

test('the image scales about the frame corner it is laid out from', () => {
  const style = Lightbox.mediaStyle(step(zoomedIn(), media(0, 100, 800, 500)))
  assert.equal(style['transformOrigin'], '0px -100px')
  assert.equal(style['transform'], 'translate(-400px, -300px) scale(2)')
})
