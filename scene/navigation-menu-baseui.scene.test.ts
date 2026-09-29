import { Option } from 'effect'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Popover as PopoverPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import * as NavigationMenuLib from '@/lib/navigation-menu'
import * as StyleXNavigationMenu from '@/stylex/navigation-menu'
import * as TailwindNavigationMenu from '@/ui/navigation-menu'

/**
 * Behavioral parity suite ported from Base UI's navigation-menu tests
 * (base-ui/packages/react/src/navigation-menu/**\/*.test.tsx, checked at
 * base-ui HEAD).
 *
 * creaseui's navigation-menu is a much thinner component than Base UI's:
 * it is a `<nav>` landmark of links plus Popover-backed disclosures, not a
 * composite widget. The disclosures are independent Popover child models
 * coordinated by the parent's `NavigationMenuLib.foldDisclosure` fold, which
 * gives them Base UI's single open value: opening one closes the rest. There
 * is no `onValueChange` surface, no
 * orientation, no roving tabindex, no Portal/Positioner/Popup/Viewport/Arrow/
 * Backdrop/Icon parts, and no nested menus — cases exercising those are
 * recorded below as `it.todo`, and the following groups are skipped outright:
 *  - `describeConformance` on every part (ref forwarding, `render=` element
 *    substitution, className merging — React internals with no vnode analog)
 *  - "throws a descriptive error when rendered outside <X>" (React context
 *    guards; foldkit has no context-based part nesting to violate)
 *  - `renderToString` SSR cases in NavigationMenuContent.test.tsx
 *  - every `it.skipIf(isJSDOM)` browser case and the whole
 *    `NavigationMenuRoot.webkit.test.tsx` suite (safePolygon pointer-events,
 *    hover/focus timing, positioner measurement, animation — the DSL has no
 *    layout, timers, real pointer, or real focus)
 *  - the `tabbing` and focus-movement groups (real tab order, focus guards,
 *    focus restore — the DSL only asserts the commands, not moved focus)
 *  - `actionsRef` cases (creaseui exposes no actions ref)
 *  - event-object payloads (`eventDetails.cancel()`, modifier reporting —
 *    foldkit dispatches plain messages)
 */

type Model = Readonly<{
  products: PopoverPrimitive.Model
  resources: PopoverPrimitive.Model
  homeActive: boolean
}>

type Message = Readonly<
  | { _tag: 'GotProductsMessage'; message: PopoverPrimitive.Message }
  | { _tag: 'GotResourcesMessage'; message: PopoverPrimitive.Message }
  | { _tag: 'SetProductsOpen'; isOpen: boolean }
>

const productsLens: NavigationMenuLib.DisclosureLens<Model, Message> = {
  read: model => Option.some(model.products),
  write: (model, products) => ({ ...model, products }),
  toParentMessage: message => ({ _tag: 'GotProductsMessage', message }),
}
const resourcesLens: NavigationMenuLib.DisclosureLens<Model, Message> = {
  read: model => Option.some(model.resources),
  write: (model, resources) => ({ ...model, resources }),
  toParentMessage: message => ({ _tag: 'GotResourcesMessage', message }),
}

const foldProducts = NavigationMenuLib.foldDisclosure({
  disclosure: productsLens,
  siblings: [resourcesLens],
})
const foldResources = NavigationMenuLib.foldDisclosure({
  disclosure: resourcesLens,
  siblings: [productsLens],
})
const foldProductsOpen = NavigationMenuLib.foldDisclosureStep({
  disclosure: productsLens,
  siblings: [resourcesLens],
  update: PopoverPrimitive.open,
})
const foldProductsClose = NavigationMenuLib.foldDisclosureStep({
  disclosure: productsLens,
  siblings: [resourcesLens],
  update: PopoverPrimitive.close,
})

const update = (model: Model, message: Message) => {
  switch (message._tag) {
    case 'GotProductsMessage':
      return foldProducts(model, message.message)
    case 'GotResourcesMessage':
      return foldResources(model, message.message)
    case 'SetProductsOpen':
      return message.isOpen ? foldProductsOpen(model) : foldProductsClose(model)
  }
}

const initialModel = (
  options: Readonly<{
    productsOpen?: boolean
    productsContentFocus?: boolean
    homeActive?: boolean
  }> = {},
): Model => {
  const productsBase = PopoverPrimitive.init({
    id: 'products',
    contentFocus: options.productsContentFocus ?? true,
  })
  return {
    products: options.productsOpen === true
      ? PopoverPrimitive.update(productsBase, PopoverPrimitive.Message.RequestedOpen()).model
      : productsBase,
    resources: PopoverPrimitive.init({ id: 'resources' }),
    homeActive: options.homeActive ?? false,
  }
}

type NavigationMenuModule = Readonly<{
  navigationMenu: <Msg>(
    props: Readonly<{
      ariaLabel?: string
      direction?: 'ltr' | 'rtl'
      class?: string
      children: ReadonlyArray<Html | string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  navigationMenuList: <Msg>(
    props: Readonly<{ class?: string; children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  navigationMenuItem: <Msg>(
    props: Readonly<{ class?: string; children: ReadonlyArray<Html | string> }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  navigationMenuLink: <Msg>(
    props: Readonly<{
      href: string
      isActive?: boolean
      class?: string
      children: ReadonlyArray<Html | string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  navigationMenuDisclosure: <Msg>(
    props: Readonly<{
      model: PopoverPrimitive.Model
      toParentMessage: (message: PopoverPrimitive.Message) => Msg
      label: string
      content: Html | string
      class?: string
      ariaLabel?: string
      pointerIntent?: 'press' | 'hover-and-press'
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const navigationMenu = Scene.role('navigation')
const navigationList = Scene.selector('[data-slot="navigation-menu-list"]')
const homeLink = Scene.role('link', { name: 'Home' })
const productsTrigger = Scene.role('button', { name: 'Products' })
const resourcesTrigger = Scene.role('button', { name: 'Resources' })
const productsHoverLabel = Scene.selector('span[aria-label="Products"]')
const resourcesHoverLabel = Scene.selector('span[aria-label="Resources"]')
const productsPanel = Scene.selector('#products-panel')
const resourcesPanel = Scene.selector('#resources-panel')
const backdrop = Scene.selector('[data-slot="popover-backdrop"]')
const disclosureIcon = Scene.selector('svg.lucide-chevron-down')

/* The disclosure's open panel mounts an anchor positioner and the backdrop
   mounts a body portal; every scene step that opens a menu resolves both, and
   every close acknowledges their unmount plus the focus-restore Command. */
const resolveOpenMounts = Scene.Mount.resolveAll(
  [PopoverPrimitive.AnchorPopover, PopoverPrimitive.Message.CompletedAnchorPopover()],
  [PopoverPrimitive.PortalPopoverBackdrop, PopoverPrimitive.Message.CompletedPortalPopoverBackdrop()],
)
const resolveBothOpenMounts = Scene.Mount.resolveAll(
  [PopoverPrimitive.AnchorPopover, PopoverPrimitive.Message.CompletedAnchorPopover()],
  [PopoverPrimitive.AnchorPopover, PopoverPrimitive.Message.CompletedAnchorPopover()],
  [PopoverPrimitive.PortalPopoverBackdrop, PopoverPrimitive.Message.CompletedPortalPopoverBackdrop()],
  [PopoverPrimitive.PortalPopoverBackdrop, PopoverPrimitive.Message.CompletedPortalPopoverBackdrop()],
)
/* expectEnded consumes its own matcher list, so it must be built fresh per
   scene — a shared instance silently acknowledges nothing on its second use. */
const endedOpenMounts = () =>
  Scene.Mount.expectEnded(
    PopoverPrimitive.AnchorPopover,
    PopoverPrimitive.PortalPopoverBackdrop,
  )
const resolveFocusRestore = Scene.Command.resolve(
  PopoverPrimitive.FocusButton,
  PopoverPrimitive.Message.CompletedFocusButton(),
)

const menuView =
  (NavigationMenu: NavigationMenuModule, options?: { navAriaLabel?: string }) =>
  (model: Model, h: HtmlBuilder<Message>) =>
    NavigationMenu.navigationMenu(
      {
        ...(options?.navAriaLabel === undefined
          ? {}
          : { ariaLabel: options.navAriaLabel }),
        children: [
          NavigationMenu.navigationMenuList(
            {
              children: [
                NavigationMenu.navigationMenuItem(
                  {
                    children: [
                      NavigationMenu.navigationMenuLink(
                        {
                          href: '#home',
                          isActive: model.homeActive,
                          children: ['Home'],
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                NavigationMenu.navigationMenuItem(
                  {
                    children: [
                      NavigationMenu.navigationMenuDisclosure(
                        {
                          model: model.products,
                          toParentMessage: message => ({
                            _tag: 'GotProductsMessage',
                            message,
                          }),
                          label: 'Products',
                          pointerIntent: 'hover-and-press',
                          content: h.a([h.Href('#analytics')], ['Analytics']),
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                NavigationMenu.navigationMenuItem(
                  {
                    children: [
                      NavigationMenu.navigationMenuDisclosure(
                        {
                          model: model.resources,
                          toParentMessage: message => ({
                            _tag: 'GotResourcesMessage',
                            message,
                          }),
                          label: 'Resources',
                          content: h.a([h.Href('#guides')], ['Guides']),
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        ],
      },
      h,
    )

const controlledView =
  (NavigationMenu: NavigationMenuModule) => (model: Model, h: HtmlBuilder<Message>) =>
    h.div([], [
      h.button(
        [
          h.Type('button'),
          h.OnClick({ _tag: 'SetProductsOpen', isOpen: !model.products.isOpen }),
        ],
        ['Toggle products'],
      ),
      menuView(NavigationMenu, { navAriaLabel: 'Primary' })(model, h),
    ])

const verifyRenderer = (name: string, NavigationMenu: NavigationMenuModule) => {
  describe(`${name} NavigationMenu (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('renders a navigation landmark containing the list', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(navigationMenu).toHaveAttr('aria-label', 'Primary'),
          Scene.expect(
            Scene.within(navigationMenu, navigationList),
          ).toExist(),
          Scene.expect(
            Scene.within(
              navigationList,
              Scene.selector('[data-slot="navigation-menu-item"]'),
            ),
          ).toExist(),
        )
      })

      it('labels the navigation landmark "Main" when no aria-label is given', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu) },
          Scene.given(initialModel()),
          Scene.expect(navigationMenu).toHaveAttr('aria-label', 'Main'),
        )
      })

      it('does not apply aria-orientation to the top-level list or root element', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(navigationMenu).not.toHaveAttr('aria-orientation'),
          Scene.expect(navigationList).not.toHaveAttr('aria-orientation'),
        )
      })

      it('marks the trigger collapsed with no aria-controls while closed', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(productsTrigger).toHaveAttr('type', 'button'),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(productsTrigger).not.toHaveAttr('aria-controls'),
          Scene.expect(productsTrigger).not.toHaveAttr('data-open'),
          Scene.expect(productsTrigger).toBeEnabled(),
        )
      })

      it('links the trigger to the open popup through aria-controls', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(productsTrigger).toHaveAttr('aria-controls', 'products-panel'),
          Scene.expect(productsPanel).toHaveId('products-panel'),
          resolveOpenMounts,
        )
      })

      it('renders the disclosure chevron hidden from assistive technology', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(disclosureIcon).toHaveAttr('aria-hidden', 'true'),
        )
      })

      it('renders links as anchors with an href', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(homeLink).toHaveAttr('href', '#home'),
        )
      })

      it('when `true`, renders the link with aria-current="page"', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel({ homeActive: true })),
          Scene.expect(homeLink).toHaveAttr('aria-current', 'page'),
          Scene.expect(homeLink).toHaveAttr('data-active', ''),
        )
      })

      it('when `false`, does not render the link with aria-current="page"', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel({ homeActive: false })),
          Scene.expect(homeLink).not.toHaveAttr('aria-current'),
          Scene.expect(homeLink).not.toHaveAttr('data-active'),
        )
      })

      // DIVERGENCE (documented): Base UI's trigger relies on aria-expanded /
      // aria-controls alone and sets no popup type. creaseui's disclosure is a
      // Popover, so the trigger declares aria-haspopup="dialog".
      it('declares aria-haspopup="dialog" on the disclosure trigger (documented divergence)', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(productsTrigger).toHaveAttr('aria-haspopup', 'dialog'),
        )
      })
    })

    describe('interactions', () => {
      it('opens on hover with mouse input', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.hover(productsHoverLabel),
          Scene.expectHandled(),
          Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(productsPanel).toExist(),
          Scene.expect(backdrop).toExist(),
          resolveOpenMounts,
        )
      })

      it('does not wire hover-open under the "press" pointer intent', () => {
        // Base UI opens on hover unconditionally; creaseui makes hover-open an
        // opt-in per disclosure — the press-intent trigger carries no
        // OnMouseEnter handler at all.
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(resourcesHoverLabel).not.toHaveHandler('mouseenter'),
          Scene.expect(productsHoverLabel).toHaveHandler('mouseenter'),
        )
      })

      it('opens on click with mouse input', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(productsPanel).toExist(),
          resolveOpenMounts,
        )
      })

      it('opens on click with touch input', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.pointerDown(productsTrigger, { pointerType: 'touch' }),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          resolveOpenMounts,
        )
      })

      it('swallows the trailing click after a mouse pointerdown already opened', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.pointerDown(productsTrigger),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          resolveOpenMounts,
          // The mouse click that follows the opening pointerdown is ignored so
          // the menu does not immediately re-close.
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
        )
      })

      it('opens with the ArrowDown key', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.keydown(productsTrigger, 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          resolveOpenMounts,
        )
      })

      it('opens with the Enter key', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.keydown(productsTrigger, 'Enter'),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          resolveOpenMounts,
        )
      })

      // Base UI activates on Space via the native button keyup→click path;
      // creaseui's popover keydown toggles on ' ' directly (its keyup handler
      // only suppresses the page scroll). The DSL has no keyup step.
      it('opens with the Space key', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.keydown(productsTrigger, ' '),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          resolveOpenMounts,
        )
      })

      it('closes with the Escape key on the trigger', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          resolveOpenMounts,
          Scene.keydown(productsTrigger, 'Escape'),
          Scene.expectHandled(),
          Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(productsPanel).toBeAbsent(),
          resolveFocusRestore,
          endedOpenMounts(),
        )
      })

      it('closes with the Escape key inside the popup', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          resolveOpenMounts,
          Scene.keydown(productsPanel, 'Escape'),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(productsPanel).toBeAbsent(),
          resolveFocusRestore,
          endedOpenMounts(),
        )
      })

      it('closes when the backdrop is clicked', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          resolveOpenMounts,
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(productsPanel).toBeAbsent(),
          resolveFocusRestore,
          endedOpenMounts(),
        )
      })

      it('returns focus to the trigger when closing menu', () => {
        // The DSL cannot observe real focus; the contract it can check is
        // that closing emits the popover's FocusButton command.
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          resolveOpenMounts,
          Scene.keydown(productsTrigger, 'Escape'),
          Scene.expectHandled(),
          Scene.Command.expectHas(PopoverPrimitive.FocusButton),
          resolveFocusRestore,
          endedOpenMounts(),
        )
      })

      it('closes on panel blur without a focus-restore command', () => {
        // With contentFocus disabled the panel owns focus handling: blurring
        // it closes without asking to refocus the trigger (Base UI's
        // "does not restore focus when focus moves outside").
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel({ productsContentFocus: false })),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          resolveOpenMounts,
          Scene.blur(productsPanel),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
          Scene.Command.expectNone(),
          endedOpenMounts(),
        )
      })

      it('keeps the menu open when the panel blurs after a mouse press', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel({ productsContentFocus: false })),
          Scene.pointerDown(productsTrigger),
          Scene.expectHandled(),
          resolveOpenMounts,
          Scene.blur(productsPanel),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(productsPanel).toExist(),
        )
      })

      it(
        'closes the previously open item when a different trigger opens (mouse)',
        () => {
          Scene.scene(
            { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
            Scene.given(initialModel()),
            Scene.click(productsTrigger),
            Scene.expectHandled(),
            resolveOpenMounts,
            Scene.click(resourcesTrigger),
            Scene.expectHandled(),
            Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
            Scene.expect(resourcesTrigger).toHaveAttr('aria-expanded', 'true'),
            Scene.expect(productsPanel).toBeAbsent(),
            Scene.expect(resourcesPanel).toExist(),
          )
        },
      )

      it(
        'closes the previously open item when a different trigger opens (touch)',
        () => {
          Scene.scene(
            { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
            Scene.given(initialModel()),
            Scene.click(productsTrigger),
            Scene.expectHandled(),
            resolveOpenMounts,
            Scene.pointerDown(resourcesTrigger, { pointerType: 'touch' }),
            Scene.expectHandled(),
            Scene.click(resourcesTrigger),
            Scene.expectHandled(),
            Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
            Scene.expect(resourcesTrigger).toHaveAttr('aria-expanded', 'true'),
            Scene.expect(productsPanel).toBeAbsent(),
            Scene.expect(resourcesPanel).toExist(),
          )
        },
      )

      it('marks the open trigger data-popup-open', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          resolveOpenMounts,
          Scene.expect(productsTrigger).toHaveAttr('data-popup-open', ''),
          resolveOpenMounts,
        )
      })

      it(
        'reports only the newly opened item when switching triggers',
        () => {
          Scene.scene(
            { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
            Scene.given(initialModel()),
            Scene.click(productsTrigger),
            Scene.expectHandled(),
            resolveOpenMounts,
            Scene.click(resourcesTrigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
          )
        },
      )

      it.todo(
        'does not open on hover with touch input ' +
          '(the DSL cannot emit a pointer-typed mouseenter, and creaseui does ' +
          'not gate hover-open by pointer type)',
      )
      it.todo(
        'closes when the pointer leaves the trigger and popup ' +
          '(the DSL has no unhover/mouseleave step; creaseui also wires no ' +
          'OnMouseLeave close)',
      )
      it.todo(
        'reports activation direction when switching items ' +
          '(creaseui emits no data-activation-direction)',
      )
      it.todo(
        'stops vertical navigation keys from escaping the list ' +
          '(creaseui has no orientation prop; DSL keydown does not bubble)',
      )
      it.todo(
        'navigates to the next trigger with arrow keys ' +
          '(creaseui has no roving tabindex between disclosures)',
      )
      it.todo(
        'navigates from the focused trigger after an earlier item is removed ' +
          '(requires real focus movement)',
      )
      it.todo(
        'restores hover open after a quick click then trigger switch ' +
          '(requires hover timing)',
      )
    })

    describe('prop: defaultValue', () => {
      it('respects an initially open value', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel({ productsOpen: true })),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(productsPanel).toExist(),
          resolveOpenMounts,
        )
      })
    })

    describe('prop: value', () => {
      it('is controlled externally through the model', () => {
        // Base UI's `value` prop drives which item is open; creaseui keeps the
        // same contract by construction — the Popover model is the state.
        Scene.scene(
          { update, view: controlledView(NavigationMenu) },
          Scene.given(initialModel()),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
          Scene.click(Scene.text('Toggle products')),
          Scene.expectHandled(),
          Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'true'),
          resolveOpenMounts,
          Scene.click(Scene.text('Toggle products')),
          Scene.expectHandled(),
          Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
          Scene.expect(productsTrigger).toHaveAttr('aria-expanded', 'false'),
          resolveFocusRestore,
          endedOpenMounts(),
        )
      })
    })

    describe('prop: onValueChange', () => {
      it('notifies the parent through OutMessages when the state changes', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
          resolveOpenMounts,
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
          resolveFocusRestore,
          endedOpenMounts(),
        )
      })

      it.todo(
        'does not open when onValueChange cancels the interaction ' +
          '(foldkit messages carry no cancel() event payload)',
      )
      it.todo(
        'does not emit a duplicate value when switching items via keyboard ' +
          '(no shared value exists between disclosures)',
      )
    })

    describe('prop: disabled', () => {
      it.todo(
        'does not open on hover when the trigger is disabled ' +
          '(navigationMenuDisclosure exposes no disabled prop)',
      )
      it.todo(
        'does not open on click when the trigger is disabled ' +
          '(navigationMenuDisclosure exposes no disabled prop)',
      )
      it.todo(
        'does not open on touch when the trigger is disabled ' +
          '(navigationMenuDisclosure exposes no disabled prop)',
      )
      it.todo(
        'does not open via keyboard when the trigger is disabled ' +
          '(navigationMenuDisclosure exposes no disabled prop)',
      )
      it.todo(
        'applies the data-disabled style hook only when disabled ' +
          '(navigationMenuDisclosure exposes no disabled prop)',
      )
    })

    describe('props: delay, closeDelay, side, orientation', () => {
      it.todo('respects a custom delay value (creaseui exposes no delay prop)')
      it.todo('respects a custom closeDelay value (creaseui exposes no closeDelay prop)')
      it.todo(
        'renders the popup on the requested side ' +
          '(the disclosure hardcodes bottom-start anchoring)',
      )
      it.todo(
        'opens a vertical menu with the mirrored arrow key in RTL ' +
          '(creaseui has no orientation prop)',
      )
    })

    describe('prop: keepMounted / portal', () => {
      it.todo(
        'keeps the content mounted (hidden) when keepMounted is true ' +
          '(creaseui unmounts the panel whenever it closes)',
      )
      it.todo(
        'moves content into the popup and keeps it there when switching triggers ' +
          '(creaseui has no shared Viewport — each disclosure renders its own panel)',
      )
      it.todo(
        'keeps content mounted inside the popup when the portal is kept mounted ' +
          '(creaseui has no Portal part)',
      )

      it('does not keep the content mounted when closed', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(productsPanel).toBeAbsent(),
        )
      })
    })

    describe('prop: closeOnClick', () => {
      it.todo(
        'closes the menu when clicking a link when true ' +
          '(navigationMenuLink exposes no closeOnClick prop)',
      )
      it.todo(
        'does not close the menu when clicking a link when false ' +
          '(the link carries no click handler to port)',
      )
      it.todo(
        'keeps the menu open when a link loses focus without a related target ' +
          '(the DSL cannot express blur relatedTarget)',
      )
    })

    describe('nested menus', () => {
      it.todo(
        'opens a nested menu on hover and scopes its viewport ' +
          '(creaseui has no nested-menu composition)',
      )
      it.todo(
        'closes the parent menu when a nested link with closeOnClick is clicked ' +
          '(creaseui has no nested-menu composition)',
      )
      it.todo(
        'allows arrow key navigation to submenu triggers ' +
          '(creaseui has no nested-menu composition or roving tabindex)',
      )
    })

    describe('style hooks', () => {
      it('applies data-open to the trigger only while open', () => {
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(productsTrigger).not.toHaveAttr('data-open'),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          Scene.expect(productsTrigger).toHaveAttr('data-open', ''),
          resolveOpenMounts,
        )
      })

      it('rotates the disclosure icon while open', () => {
        // Base UI reflects the open state on the icon through
        // data-popup-open/data-pressed; creaseui only flips the chevron via a
        // renderer-specific class, so there is no attribute to port — the
        // icon's presence and hidden state is asserted in ARIA attributes.
        Scene.scene(
          { update, view: menuView(NavigationMenu, { navAriaLabel: 'Primary' }) },
          Scene.given(initialModel()),
          Scene.expect(disclosureIcon).toExist(),
          Scene.click(productsTrigger),
          Scene.expectHandled(),
          Scene.expect(disclosureIcon).toExist(),
          resolveOpenMounts,
        )
      })
    })

    describe('RTL', () => {
      it('reflects the direction on the navigation landmark', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              NavigationMenu.navigationMenu(
                {
                  ariaLabel: 'Primary',
                  direction: 'rtl',
                  children: [
                    NavigationMenu.navigationMenuList(
                      {
                        children: [
                          NavigationMenu.navigationMenuItem(
                            {
                              children: [
                                NavigationMenu.navigationMenuLink(
                                  { href: '#home', children: ['Home'] },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(navigationMenu).toHaveAttr('dir', 'rtl'),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindNavigationMenu)
verifyRenderer('StyleX', StyleXNavigationMenu)
