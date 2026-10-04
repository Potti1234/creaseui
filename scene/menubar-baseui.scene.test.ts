import { Option } from 'effect'
import { Command } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import { describe, it } from 'vitest'

import * as Behavior from '@/lib/dropdown-menu-behavior'
import * as MenubarBehavior from '@/lib/menubar'
import * as StyleXMenubar from '@/stylex/menubar'
import * as TailwindDropdownMenu from '@/ui/dropdown-menu'
import * as TailwindMenubar from '@/ui/menubar'

/**
 * Behavioral parity suite ported from Base UI's menubar tests
 * (base-ui/packages/react/src/menubar/Menubar.test.tsx, checked at base-ui HEAD).
 *
 * Base UI runs every case over three trigger-placement fixtures (contained,
 * detached via Menu.Handle payload, multiple contained). creaseui has a single
 * model-driven menubar, so the `contained` cases are ported once and the
 * detached/multiple variants — which exercise a React-only handle API — are
 * not repeated.
 *
 * The update harness below mirrors the canonical menubar wiring used by the
 * docs page (src/docs/components/pages/menubar/tailwind.ts): any menubar
 * outMessage or activeIndex change opens that menu and closes the rest.
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - React internals: the missing-context throw, Menu.Handle/payload detached
 *    triggers, and `aria-owns` portal ownership spans (creaseui renders menus
 *    inline, no portals).
 *  - Real-DOM behaviors the vnode DSL cannot express: the 300ms touch-click
 *    cooldown, scroll locking by viewport coverage, and keeping focus on an
 *    outside target when a triggerless menu closes.
 *  - Literal `toHaveFocus()` assertions — asserted as the roving `tabIndex`
 *    that backs the focus move, plus the emitted FocusMenubarTrigger command.
 *  - Wall-clock timing (`wait(50)` hover settle delays, `delay: 30` clicks) —
 *    no clock exists in the DSL.
 */

type MenuId = 'file' | 'edit' | 'view'

const MENU_IDS: ReadonlyArray<MenuId> = ['file', 'edit', 'view']

type Model = Readonly<{
  menubar: MenubarBehavior.Model
  file: TailwindDropdownMenu.Model
  edit: TailwindDropdownMenu.Model
  view: TailwindDropdownMenu.Model
  layout: string
}>

type Message = Readonly<
  | { _tag: 'GotMenuMessage'; target: MenuId; message: Behavior.MenuMessage }
  | { _tag: 'GotMenubarMessage'; message: MenubarBehavior.Message }
>

const gotMenu =
  (target: MenuId) =>
  (message: Behavior.MenuMessage): Message => ({
    _tag: 'GotMenuMessage',
    target,
    message,
  })

const gotMenubar = (message: MenubarBehavior.Message): Message => ({
  _tag: 'GotMenubarMessage',
  message,
})

const initialModel = (): Model => ({
  menubar: MenubarBehavior.init({ id: 'application-menubar' }),
  file: TailwindDropdownMenu.init({ id: 'menu-file' }),
  edit: TailwindDropdownMenu.init({ id: 'menu-edit' }),
  view: TailwindDropdownMenu.init({ id: 'menu-view' }),
  layout: 'single',
})

const openMessage: Behavior.MenuMessage = { _tag: 'Opened' }
const closeMessage: Behavior.MenuMessage = { _tag: 'Closed' }

// Mirrors the docs-page wiring: a menubar move opens the newly active menu and
// closes the rest; a menu message updates only its own menu (selections close
// the whole tree implicitly through the Closed-equivalent updates below).
const update = (
  model: Model,
  message: Message,
): { model: Model; commands?: ReadonlyArray<Command.AnyCommand> } => {
  switch (message._tag) {
    case 'GotMenuMessage': {
      const op = Behavior.update(model[message.target], message.message)
      const selected = Option.isSome(op.selection)
        ? op.selection.value.item
        : undefined
      return {
        model: {
          ...model,
          layout:
            selected === 'single' || selected === 'two'
              ? selected
              : model.layout,
          file:
            message.target === 'file'
              ? op.model
              : Behavior.update(model.file, closeMessage).model,
          edit:
            message.target === 'edit'
              ? op.model
              : Behavior.update(model.edit, closeMessage).model,
          view:
            message.target === 'view'
              ? op.model
              : Behavior.update(model.view, closeMessage).model,
        },
      }
    }
    case 'GotMenubarMessage': {
      const op = MenubarBehavior.update(model.menubar, message.message)
      const index =
        op.outMessage === undefined ? op.model.activeIndex : op.outMessage.index
      const target = MENU_IDS[index] ?? 'file'
      return {
        model: {
          ...model,
          menubar: op.model,
          file: Behavior.update(
            model.file,
            target === 'file' ? openMessage : closeMessage,
          ).model,
          edit: Behavior.update(
            model.edit,
            target === 'edit' ? openMessage : closeMessage,
          ).model,
          view: Behavior.update(
            model.view,
            target === 'view' ? openMessage : closeMessage,
          ).model,
        },
        commands: Command.mapMessages(op.commands ?? [], gotMenubar),
      }
    }
  }
}

// Fixture mirrors Base UI's ContainedTriggerMenubar.
const FILE_ITEMS = ['open', 'save', 'share']
const EDIT_ITEMS = ['copy', 'paste']
const VIEW_ITEMS = ['zoom-in', 'zoom-out', 'layout']
const SHARE_ITEMS = ['email', 'print']
const LAYOUT_ITEMS = ['single', 'two']

const LABELS: Readonly<Record<string, string>> = {
  open: 'Open',
  save: 'Save',
  copy: 'Copy',
  paste: 'Paste',
  'zoom-in': 'Zoom In',
  'zoom-out': 'Zoom Out',
  email: 'Email',
  print: 'Print',
}

const itemToConfig =
  (model: Model) =>
  (item: string): TailwindDropdownMenu.DropdownMenuItemConfig<string> => {
    switch (item) {
      case 'share':
        return {
          label: 'Share',
          submenu: { items: SHARE_ITEMS, itemToConfig: itemToConfig(model) },
        }
      case 'layout':
        return {
          label: 'Layout',
          submenu: { items: LAYOUT_ITEMS, itemToConfig: itemToConfig(model) },
        }
      case 'single':
        return {
          label: 'Single column',
          kind: 'radio',
          isChecked: model.layout === 'single',
        }
      case 'two':
        return {
          label: 'Two columns',
          kind: 'radio',
          isChecked: model.layout === 'two',
        }
      case 'disabled-item':
        return { label: 'Disabled item', isDisabled: true }
      default:
        return { label: LABELS[item] ?? item }
    }
  }

const menubar = Scene.role('menubar')
const menubarMenus = Scene.all.selector('[data-slot="menubar-menu"]')
const menuWrap = (index: number) => Scene.nth(menubarMenus, index)
const fileTrigger = Scene.role('menuitem', { name: 'File' })
const editTrigger = Scene.role('menuitem', { name: 'Edit' })
const viewTrigger = Scene.role('menuitem', { name: 'View' })
const fileMenu = Scene.role('menu', { name: 'File' })
const editMenu = Scene.role('menu', { name: 'Edit' })
const viewMenu = Scene.role('menu', { name: 'View' })
const shareMenu = Scene.role('menu', { name: 'Share submenu' })
const layoutMenu = Scene.role('menu', { name: 'Layout submenu' })
const item = (name: string) => Scene.role('menuitem', { name })
const radioItem = (name: string) => Scene.role('menuitemradio', { name })
const backdrop = Scene.selector('[data-slot="dropdown-menu-backdrop"]')

const resolveFocus = Scene.Command.resolve(
  MenubarBehavior.FocusTrigger,
  MenubarBehavior.Message.CompletedFocusMenubarTrigger(),
)

type MenubarModule = Readonly<{
  menubar: typeof TailwindMenubar.menubar
}>

const verifyRenderer = (name: string, Menubar: MenubarModule) => {
  const fixtureView =
    (options?: { fileItems?: ReadonlyArray<string> }) =>
    (model: Model, h: HtmlBuilder<Message>): Html =>
      Menubar.menubar<string, Message>(
        {
          model: model.menubar,
          toParentMessage: gotMenubar,
          menus: [
            {
              id: 'file',
              label: 'File',
              model: model.file,
              toParentMessage: gotMenu('file'),
              items: options?.fileItems ?? FILE_ITEMS,
              itemToConfig: itemToConfig(model),
            },
            {
              id: 'edit',
              label: 'Edit',
              model: model.edit,
              toParentMessage: gotMenu('edit'),
              items: EDIT_ITEMS,
              itemToConfig: itemToConfig(model),
            },
            {
              id: 'view',
              label: 'View',
              model: model.view,
              toParentMessage: gotMenu('view'),
              items: VIEW_ITEMS,
              itemToConfig: itemToConfig(model),
            },
          ],
        },
        h,
      )

  describe(`${name} Menubar (Base UI port)`, () => {
    describe('role', () => {
      it('sets role="menubar" on the root element', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.expect(menubar).toExist(),
          Scene.expect(menubar).toHaveAttr('aria-label', 'Application menu'),
        )
      })

      // creaseui has no `orientation` prop — the menubar is horizontal-only
      // (`direction` selects ltr/rtl, not vertical navigation).
      it.todo('sets aria-orientation on the root element — no orientation prop')

      it('sets role="menuitem" on menu triggers', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.expectAll(Scene.all.role('menuitem')).toHaveCount(3),
          Scene.expect(fileTrigger).toHaveAttr('aria-haspopup', 'menu'),
          Scene.expect(editTrigger).toHaveAttr('aria-haspopup', 'menu'),
          Scene.expect(viewTrigger).toHaveAttr('aria-haspopup', 'menu'),
        )
      })
    })

    describe('click interactions', () => {
      it('should open the menu after clicking on its trigger and close it when clicking again', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.expect(fileMenu).toBeAbsent(),
          Scene.expect(fileTrigger).toHaveAttr('aria-expanded', 'false'),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toExist(),
          Scene.expect(fileTrigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(fileTrigger).toHaveAttr(
            'aria-controls',
            'menu-file-content',
          ),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toBeAbsent(),
        )
      })
    })

    describe('touch interactions', () => {
      // Base UI fires pointerdown/mousedown on an outside element; the closest
      // creaseui analogue is the full-screen backdrop each open menu renders.
      it('closes the entire tree on a single outside press after opening a submenu', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.hover(item('Share')),
          Scene.expectHandled(),
          Scene.expect(shareMenu).toExist(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expect(shareMenu).toBeAbsent(),
          Scene.expect(fileMenu).toBeAbsent(),
        )
      })
    })

    describe('hover behavior', () => {
      it('should not open submenus on hover when no submenu is already open', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          // The menubar-menu wrapper only wires mouseenter once a menu is
          // open, so a hover with all menus closed can never reach a handler.
          Scene.expect(menuWrap(0)).not.toHaveHandler('mouseenter'),
          Scene.expect(fileMenu).toBeAbsent(),
        )
      })

      it('should open submenus on hover when another submenu is already open', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toExist(),
          Scene.hover(menuWrap(1)),
          Scene.expectHandled(),
          Scene.expect(editMenu).toExist(),
          Scene.expect(fileMenu).toBeAbsent(),
          Scene.hover(menuWrap(2)),
          Scene.expectHandled(),
          Scene.expect(viewMenu).toExist(),
          Scene.expect(editMenu).toBeAbsent(),
        )
      })

      it('should open nested submenus on hover when parent menu is open', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.hover(item('Share')),
          Scene.expectHandled(),
          Scene.expect(shareMenu).toExist(),
        )
      })

      it('should open another menu on hover when a nested submenu is open', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.hover(item('Share')),
          Scene.expectHandled(),
          Scene.expect(shareMenu).toExist(),
          Scene.hover(item('Email')),
          Scene.expectHandled(),
          Scene.hover(menuWrap(1)),
          Scene.expectHandled(),
          Scene.expect(editMenu).toExist(),
          Scene.expect(fileMenu).toBeAbsent(),
          Scene.expect(shareMenu).toBeAbsent(),
        )
      })

      // DIVERGENCE: Base UI marks the menubar with `data-has-submenu-open`
      // while a menu is open; creaseui gates hover-focus internally but
      // exposes no such attribute.
      it.fails('marks the menubar with data-has-submenu-open while a menu is open', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.expect(menubar).toHaveAttr('data-has-submenu-open'),
        )
      })

      // DIVERGENCE: Base UI SubmenuTrigger also opens on click; creaseui's
      // submenu-trigger items carry hover/keyboard handlers only.
      it.fails('opens the submenu when its trigger is clicked', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.expect(item('Share')).toHaveHandler('click'),
        )
      })
    })

    describe('focus behavior', () => {
      it('focuses a menubar item without immediately opening the menu', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          // A real `focus` on the trigger reaches no handler (the menubar's
          // OnFocus sits on the wrapper and `focus` doesn't bubble), so
          // focusing can never open the menu.
          Scene.expect(fileTrigger).not.toHaveHandler('focus'),
          Scene.expect(fileMenu).toBeAbsent(),
          Scene.keydown(fileTrigger, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toExist(),
        )
      })

      // DIVERGENCE: Base UI keeps the menu closed while focus rests on a
      // trigger. The creaseui model does respond to FocusedMenubarTrigger and
      // the canonical wiring then opens the menu — latent, because in a real
      // DOM `focus` doesn't bubble to the non-focusable wrapper that owns the
      // handler, so the message is never actually produced.
      it.fails('does not open a menu when a menubar item is focused', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.focus(menuWrap(0)),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toBeAbsent(),
        )
      })
    })

    describe('closeOnClick on nested items behavior', () => {
      // DIVERGENCE: Base UI radio items default to closeOnClick=false so the
      // menu stays open after a selection. creaseui has no closeOnClick —
      // every leaf item's click dispatches SelectedItem, which closes the tree.
      it.fails('should respect closeOnClick on nested items when the menu was opened on click', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(viewTrigger),
          Scene.expectHandled(),
          Scene.hover(item('Layout')),
          Scene.expectHandled(),
          Scene.expect(layoutMenu).toExist(),
          Scene.click(radioItem('Two columns')),
          Scene.expectHandled(),
          Scene.expect(layoutMenu).toExist(),
        )
      })

      it.fails('should respect closeOnClick on nested items when the menu was opened on hover', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.hover(menuWrap(2)),
          Scene.expectHandled(),
          Scene.expect(viewMenu).toExist(),
          Scene.hover(item('Layout')),
          Scene.expectHandled(),
          Scene.expect(layoutMenu).toExist(),
          Scene.click(radioItem('Two columns')),
          Scene.expectHandled(),
          Scene.expect(layoutMenu).toExist(),
        )
      })
    })

    describe('keyboard interactions', () => {
      it('should navigate between menubar items with arrow keys', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.expect(fileTrigger).toHaveAttr('tabIndex', '0'),
          Scene.expect(editTrigger).toHaveAttr('tabIndex', '-1'),
          Scene.expect(viewTrigger).toHaveAttr('tabIndex', '-1'),
          // Base UI asserts the edit trigger receives DOM focus; the DSL
          // asserts the roving tabIndex + emitted focus command that back it.
          Scene.keydown(menuWrap(0), 'ArrowRight'),
          Scene.expectHandled(),
          Scene.Command.expectHas(MenubarBehavior.FocusTrigger),
          resolveFocus,
          Scene.expect(editTrigger).toHaveAttr('tabIndex', '0'),
          Scene.expect(fileTrigger).toHaveAttr('tabIndex', '-1'),
        )
      })

      // DIVERGENCE: Base UI only moves focus when arrowing a closed menubar;
      // the canonical creaseui wiring also opens the newly active menu.
      it.fails('does not open a menu when arrow-navigating a closed menubar', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(menuWrap(0), 'ArrowRight'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(editMenu).toBeAbsent(),
        )
      })

      it('moves focus to the first and last triggers with Home and End', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(menuWrap(0), 'End'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(viewTrigger).toHaveAttr('tabIndex', '0'),
          Scene.expect(fileTrigger).toHaveAttr('tabIndex', '-1'),
          // Home/End are suppressed on an open menu's wrapper (in-menu nav
          // owns them there), so Home is delivered on a closed menu's.
          Scene.keydown(menuWrap(0), 'Home'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(fileTrigger).toHaveAttr('tabIndex', '0'),
          Scene.expect(viewTrigger).toHaveAttr('tabIndex', '-1'),
        )
      })

      it('should open the menu with Space key', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(fileTrigger, ' '),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toExist(),
        )
      })

      it('should navigate within the menu using arrow keys', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(fileTrigger, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(item('Open')).toHaveAttr('data-active', 'true'),
          Scene.expect(item('Open')).toHaveAttr('tabIndex', '0'),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(item('Save')).toHaveAttr('data-active', 'true'),
          Scene.expect(item('Open')).toHaveAttr('data-active', 'false'),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(item('Share')).toHaveAttr('data-active', 'true'),
        )
      })

      it('should open the submenu with right arrow key', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(fileTrigger, 'Enter'),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(item('Share')).toHaveAttr('data-active', 'true'),
          Scene.keydown(fileMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(shareMenu).toExist(),
          Scene.expect(item('Email')).toHaveAttr('data-active', 'true'),
        )
      })

      it('should close the menu with Escape key', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(fileTrigger, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toExist(),
          Scene.keydown(fileMenu, 'Escape'),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toBeAbsent(),
        )
      })

      it('should close submenu with left arrow key and return focus to submenu trigger', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(fileTrigger, 'Enter'),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(shareMenu).toExist(),
          Scene.keydown(fileMenu, 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expect(shareMenu).toBeAbsent(),
          Scene.expect(item('Share')).toHaveAttr('data-active', 'true'),
        )
      })

      // DIVERGENCE: Base UI closes open submenus and moves to the next
      // menubar item on ArrowRight. creaseui suppresses top-level moves while
      // any submenu is open and the menu's keydown ignores ArrowRight, so the
      // key is a dead end.
      it.fails('closes open submenus when navigating to the next menubar item with ArrowRight', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(fileTrigger, 'Enter'),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(shareMenu).toExist(),
          Scene.keydown(fileMenu, 'ArrowRight'),
          Scene.expectIgnored(),
          Scene.expect(editMenu).toExist(),
        )
      })

      it('should navigate between menus using left/right arrow keys when menus are open', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.keydown(fileTrigger, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(fileMenu).toExist(),
          Scene.keydown(menuWrap(0), 'ArrowRight'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(fileMenu).toBeAbsent(),
          Scene.expect(editMenu).toExist(),
          Scene.keydown(menuWrap(1), 'ArrowLeft'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(fileMenu).toExist(),
          Scene.expect(editMenu).toBeAbsent(),
        )
      })
    })

    describe('mixed mouse and keyboard interactions', () => {
      // DIVERGENCE: Base UI highlights file-item-1 on the first ArrowDown
      // after a mouse-open. creaseui pre-activates index 0 on open, so the
      // first ArrowDown lands on file-item-2.
      it.fails('should allow keyboard navigation after opening a menu with mouse click', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(item('Open')).toHaveAttr('data-active', 'true'),
        )
      })

      it('should allow clicking a menu trigger then navigating to another menu with keyboard', () => {
        Scene.scene(
          { update, view: fixtureView() },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.keydown(menuWrap(0), 'ArrowRight'),
          Scene.expectHandled(),
          resolveFocus,
          Scene.expect(fileMenu).toBeAbsent(),
          Scene.expect(editMenu).toExist(),
        )
      })
    })

    describe('prop: loopFocus', () => {
      // creaseui always loops top-level arrow navigation — there is no
      // loopFocus prop to disable it.
      describe('when loopFocus == true', () => {
        it('should loop around to the first item after the last one', () => {
          Scene.scene(
            { update, view: fixtureView() },
            Scene.given(initialModel()),
            Scene.keydown(menuWrap(0), 'ArrowRight'),
            Scene.expectHandled(),
            resolveFocus,
            Scene.keydown(menuWrap(1), 'ArrowRight'),
            Scene.expectHandled(),
            resolveFocus,
            Scene.expect(viewTrigger).toHaveAttr('tabIndex', '0'),
            Scene.keydown(menuWrap(2), 'ArrowRight'),
            Scene.expectHandled(),
            resolveFocus,
            Scene.expect(fileTrigger).toHaveAttr('tabIndex', '0'),
          )
        })

        it('should loop around to the last item after the first one', () => {
          Scene.scene(
            { update, view: fixtureView() },
            Scene.given(initialModel()),
            Scene.keydown(menuWrap(0), 'ArrowLeft'),
            Scene.expectHandled(),
            resolveFocus,
            Scene.expect(viewTrigger).toHaveAttr('tabIndex', '0'),
          )
        })
      })

      describe('when loopFocus == false', () => {
        it.todo(
          'should stay on the last item when navigating beyond it — no loopFocus prop',
        )
        it.todo(
          'should stay on the first item when navigating before it — no loopFocus prop',
        )
      })
    })

    describe('prop: disabled', () => {
      it.todo(
        'disables child menus when menubar is disabled — no menubar disabled prop',
      )
      it.todo(
        'keeps the menubar reachable when the first trigger is disabled — no per-trigger disabled',
      )
      it.todo(
        'disables menu items while the menubar is disabled — no menubar disabled prop',
      )

      // Item-level `isDisabled` is the ported portion of the disabled suite.
      it('a disabled menu item is inert and skipped by arrow navigation', () => {
        Scene.scene(
          {
            update,
            view: fixtureView({ fileItems: ['open', 'disabled-item', 'save'] }),
          },
          Scene.given(initialModel()),
          Scene.click(fileTrigger),
          Scene.expectHandled(),
          Scene.expect(item('Disabled item')).toBeDisabled(),
          Scene.expect(item('Disabled item')).not.toHaveHandler('click'),
          Scene.expect(item('Disabled item')).not.toHaveHandler('mouseenter'),
          Scene.keydown(fileMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(item('Save')).toHaveAttr('data-active', 'true'),
          Scene.expect(item('Disabled item')).toHaveAttr(
            'data-active',
            'false',
          ),
        )
      })
    })

    it('correctly opens new menu on hover after clicking on its trigger and entering from hover (#2222)', () => {
      Scene.scene(
        { update, view: fixtureView() },
        Scene.given(initialModel()),
        Scene.click(fileTrigger),
        Scene.expectHandled(),
        Scene.expect(fileMenu).toExist(),
        Scene.hover(menuWrap(1)),
        Scene.expectHandled(),
        Scene.expect(editMenu).toExist(),
        // Clicking the open menu's trigger closes it; the next hover must
        // reopen it (upstream regression #2222).
        Scene.click(editTrigger),
        Scene.expectHandled(),
        Scene.expect(editMenu).toBeAbsent(),
        Scene.click(fileTrigger),
        Scene.expectHandled(),
        Scene.expect(fileMenu).toExist(),
        Scene.hover(menuWrap(1)),
        Scene.expectHandled(),
        Scene.expect(editMenu).toExist(),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindMenubar)
verifyRenderer('StyleX', StyleXMenubar)
