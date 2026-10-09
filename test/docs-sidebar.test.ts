import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Duration, Schema as S } from 'effect'
import { HoverIntent } from '@foldkit/ui'

import { RoutedDocsPreviewMessage } from '@/docs/components/pages/authored-page'
import { sidebarTailwindPreviewProgram as program } from '@/docs/components/pages/sidebar/tailwind'
import { isWithinHoverArea } from '@/docs/components/pages/sidebar/hover'
import * as DropdownMenu from '@/ui/dropdown-menu'
import * as Sidebar from '@/ui/sidebar'

const Preview = S.Struct({
  sidebar: Sidebar.Model,
  learnMenu: DropdownMenu.Model,
  learnHover: HoverIntent.Model,
  feedback: S.String,
})
const preview = (model: unknown): typeof Preview.Type => {
  assert.ok(S.is(Preview)(model))
  return model
}
const update = (model: unknown, message: unknown) =>
  program.update(
    model,
    RoutedDocsPreviewMessage.RoutedNativeDocsPreviewMessage({ message }),
  )
const hover = (model: unknown, message: HoverIntent.Message) =>
  update(model, { _tag: 'GotSidebarPreviewLearnHoverMessage', message })
const enter = (model: unknown) =>
  update(model, { _tag: 'EnteredSidebarPreviewLearn' })
const leave = (model: unknown) =>
  update(model, { _tag: 'LeftSidebarPreviewLearn' })
const completeOpen = (model: unknown) =>
  hover(
    model,
    HoverIntent.Message.CompletedWaitBeforeOpening({
      version: preview(model).learnHover.pendingOpenVersion,
    }),
  )
const completeClose = (model: unknown, version: number) =>
  hover(model, HoverIntent.Message.CompletedWaitBeforeClosing({ version }))
const collapsed = () =>
  update(program.init(0), {
    _tag: 'GotSidebarPreviewMessage',
    message: Sidebar.Message.Toggled(),
  }).model
const opened = () => completeOpen(enter(collapsed()).model).model

test('sidebar hover departure gives a grace period, then closes the menu', () => {
  const model = opened()
  assert.equal(Duration.toMillis(preview(model).learnHover.closeDelay), 300)
  const pending = leave(model)
  assert.equal(preview(pending.model).learnMenu.isOpen, true)
  assert.ok(pending.commands.length > 0)
  const closed = completeClose(
    pending.model,
    preview(pending.model).learnHover.pendingCloseVersion,
  )
  assert.equal(preview(closed.model).learnMenu.isOpen, false)
})

test('returning to the hover area invalidates a pending close', () => {
  const pending = leave(opened()).model
  const version = preview(pending).learnHover.pendingCloseVersion
  const returned = enter(pending).model
  const stale = completeClose(returned, version).model
  assert.equal(preview(stale).learnMenu.isOpen, true)
  const departed = leave(stale).model
  assert.equal(
    preview(completeClose(departed, version).model).learnMenu.isOpen,
    true,
  )
  assert.equal(
    preview(
      completeClose(departed, preview(departed).learnHover.pendingCloseVersion)
        .model,
    ).learnMenu.isOpen,
    false,
  )
})

test('leaving before the opening command finishes never opens the menu', () => {
  const pending = enter(collapsed()).model
  const version = preview(pending).learnHover.pendingOpenVersion
  const departed = leave(pending).model
  const stale = hover(
    departed,
    HoverIntent.Message.CompletedWaitBeforeOpening({ version }),
  )
  assert.equal(preview(stale.model).learnMenu.isOpen, false)
})

test('keyboard dismissal suppresses hover until the pointer leaves and returns', () => {
  const suppressed = update(opened(), {
    _tag: 'SuppressedSidebarPreviewLearnHover',
  }).model
  const dismissed = update(suppressed, {
    _tag: 'GotSidebarPreviewLearnMenuMessage',
    message: DropdownMenu.Message.Closed(),
  }).model
  assert.equal(
    preview(completeOpen(enter(dismissed).model).model).learnMenu.isOpen,
    false,
  )
  const returned = enter(leave(dismissed).model).model
  assert.equal(preview(completeOpen(returned).model).learnMenu.isOpen, true)
})

test('keyboard-opened menus stay open without pointer engagement', () => {
  const model = update(collapsed(), {
    _tag: 'GotSidebarPreviewLearnMenuMessage',
    message: DropdownMenu.Message.Opened(),
  }).model
  const departed = leave(model)
  assert.equal(preview(departed.model).learnMenu.isOpen, true)
  assert.equal(departed.commands.length, 0)
})

test('selecting a menu item records the selection and cancels hover reopening', () => {
  const model = opened()
  const selected = update(model, {
    _tag: 'GotSidebarPreviewLearnMenuMessage',
    message: DropdownMenu.Message.SelectedItem({
      item: 'Changelog',
      index: 2,
      staysOpenOnSelect: false,
    }),
  }).model
  assert.equal(preview(selected).feedback, 'Changelog selected')
  assert.equal(preview(selected).learnMenu.isOpen, false)
  assert.equal(
    preview(completeOpen(enter(selected).model).model).learnMenu.isOpen,
    false,
  )
})

test('expanding or opening the mobile sidebar cancels pending hover work', () => {
  for (const message of [
    Sidebar.Message.Toggled(),
    Sidebar.Message.SetMobileOpen({ isOpen: true }),
  ]) {
    const pending = enter(collapsed()).model
    const version = preview(pending).learnHover.pendingOpenVersion
    const expanded = update(pending, {
      _tag: 'GotSidebarPreviewMessage',
      message,
    }).model
    const stale = hover(
      expanded,
      HoverIntent.Message.CompletedWaitBeforeOpening({ version }),
    )
    assert.equal(preview(stale.model).learnMenu.isOpen, false)
    assert.equal(preview(stale.model).learnHover.isTriggerHovered, false)
  }
})

test('hover geometry gives an 8 px allowance without accepting an empty panel', () => {
  const rect = { left: 100, right: 200, top: 100, bottom: 150 }
  assert.equal(isWithinHoverArea(208, 125, rect), true)
  assert.equal(isWithinHoverArea(209, 125, rect), false)
  assert.equal(isWithinHoverArea(150, 92, rect), true)
  assert.equal(isWithinHoverArea(150, 91, rect), false)
  assert.equal(
    isWithinHoverArea(0, 0, { left: 0, right: 0, top: 0, bottom: 0 }),
    false,
  )
})
