import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXMenu from '@/stylex/dropdown-menu'
import * as TailwindMenu from '@/ui/dropdown-menu'

/**
 * Behavioral parity suite ported from Base UI's `menu` tests
 * (base-ui/packages/react/src/menu/{root,trigger,item,checkbox-item,
 * radio-item,radio-group,submenu-trigger,group,group-label,popup,positioner,
 * viewport,backdrop,arrow,link-item}/**.test.tsx, checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently. Skipped groups:
 *  - React-implementation internals: throws-outside-context checks,
 *    describeConformance/popupConformanceTests, render= prop and nativeButton
 *    cases, StrictMode/warnings, perf rerender limits, actionsRef/handle
 *    imperative API, detached-triggers and triggerless roots
 *  - Cancellable event plumbing: `onOpenChange`/`onCheckedChange`/
 *    `onValueChange` cancellation via `eventDetails.cancel()`,
 *    `preventBaseUIHandler`, and `reason`/`detail` payloads — foldkit
 *    components dispatch messages, not cancellable DOM events
 *  - Real focus movement: focus guards, Tab/Shift+Tab traversal, finalFocus,
 *    "returns focus to trigger" — the scene DSL has no focus model; the
 *    highlight state is asserted through `data-active`/`tabIndex` instead
 *  - Portals (Menu.Portal / aria-owns ownership), positioner side/align
 *    offsets, collision handling, viewport morphing, arrow part,
 *    enter/exit transitions, keepMounted, scroll locking, openMethod tracking
 *  - Hover timing: openOnHover delay, closeDelay, safePolygon, impatient
 *    clicks — creaseui submenu hover-open is instant and exposes no delay props
 *  - Press-drag-release activation gestures, dialog-inside-menu nesting
 *  - MenuLinkItem / react-router render-prop cases (no link item exists)
 *  - talkBack/voiceOver assistive-technology tests
 *  - `isAnimated` transition state (creaseui stores it on the model but the
 *    scene DSL does not drive animations)
 *
 * creaseui attribute mapping used throughout: Base UI's `data-highlighted`
 * maps to `data-active="true"` + `tabIndex="0"` (roving tabindex); Base UI's
 * `data-checked`/`data-unchecked` map to `aria-checked`; the popup maps to
 * `role=menu` (`#<id>-content`). Focus assertions in Base UI are asserted as
 * highlight/tabindex assertions here.
 */

type MenuModule = Readonly<{
  init: typeof TailwindMenu.init
  update: typeof TailwindMenu.update
  dropdownMenu: <Msg>(
    props: TailwindMenu.DropdownMenuProps<string, Msg>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type Model = Readonly<{
  menu: TailwindMenu.Model
  checked: Readonly<Record<string, boolean>>
  items: ReadonlyArray<string>
}>

type Message = Readonly<
  | { _tag: 'GotMenu'; message: TailwindMenu.Message }
  | { _tag: 'RemoveItems'; count: number }
>

// The parent owns checkable state — creaseui emits a Selected out message and
// the app flips `isChecked` through `itemToConfig`, mirroring Base UI's
// `onCheckedChange`/`onValueChange` callbacks.
const CHECKBOX_ITEMS = new Set(['Notifications', 'Appearance'])
const RADIO_ITEMS = new Set(['Small', 'Medium', 'Large'])

const makeUpdate =
  (Menu: MenuModule) =>
  (
    model: Model,
    message: Message,
  ): { model: Model; outMessage?: TailwindMenu.OutMessage } => {
    switch (message._tag) {
      case 'RemoveItems':
        return { model: { ...model, items: model.items.slice(0, message.count) } }
      case 'GotMenu': {
        const result = Menu.update(model.menu, message.message)
        const selected = result.outMessage
        if (selected === undefined) {
          return { model: { ...model, menu: result.model } }
        }
        const checked = CHECKBOX_ITEMS.has(selected.value)
          ? { ...model.checked, [selected.value]: !(model.checked[selected.value] === true) }
          : RADIO_ITEMS.has(selected.value)
            ? { ...model.checked, [selected.value]: true }
            : model.checked
        return {
          model: { ...model, menu: result.model, checked },
          outMessage: result.outMessage,
        }
      }
    }
  }

const initialModel = (
  Menu: MenuModule,
  items: ReadonlyArray<string>,
  checked: Readonly<Record<string, boolean>> = {},
  isModal?: boolean,
): Model => ({
  menu: Menu.init({
    id: 'menu',
    ...(isModal === undefined ? {} : { isModal }),
  }),
  checked,
  items,
})

type ItemConfigProvider = (
  model: Model,
) => (item: string) => TailwindMenu.DropdownMenuItemConfig

const makeView =
  (
    Menu: MenuModule,
    configProvider: ItemConfigProvider,
    options?: Readonly<{
      direction?: 'ltr' | 'rtl'
      openOnContextMenu?: boolean
      trigger?: string
    }>,
  ) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    Menu.dropdownMenu(
      {
        model: model.menu,
        toParentMessage: message => ({ _tag: 'GotMenu', message }),
        trigger: options?.trigger ?? 'Actions',
        items: model.items,
        itemToConfig: configProvider(model),
        ariaLabel: 'Menu',
        ...(options?.direction === undefined ? {} : { direction: options.direction }),
        ...(options?.openOnContextMenu === undefined
          ? {}
          : { openOnContextMenu: options.openOnContextMenu }),
      },
      h,
    )

// Base UI's shared TestMenu fixture: Item 3 disabled, Item 4 is a submenu
// trigger with children Item 4.1/4.2 and a nested submenu trigger Item 4.3.
const STANDARD_ITEMS: ReadonlyArray<string> = [
  'Item 1',
  'Item 2',
  'Item 3',
  'Item 4',
  'Item 5',
]

const standardConfig: ItemConfigProvider = () => item => {
  switch (item) {
    case 'Item 3':
      return { label: 'Item 3', isDisabled: true }
    case 'Item 4':
      return {
        label: 'Item 4',
        submenu: {
          items: ['Item 4.1', 'Item 4.2', 'Item 4.3'],
          itemToConfig: child =>
            child === 'Item 4.3'
              ? {
                  label: 'Item 4.3',
                  submenu: {
                    items: ['Item 4.3.1', 'Item 4.3.2'],
                    itemToConfig: grandchild => ({ label: grandchild }),
                  },
                }
              : { label: child },
        },
      }
    default:
      return { label: item }
  }
}

const labelConfig =
  (labels: Readonly<Record<string, string>>): ItemConfigProvider =>
  () =>
  item => ({ label: labels[item] ?? item })

const checkboxConfig: ItemConfigProvider = model => item => {
  if (CHECKBOX_ITEMS.has(item)) {
    return {
      label: item,
      kind: 'checkbox',
      isChecked: model.checked[item] === true,
    }
  }
  if (item === 'Disabled checkbox') {
    return { label: item, kind: 'checkbox', isDisabled: true }
  }
  return { label: item }
}

const radioConfig: ItemConfigProvider = model => item => {
  if (RADIO_ITEMS.has(item)) {
    return {
      label: item,
      kind: 'radio',
      isChecked: model.checked[item] === true,
    }
  }
  if (item === 'Extra large') {
    return { label: item, kind: 'radio', isDisabled: true }
  }
  return { label: item }
}

const trigger = Scene.role('button', { name: 'Actions' })
const rootMenu = Scene.role('menu', { name: 'Menu' })
const content = Scene.selector('#menu-content')
const backdrop = Scene.selector('[data-slot="dropdown-menu-backdrop"]')
const menuItem = (name: string) => Scene.role('menuitem', { name })
const checkboxItem = (name: string) => Scene.role('menuitemcheckbox', { name })
const radioItem = (name: string) => Scene.role('menuitemradio', { name })
const submenuPanel = (label: string) =>
  Scene.role('menu', { name: `${label} submenu` })
const selected = (value: string, index: number) =>
  TailwindMenu.OutMessage.Selected({ value, index })

const verifyRenderer = (name: string, Menu: MenuModule) => {
  const update = makeUpdate(Menu)
  const view = makeView(Menu, standardConfig)
  const givenStandard = Scene.given(initialModel(Menu, STANDARD_ITEMS))

  describe(`${name} DropdownMenu (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('has the aria-haspopup attribute', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.expect(trigger).toHaveAttr('aria-haspopup', 'menu'),
          Scene.expect(trigger).toHaveAttr('type', 'button'),
        )
      })

      it('sets aria-expanded to false when the menu is closed', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(rootMenu).not.toExist(),
        )
      })

      it('sets aria-expanded to true and points aria-controls at the popup', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'menu-content'),
          Scene.expect(rootMenu).toExist(),
          Scene.expect(rootMenu).toHaveAttr('id', 'menu-content'),
          Scene.expect(rootMenu).toHaveAttr('aria-label', 'Menu'),
        )
      })

      it.fails(
        'has the data-popup-open and data-pressed attributes when the menu is open',
        () => {
          // DIVERGENCE (low): Base UI marks the open trigger with
          // data-popup-open and data-pressed. creaseui only toggles
          // aria-expanded; styling hooks use data-slot + aria-*.
          Scene.scene(
            { update, view },
            givenStandard,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(trigger).toHaveAttr('data-popup-open', ''),
            Scene.expect(trigger).toHaveAttr('data-pressed', ''),
          )
        },
      )

      it('does not render aria-orientation on a vertical popup', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(rootMenu).not.toHaveAttr('aria-orientation'),
        )
      })

      it.todo(
        'sets aria-orientation on a horizontal popup ' +
          '(no `orientation` prop — horizontal menus live in a separate ' +
          'menubar concept in creaseui)',
      )
    })

    describe('user interaction: click', () => {
      it('toggles the menu state when clicked', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(rootMenu).toExist(),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(rootMenu).not.toExist(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it('calls the onClick handler when the item is clicked', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.click(menuItem('Item 2')),
          Scene.expectHandled(),
          // Base UI observes onClick + menu close; creaseui reports the same
          // through the Selected out message and closes.
          Scene.expectOutMessage(selected('Item 2', 1)),
          Scene.expect(rootMenu).not.toExist(),
        )
      })

      it('closes the entire tree when clicking outside the deepest submenu', () => {
        // The fixed backdrop is creaseui's outside-click surface.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).toExist(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).not.toExist(),
          Scene.expect(rootMenu).not.toExist(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it.fails('opens the submenu when its trigger is clicked', () => {
        // DIVERGENCE (high): Base UI opens a submenu on trigger click when
        // openOnHover is false. creaseui submenu triggers have no click
        // handler — only hover or the forward key opens them — so the DSL
        // click throws before the assertion runs.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.click(menuItem('Item 4')),
          Scene.expect(submenuPanel('Item 4')).toExist(),
        )
      })

      it.todo(
        'prop: closeOnClick={false} keeps the menu open after item click ' +
          '(creaseui closes on every activation and has no closeOnClick prop)',
      )
    })

    describe('keyboard navigation: closed menu', () => {
      for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' '] as const) {
        it(`opens the menu when the trigger is pressed with ${key === ' ' ? 'Space' : key}`, () => {
          Scene.scene(
            { update, view },
            givenStandard,
            Scene.keydown(trigger, key),
            Scene.expectHandled(),
            Scene.expect(rootMenu).toExist(),
            Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          )
        })
      }

      it('does not open the menu for unbound keys', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.keydown(trigger, 'F1'),
          Scene.expectIgnored(),
          Scene.expect(rootMenu).not.toExist(),
        )
      })
    })

    describe('keyboard navigation: open menu', () => {
      it('focuses the first item after the menu is opened by keyboard', () => {
        // Base UI asserts real DOM focus; the scene analogue is the active
        // item's roving tabIndex + data-active flag.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 1')).toHaveAttr('tabIndex', '0'),
          Scene.expect(menuItem('Item 1')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Item 2')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(menuItem('Item 2')).toHaveAttr('data-active', 'false'),
        )
      })

      it.fails('focuses the last item when up arrow key opens the menu', () => {
        // DIVERGENCE (medium): Base UI highlights the last item when the menu
        // is opened with ArrowUp. creaseui opens with activeIndex=0 in both
        // directions, so Item 1 keeps the highlight.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.keydown(trigger, 'ArrowUp'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 5')).toHaveAttr('tabIndex', '0'),
          Scene.expect(menuItem('Item 5')).toHaveAttr('data-active', 'true'),
        )
      })

      it('changes the highlighted item using the arrow keys', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 1')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 2')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Item 2')).toHaveAttr('tabIndex', '0'),
          Scene.expect(menuItem('Item 1')).toHaveAttr('tabIndex', '-1'),
          // Item 3 is disabled and skipped; see the it.fails divergence below.
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 4')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'ArrowUp'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 2')).toHaveAttr('data-active', 'true'),
        )
      })

      it.fails('includes disabled items during keyboard navigation', () => {
        // DIVERGENCE (medium): Base UI moves the highlight onto aria-disabled
        // items (focusableWhenDisabled). creaseui filters disabled items out
        // of the keyboard rotation entirely.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.keydown(trigger, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 3')).toHaveAttr('data-active', 'true'),
        )
      })

      it('changes the highlighted item using the Home and End keys', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'End'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 5')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Item 5')).toHaveAttr('tabIndex', '0'),
          Scene.keydown(rootMenu, 'Home'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 1')).toHaveAttr('data-active', 'true'),
        )
      })

      it('navigates across grouped items with arrow keys and text', () => {
        Scene.scene(
          {
            update,
            view: makeView(
              Menu,
              () => item => ({
                label: item,
                ...(item === 'Cherry' ? { group: 'Citrus' } : {}),
              }),
            ),
          },
          Scene.given(
            initialModel(Menu, ['Apple', 'Banana', 'Cherry']),
          ),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(Scene.role('separator')).toExist(),
          Scene.expect(Scene.text('Citrus')).toExist(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Banana')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Cherry')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'a'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Apple')).toHaveAttr('data-active', 'true'),
        )
      })

      it('closes the menu with a keyboard item activation', () => {
        // Base UI: 'closes with a `detail === 0` click event on keyboard item
        // activation' — the synthetic event detail has no message analogue.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'Enter'),
          Scene.expectHandled(),
          Scene.expectOutMessage(selected('Item 1', 0)),
          Scene.expect(rootMenu).not.toExist(),
        )
      })

      it('activates the highlighted item with Space', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, ' '),
          Scene.expectHandled(),
          Scene.expectOutMessage(selected('Item 2', 1)),
          Scene.expect(rootMenu).not.toExist(),
        )
      })

      it('closes the menu on Escape', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'Escape'),
          Scene.expectHandled(),
          Scene.expect(rootMenu).not.toExist(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it('consumes navigation keys while letting ordinary keys fall through', () => {
        // Base UI asserts the toolbar never sees ArrowRight while F1 bubbles;
        // the scene analogue is handled-vs-ignored on the menu's keydown.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'F1'),
          Scene.expectIgnored(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 2')).toHaveAttr('data-active', 'true'),
        )
      })

      it.fails('does not activate a disabled item with Enter', () => {
        // DIVERGENCE (medium): creaseui leaves activeIndex=0 on open, so when
        // the first item is disabled it still shows data-active and Enter
        // selects it. Base UI never activates a disabled item.
        Scene.scene(
          {
            update,
            view: makeView(Menu, () => item => ({
              label: item,
              ...(item === 'Disabled item' ? { isDisabled: true } : {}),
            })),
          },
          Scene.given(initialModel(Menu, ['Disabled item', 'Item 2'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(rootMenu).toExist(),
        )
      })
    })

    describe('text navigation', () => {
      const typeaheadItems: ReadonlyArray<string> = [
        'Aa',
        'Ba',
        'Bb',
        'Ca',
        'Cb',
        'Cd',
      ]
      const typeaheadView = makeView(Menu, () => item => ({ label: item }))

      it('changes the highlighted item', () => {
        Scene.scene(
          { update, view: typeaheadView },
          Scene.given(initialModel(Menu, typeaheadItems)),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'c'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Ca')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Ca')).toHaveAttr('tabIndex', '0'),
          // The Base UI second keystroke asserts an accumulated "cd" query —
          // covered as a divergence in the it.fails below.
        )
      })

      it.fails(
        'changes the highlighted item with an accumulated multi-character query',
        () => {
          // DIVERGENCE (medium): Base UI accumulates keystrokes — "cd" still
          // matches "Cd". creaseui queries each keystroke alone, so 'd' after
          // 'c' matches nothing and the highlight stays put.
          Scene.scene(
            { update, view: typeaheadView },
            Scene.given(initialModel(Menu, typeaheadItems)),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'c'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'd'),
            Scene.expectIgnored(),
            Scene.expect(menuItem('Cd')).toHaveAttr('data-active', 'true'),
          )
        },
      )

      it('skips disabled items during text navigation', () => {
        Scene.scene(
          {
            update,
            view: makeView(Menu, () => item => ({
              label: item,
              ...(item === 'Banana' ? { isDisabled: true } : {}),
            })),
          },
          Scene.given(initialModel(Menu, ['Apple', 'Banana', 'Blueberry'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'b'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Blueberry')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Banana')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(menuItem('Banana')).toHaveAttr('data-active', 'false'),
        )
      })

      it('changes the highlighted item using text navigation on label prop', () => {
        Scene.scene(
          {
            update,
            view: makeView(
              Menu,
              labelConfig({ '1': 'Aa', '2': 'Ba', '3': 'Bb', '4': 'Ca' }),
            ),
          },
          Scene.given(initialModel(Menu, ['1', '2', '3', '4'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'b'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Ba')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Ba')).toHaveAttr('tabIndex', '0'),
        )
      })

      it('cycles through matching items on each repeated keystroke', () => {
        // creaseui re-queries with the latest single character and advances to
        // the next match; repeated 'b' cycles Ba → Bb → Bc → Ba.
        Scene.scene(
          {
            update,
            view: makeView(Menu, () => item => ({ label: item })),
          },
          Scene.given(initialModel(Menu, ['Aa', 'Ba', 'Bb', 'Bc'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'b'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Ba')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'b'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Bb')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'b'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Bc')).toHaveAttr('data-active', 'true'),
        )
      })

      it.fails(
        'matches "Item 2" after "Item " currently matches "Item 1"',
        () => {
          // DIVERGENCE (medium): Base UI accumulates pressed keys into a
          // multi-character query and absorbs Space while typing. creaseui
          // treats each keystroke as an independent single-char query and
          // Space always activates, so the sequence selects an item mid-typing.
          Scene.scene(
            {
              update,
              view: makeView(Menu, () => item => ({ label: item })),
            },
            Scene.given(initialModel(Menu, ['Item 1', 'Item 2', 'Item 3'])),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'i'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 't'),
            Scene.expectIgnored(),
            Scene.keydown(rootMenu, 'e'),
            Scene.expectIgnored(),
            Scene.keydown(rootMenu, 'm'),
            Scene.expectIgnored(),
            Scene.keydown(rootMenu, ' '),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, '2'),
            Scene.expectHandled(),
            Scene.expect(menuItem('Item 2')).toHaveAttr('data-active', 'true'),
            Scene.expect(rootMenu).toExist(),
          )
        },
      )

      it.fails(
        'does not trigger the onClick event when Space is pressed during text navigation',
        () => {
          // DIVERGENCE (medium): same accumulating-typeahead divergence — the
          // Space inside "Item T" activates the highlighted item in creaseui.
          Scene.scene(
            {
              update,
              view: makeView(Menu, () => item => ({ label: item })),
            },
            Scene.given(
              initialModel(Menu, ['Item One', 'Item Two', 'Item Three']),
            ),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'i'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 't'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'e'),
            Scene.expectIgnored(),
            Scene.keydown(rootMenu, 'm'),
            Scene.expectIgnored(),
            Scene.keydown(rootMenu, ' '),
            Scene.expectHandled(),
            Scene.expect(rootMenu).toExist(),
          )
        },
      )

      it.fails('navigate to options with diacritic characters', () => {
        // DIVERGENCE (medium): Base UI's accumulated query "bą" still matches
        // "Bą". creaseui typeaheads on the standalone 'ą' keystroke, which no
        // label starts with, so the highlight stays on "Ba".
        Scene.scene(
          {
            update,
            view: makeView(Menu, () => item => ({ label: item })),
          },
          Scene.given(initialModel(Menu, ['Aa', 'Ba', 'Bb', 'Bą'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'b'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Ba')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'ą'),
          Scene.expectIgnored(),
          Scene.expect(menuItem('Bą')).toHaveAttr('data-active', 'true'),
        )
      })

      it('navigate to next options that begin with diacritic characters', () => {
        Scene.scene(
          {
            update,
            view: makeView(Menu, () => item => ({ label: item })),
          },
          Scene.given(initialModel(Menu, ['Aa', 'ąa', 'ąb', 'ąc'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ą'),
          Scene.expectHandled(),
          Scene.expect(menuItem('ąa')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('ąa')).toHaveAttr('tabIndex', '0'),
        )
      })

      it.fails(
        'does not open a submenu when pressing Space during a typeahead session',
        () => {
          // DIVERGENCE (medium): Base UI absorbs Space while a typeahead query
          // is in flight. creaseui has no typeahead session, so Space opens
          // the highlighted submenu trigger immediately.
          Scene.scene(
            {
              update,
              view: makeView(Menu, () => item =>
                item === 'Add to Playlist'
                  ? {
                      label: item,
                      submenu: {
                        items: ['Add now'],
                        itemToConfig: child => ({ label: child }),
                      },
                    }
                  : { label: item },
              ),
            },
            Scene.given(initialModel(Menu, ['Add to Playlist'])),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'a'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'd'),
            Scene.expectIgnored(),
            Scene.keydown(rootMenu, 'd'),
            Scene.expectIgnored(),
            Scene.keydown(rootMenu, ' '),
            Scene.expectHandled(),
            Scene.expect(submenuPanel('Add to Playlist')).not.toExist(),
          )
        },
      )
    })

    describe('user interaction: hover', () => {
      it('highlights an item on mouse enter', () => {
        // Base UI: 'highlights an item on mouse move by default'.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.hover(menuItem('Item 2')),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 2')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Item 2')).toHaveAttr('tabIndex', '0'),
          Scene.expect(menuItem('Item 1')).toHaveAttr('data-active', 'false'),
        )
      })

      it('opens a submenu on pointer enter without delay', () => {
        // Base UI gates this behind a hover delay; creaseui opens instantly.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.hover(menuItem('Item 4')),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).toExist(),
          Scene.expect(menuItem('Item 4')).toHaveAttr('aria-expanded', 'true'),
        )
      })

      it.todo(
        'prop: highlightItemOnHover={false} suppresses pointer highlight ' +
          '(creaseui always activates on pointer enter; no such prop)',
      )
    })

    describe('nested menus', () => {
      it('opens the submenu with the ArrowRight key and highlights its first item (ltr)', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 4')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).toExist(),
          Scene.expect(rootMenu).toExist(),
          Scene.expect(menuItem('Item 4')).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(menuItem('Item 4')).toHaveAttr(
            'aria-controls',
            'menu-submenu-3',
          ),
          Scene.expect(menuItem('Item 4.1')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Item 4.1')).toHaveAttr('tabIndex', '0'),
          Scene.expect(menuItem('Item 4')).toHaveAttr('data-active', 'true'),
        )
      })

      it('opens the submenu with the ArrowLeft key (rtl)', () => {
        Scene.scene(
          { update, view: makeView(Menu, standardConfig, { direction: 'rtl' }) },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).toExist(),
          Scene.expect(menuItem('Item 4.1')).toHaveAttr('data-active', 'true'),
        )
      })

      it('closes the submenu with the back arrow key', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).toExist(),
          Scene.keydown(rootMenu, 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).not.toExist(),
          Scene.expect(rootMenu).toExist(),
          Scene.expect(menuItem('Item 4')).toHaveAttr('aria-expanded', 'false'),
        )
      })

      it('moves the highlight inside an open submenu with the arrow keys', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 4.2')).toHaveAttr('data-active', 'true'),
          Scene.expect(menuItem('Item 4.2')).toHaveAttr('tabIndex', '0'),
          Scene.keydown(rootMenu, 'End'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 4.3')).toHaveAttr('data-active', 'true'),
          Scene.keydown(rootMenu, 'Home'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 4.1')).toHaveAttr('data-active', 'true'),
        )
      })

      it('activates a submenu item with Enter and closes the whole tree', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'Enter'),
          Scene.expectHandled(),
          Scene.expectOutMessage(selected('Item 4.2', 1)),
          Scene.expect(submenuPanel('Item 4')).not.toExist(),
          Scene.expect(rootMenu).not.toExist(),
        )
      })

      it('opens a focused submenu trigger with Space when not typing', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, ' '),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).toExist(),
        )
      })

      it('labels the submenu panel and wires aria on its trigger', () => {
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 4')).toHaveAttr('aria-haspopup', 'menu'),
          Scene.expect(menuItem('Item 4')).toHaveAttr('aria-expanded', 'false'),
          Scene.hover(menuItem('Item 4')),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 4')).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(menuItem('Item 4')).toHaveAttr(
            'aria-controls',
            'menu-submenu-3',
          ),
          Scene.expect(submenuPanel('Item 4')).toExist(),
          Scene.expect(submenuPanel('Item 4')).toHaveAttr(
            'id',
            'menu-submenu-3',
          ),
          Scene.expect(submenuPanel('Item 4')).toHaveAttr(
            'aria-label',
            'Item 4 submenu',
          ),
        )
      })

      it('renders submenu triggers inert when disabled', () => {
        Scene.scene(
          {
            update,
            view: makeView(Menu, () => item =>
              item === 'More'
                ? {
                    label: item,
                    isDisabled: true,
                    submenu: {
                      items: ['Nested'],
                      itemToConfig: child => ({ label: child }),
                    },
                  }
                : { label: item },
            ),
          },
          Scene.given(initialModel(Menu, ['Item 1', 'More', 'Item 2'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(menuItem('More')).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(menuItem('More')).toHaveAttr('data-disabled', ''),
          Scene.expect(menuItem('More')).not.toHaveHandler('mouseenter'),
          Scene.expect(menuItem('More')).not.toHaveHandler('click'),
          Scene.expect(submenuPanel('More')).not.toExist(),
        )
      })

      it('uses the label prop for text navigation to a submenu trigger', () => {
        Scene.scene(
          {
            update,
            view: makeView(Menu, () => item =>
              item === 'reports'
                ? {
                    label: 'Reports',
                    submenu: {
                      items: ['Monthly'],
                      itemToConfig: child => ({ label: child }),
                    },
                  }
                : { label: item },
            ),
          },
          Scene.given(initialModel(Menu, ['home', 'reports', 'settings'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'r'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Reports')).toHaveAttr('data-active', 'true'),
        )
      })

      it.fails(
        'does not close the parent menu when the Escape key is pressed by default',
        () => {
          // DIVERGENCE (high): Base UI closes only the submenu on Escape
          // (closeParentOnEsc=false by default). creaseui closes the entire
          // tree on Escape from inside a submenu.
          Scene.scene(
            { update, view },
            givenStandard,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'ArrowDown'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'ArrowDown'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'ArrowRight'),
            Scene.expectHandled(),
            Scene.expect(submenuPanel('Item 4')).toExist(),
            Scene.keydown(rootMenu, 'Escape'),
            Scene.expectHandled(),
            Scene.expect(submenuPanel('Item 4')).not.toExist(),
            Scene.expect(rootMenu).toExist(),
          )
        },
      )

      it('closes the whole tree on Escape from inside a submenu', () => {
        // Base UI: 'closes the parent menu when the Escape key is pressed if
        // `closeParentOnEsc=true`' — creaseui behaves that way unconditionally.
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'Escape'),
          Scene.expectHandled(),
          Scene.expect(submenuPanel('Item 4')).not.toExist(),
          Scene.expect(rootMenu).not.toExist(),
        )
      })

      it.fails(
        'opens a third-level submenu when its trigger is activated',
        () => {
          // DIVERGENCE (high): Base UI supports arbitrary nesting. creaseui
          // renders exactly one submenu level — a nested submenu trigger gets
          // aria-haspopup but no panel, and ArrowRight inside an open submenu
          // falls through to typeahead (no match, no message).
          Scene.scene(
            { update, view },
            givenStandard,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'ArrowDown'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'ArrowDown'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'ArrowRight'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'ArrowDown'),
            Scene.expectHandled(),
            Scene.keydown(rootMenu, 'ArrowDown'),
            Scene.expectHandled(),
            Scene.expect(menuItem('Item 4.3')).toHaveAttr(
              'aria-haspopup',
              'menu',
            ),
            Scene.keydown(rootMenu, 'ArrowRight'),
            Scene.expectIgnored(),
            Scene.expect(submenuPanel('Item 4.3')).toExist(),
          )
        },
      )
    })

    describe('checkbox items', () => {
      const CHECKED_MENU_ITEMS: ReadonlyArray<string> = [
        'Item 1',
        'Notifications',
        'Appearance',
        'Disabled checkbox',
      ]
      const checkboxView = makeView(Menu, checkboxConfig)
      const givenCheckbox = Scene.given(
        initialModel(Menu, CHECKED_MENU_ITEMS, { Appearance: true }),
      )

      it('adds role=menuitemcheckbox and reflects state via aria-checked', () => {
        Scene.scene(
          { update, view: checkboxView },
          givenCheckbox,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(checkboxItem('Notifications')).toExist(),
          Scene.expect(checkboxItem('Notifications')).toHaveAttr(
            'aria-checked',
            'false',
          ),
          Scene.expect(checkboxItem('Notifications')).not.toBeChecked(),
          Scene.expect(checkboxItem('Appearance')).toHaveAttr(
            'aria-checked',
            'true',
          ),
          Scene.expect(checkboxItem('Appearance')).toBeChecked(),
        )
      })

      it('calls onCheckedChange when the item is clicked', () => {
        // The parent's `checked` map flips in response to the Selected out
        // message — the foldkit equivalent of the checked-change callback.
        Scene.scene(
          { update, view: checkboxView },
          givenCheckbox,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.click(checkboxItem('Notifications')),
          Scene.expectHandled(),
          Scene.expectOutMessage(selected('Notifications', 1)),
        )
      })

      it('keeps the checked state when closed and reopened', () => {
        // creaseui closes the menu on activation (see the it.fails below), so
        // the parent-held state is observable on the next open.
        Scene.scene(
          { update, view: checkboxView },
          givenCheckbox,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.click(checkboxItem('Notifications')),
          Scene.expectHandled(),
          Scene.expect(rootMenu).not.toExist(),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(checkboxItem('Notifications')).toHaveAttr(
            'aria-checked',
            'true',
          ),
          Scene.expect(checkboxItem('Appearance')).toHaveAttr(
            'aria-checked',
            'true',
          ),
        )
      })

      it('toggles the checked state when Space is pressed', () => {
        // Same caveat: creaseui closes on activation, so the new state is
        // asserted after reopening.
        Scene.scene(
          { update, view: checkboxView },
          givenCheckbox,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, ' '),
          Scene.expectHandled(),
          Scene.expectOutMessage(selected('Notifications', 1)),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(checkboxItem('Notifications')).toHaveAttr(
            'aria-checked',
            'true',
          ),
        )
      })

      it('can be focused but not interacted with when disabled', () => {
        // creaseui disabled items cannot be highlighted at all — the Base UI
        // "focusable" half of this expectation is covered by the
        // 'includes disabled items during keyboard navigation' it.fails.
        Scene.scene(
          { update, view: checkboxView },
          givenCheckbox,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(checkboxItem('Disabled checkbox')).toHaveAttr(
            'aria-disabled',
            'true',
          ),
          Scene.expect(checkboxItem('Disabled checkbox')).toHaveAttr(
            'data-disabled',
            '',
          ),
          Scene.expect(checkboxItem('Disabled checkbox')).toHaveAttr(
            'tabIndex',
            '-1',
          ),
          Scene.expect(checkboxItem('Disabled checkbox')).not.toHaveHandler(
            'click',
          ),
          Scene.expect(
            checkboxItem('Disabled checkbox'),
          ).not.toHaveHandler('mouseenter'),
        )
      })

      it.fails(
        'does not close the menu when a checkbox item is activated by default',
        () => {
          // DIVERGENCE (high): Base UI keeps the menu open on checkbox-item
          // activation (closeOnClick defaults to false for checkable items).
          // creaseui emits Selected and closes for every item kind; Enter and
          // Space behave identically.
          Scene.scene(
            { update, view: checkboxView },
            givenCheckbox,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.click(checkboxItem('Notifications')),
            Scene.expectHandled(),
            Scene.expect(rootMenu).toExist(),
            Scene.expect(checkboxItem('Notifications')).toHaveAttr(
              'aria-checked',
              'true',
            ),
          )
        },
      )

      it.fails('emits data-checked and data-unchecked state attributes', () => {
        // DIVERGENCE (low): Base UI exposes checkable state through
        // data-checked/data-unchecked; creaseui emits aria-checked only.
        Scene.scene(
          { update, view: checkboxView },
          givenCheckbox,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(checkboxItem('Appearance')).toHaveAttr('data-checked', ''),
          Scene.expect(checkboxItem('Notifications')).toHaveAttr(
            'data-unchecked',
            '',
          ),
        )
      })
    })

    describe('radio items', () => {
      const RADIO_MENU_ITEMS: ReadonlyArray<string> = [
        'Item 1',
        'Small',
        'Medium',
        'Large',
        'Extra large',
      ]
      const radioView = makeView(Menu, radioConfig)
      const givenRadio = Scene.given(
        initialModel(Menu, RADIO_MENU_ITEMS, { Medium: true }),
      )

      it('adds role=menuitemradio and reflects state via aria-checked', () => {
        Scene.scene(
          { update, view: radioView },
          givenRadio,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(radioItem('Medium')).toExist(),
          Scene.expect(radioItem('Medium')).toHaveAttr('aria-checked', 'true'),
          Scene.expect(radioItem('Medium')).toBeChecked(),
          Scene.expect(radioItem('Small')).toHaveAttr('aria-checked', 'false'),
          Scene.expect(radioItem('Small')).not.toBeChecked(),
        )
      })

      it('calls onValueChange when the item is clicked', () => {
        Scene.scene(
          { update, view: radioView },
          givenRadio,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.click(radioItem('Small')),
          Scene.expectHandled(),
          Scene.expectOutMessage(selected('Small', 1)),
        )
      })

      it('keeps the checked state when closed and reopened', () => {
        Scene.scene(
          { update, view: radioView },
          givenRadio,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.click(radioItem('Small')),
          Scene.expectHandled(),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(radioItem('Small')).toHaveAttr('aria-checked', 'true'),
          Scene.expect(radioItem('Medium')).toHaveAttr('aria-checked', 'true'),
        )
      })

      it('renders radio items inert when disabled', () => {
        Scene.scene(
          { update, view: radioView },
          givenRadio,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(radioItem('Extra large')).toHaveAttr(
            'aria-disabled',
            'true',
          ),
          Scene.expect(radioItem('Extra large')).toHaveAttr(
            'data-disabled',
            '',
          ),
          Scene.expect(radioItem('Extra large')).not.toHaveHandler('click'),
        )
      })

      it.fails(
        'does not close the menu when a radio item is activated by default',
        () => {
          // DIVERGENCE (high): same closeOnClick divergence as checkbox items.
          Scene.scene(
            { update, view: radioView },
            givenRadio,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.click(radioItem('Small')),
            Scene.expectHandled(),
            Scene.expect(rootMenu).toExist(),
          )
        },
      )

      it.todo(
        'RadioGroup container (role=group, aria-labelledby, group-level ' +
          'disabled, exclusive selection) — creaseui groups are label-only ' +
          'markers with no container element',
      )
    })

    describe('group labels', () => {
      const groupedView = makeView(
        Menu,
        () => item => ({ label: item, group: 'Group 1' }),
      )

      it.fails('hides the group label from the accessibility tree', () => {
        // DIVERGENCE (low): Base UI renders Menu.GroupLabel with
        // aria-hidden="true" by default and associates it via aria-labelledby
        // on role=group. creaseui's group label is a plain visible div with
        // no aria-hidden and no role=group container.
        Scene.scene(
          { update, view: groupedView },
          Scene.given(initialModel(Menu, ['Item 1', 'Item 2'])),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Group 1')).toHaveAttr('aria-hidden', 'true'),
        )
      })

      it.todo(
        'references the group label id via aria-labelledby on role=group ' +
          '(creaseui has no group container element)',
      )
    })

    describe('prop: modal', () => {
      it('should render an internal backdrop when `modal` is `true`', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel(Menu, STANDARD_ITEMS, {}, true)),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(backdrop).toExist(),
          Scene.expect(rootMenu).toExist(),
        )
      })

      it.fails('should not render an internal backdrop when `modal` is `false`', () => {
        // DIVERGENCE (low): `init` accepts `isModal` but drops it — the
        // backdrop is rendered whenever the menu is open, and it is the only
        // outside-click mechanism, so a non-modal menu cannot be expressed.
        Scene.scene(
          { update, view },
          Scene.given(initialModel(Menu, STANDARD_ITEMS, {}, false)),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(backdrop).not.toExist(),
        )
      })
    })

    describe('positioning', () => {
      it('places the popup at the anchored pointer position', () => {
        // creaseui extension of the Base UI positioner anchor contract: the
        // contextmenu trigger captures pointer coordinates through AnchoredAt
        // and the popup is fixed-positioned at them.
        Scene.scene(
          {
            update,
            view: makeView(Menu, standardConfig, {
              openOnContextMenu: true,
            }),
          },
          givenStandard,
          Scene.pointerDown(trigger, { button: 2, clientX: 150, clientY: 200 }),
          Scene.expectHandled(),
          Scene.contextMenu(trigger),
          Scene.expectHandled(),
          Scene.expect(rootMenu).toExist(),
          Scene.expect(content).toHaveStyle(
            'left',
            'clamp(4px, 150px, calc(100vw - 4px))',
          ),
          Scene.expect(content).toHaveStyle(
            'top',
            'clamp(4px, 200px, calc(100vh - 4px))',
          ),
          Scene.expect(content).toHaveStyle('position', 'fixed'),
        )
      })
    })

    describe('dynamic items', () => {
      it('skips removed items when navigating', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'RemoveItems', count: 3 }),
                  ],
                  ['Remove items'],
                ),
                Menu.dropdownMenu(
                  {
                    model: model.menu,
                    toParentMessage: message => ({
                      _tag: 'GotMenu',
                      message,
                    }),
                    trigger: 'Actions',
                    items: model.items,
                    itemToConfig: item => ({ label: item }),
                    ariaLabel: 'Menu',
                  },
                  h,
                ),
              ]),
          },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.keydown(rootMenu, 'End'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 5')).toHaveAttr('data-active', 'true'),
          Scene.click(Scene.text('Remove items')),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 4')).not.toExist(),
          Scene.expect(menuItem('Item 5')).not.toExist(),
          Scene.keydown(rootMenu, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 2')).toHaveAttr('data-active', 'true'),
        )
      })
    })

    describe('prop: disabled', () => {
      it('marks disabled items inert while remaining in the tab order contract', () => {
        // Base UI's 'can be focused but not interacted when disabled' —
        // the non-interactive half; the focusable half diverges (covered by
        // the keyboard-navigation it.fails).
        Scene.scene(
          { update, view },
          givenStandard,
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.expect(menuItem('Item 3')).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(menuItem('Item 3')).toHaveAttr('data-disabled', ''),
          Scene.expect(menuItem('Item 3')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(menuItem('Item 3')).not.toHaveHandler('click'),
          Scene.expect(menuItem('Item 3')).not.toHaveHandler('mouseenter'),
        )
      })

      it.todo(
        'prop: disabled on the root marks every item inert ' +
          '(creaseui has no root-level disabled prop; items are disabled ' +
          'individually through itemToConfig)',
      )

      it.todo(
        'prop: disabled on the trigger prevents opening ' +
          '(creaseui renders a plain button with no isDisabled option)',
      )
    })

    describe('prop: openOnHover', () => {
      it.todo(
        'opens the menu when the trigger is hovered ' +
          '(creaseui triggers open on click/keyboard only — no openOnHover, ' +
          'delay, or closeDelay props exist)',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindMenu)
verifyRenderer('StyleX', StyleXMenu)
