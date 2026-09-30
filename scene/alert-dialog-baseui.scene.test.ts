import { Dialog as DialogPrimitive, Animation as AnimationPrimitive } from '@foldkit/ui'
import * as Command from 'foldkit/command'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Scene from 'foldkit/scene'
import { describe, it } from 'vitest'

import * as AlertDialogBehavior from '@/lib/alert-dialog'
import * as StyleXAlertDialog from '@/stylex/alert-dialog'
import * as TailwindAlertDialog from '@/ui/alert-dialog'

/**
 * Behavioral parity suite ported from Base UI's alert dialog tests
 * (base-ui/packages/react/src/alert-dialog/root/AlertDialogRoot.test.tsx and
 * the shared popupConformanceTests it runs, checked at base-ui HEAD).
 *
 * Mapping notes: creaseui's `alertDialog` is a styled composition over the
 * foldkit Dialog primitive — a native `<dialog>` wrapper plus overlay,
 * `role="alertdialog"` panel, title, description, and cancel/action buttons.
 * It has no Trigger/Portal/Viewport/Close parts and no handle or payload
 * API: the application opens and closes it by driving the model through
 * `AlertDialog.open`/`close` or its own messages (modeled here by the
 * "Open"/"Dismiss" buttons), and outcomes surface as the Cancelled/Confirmed
 * out-messages instead of an `onOpenChange` callback.
 *
 * Cases that have no creaseui analogue are recorded as it.todo lines or
 * listed here instead of being dropped silently:
 *  - React/handle internals: `createHandle`, `handle`/`triggerId`/
 *    `defaultTriggerId` props, detached triggers, trigger reparenting,
 *    Fast Refresh recreation, per-trigger `payload`, popup DOM-node reuse,
 *    and `actionsRef` imperative `unmount()`/`close()` (the programmatic
 *    close path is ported as a parent-requested close instead).
 *  - `onOpenChange` eventDetails payloads (reason, source trigger element,
 *    `cancel()`, `preventUnmountOnClose()`) — foldkit dispatches plain
 *    messages, not DOM event objects.
 *  - `onOpenChangeComplete` — no completion callback prop; the exit
 *    animation's lifecycle is asserted by resolving the foldkit animation
 *    commands directly.
 *  - Real-DOM behaviors that need a browser and are covered in
 *    e2e/site.spec.ts ("alert dialog matches upstream sections…"): the
 *    Escape close dispatch, backdrop hit-testing, initial focus on the
 *    cancel button, scroll locking, and an inert background.
 */

type Model = Readonly<{
  alertDialog: AlertDialogBehavior.Model
}>

type Message = Readonly<
  | { _tag: 'RequestedOpenDialog' }
  | { _tag: 'RequestedCloseDialog' }
  | { _tag: 'GotAlertDialogMessage'; message: AlertDialogBehavior.Message }
>

const lift = (result: ReturnType<typeof AlertDialogBehavior.update>) => ({
  model: { alertDialog: result.model },
  commands: Command.mapMessages(
    result.commands,
    (message): Message => ({ _tag: 'GotAlertDialogMessage', message }),
  ),
  ...(result.outMessage === undefined
    ? {}
    : { outMessage: result.outMessage }),
})

const update = (model: Model, message: Message) => {
  switch (message._tag) {
    case 'RequestedOpenDialog':
      return lift(AlertDialogBehavior.open(model.alertDialog))
    case 'RequestedCloseDialog':
      return lift(AlertDialogBehavior.close(model.alertDialog))
    case 'GotAlertDialogMessage':
      return lift(AlertDialogBehavior.update(model.alertDialog, message.message))
  }
}

type AlertDialogModule = Readonly<{
  alertDialog: <Msg>(
    props: {
      model: AlertDialogBehavior.Model
      toParentMessage: (message: AlertDialogBehavior.Message) => Msg
      title: string
      description: string
      media?: ReadonlyArray<Html | string>
      mediaVariant?: 'muted' | 'destructive'
      actionLabel: string
      cancelLabel?: string
      pendingLabel?: string
      isPending?: boolean
      size?: 'default' | 'sm'
      actionVariant?: 'default' | 'destructive'
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const sceneView =
  (AlertDialog: AlertDialogModule, isPending = false) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.div([], [
      h.button(
        [h.Type('button'), h.OnClick({ _tag: 'RequestedOpenDialog' })],
        ['Open'],
      ),
      h.button(
        [h.Type('button'), h.OnClick({ _tag: 'RequestedCloseDialog' })],
        ['Dismiss'],
      ),
      AlertDialog.alertDialog(
        {
          model: model.alertDialog,
          toParentMessage: message => ({
            _tag: 'GotAlertDialogMessage',
            message,
          }),
          title: 'Are you absolutely sure?',
          description:
            'This action cannot be undone. This will permanently delete your account.',
          actionLabel: 'Continue',
          cancelLabel: 'Cancel',
          pendingLabel: 'Deleting…',
          isPending,
        },
        h,
      ),
    ])

const dialog = Scene.selector('[data-slot="alert-dialog"]')
const popup = Scene.role('alertdialog')
const overlay = Scene.selector('[data-slot="alert-dialog-overlay"]')
const title = Scene.selector('[data-slot="alert-dialog-title"]')
const description = Scene.selector('[data-slot="alert-dialog-description"]')
const cancelButton = Scene.role('button', { name: 'Cancel' })
const actionButton = Scene.role('button', { name: 'Continue' })
const openButton = Scene.role('button', { name: 'Open' })
const dismissButton = Scene.role('button', { name: 'Dismiss' })

const closedModel = (isAnimated = false): Model => ({
  alertDialog: AlertDialogBehavior.init({ id: 'delete-alert', isAnimated }),
})

// The creaseui analogue of mounting with `open`/`defaultOpen`: drive the
// model through the real `open` path and keep only the model — the ShowDialog
// command is a runtime concern the scene resolves separately.
const openModel = (): Model => ({
  alertDialog: AlertDialogBehavior.open(AlertDialogBehavior.init({ id: 'delete-alert' }))
    .model,
})

// Acknowledges the framework plumbing an open dialog dispatches: the
// ShowDialog command and the AcquireResources mount on the <dialog> element.
const showSucceeded = Scene.Command.resolve(
  DialogPrimitive.ShowDialog,
  DialogPrimitive.Message.SucceededShowDialog(),
)
const acquireResources = Scene.Mount.resolve(
  DialogPrimitive.AcquireResources,
  DialogPrimitive.Message.SucceededAcquireResources(),
)
const closeCompleted = Scene.Command.resolve(
  DialogPrimitive.CloseDialog,
  DialogPrimitive.Message.CompletedCloseDialog(),
)

const verifyRenderer = (name: string, AlertDialog: AlertDialogModule) => {
  describe(`${name} AlertDialog (Base UI port)`, () => {
    const view = sceneView(AlertDialog)

    describe('Popup conformance', () => {
      describe('controlled mode', () => {
        it('renders the popup when the model is already open', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(popup).toExist(),
            Scene.expect(dialog).toHaveAttr('open', 'true'),
          )
        })
      })

      describe('uncontrolled mode', () => {
        it('opens the popup when the parent requests it', () => {
          Scene.scene(
            { update, view },
            Scene.given(closedModel()),
            Scene.expect(popup).toBeAbsent(),
            Scene.click(openButton),
            Scene.expectHandled(),
            showSucceeded,
            acquireResources,
            Scene.expect(popup).toExist(),
            Scene.expect(dialog).toHaveAttr('open', 'true'),
          )
        })
      })

      describe('ARIA attributes', () => {
        it('has the alertdialog role on the popup', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(popup).toExist(),
            Scene.expect(popup).toHaveAttr('role', 'alertdialog'),
          )
        })

        it('wires aria-labelledby on the dialog to the rendered title', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(title).toHaveId('delete-alert-dialog-title'),
            Scene.expect(title).toHaveText('Are you absolutely sure?'),
            Scene.expect(dialog).toHaveAttr(
              'aria-labelledby',
              'delete-alert-dialog-title',
            ),
          )
        })

        it('points aria-describedby at the rendered description', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(description).toHaveId(
              'delete-alert-dialog-description',
            ),
            Scene.expect(dialog).toHaveAttr(
              'aria-describedby',
              'delete-alert-dialog-description',
            ),
          )
        })

        it('names the alertdialog-role element via aria-labelledby', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(popup).toHaveAttr(
              'aria-labelledby',
              'delete-alert-dialog-title',
            ),
          )
        })

        it('derives the popup id from the configured model id', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(dialog).toHaveId('delete-alert'),
            Scene.expect(popup).toHaveId('delete-alert-panel'),
          )
        })

        it.todo(
          'has the `aria-controls` attribute on the trigger — creaseui has ' +
            'no AlertDialog.Trigger part; the app owns the opener',
        )
        it.todo(
          'has the `aria-expanded` attribute on the trigger when open — ' +
            'no Trigger part',
        )
        it.todo(
          'has the `aria-haspopup` attribute on the trigger — no Trigger part',
        )
      })
    })

    describe('<AlertDialog.Root />', () => {
      it.todo(
        'synchronizes trigger ARIA attributes in controlled mode — creaseui ' +
          'has no triggerId/handle API',
      )
      it.todo(
        'synchronizes trigger ARIA attributes when initially open with a ' +
          'handle — no createHandle API',
      )
      it.todo(
        'synchronizes detached trigger ARIA attributes when initially open ' +
          'with a handle — no detached triggers',
      )
      it.todo('renders a viewport — creaseui has no Viewport part')

      describe('prop: onOpenChange', () => {
        it('emits no notification on programmatic open and emits CancelledAlertDialog on cancel', () => {
          Scene.scene(
            { update, view },
            Scene.given(closedModel()),
            Scene.click(openButton),
            Scene.expectHandled(),
            Scene.expectNoOutMessage(),
            showSucceeded,
            acquireResources,
            Scene.expect(popup).toExist(),
            Scene.click(cancelButton),
            Scene.expectHandled(),
            Scene.expectOutMessage(
              AlertDialogBehavior.OutMessage.CancelledAlertDialog(),
            ),
            Scene.expect(popup).toBeAbsent(),
            closeCompleted,
            Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          )
        })

        it.todo(
          'calls onOpenChange with the reason for change — creaseui ' +
            'out-messages carry no reason/event payload',
        )
        it.todo(
          'calls onOpenChange when Escape is pressed — the native cancel ' +
            'event needs a real DOM; covered by e2e',
        )

        it('keeps the dialog open when the overlay is activated', () => {
          // Base UI: 'does not close when the backdrop is clicked'.
          // creaseui's alert dialog wires no click handler on the overlay at
          // all — the primitive's backdrop OnClick is intentionally dropped —
          // so there is nothing to click: dismissal is impossible by
          // construction. Handler keys are DOM event names.
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(overlay).toExist(),
            Scene.expect(overlay).not.toHaveHandler('click'),
            Scene.expect(dialog).not.toHaveHandler('click'),
            Scene.expect(popup).toExist(),
          )
        })

        it.todo(
          'keeps data-popup-open on the trigger when a controlled close is ' +
            'vetoed — no trigger or controlled-veto API; the confirm button ' +
            'simply does not close',
        )
      })

      describe('interactions', () => {
        it('marks the dialog modal and open only while visible', () => {
          Scene.scene(
            { update, view },
            Scene.given(closedModel()),
            Scene.expect(dialog).toExist(),
            Scene.expect(dialog).not.toHaveAttr('aria-modal'),
            Scene.expect(dialog).not.toHaveAttr('data-open'),
            // h.Open always renders the `open` DOM prop, even when closed.
            Scene.expect(dialog).toHaveAttr('open', 'false'),
            Scene.click(openButton),
            Scene.expectHandled(),
            showSucceeded,
            acquireResources,
            Scene.expect(dialog).toHaveAttr('aria-modal', 'true'),
            Scene.expect(dialog).toHaveAttr('data-open', ''),
            Scene.expect(dialog).toHaveAttr('open', 'true'),
          )
        })

        // DIVERGENCE (intentional): shadcn's AlertDialogAction closes the
        // dialog on press. creaseui's action only emits
        // ConfirmedAlertDialog — the parent decides whether to close (the
        // docs async example deletes a project first), matching the
        // component's "consequences are parent-owned" contract.
        it('emits ConfirmedAlertDialog and stays open when the action is clicked', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.click(actionButton),
            Scene.expectHandled(),
            Scene.expectOutMessage(
              AlertDialogBehavior.OutMessage.ConfirmedAlertDialog(),
            ),
            Scene.expect(popup).toExist(),
            Scene.expect(dialog).toHaveAttr('data-open', ''),
          )
        })

        it('closes the dialog when the parent requests close', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(popup).toExist(),
            Scene.click(dismissButton),
            Scene.expectHandled(),
            // liftDialog drops the primitive's Closed out-message; the
            // parent is only notified of cancel/confirm.
            Scene.expectNoOutMessage(),
            Scene.expect(popup).toBeAbsent(),
            closeCompleted,
            Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          )
        })

        it('maps the native cancel signal (Escape) to a close request', () => {
          // Dom.showDialog dispatches a `cancel` CustomEvent for an
          // unhandled Escape on the topmost dialog; the Dialog view maps it
          // to RequestedClose via OnCancelPreventDefault. The scene DSL has
          // no cancel-event step, so this asserts the wiring — the dispatch
          // itself is covered in e2e/site.spec.ts.
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            // OnCancelPreventDefault registers under the DOM 'cancel' event.
            Scene.expect(dialog).toHaveHandler('cancel'),
          )
        })

        it.todo(
          'closes on Escape — requires the real-DOM cancel event; covered ' +
            'by e2e/site.spec.ts',
        )

        it('marks the cancel action as the initial-focus target', () => {
          Scene.scene(
            { update, view },
            Scene.given(openModel()),
            acquireResources,
            Scene.expect(cancelButton).toHaveAttr(
              'data-foldkit-dialog-initial-focus',
              '',
            ),
            Scene.expect(cancelButton).toHaveAttr('type', 'button'),
            Scene.expect(actionButton).toHaveAttr('type', 'button'),
          )
        })
      })

      describe('animations', () => {
        it('keeps the popup mounted while the leave animation runs, then removes it', () => {
          Scene.scene(
            { update, view },
            Scene.given(closedModel(true)),
            Scene.click(openButton),
            Scene.expectHandled(),
            showSucceeded,
            // EnterStart → EnterAnimating → Idle
            Scene.Command.resolve(
              AnimationPrimitive.WaitForPaint,
              AnimationPrimitive.Message.CompletedWaitForPaint(),
            ),
            Scene.Command.resolve(
              AnimationPrimitive.WaitForAnimationSettled,
              AnimationPrimitive.Message.EndedAnimation(),
            ),
            acquireResources,
            Scene.expect(popup).toExist(),
            Scene.click(cancelButton),
            Scene.expectHandled(),
            Scene.expectOutMessage(
              AlertDialogBehavior.OutMessage.CancelledAlertDialog(),
            ),
            // LeaveStart: still mounted, leave flag applied.
            Scene.expect(popup).toExist(),
            Scene.expect(overlay).toHaveAttr('data-leave', ''),
            Scene.Command.resolve(
              AnimationPrimitive.WaitForPaint,
              AnimationPrimitive.Message.CompletedWaitForPaint(),
            ),
            // LeaveAnimating: still mounted, now flagged closed+leave.
            Scene.expect(popup).toExist(),
            Scene.expect(overlay).toHaveAttr('data-closed', ''),
            Scene.expect(overlay).toHaveAttr('data-leave', ''),
            Scene.Command.resolve(
              AnimationPrimitive.WaitForAnimationSettled,
              AnimationPrimitive.Message.EndedAnimation(),
            ),
            // TransitionedOut lifts the CloseDialog command.
            closeCompleted,
            Scene.expect(popup).toBeAbsent(),
            Scene.expect(overlay).toBeAbsent(),
            Scene.expect(dialog).not.toHaveAttr('data-open'),
            Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          )
        })
      })

      describe('prop: isPending (creaseui-only)', () => {
        it('disables both footer actions and marks the action busy', () => {
          Scene.scene(
            { update, view: sceneView(AlertDialog, true) },
            Scene.given(openModel()),
            acquireResources,
            // The pending label replaces the action label, so locate the
            // buttons by slot instead of accessible name.
            Scene.expect(
              Scene.selector('[data-slot="alert-dialog-cancel"]'),
            ).toBeDisabled(),
            Scene.expect(
              Scene.selector('[data-slot="alert-dialog-action"]'),
            ).toBeDisabled(),
            Scene.expect(
              Scene.selector('[data-slot="alert-dialog-action"]'),
            ).toHaveAttr('aria-busy', 'true'),
            Scene.expect(
              Scene.role('button', { name: 'Deleting…' }),
            ).toExist(),
          )
        })
      })

      describe('capabilities with no creaseui analogue', () => {
        it.todo(
          'makes other page content inert while open — real-DOM isolation; ' +
            'covered by e2e',
        )
        it.todo(
          'calls onOpenChangeComplete when transitions finish — no ' +
            'completion callback; scene resolves animation commands directly',
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindAlertDialog)
verifyRenderer('StyleX', StyleXAlertDialog)
