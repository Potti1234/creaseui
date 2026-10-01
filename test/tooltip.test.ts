import assert from 'node:assert/strict'
import test from 'node:test'

import { Option } from 'effect'

import * as Tooltip from '../src/lib/tooltip.ts'

test('stale show completion cannot reopen a tooltip after pointer leave', () => {
  const initial = Tooltip.init({ id: 'tip', showDelay: 400 })
  const op1__ = Tooltip.update(initial, Tooltip.Message.EnteredTooltipTrigger()); const entered = op1__.model;
  const op2__ = Tooltip.update(entered, Tooltip.Message.LeftTooltipTrigger()); const left = op2__.model;
  const op3__ = Tooltip.update(left, Tooltip.Message.CompletedWaitBeforeShowingTooltip({ version: entered.pendingShowVersion })); const stale = op3__.model; const commands = op3__.commands ?? []; const out = op3__.outMessage;

  assert.equal(stale.isOpen, false)
  assert.deepEqual(commands, [])
  assert.equal(out === undefined, true)
})

test('focus owns visibility when pointer leaves and close completion is stale', () => {
  const initial = Tooltip.init({ id: 'tip', showDelay: 0, closeDelay: 100 })
  const op4__ = Tooltip.update(initial, Tooltip.Message.EnteredTooltipTrigger()); const hovering = op4__.model;
  const op5__ = Tooltip.update(hovering, Tooltip.Message.CompletedWaitBeforeShowingTooltip({ version: hovering.pendingShowVersion })); const shown = op5__.model;
  const op6__ = Tooltip.update(shown, Tooltip.Message.FocusedTooltipTrigger()); const focused = op6__.model;
  const op7__ = Tooltip.update(focused, Tooltip.Message.LeftTooltipTrigger()); const left = op7__.model; const closeCommands = op7__.commands ?? [];

  assert.equal(left.isOpen, true)
  assert.equal(closeCommands.length, 0)
})

test('pointer leave closes an unfocused tooltip immediately', () => {
  const open = { ...Tooltip.init({ id: 'tip', closeDelay: 100 }), isOpen: true, isHovered: true }
  const op8__ = Tooltip.update(open, Tooltip.Message.LeftTooltipTrigger()); const left = op8__.model;

  assert.equal(left.isOpen, false)

  const op9__ = Tooltip.update({ ...open, isFocused: true }, Tooltip.Message.LeftTooltipTrigger()); const focusedLeft = op9__.model;
  assert.equal(focusedLeft.isOpen, true)
})

test('pointer-induced focus does not open a touch tooltip', () => {
  const initial = Tooltip.init({ id: 'tip' })
  const op11__ = Tooltip.update(initial, Tooltip.Message.PressedPointerOnTooltipTrigger({ pointerType: 'mouse' })); const pressed = op11__.model;
  const op12__ = Tooltip.update(pressed, Tooltip.Message.FocusedTooltipTrigger()); const focused = op12__.model;

  assert.equal(focused.isOpen, false)
  assert.equal(focused.isFocused, false)
})

test('Escape dismisses until the pointer disengages from the trigger', () => {
  const open = { ...Tooltip.init({ id: 'tip' }), isOpen: true, isHovered: true, isFocused: true }
  const op13__ = Tooltip.update(open, Tooltip.Message.PressedEscapeOnTooltip()); const dismissed = op13__.model; const hidden = op13__.outMessage;
  const op14__ = Tooltip.update(dismissed, Tooltip.Message.LeftTooltipTrigger()); const left = op14__.model;

  assert.equal(hidden !== undefined, true)
  assert.equal(dismissed.isDismissed, true)
  assert.equal(left.isDismissed, false)
})
