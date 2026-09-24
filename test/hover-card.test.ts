import assert from 'node:assert/strict'
import test from 'node:test'

import * as HoverCard from '../src/lib/hover-card.ts'

test('stale show and close completions cannot override pointer ownership', () => {
  const initial = HoverCard.init({ id: 'profile', showDelay: 200, closeDelay: 100 })
  const op1__ = HoverCard.update(initial, HoverCard.Message.EnteredHoverCard()); const entered = op1__.model;
  const op2__ = HoverCard.update(entered, HoverCard.Message.LeftHoverCard()); const left = op2__.model;
  const op3__ = HoverCard.update(left, HoverCard.Message.CompletedWaitBeforeShowingHoverCard({ version: entered.showVersion })); const staleShow = op3__.model;
  assert.equal(staleShow.isOpen, false)

  const op4__ = HoverCard.update(left, HoverCard.Message.EnteredHoverCard()); const enteredAgain = op4__.model;
  const op5__ = HoverCard.update(enteredAgain, HoverCard.Message.CompletedWaitBeforeShowingHoverCard({ version: enteredAgain.showVersion })); const open = op5__.model;
  const op6__ = HoverCard.update(open, HoverCard.Message.LeftHoverCard()); const leaving = op6__.model;
  const op7__ = HoverCard.update(leaving, HoverCard.Message.EnteredHoverCard()); const reentered = op7__.model;
  const op8__ = HoverCard.update(reentered, HoverCard.Message.CompletedWaitBeforeClosingHoverCard({ version: leaving.closeVersion })); const staleClose = op8__.model;
  assert.equal(staleClose.isOpen, true)
})

test('keyboard focus owns the card across pointer leave and Escape dismisses it', () => {
  const op9__ = HoverCard.update(HoverCard.init({ id: 'profile' }), HoverCard.Message.FocusedHoverCardTrigger()); const focused = op9__.model;
  const op10__ = HoverCard.update(focused, HoverCard.Message.EnteredHoverCard()); const entered = op10__.model;
  const op11__ = HoverCard.update(entered, HoverCard.Message.LeftHoverCard()); const left = op11__.model; const commands = op11__.commands ?? [];
  assert.equal(left.isOpen, true)
  assert.equal(commands.length, 0)

  const op12__ = HoverCard.update(left, HoverCard.Message.PressedEscapeOnHoverCard()); const dismissed = op12__.model;
  const op13__ = HoverCard.update(dismissed, HoverCard.Message.EnteredHoverCard()); const stillDismissed = op13__.model;
  assert.equal(stillDismissed.isOpen, false)
})

test('touch pointer presses provide a toggle fallback while mouse presses do not', () => {
  const initial = HoverCard.init({ id: 'profile' })
  const op14__ = HoverCard.update(initial, HoverCard.Message.PressedPointerOnHoverCardTrigger({ pointerType: 'mouse' })); const mouse = op14__.model;
  const op15__ = HoverCard.update(mouse, HoverCard.Message.PressedPointerOnHoverCardTrigger({ pointerType: 'touch' })); const touchOpen = op15__.model;
  const op16__ = HoverCard.update(touchOpen, HoverCard.Message.PressedPointerOnHoverCardTrigger({ pointerType: 'touch' })); const touchClosed = op16__.model;
  assert.equal(mouse.isOpen, false)
  assert.equal(touchOpen.isOpen, true)
  assert.equal(touchClosed.isOpen, false)
})
