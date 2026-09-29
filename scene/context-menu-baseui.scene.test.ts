import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXContextMenu from '@/stylex/context-menu'
import * as TailwindContextMenu from '@/ui/context-menu'

/**
 * Behavioral parity suite ported from Base UI's context-menu tests
 * (base-ui/packages/react/src/context-menu/root/ContextMenuRoot.test.tsx,
 * context-menu/root/ContextMenuRoot.non-mac.test.tsx, and
 * context-menu/trigger/ContextMenuTrigger.test.tsx, checked at base-ui HEAD).
 *
 * creaseui's contextMenu is a thin wrapper over dropdownMenu with
 * `openOnContextMenu: true`, so the suite exercises the shared menu engine
 * through the contextmenu/pointerdown/keyboard surface.
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - describeConformance + 'throws when rendered outside ContextMenu.Root':
 *    React internals (ref instanceof, render= prop, missing-context error);
 *    foldkit components take their model as a prop and have no root context.
 *  - 'does not cancel/cancels opening menu on mouseup … 500ms',
 *    'keeps the menu open when the context-menu gesture ends inside its
 *    positioner / in a portaled submenu', 'aborts the pending document
 *    mouseup listener when the trigger unmounts': a document-level mouseup
 *    listener plus 500ms timers — no timers or document listeners exist in
 *    the DSL (and creaseui has no release-to-select gesture at all).
 *  - 'long press' describe (7 cases): touch events + 500ms long-press
 *    timer; creaseui implements no touch/long-press path.
 *  - 'ignores mouseup directly under the cursor when alignOffset is
 *    negative' and 'ignores context menu mouseup on non-Mac platforms':
 *    platform/positioning variants of the ported mouseup case — creaseui
 *    items carry no mouseup/pointerup handlers, so any release is inert.
 *  - 'prop: collisionAvoidance' flip: layout/viewport positioning (the DSL
 *    has no layout engine; Base UI itself gates these behind !isJSDOM).
 *  - 'does not block the native context menu when disabled': depends on the
 *    absent `disabled` prop plus an event.defaultPrevented payload.
 *  - 'blocks native context menus in a portal mounted inside the trigger
 *    DOM subtree' and 'blocks the native context menu when onContextMenu
 *    skips the Base UI handler': React portal placement and the
 *    preventBaseUIHandler event API.
 */

type MenuModel = TailwindContextMenu.Model
type MenuMessage = TailwindContextMenu.Message
type MenuOutMessage = TailwindContextMenu.OutMessage
type ItemConfig = TailwindContextMenu.ContextMenuItemConfig

type Model = Readonly<{
  menu: MenuModel
  inner: MenuModel
  outer: MenuModel
}>

type Message = Readonly<
  | { _tag: 'Menu'; message: MenuMessage }
  | { _tag: 'InnerMenu'; message: MenuMessage }
  | { _tag: 'OuterMenu'; message: MenuMessage }
>

type ContextMenuModule = Readonly<{
  init: (config: Readonly<{ id: string }>) => MenuModel
  update: (
    model: MenuModel,
    message: MenuMessage,
  ) => Readonly<{ model: MenuModel; outMessage?: MenuOutMessage }>
  contextMenu: <Item extends string, Msg>(
    props: Readonly<{
      model: MenuModel
      toParentMessage: (message: MenuMessage) => Msg
      trigger: Html | string
      items: ReadonlyArray<Item>
      itemToConfig: (item: Item) => ItemConfig<Item>
      ariaLabel?: string
      direction?: 'ltr' | 'rtl'
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const trigger = Scene.role('button', { name: 'Right click me' })
const menu = Scene.role('menu')
const backdrop = Scene.selector('[data-slot="dropdown-menu-backdrop"]')
const content = Scene.selector('#ctx-content')

const items: ReadonlyArray<string> = ['back', 'forward', 'reload']
const itemConfigs: Record<string, ItemConfig<string>> = {
  back: { label: 'Back' },
  forward: { label: 'Forward', isDisabled: true },
  reload: { label: 'Reload' },
}

const nestedItems: ReadonlyArray<string> = ['copy', 'more-tools']
const nestedItemConfigs: Record<string, ItemConfig<string>> = {
  copy: { label: 'Copy' },
  'more-tools': {
    label: 'More tools',
    submenu: {
      items: ['deep-action'],
      itemToConfig: item => ({ label: item === 'deep-action' ? 'Deep action' : item }),
    },
  },
}
const submenuTrigger = Scene.role('menuitem', { name: 'More tools' })

const verifyRenderer = (name: string, ContextMenu: ContextMenuModule) => {
  const initialModel = (
    menuModel = ContextMenu.init({ id: 'ctx' }),
    inner = ContextMenu.init({ id: 'inner-ctx' }),
    outer = ContextMenu.init({ id: 'outer-ctx' }),
  ): Model => ({ menu: menuModel, inner, outer })

  const update = (
    model: Model,
    message: Message,
  ): { model: Model; outMessage?: MenuOutMessage } => {
    switch (message._tag) {
      case 'Menu': {
        const result = ContextMenu.update(model.menu, message.message)
        return { ...result, model: { ...model, menu: result.model } }
      }
      case 'InnerMenu': {
        const result = ContextMenu.update(model.inner, message.message)
        return { ...result, model: { ...model, inner: result.model } }
      }
      case 'OuterMenu': {
        const result = ContextMenu.update(model.outer, message.message)
        return { ...result, model: { ...model, outer: result.model } }
      }
    }
  }

  const menuView = (model: Model, h: HtmlBuilder<Message>): Html =>
    ContextMenu.contextMenu(
      {
        model: model.menu,
        toParentMessage: message => ({ _tag: 'Menu', message }),
        trigger: 'Right click me',
        items,
        itemToConfig: item => itemConfigs[item] ?? { label: item },
        ariaLabel: 'Actions',
      },
      h,
    )

  const submenuView = (model: Model, h: HtmlBuilder<Message>): Html =>
    ContextMenu.contextMenu(
      {
        model: model.menu,
        toParentMessage: message => ({ _tag: 'Menu', message }),
        trigger: 'Right click me',
        items: nestedItems,
        itemToConfig: item => nestedItemConfigs[item] ?? { label: item },
        ariaLabel: 'Actions',
      },
      h,
    )

  const nestedView = (model: Model, h: HtmlBuilder<Message>): Html =>
    ContextMenu.contextMenu(
      {
        model: model.outer,
        toParentMessage: message => ({ _tag: 'OuterMenu', message }),
        trigger: h.div(
          [],
          [
            'outer',
            ContextMenu.contextMenu(
              {
                model: model.inner,
                toParentMessage: message => ({ _tag: 'InnerMenu', message }),
                trigger: 'inner',
                items: ['inner-action'],
                itemToConfig: () => ({ label: 'Inner action' }),
              },
              h,
            ),
          ],
        ),
        items: ['outer-action'],
        itemToConfig: () => ({ label: 'Outer action' }),
      },
      h,
    )

  describe(`${name} Context Menu (Base UI port)`, () => {
    describe('interactions', () => {
      it('should open menu on right click (context menu event)', () => {
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.expect(menu).toBeAbsent(),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(menu).toExist(),
        )
      })

      it('should call onOpenChange when menu is opened via right click', () => {
        // The foldkit analogue of onOpenChange: the trigger's contextmenu
        // handler dispatches the open message into update.
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(menu).toExist(),
        )
      })

      it('anchors the popup at the contextmenu pointer position', () => {
        // Base UI anchors the positioner at the contextmenu clientX/Y.
        // creaseui splits that gesture: pointerdown (button 2) records the
        // anchor, then contextmenu opens the menu at it.
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.pointerDown(trigger, { button: 2, clientX: 120, clientY: 80 }),
          Scene.expectHandled(),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(content).toHaveStyle('position', 'fixed'),
          Scene.expect(content).toHaveStyle(
            'left',
            'clamp(4px, 120px, calc(100vw - 4px))',
          ),
          Scene.expect(content).toHaveStyle(
            'top',
            'clamp(4px, 80px, calc(100vh - 4px))',
          ),
        )
      })

      it('ignores pointerdown from the primary mouse button', () => {
        // Only button 2 (secondary) anchors/opens a context menu; the
        // handler runs but produces no message for other buttons.
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.pointerDown(trigger, { button: 0, clientX: 10, clientY: 10 }),
          Scene.expectIgnored(),
          Scene.expect(menu).toBeAbsent(),
        )
      })

      it('opens the menu on the ContextMenu key', () => {
        // Keyboard parity: on Base UI the platform fires a native
        // contextmenu event for the Menu key; creaseui wires the keydown
        // directly.
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.keydown(trigger, 'ContextMenu'),
          Scene.expectHandled(),
          Scene.expect(menu).toExist(),
        )
      })

      it('opens the menu on Shift+F10 but ignores plain F10', () => {
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.keydown(trigger, 'F10'),
          Scene.expectIgnored(),
          Scene.expect(menu).toBeAbsent(),
          Scene.keydown(trigger, 'F10', { shiftKey: true }),
          Scene.expectHandled(),
          Scene.expect(menu).toExist(),
        )
      })

      // Base UI's ContextMenu.Trigger is a plain <div> with no key handling
      // — Enter/Space/arrows never open the menu; only the contextmenu
      // gesture (or its native keyboard equivalents: ContextMenu, Shift+F10)
      // does.
      it('ignores Enter and Space on the closed trigger', () => {
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.keydown(trigger, 'Enter'),
          Scene.expectIgnored(),
          Scene.expect(menu).toBeAbsent(),
        )
      })

      it('does not activate a submenu trigger when releasing the context menu pointer over it', () => {
        // Base UI: a button-2 release over a submenu trigger must not open
        // it. creaseui has no release-based activation at all — the submenu
        // trigger only wires mouseenter (and keyboard on the panel).
        Scene.scene(
          { update, view: submenuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(submenuTrigger).toHaveHandler('mouseenter'),
          // Clicking a submenu trigger opens it (Base UI click-open), but a
          // bare button-2 release never activates anything.
          Scene.expect(submenuTrigger).not.toHaveHandler('mouseup'),
          Scene.expect(submenuTrigger).not.toHaveHandler('pointerup'),
          Scene.expect(Scene.selector('#ctx-submenu-1')).toBeAbsent(),
        )
      })

      it('ignores mouseup directly under the cursor when the context menu spawns there', () => {
        // Base UI suppresses the release landing at the spawn point.
        // creaseui needs no coordinate suppression: items activate via
        // click only, so a right-button release can never select.
        Scene.scene(
          { update, view: submenuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(Scene.role('menuitem', { name: 'Copy' })).toHaveHandler(
            'click',
          ),
          Scene.expect(Scene.role('menuitem', { name: 'Copy' })).not.toHaveHandler(
            'mouseup',
          ),
          Scene.expect(Scene.role('menuitem', { name: 'Copy' })).not.toHaveHandler(
            'pointerup',
          ),
          Scene.expect(menu).toExist(),
        )
      })

      it('closes nested submenus when releasing the context menu pointer over an item', () => {
        // Base UI releases button 2 over the submenu item (itemPress).
        // creaseui's item-press is a click: it emits Selected and closes
        // the whole menu tree.
        Scene.scene(
          { update, view: submenuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.hover(submenuTrigger),
          Scene.expectHandled(),
          Scene.expect(Scene.selector('#ctx-submenu-1')).toExist(),
          Scene.click(Scene.role('menuitem', { name: 'Deep action' })),
          Scene.expectHandled(),
          // Selection indices are level-local: 'Deep action' is index 0 in
          // the open submenu (its position in the outer item list is not
          // observable to Base UI consumers either).
          Scene.expectOutMessage({
            _tag: 'Selected',
            value: 'deep-action',
            index: 0,
          }),
          Scene.expect(Scene.selector('#ctx-submenu-1')).toBeAbsent(),
          Scene.expect(menu).toBeAbsent(),
        )
      })

      it('should handle nested context menus correctly', () => {
        // Inner menu nested inside the outer trigger's content — the
        // contextmenu event hits the inner trigger's own handler first, so
        // only the inner menu opens. creaseui dismisses via its backdrop
        // (the outside-press analogue of Base UI's document pointerdown).
        Scene.scene(
          { update, view: nestedView },
          Scene.given(initialModel()),
          Scene.contextMenu(Scene.selector('#inner-ctx-trigger')),
          Scene.expectHandled(),
          Scene.expect(Scene.selector('#inner-ctx-content')).toExist(),
          Scene.expect(Scene.selector('#outer-ctx-content')).toBeAbsent(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expect(Scene.selector('#inner-ctx-content')).toBeAbsent(),
          Scene.contextMenu(Scene.selector('#outer-ctx-trigger')),
          Scene.expectHandled(),
          Scene.expect(Scene.selector('#outer-ctx-content')).toExist(),
          Scene.expect(Scene.selector('#inner-ctx-content')).toBeAbsent(),
        )
      })

      it('activates an item on click and reports the selection', () => {
        // Base UI's itemPress: clicking an item fires the item callback
        // and closes the menu. creaseui emits the Selected OutMessage.
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.click(Scene.role('menuitem', { name: 'Back' })),
          Scene.expectHandled(),
          Scene.expectOutMessage({
            _tag: 'Selected',
            value: 'back',
            index: 0,
          }),
          Scene.expect(menu).toBeAbsent(),
        )
      })

      it('dismisses the menu on outside press', () => {
        // creaseui renders a fixed backdrop while open; clicking it is the
        // outside-press dismissal Base UI performs via document listeners.
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(backdrop).toExist(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expect(menu).toBeAbsent(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
        )
      })

      // DIVERGENCE: Base UI installs a document contextmenu listener that
      // preventDefaults on the internal and external backdrops, so a
      // right-click over them never shows the native menu (and never
      // dismisses). creaseui's backdrop wires click-to-dismiss only — a
      // contextmenu event on it has no handler, so the native menu opens
      // over the still-open custom menu.
      it.fails('blocks the native context menu on the backdrop', () => {
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(backdrop).toHaveHandler('contextmenu'),
          Scene.contextMenu(backdrop),
          Scene.expectIgnored(),
          Scene.expect(menu).toExist(),
        )
      })

      it.todo(
        'allows mouseup after leaving the initial cursor point — creaseui ' +
          'has no release-to-select gesture; items activate via click',
      )

      it.todo(
        'returns focus to the focused surface when closing with Shift+Tab — ' +
          'the scene DSL has no focus engine; verify in e2e',
      )
    })

    describe('ARIA attributes', () => {
      // DIVERGENCE (intentional): Base UI's trigger is a bare <div> whose
      // only open signal is data-popup-open. creaseui renders a <button>
      // carrying aria-haspopup/aria-expanded/aria-controls — richer trigger
      // semantics, asserted here; the missing data-popup-open is the
      // it.fails below.
      it('adds open state attributes', () => {
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.expect(trigger).toHaveAttr('aria-haspopup', 'menu'),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'ctx-content'),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.keydown(content, 'Escape'),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(menu).toBeAbsent(),
        )
      })

      // Base UI marks the trigger data-popup-open while the menu is open.
      it('marks the trigger data-popup-open while open', () => {
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('data-popup-open', ''),
        )
      })

      it('exposes menu semantics on the popup and items', () => {
        Scene.scene(
          { update, view: menuView },
          Scene.given(initialModel()),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(menu).toHaveAttr('aria-label', 'Actions'),
          Scene.expect(menu).toHaveAttr('tabIndex', '0'),
          Scene.expect(Scene.role('menuitem', { name: 'Back' })).toExist(),
          Scene.expect(Scene.role('menuitem', { name: 'Reload' })).toExist(),
          Scene.expect(Scene.role('menuitem', { name: 'Forward' })).toHaveAttr(
            'aria-disabled',
            'true',
          ),
          Scene.expect(Scene.role('menuitem', { name: 'Forward' })).toHaveAttr(
            'data-disabled',
            '',
          ),
          Scene.expect(
            Scene.role('menuitem', { name: 'Forward' }),
          ).not.toHaveHandler('click'),
          Scene.expect(
            Scene.role('menuitem', { name: 'Forward' }),
          ).not.toHaveHandler('mouseenter'),
        )
      })
    })

    describe('prop: disabled', () => {
      it.todo(
        'does not open on right-click when disabled — creaseui contextMenu ' +
          'has no disabled prop (covers Root and Trigger disabled cases)',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindContextMenu)
verifyRenderer('StyleX', StyleXContextMenu)
