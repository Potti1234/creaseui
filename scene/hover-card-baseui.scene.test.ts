import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as HoverCardBehavior from '@/lib/hover-card'
import * as StyleXHoverCard from '@/stylex/hover-card'
import * as TailwindHoverCard from '@/ui/hover-card'

/**
 * Behavioral parity suite ported from Base UI's preview-card tests
 * (base-ui/packages/react/src/preview-card/**\/*.test.tsx, checked at
 * base-ui HEAD). Base UI runs each root case under contained, detached, and
 * multiple-detached trigger variants; creaseui models a single contained
 * trigger, so each case runs once.
 *
 * DSL notes:
 * - The delay timers are Commands. `Scene.Command.resolve` fires the pending
 *   wait's completion Message, standing in for `tick(OPEN_DELAY)` /
 *   `tick(CLOSE_DELAY)`. The version is read off the pending command's args.
 * - The DSL has no mouseleave step, so `LeftHoverCard` is delivered through
 *   `Scene.Subscription.emit` — the message's real cause is pointer leaving
 *   the card region, which the DSL cannot reach.
 * - The content's HoverCardAnchor mount is resolved with the parent-level
 *   `CompletedHoverCardAnchor`, matching what `Mount.mapMessage` dispatches.
 *
 * Cases with no creaseui analogue (recorded here, not dropped):
 * - describeConformance blocks on every part (React ref/render-prop internals;
 *   foldkit fixes the element) and the "throws outside <Root>/<Portal>/
 *   <Positioner>" context errors.
 * - PreviewCard.Root.detached-triggers: the whole handle/imperative-open
 *   surface, multiple triggers per root, and per-trigger `payload` — creaseui
 *   has exactly one trigger and no handle API.
 * - `BaseUIChangeEventDetails` cancel() / preventUnmountOnClose() and the
 *   `actionsRef` imperative handle (event payloads and refs).
 * - `onOpenChangeComplete` and all Popup-conformance animation cases
 *   (animation lifecycle doesn't exist in the vnode DSL).
 * - Positioner geometry, multiline inline-rect anchoring, and scroll cases
 *   (real layout; e2e only).
 * - Portal, Backdrop, Arrow, and Viewport parts — creaseui has no matching
 *   elements (content renders inline in the card root, not portaled).
 * - Focus-visible vs. mouse-press focus distinction: creaseui opens on any
 *   `focus` event and has no maybeLastPointerType suppression.
 */

type Model = HoverCardBehavior.Model
type Message = HoverCardBehavior.Message

const update = HoverCardBehavior.update
const init = (overrides?: Partial<Model>): Model => ({
  ...HoverCardBehavior.init({ id: 'hc' }),
  ...overrides,
})

const card = Scene.selector('[data-slot="hover-card"]')
const trigger = Scene.selector('#hc-trigger')
const panel = Scene.selector('#hc-content')
const anchorMount = { name: 'HoverCardAnchor' }

const pendingWaitVersion = (
  commands: ReadonlyArray<
    Readonly<{ name: string; args?: Record<string, unknown> }>
  >,
  name: string,
): number => {
  const pending = commands.find(command => command.name === name)
  const version = pending?.args?.['version']
  if (typeof version !== 'number') {
    throw new Error(`Expected a pending ${name} command, found none.`)
  }
  return version
}

// Fires the pending show delay, the way tick(OPEN_DELAY) + flush would.
const showTimerFires = (simulation: Scene.SceneSimulation<Model, Message>) =>
  Scene.Command.resolve(
    HoverCardBehavior.WaitBeforeShowing,
    HoverCardBehavior.Message.CompletedWaitBeforeShowingHoverCard({
      version: pendingWaitVersion(
        simulation.commands,
        'WaitBeforeShowingHoverCard',
      ),
    }),
  )(simulation)

// Fires the pending close delay, the way tick(CLOSE_DELAY) + flush would.
const closeTimerFires = (simulation: Scene.SceneSimulation<Model, Message>) =>
  Scene.Command.resolve(
    HoverCardBehavior.WaitBeforeClosing,
    HoverCardBehavior.Message.CompletedWaitBeforeClosingHoverCard({
      version: pendingWaitVersion(
        simulation.commands,
        'WaitBeforeClosingHoverCard',
      ),
    }),
  )(simulation)

const anchorResolved = () =>
  Scene.Mount.resolve(
    anchorMount,
    HoverCardBehavior.Message.CompletedHoverCardAnchor(),
  )

const anchorEnded = () => Scene.Mount.expectEnded(anchorMount)

type HoverCardModule = Readonly<{
  hoverCard: <Msg>(
    props: Readonly<{
      model: Model
      toParentMessage: (message: Message) => Msg
      trigger: Html | string
      content: Html | string
      align?: 'start' | 'center' | 'end'
      side?: 'top' | 'right' | 'bottom' | 'left'
      isDisabled?: boolean
      ariaLabel?: string
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const cardView =
  (HoverCard: HoverCardModule, props?: Readonly<{ ariaLabel?: string }>) =>
  (model: Model, h: HtmlBuilder<Message>) =>
    HoverCard.hoverCard(
      {
        model,
        toParentMessage: message => message,
        trigger: 'Link',
        content: 'Content',
        ...(props === undefined ? {} : props),
      },
      h,
    )

const verifyRenderer = (name: string, HoverCard: HoverCardModule) => {
  const view = cardView(HoverCard)

  describe(`${name} HoverCard (Base UI port)`, () => {
    describe('uncontrolled open', () => {
      it('should open when the trigger is hovered', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.expect(panel).toBeAbsent(),
          Scene.hover(card),
          Scene.expectHandled(),
          Scene.Command.expectHas(HoverCardBehavior.WaitBeforeShowing),
          showTimerFires,
          Scene.expect(panel).toExist(),
          anchorResolved(),
        )
      })

      it('should close when the trigger is unhovered', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.hover(card),
          showTimerFires,
          anchorResolved(),
          Scene.expect(panel).toExist(),
          // DSL has no mouseleave step — emit the leave Message.
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          Scene.Command.expectHas(HoverCardBehavior.WaitBeforeClosing),
          closeTimerFires,
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })

      // DIVERGENCE (timing): Base UI opens on focus after the same delay prop
      // as hover; creaseui opens immediately on focus (no WaitBeforeShowing
      // command). Final state matches — only the delay is skipped.
      it('should open when the trigger is focused', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.expect(panel).toBeAbsent(),
          Scene.focus(trigger),
          Scene.expectHandled(),
          Scene.Command.expectNone(),
          Scene.expect(panel).toExist(),
          anchorResolved(),
        )
      })

      it('should close when the trigger is blurred', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.focus(trigger),
          Scene.expectHandled(),
          anchorResolved(),
          Scene.expect(panel).toExist(),
          Scene.blur(trigger),
          Scene.expectHandled(),
          Scene.Command.expectHas(HoverCardBehavior.WaitBeforeClosing),
          closeTimerFires,
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })
    })

    describe('prop: onOpenChange', () => {
      it('should call onOpenChange when the open state changes', () => {
        // foldkit surfaces state changes as dispatched Messages; each
        // interaction produces exactly one — the onOpenChange analogue.
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.hover(card),
          Scene.expectHandled(),
          showTimerFires,
          anchorResolved(),
          Scene.expect(panel).toExist(),
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          closeTimerFires,
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })

      it('closes after hovering out of a popup opened by its trigger', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.hover(card),
          showTimerFires,
          anchorResolved(),
          Scene.expect(panel).toExist(),
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          closeTimerFires,
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })

      it('should not schedule a second open wait when re-hovered while open', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.hover(card),
          showTimerFires,
          anchorResolved(),
          Scene.hover(card),
          Scene.expectHandled(),
          // Already open: the re-enter bumps versions but issues no Command.
          Scene.Command.expectNone(),
          Scene.expect(panel).toExist(),
        )
      })

      // DIVERGENCE: Base UI keeps a popup open when it was opened externally
      // (open prop set without trigger hover) and the pointer then enters and
      // leaves it — the card only closes on leave if a trigger interaction
      // armed it. creaseui's LeftHoverCard schedules WaitBeforeClosing
      // whenever isOpen && !isFocused, so an externally opened card closes on
      // hover-out. (medium)
      it.fails('does not close after hovering out of a popup opened externally', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          anchorResolved(),
          Scene.hover(card),
          Scene.expectHandled(),
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          closeTimerFires,
          Scene.expect(panel).toExist(),
        )
      })
    })

    describe('prop: defaultOpen', () => {
      it('should open when the component is rendered', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          Scene.expect(panel).toExist(),
          anchorResolved(),
        )
      })

      it('should remain uncontrolled', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          anchorResolved(),
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          closeTimerFires,
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })

      it.todo(
        'should not open/close when rendered with defaultOpen and a ' +
          'controlled open prop — creaseui has no separate defaultOpen; ' +
          'model.isOpen is the single controlled source of truth',
      )

      // DIVERGENCE: same as the externally-opened case — Base UI keeps a
      // defaultOpen popup open across hover-out; creaseui schedules a close.
      it.fails('does not close after hovering out of a popup opened without trigger hover', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          anchorResolved(),
          Scene.hover(card),
          Scene.expectHandled(),
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          closeTimerFires,
          Scene.expect(panel).toExist(),
        )
      })
    })

    describe('prop: delay', () => {
      it('should not open until the show delay completes', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.hover(card),
          Scene.expectHandled(),
          Scene.Command.expectHas(HoverCardBehavior.WaitBeforeShowing),
          // Before the delay fires, the popup stays closed.
          Scene.expect(panel).toBeAbsent(),
          showTimerFires,
          Scene.expect(panel).toExist(),
          anchorResolved(),
        )
      })
    })

    describe('prop: closeDelay', () => {
      it('should not close until the close delay completes', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          anchorResolved(),
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          Scene.Command.expectHas(HoverCardBehavior.WaitBeforeClosing),
          // Before the delay fires, the popup stays open.
          Scene.expect(panel).toExist(),
          closeTimerFires,
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })
    })

    describe('dismissal', () => {
      it('closes the card when Escape is pressed on the trigger', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          anchorResolved(),
          Scene.keydown(trigger, 'Escape'),
          Scene.expectHandled(),
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })

      it('ignores Escape when the card is closed', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.keydown(trigger, 'Escape'),
          Scene.expectIgnored(),
          Scene.expect(panel).toBeAbsent(),
        )
      })

      // DIVERGENCE: Base UI re-opens on re-hover after Escape. creaseui sets
      // isDismissed on Escape, which suppresses hover-open until the pointer
      // disengages (leave + blur) — a plain re-enter while dismissed stays
      // closed. (See the tooltip primitive's dismiss-until-disengage model;
      // high severity UX difference vs Base UI.)
      it.fails('reopens on hover after Escape closes it', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.hover(card),
          showTimerFires,
          anchorResolved(),
          Scene.keydown(trigger, 'Escape'),
          Scene.expectHandled(),
          anchorEnded(),
          Scene.expect(panel).toBeAbsent(),
          Scene.hover(card),
          Scene.expectHandled(),
          Scene.Command.expectNone(),
          Scene.expect(panel).toExist(),
        )
      })
    })

    describe('pointer presses', () => {
      it('toggles the card on touch/pen presses but not on mouse presses', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.pointerDown(trigger),
          Scene.expectHandled(),
          Scene.Command.expectNone(),
          Scene.expect(panel).toBeAbsent(),
          Scene.pointerDown(trigger, { pointerType: 'touch' }),
          Scene.expectHandled(),
          Scene.expect(panel).toExist(),
          anchorResolved(),
          Scene.pointerDown(trigger, { pointerType: 'touch' }),
          Scene.expectHandled(),
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })
    })

    describe('nested preview card interactions', () => {
      type NestedModel = Readonly<{ parent: Model; child: Model }>
      type NestedMessage = Readonly<
        | { _tag: 'Parent'; message: Message }
        | { _tag: 'Child'; message: Message }
        | { _tag: 'Noop' }
      >

      const nestedUpdate = (
        model: NestedModel,
        message: NestedMessage,
      ): { model: NestedModel } & { commands?: ReadonlyArray<never> } => {
        switch (message._tag) {
          case 'Parent': {
            const next = update(model.parent, message.message)
            return {
              model: { ...model, parent: next.model },
              commands: next.commands,
            }
          }
          case 'Child': {
            const next = update(model.child, message.message)
            return {
              model: { ...model, child: next.model },
              commands: next.commands,
            }
          }
          case 'Noop':
            return { model }
        }
      }

      const nestedView =
        (HoverCard: HoverCardModule) =>
        (model: NestedModel, h: HtmlBuilder<NestedMessage>) =>
          h.div(
            [],
            [
              h.button(
                [h.Type('button'), h.OnClick({ _tag: 'Noop' })],
                ['Outside'],
              ),
              HoverCard.hoverCard(
                {
                  model: model.parent,
                  toParentMessage: (message): NestedMessage => ({
                    _tag: 'Parent',
                    message,
                  }),
                  trigger: 'Parent link',
                  content: HoverCard.hoverCard(
                    {
                      model: model.child,
                      toParentMessage: (message): NestedMessage => ({
                        _tag: 'Child',
                        message,
                      }),
                      trigger: 'Child link',
                      content: h.button(
                        [h.Type('button'), h.OnClick({ _tag: 'Noop' })],
                        ['Inside child popup'],
                      ),
                    },
                    h,
                  ),
                },
                h,
              ),
            ],
          )

      const nestedInit = (child?: Partial<Model>): NestedModel => ({
        parent: init({ isOpen: true, id: 'parent' }),
        child: { ...HoverCardBehavior.init({ id: 'child' }), ...child },
      })

      const parentPanel = Scene.selector('#parent-content')
      const childPanel = Scene.selector('#child-content')
      const childTrigger = Scene.selector('#child-trigger')
      const childCard = Scene.within(
        Scene.selector('#parent-content'),
        Scene.selector('[data-slot="hover-card"]'),
      )

      it('keeps the parent preview card open when clicking nested trigger', () => {
        Scene.scene(
          { update: nestedUpdate, view: nestedView(HoverCard) },
          Scene.given(nestedInit()),
          // creaseui toggles on non-mouse pointerdown; a plain click has no
          // click handler on the trigger button.
          Scene.Mount.resolve(anchorMount, {
            _tag: 'Parent',
            message: HoverCardBehavior.Message.CompletedHoverCardAnchor(),
          }),
          Scene.pointerDown(childTrigger, { pointerType: 'touch' }),
          Scene.expectHandled(),
          Scene.expect(childPanel).toExist(),
          Scene.Mount.resolve(anchorMount, {
            _tag: 'Child',
            message: HoverCardBehavior.Message.CompletedHoverCardAnchor(),
          }),
          Scene.expect(parentPanel).toExist(),
        )
      })

      it('keeps the parent preview card open when press starts in nested popup and ends outside', () => {
        Scene.scene(
          { update: nestedUpdate, view: nestedView(HoverCard) },
          Scene.given(nestedInit({ isOpen: true })),
          Scene.Mount.resolveAll(
            [
              anchorMount,
              {
                _tag: 'Parent',
                message: HoverCardBehavior.Message.CompletedHoverCardAnchor(),
              },
            ],
            [
              anchorMount,
              {
                _tag: 'Child',
                message: HoverCardBehavior.Message.CompletedHoverCardAnchor(),
              },
            ],
          ),
          Scene.expect(parentPanel).toExist(),
          Scene.expect(childPanel).toExist(),
          // Press inside the child popup, then click outside — creaseui has
          // no outside-press dismissal, so both cards stay open.
          Scene.click(Scene.text('Inside child popup')),
          Scene.expectHandled(),
          Scene.click(Scene.text('Outside')),
          Scene.expectHandled(),
          Scene.expect(parentPanel).toExist(),
          Scene.expect(childPanel).toExist(),
        )
      })

      it('keeps the parent preview card open when hovering nested trigger', () => {
        Scene.scene(
          { update: nestedUpdate, view: nestedView(HoverCard) },
          // Child dismissed so the hover emits EnteredHoverCard without
          // scheduling a show wait — keeps the scene free of pending timers.
          Scene.given(nestedInit({ isDismissed: true })),
          Scene.Mount.resolve(anchorMount, {
            _tag: 'Parent',
            message: HoverCardBehavior.Message.CompletedHoverCardAnchor(),
          }),
          Scene.hover(childCard),
          Scene.expectHandled(),
          Scene.expect(parentPanel).toExist(),
        )
      })

      // Base UI's race-condition test: leave, partially close, re-enter —
      // the stale close timer must not win. creaseui encodes it as version
      // gating: re-entering bumps closeVersion, so a superseded completion is
      // dropped. The literal interleave (re-enter while the close Command is
      // pending) can't cross the DSL's pending-command boundary, so we feed
      // the pending close a stale version instead.
      it('keeps the card open when a superseded close completes', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          anchorResolved(),
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          Scene.Command.expectHas(HoverCardBehavior.WaitBeforeClosing),
          Scene.Command.resolve(
            HoverCardBehavior.WaitBeforeClosing,
            // Stale version: models a close timer that outlived its wait
            // (e.g. the pointer re-entered and bumped closeVersion).
            HoverCardBehavior.Message.CompletedWaitBeforeClosingHoverCard({
              version: -1,
            }),
          ),
          Scene.expect(panel).toExist(),
          // A real leave still closes it.
          Scene.Subscription.emit(HoverCardBehavior.Message.LeftHoverCard()),
          closeTimerFires,
          Scene.expect(panel).toBeAbsent(),
          anchorEnded(),
        )
      })

      it.todo(
        'parent popup closes as soon as the child popup closes — creaseui ' +
          'nested cards are independent models with no parent/child close ' +
          'propagation',
      )
    })

    describe('ARIA attributes', () => {
      // DIVERGENCE (documented): Base UI renders an anchor trigger carrying
      // only data-popup-open. creaseui renders a <button> with disclosure
      // ARIA: aria-expanded reflects open state and aria-controls always
      // points at the panel id (dangling while closed).
      it('reflects open state via aria-expanded and links trigger to panel via aria-controls', () => {
        Scene.scene(
          { update, view },
          Scene.given(init()),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'hc-content'),
          Scene.expect(panel).toBeAbsent(),
        )
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'hc-content'),
          Scene.expect(panel).toExist(),
          anchorResolved(),
        )
      })

      it('points aria-expanded/aria-controls at a rendered panel while open', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          Scene.expect(trigger).toHaveAttr('aria-controls', 'hc-content'),
          Scene.expect(panel).toHaveId('hc-content'),
          anchorResolved(),
        )
      })

      it('renders the popup children with an accessible-nameable trigger', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          Scene.expect(Scene.role('button', { name: 'Link' })).toExist(),
          Scene.expect(panel).toHaveText('Content'),
          anchorResolved(),
        )
      })

      it('applies the ariaLabel prop to the trigger', () => {
        Scene.scene(
          { update, view: cardView(HoverCard, { ariaLabel: 'Preview link' }) },
          Scene.given(init()),
          Scene.expect(trigger).toHaveAccessibleName('Preview link'),
        )
      })

      // DIVERGENCE: Base UI marks the trigger with `data-popup-open` while
      // open; creaseui exposes open state only through aria-expanded.
      it.fails('marks the trigger data-popup-open while open', () => {
        Scene.scene(
          { update, view },
          Scene.given(init({ isOpen: true })),
          anchorResolved(),
          Scene.expect(trigger).toHaveAttr('data-popup-open', ''),
        )
      })

      it.todo(
        'marks the popup with data-open/data-side/data-align style hooks — ' +
          'creaseui has no positioner state attributes (the panel unmounts ' +
          'when closed instead of carrying data-closed)',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindHoverCard)
verifyRenderer('StyleX', StyleXHoverCard)
