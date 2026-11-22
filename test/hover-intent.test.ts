import assert from 'node:assert/strict'
import test from 'node:test'

import * as HoverIntent from '../src/lib/behaviors/hover-intent.ts'

test('the pointer bridge follows diagonally separated trigger and panel bounds', () => {
  const trigger = { left: 10, right: 30, top: 10, bottom: 20 }
  const panel = { left: 50, right: 90, top: 40, bottom: 80 }
  const inside = HoverIntent.bridgeBetween(trigger, panel)

  assert.equal(inside({ x: 28, y: 20 }), true)
  assert.equal(inside({ x: 40, y: 30 }), true)
  assert.equal(inside({ x: 55, y: 50 }), true)
  assert.equal(inside({ x: 80, y: 20 }), false)
  assert.equal(inside({ x: 12, y: 65 }), false)
})

test('a renewed hover invalidates the close scheduled on departure', () => {
  const initial = HoverIntent.update(
    HoverIntent.init(),
    HoverIntent.Message.FocusedTrigger(),
  ).model
  const entered = HoverIntent.update(
    initial,
    HoverIntent.Message.EnteredTrigger(),
  ).model
  const blurred = HoverIntent.update(
    entered,
    HoverIntent.Message.BlurredTrigger(),
  ).model
  const left = HoverIntent.update(
    blurred,
    HoverIntent.Message.LeftTrigger(),
  ).model
  const reentered = HoverIntent.update(
    left,
    HoverIntent.Message.EnteredPanel(),
  ).model
  const completion = HoverIntent.update(
    reentered,
    HoverIntent.Message.CompletedWaitBeforeClosing({
      version: left.pendingCloseVersion,
    }),
  )

  assert.equal(completion.model.isOpen, true)
  assert.equal(completion.outMessage, undefined)
})
