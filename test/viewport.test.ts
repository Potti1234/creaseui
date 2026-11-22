import assert from 'node:assert/strict'
import test from 'node:test'

import { Option } from 'effect'

import * as Viewport from '../src/lib/behaviors/viewport.ts'

const frame = { left: 10, top: 20, width: 400, height: 300 }
const measured = (viewport: Viewport.Viewport = Viewport.identity) =>
  Viewport.update(
    Viewport.init(viewport),
    Viewport.Message.MeasuredFrame({ frame }),
  ).model
const step = (
  model: Viewport.Model,
  messages: ReadonlyArray<Viewport.Message>,
  options: Viewport.Options = {},
) =>
  messages.reduce(
    (next, message) => Viewport.update(next, message, options).model,
    model,
  )
const press = (pointerId: number, x: number, y: number) =>
  Viewport.Message.PressedSurface({ pointerId, at: { x, y } })
const move = (pointerId: number, x: number, y: number) =>
  Viewport.Message.MovedPointer({ pointerId, at: { x, y } })

test('converts between client and canvas points through the frame and viewport', () => {
  const model = measured({ x: 50, y: -30, zoom: 2 })
  const canvas = Viewport.toCanvas(model, { x: 160, y: 90 })
  assert.deepEqual(canvas, { x: 50, y: 50 })
  assert.deepEqual(Viewport.toScreen(model, canvas), { x: 160, y: 90 })
  assert.deepEqual(Viewport.visible(model), {
    left: -25,
    top: 15,
    right: 175,
    bottom: 165,
  })
  assert.deepEqual(
    Viewport.rectOf(model, { left: 160, top: 90, right: 180, bottom: 130 }),
    { left: 50, top: 50, right: 60, bottom: 70 },
  )
})

test('zoomTo keeps the canvas point under the client point still and clamps scale', () => {
  const model = measured()
  const at = Option.some({ x: 110, y: 120 })
  const zoomed = Viewport.zoomTo(model, 2, at)
  assert.deepEqual(zoomed.model.viewport, { x: -100, y: -100, zoom: 2 })
  assert.deepEqual(Viewport.toCanvas(zoomed.model, at.value), {
    x: 100,
    y: 100,
  })
  assert.equal(
    Viewport.zoomBy(model, 100, Option.none(), { maxZoom: 3 }).model.viewport
      .zoom,
    3,
  )
  assert.equal(Viewport.zoomBy(model, 0).model.viewport.zoom, 0.1)
})

test('reports each change once with its reason and skips no-op changes', () => {
  const model = measured()
  const panned = Viewport.panBy(model, { x: 5, y: 6 })
  assert.deepEqual(
    panned.outMessage,
    Viewport.OutMessage.ChangedViewport({
      viewport: { x: 5, y: 6, zoom: 1 },
      reason: 'imperative',
      announcement: Option.none(),
    }),
  )
  assert.equal(
    Viewport.setViewport(model, Viewport.identity).outMessage,
    undefined,
  )
  const vetoed = Viewport.panBy(
    model,
    { x: 5, y: 0 },
    { canCommit: () => false },
  )
  assert.equal(vetoed.model, model)
})

test('one pointer drags and two pointers pinch about their center', () => {
  const dragged = step(measured(), [press(1, 100, 100), move(1, 130, 80)])
  assert.deepEqual(dragged.viewport, { x: 30, y: -20, zoom: 1 })
  assert.equal(Viewport.isGesturing(dragged), true)

  const pinched = step(measured(), [
    press(1, 110, 120),
    press(2, 210, 120),
    move(2, 310, 120),
  ])
  assert.equal(pinched.viewport.zoom, 2)
  // The canvas point under the starting center follows the new center.
  assert.deepEqual(Viewport.toCanvas(pinched, { x: 210, y: 120 }), {
    x: 150,
    y: 100,
  })

  const released = step(pinched, [
    Viewport.Message.ReleasedPointer({ pointerId: 2 }),
    move(1, 120, 120),
  ])
  assert.equal(released.viewport.zoom, 2)
  assert.equal(released.viewport.x, pinched.viewport.x + 10)
  const idle = step(released, [
    Viewport.Message.ReleasedPointer({ pointerId: 1 }),
  ])
  assert.equal(Viewport.isGesturing(idle), false)
  assert.deepEqual(step(idle, [move(1, 500, 500)]).viewport, idle.viewport)
})

test('bounds keep a canvas box covering the frame with no dead zone at the edge', () => {
  const options = { bounds: { left: 0, top: 0, right: 400, bottom: 300 } }
  const zoomed = Viewport.zoomTo(measured(), 2, Option.none(), options).model
  const atEdge = step(zoomed, [press(1, 0, 0), move(1, 1000, 1000)], options)
  assert.deepEqual(atEdge.viewport, { x: 0, y: 0, zoom: 2 })
  const back = step(atEdge, [move(1, 990, 1000)], options)
  assert.deepEqual(back.viewport, { x: -10, y: 0, zoom: 2 })

  const small = { bounds: { left: 0, top: 0, right: 100, bottom: 100 } }
  assert.deepEqual(
    Viewport.panBy(measured(), { x: 70, y: 70 }, small).model.viewport,
    { x: 150, y: 100, zoom: 1 },
  )
})

test('wheel pans, Ctrl or ⌘ wheel zooms at the pointer', () => {
  const wheel = (zoom: boolean, deltaY: number) =>
    Viewport.Message.Wheeled({
      at: { x: 110, y: 120 },
      deltaX: 4,
      deltaY,
      zoom,
    })
  assert.deepEqual(step(measured(), [wheel(false, 10)]).viewport, {
    x: -4,
    y: -10,
    zoom: 1,
  })
  const zoomed = step(measured(), [wheel(true, -500)])
  assert.equal(zoomed.viewport.zoom, Math.exp(0.5))
  assert.deepEqual(Viewport.toCanvas(zoomed, { x: 110, y: 120 }), {
    x: 100,
    y: 100,
  })
})

test('zoom keys zoom at the center, reset to 100% and announce the scale', () => {
  const plus = Viewport.update(
    measured(),
    Viewport.Message.PressedZoomKey({ key: '+', at: Option.none() }),
  )
  assert.equal(plus.model.viewport.zoom, 1.25)
  assert.deepEqual(
    Option.map(Option.fromNullishOr(plus.outMessage), out => out.announcement),
    Option.some(Option.some('Zoom 125%')),
  )
  const reset = Viewport.update(
    plus.model,
    Viewport.Message.PressedZoomKey({ key: '0', at: Option.none() }),
    { message: zoom => `Scale ${String(zoom)}` },
  )
  assert.deepEqual(reset.model.viewport, Viewport.identity)
  assert.equal(
    reset.outMessage?.announcement._tag === 'Some' &&
      reset.outMessage.announcement.value,
    'Scale 1',
  )
  assert.deepEqual(
    Viewport.zoomKey('=', { altKey: false, ctrlKey: false, metaKey: false }),
    Option.some('+'),
  )
  assert.equal(
    Option.isNone(
      Viewport.zoomKey('+', { altKey: false, ctrlKey: true, metaKey: false }),
    ),
    true,
  )
})

test('fit centers a canvas box and reveal pans the least distance', () => {
  const fitted = Viewport.fit(measured(), {
    left: 0,
    top: 0,
    right: 168,
    bottom: 118,
  }).model
  assert.deepEqual(fitted.viewport, { x: 116, y: 91, zoom: 1 })
  const capped = Viewport.fit(
    measured(),
    { left: 0, top: 0, right: 84, bottom: 59 },
    { maxZoom: 2 },
  ).model
  assert.equal(capped.viewport.zoom, 2)

  const revealed = Viewport.reveal(measured(), {
    left: 500,
    top: 10,
    right: 520,
    bottom: 30,
  })
  assert.deepEqual(revealed.model.viewport, { x: -144, y: 14, zoom: 1 })
  assert.equal(revealed.outMessage?.reason, 'focus-in')
})

test('browser scrolls in a findable pane become pans and the rest offsets the world', () => {
  const rested = step(measured(), [
    Viewport.Message.RestedPane({ at: { x: 100000, y: 100000 } }),
    Viewport.Message.ScrolledPane({ dx: 40, dy: -10, focusIn: false }),
  ])
  assert.deepEqual(rested.viewport, { x: -40, y: 10, zoom: 1 })
  assert.deepEqual(Viewport.style(rested), {
    transform: 'translate(99960px, 100010px) scale(1)',
    transformOrigin: '0 0',
    '--canvas-zoom': '1',
  })
  const found = Viewport.update(
    rested,
    Viewport.Message.ScrolledPane({ dx: 0, dy: 5, focusIn: true }),
  )
  assert.equal(found.outMessage?.reason, 'focus-in')
})
