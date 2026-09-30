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
 *  - Snap points (~30 tests): no snapPoints prop or model state. An it.todo
 *    marks the missing capability.
 *  - Nested drawers (~15 tests): presence tracking and nested-swipe
 *    arbitration are runtime/layout behaviors the scene DSL cannot reach.
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
 *  - modal={false} / dismissible / keepMounted props and entrance/exit
 *    animation timing (runtime driven).
 *
 * Deviation: the scene DSL has no pointermove, pointerleave, or dialog
 * `cancel` steps, so DraggedDrawer and CancelledDrawerDrag are fed through
 * Scene.Subscription.emit — the same dispatch path a real subscription
 * message takes. Mid-drag models are built with the real update for
 * `Scene.given` setup.
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
      direction?: 'top' | 'right' | 'bottom' | 'left'
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
  ...(result.outMessage === undefined
    ? {}
    : { outMessage: result.outMessage }),
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
const content = Scene.selector('[data-slot="drawer-content"]')
const handle = Scene.selector('[data-slot="drawer-handle"]')
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
// next scene. Build a fresh step for each test.
const expectAcquireEnded = () =>
  Scene.Mount.expectEnded(
    DialogPrimitive.AcquireResources,
    measurePopupMount,
  )

// The content element carries a MeasureDrawerPopup OnMount that feeds the
// popup's measured size into the model (Base UI derives the swipe-dismiss
// threshold as half the popup size). Resolve it with the lifted message and
// a representative 200px popup — same resolve-with-lifted-message pattern as
// the tooltip anchor mount.
const measurePopupMount = { name: DrawerBehavior.MeasureDrawerPopup.name }
const resolveMeasurePopup = Scene.Mount.resolve(measurePopupMount, {
  _tag: 'GotDrawerMessage' as const,
  message: DrawerBehavior.Message.MeasuredDrawerPopupSize({ size: 200 }),
})

const emitDragged = (offset: number, timeStamp: number) =>
  Scene.Subscription.emit<Message>({
    _tag: 'GotDrawerMessage',
    message: DrawerBehavior.Message.DraggedDrawer({ offset, timeStamp }),
  })

const emitCancelled = Scene.Subscription.emit<Message>({
  _tag: 'GotDrawerMessage',
  message: DrawerBehavior.Message.CancelledDrawerDrag(),
})

/** Runs the shared open flow: click the trigger, acknowledge the dialog
 *  mount, and land on a fully open drawer. */
const openDrawer = (
  ...rest: ReadonlyArray<Scene.Step<Model, Message, DrawerBehavior.OutMessage>>
) => [
  Scene.click(openButton),
  Scene.expectHandled(),
  Scene.expectOutMessage(DrawerBehavior.OutMessage.Opened()),
  resolveShowDialog,
  resolveAcquireResources,
  resolveMeasurePopup,
  Scene.expect(content).toExist(),
  ...rest,
]

/** Asserts the drawer is visually open: content, overlay, handle, and the
 *  open data attributes are all present. */
const expectOpen = () => [
  Scene.expect(drawerDialog).toHaveAttr('data-open', ''),
  Scene.expect(overlay).toExist(),
  Scene.expect(content).toExist(),
  Scene.expect(handle).toExist(),
]

/** Asserts the drawer is visually closed: the dialog stays mounted but the
 *  overlay/content/handle are gone. */
const expectClosed = () => [
  Scene.expect(drawerDialog).not.toHaveAttr('data-open'),
  Scene.expect(overlay).toBeAbsent(),
  Scene.expect(content).toBeAbsent(),
  Scene.expect(handle).toBeAbsent(),
]

const verifyRenderer = (name: string, Drawer: DrawerModule) => {
  const view = (
    model: Model,
    h: HtmlBuilder<Message>,
    direction?: 'top' | 'right' | 'bottom' | 'left',
  ) =>
    h.div([], [
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
          direction,
          footer: slots => [
            h.button([...slots.closeButton], ['Cancel']),
          ],
        },
        h,
      ),
    ])

  const openModel = (id: string): Model => ({
    drawer: DrawerBehavior.open(DrawerBehavior.init({ id })).model,
  })

  const draggingModel = (
    id: string,
    offset: number,
    timeStamp = 60,
  ): Model => {
    const started = DrawerBehavior.update(
      openModel(id).drawer,
      DrawerBehavior.Message.StartedDrawerDrag({
        position: 400,
        timeStamp: 0,
      }),
    )
    return {
      drawer: DrawerBehavior.update(
        started.model,
        DrawerBehavior.Message.DraggedDrawer({ offset, timeStamp }),
      ).model,
    }
  }

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
          resolveMeasurePopup,
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
          resolveMeasurePopup,
          Scene.expect(drawerDialog).toHaveAttr('aria-modal', 'true'),
        )
      })

      it('exposes the drawer description element id', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('aria-desc')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.expect(drawerDescription).toExist(),
          Scene.expect(drawerDescription).toHaveAttr(
            'id',
            'aria-desc-dialog-description',
          ),
        )
      })

      it('points aria-describedby at the drawer description', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('aria-desc-fails')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.expect(drawerDescription).toExist(),
          Scene.expect(drawerDialog).toHaveAttr(
            'aria-describedby',
            'aria-desc-fails-dialog-description',
          ),
        )
      })
    })

    describe('prop: direction', () => {
      const directions = [
        { direction: 'bottom' as const, transform: 'translateY(120px)' },
        { direction: 'top' as const, transform: 'translateY(-120px)' },
        { direction: 'right' as const, transform: 'translateX(120px)' },
        { direction: 'left' as const, transform: 'translateX(-120px)' },
      ]
      directions.forEach(({ direction, transform }) => {
        it(`translates the popup toward the ${direction} edge while dragging`, () => {
          Scene.scene(
            {
              update,
              view: (model, h) => view(model, h, direction),
            },
            Scene.given(draggingModel(`dir-${direction}`, 120)),
            resolveAcquireResources,
          resolveMeasurePopup,
            Scene.expect(content).toHaveAttr(
              'data-vaul-drawer-direction',
              direction,
            ),
            Scene.expect(content).toHaveStyle('transform', transform),
          )
        })
      })

      it('defaults to the bottom direction', () => {
        Scene.scene(
          { update, view },
          Scene.given(draggingModel('dir-default', 80)),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.expect(content).toHaveAttr(
            'data-vaul-drawer-direction',
            'bottom',
          ),
          Scene.expect(content).toHaveStyle('transform', 'translateY(80px)'),
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
          resolveMeasurePopup,
          ...expectOpen(),
          Scene.click(cancelButton),
          Scene.expectHandled(),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
          ...expectClosed(),
        )
      })

      it('dismisses on outside press', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('outside-press')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.click(overlay),
          Scene.expectHandled(),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
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
          resolveMeasurePopup,
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
    })

    describe('swipe gestures', () => {
      it('starts a swipe drag from the handle on primary pointer down', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-start')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          Scene.expect(handle).toHaveAttr('data-drag-phase', 'Dragging'),
          ...expectOpen(),
        )
      })

      it('does not start a swipe drag on non-primary pointer down', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-secondary')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, {
            button: 2,
            screenX: 200,
            screenY: 400,
          }),
          Scene.expectIgnored(),
          Scene.expect(handle).toHaveAttr('data-drag-phase', 'Idle'),
          ...expectOpen(),
        )
      })

      it('applies the drag offset to the popup transform while swiping', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-offset')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(80, 100),
          Scene.expect(content).toHaveStyle('transform', 'translateY(80px)'),
          Scene.expect(handle).toHaveAttr('data-drag-phase', 'Dragging'),
          ...expectOpen(),
        )
      })

      // DIVERGENCE (intentional): Base UI applies sqrt damping so the popup
      // can overshoot past its edge while swiping away from the dismiss
      // direction. creaseui clamps the offset at zero instead.
      it('clamps the popup transform when swiped in the non-dismiss direction', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-clamp')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(-40, 100),
          Scene.expect(content).toHaveStyle('transform', 'translateY(0px)'),
          ...expectOpen(),
        )
      })

      it('returns the drawer open after a drag below the dismiss distance', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-short')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(50, 400),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expect(handle).toHaveAttr('data-drag-phase', 'Idle'),
          Scene.expect(content).toHaveStyle('transform', 'translateY(0px)'),
          ...expectOpen(),
        )
      })

      it('closes an uncontrolled drawer after a slow long drag', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-long')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(150, 1000),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
          ...expectClosed(),
        )
      })

      it('closes the drawer after a quick flick', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-flick')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(40, 50),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
          ...expectClosed(),
        )
      })

      it('does not dismiss on a flick back toward open', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-reverse')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(80, 400),
          emitDragged(20, 450),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expect(handle).toHaveAttr('data-drag-phase', 'Idle'),
          ...expectOpen(),
        )
      })

      it('ends the swipe drag on primary button release mid-gesture', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-release')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(60, 300),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expect(handle).toHaveAttr('data-drag-phase', 'Idle'),
          ...expectOpen(),
        )
      })

      it('keeps the drawer open when the drag is cancelled', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-cancel')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(150, 400),
          emitCancelled,
          Scene.expect(handle).toHaveAttr('data-drag-phase', 'Idle'),
          ...expectOpen(),
          Scene.pointerUp(handle),
          Scene.expectIgnored(),
          ...expectOpen(),
        )
      })

      it('does not open on an in-place press-release without movement', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-inplace')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expect(handle).toHaveAttr('data-drag-phase', 'Idle'),
          ...expectOpen(),
        )
      })

      it('does not translate the popup on a stationary move', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('drag-stationary')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(0, 100),
          Scene.expect(content).toHaveStyle('transform', 'translateY(0px)'),
          ...expectOpen(),
        )
      })

      it('does not start pointer swipes while a closed drawer remains mounted', () => {
        Scene.scene(
          { update, view },
          Scene.given({ drawer: DrawerBehavior.init({ id: 'swipe-closed' }) }),
          Scene.expect(drawerRoot).toExist(),
          Scene.expect(drawerRoot).not.toHaveHandler('pointerdown'),
          Scene.expect(handle).toBeAbsent(),
          ...expectClosed(),
        )
      })

      // DIVERGENCE (intentional): Base UI lets a swipe start anywhere on the
      // viewport/popup. creaseui only starts a drag from the handle.
      it('does not start pointer swipes from the popup content', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('swipe-content')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.expect(content).not.toHaveHandler('pointerdown'),
          Scene.expect(drawerTitle).not.toHaveHandler('pointerdown'),
          Scene.expect(overlay).not.toHaveHandler('pointerdown'),
          ...expectOpen(),
        )
      })

      it('uses a size-based swipe threshold', () => {
        Scene.scene(
          { update, view },
          Scene.given(openModel('size-threshold')),
          resolveAcquireResources,
          resolveMeasurePopup,
          Scene.pointerDown(handle, { screenX: 200, screenY: 400 }),
          Scene.expectHandled(),
          emitDragged(110, 300),
          Scene.pointerUp(handle),
          Scene.expectHandled(),
          Scene.expectOutMessage(DrawerBehavior.OutMessage.Closed()),
          resolveCloseDialog,
          expectAcquireEnded(),
          ...expectClosed(),
        )
      })

      it.todo('settles on the nearest snap point when a drag ends')

      it.todo('defaults initial focus to the popup element')
    })
  })
}

verifyRenderer('Tailwind', TailwindDrawer)
verifyRenderer('StyleX', StyleXDrawer)
