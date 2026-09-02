import assert from 'node:assert/strict'
import test from 'node:test'

import { Option } from 'effect'

import * as Tooltip from '../src/lib/tooltip.ts'

test('stale show completion cannot reopen a tooltip after pointer leave', () => {
  const initial = Tooltip.init({ id: 'tip', showDelay: 400 })
  const [entered] = Tooltip.update(initial, Tooltip.EnteredTrigger())
  const [left] = Tooltip.update(entered, Tooltip.LeftTrigger())
  const [stale, commands, out] = Tooltip.update(left, Tooltip.CompletedWaitBeforeShowing({ version: entered.showVersion }))

  assert.equal(stale.isOpen, false)
  assert.deepEqual(commands, [])
  assert.equal(Option.isNone(out), true)
})

test('focus owns visibility when pointer leaves and close completion is stale', () => {
  const initial = Tooltip.init({ id: 'tip', showDelay: 0, closeDelay: 100 })
  const [hovering] = Tooltip.update(initial, Tooltip.EnteredTrigger())
  const [shown] = Tooltip.update(hovering, Tooltip.CompletedWaitBeforeShowing({ version: hovering.showVersion }))
  const [focused] = Tooltip.update(shown, Tooltip.FocusedTrigger())
  const [left, closeCommands] = Tooltip.update(focused, Tooltip.LeftTrigger())

  assert.equal(left.isOpen, true)
  assert.equal(closeCommands.length, 0)
})

test('re-entry invalidates a pending close timer', () => {
  const open = { ...Tooltip.init({ id: 'tip', closeDelay: 100 }), isOpen: true, isHovered: true }
  const [left] = Tooltip.update(open, Tooltip.LeftTrigger())
  const closingVersion = left.closeVersion
  const [entered] = Tooltip.update(left, Tooltip.EnteredTrigger())
  const [stale] = Tooltip.update(entered, Tooltip.CompletedWaitBeforeClosing({ version: closingVersion }))

  assert.equal(stale.isOpen, true)
})

test('pointer-induced focus does not open a touch tooltip', () => {
  const initial = Tooltip.init({ id: 'tip' })
  const [pressed] = Tooltip.update(initial, Tooltip.PressedPointerOnTrigger())
  const [focused] = Tooltip.update(pressed, Tooltip.FocusedTrigger())

  assert.equal(focused.isOpen, false)
  assert.equal(focused.isFocused, false)
})

test('Escape dismisses until both pointer and focus disengage', () => {
  const open = { ...Tooltip.init({ id: 'tip' }), isOpen: true, isHovered: true, isFocused: true }
  const [dismissed, , hidden] = Tooltip.update(open, Tooltip.PressedEscape())
  const [left] = Tooltip.update(dismissed, Tooltip.LeftTrigger())
  const [blurred] = Tooltip.update(left, Tooltip.BlurredTrigger())

  assert.equal(Option.isSome(hidden), true)
  assert.equal(left.isDismissed, true)
  assert.equal(blurred.isDismissed, false)
})
