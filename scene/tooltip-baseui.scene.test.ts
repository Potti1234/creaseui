import { Command } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import { Tooltip as TooltipPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import * as TooltipBehavior from '@/lib/tooltip'
import * as StyleXTooltip from '@/stylex/tooltip'
import * as TailwindTooltip from '@/ui/tooltip'

/**
 * Behavioral parity suite ported from Base UI's tooltip tests
 * (base-ui/packages/react/src/tooltip/, checked at base-ui HEAD):
 * root/TooltipRoot.test.tsx, trigger/, popup/, arrow/, portal/,
 * provider/, positioner/, viewport/, and root's detached-triggers file.
 *
 * Delays: Base UI waits on real timers; the scene DSL dispatches the delay
 * as a Command the test resolves explicitly — the wiring (which delay, which
 * version) is asserted here while wall-clock timing stays e2e-only.
 *
 * Cases with no creaseui analogue are listed here instead of dropped:
 *  - React internals: describeConformance, ref callbacks, StrictMode,
 *    render-prop element substitution, error boundaries ("throws outside
 *    Root/Positioner/Portal"), actionsRef, custom trigger elements with
 *    their own id (creaseui renders its own button/span around `trigger`
 *    content).
 *  - Enter/exit animation callbacks, `data-instant` marking, and
 *    preventUnmountOnClose (no animation or imperative close-cancel hooks).
 *  - BaseUIChangeEventDetails: cancel(), allowPropagation(), and reason
 *    payloads on onOpenChange (foldkit components dispatch plain messages;
 *    the ShownTooltip/HiddenTooltip OutMessages are asserted instead).
 *  - Tooltip.Provider delay/timeout group coordination (no provider concept;
 *    delays live on the model — reflectShowDelay/reflectCloseDelay are
 *    model-level mirrors, not view wiring).
 *  - Tooltip.Positioner + Tooltip.Viewport suites (placement, flipping,
 *    side-offset — runtime layout produced by the foldkit anchor Mount, not
 *    the vnode tree).
 *  - Detached-triggers suite, TooltipHandle, the payload prop, and the
 *    nested-tooltips describe block (creaseui renders exactly one inline
 *    trigger + panel per call; there is no multi-trigger or nesting
 *    machinery).
 *  - "trigger unmount during the open delay" (React lifecycle; trigger and
 *    panel share one vnode tree — they unmount together).
 *  - Stale show/close version invalidation under a pending Command — the
 *    DSL forbids message-producing steps while a Command is pending, so a
 *    second interaction can never race one. Covered at model level in
 *    test/tooltip.test.ts.
 *  - mouseleave/unhover: the DSL has no unhover step, so
 *    LeftTooltipTrigger is fed through update via Subscription.emit.
 */

type Model = Readonly<{
  tip: TailwindTooltip.Model
  isDisabled: boolean
}>

type Message = Readonly<
  | { _tag: 'GotTooltip'; message: TailwindTooltip.Message }
  | { _tag: 'SetDisabled'; disabled: boolean }
>

const initialModel = (
  overrides?: Partial<TailwindTooltip.Model>,
  isDisabled = false,
): Model => ({
  tip: { ...TooltipBehavior.init({ id: 'tip' }), ...overrides },
  isDisabled,
})

const delayModel = (overrides?: Partial<TailwindTooltip.Model>): Model => ({
  tip: TooltipBehavior.init({
    id: 'tip',
    showDelay: '250 millis',
    closeDelay: '50 millis',
    ...overrides,
  }),
  isDisabled: false,
})

const leftTrigger = (): Message => ({
  _tag: 'GotTooltip',
  message: TooltipBehavior.Message.LeftTooltipTrigger(),
})

const update = (model: Model, message: Message) => {
  switch (message._tag) {
    case 'SetDisabled': {
      // The app's isDisabled flag and the tooltip's mirror message move
      // together — Base UI's disabled prop closes an open tooltip, so the
      // model hears about the transition here rather than in the view.
      const result = TooltipBehavior.update(
        model.tip,
        TooltipBehavior.Message.SetTooltipDisabled({
          disabled: message.disabled,
        }),
      )
      return {
        model: { ...model, isDisabled: message.disabled, tip: result.model },
        commands: Command.mapMessages(result.commands, child => ({
          _tag: 'GotTooltip' as const,
          message: child,
        })),
        ...(result.outMessage === undefined
          ? {}
          : { outMessage: result.outMessage }),
      }
    }
    case 'GotTooltip': {
      const result = TooltipBehavior.update(model.tip, message.message)
      return {
        model: { ...model, tip: result.model },
        commands: Command.mapMessages(result.commands, child => ({
          _tag: 'GotTooltip' as const,
          message: child,
        })),
        ...(result.outMessage === undefined
          ? {}
          : { outMessage: result.outMessage }),
      }
    }
  }
}

type TooltipModule = Readonly<{
  tooltip: <Msg>(
    props: Readonly<{
      model: TailwindTooltip.Model
      toParentMessage: (message: TailwindTooltip.Message) => Msg
      trigger: Html | string
      content: Html | string
      isDisabled?: boolean
      ariaLabel?: string
      showArrow?: boolean
      disableHoverablePopup?: boolean
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const tooltipView =
  (
    Tooltip: TooltipModule,
    options?: Readonly<{
      ariaLabel?: string
      showArrow?: boolean
      disableHoverablePopup?: boolean
    }>,
  ) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    Tooltip.tooltip(
      {
        model: model.tip,
        toParentMessage: message => ({ _tag: 'GotTooltip', message }),
        trigger: 'Toggle',
        content: 'Content',
        isDisabled: model.isDisabled,
        ...(options ?? {}),
      },
      h,
    )

const trigger = Scene.selector('#tip-trigger')
const panel = Scene.selector('#tip-panel')
const arrow = Scene.selector('[data-slot="tooltip-arrow"]')
const tooltipPopup = Scene.role('tooltip')
const toggleButton = Scene.role('button', { name: 'Toggle' })

// Mount.resolve feeds the message update would receive — the view's OnMount
// lift maps the anchor's raw result into GotTooltip — so the mount is matched
// by name and resolved with the lifted message.
const anchorMount = { name: TooltipPrimitive.AnchorTooltip.name }
const anchored = (): Message => ({
  _tag: 'GotTooltip',
  message: TooltipBehavior.Message.CompletedTooltipAnchor(),
})

const verifyRenderer = (name: string, Tooltip: TooltipModule) => {
  describe(`${name} Tooltip (Base UI port)`, () => {
    describe('uncontrolled open', () => {
      it('should open when the trigger is hovered', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.hover(trigger),
          Scene.expectHandled(),
          // The hover dispatches the show delay as a Command; the panel is
          // not mounted until the test resolves it.
          Scene.Command.expectExact(TooltipBehavior.WaitBeforeShowing),
          Scene.expect(panel).toBeAbsent(),
          Scene.expectNoOutMessage(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeShowing,
            TooltipBehavior.Message.CompletedWaitBeforeShowingTooltip({
              version: 1,
            }),
          ),
          Scene.expectOutMessage(TooltipBehavior.OutMessage.ShownTooltip()),
          Scene.expect(tooltipPopup).toExist(),
          Scene.expect(panel).toHaveAttr('data-open'),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })

      it.todo(
        'does not open when a touch pointer hovers the trigger — the hover ' +
          'step carries no pointer type, and creaseui opens on any hover ' +
          '(Base UI gates hover-open on mouse pointers only)',
      )

      it('should close when the trigger is unhovered', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.hover(trigger),
          Scene.expectHandled(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeShowing,
            TooltipBehavior.Message.CompletedWaitBeforeShowingTooltip({
              version: 1,
            }),
          ),
          Scene.Mount.resolve(anchorMount, anchored()),
          // No unhover step exists in the DSL — feed LeftTooltipTrigger
          // through update as a subscription-style message.
          Scene.Subscription.emit(leftTrigger()),
          // Leaving pends the close delay; the panel stays until it resolves.
          Scene.expectNoOutMessage(),
          Scene.expect(panel).toExist(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeClosing,
            TooltipBehavior.Message.CompletedWaitBeforeClosingTooltip({
              version: 2,
            }),
          ),
          Scene.expectOutMessage(TooltipBehavior.OutMessage.HiddenTooltip()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(anchorMount),
        )
      })

      it('should open when the trigger is focused', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          // Focus opens immediately — no delay Command is dispatched.
          Scene.Command.expectNone(),
          Scene.expect(tooltipPopup).toExist(),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })

      it('should close when the trigger is blurred', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.blur(trigger),
          Scene.expectHandled(),
          Scene.expect(panel).toExist(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeClosing,
            TooltipBehavior.Message.CompletedWaitBeforeClosingTooltip({
              version: 2,
            }),
          ),
          Scene.expectOutMessage(TooltipBehavior.OutMessage.HiddenTooltip()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(anchorMount),
        )
      })

      it('does not open when focus follows a pointer press', () => {
        // Base UI's useFocus excludes pointer-induced focus; creaseui tracks
        // it with pointerFocusVersion.
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.pointerDown(trigger),
          Scene.expectHandled(),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.expect(panel).toBeAbsent(),
          // A later keyboard-style focus still opens.
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.expect(tooltipPopup).toExist(),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })
    })

    describe('controlled open', () => {
      it('should call onOpenChange when the open state changes', () => {
        // creaseui has no callback prop — ShownTooltip/HiddenTooltip
        // OutMessages play the onOpenChange role.
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.hover(trigger),
          Scene.expectHandled(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeShowing,
            TooltipBehavior.Message.CompletedWaitBeforeShowingTooltip({
              version: 1,
            }),
          ),
          Scene.expectOutMessage(TooltipBehavior.OutMessage.ShownTooltip()),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.Subscription.emit(leftTrigger()),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeClosing,
            TooltipBehavior.Message.CompletedWaitBeforeClosingTooltip({
              version: 2,
            }),
          ),
          Scene.expectOutMessage(TooltipBehavior.OutMessage.HiddenTooltip()),
          Scene.Mount.expectEnded(anchorMount),
        )
      })

      it('should not call onOpenChange when the open state does not change', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.hover(trigger),
          Scene.expectHandled(),
          // Enter only pends the show Command — isOpen has not transitioned.
          Scene.expectNoOutMessage(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeShowing,
            TooltipBehavior.Message.CompletedWaitBeforeShowingTooltip({
              version: 1,
            }),
          ),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.Subscription.emit(leftTrigger()),
          // Leave only pends the close Command — still no transition.
          Scene.expectNoOutMessage(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeClosing,
            TooltipBehavior.Message.CompletedWaitBeforeClosingTooltip({
              version: 2,
            }),
          ),
          Scene.Mount.expectEnded(anchorMount),
        )
      })
    })

    describe('prop: defaultOpen', () => {
      it('should open when the component is rendered', () => {
        // creaseui has no defaultOpen prop — starting the model isOpen is
        // the analogue.
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel({ isOpen: true })),
          Scene.expect(tooltipPopup).toExist(),
          Scene.expect(panel).toHaveAttr('data-open'),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })

      it('should remain uncontrolled', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel({ isOpen: true })),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.Subscription.emit(leftTrigger()),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeClosing,
            TooltipBehavior.Message.CompletedWaitBeforeClosingTooltip({
              version: 1,
            }),
          ),
          Scene.expectOutMessage(TooltipBehavior.OutMessage.HiddenTooltip()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(anchorMount),
        )
      })

      it.todo(
        'distinguishes controlled open from defaultOpen — creaseui is ' +
          'always model-driven; there is no defaultOpen/open prop split',
      )
    })

    describe('prop: delay', () => {
      it('should open after the show delay completes', () => {
        // The configured delayMs rides on the dispatched Command; resolving
        // it models the timer elapsing (the wall-clock wait is e2e-only).
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(delayModel()),
          Scene.hover(trigger),
          Scene.expectHandled(),
          Scene.Command.expectExact({
            name: 'WaitBeforeShowingTooltip',
            args: { delayMs: 250, version: 1 },
          }),
          Scene.expect(panel).toBeAbsent(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeShowing,
            TooltipBehavior.Message.CompletedWaitBeforeShowingTooltip({
              version: 1,
            }),
          ),
          Scene.expect(tooltipPopup).toExist(),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })
    })

    describe('prop: closeDelay', () => {
      it('should close after the close delay completes', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(delayModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.blur(trigger),
          Scene.expectHandled(),
          Scene.Command.expectExact({
            name: 'WaitBeforeClosingTooltip',
            args: { delayMs: 50, version: 2 },
          }),
          // The panel stays mounted until the delay Command resolves.
          Scene.expect(panel).toExist(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeClosing,
            TooltipBehavior.Message.CompletedWaitBeforeClosingTooltip({
              version: 2,
            }),
          ),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(anchorMount),
        )
      })

      it.todo(
        'stays open when re-hovered while the close delay is pending — the ' +
          'DSL blocks message-producing steps while a Command is pending ' +
          '(stale-version invalidation is covered in test/tooltip.test.ts)',
      )
    })

    describe('prop: disabled', () => {
      // DIVERGENCE (intentional): Base UI suppresses the tooltip entirely
      // when disabled — no popup on hover or focus. creaseui's isDisabled
      // models the shadcn "disabled button" pattern: the trigger is inert
      // but the tooltip still opens on hover to explain why (asserted in
      // e2e/site.spec.ts).
      it('still opens on hover while the trigger is disabled', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel(undefined, true)),
          Scene.hover(trigger),
          Scene.expectHandled(),
          Scene.expect(toggleButton).toBeDisabled(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeShowing,
            TooltipBehavior.Message.CompletedWaitBeforeShowingTooltip({
              version: 1,
            }),
          ),
          Scene.expect(tooltipPopup).toExist(),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })

      it('does not open on focus when the trigger is disabled', () => {
        // Base UI keeps the disabled trigger focusable and suppresses the
        // open. creaseui goes further: the trigger is a real disabled button
        // wrapped in a span — no focus or key handlers exist at all.
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel(undefined, true)),
          Scene.expect(toggleButton).toBeDisabled(),
          Scene.expect(trigger).not.toHaveHandler('focus'),
          Scene.expect(trigger).not.toHaveHandler('keydown'),
          Scene.expect(panel).toBeAbsent(),
        )
      })

      // Base UI derives open as `openState && !disabled` and unmounts the
      // popup when `disabled` flips true; creaseui gates the panel on the
      // same effective-open in the view.
      it('should close if open when becoming disabled', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetDisabled', disabled: true }),
                  ],
                  ['Disable'],
                ),
                Tooltip.tooltip(
                  {
                    model: model.tip,
                    toParentMessage: message => ({
                      _tag: 'GotTooltip',
                      message,
                    }),
                    trigger: 'Toggle',
                    content: 'Content',
                    isDisabled: model.isDisabled,
                  },
                  h,
                ),
              ]),
          },
          Scene.given(initialModel({ isOpen: true })),
          Scene.expect(tooltipPopup).toExist(),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.click(Scene.text('Disable')),
          Scene.expectHandled(),
          Scene.expectOutMessage(TooltipBehavior.OutMessage.HiddenTooltip()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(anchorMount),
        )
      })

      // DIVERGENCE (intentional): Base UI renders nothing for disabled +
      // defaultOpen (the popup is suppressed entirely). creaseui renders the
      // panel whenever the model is open — isDisabled is trigger-only.
      it('renders the popup when combined with defaultOpen', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel({ isOpen: true }, true)),
          Scene.expect(tooltipPopup).toExist(),
          Scene.expect(toggleButton).toBeDisabled(),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })

      // DIVERGENCE (intentional): Base UI marks the trigger
      // data-trigger-disabled and keeps it enabled and focusable. creaseui
      // puts a real `disabled` attribute on the button and moves the hover
      // handlers to a wrapping span.
      it('marks the trigger as disabled when the root is disabled', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel(undefined, true)),
          Scene.expect(toggleButton).toBeDisabled(),
          Scene.expect(toggleButton).not.toHaveAttr('data-trigger-disabled'),
          Scene.expect(trigger).toHaveAttr('data-slot', 'tooltip-trigger'),
        )
      })

      it.todo(
        'keeps the tooltip disabled when the root is disabled and the ' +
          'trigger opts back in — creaseui has a single isDisabled flag, no ' +
          'root/trigger prop split',
      )
    })

    describe('prop: disableHoverablePopup', () => {
      it('applies pointer-events: none to the positioner when `disableHoverablePopup = true`', () => {
        // creaseui's panel is the merged positioner+popup element; the prop
        // opts the panel into the inert style.
        Scene.scene(
          {
            update,
            view: tooltipView(Tooltip, { disableHoverablePopup: true }),
          },
          Scene.given(initialModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.expect(panel).toHaveStyle('pointer-events', 'none'),
        )
      })

      it('does not apply pointer-events: none to the positioner when `disableHoverablePopup = false`', () => {
        // The default leaves the panel free of the inert style.
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.expect(panel).not.toHaveStyle('pointer-events', 'none'),
        )
      })
    })

    describe('dismissal', () => {
      it('should close when Escape is pressed', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.keydown(trigger, 'Escape'),
          Scene.expectHandled(),
          Scene.expectOutMessage(TooltipBehavior.OutMessage.HiddenTooltip()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(anchorMount),
        )
      })

      it('ignores Escape while closed', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.keydown(trigger, 'Escape'),
          Scene.expectIgnored(),
          Scene.expect(panel).toBeAbsent(),
        )
      })

      it('suppresses re-open while dismissed until focus and pointer disengage', () => {
        // Base UI re-opens on the next hover/focus after an Escape close.
        // creaseui keeps the tooltip dismissed until the trigger is neither
        // hovered nor focused — this asserts that full lifecycle.
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.hover(trigger),
          Scene.expectHandled(),
          Scene.Command.resolve(
            TooltipBehavior.WaitBeforeShowing,
            TooltipBehavior.Message.CompletedWaitBeforeShowingTooltip({
              version: 1,
            }),
          ),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.keydown(trigger, 'Escape'),
          Scene.expectHandled(),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(anchorMount),
          // Focus is still held, so the dismissal survives the pointer
          // leaving and coming back.
          Scene.Subscription.emit(leftTrigger()),
          Scene.hover(trigger),
          Scene.expectHandled(),
          Scene.Command.expectNone(),
          Scene.expect(panel).toBeAbsent(),
          Scene.Subscription.emit(leftTrigger()),
          // With the pointer gone, blurring clears the dismissal.
          Scene.blur(trigger),
          Scene.expectHandled(),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.expect(tooltipPopup).toExist(),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })

      it('should close when the trigger is clicked after delay duration', () => {
        // Base UI's useDismiss referencePress (gated on closeOnClick, default
        // true) closes on pointerdown; creaseui's pointerdown now does the
        // same while open — it remains the pointer-focus marker too.
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Mount.resolve(anchorMount, anchored()),
          // creaseui wires no click handler; pointerdown is its press path.
          Scene.pointerDown(trigger),
          Scene.expectHandled(),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(anchorMount),
        )
      })

      it.todo(
        'should not open when the trigger was clicked before delay ' +
          'duration — the DSL forbids message-producing steps while a ' +
          'Command is pending, and creaseui has no pending-open ' +
          'cancellation',
      )

      it.todo(
        'should not open when the trigger receives pointerdown before ' +
          'delay duration — same DSL boundary and missing pending-open ' +
          'cancellation',
      )

      it.todo(
        'should open when the trigger was clicked before delay duration ' +
          'and closeOnClick is false — creaseui has no closeOnClick prop',
      )

      it.todo(
        'should not close when the trigger is clicked after delay ' +
          'duration and closeOnClick is false — creaseui has no ' +
          'closeOnClick prop',
      )

      it.todo(
        'reopens on hover after the trigger is clicked closed — depends ' +
          'on close-on-click, which creaseui lacks',
      )
    })

    describe('ARIA attributes', () => {
      // DIVERGENCE (documented): Base UI deliberately emits neither
      // role="tooltip" on the popup nor aria-describedby on the trigger —
      // tooltips are visual-only there and the trigger must carry an
      // aria-label. creaseui follows the Radix/shadcn wiring: role=tooltip
      // plus an always-on aria-describedby.
      it('links the trigger to the popup via aria-describedby and role=tooltip', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.expect(trigger).toHaveAttr('aria-describedby', 'tip-panel'),
          Scene.expect(trigger).toHaveAccessibleDescription('Content'),
          Scene.expect(tooltipPopup).toExist(),
          Scene.expect(panel).toHaveAttr('data-slot', 'tooltip-content'),
        )
      })

      // DIVERGENCE (documented): the attribute points at a panel that only
      // mounts while open — dangling while closed.
      it('keeps a dangling aria-describedby while closed', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.expect(trigger).toHaveAttr('aria-describedby', 'tip-panel'),
          Scene.expect(panel).toBeAbsent(),
        )
      })

      it('forwards aria-label to the trigger', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip, { ariaLabel: 'Toggle action' }) },
          Scene.given(initialModel()),
          Scene.expect(trigger).toHaveAccessibleName('Toggle action'),
        )
      })
    })

    describe('<Tooltip.Trigger />', () => {
      it('marks the trigger data-popup-open while open', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.expect(trigger).toHaveAttr('data-popup-open'),
        )
      })
    })

    describe('<Tooltip.Popup />', () => {
      it('should render the children', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel({ isOpen: true })),
          Scene.expect(panel).toContainText('Content'),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })
    })

    describe('<Tooltip.Arrow />', () => {
      it('is hidden from assistive technology', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel({ isOpen: true })),
          Scene.expect(arrow).toHaveAttr('aria-hidden', 'true'),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })

      // The arrow mirrors the configured side at vnode level; a runtime
      // flip by the anchor still reports through the panel's data-placement.
      it('mirrors the resolved side', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel({ isOpen: true })),
          Scene.Mount.resolve(anchorMount, anchored()),
          Scene.expect(arrow).toHaveAttr('data-side'),
        )
      })

      it('omits the arrow when showArrow is false', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip, { showArrow: false }) },
          Scene.given(initialModel({ isOpen: true })),
          Scene.expect(arrow).toBeAbsent(),
          Scene.Mount.resolve(anchorMount, anchored()),
        )
      })
    })

    describe('<Tooltip.Portal />', () => {
      it('unmounts the closed popup by default', () => {
        Scene.scene(
          { update, view: tooltipView(Tooltip) },
          Scene.given(initialModel()),
          Scene.expect(panel).toBeAbsent(),
        )
      })

      it.todo(
        'renders the closed popup as hidden instead of unmounting it ' +
          '(keepMounted) — creaseui mounts the panel only while the model ' +
          'is open',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindTooltip)
verifyRenderer('StyleX', StyleXTooltip)
