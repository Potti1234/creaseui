import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'
import { Animation, Dialog as DialogPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import * as SheetBehavior from '@/lib/sheet'
import * as StyleXDialog from '@/stylex/dialog'
import * as StyleXSheet from '@/stylex/sheet'
import * as TailwindDialog from '@/ui/dialog'
import * as TailwindSheet from '@/ui/sheet'

/**
 * Behavioral parity suite ported from Base UI's dialog tests
 * (base-ui/packages/react/src/dialog/{root,popup,close,backdrop}/…test.tsx,
 * checked at base-ui HEAD). creaseui's `sheet` shares the same foldkit
 * Dialog primitive, so it gets a small coverage block at the end.
 *
 * The foldkit Dialog runs on a native <dialog> element that is always
 * mounted; the backdrop and panel render only while visible. Opening and
 * closing are commands (ShowDialog/CloseDialog) plus an OnMount-managed
 * resource acquisition — every test resolves them explicitly.
 *
 * Cases that have no creaseui analogue are recorded as comments here
 * instead of being dropped silently:
 *  - Whole detached-triggers suite (handle/payload API, trigger stores,
 *    StrictMode effect replay) — creaseui has no detached-trigger concept.
 *  - Trigger parts (<Dialog.Trigger>): creaseui renders no trigger — the
 *    consumer fires RequestedOpen from their own button, so trigger ARIA
 *    sync (aria-haspopup/aria-expanded/aria-controls) is consumer-side.
 *  - Portal/viewport parts, render= prop, error-outside-Root conformance,
 *    Suspense integration — React/React-DOM specifics with no vnode analog.
 *  - actionsRef imperative handle, NumberField pointer-lock dismissal.
 *  - Nested dialogs (stack, CSS var, nested style hooks), shadow DOM
 *    containment, touch/drag dismissal heuristics, scroll lock — all depend
 *    on real DOM/browser behavior the scene DSL does not simulate.
 *  - Real focus movement (initialFocus element resolution, finalFocus
 *    return-to-trigger) — asserted here only at the marker/selector
 *    contract level; e2e covers the real behavior (e2e/site.spec.ts).
 *  - Escape close: foldkit wires a `cancel` handler that only dispatches a
 *    close message for its own unhandled-Escape CustomEvent; the scene DSL
 *    has no cancel step. e2e covers Escape (e2e/site.spec.ts).
 */

type Model = Readonly<{
  dialog: DialogPrimitive.Model
  title: string
  description: string | undefined
  declineOpen: boolean
  declineClose: boolean
  lastDialogMessage: string
}>

type Message = Readonly<
  | { _tag: 'RequestedOpen' }
  | { _tag: 'RequestedClose' }
  | { _tag: 'ChangedTitle'; title: string }
  | { _tag: 'ChangedDescription'; description: string | undefined }
  | { _tag: 'InteractedInsidePanel' }
  | { _tag: 'GotDialogMessage'; message: DialogPrimitive.Message }
  | { _tag: 'GotSheetMessage'; message: SheetBehavior.Message }
>

const mapDialogCommands = (
  commands: ReadonlyArray<Command.Command<DialogPrimitive.Message>> | undefined,
) =>
  Command.mapMessages(commands ?? [], next => ({
    _tag: 'GotDialogMessage' as const,
    message: next,
  }))

/* The Base UI `cancel()` cases map onto the parent declining to apply the
 * primitive's update result — in foldkit the parent owns the model, so
 * dropping the result (and its OutMessage) is the cancellation point. */
const update = (model: Model, message: Message) => {
  switch (message._tag) {
    case 'ChangedTitle':
      return { model: { ...model, title: message.title } }
    case 'ChangedDescription':
      return { model: { ...model, description: message.description } }
    case 'InteractedInsidePanel':
      return { model }
    case 'RequestedOpen': {
      if (model.declineOpen) {
        return { model }
      }
      const result = DialogPrimitive.open(model.dialog)
      return {
        model: { ...model, dialog: result.model },
        commands: mapDialogCommands(result.commands),
        outMessage: result.outMessage,
      }
    }
    case 'RequestedClose': {
      const result = DialogPrimitive.close(model.dialog)
      if (model.declineClose) {
        return { model }
      }
      return {
        model: { ...model, dialog: result.model },
        commands: mapDialogCommands(result.commands),
        outMessage: result.outMessage,
      }
    }
    case 'GotDialogMessage': {
      const result = DialogPrimitive.update(model.dialog, message.message)
      if (model.declineClose && result.outMessage?._tag === 'Closed') {
        return { model }
      }
      return {
        model: {
          ...model,
          dialog: result.model,
          lastDialogMessage: message.message._tag,
        },
        commands: mapDialogCommands(result.commands),
        outMessage: result.outMessage,
      }
    }
    case 'GotSheetMessage': {
      const result = SheetBehavior.update(
        { ...SheetBehavior.init({ id: 'test-sheet' }), dialog: model.dialog },
        message.message,
      )
      if (model.declineClose && result.outMessage?._tag === 'Closed') {
        return { model }
      }
      return {
        model: {
          ...model,
          dialog: result.model.dialog,
          lastDialogMessage:
            message.message._tag === 'GotSheetDialogMessage'
              ? message.message.message._tag
              : message.message._tag,
        },
        commands: Command.mapMessages(result.commands ?? [], next => ({
          _tag: 'GotSheetMessage' as const,
          message: next,
        })),
        outMessage: result.outMessage,
      }
    }
  }
}

const initialModel = (
  options: {
    id?: string
    isAnimated?: boolean
    focusSelector?: string
    description?: string | undefined
    declineOpen?: boolean
    declineClose?: boolean
  } = {},
): Model => ({
  dialog: DialogPrimitive.init({
    id: options.id ?? 'test-dialog',
    ...(options.isAnimated === undefined
      ? {}
      : { isAnimated: options.isAnimated }),
    ...(options.focusSelector === undefined
      ? {}
      : { focusSelector: options.focusSelector }),
  }),
  title: 'Edit profile',
  description:
    'description' in options
      ? options.description
      : 'Adjust your profile details',
  declineOpen: options.declineOpen ?? false,
  declineClose: options.declineClose ?? false,
  lastDialogMessage: 'none',
})

type DialogSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>
  initialFocusAttributes: () => ReadonlyArray<ChildAttribute>
}>

type DialogModule = Readonly<{
  dialog: <Msg>(
    props: Readonly<{
      model: DialogPrimitive.Model
      toParentMessage: (message: DialogPrimitive.Message) => Msg
      title: string
      description?: string
      content?: (slots: DialogSlots) => ReadonlyArray<Html>
      footer?: (slots: DialogSlots) => ReadonlyArray<Html>
      layout?: (
        parts: Readonly<{
          header: (props: { children: ReadonlyArray<Html | string> }) => Html
          title: (props: { children: ReadonlyArray<Html | string> }) => Html
          description: (props: {
            children: ReadonlyArray<Html | string>
          }) => Html
          footer: (props: { children: ReadonlyArray<Html | string> }) => Html
          close: (
            props?: Readonly<{
              children?: ReadonlyArray<Html | string>
              ariaLabel?: string
            }>,
          ) => Html
          closeButtonAttributes: ReadonlyArray<ChildAttribute>
          initialFocusAttributes: () => ReadonlyArray<ChildAttribute>
        }>,
      ) => ReadonlyArray<Html>
      showCloseButton?: boolean
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type SheetModule = Readonly<{
  init: (config: SheetBehavior.InitConfig) => SheetBehavior.Model
  sheet: <Msg>(
    props: Readonly<{
      model: SheetBehavior.Model
      toParentMessage: (message: SheetBehavior.Message) => Msg
      title: string
      description?: string
      side?: 'top' | 'right' | 'bottom' | 'left'
      direction?: 'ltr' | 'rtl'
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const dialogElement = Scene.role('dialog')
const dialogNamed = (name: string) => Scene.role('dialog', { name })
const panel = Scene.selector('[data-slot="dialog-content"]')
const backdrop = Scene.first(Scene.all.selector('dialog div'))
const closeButton = Scene.selector('[data-slot="dialog-close"]')
const title = Scene.selector('[data-slot="dialog-title"]')
const descriptionPart = Scene.selector('[data-slot="dialog-description"]')
const initialFocusMarker = '[data-foldkit-dialog-initial-focus]'
const lastDialogMessage = Scene.selector('[data-slot="last-dialog-message"]')
const openTrigger = Scene.role('button', { name: 'Open dialog' })
const closeTrigger = Scene.role('button', { name: 'Close dialog externally' })

/* One harness, flagged per test: the footer always carries a consumer-built
 * close button ("Done"), and `lastDialogMessage` renders the latest child
 * message the parent observed — the foldkit analogue of Base UI's
 * onOpenChangeComplete timing assertions. */
const dialogView =
  (
    Dialog: DialogModule,
    options: {
      showCloseButton?: boolean
      claimInitialFocusInFooter?: boolean
      layoutWithoutTitle?: boolean
    } = {},
  ) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.div(
      [],
      [
        h.button(
          [h.Type('button'), h.OnClick({ _tag: 'RequestedOpen' })],
          ['Open dialog'],
        ),
        h.button(
          [h.Type('button'), h.OnClick({ _tag: 'RequestedClose' })],
          ['Close dialog externally'],
        ),
        h.button(
          [
            h.Type('button'),
            h.OnClick({ _tag: 'ChangedTitle', title: 'Rename profile' }),
          ],
          ['Rename'],
        ),
        h.button(
          [
            h.Type('button'),
            h.OnClick({
              _tag: 'ChangedDescription',
              description: 'Updated details',
            }),
          ],
          ['Set description'],
        ),
        h.button(
          [
            h.Type('button'),
            h.OnClick({ _tag: 'ChangedDescription', description: undefined }),
          ],
          ['Clear description'],
        ),
        h.div(
          [h.DataAttribute('slot', 'last-dialog-message')],
          [model.lastDialogMessage],
        ),
        Dialog.dialog(
          {
            model: model.dialog,
            toParentMessage: message => ({ _tag: 'GotDialogMessage', message }),
            title: model.title,
            ...(model.description === undefined
              ? {}
              : { description: model.description }),
            ...(options.showCloseButton === undefined
              ? {}
              : { showCloseButton: options.showCloseButton }),
            content: () => [
              h.button(
                [
                  h.Type('button'),
                  h.OnClick({ _tag: 'InteractedInsidePanel' }),
                ],
                ['Inside panel action'],
              ),
            ],
            footer: slots => [
              h.button(
                [
                  ...slots.closeButton,
                  ...(options.claimInitialFocusInFooter
                    ? slots.initialFocusAttributes()
                    : []),
                  h.Id('done-button'),
                  h.Type('button'),
                ],
                ['Done'],
              ),
            ],
            ...(options.layoutWithoutTitle
              ? {
                  layout: parts => [
                    parts.footer({
                      children: [
                        h.button(
                          [...parts.closeButtonAttributes, h.Type('button')],
                          ['Done'],
                        ),
                      ],
                    }),
                  ],
                }
              : {}),
          },
          h,
        ),
      ],
    )

/* foldkit 0.164's Animation commands carry a `generation` arg that the result
   Messages must echo back. Read it off the pending Command so the test does
   not hardcode a generation number. */
const pendingAnimationGeneration = (
  commands: ReadonlyArray<
    Readonly<{ name: string; args?: Record<string, unknown> }>
  >,
  name = 'WaitForPaint',
): number => {
  const pending = commands.find(
    command =>
      command.name === name || command.name === 'WaitForAnimationSettled',
  )
  const generation = pending?.args?.['generation']
  if (typeof generation !== 'number') {
    throw new Error(`Expected a pending animation Command, found none.`)
  }
  return generation
}

/* Resolves the EnterStart → EnterAnimating (or LeaveStart → LeaveAnimating)
   paint+settle Command pair. Both waits share one transition generation. */
const animationPaintedThenSettled = (
  simulation: Scene.SceneSimulation<Model, Message, DialogPrimitive.OutMessage>,
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

/* Steps shared by most cases: drive a fresh open to fully settled. */
const openDialog = (
  options: { isAnimated?: boolean } = {},
): ReadonlyArray<
  Scene.SceneStep<Model, Message, DialogPrimitive.OutMessage>
> => [
  Scene.click(openTrigger),
  Scene.expectHandled(),
  Scene.expectOutMessage(DialogPrimitive.OutMessage.Opened()),
  Scene.Command.resolve(
    DialogPrimitive.ShowDialog,
    DialogPrimitive.Message.SucceededShowDialog(),
  ),
  ...(options.isAnimated ? [animationPaintedThenSettled] : []),
  Scene.Mount.resolve(
    DialogPrimitive.AcquireResources,
    DialogPrimitive.Message.SucceededAcquireResources(),
  ),
]

const verifyRenderer = (
  name: string,
  Dialog: DialogModule,
  Sheet: SheetModule,
) => {
  const view = dialogView(Dialog)
  const isTailwind = name === 'Tailwind'

  describe(`${name} Dialog (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('labels and describes the dialog via its title and description parts', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(dialogNamed('Edit profile')).toExist(),
          Scene.expect(dialogElement).toHaveAttr(
            'aria-labelledby',
            'test-dialog-dialog-title',
          ),
          Scene.expect(dialogElement).toHaveAttr(
            'aria-describedby',
            'test-dialog-dialog-description',
          ),
          Scene.expect(title).toHaveAttr('id', 'test-dialog-dialog-title'),
          Scene.expect(title).toHaveText('Edit profile'),
          Scene.expect(descriptionPart).toHaveAttr(
            'id',
            'test-dialog-dialog-description',
          ),
          Scene.expect(descriptionPart).toHaveText(
            'Adjust your profile details',
          ),
        )
      })

      it('omits aria-describedby when the dialog has no description part', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel({ description: undefined })),
          ...openDialog(),
          Scene.expect(dialogElement).toHaveAttr(
            'aria-labelledby',
            'test-dialog-dialog-title',
          ),
          Scene.expect(dialogElement).not.toHaveAttr('aria-describedby'),
          Scene.expect(descriptionPart).toBeAbsent(),
        )
      })

      it('keeps accessible names and descriptions in sync when label parts change', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(dialogNamed('Edit profile')).toExist(),
          Scene.expect(dialogElement).toHaveAccessibleDescription(
            'Adjust your profile details',
          ),
          Scene.click(Scene.role('button', { name: 'Rename' })),
          Scene.expectHandled(),
          Scene.expect(dialogNamed('Rename profile')).toExist(),
          Scene.click(Scene.role('button', { name: 'Set description' })),
          Scene.expectHandled(),
          Scene.expect(dialogElement).toHaveAccessibleDescription(
            'Updated details',
          ),
          Scene.click(Scene.role('button', { name: 'Clear description' })),
          Scene.expectHandled(),
          Scene.expect(dialogElement).not.toHaveAttr('aria-describedby'),
          Scene.expect(dialogElement).toHaveAttr(
            'aria-labelledby',
            'test-dialog-dialog-title',
          ),
        )
      })

      it('renders the title as a level-2 heading', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(
            Scene.role('heading', { name: 'Edit profile', level: 2 }),
          ).toExist(),
        )
      })

      it('exposes aria-modal only while the dialog is open', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          Scene.expect(dialogElement).not.toHaveAttr('aria-modal'),
          ...openDialog(),
          Scene.expect(dialogElement).toHaveAttr('aria-modal', 'true'),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expect(dialogElement).not.toHaveAttr('aria-modal'),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
        )
      })
    })

    describe('mounting', () => {
      it('keeps the <dialog> element mounted but empty while closed', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          Scene.expect(dialogElement).toExist(),
          // `open` is a DOM prop; the scene exposes it through toHaveAttr.
          Scene.expect(dialogElement).toHaveAttr('open', 'false'),
          Scene.expect(dialogElement).not.toHaveAttr('data-open'),
          Scene.expect(backdrop).toBeAbsent(),
          Scene.expect(panel).toBeAbsent(),
        )
      })

      it('marks the dialog element data-open while open', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(dialogElement).toHaveAttr('open', 'true'),
          Scene.expect(dialogElement).toHaveAttr('data-open', ''),
        )
      })

      // DIVERGENCE (intentional): the foldkit primitive always emits
      // aria-labelledby on the <dialog>, even under a custom layout that
      // renders no title part — the attribute then dangles, matching the
      // checkbox suite's documented dangling-label behavior.
      it('leaves a dangling aria-labelledby when a custom layout renders no title', () => {
        Scene.scene(
          { update, view: dialogView(Dialog, { layoutWithoutTitle: true }) },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(dialogElement).toHaveAttr(
            'aria-labelledby',
            'test-dialog-dialog-title',
          ),
          Scene.expect(title).toBeAbsent(),
        )
      })
    })

    describe('prop: onOpenChange', () => {
      it('calls onOpenChange with the new open state', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          // The DSL delivers at most one OutMessage per interaction, so a
          // single Closed emission is asserted by construction.
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
        )
      })

      it('calls onOpenChange when the user clicks the backdrop while the modal dialog is open', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
        )
      })

      it('calls onOpenChange when the close button is clicked', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.click(closeButton),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
        )
      })

      it('cancel() prevents opening while uncontrolled', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel({ declineOpen: true })),
          Scene.click(openTrigger),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(dialogElement).toHaveAttr('open', 'false'),
          Scene.expect(panel).toBeAbsent(),
          Scene.Command.expectNone(),
        )
      })

      it('does not emit an openchange when a close is canceled', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel({ declineClose: true })),
          ...openDialog(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(panel).toExist(),
          Scene.expect(dialogElement).toHaveAttr('open', 'true'),
          Scene.Command.expectNone(),
        )
      })

      it('does not change open state on non-main button presses', () => {
        // Base UI checks a right-button outside press over a real DOM event;
        // the scene equivalent is that the backdrop wires only `click` — no
        // mousedown/pointerdown/contextmenu handlers exist for a non-main
        // press to reach.
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(backdrop).toHaveHandler('click'),
          Scene.expect(backdrop).not.toHaveHandler('mousedown'),
          Scene.expect(backdrop).not.toHaveHandler('pointerdown'),
          Scene.expect(backdrop).not.toHaveHandler('contextmenu'),
        )
      })

      it('does not request another close when the dialog is already closed', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          Scene.click(closeTrigger),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(dialogElement).toHaveAttr('open', 'false'),
          Scene.Command.expectNone(),
        )
      })

      it.todo(
        'calls onOpenChange with the reason for change (foldkit emits a bare ' +
          'Opened/Closed tag — no reason/eventDetails payload)',
      )
      it.todo(
        'calls onOpenChange when pressed Esc while the dialog is open ' +
          '(no cancel step in the DSL; e2e/site.spec.ts covers Escape)',
      )
      it.todo(
        'calls onOpenChange when clicking outside a non-modal dialog ' +
          '(creaseui has no non-modal mode)',
      )
      it.todo(
        'detects clicks on a user-rendered backdrop (creaseui always renders ' +
          'its own backdrop; there is no backdrop part to replace)',
      )
    })

    describe('prop: disablePointerDismissal', () => {
      it.todo(
        'does not close on outside press when disablePointerDismissal ' +
          '(creaseui has no such prop — the backdrop always dismisses)',
      )
    })

    describe('outside press', () => {
      it('dismisses on a press outside the popup but not on presses inside it', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.click(Scene.role('button', { name: 'Inside panel action' })),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(dialogElement).toHaveAttr('open', 'true'),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
        )
      })

      it('rewires dismiss interactions after closing and reopening', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
          Scene.expect(panel).toBeAbsent(),
          ...openDialog(),
          Scene.expect(panel).toExist(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
        )
      })
    })

    describe('prop: modal', () => {
      it('renders an internal backdrop while the modal dialog is open', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(backdrop).toExist(),
          Scene.expect(dialogElement).toHaveAttr('aria-modal', 'true'),
        )
      })

      it.todo(
        'makes other interactive elements on the page inert while open ' +
          '(vnode-level DSL does not simulate page inertness)',
      )
      it.todo(
        'does not render an internal backdrop when modal is false ' +
          '(creaseui has no non-modal mode)',
      )
    })

    describe('prop: onOpenChangeComplete', () => {
      // foldkit has no completion callback; the parent observes the same
      // milestones as plain child messages (SucceededShowDialog /
      // CompletedCloseDialog / EndedAnimation) through GotDialogMessage.

      it('is not called on mount when not open', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          Scene.expect(lastDialogMessage).toHaveText('none'),
        )
      })

      it('notifies the parent when the open command resolves', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          Scene.click(openTrigger),
          Scene.expectHandled(),
          Scene.Command.resolve(
            DialogPrimitive.ShowDialog,
            DialogPrimitive.Message.SucceededShowDialog(),
          ),
          Scene.expect(lastDialogMessage).toHaveText('SucceededShowDialog'),
          Scene.Mount.resolve(
            DialogPrimitive.AcquireResources,
            DialogPrimitive.Message.SucceededAcquireResources(),
          ),
          Scene.expect(lastDialogMessage).toHaveText(
            'SucceededAcquireResources',
          ),
        )
      })

      it('notifies the parent when the close completes', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expect(lastDialogMessage).toHaveText('RequestedClose'),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
          Scene.expect(lastDialogMessage).toHaveText('CompletedCloseDialog'),
        )
      })

      it('waits for the leave animation before completing the close', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel({ isAnimated: true })),
          ...openDialog({ isAnimated: true }),
          Scene.click(backdrop),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          // Still leaving: no close-completion message has reached the parent.
          Scene.expect(lastDialogMessage).toHaveText('RequestedClose'),
          Scene.expect(panel).toExist(),
          animationPaintedThenSettled,
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
          Scene.expect(lastDialogMessage).toHaveText('CompletedCloseDialog'),
          Scene.expect(panel).toBeAbsent(),
        )
      })

      it.todo(
        'waits for a restarted enter animation to finish (close during ' +
          'EnterStart entangles pending enter/leave command ordering)',
      )
    })

    describe('<Dialog.Backdrop />', () => {
      // DIVERGENCE: Base UI renders its backdrop part with role="presentation".
      // creaseui's backdrop is a bare div with no role (the primitive carries
      // the a11y contract on <dialog> itself).
      it.fails('has role="presentation"', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(backdrop).toHaveAttr('role', 'presentation'),
        )
      })

      it.todo(
        'prop: forceRender (creaseui has no keepMounted/forceRender — the ' +
          'backdrop mounts only while the dialog is visible)',
      )
    })

    describe('<Dialog.Close />', () => {
      it('closes the dialog when clicked', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.click(closeButton),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
        )
      })

      it('renders as a real button with an accessible "Close" label', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(closeButton).toHaveAttr('type', 'button'),
          Scene.expect(closeButton).toHaveAttr('aria-label', 'Close'),
          Scene.expect(Scene.role('button', { name: 'Close' })).toExist(),
        )
      })

      it('closes the dialog from a consumer button built with closeButtonAttributes', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.click(Scene.selector('#done-button')),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
        )
      })

      it('does not request another close once the dialog is already closing', () => {
        // While the leave animation runs the primitive strips OnClick from
        // the backdrop and close button — a second request can't be raised.
        Scene.scene(
          { update, view },
          Scene.given(initialModel({ isAnimated: true })),
          ...openDialog({ isAnimated: true }),
          Scene.click(closeButton),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.expect(closeButton).not.toHaveHandler('click'),
          Scene.expect(backdrop).not.toHaveHandler('click'),
          Scene.expect(backdrop).toHaveAttr('data-leave'),
          Scene.expect(panel).toExist(),
          animationPaintedThenSettled,
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
        )
      })

      it.todo(
        'prop: disabled (the built-in close button has no disabled option; ' +
          'consumers disable their own closeButtonAttributes buttons)',
      )
    })

    describe('<Dialog.Popup />', () => {
      describe('prop: keepMounted', () => {
        it.todo(
          'keepMounted (creaseui always unmounts backdrop/panel on close — ' +
            'asserted throughout via toBeAbsent)',
        )
      })

      describe('prop: initialFocus', () => {
        it('defaults initial focus to the close button via the marker attribute', () => {
          Scene.scene(
            { update, view },
            Scene.given(initialModel()),
            Scene.click(openTrigger),
            Scene.expectHandled(),
            Scene.Command.expectHas(
              DialogPrimitive.ShowDialog({
                id: 'test-dialog',
                focusSelector: initialFocusMarker,
              }),
            ),
            Scene.Mount.expectHas(
              DialogPrimitive.AcquireResources({
                id: 'test-dialog',
                focusSelector: initialFocusMarker,
              }),
            ),
            Scene.Command.resolve(
              DialogPrimitive.ShowDialog,
              DialogPrimitive.Message.SucceededShowDialog(),
            ),
            Scene.Mount.resolve(
              DialogPrimitive.AcquireResources,
              DialogPrimitive.Message.SucceededAcquireResources(),
            ),
            Scene.expect(closeButton).toHaveAttr(
              'data-foldkit-dialog-initial-focus',
              '',
            ),
            Scene.expect(panel).not.toHaveAttr(
              'data-foldkit-dialog-initial-focus',
            ),
            Scene.expect(panel).not.toHaveAttr('tabindex'),
          )
        })

        it('moves the marker to the element that claims initialFocusAttributes', () => {
          Scene.scene(
            {
              update,
              view: dialogView(Dialog, { claimInitialFocusInFooter: true }),
            },
            Scene.given(initialModel()),
            ...openDialog(),
            Scene.expect(Scene.selector('#done-button')).toHaveAttr(
              'data-foldkit-dialog-initial-focus',
              '',
            ),
            Scene.expect(closeButton).not.toHaveAttr(
              'data-foldkit-dialog-initial-focus',
            ),
            Scene.expect(panel).not.toHaveAttr('tabindex'),
          )
        })

        it('falls back to the panel itself when nothing claims initial focus', () => {
          Scene.scene(
            {
              update,
              view: dialogView(Dialog, { showCloseButton: false }),
            },
            Scene.given(initialModel()),
            ...openDialog(),
            Scene.expect(closeButton).toBeAbsent(),
            Scene.expect(panel).toHaveAttr(
              'data-foldkit-dialog-initial-focus',
              '',
            ),
            Scene.expect(panel).toHaveAttr('tabindex', '-1'),
          )
        })

        it('passes a custom focusSelector through to the runtime commands', () => {
          Scene.scene(
            { update, view },
            Scene.given(initialModel({ focusSelector: '#name-input' })),
            Scene.click(openTrigger),
            Scene.expectHandled(),
            Scene.Command.expectHas(
              DialogPrimitive.ShowDialog({
                id: 'test-dialog',
                focusSelector: '#name-input',
              }),
            ),
            Scene.Mount.expectHas(
              DialogPrimitive.AcquireResources({
                id: 'test-dialog',
                focusSelector: '#name-input',
              }),
            ),
            Scene.Command.resolve(
              DialogPrimitive.ShowDialog,
              DialogPrimitive.Message.SucceededShowDialog(),
            ),
            Scene.Mount.resolve(
              DialogPrimitive.AcquireResources,
              DialogPrimitive.Message.SucceededAcquireResources(),
            ),
          )
        })

        it('applies initial focus markers only while the dialog is open', () => {
          Scene.scene(
            { update, view },
            Scene.given(initialModel()),
            ...openDialog(),
            Scene.click(closeButton),
            Scene.expectHandled(),
            Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
            Scene.Command.resolve(
              DialogPrimitive.CloseDialog,
              DialogPrimitive.Message.CompletedCloseDialog(),
            ),
            Scene.expect(Scene.selector(initialFocusMarker)).toBeAbsent(),
          )
        })

        it.todo(
          'focuses the element provided by initialFocus props, touch vs ' +
            'keyboard interaction types, and display:contents wrappers ' +
            '(creaseui claims focus via initialFocusAttributes and the DSL ' +
            'performs no real focus movement — e2e coverage)',
        )
      })

      describe('prop: finalFocus', () => {
        it.todo(
          'focuses the trigger (or a custom target) when closed — creaseui ' +
            'has no finalFocus prop and the DSL performs no real focus ' +
            'movement (e2e/site.spec.ts covers focus restore)',
        )
      })
    })

    describe('Escape key dismissal', () => {
      it('wires a cancel handler that prevents the native Escape default', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          ...openDialog(),
          Scene.expect(dialogElement).toHaveHandler('cancel'),
        )
      })

      it.todo(
        'closes the dialog when pressed Esc — the foldkit cancel handler only ' +
          'dispatches on its own CustomEvent and the DSL has no cancel step ' +
          '(e2e/site.spec.ts covers Escape)',
      )
    })

    describe('command lifecycle', () => {
      it('rolls back to closed when the show command fails', () => {
        Scene.scene(
          { update, view },
          Scene.given(initialModel()),
          Scene.click(openTrigger),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Opened()),
          Scene.Command.resolve(
            DialogPrimitive.ShowDialog,
            DialogPrimitive.Message.FailedShowDialog(),
          ),
          Scene.expect(dialogElement).toHaveAttr('open', 'false'),
          Scene.expect(panel).toBeAbsent(),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
        )
      })

      it.todo(
        'releases dialog resources when the component unmounts while open ' +
          '(the scene DSL does not fire OnUnmount hooks)',
      )
    })

    describe('sheet coverage (same primitive)', () => {
      const sheetView =
        (options: {
          side?: 'top' | 'right' | 'bottom' | 'left'
          rtl?: boolean
        }) =>
        (model: Model, h: HtmlBuilder<Message>): Html =>
          h.div(
            [],
            [
              h.button(
                [h.Type('button'), h.OnClick({ _tag: 'RequestedOpen' })],
                ['Open dialog'],
              ),
              Sheet.sheet(
                {
                  model: {
                    ...Sheet.init({ id: 'test-sheet' }),
                    dialog: model.dialog,
                  },
                  toParentMessage: message => ({
                    _tag: 'GotSheetMessage',
                    message,
                  }),
                  title: 'Sheet title',
                  description: 'Sheet description',
                  ...(options.side === undefined ? {} : { side: options.side }),
                  ...(options.rtl ? { direction: 'rtl' as const } : {}),
                },
                h,
              ),
            ],
          )

      it('labels and describes the sheet dialog the same way', () => {
        Scene.scene(
          { update, view: sheetView({}) },
          Scene.given(initialModel({ id: 'test-sheet' })),
          ...openDialog(),
          Scene.expect(Scene.selector('[data-slot="sheet"]')).toHaveAttr(
            'aria-modal',
            'true',
          ),
          Scene.expect(Scene.selector('[data-slot="sheet"]')).toHaveAttr(
            'aria-labelledby',
            'test-sheet-dialog-title',
          ),
          Scene.expect(Scene.selector('[data-slot="sheet-title"]')).toHaveText(
            'Sheet title',
          ),
          Scene.expect(
            Scene.selector('[data-slot="sheet-description"]'),
          ).toHaveText('Sheet description'),
        )
      })

      it('closes when its overlay is clicked', () => {
        Scene.scene(
          { update, view: sheetView({}) },
          Scene.given(initialModel({ id: 'test-sheet' })),
          ...openDialog(),
          Scene.click(Scene.selector('[data-slot="sheet-overlay"]')),
          Scene.expectHandled(),
          Scene.expectOutMessage(DialogPrimitive.OutMessage.Closed()),
          Scene.expect(
            Scene.selector('[data-slot="sheet-content"]'),
          ).toBeAbsent(),
          Scene.Mount.expectEnded(DialogPrimitive.AcquireResources),
          Scene.Command.resolve(
            DialogPrimitive.CloseDialog,
            DialogPrimitive.Message.CompletedCloseDialog(),
          ),
        )
      })

      it('positions the panel on the requested side', () => {
        Scene.scene(
          { update, view: sheetView({ side: 'left' }) },
          Scene.given(initialModel({ id: 'test-sheet' })),
          ...openDialog(),
          Scene.expect(Scene.selector('[data-slot="sheet-content"]')).toExist(),
          // The side is expressed purely in classes; they are only stable in
          // the Tailwind renderer (StyleX hashes atomic class names).
          ...(isTailwind
            ? [
                Scene.expect(Scene.selector('[data-slot="sheet"]')).toHaveClass(
                  'justify-start',
                ),
                Scene.expect(
                  Scene.selector('[data-slot="sheet-content"]'),
                ).toHaveClass('border-r'),
              ]
            : []),
        )
      })

      it('renders dir=rtl on the panel when direction is rtl', () => {
        Scene.scene(
          { update, view: sheetView({ rtl: true }) },
          Scene.given(initialModel({ id: 'test-sheet' })),
          ...openDialog(),
          Scene.expect(
            Scene.selector('[data-slot="sheet-content"]'),
          ).toHaveAttr('dir', 'rtl'),
        )
      })

      it('defaults initial focus to its close button via the marker attribute', () => {
        Scene.scene(
          { update, view: sheetView({}) },
          Scene.given(initialModel({ id: 'test-sheet' })),
          ...openDialog(),
          Scene.expect(Scene.selector('[data-slot="sheet-close"]')).toHaveAttr(
            'data-foldkit-dialog-initial-focus',
            '',
          ),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindDialog, TailwindSheet)
verifyRenderer('StyleX', StyleXDialog, StyleXSheet)
