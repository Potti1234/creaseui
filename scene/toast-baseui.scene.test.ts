import { Duration } from 'effect'
import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as ToastBehavior from '@/lib/toast'
import * as StyleXToast from '@/stylex/toast'
import * as TailwindToast from '@/ui/toast'

/**
 * Behavioral parity suite ported from Base UI's toast tests
 * (base-ui/packages/react/src/toast/** — createToastManager.test.tsx,
 * useToastManager.test.tsx, root/ToastRoot.test.tsx,
 * viewport/ToastViewport.test.tsx, and the provider/positioner/portal/
 * content/title/description/action/close/arrow part suites — checked at
 * base-ui HEAD).
 *
 * creaseui's toast component is a recipe alias over the Sonner-style
 * notification engine in `@/lib/toast`: the parent owns the Model,
 * `show`/`updateToast`/`dismiss`/`dismissAll` return versioned timer
 * Commands, and the view renders one <section> live region per active
 * position holding role=status|alert articles. Base UI's fake-timer cases
 * are ported by asserting and resolving the scheduled
 * `WaitBeforeDismissing` Commands directly — the pending Command IS the
 * timer, so "auto-dismisses after N ms" reads as "resolving that Command
 * removes the entry".
 *
 * Base UI cases with no creaseui analogue are recorded here instead of
 * being dropped silently:
 *  - React internals: describeConformance, ref callbacks, StrictMode,
 *    provider prop-sync ordering before layout effects, "object identity"
 *    store bookkeeping in ToastRoot.
 *  - `render=` / childless render-prop and element-substitution cases in
 *    ToastAction/ToastTitle/ToastDescription/ToastArrow (foldkit fixes
 *    the rendered element).
 *  - All ToastRoot swipe/drag-dismissal tests: thresholds, axis locking,
 *    multi-direction swipes, `data-swiping`/`data-swipe-direction`,
 *    swipe-ignore attributes, touch-capture — no pointer streams in the
 *    scene DSL.
 *  - ToastPositioner anchoring/`--toast-index` offsets, ToastArrow, and
 *    ToastPortal — creaseui positions each entry into a named position
 *    section instead of floating-ui anchoring, and renders no portal.
 *  - Viewport focus management: F6 focus, Tab/Shift+Tab guards, focus
 *    hand-off to the next toast, Escape-scoped-to-portals — no real focus
 *    in the DSL.
 *  - ending/transitionStatus animation phases, `updateKey`, and
 *    onRemove-vs-onClose staging — creaseui removes entries synchronously
 *    and has no exit-animation state; DismissedToast doubles as removal.
 *  - `add` accepting a caller-specified id / upsert-by-add — creaseui
 *    generates ids as `${modelId}-${nextId}`; `updateToast` is the update
 *    path. "returns a toast id" has no scene-visible analogue.
 *  - `update(id, fn)` function-updater form — `updateToast` takes a
 *    partial input object.
 *  - `manager.promise(...)` loading/success/error lifecycle — creaseui
 *    exposes variant helpers (`success`/`error`/…) + `updateToast` for the
 *    resolved state instead.
 *  - Provider-level `timeout`/`limit` props — there is no provider;
 *    duration is per-entry and there is no cap on visible toasts.
 *  - "in dialog" aria-hidden interplay — Dialog+Toast composition is not
 *    a vnode-level concern here.
 *  - Event-object payloads (`eventDetails.cancel()`, modifier reporting)
 *    — foldkit dispatches plain messages.
 *
 * Scene mechanics worth knowing: `WaitBeforeDismissing` is an unkeyed
 * Command, so the DSL refuses to dispatch a new Message while one is
 * pending (unkeyed Commands must resolve before the next interaction).
 * Tests that need a toast AND further interaction therefore either seed
 * entries through `Scene.given` (a seeded entry carries timer state as
 * data, with no pending Command) or add sticky toasts (which never
 * schedule one). Stale-timer and pause/resume completions are delivered
 * with `Scene.Subscription.emit` once no Command is pending.
 */

type Model = Readonly<{
  toasts: ToastBehavior.Model
}>

type Message = Readonly<
  | { _tag: 'ClickedAdd'; input: ToastBehavior.ShowInput }
  | { _tag: 'ClickedUpdateFirst'; input: ToastBehavior.UpdateInput }
  | { _tag: 'ClickedDismissFirst' }
  | { _tag: 'ClickedDismissUnknown' }
  | { _tag: 'ClickedDismissAll' }
  | { _tag: 'GotToastMessage'; message: ToastBehavior.Message }
>

const initialModel = (): Model => ({
  toasts: ToastBehavior.init({ id: 'toasts' }),
})

type ToastUpdateReturn = ReturnType<typeof ToastBehavior.update>

const foldToast = (model: Model, result: ToastUpdateReturn) => ({
  model: { ...model, toasts: result.model },
  commands: Command.mapMessages(
    result.commands ?? [],
    (message): Message => ({ _tag: 'GotToastMessage', message }),
  ),
  outMessage: result.outMessage,
})

const update = (model: Model, message: Message): ReturnType<typeof foldToast> => {
  switch (message._tag) {
    case 'ClickedAdd':
      return foldToast(model, ToastBehavior.show(model.toasts, message.input))
    case 'ClickedUpdateFirst': {
      const first = model.toasts.entries[0]
      return first === undefined
        ? { model }
        : foldToast(model, ToastBehavior.updateToast(model.toasts, first.id, message.input))
    }
    case 'ClickedDismissFirst': {
      const first = model.toasts.entries[0]
      return first === undefined
        ? { model }
        : foldToast(model, ToastBehavior.dismiss(model.toasts, first.id))
    }
    case 'ClickedDismissUnknown':
      return foldToast(model, ToastBehavior.dismiss(model.toasts, 'toasts-999'))
    case 'ClickedDismissAll':
      return foldToast(model, ToastBehavior.dismissAll(model.toasts))
    case 'GotToastMessage':
      return foldToast(model, ToastBehavior.update(model.toasts, message.message))
  }
}

type SonnerFn = <Msg>(
  props: {
    model: ToastBehavior.Model
    toParentMessage: (message: ToastBehavior.Message) => Msg
    ariaLabel?: string
    pausePolicy?: 'none' | 'pointer'
    position?: ToastBehavior.Position
  },
  h: HtmlBuilder<Msg>,
) => Html

type ToastModule = Readonly<{ sonner: SonnerFn }>

const DEFAULT: ToastBehavior.ShowInput = ToastBehavior.plain({
  title: 'Saved',
  description: 'Sunday at 9:00 AM',
  actionLabel: 'Undo',
})
const TIMED: ToastBehavior.ShowInput = ToastBehavior.info({
  title: 'Heads up',
  duration: '1 second',
})
const STICKY_ERROR: ToastBehavior.ShowInput = ToastBehavior.error({
  title: 'Could not save changes',
  description: 'Try again in a moment.',
  sticky: true,
})
const STICKY_INFO: ToastBehavior.ShowInput = ToastBehavior.info({
  title: 'Still here',
  sticky: true,
})
const STICKY_UNDO: ToastBehavior.ShowInput = ToastBehavior.plain({
  title: 'Saved',
  actionLabel: 'Undo',
  sticky: true,
})
const STICKY_POSITIONED: ToastBehavior.ShowInput = ToastBehavior.plain({
  title: 'Pinned',
  position: 'top-left',
  sticky: true,
})
const ZERO_TIMEOUT: ToastBehavior.ShowInput = ToastBehavior.plain({
  title: 'Zero',
  duration: '0 millis',
})

const triggerButton = <Msg>(label: string, message: Msg, h: HtmlBuilder<Msg>): Html =>
  h.button([h.Type('button'), h.OnClick(message)], [label])

const makeView =
  (Toast: ToastModule, props?: { pausePolicy?: 'none' | 'pointer' }) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.div(
      [],
      [
        triggerButton('add', { _tag: 'ClickedAdd', input: DEFAULT }, h),
        triggerButton('add timed', { _tag: 'ClickedAdd', input: TIMED }, h),
        triggerButton('add sticky', { _tag: 'ClickedAdd', input: STICKY_ERROR }, h),
        triggerButton(
          'add sticky info',
          { _tag: 'ClickedAdd', input: STICKY_INFO },
          h,
        ),
        triggerButton(
          'add sticky action',
          { _tag: 'ClickedAdd', input: STICKY_UNDO },
          h,
        ),
        triggerButton('add zero', { _tag: 'ClickedAdd', input: ZERO_TIMEOUT }, h),
        triggerButton(
          'add positioned sticky',
          { _tag: 'ClickedAdd', input: STICKY_POSITIONED },
          h,
        ),
        triggerButton(
          'update first',
          { _tag: 'ClickedUpdateFirst', input: { title: 'Updated' } },
          h,
        ),
        triggerButton(
          'arm first timer',
          {
            _tag: 'ClickedUpdateFirst',
            input: { duration: '1 second', sticky: false },
          },
          h,
        ),
        triggerButton('dismiss first', { _tag: 'ClickedDismissFirst' }, h),
        triggerButton('dismiss unknown', { _tag: 'ClickedDismissUnknown' }, h),
        // A foldkit update emits at most one OutMessage per call, so an
        // observable bulk dismiss is one Dismissed dispatch per entry
        // (Base UI fires each toast's onClose on close()); the trailing
        // ClickedDismissAll clears whatever remains.
        h.button(
          [
            h.Type('button'),
            ...model.toasts.entries.map(entry =>
              h.OnClick({
                _tag: 'GotToastMessage',
                message: ToastBehavior.Message.Dismissed({ id: entry.id }),
              })),
            h.OnClick({ _tag: 'ClickedDismissAll' }),
          ],
          ['dismiss all'],
        ),
        Toast.sonner(
          {
            model: model.toasts,
            toParentMessage: message => ({ _tag: 'GotToastMessage', message }),
            ariaLabel: 'Notifications',
            ...(props?.pausePolicy === undefined
              ? {}
              : { pausePolicy: props.pausePolicy }),
          },
          h,
        ),
      ],
    )

/** Rebuilds the Entry `show` produces so OutMessage assertions compare the
 *  full payload, not just the title. */
const entryOf = (id: string, input: ToastBehavior.ShowInput): ToastBehavior.Entry => ({
  id,
  payload: {
    title: input.title,
    ...(input.description === undefined ? {} : { description: input.description }),
    ...(input.actionLabel === undefined ? {} : { actionLabel: input.actionLabel }),
    ...(input.position === undefined ? {} : { position: input.position }),
  },
  variant: input.variant,
  sticky: input.sticky ?? false,
  durationMs: Math.max(0, Duration.toMillis(input.duration ?? '4 seconds')),
  timerVersion: 0,
  isPaused: false,
})

/** A Model with entries already showing — the scene-level stand-in for
 *  toasts whose timers are in flight. Seeded entries produce no pending
 *  Commands, so interactions and Subscription.emit stay available. */
const seededModel = (
  ...entries: ReadonlyArray<ToastBehavior.Entry>
): Model => ({
  toasts: { id: 'toasts', nextId: entries.length, entries: [...entries] },
})

const toastLocator = Scene.selector('[data-slot="sonner-toast"]')
const allToasts = Scene.all.selector('[data-slot="sonner-toast"]')
const notificationsRegion = Scene.role('region', { name: 'Notifications' })
const dismissButton = Scene.role('button', { name: 'Dismiss notification' })
const actionButton = Scene.role('button', { name: 'Undo' })

const verifyRenderer = (name: string, Toast: ToastModule) => {
  describe(`${name} Toast (Base UI port)`, () => {
    describe('add', () => {
      // DIVERGENCE (intentional): Base UI's default timeout is 5000ms
      // (Toast.Provider default); creaseui follows Sonner's 4000ms default.
      it('adds a toast to the viewport that auto-dismisses after the default timeout', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.expect(toastLocator).toBeAbsent(),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toExist(),
          Scene.expect(toastLocator).toContainText('Saved'),
          Scene.Command.expectHas(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 4000,
              timerVersion: 0,
            }),
          ),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 4000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
          Scene.expect(toastLocator).toBeAbsent(),
          Scene.expectOutMessage(
            ToastBehavior.OutMessage.DismissedToast({
              entry: entryOf('toasts-0', DEFAULT),
            }),
          ),
        )
      })

      // Base UI upserts on `add` with an existing caller-specified id.
      // creaseui ids are always generated, so a second show appends a
      // second entry; `updateToast` is the equivalent "same toast" path.
      // Entries render newest-first, matching Base UI's DOM order.
      it('appends a second toast rather than upserting (no caller-specified ids)', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          Scene.expectAll(allToasts).toHaveCount(2),
          Scene.expect(Scene.nth(allToasts, 0)).toContainText('Still here'),
          Scene.expect(Scene.nth(allToasts, 1)).toContainText(
            'Could not save changes',
          ),
        )
      })

      it('keeps multiple toast models isolated when one updates', () => {
        type DualModel = Readonly<{ a: ToastBehavior.Model; b: ToastBehavior.Model }>
        type DualMessage = Readonly<
          | { _tag: 'AddA' }
          | { _tag: 'DismissAllB' }
          | { _tag: 'GotA'; message: ToastBehavior.Message }
          | { _tag: 'GotB'; message: ToastBehavior.Message }
        >
        const fold =
          (lane: 'a' | 'b') =>
          (model: DualModel, result: ToastUpdateReturn) => ({
            model: { ...model, [lane]: result.model },
            commands: Command.mapMessages(
              result.commands ?? [],
              (message): DualMessage => ({
                _tag: lane === 'a' ? 'GotA' : 'GotB',
                message,
              }),
            ),
            outMessage: result.outMessage,
          })
        const dualUpdate = (model: DualModel, message: DualMessage) => {
          switch (message._tag) {
            case 'AddA':
              return fold('a')(model, ToastBehavior.show(model.a, STICKY_ERROR))
            case 'DismissAllB':
              return fold('b')(model, ToastBehavior.dismissAll(model.b))
            case 'GotA':
              return fold('a')(model, ToastBehavior.update(model.a, message.message))
            case 'GotB':
              return fold('b')(model, ToastBehavior.update(model.b, message.message))
          }
        }
        const dualView = (model: DualModel, h: HtmlBuilder<DualMessage>): Html =>
          h.div(
            [],
            [
              triggerButton('add a', { _tag: 'AddA' }, h),
              triggerButton('dismiss all b', { _tag: 'DismissAllB' }, h),
              Toast.sonner(
                {
                  model: model.a,
                  toParentMessage: message => ({ _tag: 'GotA', message }),
                  ariaLabel: 'Lane A',
                },
                h,
              ),
              Toast.sonner(
                {
                  model: model.b,
                  toParentMessage: message => ({ _tag: 'GotB', message }),
                  ariaLabel: 'Lane B',
                },
                h,
              ),
            ],
          )
        Scene.scene(
          { update: dualUpdate, view: dualView },
          Scene.given({
            a: ToastBehavior.init({ id: 'lane-a' }),
            b: ToastBehavior.init({ id: 'lane-b' }),
          }),
          Scene.click(Scene.role('button', { name: 'add a' })),
          Scene.expectHandled(),
          Scene.inside(
            Scene.role('region', { name: 'Lane A' }),
            Scene.expectAll(allToasts).toHaveCount(1),
          ),
          Scene.inside(
            Scene.role('region', { name: 'Lane B' }),
            Scene.expectAll(allToasts).toHaveCount(0),
          ),
          Scene.click(Scene.role('button', { name: 'dismiss all b' })),
          Scene.expectHandled(),
          Scene.inside(
            Scene.role('region', { name: 'Lane A' }),
            Scene.expectAll(allToasts).toHaveCount(1),
          ),
        )
      })
    })

    describe('option: timeout', () => {
      it('dismisses the toast after the specified timeout', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add timed' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toExist(),
          Scene.Command.expectHas(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 0,
            }),
          ),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      // Base UI treats `timeout: 0` as "never auto-dismiss"; creaseui
      // skips scheduling when durationMs is 0 (`sticky` remains the
      // explicit opt-out).
      it('does not auto-dismiss when the timeout is 0', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add zero' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toExist(),
          Scene.Command.expectNone(),
        )
      })

      it('never schedules a timer for sticky toasts', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(Scene.role('alert')).toExist(),
          Scene.Command.expectNone(),
        )
      })
    })

    describe('option: onClose', () => {
      it('emits DismissedToast when the toast is closed', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.click(dismissButton),
          Scene.expectHandled(),
          Scene.expectOutMessage(
            ToastBehavior.OutMessage.DismissedToast({
              entry: entryOf('toasts-0', STICKY_ERROR),
            }),
          ),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('emits DismissedToast when the toast auto-dismisses', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add timed' })),
          Scene.expectHandled(),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
          Scene.expectOutMessage(
            ToastBehavior.OutMessage.DismissedToast({
              entry: entryOf('toasts-0', TIMED),
            }),
          ),
        )
      })
    })

    describe('update', () => {
      it('updates the toast', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toContainText('Could not save changes'),
          Scene.click(Scene.role('button', { name: 'update first' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toContainText('Updated'),
          Scene.expectAll(allToasts).toHaveCount(1),
        )
      })

      it('resets the auto-dismiss timer when updating with the same timeout value', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          // The seeded entry stands in for a toast whose v1 timer is in
          // flight — seeding keeps no Command pending so the stale
          // completion below can be emitted before updating.
          Scene.given(
            seededModel({ ...entryOf('toasts-0', DEFAULT), timerVersion: 1 }),
          ),
          // A completion for the superseded v0 timer is ignored.
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message:
              ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
                id: 'toasts-0',
                timerVersion: 0,
              }),
          }),
          Scene.expect(toastLocator).toExist(),
          Scene.expect(toastLocator).toContainText('Saved'),
          Scene.click(Scene.role('button', { name: 'update first' })),
          Scene.expectHandled(),
          // updateToast bumps timerVersion and reschedules under v2.
          Scene.Command.expectExact(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 4000,
              timerVersion: 2,
            }),
          ),
          Scene.expect(toastLocator).toContainText('Updated'),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 4000,
              timerVersion: 2,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 2,
            }),
          ),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('auto-dismisses when a sticky toast gains a timeout', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.Command.expectNone(),
          Scene.click(Scene.role('button', { name: 'arm first timer' })),
          Scene.expectHandled(),
          Scene.Command.expectHas(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 1,
            }),
          ),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 1,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 1,
            }),
          ),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })
    })

    describe('close', () => {
      it('closes a toast when its dismiss button is clicked', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toExist(),
          Scene.click(dismissButton),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('closes all toasts', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          Scene.expectAll(allToasts).toHaveCount(2),
          Scene.click(Scene.role('button', { name: 'dismiss all' })),
          Scene.expectHandled(),
          Scene.expectAll(allToasts).toHaveCount(0),
        )
      })

      // Base UI fires each toast's onClose when close() clears the list.
      // foldkit caps updates at one OutMessage per call, so the creaseui
      // analogue is a Dismissed dispatch per entry — each still surfaces
      // its own DismissedToast.
      it('emits a dismissal message for every toast closed by dismissAll', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          Scene.click(Scene.role('button', { name: 'dismiss all' })),
          Scene.expectHandled(),
          Scene.expectOutMessages(
            ToastBehavior.OutMessage.DismissedToast({
              entry: entryOf('toasts-0', STICKY_ERROR),
            }),
            ToastBehavior.OutMessage.DismissedToast({
              entry: entryOf('toasts-1', STICKY_INFO),
            }),
          ),
        )
      })

      it('is a no-op when dismissing an id that is not showing', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.click(Scene.role('button', { name: 'dismiss unknown' })),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(toastLocator).toExist(),
        )
      })
    })

    describe('timers', () => {
      it('pauses timers when hovering', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          // Seeded non-sticky entry — a pending Command would block the
          // hover interaction, so the in-flight timer is model state only.
          Scene.given(seededModel(entryOf('toasts-0', TIMED))),
          Scene.hover(toastLocator),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toHaveAttr('data-paused', 'true'),
          // The in-flight timer still completes, but a paused entry
          // ignores it and stays rendered.
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message:
              ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
                id: 'toasts-0',
                timerVersion: 0,
              }),
          }),
          Scene.expect(toastLocator).toExist(),
        )
      })

      it('resumes timers when not hovering', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(seededModel(entryOf('toasts-0', TIMED))),
          Scene.hover(toastLocator),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toHaveAttr('data-paused', 'true'),
          // The DSL has no mouseleave/unhover step — emit the ResumedToast
          // the OnMouseLeave handler dispatches (wiring asserted via
          // toHaveHandler below).
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message: ToastBehavior.Message.ResumedToast({ id: 'toasts-0' }),
          }),
          Scene.expect(toastLocator).toHaveAttr('data-paused', 'false'),
          Scene.expect(toastLocator).toHaveHandler('mouseleave'),
          // Resuming bumps the version and re-arms a fresh timer.
          Scene.Command.expectHas(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 1,
            }),
          ),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 1,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 1,
            }),
          ),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      // creaseui extension with no Base UI analogue: pause-on-hover is
      // opt-out via `pausePolicy` and is skipped entirely for sticky
      // entries (there is no timer to pause).
      it('does not wire pause handlers when pausePolicy is none', () => {
        Scene.scene(
          { update, view: makeView(Toast, { pausePolicy: 'none' }) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).not.toHaveHandler('mouseenter'),
          Scene.expect(toastLocator).not.toHaveHandler('mouseleave'),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 4000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
        )
      })

      it('does not wire pause handlers on sticky toasts', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(Scene.role('alert')).not.toHaveHandler('mouseenter'),
          Scene.expect(Scene.role('alert')).not.toHaveHandler('mouseleave'),
        )
      })

      it.todo(
        'pauses timers when the viewport is focused — creaseui has no ' +
          'focus-pause (and the DSL has no real focus)',
      )
    })

    describe('ARIA attributes', () => {
      it('renders the viewport as a labelled polite live region', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.expect(notificationsRegion).toExist(),
          Scene.expect(notificationsRegion).toHaveAttr('aria-live', 'polite'),
          Scene.expect(notificationsRegion).toHaveAttr(
            'data-slot',
            'sonner',
          ),
          Scene.expect(notificationsRegion).toHaveAttr(
            'data-position',
            'bottom-right',
          ),
        )
      })

      // Base UI's Toast.Viewport also emits aria-atomic="false" and
      // aria-relevant="additions text" so additions read as a group.
      it('marks the live region aria-atomic=false and aria-relevant="additions text"', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.expect(notificationsRegion).toHaveAttr('aria-atomic', 'false'),
          Scene.expect(notificationsRegion).toHaveAttr(
            'aria-relevant',
            'additions text',
          ),
        )
      })

      it('maps each entry to a live-region role by variant', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          Scene.expect(
            Scene.first(
              Scene.filter(Scene.all.role('status'), { hasText: 'Still here' }),
            ),
          ).toExist(),
          Scene.expect(
            Scene.first(
              Scene.filter(Scene.all.role('alert'), {
                hasText: 'Could not save changes',
              }),
            ),
          ).toExist(),
          Scene.expect(
            Scene.first(
              Scene.filter(allToasts, { hasText: 'Still here' }),
            ),
          ).toHaveAttr('data-variant', 'info'),
          Scene.expect(
            Scene.first(
              Scene.filter(allToasts, { hasText: 'Could not save changes' }),
            ),
          ).toHaveAttr('data-variant', 'error'),
        )
      })

      // Base UI's Toast.Root is a labelled dialog — role="dialog" with
      // aria-modal="false" — while the variant live-region role
      // (status|alert) lives on the inner content node.
      it('renders the toast root as role=dialog with aria-modal=false', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(Scene.role('dialog')).toExist(),
          Scene.expect(Scene.role('dialog')).toHaveAttr('aria-modal', 'false'),
        )
      })

      // Base UI wires aria-labelledby from the rendered Toast.Title id;
      // creaseui's title node carries `${entry.id}-title`.
      it('wires aria-labelledby from the rendered title', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toHaveAttr('aria-labelledby'),
        )
      })

      // Same wiring for aria-describedby / the description node
      // (`${entry.id}-description`); the attr is emitted only when a
      // description rendered, matching Base UI.
      it('wires aria-describedby from the rendered description', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toHaveAttr('aria-describedby'),
        )
      })

      // Base UI dismisses the focused toast on Escape; each entry's
      // dialog root handles keydown and dispatches Dismissed.
      it('closes the toast when Escape is pressed', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.keydown(toastLocator, 'Escape'),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('gives the dismiss control an accessible name', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(dismissButton).toExist(),
          Scene.expect(dismissButton).toHaveAccessibleName(
            'Dismiss notification',
          ),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 4000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
        )
      })
    })

    describe('<Toast.Action />', () => {
      it('performs an action when clicked', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky action' })),
          Scene.expectHandled(),
          Scene.expect(actionButton).toExist(),
          Scene.click(actionButton),
          Scene.expectHandled(),
          // Base UI's action callback maps to the ActivatedToast
          // OutMessage; activation also removes the entry.
          Scene.expectOutMessage(
            ToastBehavior.OutMessage.ActivatedToast({
              entry: entryOf('toasts-0', STICKY_UNDO),
            }),
          ),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('does not render if the toast has no action', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add timed' })),
          Scene.expectHandled(),
          Scene.inside(
            toastLocator,
            Scene.expectAll(Scene.all.role('button')).toHaveCount(1),
          ),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
        )
      })
    })

    describe('<Toast.Title />', () => {
      // creaseui requires a non-empty title for every entry, so the title
      // always renders (Base UI's "does not render if it has no children"
      // has no analogue — title is a required field).
      it('always renders the title', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Saved')).toExist(),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 4000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
        )
      })
    })

    describe('<Toast.Description />', () => {
      it('renders the description when provided', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Sunday at 9:00 AM')).toExist(),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 4000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
        )
      })

      it('does not render a description element when none is provided', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add timed' })),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Heads up')).toExist(),
          // The TIMED input has no description; the article renders only
          // the title node (plus its dismiss control).
          Scene.expect(toastLocator).not.toContainText('Sunday at 9:00 AM'),
          Scene.Command.resolve(
            ToastBehavior.WaitBeforeDismissing({
              id: 'toasts-0',
              durationMs: 1000,
              timerVersion: 0,
            }),
            ToastBehavior.Message.CompletedWaitBeforeDismissingToast({
              id: 'toasts-0',
              timerVersion: 0,
            }),
          ),
        )
      })
    })

    describe('<Toast.Content />', () => {
      it.todo(
        'marks content behind the frontmost toast with data-behind / ' +
          'reflects data-expanded on viewport hover — creaseui has no ' +
          'expanded/frontmost state (entries pause individually)',
      )
    })

    describe('positioning', () => {
      // Scene-level analogue of Toast.Positioner carrying per-toast
      // placement: an entry may override the viewport position and lands
      // in the matching section.
      it('renders an entry under its own position section', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.click(Scene.role('button', { name: 'add positioned sticky' })),
          Scene.expectHandled(),
          Scene.expect(
            Scene.selector('section[data-position="top-left"]'),
          ).toExist(),
          Scene.expect(
            Scene.selector('section[data-position="bottom-right"]'),
          ).toExist(),
          Scene.expect(
            Scene.within(
              Scene.selector('section[data-position="top-left"]'),
              Scene.role('status'),
            ),
          ).toContainText('Pinned'),
          Scene.expect(
            Scene.within(
              Scene.selector('section[data-position="bottom-right"]'),
              Scene.role('alert'),
            ),
          ).toContainText('Could not save changes'),
        )
      })
    })

    describe('ordering', () => {
      // Base UI keeps toasts newest-first, so toasts[0] in the DOM is
      // the most recent entry. The model still appends; the view renders
      // each position's entries in reverse.
      it('renders the newest toast first', () => {
        Scene.scene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          Scene.expect(Scene.nth(allToasts, 0)).toContainText('Still here'),
        )
      })
    })

    describe('capability gaps (no creaseui analogue)', () => {
      it.todo('returns a toast id / upserts on add with an existing id')
      it.todo(
        'priority="high" toasts render role=alertdialog with an ' +
          'aria-atomic alert wrapper — no priority option',
      )
      it.todo(
        'manager.promise(...) loading→success/error lifecycle — no ' +
          'promise API; updateToast covers the resolved-state update',
      )
      it.todo(
        'provider limit marks excess toasts data-limited — no limit option',
      )
      it.todo(
        'provider-level default timeout applying to toasts added ' +
          'afterwards — there is no provider; duration is per-entry',
      )
      it.todo(
        'viewport focus management (F6 to focus, Tab cycling, focus ' +
          'guards) — creaseui has no focus model and the DSL has no real focus',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindToast)
verifyRenderer('StyleX', StyleXToast)
