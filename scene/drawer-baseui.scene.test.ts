import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'
import { Dialog as DialogPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import * as DrawerBehavior from '@/lib/drawer'
import * as StyleXDrawer from '@/stylex/drawer'
import * as TailwindDrawer from '@/ui/drawer'

/**
 * Behavioral parity suite ported from Base UI's drawer tests
 * (base-ui/packages/react/src/drawer/**, checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - Drawer.Trigger, detached handles, imperative actions, trigger
 *    aria-controls (~4 tests): creaseui has no trigger part — the parent
 *    opens the drawer through Drawer.open.
 *  - CloseWatcher, cancelable onOpenChange / eventDetails (~10 tests):
 *    foldkit models close requests as Messages, not cancelable events.
 *  - Drawer.SwipeArea / swipe-to-open (~30 tests): no swipe-to-open
 *    surface exists; dragging only applies to an already-open drawer.
 *  - Viewport touch arbitration (~60 tests): text selection, scroll
 *    containers, native hit testing, shadow DOM, slop/pinch arbitration —
 *    all need real layout and pointer streams.
 *  - Indent / IndentBackground / Provider / virtual-keyboard provider
 *    (~25 tests): creaseui has no provider, indent, or keyboard parts.
 *  - Content swipe-ignore attrs, dev-mode warnings, render-prop payloads,
 *    React internals (StrictMode, refs, owner stack, React 17).
 *
 * Deviation: the scene DSL has no pointermove, pointerleave, or dialog
 * `cancel` steps, so DraggedSwipe and CancelledSwipe are fed through
 * Scene.Subscription.emit — the same dispatch path a real subscription
 * message takes. EndedSwipe is also emitted directly when a test needs a
 * deterministic release timestamp (scene pointerUp synthesizes 0).
 * ResizeObserver / MutationObserver mounts are resolved once via
 * Scene.Mount.resolve, which delivers their initial measurement.
 */

type Model = Readonly<{ drawer: DrawerBehavior.Model }>

type Message = Readonly<
  | { _tag: 'ClickedOpen' }
  | { _tag: 'GotDrawerMessage'; message: DrawerBehavior.Message }
>

type DrawerSlots = Readonly<{ closeButton: ReadonlyArray<ChildAttribute> }>

type DrawerModule = Readonly<{
  drawer: <Msg>(
    props: Readonly<{
      model: DrawerBehavior.Model
      toParentMessage: (message: DrawerBehavior.Message) => Msg
      title: string
      description?: string
      content?: (slots: DrawerSlots) => ReadonlyArray<Html>
      footer?: (slots: DrawerSlots) => ReadonlyArray<Html>
      showSwipeHandle?: boolean
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const mapDrawer = (
  model: Model,
  result: ReturnType<typeof DrawerBehavior.update>,
) => ({
  model: { ...model, drawer: result.model },
  commands: Command.mapMessages(result.commands ?? [], message => ({
    _tag: 'GotDrawerMessage' as const,
    message,
  })),
  ...(result.outMessage === undefined ? {} : { outMessage: result.outMessage }),
})

const update = (model: Model, message: Message) => {
  switch (message._tag) {
    case 'ClickedOpen':
      return mapDrawer(model, DrawerBehavior.open(model.drawer))
    case 'GotDrawerMessage':
      return mapDrawer(
        model,
        DrawerBehavior.update(model.drawer, message.message),
      )
  }
}

const openButton = Scene.role('button', { name: 'Open drawer' })
const cancelButton = Scene.role('button', { name: 'Cancel' })
const drawerDialog = Scene.role('dialog')
const overlay = Scene.selector('[data-slot="drawer-overlay"]')
const viewport = Scene.selector('[data-slot="drawer-viewport"]')
const popup = Scene.selector('[data-slot="drawer-popup"]')
const content = Scene.selector('[data-slot="drawer-content"]')
const handle = Scene.selector('[data-slot="drawer-swipe-handle"]')
const drawerTitle = Scene.selector('[data-slot="drawer-title"]')
const drawerDescription = Scene.selector('[data-slot="drawer-description"]')
const drawerRoot = Scene.selector('[data-slot="drawer-root"]')

const resolveShowDialog = Scene.Command.resolve(
  DialogPrimitive.ShowDialog,
  DialogPrimitive.Message.SucceededShowDialog(),
)
const resolveCloseDialog = Scene.Command.resolve(
  DialogPrimitive.CloseDialog,
  DialogPrimitive.Message.CompletedCloseDialog(),
)
const resolveAcquireResources = Scene.Mount.resolve(
  DialogPrimitive.AcquireResources,
  DialogPrimitive.Message.SucceededAcquireResources(),
)
// NOTE: `Scene.Mount.expectEnded` steps are single-use — applying one
// consumes its matcher list, so a shared instance silently no-ops in the
// next scene. Build fresh steps for each test.
const expectAcquireEnded = () =>
  Scene.Mount.expectEnded(DialogPrimitive.AcquireResources)

/** The observer mounts the drawer registers while open: popup + viewport
    measurement (ResizeObserver) and nested-drawer tracking
    (MutationObserver). Resolving them once delivers the initial
    measurement messages. */
// Mount.resolve folds the mount's boundary messageMappers over the result
// message; defineStream mounts rendered through `Mount.mapMessage` carry no
// boundary lift, so the parent wrapper is applied here instead.
const drawerMessage = (message: DrawerBehavior.Message): Message => ({
  _tag: 'GotDrawerMessage',
  message,
})

const resolveObservers = (
  popupSize: { width: number; height: number } = { width: 400, height: 300 },
) => [
  Scene.Mount.resolve(
    DrawerBehavior.ObserveViewport,
    drawerMessage(
      DrawerBehavior.Message.MeasuredViewport({
        width: 800,
        height: 600,
        rootFontSize: 16,
      }),
    ),
  ),
  Scene.Mount.resolve(
    DrawerBehavior.ObservePopup,
    drawerMessage(DrawerBehavior.Message.MeasuredPopup(popupSize)),
  ),
  Scene.Mount.resolve(
    DrawerBehavior.ObserveNestedDrawers,
    drawerMessage(
      DrawerBehavior.Message.NestedDrawersChanged({
        count: 0,
        frontmostHeight: 0,
        swiping: false,
        progress: 0,
      }),
    ),
  ),
]

const expectObserversEnded = () => [
  Scene.Mount.expectEnded(DrawerBehavior.ObserveViewport),
  Scene.Mount.expectEnded(DrawerBehavior.ObservePopup),
  Scene.Mount.expectEnded(DrawerBehavior.ObserveNestedDrawers),
]

const emit = (message: DrawerBehavior.Message) =>
  Scene.Subscription.emit<Message>({
    _tag: 'GotDrawerMessage',
    message,
  })

const emitDragged = (x: number, y: number, timeStamp: number) =>
  emit(DrawerBehavior.Message.DraggedSwipe({ x, y, timeStamp }))

const emitEnded = (x: number, y: number, timeStamp: number) =>
  emit(DrawerBehavior.Message.EndedSwipe({ x, y, timeStamp }))

const emitCancelled = emit(DrawerBehavior.Message.CancelledSwipe())

/** Runs the shared open flow: click the trigger, acknowledge the dialog
 *  mount, feed the observer measurements, and land on a fully open drawer. */
const openDrawer = (
  ...rest: ReadonlyArray<Scene.Step<Model, Message, DrawerBehavior.OutMessage>>
) => [
  Scene.click(openButton),
  Scene.expectHandled(),
  Scene.expectOutMessage(DrawerBehavior.OutMessage.Opened()),
  resolveShowDialog,
  resolveAcquireResources,
  ...resolveObservers(),
  Scene.expect(content).toExist(),
  ...rest,
]

/** Asserts the drawer is visually open: popup, overlay, handle, and the
 *  open data attributes are all present. */
const expectOpen = () => [
  Scene.expect(drawerDialog).toHaveAttr('data-open', ''),
  Scene.expect(viewport).toExist(),
  Scene.expect(overlay).toExist(),
  Scene.expect(popup).toExist(),
  Scene.expect(content).toExist(),
  Scene.expect(handle).toExist(),
]

/** Asserts the drawer is visually closed: the dialog stays mounted but the
 *  viewport/overlay/popup tree is gone. */
const expectClosed = () => [
  Scene.expect(drawerDialog).not.toHaveAttr('data-open'),
  Scene.expect(viewport).toBeAbsent(),
  Scene.expect(overlay).toBeAbsent(),
  Scene.expect(popup).toBeAbsent(),
  Scene.expect(content).toBeAbsent(),
  Scene.expect(handle).toBeAbsent(),
]

const verifyRenderer = (name: string, Drawer: DrawerModule) => {
  const view = (model: Model, h: HtmlBuilder<Message>) =>
    h.div(
      [],
      [
        h.button(
          [h.Type('button'), h.OnClick({ _tag: 'ClickedOpen' })],
          ['Open drawer'],
        ),
        Drawer.drawer(
          {
            model: model.drawer,
            toParentMessage: message => ({
              _tag: 'GotDrawerMessage' as const,
              message,
            }),
            title: 'Move goal',
            description: 'Set your daily activity goal.',
            showSwipeHandle: true,
            content: () => [h.p([], ['Drawer body'])],
            footer: slots => [h.button([...slots.closeButton], ['Cancel'])],
          },
          h,
        ),
      ],
    )

  const openModel = (
    id: string,
    config: Partial<DrawerBehavior.InitConfig> = {},
  ): Model => ({
    drawer: DrawerBehavior.open(DrawerBehavior.init({ id, ...config })).model,
  })

  /** Model mid-swipe: opened, measured, started at `start`, dragged to
      `current`. */
  const draggingModel = (
    id: string,
    config: Partial<DrawerBehavior.InitConfig>,
    start: { x: number; y: number },
    current: { x: number; y: number },
    timeStamp = 100,
  ): Model => ({
    drawer: DrawerBehavior.update(
      DrawerBehavior.update(
        DrawerBehavior.update(
          DrawerBehavior.update(
            openModel(id, config).drawer,
            DrawerBehavior.Message.MeasuredViewport({
              width: 800,
              height: 600,
              rootFontSize: 16,
            }),
          ).model,
          DrawerBehavior.Message.MeasuredPopup({ width: 400, height: 300 }),
        ).model,
        DrawerBehavior.Message.StartedSwipe({
          x: start.x,
          y: start.y,
          timeStamp: 0,
        }),
      ).model,
      DrawerBehavior.Message.DraggedSwipe({
        x: current.x,
        y: current.y,
        timeStamp,
      }),
    ).model,
  })

  describe(`${name} Drawer (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('uses implicit role dialog while open', () => {
        Scene.scene(
          { update, view },
          Scene.given({ drawer: DrawerBehavior.init({ id: 'aria' }) }),
          Scene.expect(drawerDialog).toExist(),
          ...expectClosed(),
          ...openDrawer(
            Scene.expect(drawerDialog).toExist(),
            Scene.expect(drawerDialog).toHaveAttr('data-open', ''),
          ),
        )
      })

      it('points aria-labelledby at the drawer title', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('aria-labelledby')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(drawerDialog).toHaveAttr(
            'aria-labelledby',
            'aria-labelledby-dialog-title',
          ),
          Scene.expect(drawerDialog).toHaveAccessibleName('Move goal'),
          Scene.expect(drawerTitle).toHaveAttr(
            'id',
            'aria-labelledby-dialog-title',
          ),
        )
      })

      it('marks the dialog as modal while open', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('aria-modal')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(drawerDialog).toHaveAttr('aria-modal', 'true'),
        )
      })

      it('points aria-describedby at the drawer description', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('aria-desc')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(drawerDescription).toExist(),
          Scene.expect(drawerDescription).toHaveAttr(
            'id',
            'aria-desc-dialog-description',
          ),
          Scene.expect(drawerDialog).toHaveAttr(
            'aria-describedby',
            'aria-desc-dialog-description',
          ),
        )
      })
    })

    describe('prop: swipeDirection', () => {
      const directions = [
        {
          direction: 'down' as const,
          axis: 'y',
          var: '--drawer-swipe-movement-y',
          value: '120px',
          from: { x: 200, y: 400 },
          to: { x: 200, y: 520 },
        },
        {
          direction: 'up' as const,
          axis: 'y',
          var: '--drawer-swipe-movement-y',
          value: '-120px',
          from: { x: 200, y: 400 },
          to: { x: 200, y: 280 },
        },
        {
          direction: 'right' as const,
          axis: 'x',
          var: '--drawer-swipe-movement-x',
          value: '120px',
          from: { x: 200, y: 400 },
          to: { x: 320, y: 400 },
        },
        {
          direction: 'left' as const,
          axis: 'x',
          var: '--drawer-swipe-movement-x',
          value: '-120px',
          from: { x: 200, y: 400 },
          to: { x: 80, y: 400 },
        },
      ]
      directions.forEach(
        ({ direction, axis, var: variable, value, from, to }) => {
          it(`translates the popup toward the ${direction} edge while swiping`, () => {
            Scene.scene(
              { update, view },
              Scene.given(
                draggingModel(
                  `dir-${direction}`,
                  { swipeDirection: direction },
                  from,
                  to,
                ),
              ),
              resolveAcquireResources,
              ...resolveObservers(),
              Scene.expect(popup).toHaveAttr('data-swipe-direction', direction),
              Scene.expect(popup).toHaveAttr('data-swipe-axis', axis),
              Scene.expect(popup).toHaveAttr('data-swiping', ''),
              Scene.expect(popup).toHaveStyle(variable, value),
            )
          })
        },
      )

      it('defaults to the down direction', () => {
        Scene.scene(
          { update, view },
          Scene.given(
            draggingModel(
              'dir-default',
              {},
              { x: 200, y: 400 },
              { x: 200, y: 480 },
            ),
          ),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(popup).toHaveAttr('data-swipe-direction', 'down'),
          Scene.expect(popup).toHaveStyle('--drawer-swipe-movement-y', '80px'),
        )
      })
    })

    describe('prop: modal', () => {
      it('renders the overlay and data-modal for the default modal drawer', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('modal')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(overlay).toExist(),
          Scene.expect(viewport).toHaveAttr('data-modal', 'true'),
        )
      })

      it('renders the overlay for trap-focus modality', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('modal-trap', { modal: 'trap-focus' })),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(overlay).toExist(),
          Scene.expect(viewport).toHaveAttr('data-modal', 'trap-focus'),
        )
      })

      it('skips the overlay and keeps the page interactive when modal is false', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('modal-false', { modal: false })),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(overlay).toBeAbsent(),
          Scene.expect(viewport).toHaveAttr('data-modal', 'false'),
          Scene.expect(popup).toExist(),
        )
      })
    })

    describe('prop: disablePointerDismissal', () => {
      it('renders the overlay without a dismiss handler', () => {
        Scene.scene(
          { update, view },
          Scene.given(
            openModel('no-dismiss', { disablePointerDismissal: true }),
          ),
          resolveAcquireResources,
          ...resolveObservers(),
          // The overlay exists but carries no click/backdrop wiring, so
          // presses on it cannot dismiss the drawer.
          Scene.expect(overlay).toExist(),
          Scene.expect(overlay).not.toHaveHandler('click'),
          Scene.expect(overlay).not.toHaveHandler('pointerdown'),
          ...expectOpen(),
        )
      })
    })

    describe('prop: snapPoints', () => {
      it('marks the popup and overlay when snap points are configured', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('snap', { snapPoints: ['10rem', 1] })),
          resolveAcquireResources,
          ...resolveObservers({ width: 400, height: 600 }),
          Scene.expect(popup).toHaveAttr('data-snap-points', ''),
          Scene.expect(overlay).toHaveAttr('data-snap-points', ''),
          Scene.expect(popup).not.toHaveAttr('data-expanded'),
        )
      })

      it('marks the popup expanded at the full-height snap point', () => {
        Scene.scene(
          { update, view },
          Scene.given(
            openModel('snap-expanded', {
              snapPoints: ['10rem', 1],
              defaultSnapPoint: 1,
            }),
          ),
          resolveAcquireResources,
          ...resolveObservers({ width: 400, height: 600 }),
          Scene.expect(popup).toHaveAttr('data-expanded', ''),
          Scene.expect(popup).toHaveStyle('--drawer-snap-point-offset', '0px'),
        )
      })

      it('settles on the nearest snap point when a drag ends', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('snap-settle', { snapPoints: ['10rem', 1] })),
          resolveAcquireResources,
          ...resolveObservers({ width: 400, height: 600 }),
          Scene.expect(popup).toHaveStyle(
            '--drawer-snap-point-offset',
            '440px',
          ),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          // Drag up 300px: target offset 140, closer to 0 (expanded) than
          // to the 440px '10rem' point.
          emitDragged(200, 100, 500),
          emitEnded(200, 100, 800),
          Scene.expectHandled(),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
          Scene.expect(popup).toHaveAttr('data-expanded', ''),
          Scene.expect(popup).toHaveStyle('--drawer-snap-point-offset', '0px'),
          ...expectOpen(),
        )
      })

      it('moves the popup with a snap-aware drag and reports progress', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('snap-drag', { snapPoints: ['10rem', 1] })),
          resolveAcquireResources,
          ...resolveObservers({ width: 400, height: 600 }),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(200, 480, 200),
          Scene.expect(popup).toHaveAttr('data-swiping', ''),
          Scene.expect(popup).toHaveStyle('--drawer-swipe-progress', '1'),
        )
      })
    })

    describe('interactions', () => {
      it('opens the drawer when the trigger is clicked', () => {
        Scene.scene(
          { update, view },
          Scene.given({ drawer: DrawerBehavior.init({ id: 'open' }) }),
          ...openDrawer(...expectOpen()),
        )
      })

      it('closes the drawer when the close button is clicked', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('close-button')),
          resolveAcquireResources,
          ...resolveObservers(),
          ...expectOpen(),
          Scene.click(cancelButton),
          Scene.expectHandled(),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
          ...expectObserversEnded(),
          ...expectClosed(),
        )
      })

      it('dismisses on outside press', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('outside-press')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.click(overlay),
          Scene.expectHandled(),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
          ...expectObserversEnded(),
          ...expectClosed(),
        )
      })

      // The foldkit dialog maps Escape to the native <dialog> `cancel`
      // event, which RequestedClose handles. The scene DSL has no
      // cancel/keydown-to-dialog step, so this asserts the wiring only.
      it('registers a cancel handler so Escape requests close', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('escape')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(drawerDialog).toHaveHandler('cancel'),
        )
      })

      it.todo('closes the drawer on Escape')

      it('renders closed without popup content', () => {
        Scene.scene(
          { update, view },
          Scene.given({ drawer: DrawerBehavior.init({ id: 'closed' }) }),
          ...expectClosed(),
          Scene.expect(drawerDialog).not.toHaveAttr('aria-modal'),
          Scene.expect(drawerTitle).toBeAbsent(),
          Scene.expect(drawerDescription).toBeAbsent(),
        )
      })

      it('defaults initial focus to the popup element', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('initial-focus')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.expect(popup).toHaveAttr('tabindex', '-1'),
        )
      })
    })

    describe('swipe gestures', () => {
      it('starts a swipe from the swipe handle on primary pointer down', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-start')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          Scene.expect(popup).toHaveAttr('data-swiping', ''),
          ...expectOpen(),
        )
      })

      it('starts a swipe anywhere on the popup', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-popup')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(popup, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          Scene.expect(popup).toHaveAttr('data-swiping', ''),
        )
      })

      it('does not start a swipe on non-primary pointer down', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-secondary')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, {
            button: 2,
            screenX: 200,
            screenY: 400,
          }),
          Scene.expectIgnored(),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
          ...expectOpen(),
        )
      })

      it('does not start a swipe outside the popup', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-viewport')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(viewport, { screenX: 20, screenY: 20 }),
          Scene.expectIgnored(),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
        )
      })

      it('does not start a swipe from interactive elements', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-button')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(cancelButton, { screenX: 200, screenY: 400 }),
          Scene.expectIgnored(),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
        )
      })

      it('blocks non-touch swipes starting inside drawer content', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-content')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(drawerTitle, {
            pointerType: 'mouse',
            screenX: 200,
            screenY: 400,
          }),
          Scene.expectIgnored(),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
        )
      })

      it('allows touch swipes starting inside drawer content', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-content-touch')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(drawerTitle, {
            pointerType: 'touch',
            screenX: 200,
            screenY: 400,
          }),
          Scene.expectHandled(),
          Scene.expect(popup).toHaveAttr('data-swiping', ''),
        )
      })

      it('writes swipe movement and progress CSS vars while swiping', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-offset')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(200, 480, 100),
          Scene.expect(popup).toHaveStyle('--drawer-swipe-movement-y', '80px'),
          Scene.expect(popup).toHaveStyle(
            '--drawer-swipe-progress',
            '0.26666666666666666',
          ),
          Scene.expect(popup).toHaveAttr('data-swiping', ''),
          ...expectOpen(),
        )
      })

      it('sqrt-damps the popup transform when swiped away from the dismiss edge', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-clamp')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(200, 360, 100),
          // -40 raw → -sqrt(40) damped off-direction travel.
          Scene.expect(popup).toHaveStyle(
            '--drawer-swipe-movement-y',
            `${String(-Math.sqrt(40))}px`,
          ),
          ...expectOpen(),
        )
      })

      it('returns the drawer open after a drag below the dismiss distance', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-short')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(200, 450, 400),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
          Scene.expect(popup).toHaveStyle('--drawer-swipe-movement-y', '0px'),
          ...expectOpen(),
        )
      })

      it('uses a size-based dismiss threshold (half the popup)', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('size-threshold')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          // 160 > 150 (half of the measured 300px popup).
          emitDragged(200, 560, 1000),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
          ...expectObserversEnded(),
          ...expectClosed(),
        )
      })

      it('keeps the drawer open below the size-based threshold', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('below-threshold')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(200, 540, 1000),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          ...expectOpen(),
        )
      })

      it('closes the drawer after a quick flick', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-flick')),
          resolveAcquireResources,
          ...resolveObservers(),
          emit(
            DrawerBehavior.Message.StartedSwipe({
              x: 200,
              y: 400,
              timeStamp: 1,
            }),
          ),
          emitDragged(200, 440, 50),
          emitEnded(200, 440, 51),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
          ...expectObserversEnded(),
          ...expectClosed(),
        )
      })

      it('does not dismiss on a flick back toward open', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-reverse')),
          resolveAcquireResources,
          ...resolveObservers(),
          emit(
            DrawerBehavior.Message.StartedSwipe({
              x: 200,
              y: 400,
              timeStamp: 1,
            }),
          ),
          emitDragged(200, 480, 300),
          emitDragged(200, 420, 320),
          emitEnded(200, 420, 340),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
          ...expectOpen(),
        )
      })

      it('keeps the drawer open when the drag is cancelled', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-cancel')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(200, 550, 400),
          emitCancelled,
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
          ...expectOpen(),
        )
      })

      it('does not dismiss on an in-place press-release without movement', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-inplace')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
          ...expectOpen(),
        )
      })

      it('does not translate the popup on a stationary move', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-stationary')),
          resolveAcquireResources,
          ...resolveObservers(),
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(200, 400, 100),
          Scene.expect(popup).toHaveStyle('--drawer-swipe-movement-y', '0px'),
          ...expectOpen(),
        )
      })

      it('does not render gesture handlers while closed', () => {
        Scene.scene(
          { update, view },
          Scene.given({ drawer: DrawerBehavior.init({ id: 'swipe-closed' }) }),
          Scene.expect(drawerRoot).toExist(),
          Scene.expect(drawerRoot).not.toHaveHandler('pointerdown'),
          Scene.expect(viewport).toBeAbsent(),
          ...expectClosed(),
        )
      })

      it('ignores a new swipe while a nested drawer is open', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('nested-open')),
          resolveAcquireResources,
          ...resolveObservers(),
          emit(
            DrawerBehavior.Message.NestedDrawersChanged({
              count: 1,
              frontmostHeight: 320,
              swiping: false,
              progress: 0,
            }),
          ),
          Scene.expect(popup).toHaveAttr('data-nested-drawer-open', ''),
          // The pointerdown still produces StartedSwipe — the model ignores
          // it, so the popup stays out of the swiping state.
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          Scene.expect(popup).not.toHaveAttr('data-swiping'),
        )
      })

      it('tracks nested drawer swipe progress on the parent', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('nested-swipe')),
          resolveAcquireResources,
          ...resolveObservers(),
          emit(
            DrawerBehavior.Message.NestedDrawersChanged({
              count: 1,
              frontmostHeight: 320,
              swiping: true,
              progress: 0.6,
            }),
          ),
          Scene.expect(popup).toHaveAttr('data-nested-drawer-open', ''),
          Scene.expect(popup).toHaveAttr('data-nested-drawer-swiping', ''),
          Scene.expect(popup).toHaveStyle('--drawer-swipe-progress', '0.6'),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindDrawer)
verifyRenderer('StyleX', StyleXDrawer)
