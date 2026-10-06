import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Option } from 'effect'

import * as Drawer from '../src/lib/drawer.ts'

/**
 * Unit-level ports of Base UI's swipe-dismiss math
 * (base-ui/packages/react/src/drawer/** and utils/useSwipeDismiss):
 * directional displacement, damping, snap-point resolution, size-based
 * thresholds, velocity sampling and the release decision tree. Scene-level
 * coverage of the same behaviors lives in scene/drawer-baseui.scene.test.ts.
 */

const init = (config: Partial<Drawer.InitConfig> = {}): Drawer.Model =>
  Drawer.open(Drawer.init({ id: 'test', isAnimated: false, ...config })).model

const measured = (
  model: Drawer.Model,
  size: {
    popup?: { width: number; height: number }
    viewport?: { width: number; height: number; rootFontSize?: number }
  } = {},
): Drawer.Model =>
  Drawer.update(
    Drawer.update(
      model,
      Drawer.Message.MeasuredViewport({
        width: size.viewport?.width ?? 800,
        height: size.viewport?.height ?? 600,
        rootFontSize: size.viewport?.rootFontSize ?? 16,
      }),
    ).model,
    Drawer.Message.MeasuredPopup({
      width: size.popup?.width ?? 400,
      height: size.popup?.height ?? 300,
    }),
  ).model

const swipe = (
  model: Drawer.Model,
  points: ReadonlyArray<Readonly<{ x: number; y: number; t: number }>>,
): Drawer.Model => {
  const [start, ...rest] = points
  assert.ok(start !== undefined)
  const started = Drawer.update(
    model,
    Drawer.Message.StartedSwipe({ x: start.x, y: start.y, timeStamp: start.t }),
  ).model
  const last = rest.at(-1)
  assert.ok(last !== undefined)
  // Every trailing point is a drag sample; the final point's release is the
  // EndedSwipe itself (pointermove → pointerup, same coordinates).
  const dragged = rest.reduce(
    (current, point) =>
      Drawer.update(
        current,
        Drawer.Message.DraggedSwipe({
          x: point.x,
          y: point.y,
          timeStamp: point.t,
        }),
      ).model,
    started,
  )
  return Drawer.update(
    dragged,
    Drawer.Message.EndedSwipe({ x: last.x, y: last.y, timeStamp: last.t }),
  ).model
}

const isOpen = (model: Drawer.Model): boolean => model.dialog.isOpen

describe('getDisplacement', () => {
  it('projects pointer deltas onto the swipe direction', () => {
    assert.equal(Drawer.getDisplacement('down', 0, 120), 120)
    assert.equal(Drawer.getDisplacement('up', 0, -120), 120)
    assert.equal(Drawer.getDisplacement('right', 120, 0), 120)
    assert.equal(Drawer.getDisplacement('left', -120, 0), 120)
  })

  it('is negative when dragging away from the dismiss edge', () => {
    assert.equal(Drawer.getDisplacement('down', 0, -40), -40)
    assert.equal(Drawer.getDisplacement('right', -40, 0), -40)
  })
})

describe('resolveSnapPointValue', () => {
  it('treats numbers ≤ 1 as viewport fractions', () => {
    assert.equal(Drawer.resolveSnapPointValue(0.5, 600, 16), 300)
    assert.equal(Drawer.resolveSnapPointValue(1, 600, 16), 600)
    assert.equal(Drawer.resolveSnapPointValue(0.25, 600, 16), 150)
  })

  it('treats numbers > 1 as pixels', () => {
    assert.equal(Drawer.resolveSnapPointValue(200, 600, 16), 200)
    assert.equal(Drawer.resolveSnapPointValue(31.5, 600, 16), 31.5)
  })

  it('parses px and rem strings', () => {
    assert.equal(Drawer.resolveSnapPointValue('31rem', 600, 16), 496)
    assert.equal(Drawer.resolveSnapPointValue('120px', 600, 16), 120)
    assert.equal(Drawer.resolveSnapPointValue('1rem', 600, 16), 16)
  })

  it('rejects invalid values', () => {
    assert.equal(Drawer.resolveSnapPointValue('auto', 600, 16), null)
    assert.equal(Drawer.resolveSnapPointValue(Number.NaN, 600, 16), null)
    assert.equal(Drawer.resolveSnapPointValue(0.5, 0, 16), null)
  })
})

describe('resolveSnapPoints', () => {
  it('collapses snap points that clamp to the same height', () => {
    const resolved = Drawer.resolveSnapPoints([0.5, 1], 300, 600, 16)
    // 0.5×600=300 and 1×600=600 both clamp to the 300px popup → one point.
    assert.equal(resolved.length, 1)
    assert.equal(resolved[0]?.height, 300)
    assert.equal(resolved[0]?.offset, 0)
  })

  it('clamps heights to min(popup, viewport)', () => {
    const resolved = Drawer.resolveSnapPoints([0.5, 1], 500, 400, 16)
    assert.deepEqual(
      resolved.map(point => point.height),
      [200, 400],
    )
    assert.deepEqual(
      resolved.map(point => point.offset),
      [300, 100],
    )
  })

  it('keeps px and rem snap points in order', () => {
    const resolved = Drawer.resolveSnapPoints(['10rem', 1], 600, 800, 16)
    assert.deepEqual(
      resolved.map(point => point.height),
      [160, 600],
    )
    assert.deepEqual(
      resolved.map(point => point.offset),
      [440, 0],
    )
  })

  it('returns no snap points without measurements', () => {
    assert.equal(Drawer.resolveSnapPoints([0.5, 1], 0, 600, 16).length, 0)
    assert.equal(Drawer.resolveSnapPoints([], 300, 600, 16).length, 0)
  })
})

describe('applyDirectionalDamping', () => {
  it('passes displacement through toward the swipe direction', () => {
    assert.deepEqual(Drawer.applyDirectionalDamping(['down'], 0, 100), {
      x: 0,
      y: 100,
    })
  })

  it('sqrt-damps the opposite direction', () => {
    const damped = Drawer.applyDirectionalDamping(['down'], 0, -100)
    assert.equal(damped.y, -10)
  })

  it('sqrt-damps the off axis entirely', () => {
    const damped = Drawer.applyDirectionalDamping(['down'], 100, 50)
    assert.equal(damped.x, 10)
    assert.equal(damped.y, 50)
  })

  it('allows both vertical directions for snap-point drawers', () => {
    const directions = Drawer.swipeDirectionsFor('down', [0.5, 1])
    assert.deepEqual(directions, ['down', 'up'])
    assert.deepEqual(Drawer.applyDirectionalDamping(directions, 0, -100), {
      x: 0,
      y: -100,
    })
    assert.deepEqual(Drawer.swipeDirectionsFor('right', [0.5, 1]), ['right'])
  })
})

describe('getSnapPointSwipeMovement', () => {
  it('passes movement through while below the open edge', () => {
    assert.equal(Drawer.getSnapPointSwipeMovement(150, -50), -50)
  })

  it('sqrt-damps movement past the fully-open edge', () => {
    // baseOffset 150 + movement -160 → nextOffset -10 → -sqrt(10) - 150.
    const movement = Drawer.getSnapPointSwipeMovement(150, -160)
    assert.ok(Math.abs(movement - (-Math.sqrt(10) - 150)) < 1e-9)
  })
})

describe('swipeThresholdFor', () => {
  it('is half the popup size, floored at 10px', () => {
    assert.equal(Drawer.swipeThresholdFor(300), 150)
    assert.equal(Drawer.swipeThresholdFor(0), 10)
    assert.equal(Drawer.swipeThresholdFor(15), 10)
  })
})

describe('init', () => {
  it('defaults to a down-swiping modal drawer', () => {
    const model = Drawer.init({ id: 'defaults' })
    assert.equal(model.swipeDirection, 'down')
    assert.equal(model.modal, true)
    assert.equal(model.disablePointerDismissal, false)
    assert.equal(model.snapToSequentialPoints, false)
    assert.equal(Option.isNone(model.activeSnapPoint), true)
  })

  it('starts at the first snap point by default', () => {
    const model = Drawer.init({ id: 'snap', snapPoints: [0.5, 1] })
    assert.equal(model.activeSnapPoint.pipe(Option.getOrNull), 0.5)
  })

  it('honors an explicit defaultSnapPoint', () => {
    const model = Drawer.init({
      id: 'snap-default',
      snapPoints: [0.5, 1],
      defaultSnapPoint: 1,
    })
    assert.equal(Drawer.isExpanded(model), true)
  })
})

describe('update: swipe lifecycle', () => {
  it('ignores StartedSwipe while closed', () => {
    const model = Drawer.init({ id: 'closed' })
    const result = Drawer.update(
      model,
      Drawer.Message.StartedSwipe({ x: 0, y: 0, timeStamp: 1 }),
    )
    assert.equal(result.model.swipe.phase, 'Idle')
  })

  it('ignores StartedSwipe while a nested drawer is open', () => {
    const model = measured(init())
    const nested = { ...model, nestedDrawerHeights: { child: 300 } }
    const result = Drawer.update(
      nested,
      Drawer.Message.StartedSwipe({ x: 0, y: 0, timeStamp: 1 }),
    )
    assert.equal(result.model.swipe.phase, 'Idle')
  })

  it('tracks raw deltas and swipe progress while dragging', () => {
    const model = measured(init())
    const started = Drawer.update(
      model,
      Drawer.Message.StartedSwipe({ x: 200, y: 400, timeStamp: 1 }),
    ).model
    const dragged = Drawer.update(
      started,
      Drawer.Message.DraggedSwipe({ x: 200, y: 550, timeStamp: 200 }),
    ).model
    assert.equal(dragged.swipe.phase, 'Swiping')
    assert.equal(dragged.swipe.deltaY, 150)
    // 150 of 300px popup → 0.5 progress.
    assert.equal(dragged.swipeProgress, 0.5)
    assert.equal(Drawer.swipeMovement(dragged).y, 150)
  })

  it('settles back open on a directionless press-release', () => {
    const model = measured(init())
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 404, t: 100 },
    ])
    assert.equal(isOpen(released), true)
    assert.equal(released.swipe.phase, 'Idle')
  })

  it('dismisses past the size-based threshold', () => {
    const model = measured(init())
    // 160 > 150 (half of the 300px popup) at negligible velocity.
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 560, t: 1000 },
    ])
    assert.equal(isOpen(released), false)
  })

  it('settles below the size-based threshold', () => {
    const model = measured(init())
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 520, t: 1000 },
    ])
    assert.equal(isOpen(released), true)
    assert.equal(released.swipe.phase, 'Idle')
  })

  it('dismisses on a fast flick below the distance threshold', () => {
    const model = measured(init())
    // 40px in 50ms → whole-gesture velocity 0.8 ≥ FAST_SWIPE_VELOCITY.
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 440, t: 50 },
    ])
    assert.equal(isOpen(released), false)
  })

  it('dismisses on fast last-sample velocity after a slow start', () => {
    const model = measured(init())
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 420, t: 600 },
      { x: 200, y: 450, t: 620 },
    ])
    // Final interval velocity (30px / 20ms = 1.5) ≥ 0.5 → dismiss.
    assert.equal(isOpen(released), false)
  })

  it('settles when the release flicks back toward open', () => {
    const model = measured(init())
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 480, t: 300 },
      { x: 200, y: 420, t: 320 },
    ])
    // Final interval velocity (20 - 80) / 20 = -3 → away from dismiss.
    assert.equal(isOpen(released), true)
  })

  it('cancelling the swipe settles in place', () => {
    const model = measured(init())
    const started = Drawer.update(
      model,
      Drawer.Message.StartedSwipe({ x: 200, y: 400, timeStamp: 1 }),
    ).model
    const dragged = Drawer.update(
      started,
      Drawer.Message.DraggedSwipe({ x: 200, y: 520, timeStamp: 300 }),
    ).model
    const cancelled = Drawer.update(
      dragged,
      Drawer.Message.CancelledSwipe(),
    ).model
    assert.equal(cancelled.swipe.phase, 'Idle')
    assert.equal(cancelled.swipeProgress, 0)
    assert.equal(isOpen(cancelled), true)
  })

  it('uses popup width as the swipe size on the horizontal axis', () => {
    const model = measured(init({ swipeDirection: 'right' }))
    assert.equal(Drawer.swipeSizeFor(model), 400)
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 450, y: 400, t: 1000 },
    ])
    // 250 > 200 (half of 400) → dismiss.
    assert.equal(isOpen(released), false)
  })

  it('dismisses an up drawer by dragging up, not down', () => {
    const model = measured(init({ swipeDirection: 'up' }))
    const up = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 220, t: 1000 },
    ])
    assert.equal(isOpen(up), false)
    const down = swipe(measured(init({ swipeDirection: 'up' })), [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 560, t: 1000 },
    ])
    assert.equal(isOpen(down), true)
  })
})

describe('update: snap points', () => {
  const snapModel = (): Drawer.Model =>
    measured(init({ snapPoints: ['10rem', 1] }), {
      popup: { width: 400, height: 600 },
      viewport: { width: 800, height: 800 },
    })

  it('settles on the nearest snap point when the drag ends', () => {
    const model = snapModel()
    // Active = 10rem → height 160 → offset 440. Drag down 60 → target 500,
    // closest snap offset is still 440 (vs 0 or close at 600).
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 460, t: 800 },
    ])
    assert.equal(isOpen(released), true)
    assert.equal(released.activeSnapPoint.pipe(Option.getOrNull), '10rem')
    assert.equal(Drawer.isExpanded(released), false)
    assert.equal(Drawer.snapPointOffsetFor(released), 440)
  })

  it('settles fully open when dragged toward the open edge', () => {
    const model = snapModel()
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 100, t: 800 },
    ])
    // target offset 140 → closer to 0 (expanded) than to 440.
    assert.equal(released.activeSnapPoint.pipe(Option.getOrNull), 1)
    assert.equal(Drawer.isExpanded(released), true)
    assert.equal(Drawer.snapPointOffsetFor(released), 0)
  })

  it('dismisses when dragged closest to closed', () => {
    const model = snapModel()
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 700, t: 800 },
    ])
    // target offset 600 = fully closed → dismiss.
    assert.equal(isOpen(released), false)
  })

  it('projects velocity toward the next snap point', () => {
    const model = snapModel()
    // Small absolute delta (60px, below threshold) but the final interval
    // velocity (-60+30)/20 = -1.5 flings the target toward the open edge:
    // velocityOffset -450 → targetOffset 0 → expanded snap point.
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 370, t: 400 },
      { x: 200, y: 340, t: 420 },
    ])
    assert.equal(isOpen(released), true)
    assert.equal(released.activeSnapPoint.pipe(Option.getOrNull), 1)
    assert.equal(Drawer.isExpanded(released), true)
  })

  it('snapTo moves the model to the requested point', () => {
    const model = snapModel()
    const snapped = Drawer.snapTo(model, 1).model
    assert.equal(Drawer.isExpanded(snapped), true)
    const back = Drawer.snapTo(snapped, '10rem').model
    assert.equal(Drawer.isExpanded(back), false)
  })

  it('marks swipeDismissed and applies a release strength on swipe dismiss', () => {
    const model = snapModel()
    const released = swipe(model, [
      { x: 200, y: 400, t: 1 },
      { x: 200, y: 700, t: 800 },
    ])
    assert.equal(released.swipeDismissed, true)
    const strength = released.swipeStrength.pipe(Option.getOrNull)
    assert.ok(strength === null || (strength >= 0.1 && strength <= 1))
  })
})

describe('nested + measurement plumbing', () => {
  it('tracks nested drawer presence from NestedDrawersChanged', () => {
    const model = measured(init())
    const nested = Drawer.update(
      model,
      Drawer.Message.NestedDrawersChanged({
        count: 1,
        frontmostHeight: 320,
        swiping: false,
        progress: 0,
      }),
    ).model
    assert.equal(Drawer.nestedDrawerOpen(nested), true)
    assert.equal(Drawer.frontmostNestedHeight(nested), 320)
  })

  it('mirrors nested swipe progress through effectiveSwipeProgress', () => {
    const model = measured(init())
    const nested = Drawer.update(
      model,
      Drawer.Message.NestedDrawersChanged({
        count: 1,
        frontmostHeight: 320,
        swiping: true,
        progress: 0.6,
      }),
    ).model
    assert.equal(nested.nestedSwiping, true)
    assert.equal(Drawer.effectiveSwipeProgress(nested), 0.6)
  })
})
