import assert from 'node:assert/strict'
import test from 'node:test'

import * as HoverCard from '../src/lib/hover-card.ts'

test('stale show and close completions cannot override pointer ownership', () => {
  const initial = HoverCard.init({ id: 'profile', showDelay: 200, closeDelay: 100 })
  const [entered] = HoverCard.update(initial, HoverCard.Entered())
  const [left] = HoverCard.update(entered, HoverCard.Left())
  const [staleShow] = HoverCard.update(left, HoverCard.CompletedWaitBeforeShowingHoverCard({ version: entered.showVersion }))
  assert.equal(staleShow.isOpen, false)

  const [enteredAgain] = HoverCard.update(left, HoverCard.Entered())
  const [open] = HoverCard.update(enteredAgain, HoverCard.CompletedWaitBeforeShowingHoverCard({ version: enteredAgain.showVersion }))
  const [leaving] = HoverCard.update(open, HoverCard.Left())
  const [reentered] = HoverCard.update(leaving, HoverCard.Entered())
  const [staleClose] = HoverCard.update(reentered, HoverCard.CompletedWaitBeforeClosingHoverCard({ version: leaving.closeVersion }))
  assert.equal(staleClose.isOpen, true)
})

test('keyboard focus owns the card across pointer leave and Escape dismisses it', () => {
  const [focused] = HoverCard.update(HoverCard.init({ id: 'profile' }), HoverCard.Focused())
  const [entered] = HoverCard.update(focused, HoverCard.Entered())
  const [left, commands] = HoverCard.update(entered, HoverCard.Left())
  assert.equal(left.isOpen, true)
  assert.equal(commands.length, 0)

  const [dismissed] = HoverCard.update(left, HoverCard.PressedEscape())
  const [stillDismissed] = HoverCard.update(dismissed, HoverCard.Entered())
  assert.equal(stillDismissed.isOpen, false)
})

test('touch pointer presses provide a toggle fallback while mouse presses do not', () => {
  const initial = HoverCard.init({ id: 'profile' })
  const [mouse] = HoverCard.update(initial, HoverCard.PressedPointer({ pointerType: 'mouse' }))
  const [touchOpen] = HoverCard.update(mouse, HoverCard.PressedPointer({ pointerType: 'touch' }))
  const [touchClosed] = HoverCard.update(touchOpen, HoverCard.PressedPointer({ pointerType: 'touch' }))
  assert.equal(mouse.isOpen, false)
  assert.equal(touchOpen.isOpen, true)
  assert.equal(touchClosed.isOpen, false)
})
