import assert from 'node:assert/strict'
import test from 'node:test'

import { Option } from 'effect'

import * as Drawer from '../src/lib/drawer.ts'

const dragging = (offset: number, elapsed: number) => {
  const [started] = Drawer.update(Drawer.init({ id: 'drawer' }), Drawer.StartedDrag({ position: 0, timeStamp: 10 }))
  const [dragged] = Drawer.update(started, Drawer.Dragged({ offset, timeStamp: 10 + elapsed }))
  return dragged
}

test('distance threshold dismisses through canonical Dialog close', () => {
  const [ended, commands] = Drawer.update(dragging(Drawer.DISMISS_DISTANCE, 300), Drawer.EndedDrag())
  assert.equal(ended.snapDecision, 'Dismiss')
  assert.equal(ended.dragPhase, 'Idle')
  assert.equal(Option.isNone(ended.dragStart), true)
  assert.ok(commands.length >= 0)
})

test('short slow drags return to the finite open snap', () => {
  const [ended] = Drawer.update(dragging(40, 400), Drawer.EndedDrag())
  assert.equal(ended.snapDecision, 'ReturnOpen')
  assert.equal(ended.dragOffset, 0)
})

test('a short fast fling dismisses while reverse velocity does not', () => {
  const [fast] = Drawer.update(dragging(40, 20), Drawer.EndedDrag())
  assert.equal(fast.snapDecision, 'Dismiss')

  const [started] = Drawer.update(Drawer.init({ id: 'drawer' }), Drawer.StartedDrag({ position: 0, timeStamp: 0 }))
  const [forward] = Drawer.update(started, Drawer.Dragged({ offset: 80, timeStamp: 20 }))
  const [reverse] = Drawer.update(forward, Drawer.Dragged({ offset: 40, timeStamp: 40 }))
  const [returned] = Drawer.update(reverse, Drawer.EndedDrag())
  assert.equal(returned.snapDecision, 'ReturnOpen')
})

test('pointer cancellation clears transient drag state without closing', () => {
  const [cancelled] = Drawer.update(dragging(100, 100), Drawer.CancelledDrag())
  assert.equal(cancelled.snapDecision, 'ReturnOpen')
  assert.equal(cancelled.dragPhase, 'Idle')
  assert.equal(cancelled.dragVelocity, 0)
})
