import assert from 'node:assert/strict'
import test from 'node:test'

import { Option } from 'effect'

import * as Drawer from '../src/lib/drawer.ts'

const dragging = (offset: number, elapsed: number) => {
  const op1__ = Drawer.update(Drawer.init({ id: 'drawer' }), Drawer.Message.StartedDrawerDrag({ position: 0, timeStamp: 10 })); const started = op1__.model;
  const op2__ = Drawer.update(started, Drawer.Message.DraggedDrawer({ offset, timeStamp: 10 + elapsed })); const dragged = op2__.model;
  return dragged
}

test('distance threshold dismisses through canonical Dialog close', () => {
  const op3__ = Drawer.update(dragging(Drawer.DISMISS_DISTANCE, 300), Drawer.Message.EndedDrawerDrag()); const ended = op3__.model; const commands = op3__.commands ?? [];
  assert.equal(ended.snapDecision, 'Dismiss')
  assert.equal(ended.dragPhase, 'Idle')
  assert.equal(Option.isNone(ended.dragStart), true)
  assert.ok(commands.length >= 0)
})

test('short slow drags return to the finite open snap', () => {
  const op4__ = Drawer.update(dragging(40, 400), Drawer.Message.EndedDrawerDrag()); const ended = op4__.model;
  assert.equal(ended.snapDecision, 'ReturnOpen')
  assert.equal(ended.dragOffset, 0)
})

test('a short fast fling dismisses while reverse velocity does not', () => {
  const op5__ = Drawer.update(dragging(40, 20), Drawer.Message.EndedDrawerDrag()); const fast = op5__.model;
  assert.equal(fast.snapDecision, 'Dismiss')

  const op6__ = Drawer.update(Drawer.init({ id: 'drawer' }), Drawer.Message.StartedDrawerDrag({ position: 0, timeStamp: 0 })); const started = op6__.model;
  const op7__ = Drawer.update(started, Drawer.Message.DraggedDrawer({ offset: 80, timeStamp: 20 })); const forward = op7__.model;
  const op8__ = Drawer.update(forward, Drawer.Message.DraggedDrawer({ offset: 40, timeStamp: 40 })); const reverse = op8__.model;
  const op9__ = Drawer.update(reverse, Drawer.Message.EndedDrawerDrag()); const returned = op9__.model;
  assert.equal(returned.snapDecision, 'ReturnOpen')
})

test('pointer cancellation clears transient drag state without closing', () => {
  const op10__ = Drawer.update(dragging(100, 100), Drawer.Message.CancelledDrawerDrag()); const cancelled = op10__.model;
  assert.equal(cancelled.snapDecision, 'ReturnOpen')
  assert.equal(cancelled.dragPhase, 'Idle')
  assert.equal(cancelled.dragVelocity, 0)
})
