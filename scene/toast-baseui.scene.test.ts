import { Duration, Option } from 'effect'
import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Animation as AnimationPrimitive } from '@foldkit/ui'
import * as ToastPrimitive from '@foldkit/ui/toast'
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
 * notification engine in `@/lib/toast`, which adapts `@foldkit/ui`'s
 * `Toast` primitive: the parent owns the Model, `show`/`updateToast`/
 * `dismiss`/`dismissAll` return versioned timer Commands, and the view
 * renders one <section> live region per active position holding
 * role=status|alert articles. Base UI's fake-timer cases are ported by
 * asserting and resolving the scheduled `WaitBeforeDismissal` Commands
 * directly — the pending Command IS the timer, so "auto-dismisses after
 * N ms" reads as "resolving that Command starts the leave animation".
 *
 * The primitive drives a full enter/leave animation lifecycle per entry:
 * `show` schedules `WaitForPaint` (+ `WaitForAnimationSettled` after it)
 * for the enter transition and a `WaitBeforeDismissal` for non-sticky
 * entries; dismissal schedules the same paint/settle pair for the leave
 * transition and removes the entry (emitting `DismissedToast`) only when
 * it settles. `settleAllAnimations` below drains every pending animation
 * Command, echoing each Command's recorded transition generation.
 *
 * Base UI cases with no creaseui analogue are recorded here instead of
 * being dropped silently:
 *  - React internals: describeConformance, ref callbacks, StrictMode,
 *    provider prop-sync ordering before layout effects, "object identity"
 *    store bookkeeping in ToastRoot.
 *  - `render=` / childless render-prop and element-substitution cases in
 *    ToastAction/ToastTitle/ToastDescription/ToastArrow (foldkit fixes
 *    the rendered element).
 *  - Real pointer capture and hover geometry are covered by browser tests;
 *    horizontal thresholds, cancellation, and queue promotion have model
 *    tests. The scene DSL has no native pointer streams or layout geometry.
 *    Vertical and multi-direction swipes remain outside the primitive API.
 *  - ToastPositioner anchoring/`--toast-index` offsets, ToastArrow, and
 *    ToastPortal — creaseui positions each entry into a named position
 *    section instead of floating-ui anchoring, and renders no portal.
 *  - Viewport focus management: F6 focus, Tab/Shift+Tab guards, focus
 *    hand-off to the next toast, Escape-scoped-to-portals — no real focus
 *    in the DSL.
 *  - ending/transitionStatus animation phases, `updateKey`, and
 *    onRemove-vs-onClose staging — the primitive's per-entry leave
 *    animation covers the same lifecycle; DismissedToast fires on
 *    TransitionedOut as removal.
 *  - `add` accepting a caller-specified id / upsert-by-add — the
 *    primitive generates ids as `${modelId}-entry-${nextEntryKey}`;
 *    `updateToast` is the update path. "returns a toast id" has no
 *    scene-visible analogue.
 *  - `update(id, fn)` function-updater form — `updateToast` takes a
 *    partial input object.
 *  - `manager.promise(...)` loading/success/error lifecycle — creaseui
 *    exposes variant helpers (`success`/`error`/…) + `updateToast` for the
 *    resolved state instead.
 *  - Provider configuration is expressed through `init`, including duration
 *    and a default visible limit of three. Limited entries pause their timers
 *    until promoted, preserving a queue instead of expiring unseen.
 *  - "in dialog" aria-hidden interplay — Dialog+Toast composition is not
 *    a vnode-level concern here.
 *  - Event-object payloads (`eventDetails.cancel()`, modifier reporting)
 *    — foldkit dispatches plain messages.
 *
 * Scene mechanics worth knowing: `WaitBeforeDismissal` and the animation
 * Commands are unkeyed, so the DSL refuses to dispatch a new Message
 * while one is pending (unkeyed Commands must resolve before the next
 * interaction). Tests that need a toast AND further interaction
 * therefore either seed entries through `Scene.given` (a seeded entry
 * carries timer/animation state as data, with no pending Command) or
 * drain the enter animation with `settleAllAnimations` after each add.
 * Stale-timer and pause/resume completions are delivered with
 * `Scene.Subscription.emit` once no Command is pending.
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

/** Supply the observers' initial facts and acknowledge their cleanup between
 * Scene steps. Real ResizeObserver/focus behavior is exercised in the browser. */
const toastScene = <M, Msg, Out = undefined>(
  config: {
    update: (
      model: M,
      message: Msg,
    ) => {
      model: M
      commands?: ReadonlyArray<Scene.AnyCommand>
      outMessage?: Out
    }
    view: (model: M, h: HtmlBuilder<Msg>) => Html
  },
  ...steps: ReadonlyArray<
    Scene.SceneStep<NoInfer<M>, NoInfer<Msg>, NoInfer<Out>>
  >
): void => {
  const definitions = [
    ToastBehavior.ObserveToastViewport,
    ToastBehavior.ObserveToast,
  ]
  const selectors = ['[data-slot="toast"]', '[data-slot="toast-content"]']
  let counts = [0, 0]
  const observers = (simulation: Scene.SceneSimulation<M, Msg, Out>) => {
    let next = simulation
    for (const [index, definition] of definitions.entries()) {
      const count = Scene.findAll(next.html, selectors[index]!).length
      for (let removed = count; removed < counts[index]!; removed += 1)
        next = Scene.Mount.expectEnded(definition)(next)
      counts[index] = count
    }
    for (const pending of next.mounts) {
      const entryId = String(pending.args?.['entryId'] ?? '')
      const modelId = String(pending.args?.['modelId'] ?? entryId)
      const message =
        pending.name === 'ObserveToastContent'
          ? ToastBehavior.Message.MeasuredToast({ entryId, height: 74 })
          : ToastBehavior.Message.ChangedToastViewportFocus({
              position: pending.args?.['position'] as ToastBehavior.Position,
              fallbackPosition: pending.args?.[
                'fallbackPosition'
              ] as ToastBehavior.Position,
              focused: false,
            })
      const parent = {
        _tag: modelId.startsWith('lane-a')
          ? 'GotA'
          : modelId.startsWith('lane-b')
            ? 'GotB'
            : 'GotToastMessage',
        message,
      }
      next = Scene.Mount.resolve(pending, parent)(next)
    }
    return next
  }
  Scene.scene(config, ...steps.flatMap(step => [step, observers]))
}

const foldToast = (model: Model, result: ToastUpdateReturn) => ({
  model: { ...model, toasts: result.model },
  commands: Command.mapMessages(result.commands ?? [], (message): Message => ({
    _tag: 'GotToastMessage',
    message,
  })),
  outMessage: result.outMessage,
})

const update = (
  model: Model,
  message: Message,
): ReturnType<typeof foldToast> => {
  switch (message._tag) {
    case 'ClickedAdd':
      return foldToast(model, ToastBehavior.show(model.toasts, message.input))
    case 'ClickedUpdateFirst': {
      const first = model.toasts.entries[0]
      return first === undefined
        ? { model }
        : foldToast(
            model,
            ToastBehavior.updateToast(model.toasts, first.id, message.input),
          )
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
      return foldToast(
        model,
        ToastBehavior.update(model.toasts, message.message),
      )
  }
}

type ToastFn = <Msg>(
  props: {
    model: ToastBehavior.Model
    toParentMessage: (message: ToastBehavior.Message) => Msg
    ariaLabel?: string
    pausePolicy?: 'none' | 'pointer'
    position?: ToastBehavior.Position
  },
  h: HtmlBuilder<Msg>,
) => Html

type ToastModule = Readonly<{ toast: ToastFn }>

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

const triggerButton = <Msg>(
  label: string,
  message: Msg,
  h: HtmlBuilder<Msg>,
): Html => h.button([h.Type('button'), h.OnClick(message)], [label])

const makeView =
  (Toast: ToastModule, props?: { pausePolicy?: 'none' | 'pointer' }) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.div(
      [],
      [
        triggerButton('add', { _tag: 'ClickedAdd', input: DEFAULT }, h),
        triggerButton('add timed', { _tag: 'ClickedAdd', input: TIMED }, h),
        triggerButton(
          'add sticky',
          { _tag: 'ClickedAdd', input: STICKY_ERROR },
          h,
        ),
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
        triggerButton(
          'add zero',
          { _tag: 'ClickedAdd', input: ZERO_TIMEOUT },
          h,
        ),
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
        triggerButton('dismiss all', { _tag: 'ClickedDismissAll' }, h),
        Toast.toast(
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
 *  full payload, not just the title. `Default` maps to the primitive's
 *  `Info` variant on the entry while the payload keeps the crease variant. */
const entryOf = (
  id: string,
  input: ToastBehavior.ShowInput,
): ToastBehavior.Entry => ({
  id,
  variant: input.variant === 'Default' ? 'Info' : input.variant,
  animation: {
    id,
    isShowing: true,
    transitionState: 'Idle',
    transitionGeneration: 1,
  },
  maybeDuration:
    input.sticky === true
      ? Option.none()
      : Option.some(Duration.fromInputUnsafe(input.duration ?? '4 seconds')),
  pendingDismissVersion: 0,
  isHovered: false,
  swipeState: ToastPrimitive.SwipeState.Idle(),
  swipeVersion: 0,
  payload: {
    title: input.title,
    variant: input.variant,
    ...(input.description === undefined
      ? {}
      : { description: input.description }),
    ...(input.actionLabel === undefined
      ? {}
      : { actionLabel: input.actionLabel }),
    ...(input.position === undefined ? {} : { position: input.position }),
  },
})

/** The entry snapshot the primitive's `DismissedToast` carries — the toast
 *  mid-leave (`isShowing: false`, `LeaveAnimating`, generation 2), which is
 *  the state the entry is in when its leave transition settles. */
const leavingEntryOf = (
  id: string,
  input: ToastBehavior.ShowInput,
): ToastBehavior.Entry => ({
  ...entryOf(id, input),
  animation: {
    id,
    isShowing: false,
    transitionState: 'LeaveAnimating',
    transitionGeneration: 2,
  },
})

/** A Model with entries already showing — the scene-level stand-in for
 *  toasts whose timers are in flight. Seeded entries produce no pending
 *  Commands, so interactions and Subscription.emit stay available. */
const seededModel = (
  ...entries: ReadonlyArray<ToastBehavior.Entry>
): Model => ({
  toasts: {
    ...ToastBehavior.init({ id: 'toasts' }),
    entries: [...entries],
    nextEntryKey: entries.length,
    maybeSwipeConfig: Option.none(),
  },
})

const ANIMATION_COMMAND_NAMES = new Set([
  'WaitForPaint',
  'WaitForAnimationSettled',
])

type AnySimulation<M, Msg, Out> = Scene.SceneSimulation<M, Msg, Out>

/** Resolves the earliest pending animation Command, echoing its recorded
 *  transition generation so stale waits no-op exactly like the real ones. */
const settleOneAnimation = <M, Msg, Out>(
  simulation: AnySimulation<M, Msg, Out>,
): AnySimulation<M, Msg, Out> => {
  const pending = simulation.commands.find(command =>
    ANIMATION_COMMAND_NAMES.has(command.name),
  )
  const generation = pending?.args?.['generation']
  if (pending === undefined || typeof generation !== 'number') {
    throw new Error('Expected a pending animation Command, found none.')
  }
  // resolveAll's ordered consumption handles multiple pending Commands that
  // share a name and args (e.g. two entries' leave paints after dismissAll).
  return pending.name === 'WaitForPaint'
    ? Scene.Command.resolveAll([
        AnimationPrimitive.WaitForPaint,
        AnimationPrimitive.Message.CompletedWaitForPaint({ generation }),
      ])(simulation)
    : Scene.Command.resolveAll([
        AnimationPrimitive.WaitForAnimationSettled,
        AnimationPrimitive.Message.EndedAnimation({ generation }),
      ])(simulation)
}

/** Drains every pending animation Command — paint+settle pairs for any
 *  enter/leave transitions in flight — until the stack is animation-idle.
 *  Leave drains remove the entries and emit their DismissedToast outs. */
const settleAllAnimations = <M, Msg, Out>(
  simulation: AnySimulation<M, Msg, Out>,
): AnySimulation<M, Msg, Out> => {
  let sim = simulation
  while (
    sim.commands.some(command => ANIMATION_COMMAND_NAMES.has(command.name))
  ) {
    sim = settleOneAnimation(sim)
  }
  return sim
}

/** Resolves the pending `WaitBeforeDismissal` for an entry, echoing its
 *  recorded timer version — the scene analogue of the timer firing. */
const dismissTimerFires =
  (entryId: string) =>
  <M, Msg, Out>(
    simulation: AnySimulation<M, Msg, Out>,
  ): AnySimulation<M, Msg, Out> => {
    const pending = simulation.commands.find(
      command =>
        command.name === 'WaitBeforeDismissal' &&
        command.args?.['entryId'] === entryId,
    )
    const version = pending?.args?.['version']
    if (typeof version !== 'number') {
      throw new Error(
        `Expected a pending WaitBeforeDismissal for ${entryId}, found none.`,
      )
    }
    return Scene.Command.resolve(
      ToastPrimitive.WaitBeforeDismissal,
      ToastPrimitive.Message.CompletedWaitBeforeDismissal({ entryId, version }),
    )(simulation)
  }

const toastLocator = Scene.selector('[data-slot="toast-entry"]')
const allToasts = Scene.all.selector('[data-slot="toast-entry"]')
const notificationsRegion = Scene.role('region', { name: 'Notifications' })
const dismissButton = Scene.role('button', { name: 'Dismiss notification' })
const actionButton = Scene.role('button', { name: 'Undo' })

const verifyRenderer = (name: string, Toast: ToastModule) => {
  describe(`${name} Toast (Base UI port)`, () => {
    describe('add', () => {
      // DIVERGENCE (intentional): Base UI's default timeout is 5000ms
      // (Toast.Provider default); creaseui follows Sonner's 4000ms default.
      it('adds a toast to the viewport that auto-dismisses after the default timeout', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.expect(toastLocator).toBeAbsent(),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toExist(),
          Scene.expect(toastLocator).toContainText('Saved'),
          Scene.Command.expectHas(
            ToastPrimitive.WaitBeforeDismissal({
              entryId: 'toasts-entry-0',
              version: 0,
              duration: Duration.millis(4000),
            }),
          ),
          dismissTimerFires('toasts-entry-0'),
          // Dismissal starts the leave animation; the entry stays mounted
          // until the transition reports it has settled.
          Scene.expect(toastLocator).toExist(),
          settleAllAnimations,
          Scene.expect(toastLocator).toBeAbsent(),
          Scene.expectOutMessage(
            ToastBehavior.OutMessage.DismissedToast({
              entry: leavingEntryOf('toasts-entry-0', DEFAULT),
            }),
          ),
        )
      })

      // Base UI upserts on `add` with an existing caller-specified id.
      // creaseui ids are always generated, so a second show appends a
      // second entry; `updateToast` is the equivalent "same toast" path.
      it('appends a second toast rather than upserting (no caller-specified ids)', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.expectAll(allToasts).toHaveCount(2),
          Scene.expect(Scene.nth(allToasts, 1)).toContainText(
            'Could not save changes',
          ),
          Scene.expect(Scene.nth(allToasts, 0)).toContainText('Still here'),
        )
      })

      it('keeps multiple toast models isolated when one updates', () => {
        type DualModel = Readonly<{
          a: ToastBehavior.Model
          b: ToastBehavior.Model
        }>
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
              return fold('a')(
                model,
                ToastBehavior.update(model.a, message.message),
              )
            case 'GotB':
              return fold('b')(
                model,
                ToastBehavior.update(model.b, message.message),
              )
          }
        }
        const dualView = (
          model: DualModel,
          h: HtmlBuilder<DualMessage>,
        ): Html =>
          h.div(
            [],
            [
              triggerButton('add a', { _tag: 'AddA' }, h),
              triggerButton('dismiss all b', { _tag: 'DismissAllB' }, h),
              Toast.toast(
                {
                  model: model.a,
                  toParentMessage: message => ({ _tag: 'GotA', message }),
                  ariaLabel: 'Lane A',
                },
                h,
              ),
              Toast.toast(
                {
                  model: model.b,
                  toParentMessage: message => ({ _tag: 'GotB', message }),
                  ariaLabel: 'Lane B',
                },
                h,
              ),
            ],
          )
        toastScene(
          { update: dualUpdate, view: dualView },
          Scene.given({
            a: ToastBehavior.init({ id: 'lane-a' }),
            b: ToastBehavior.init({ id: 'lane-b' }),
          }),
          Scene.click(Scene.role('button', { name: 'add a' })),
          Scene.expectHandled(),
          settleAllAnimations,
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
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add timed' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toExist(),
          Scene.Command.expectHas(
            ToastPrimitive.WaitBeforeDismissal({
              entryId: 'toasts-entry-0',
              version: 0,
              duration: Duration.millis(1000),
            }),
          ),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      // DIVERGENCE: Base UI treats `timeout: 0` as "never auto-dismiss".
      // creaseui's `sticky` flag is the opt-out — a 0ms duration still
      // schedules WaitBeforeDismissal, which removes the entry the moment
      // the timer completes.
      it.fails('does not auto-dismiss when the timeout is 0', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add zero' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toExist(),
          Scene.Command.expectNone(),
        )
      })

      it('never schedules a timer for sticky toasts', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(Scene.role('alert')).toExist(),
          // Only the enter-animation paint is pending — no dismissal timer.
          Scene.Command.expectExact(
            AnimationPrimitive.WaitForPaint({ generation: 1 }),
          ),
          settleAllAnimations,
        )
      })
    })

    describe('option: onClose', () => {
      it('emits DismissedToast when the toast is closed', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(dismissButton),
          Scene.expectHandled(),
          // The leave animation lingers; DismissedToast arrives when it
          // settles, alongside the actual removal.
          Scene.expect(toastLocator).toExist(),
          settleAllAnimations,
          Scene.expectOutMessage(
            ToastBehavior.OutMessage.DismissedToast({
              entry: leavingEntryOf('toasts-entry-0', STICKY_ERROR),
            }),
          ),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('emits DismissedToast when the toast auto-dismisses', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add timed' })),
          Scene.expectHandled(),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
          Scene.expectOutMessage(
            ToastBehavior.OutMessage.DismissedToast({
              entry: leavingEntryOf('toasts-entry-0', TIMED),
            }),
          ),
        )
      })
    })

    describe('update', () => {
      it('updates the toast', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.expect(toastLocator).toContainText('Could not save changes'),
          Scene.click(Scene.role('button', { name: 'update first' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toContainText('Updated'),
          Scene.expectAll(allToasts).toHaveCount(1),
        )
      })

      it('resets the auto-dismiss timer when updating with the same timeout value', () => {
        toastScene(
          { update, view: makeView(Toast) },
          // The seeded entry stands in for a toast whose v1 timer is in
          // flight — seeding keeps no Command pending so the stale
          // completion below can be emitted before updating.
          Scene.given(
            seededModel({
              ...entryOf('toasts-entry-0', DEFAULT),
              pendingDismissVersion: 1,
            }),
          ),
          // A completion for the superseded v0 timer is ignored.
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message: ToastPrimitive.Message.CompletedWaitBeforeDismissal({
              entryId: 'toasts-entry-0',
              version: 0,
            }),
          }),
          Scene.expect(toastLocator).toExist(),
          Scene.expect(toastLocator).toContainText('Saved'),
          Scene.click(Scene.role('button', { name: 'update first' })),
          Scene.expectHandled(),
          // updateToast bumps pendingDismissVersion and reschedules under v2.
          Scene.Command.expectExact(
            ToastPrimitive.WaitBeforeDismissal({
              entryId: 'toasts-entry-0',
              version: 2,
              duration: Duration.millis(4000),
            }),
          ),
          Scene.expect(toastLocator).toContainText('Updated'),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('auto-dismisses when a sticky toast gains a timeout', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          // Sticky: only the enter animation is pending, no dismissal timer.
          Scene.Command.expectExact(
            AnimationPrimitive.WaitForPaint({ generation: 1 }),
          ),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'arm first timer' })),
          Scene.expectHandled(),
          Scene.Command.expectHas(
            ToastPrimitive.WaitBeforeDismissal({
              entryId: 'toasts-entry-0',
              version: 1,
              duration: Duration.millis(1000),
            }),
          ),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })
    })

    describe('close', () => {
      it('closes a toast when its dismiss button is clicked', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.expect(toastLocator).toExist(),
          Scene.click(dismissButton),
          Scene.expectHandled(),
          // The entry lingers in its leave animation, then unmounts on
          // settle.
          Scene.expect(toastLocator).toExist(),
          settleAllAnimations,
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('closes all toasts', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.expectAll(allToasts).toHaveCount(2),
          Scene.click(Scene.role('button', { name: 'dismiss all' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.expectAll(allToasts).toHaveCount(0),
        )
      })

      // Upstream behavior change: the Toast primitive emits DismissedToast
      // for every entry once its leave transition settles, so bulk
      // dismissals are observable per-toast now.
      it('emits a dismissal message for every toast closed by dismissAll', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'dismiss all' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.expectOutMessages(
            ToastBehavior.OutMessage.DismissedToast({
              entry: leavingEntryOf('toasts-entry-0', STICKY_ERROR),
            }),
            ToastBehavior.OutMessage.DismissedToast({
              entry: leavingEntryOf('toasts-entry-1', STICKY_INFO),
            }),
          ),
        )
      })

      it('is a no-op when dismissing an id that is not showing', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'dismiss unknown' })),
          Scene.expectHandled(),
          Scene.expectNoOutMessage(),
          Scene.expect(toastLocator).toExist(),
        )
      })
    })

    describe('timers', () => {
      it('pauses timers when hovering', () => {
        toastScene(
          { update, view: makeView(Toast) },
          // Seeded non-sticky entry — a pending Command would block the
          // hover interaction, so the in-flight timer is model state only.
          Scene.given(seededModel(entryOf('toasts-entry-0', TIMED))),
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message: ToastBehavior.Message.ChangedToastViewportPointer({
              position: 'bottom-right',
              fallbackPosition: 'bottom-right',
              hovered: true,
              pause: true,
            }),
          }),
          Scene.expect(toastLocator).toHaveAttr('data-paused', 'true'),
          // The in-flight timer still completes, but HoveredEntry bumped
          // pendingDismissVersion so the v0 completion is stale — the
          // paused entry stays rendered.
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message: ToastPrimitive.Message.CompletedWaitBeforeDismissal({
              entryId: 'toasts-entry-0',
              version: 0,
            }),
          }),
          Scene.expect(toastLocator).toExist(),
        )
      })

      it('resumes timers when not hovering', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(seededModel(entryOf('toasts-entry-0', TIMED))),
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message: ToastBehavior.Message.ChangedToastViewportPointer({
              position: 'bottom-right',
              fallbackPosition: 'bottom-right',
              hovered: true,
              pause: true,
            }),
          }),
          Scene.expect(toastLocator).toHaveAttr('data-paused', 'true'),
          // Native pointer tracking lives in the viewport Mount; feed its
          // fact directly because Scene has no browser layout or pointer capture.
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message: ToastBehavior.Message.ChangedToastViewportPointer({
              position: 'bottom-right',
              fallbackPosition: 'bottom-right',
              hovered: false,
              pause: true,
            }),
          }),
          Scene.expect(toastLocator).toHaveAttr('data-paused', 'false'),
          // HoveredEntry and LeftEntry each bumped the version, so the
          // re-armed timer runs under v2.
          Scene.Command.expectHas(
            ToastPrimitive.WaitBeforeDismissal({
              entryId: 'toasts-entry-0',
              version: 2,
              duration: Duration.millis(1000),
            }),
          ),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      // creaseui extension with no Base UI analogue: pause-on-hover is
      // opt-out via `pausePolicy` and is skipped entirely for sticky
      // entries (there is no timer to pause).
      it('does not wire pause handlers when pausePolicy is none', () => {
        toastScene(
          { update, view: makeView(Toast, { pausePolicy: 'none' }) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).not.toHaveHandler('mouseenter'),
          Scene.expect(toastLocator).not.toHaveHandler('mouseleave'),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
        )
      })

      it('does not wire pause handlers on sticky toasts', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(Scene.role('alert')).not.toHaveHandler('mouseenter'),
          Scene.expect(Scene.role('alert')).not.toHaveHandler('mouseleave'),
          settleAllAnimations,
        )
      })

      it.todo(
        'pauses timers when the viewport is focused — creaseui has no ' +
          'focus-pause (and the DSL has no real focus)',
      )
    })

    describe('ARIA attributes', () => {
      it('renders the viewport as a labelled polite live region', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.expect(notificationsRegion).toExist(),
          Scene.expect(notificationsRegion).toHaveAttr('aria-live', 'polite'),
          Scene.expect(notificationsRegion).toHaveAttr('data-slot', 'toast'),
          Scene.expect(notificationsRegion).toHaveAttr(
            'data-position',
            'bottom-right',
          ),
        )
      })

      // DIVERGENCE: Base UI's Toast.Viewport also emits
      // aria-atomic="false" and aria-relevant="additions text" so
      // additions read as a group; creaseui emits aria-live only.
      it.fails('marks the live region aria-atomic=false and aria-relevant="additions text"', () => {
        toastScene(
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
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          settleAllAnimations,
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
            Scene.first(Scene.filter(allToasts, { hasText: 'Still here' })),
          ).toHaveAttr('data-variant', 'info'),
          Scene.expect(
            Scene.first(
              Scene.filter(allToasts, { hasText: 'Could not save changes' }),
            ),
          ).toHaveAttr('data-variant', 'error'),
        )
      })

      // DIVERGENCE: Base UI's Toast.Root is a labelled dialog —
      // role="dialog" (or "alertdialog" for priority=high) with
      // aria-modal="false" — while a sibling role=alert wrapper carries
      // the live announcement. creaseui collapses both into a single
      // role=status|alert article with no dialog semantics.
      it.fails('renders the toast root as role=dialog with aria-modal=false', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(Scene.role('dialog')).toExist(),
          Scene.expect(Scene.role('dialog')).toHaveAttr('aria-modal', 'false'),
        )
      })

      // DIVERGENCE: Base UI wires aria-labelledby from the rendered
      // Toast.Title id (and re-syncs it as label parts mount/unmount).
      // creaseui renders title text in an unlabelled div — the article has
      // no accessible name at all.
      it.fails('wires aria-labelledby from the rendered title', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toHaveAttr('aria-labelledby'),
        )
      })

      // DIVERGENCE: same gap for aria-describedby / Toast.Description.
      it.fails('wires aria-describedby from the rendered description', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.expect(toastLocator).toHaveAttr('aria-describedby'),
        )
      })

      // DIVERGENCE: Base UI dismisses the focused toast on Escape.
      // creaseui wires no keydown handler on entries or the region, so the
      // keydown step throws — the assertion encodes the Base UI
      // expectation for when the capability lands.
      it.fails('closes the toast when Escape is pressed', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          Scene.keydown(toastLocator, 'Escape'),
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('gives the dismiss control an accessible name', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(dismissButton).toExist(),
          Scene.expect(dismissButton).toHaveAccessibleName(
            'Dismiss notification',
          ),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
        )
      })
    })

    describe('<Toast.Action />', () => {
      it('performs an action when clicked', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky action' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.expect(actionButton).toExist(),
          Scene.click(actionButton),
          Scene.expectHandled(),
          // Base UI's action callback maps to the ActivatedToast
          // OutMessage; activation also removes the entry (once the
          // leave transition settles).
          Scene.expectOutMessage(
            ToastBehavior.OutMessage.ActivatedToast({
              entry: entryOf('toasts-entry-0', STICKY_UNDO),
            }),
          ),
          settleAllAnimations,
          Scene.expect(toastLocator).toBeAbsent(),
        )
      })

      it('does not render if the toast has no action', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add timed' })),
          Scene.expectHandled(),
          Scene.inside(
            toastLocator,
            Scene.expectAll(Scene.all.role('button')).toHaveCount(1),
          ),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
        )
      })
    })

    describe('<Toast.Title />', () => {
      // creaseui requires a non-empty title for every entry, so the title
      // always renders (Base UI's "does not render if it has no children"
      // has no analogue — title is a required field).
      it('always renders the title', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Saved')).toExist(),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
        )
      })
    })

    describe('<Toast.Description />', () => {
      it('renders the description when provided', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add' })),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Sunday at 9:00 AM')).toExist(),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
        )
      })

      it('does not render a description element when none is provided', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add timed' })),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Heads up')).toExist(),
          // The TIMED input has no description; the article renders only
          // the title node (plus its dismiss control).
          Scene.expect(toastLocator).not.toContainText('Sunday at 9:00 AM'),
          dismissTimerFires('toasts-entry-0'),
          settleAllAnimations,
        )
      })
    })

    describe('<Toast.Content />', () => {
      it('exposes drag state and movement while retaining the expanded stack', () => {
        const entry = {
          ...entryOf('toasts-entry-0', STICKY_INFO),
          swipeState: ToastPrimitive.SwipeState.Dragging({
            pointerId: 1,
            startX: 100,
            currentX: 130,
          }),
        }
        const model = seededModel(entry)
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given({
            toasts: {
              ...model.toasts,
              maybeSwipeConfig: ToastBehavior.init({ id: 'toasts' })
                .maybeSwipeConfig,
              hoveredPositions: ['bottom-right'],
            },
          }),
          Scene.expect(toastLocator).toHaveAttr('data-swiping', ''),
          Scene.expect(toastLocator).toHaveAttr('data-expanded', ''),
          Scene.expect(toastLocator).toHaveAttr(
            'data-swipe-direction',
            'right',
          ),
          Scene.expect(toastLocator).toHaveStyle(
            'transform',
            'translateX(30px) translateY(0px) scale(1)',
          ),
        )
      })
      it('hides content behind the newest card and expands the stack on hover', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(
            seededModel(
              entryOf('toasts-entry-0', STICKY_INFO),
              entryOf('toasts-entry-1', STICKY_ERROR),
            ),
          ),
          Scene.expect(
            Scene.selector('#toasts-entry-0 [data-slot="toast-content"]'),
          ).toHaveAttr('data-behind', ''),
          Scene.Subscription.emit({
            _tag: 'GotToastMessage',
            message: ToastBehavior.Message.ChangedToastViewportPointer({
              position: 'bottom-right',
              fallbackPosition: 'bottom-right',
              hovered: true,
              pause: true,
            }),
          }),
          Scene.expect(
            Scene.selector('#toasts-entry-0 [data-slot="toast-content"]'),
          ).toHaveAttr('data-expanded', ''),
          Scene.expect(Scene.selector('#toasts-entry-1')).toHaveAttr(
            'data-expanded',
            '',
          ),
        )
      })
    })

    describe('positioning', () => {
      // Scene-level analogue of Toast.Positioner carrying per-toast
      // placement: an entry may override the viewport position and lands
      // in the matching section.
      it('renders an entry under its own position section', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'add positioned sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
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
      it('renders the newest toast first', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(initialModel()),
          Scene.click(Scene.role('button', { name: 'add sticky' })),
          Scene.expectHandled(),
          settleAllAnimations,
          Scene.click(Scene.role('button', { name: 'add sticky info' })),
          Scene.expectHandled(),
          settleAllAnimations,
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
      it('marks overflow cards as limited and keeps exactly three visible', () => {
        toastScene(
          { update, view: makeView(Toast) },
          Scene.given(
            seededModel(
              ...Array.from({ length: 6 }, (_, index) =>
                entryOf(`toasts-entry-${index}`, STICKY_INFO),
              ),
            ),
          ),
          Scene.expectAll(
            Scene.all.selector('[data-slot="toast-entry"]:not([data-limited])'),
          ).toHaveCount(3),
          Scene.expectAll(
            Scene.all.selector('[data-slot="toast-entry"][data-limited]'),
          ).toHaveCount(3),
          Scene.expect(Scene.selector('#toasts-entry-0')).toHaveAttr(
            'aria-hidden',
            'true',
          ),
        )
      })
      it.todo(
        'provider-level default timeout applying to toasts added ' +
          'afterwards — there is no provider; duration is per-entry',
      )
      it.todo(
        'Tab cycling and focus guards — F6, focus expansion and Escape are covered in the browser',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindToast)
verifyRenderer('StyleX', StyleXToast)
