import assert from 'node:assert/strict'
import test from 'node:test'

import { Duration } from 'effect'

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

test('pointer waits use configured delays and ignore an abandoned open', () => {
  const { init, update, Message, OutMessage } = HoverIntent
  const initial = init({ openDelay: '25 millis', closeDelay: 40 })
  const entered = update(initial, Message.EnteredTrigger())
  assert.deepEqual(entered.commands?.[0]?.args, {
    delay: Duration.millis(25),
    version: entered.model.pendingOpenVersion,
  })
  const completeOpen = Message.CompletedWaitBeforeOpening({
    version: entered.model.pendingOpenVersion,
  })
  const left = update(entered.model, Message.LeftTrigger()).model
  assert.deepEqual(update(left, completeOpen), { model: left })

  const opened = update(entered.model, completeOpen)
  assert.deepEqual(opened.outMessage, OutMessage.Opened())
  const leaving = update(opened.model, Message.LeftTrigger())
  assert.deepEqual(leaving.commands?.[0]?.args, {
    delay: Duration.millis(40),
    version: leaving.model.pendingCloseVersion,
  })
  const completeClose = Message.CompletedWaitBeforeClosing({
    version: leaving.model.pendingCloseVersion,
  })
  const closed = update(leaving.model, completeClose)
  assert.equal(closed.model.isOpen, false)
  assert.deepEqual(closed.outMessage, OutMessage.Closed())
  assert.deepEqual(update(closed.model, completeClose), { model: closed.model })
})

test('focus transfer invalidates the zero-delay close scheduled by blur', () => {
  const { init, update, Message, OutMessage } = HoverIntent
  const focused = update(init(), Message.FocusedTrigger())
  assert.deepEqual(focused.outMessage, OutMessage.Opened())
  const blurred = update(focused.model, Message.BlurredTrigger())
  assert.deepEqual(blurred.commands?.[0]?.args, {
    delay: Duration.zero,
    version: blurred.model.pendingCloseVersion,
  })
  const panelFocused = update(blurred.model, Message.FocusedPanel())
  assert.deepEqual(
    update(
      panelFocused.model,
      Message.CompletedWaitBeforeClosing({
        version: blurred.model.pendingCloseVersion,
      }),
    ),
    { model: panelFocused.model },
  )
  assert.equal(panelFocused.model.isOpen, true)
  assert.equal(panelFocused.outMessage, undefined)
})

test('Escape and programmatic close suppress reopening until trigger disengagement', () => {
  const { init, update, close, Message, OutMessage } = HoverIntent
  const focused = update(init(), Message.FocusedTrigger()).model
  const hovered = update(focused, Message.EnteredTrigger()).model
  for (const dismissed of [
    close(hovered),
    update(hovered, Message.PressedEscape({ source: 'Trigger' })),
  ]) {
    assert.deepEqual(dismissed.outMessage, OutMessage.Closed())
    assert.equal(dismissed.model.isOpen, false)
    const blurred = update(dismissed.model, Message.BlurredTrigger()).model
    const refocused = update(blurred, Message.FocusedTrigger())
    assert.equal(refocused.model.isOpen, false)
    assert.equal(refocused.outMessage, undefined)
    const left = update(blurred, Message.LeftTrigger()).model
    assert.equal(update(left, Message.FocusedTrigger()).model.isOpen, true)
  }
})
