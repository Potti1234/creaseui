import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Option } from 'effect'

import * as Carousel from '../src/ui/carousel.ts'
import * as Drawer from '../src/ui/drawer.ts'
import * as DropdownMenu from '../src/ui/dropdown-menu.ts'
import * as HoverCard from '../src/ui/hover-card.ts'
import * as Resizable from '../src/ui/resizable.ts'
import * as Sidebar from '../src/ui/sidebar.ts'
import * as Sonner from '../src/ui/sonner.ts'

describe('stateful component models', () => {
  it('bounds carousel navigation at the available slides', () => {
    const model = Carousel.init('gallery', 3)
    assert.equal(Carousel.update(model, Carousel.Previous()).index, 0)
    assert.equal(Carousel.update(model, Carousel.WentTo({ index: 99 })).index, 2)
    assert.equal(Carousel.update({ ...model, index: 1 }, Carousel.Next()).index, 2)
  })

  it('clamps resizable panels and ends pointer drags', () => {
    const started = Resizable.update(Resizable.init('panels', 50), Resizable.StartedResize({ position: 100 }))
    const dragged = Resizable.update(started, Resizable.DraggedResize({ position: 1000, extent: 500 }))
    assert.equal(dragged.firstSize, 90)
    assert.equal(Option.isNone(Resizable.update(dragged, Resizable.EndedResize()).drag), true)
  })

  it('emits typed dropdown selections and closes the menu', () => {
    const Menu = DropdownMenu.create<'profile' | 'billing'>()
    const [opened] = Menu.open(DropdownMenu.init({ id: 'account' }))
    const [active] = Menu.update(opened, DropdownMenu.ActivatedItem({ index: 1 }))
    const [closed, , selection] = Menu.selectItem(active, 'billing', 1)
    assert.equal(closed.isOpen, false)
    assert.deepEqual(Option.getOrUndefined(selection), { _tag: 'Selected', value: 'billing', index: 1 })
  })

  it('keeps hover cards open when a stale close delay completes', () => {
    const [opened] = HoverCard.update(HoverCard.init({ id: 'profile' }), HoverCard.Entered())
    const [leaving] = HoverCard.update(opened, HoverCard.Left())
    const staleVersion = leaving.closeVersion
    const [reentered] = HoverCard.update(leaving, HoverCard.Entered())
    const [current] = HoverCard.update(reentered, HoverCard.CompletedCloseDelay({ version: staleVersion }))
    assert.equal(current.isOpen, true)
  })

  it('stores toast payloads and exposes caller-addressable actions', () => {
    const [model, commands] = Sonner.show(
      Sonner.init({ id: 'notifications' }),
      Sonner.success({ title: 'Saved', actionLabel: 'Undo', sticky: true }),
    )
    assert.equal(commands.length, 0)
    assert.equal(model.entries[0]?.payload.actionLabel, 'Undo')
    const [empty, , dismissed] = Sonner.dismiss(model, model.entries[0]?.id ?? '')
    assert.equal(empty.entries.length, 0)
    assert.equal(Option.getOrUndefined(dismissed)?._tag, 'DismissedToast')
  })

  it('persists desktop sidebar toggles and separates mobile state', () => {
    const [collapsed, commands] = Sidebar.update(
      { isOpen: true, isMobileOpen: false, storageKey: 'sidebar-test' },
      Sidebar.Toggled(),
    )
    assert.equal(collapsed.isOpen, false)
    assert.equal(commands.length, 1)
    const [mobile] = Sidebar.update(collapsed, Sidebar.ToggledMobile())
    assert.equal(mobile.isMobileOpen, true)
    assert.equal(mobile.isOpen, false)
  })

  it('tracks drawer drag distance and resets below the dismissal threshold', () => {
    const model = Drawer.init({ id: 'filters', isAnimated: true })
    const [started] = Drawer.update(model, Drawer.StartedDrag({ position: 20 }))
    const [dragged] = Drawer.update(started, Drawer.Dragged({ offset: 80 }))
    const [settled] = Drawer.update(dragged, Drawer.EndedDrag())
    assert.equal(settled.dragOffset, 0)
    assert.equal(Option.isNone(settled.dragStart), true)
  })
})
