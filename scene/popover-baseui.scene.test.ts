/* Ported from Base UI's popover suite
   (base-ui/packages/react/src/popover/**\/*.test.tsx), mirroring its describe
   structure. Runs against BOTH renderers: Tailwind (`@/ui/popover`) and StyleX
   (`@/stylex/popover`) — both wrap `@foldkit/ui`'s Popover primitive, which is
   where the behavior lives. creaseui has no `src/lib/popover.ts`: the component
   is the primitive's view dressed in design-system classes.

   Base UI runs the root suite three times (contained, detached, and
   multiple-detached triggers); only the contained-trigger variant is ported —
   detached triggers are React handle/ref machinery with no creaseui analogue.

   Skipped groups (React-internal or untestable at the vnode level):
   - PopoverRoot.detached-triggers.test.tsx: createPopoverHandle / trigger
     registration / payload APIs are React ref machinery.
   - `render=` prop and custom-element trigger cases: no render-prop
     composition in Foldkit views.
   - "throws a descriptive error outside Root/Positioner" cases: React
     component-tree errors.
   - <Popover.Portal />: teleporting is resolved by mounts, not renderable here.
   - <Popover.Positioner /> offset/anchor geometry and <Popover.Arrow />:
     computed by the AnchorPopover mount; only its args are asserted here.
   - <Popover.Viewport />: multi-trigger morphing containers have no analogue.
   - openOnHover, delay/closeDelay, safe-polygon, hover transitions, and
     impatient-click cases: the foldkit popover has no hover-open and Scene has
     no hover timing.
   - Backdrop pointer-events + entry-phase cases: depend on hover-open origin
     and real CSS animation.
   - Real focus assertions (initialFocus/finalFocus element picking, focus
     guards, tab-loop sequences, toolbar composite keys, shadow-root outside
     press): Scene has no real focus; command dispatch is asserted instead.
   - Nested popup interactions (menu/combobox inside popover) and actionsRef
     imperative unmount API: composite/React-handle behaviors.
   - BaseUIChangeEventDetails (reason, cancel): creaseui OutMessages are
     informational; there is no cancelable event object.
   - preventUnmountOnClose / keepMounted / popup-transition-state cases:
     creaseui always unmounts the popup on close.
   - Touch scroll-lock cases: viewport layout.

   Note: `Scene.Mount.expectEnded` steps must be built fresh per scene — the
   step's closure consumes its matchers, so a shared constant silently no-ops
   on second use (see `endedPanelMounts()`).
*/

import * as Command from 'foldkit/command'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import { Animation, Popover as PopoverPrimitive } from '@foldkit/ui'

import * as StyleXPopover from '@/stylex/popover'
import * as TailwindPopover from '@/ui/popover'

type Model = Readonly<{
  popover: PopoverPrimitive.Model
}>

type Message = Readonly<
  | { _tag: 'GotPopoverMessage'; message: PopoverPrimitive.Message }
  | { _tag: 'RequestedOpenApi' }
  | { _tag: 'RequestedCloseApi' }
>

const popoverId = 'test-popover'
const buttonId = `${popoverId}-button`
const panelId = `${popoverId}-panel`
const popoverArrowId = `${popoverId}-arrow`

const initialModel = (
  config?: Partial<{
    isAnimated: boolean
    isModal: boolean
    contentFocus: boolean
    open: boolean
  }>,
): Model => {
  let popover = PopoverPrimitive.init({
    id: popoverId,
    isAnimated: config?.isAnimated ?? false,
    isModal: config?.isModal ?? false,
    contentFocus: config?.contentFocus ?? false,
  })
  if (config?.open) {
    popover = PopoverPrimitive.open(popover).model
  }
  return { popover }
}

const mapCommands = (
  commands:
    | ReadonlyArray<Command.Command<PopoverPrimitive.Message>>
    | undefined,
): ReadonlyArray<Command.Command<Message>> =>
  Command.mapMessages(commands ?? [], (nextMessage): Message => ({
    _tag: 'GotPopoverMessage',
    message: nextMessage,
  }))

const update = (
  model: Model,
  message: Message,
): Readonly<{
  model: Model
  commands: ReadonlyArray<Command.Command<Message>>
  outMessage?: PopoverPrimitive.OutMessage
}> => {
  switch (message._tag) {
    case 'GotPopoverMessage': {
      const next = PopoverPrimitive.update(model.popover, message.message)
      return {
        model: { ...model, popover: next.model },
        commands: mapCommands(next.commands),
        outMessage: next.outMessage,
      }
    }
    case 'RequestedOpenApi': {
      const next = PopoverPrimitive.open(model.popover)
      return {
        model: { ...model, popover: next.model },
        commands: mapCommands(next.commands),
        outMessage: next.outMessage,
      }
    }
    case 'RequestedCloseApi': {
      const next = PopoverPrimitive.close(model.popover)
      return {
        model: { ...model, popover: next.model },
        commands: mapCommands(next.commands),
        outMessage: next.outMessage,
      }
    }
  }
}

const trigger = Scene.role('button', { name: 'Toggle' })
const closeButton = Scene.role('button', { name: 'Close' })
const panel = Scene.selector('[data-slot="popover-content"]')
const backdrop = Scene.selector('[data-slot="popover-backdrop"]')

const resolvePanelMounts = Scene.Mount.resolveAll(
  [
    PopoverPrimitive.AnchorPopover,
    PopoverPrimitive.Message.CompletedAnchorPopover(),
  ],
  [
    PopoverPrimitive.PortalPopoverBackdrop,
    PopoverPrimitive.Message.CompletedPortalPopoverBackdrop(),
  ],
)

const resolveFocusButton = Scene.Command.resolveAllExact([
  PopoverPrimitive.FocusButton,
  PopoverPrimitive.Message.CompletedFocusButton(),
])

/* foldkit 0.164's Animation commands carry a `generation` arg that the result
   Messages must echo back. Read it off the pending Command. */
const pendingAnimationGeneration = (
  commands: ReadonlyArray<
    Readonly<{ name: string; args?: Record<string, unknown> }>
  >,
  name?: string,
): number => {
  const pending = commands.find(
    command =>
      command.name === (name ?? 'WaitForPaint') ||
      command.name === 'WaitForAnimationSettled' ||
      command.name === 'DetectMovementOrAnimationEnd',
  )
  const generation = pending?.args?.['generation']
  if (typeof generation !== 'number') {
    throw new Error(`Expected a pending animation Command, found none.`)
  }
  return generation
}

/* Resolves an EnterStart → EnterAnimating (or LeaveStart → LeaveAnimating)
   paint+settle Command pair. Both waits share one transition generation. */
const animationPaintedThenSettled = (
  simulation: Scene.SceneSimulation<Model, Message>,
) =>
  Scene.Command.resolveAll(
    [
      Animation.WaitForPaint,
      Animation.Message.CompletedWaitForPaint({
        generation: pendingAnimationGeneration(simulation.commands),
      }),
    ],
    [
      Animation.WaitForAnimationSettled,
      Animation.Message.EndedAnimation({
        generation: pendingAnimationGeneration(simulation.commands),
      }),
    ],
  )(simulation)

// expectEnded steps are single-use: the closure drains its matchers on the
// first run, so build a fresh pair for every scene.
const endedPanelMounts = () => [
  Scene.Mount.expectEnded(PopoverPrimitive.AnchorPopover),
  Scene.Mount.expectEnded(PopoverPrimitive.PortalPopoverBackdrop),
]

const resolveModalOpenCommands = Scene.Command.resolveAllExact(
  [PopoverPrimitive.LockScroll, PopoverPrimitive.Message.CompletedLockScroll()],
  [
    PopoverPrimitive.InertOthers,
    PopoverPrimitive.Message.CompletedInertOthers(),
  ],
)

const resolveModalCloseCommands = Scene.Command.resolveAllExact(
  [
    PopoverPrimitive.FocusButton,
    PopoverPrimitive.Message.CompletedFocusButton(),
  ],
  [
    PopoverPrimitive.UnlockScroll,
    PopoverPrimitive.Message.CompletedUnlockScroll(),
  ],
  [
    PopoverPrimitive.RestoreInert,
    PopoverPrimitive.Message.CompletedRestoreInert(),
  ],
)

type PopoverPlacement = NonNullable<PopoverPrimitive.AnchorConfig['placement']>

type PopoverModuleProps = Readonly<{
  model: PopoverPrimitive.Model
  toParentMessage: (message: PopoverPrimitive.Message) => Message
  trigger: Html | string
  content: Html | string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  direction?: 'ltr' | 'rtl'
  focusSelector?: string
}>

/* `anchor` builds the anchor config this renderer passes to the AnchorPopover
   mount, so mount-args assertions stay honest about per-renderer differences
   (StyleX pins `portal: false` to keep overlays inside the themed subtree). */
type PopoverModule = Readonly<{
  popover: (props: PopoverModuleProps, h: HtmlBuilder<Message>) => Html
  anchor: (placement: PopoverPlacement) => PopoverPrimitive.AnchorConfig
}>

type ViewOptions = Readonly<{
  closeButton?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  focusSelector?: string
}>

const makeView =
  (Module: PopoverModule, options: ViewOptions = {}) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    Module.popover(
      {
        model: model.popover,
        toParentMessage: (message): Message => ({
          _tag: 'GotPopoverMessage',
          message,
        }),
        trigger: 'Toggle',
        content: options.closeButton
          ? h.button(
              [
                h.Type('button'),
                h.OnClick({
                  _tag: 'GotPopoverMessage',
                  message: PopoverPrimitive.Message.RequestedClose(),
                }),
              ],
              'Close',
            )
          : 'Content',
        ...(options.side === undefined ? {} : { side: options.side }),
        ...(options.align === undefined ? {} : { align: options.align }),
        ...(options.focusSelector === undefined
          ? {}
          : { focusSelector: options.focusSelector }),
      },
      h,
    )

const verifyRenderer = (rendererName: string, Module: PopoverModule): void => {
  describe(rendererName, () => {
    describe('<Popover.Root />', () => {
      it('should render the children', () => {
        Scene.scene(
          { update, view: makeView(Module) },
          Scene.given(initialModel()),
          Scene.expect(trigger).toExist(),
          Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
          Scene.expect(panel).toBeAbsent(),
          Scene.expect(backdrop).toBeAbsent(),
        )
      })

      describe('uncontrolled open', () => {
        it('opens the popup when clicking on the trigger', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
          )
        })

        it('should close when the anchor is clicked twice', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
          )
        })

        it('rewires dismiss interactions after closing and reopening', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            resolvePanelMounts,
            Scene.keydown(panel, 'Escape'),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.click(backdrop),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
          )
        })

        it('opens and closes the popup with Enter, Space, and ArrowDown on the trigger', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.keydown(trigger, 'Enter'),
            Scene.expectHandled(),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.keydown(trigger, 'Enter'),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
            Scene.keydown(trigger, ' '),
            Scene.expectHandled(),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.keydown(trigger, 'ArrowDown'),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
            Scene.keydown(trigger, 'Escape'),
            Scene.expectIgnored(),
          )
        })
      })

      describe('controlled open', () => {
        it('should call onChange when the open state changes', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
            resolvePanelMounts,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            ...endedPanelMounts(),
            resolveFocusButton,
          )
        })

        it('should allow controlling the popover state programmatically', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.Subscription.emit({ _tag: 'RequestedOpenApi' }),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.Subscription.emit({ _tag: 'RequestedCloseApi' }),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
          )
        })
      })

      describe('prop: defaultOpen', () => {
        // creaseui has no defaultOpen prop; the parent seeds an open model.
        it('should open when the component is rendered', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ open: true })),
            Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
            Scene.expect(trigger).toHaveAttr('aria-controls', panelId),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
          )
        })

        it('should not open when the component is rendered and open is controlled', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
            Scene.expect(panel).toBeAbsent(),
          )
        })

        it('should not close when the component is rendered and open is controlled', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ open: true })),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
          )
        })

        it('should remain uncontrolled', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ open: true })),
            resolvePanelMounts,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
          )
        })
      })

      describe('focus management', () => {
        it('focuses the trigger after the popover is closed', () => {
          // Scene has no real focus; the FocusButton command is the
          // observable equivalent of Base UI's focus-return behavior.
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            resolvePanelMounts,
            Scene.keydown(panel, 'Escape'),
            Scene.expectHandled(),
            Scene.Command.expectHas(PopoverPrimitive.FocusButton),
            Scene.Command.resolve(
              PopoverPrimitive.FocusButton,
              PopoverPrimitive.Message.CompletedFocusButton(),
            ),
            ...endedPanelMounts(),
          )
        })

        it.todo(
          'moves focus to the element following the trigger, excluding the popup, when tabbing forward from the open popup — untestable in Scene (no real focus/tab order)',
        )
      })

      describe('outside press event with backdrops', () => {
        it('uses intentional outside press with user backdrop (mouse): closes on click, not on mousedown', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            resolvePanelMounts,
            Scene.expect(backdrop).not.toHaveHandler('pointerdown'),
            Scene.expect(panel).toExist(),
            Scene.click(backdrop),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
          )
        })

        it('uses intentional outside press with internal backdrop (modal=true): closes on click, not on mousedown', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ isModal: true })),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            resolveModalOpenCommands,
            Scene.expect(backdrop).not.toHaveHandler('pointerdown'),
            Scene.expect(panel).toExist(),
            Scene.click(backdrop),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveModalCloseCommands,
          )
        })
      })

      describe('non-modal focus transitions', () => {
        it('closes as soon as focus leaves the popup on pointer down outside', () => {
          // Opened via click (no mouse pointerdown recorded), a panel blur
          // closes the popover without returning focus.
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            resolvePanelMounts,
            Scene.blur(panel),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            Scene.Command.expectNone(),
          )
        })

        it('stays open when the panel blurs after a mouse pointerdown opened it', () => {
          // A mouse pointerdown keeps blur-dismissal disarmed, matching real
          // pointer-intent focus transitions.
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.pointerDown(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
            resolvePanelMounts,
            Scene.blur(panel),
            Scene.expectHandled(),
            Scene.expect(panel).toExist(),
          )
        })
      })

      describe('prop: modal', () => {
        it('should render an internal backdrop when `true`', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ isModal: true })),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(backdrop).toExist(),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.Command.expectExact(
              PopoverPrimitive.LockScroll,
              PopoverPrimitive.InertOthers,
            ),
            resolveModalOpenCommands,
          )
        })

        // DIVERGENCE: Base UI only renders an internal backdrop when
        // `modal=true`; creaseui renders the backdrop whenever the popup is
        // open (modal=false included — it carries the outside-press close).
        it.fails('should not render an internal backdrop when `false`', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ isModal: false })),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.expect(backdrop).toBeAbsent(),
          )
        })

        it('locks scroll and inerts outside elements while open when `true`', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ isModal: true })),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.Command.expectExact(
              PopoverPrimitive.LockScroll,
              PopoverPrimitive.InertOthers,
            ),
            resolveModalOpenCommands,
            resolvePanelMounts,
            Scene.keydown(panel, 'Escape'),
            Scene.expectHandled(),
            Scene.Command.expectExact(
              PopoverPrimitive.FocusButton,
              PopoverPrimitive.UnlockScroll,
              PopoverPrimitive.RestoreInert,
            ),
            resolveModalCloseCommands,
            ...endedPanelMounts(),
          )
        })
      })

      describe('ARIA attributes', () => {
        it('has the aria-expanded attribute on the trigger when open', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.expect(trigger).toHaveAttr('aria-expanded', 'false'),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(trigger).toHaveAttr('aria-expanded', 'true'),
            resolvePanelMounts,
          )
        })

        it('has the aria-haspopup attribute on the trigger', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ open: true })),
            Scene.expect(trigger).toHaveAttr('aria-haspopup', 'dialog'),
            resolvePanelMounts,
          )
        })

        it('has the `aria-controls` attribute on the trigger', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ open: true })),
            Scene.expect(trigger).toHaveAttr('aria-controls', panelId),
            Scene.expect(panel).toHaveId(panelId),
            resolvePanelMounts,
          )
        })

        // DIVERGENCE (intentional): Base UI keeps aria-controls on the closed
        // trigger pointing at the popup id; creaseui only sets it while the
        // popup is mounted, so a closed trigger never references a missing
        // element.
        it('omits aria-controls on the trigger while the popup is closed', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.expect(trigger).not.toHaveAttr('aria-controls', panelId),
          )
        })

        it('allows a custom `id` prop', () => {
          const customId = 'TestId'
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given({
              popover: PopoverPrimitive.open(
                PopoverPrimitive.init({ id: customId, isAnimated: false }),
              ).model,
            }),
            Scene.expect(trigger).toHaveAttr(
              'aria-controls',
              `${customId}-panel`,
            ),
            Scene.expect(panel).toHaveId(`${customId}-panel`),
            resolvePanelMounts,
          )
        })

        // DIVERGENCE: Base UI gives the popup `role="dialog"`; creaseui's
        // panel renders no role at all.
        it.fails('has the dialog role on the popup', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ open: true })),
            Scene.expect(panel).toHaveAttr('role', 'dialog'),
            resolvePanelMounts,
          )
        })
      })

      describe('animations', () => {
        it('removes the popup when there is no exit animation defined', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            resolvePanelMounts,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
          )
        })

        it('removes the popup when the animation finishes', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel({ isAnimated: true })),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
            Scene.expect(panel).toExist(),
            Scene.expect(panel).toHaveAttr('data-enter', ''),
            animationPaintedThenSettled,
            resolvePanelMounts,
            Scene.expect(panel).not.toHaveAttr('data-enter', ''),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            // Leave animating: the popup lingers with data-leave until the
            // animation reports it has settled.
            Scene.expect(panel).toExist(),
            Scene.expect(panel).toHaveAttr('data-leave', ''),
            simulation =>
              Scene.Command.resolve(
                Animation.WaitForPaint,
                Animation.Message.CompletedWaitForPaint({
                  generation: pendingAnimationGeneration(simulation.commands),
                }),
              )(simulation),
            Scene.expect(panel).toExist(),
            simulation =>
              Scene.Command.resolve(
                PopoverPrimitive.DetectMovementOrAnimationEnd,
                PopoverPrimitive.Message.GotAnimationMessage({
                  message: Animation.Message.EndedAnimation({
                    generation: pendingAnimationGeneration(
                      simulation.commands,
                      'DetectMovementOrAnimationEnd',
                    ),
                  }),
                }),
              )(simulation),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            Scene.Command.resolve(
              PopoverPrimitive.FocusButton,
              PopoverPrimitive.Message.CompletedFocusButton(),
            ),
          )
        })
      })
    })

    describe('<Popover.Trigger />', () => {
      describe('prop: disabled', () => {
        it.todo(
          'disables the popover — creaseui does not forward the primitive’s isDisabled view input',
        )
        it.todo(
          'does not open on hover when disabled — creaseui has no disabled prop or hover-open',
        )
      })

      describe('style hooks', () => {
        // DIVERGENCE: Base UI marks the press-opened trigger with
        // data-popup-open and data-pressed; creaseui marks the open trigger
        // with data-open only, regardless of the opening pointer type.
        it.fails('should have the data-popup-open and data-pressed attributes when open by clicking', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            resolvePanelMounts,
            Scene.expect(trigger).toHaveAttr('data-popup-open', ''),
            Scene.expect(trigger).toHaveAttr('data-pressed', ''),
          )
        })

        it('marks the open trigger with data-open', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.expect(trigger).not.toHaveAttr('data-open', ''),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(trigger).toHaveAttr('data-open', ''),
            resolvePanelMounts,
          )
        })
      })

      describe('pointer types', () => {
        it('opens on a left-button mousedown and ignores the following click', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.pointerDown(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expect(panel).toExist(),
            Scene.pointerDown(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
            Scene.expect(panel).toBeAbsent(),
            ...endedPanelMounts(),
            resolveFocusButton,
          )
        })

        it('does not open on a touch pointerdown; the following click opens it', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.pointerDown(trigger, { pointerType: 'touch' }),
            Scene.expectHandled(),
            Scene.expect(panel).toBeAbsent(),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.expectOutMessage(PopoverPrimitive.OutMessage.Opened()),
            Scene.expect(panel).toExist(),
            resolvePanelMounts,
          )
        })

        it('does not toggle on a non-primary-button mousedown', () => {
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.pointerDown(trigger, { button: 2 }),
            Scene.expectHandled(),
            Scene.expect(panel).toBeAbsent(),
          )
        })
      })
    })

    describe('<Popover.Popup />', () => {
      it('should render the children', () => {
        Scene.scene(
          { update, view: makeView(Module) },
          Scene.given(initialModel({ open: true })),
          Scene.expect(panel).toExist(),
          Scene.expect(panel).toContainText('Content'),
          resolvePanelMounts,
        )
      })

      // DIVERGENCE: Base UI styles the open popup with data-open (and the
      // closed popup with data-closed); creaseui's settled panel carries no
      // data-open — transition hooks (data-enter/data-leave/data-closed) only
      // exist mid-animation on an animated model.
      it.fails('has the data-open attribute on the popup while open', () => {
        Scene.scene(
          { update, view: makeView(Module) },
          Scene.given(initialModel({ open: true })),
          resolvePanelMounts,
          Scene.expect(panel).toHaveAttr('data-open', ''),
        )
      })

      // DIVERGENCE (intentional): Base UI renders the popup with tabIndex=-1
      // for programmatic focus; creaseui makes the panel tabbable (tabIndex=0)
      // so blur-driven dismissal observes focus leaving it.
      it('is focusable via tabindex for panel blur dismissal', () => {
        Scene.scene(
          { update, view: makeView(Module) },
          Scene.given(initialModel({ open: true })),
          Scene.expect(panel).toHaveAttr('tabIndex', '0'),
          resolvePanelMounts,
        )
      })

      it('drops tabindex and blur dismissal when contentFocus is set', () => {
        Scene.scene(
          { update, view: makeView(Module) },
          Scene.given(initialModel({ open: true, contentFocus: true })),
          resolvePanelMounts,
          Scene.expect(panel).not.toHaveAttr('tabIndex', '0'),
          Scene.expect(panel).not.toHaveHandler('blur'),
        )
      })

      describe('prop: initialFocus', () => {
        it.todo(
          'should focus the first focusable element within the popup by default — Scene has no real focus; the foldkit primitive delegates initial focus to the AnchorPopover mount',
        )
        it.todo(
          'should focus the element provided to `initialFocus` when open — creaseui has no initialFocus prop (focusSelector is the nearest analogue)',
        )

        it('passes focusSelector through to the anchor mount', () => {
          Scene.scene(
            { update, view: makeView(Module, { focusSelector: '#focus-me' }) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            Scene.Mount.expectHas(
              PopoverPrimitive.AnchorPopover({
                buttonId,
                anchor: Module.anchor('bottom'),
                arrowId: popoverArrowId,
                focusSelector: '#focus-me',
              }),
            ),
            resolvePanelMounts,
          )
        })
      })

      describe('prop: finalFocus', () => {
        it('should focus the trigger by default when closed', () => {
          // The FocusButton command stands in for real focus return.
          Scene.scene(
            { update, view: makeView(Module) },
            Scene.given(initialModel()),
            Scene.click(trigger),
            Scene.expectHandled(),
            resolvePanelMounts,
            Scene.keydown(trigger, 'Escape'),
            Scene.expectHandled(),
            Scene.Command.expectHas(PopoverPrimitive.FocusButton),
            Scene.Command.resolve(
              PopoverPrimitive.FocusButton,
              PopoverPrimitive.Message.CompletedFocusButton(),
            ),
            ...endedPanelMounts(),
          )
        })

        it.todo(
          'should focus the element provided to `finalFocus` when closed — creaseui has no finalFocus prop; closing always targets the trigger',
        )
      })
    })

    describe('<Popover.Close />', () => {
      it('should close popover when clicked', () => {
        Scene.scene(
          { update, view: makeView(Module, { closeButton: true }) },
          Scene.given(initialModel()),
          Scene.click(trigger),
          Scene.expectHandled(),
          resolvePanelMounts,
          Scene.click(closeButton),
          Scene.expectHandled(),
          Scene.expectOutMessage(PopoverPrimitive.OutMessage.Closed()),
          Scene.expect(panel).toBeAbsent(),
          ...endedPanelMounts(),
          resolveFocusButton,
        )
      })

      it.todo(
        'renders when popover is closed — creaseui has no keepMounted mode; the popup subtree unmounts on close',
      )
    })

    describe('<Popover.Title />', () => {
      it.todo(
        'labels the popup element with its id — creaseui has no Title part and does not forward aria-labelledby',
      )
    })

    describe('<Popover.Description />', () => {
      it.todo(
        'describes the popup element with its id — creaseui has no Description part and does not forward aria-describedby',
      )
    })

    describe('positioning', () => {
      it('maps side/align props onto the anchor mount placement', () => {
        Scene.scene(
          { update, view: makeView(Module, { side: 'top', align: 'end' }) },
          Scene.given(initialModel()),
          Scene.click(trigger),
          Scene.expectHandled(),
          Scene.Mount.expectHas(
            PopoverPrimitive.AnchorPopover({
              buttonId,
              anchor: Module.anchor('top-end'),
              arrowId: popoverArrowId,
            }),
          ),
          resolvePanelMounts,
        )
      })
    })
  })
}

verifyRenderer('Tailwind', {
  popover: (props, h) => TailwindPopover.popover(props, h),
  anchor: placement => ({ placement, gap: 4 }),
})

verifyRenderer('StyleX', {
  popover: (props, h) => StyleXPopover.popover(props, h),
  anchor: placement => ({ placement, gap: 4, portal: false }),
})
