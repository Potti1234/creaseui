/* Ported from Meta Astryx BottomSheet (packages/core/src/BottomSheet/) — examples and visual spec adapted to Crease UI tokens. */

import { Option } from 'effect'
import * as Mount from 'foldkit/mount'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { Dialog as DialogPrimitive } from '@foldkit/ui'

import * as SheetBehavior from '@/lib/bottom-sheet'
import { cn } from '@/lib/utils'
import type {
  BottomSheetSnapPoint,
  SheetHeight,
  SheetPurpose,
} from '@/lib/bottom-sheet'

export const Model = SheetBehavior.Model
export type Model = typeof Model.Type
export const Message = SheetBehavior.Message
export type Message = typeof Message.Type
export const OutMessage = SheetBehavior.OutMessage
export type OutMessage = typeof OutMessage.Type
export const SwitcherModel = SheetBehavior.SwitcherModel
export type SwitcherModel = typeof SwitcherModel.Type
export const SwitcherMessage = SheetBehavior.SwitcherMessage
export type SwitcherMessage = typeof SwitcherMessage.Type
export const SwitcherOutMessage = SheetBehavior.SwitcherOutMessage
export type SwitcherOutMessage = typeof SwitcherOutMessage.Type
export const SheetState = SheetBehavior.SheetState
export type SheetState = typeof SheetState.Type
export type {
  BottomSheetSnapPoint,
  SheetHeight,
  SheetPurpose,
} from '@/lib/bottom-sheet'

export const init = SheetBehavior.init
export const update = SheetBehavior.update
export const open = SheetBehavior.open
export const close = SheetBehavior.close
export const initSwitcher = SheetBehavior.initSwitcher
export const updateSwitcher = SheetBehavior.updateSwitcher
export const openSheet = SheetBehavior.openSheet
export const closeSwitcher = SheetBehavior.closeSwitcher

export const OVERSCROLL_PADDING = SheetBehavior.OVERSCROLL_PADDING
export const HEIGHT_BUDGETS = SheetBehavior.HEIGHT_BUDGETS

const DIALOG_CLASS =
  'bg-transparent p-0 overflow-hidden overscroll-contain touch-none open:block'
const SCRIM_CLASS =
  'absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out motion-reduce:transition-none'
const POSITIONER_CLASS =
  'pointer-events-none absolute inset-x-0 bottom-0 flex justify-center'
const SHEET_CLASS =
  'pointer-events-auto relative box-border flex w-full max-w-[640px] min-h-0 flex-col overflow-hidden border-x border-t border-border bg-background shadow-lg outline-none will-change-transform rounded-t-2xl transition-[transform,opacity,height] duration-300 ease-[cubic-bezier(0.24,1,0.4,1)] data-[closed]:translate-y-full data-[closed]:ease-[cubic-bezier(0.3,0,0.6,0.6)] starting:translate-y-full motion-reduce:transition-none'
const HANDLE_BAR_CLASS =
  'absolute inset-x-0 top-0 z-[1] flex h-6 touch-none cursor-grab items-center justify-center bg-gradient-to-b from-background from-60% to-transparent'
const HANDLE_PILL_CLASS = 'h-1 w-8 rounded-full bg-border'
const BODY_CLASS =
  'min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain bg-background'
const CONTENT_CLASS = 'flow-root h-full min-h-min box-border'
const SR_ONLY_CLASS =
  'absolute m-[-1px] h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]'

const budgetCss = (height: SheetHeight): string =>
  height === 'hug'
    ? `${String(SheetBehavior.HEIGHT_BUDGETS.hug * 100)}dvh`
    : height === 'capped'
      ? `${String(SheetBehavior.HEIGHT_BUDGETS.capped * 100)}dvh`
      : height === 'tall'
        ? `${String(SheetBehavior.HEIGHT_BUDGETS.tall * 100)}dvh`
        : typeof height === 'number'
          ? `${String(height)}px`
          : height.endsWith('%')
            ? `${String(height.slice(0, -1))}dvh`
            : height

const viewportHeight = (): number =>
  typeof window === 'undefined' ? 0 : window.innerHeight

const detentsFor = (
  sheetHeight: number,
  snapPoints: ReadonlyArray<BottomSheetSnapPoint>,
): ReadonlyArray<number> =>
  SheetBehavior.computeDetentOffsets(
    sheetHeight,
    SheetBehavior.resolveSnapPoints(snapPoints, viewportHeight()),
  )

const gestureLayoutOffset = (g: SheetBehavior.GestureState): number =>
  g.dragPhase === 'Dragging'
    ? g.dragOffset < g.settledOffset
      ? 0
      : g.settledLayoutOffset
    : g.settledLayoutOffset

/** translateY for a panel: undefined when the element should rest at its
    natural position (entry/exit transforms come from the data-state classes);
    a px value while dragging or settled at a detent. */
const sheetTransform = (
  g: SheetBehavior.GestureState,
  isLeaving: boolean,
  isExiting: boolean,
): string | undefined => {
  if (isLeaving) return undefined
  if (isExiting) return 'translateY(100%)'
  const dragging = g.dragPhase === 'Dragging'
  const activeOffset = dragging ? g.dragOffset : g.settledOffset
  const lift = dragging ? g.dragLift : 0
  const translate = activeOffset - gestureLayoutOffset(g) - lift
  return translate !== 0 || g.dragPhase !== 'Idle'
    ? `translateY(${String(translate)}px)`
    : undefined
}

const sheetHeightStyle = (
  g: SheetBehavior.GestureState,
  height: SheetHeight,
): Record<string, string> => {
  const layoutOffset = gestureLayoutOffset(g)
  if (layoutOffset > 0 && g.sheetHeight > 0) {
    return { height: `${String(g.sheetHeight - layoutOffset)}px` }
  }
  return height === 'hug'
    ? {
        height: 'fit-content',
        maxHeight: `calc(${budgetCss(height)} + ${String(OVERSCROLL_PADDING)}px)`,
      }
    : {
        height: `calc(${budgetCss(height)} + ${String(OVERSCROLL_PADDING)}px)`,
      }
}

const panelStyle = (
  g: SheetBehavior.GestureState,
  height: SheetHeight,
  isLeaving: boolean,
  isExiting: boolean,
): Record<string, string> => ({
  ...sheetHeightStyle(g, height),
  paddingBlockEnd: `calc(env(safe-area-inset-bottom, 0px) + ${String(OVERSCROLL_PADDING)}px)`,
  marginBlockEnd: `${String(-OVERSCROLL_PADDING)}px`,
  ...(sheetTransform(g, isLeaving, isExiting) === undefined
    ? {}
    : { transform: sheetTransform(g, isLeaving, isExiting) as string }),
  ...(g.dragPhase !== 'Idle' ? { transitionProperty: 'none' } : {}),
})

/** The tap-to-drag promotion guard: a pointerdown on the handle drags
    immediately; one on the body arms a drag only when the body is scrolled to
    the top (astryx bodyProps promotion slop). */
export const isSheetDragCandidate = (
  target: unknown,
): false | 'handle' | 'arm' => {
  if (!(target instanceof HTMLElement)) return false
  if (target.closest('[data-slot="bottom-sheet-handle"]') !== null)
    return 'handle'
  const body = target.closest('[data-slot="bottom-sheet-body"]')
  if (body !== null && body.scrollTop <= 0) return 'arm'
  return false
}

export type SheetDragDispatch<Msg> = Readonly<{
  started: (frame: { y: number; timeStamp: number; armOnly: boolean }) => Msg
  dragged: (frame: { y: number; timeStamp: number; detents: number[] }) => Msg
  ended: (frame: { y: number; timeStamp: number; detents: number[] }) => Msg
  cancelled: (detents: number[]) => Msg
}>

const dragStartAttribute = <Msg>(
  dispatch: SheetDragDispatch<Msg>,
  h: HtmlBuilder<Msg>,
): Attribute<Msg> =>
  h.OnPointerDown(
    (_pointerType, button, _sx, sy, timeStamp, _cx, _cy, _pid, target) => {
      if (button !== 0) return Option.none()
      const candidate = isSheetDragCandidate(target)
      if (candidate === false) return Option.none()
      return Option.some(
        dispatch.started({ y: sy, timeStamp, armOnly: candidate === 'arm' }),
      )
    },
  )

/** Pointer tracking while a drag is live — attached to the full-viewport
    dialog so a fast swipe still tracks after the pointer leaves the sheet. */
const dragTrackingAttributes = <Msg>(
  dispatch: SheetDragDispatch<Msg>,
  detents: ReadonlyArray<number>,
  enabled: boolean,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Attribute<Msg>> =>
  enabled
    ? [
        h.OnPointerMove((_sx, sy) =>
          Option.some(
            dispatch.dragged({
              y: sy,
              timeStamp: performance.now(),
              detents: [...detents],
            }),
          ),
        ),
        h.OnPointerUp((_sx, sy) =>
          Option.some(
            dispatch.ended({
              y: sy,
              timeStamp: performance.now(),
              detents: [...detents],
            }),
          ),
        ),
        h.OnPointerLeave(() => Option.some(dispatch.cancelled([...detents]))),
      ]
    : []

const panelBody = <Msg>(
  content: Html,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Html> => [
  h.div(
    [
      h.DataAttribute('slot', 'bottom-sheet-handle'),
      h.AriaHidden(true),
      h.Class(HANDLE_BAR_CLASS),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'bottom-sheet-pill'),
          h.Class(HANDLE_PILL_CLASS),
        ],
        [],
      ),
    ],
  ),
  h.div(
    [h.DataAttribute('slot', 'bottom-sheet-body'), h.Class(BODY_CLASS)],
    [
      h.div(
        [
          h.DataAttribute('slot', 'bottom-sheet-content'),
          h.Class(CONTENT_CLASS),
        ],
        [content],
      ),
    ],
  ),
]

export type BottomSheetProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  label: string
  content: Html
  class?: string
}>

/** A swipe-down sheet with astryx detent snapping, magnetic drags, flick and
    overshoot dismissal, and scrim opacity coupled to the drag offset. */
export const bottomSheet = <Msg>(
  props: BottomSheetProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const model = props.model
  const send = props.toParentMessage
  const g = model.gesture
  const detents = detentsFor(g.sheetHeight, model.snapPoints)
  const peek = SheetBehavior.peekOffsetFor(detents, g.sheetHeight)
  const maxOffset = detents[detents.length - 1] ?? 0
  const dismissOffset =
    maxOffset +
    SheetBehavior.visibleHeightForOffset(g.sheetHeight, maxOffset) *
      SheetBehavior.DISMISS_OVERSHOOT_RATIO
  const activeOffset =
    g.dragPhase === 'Dragging' ? g.dragOffset : g.settledOffset
  const scrimOpacity = SheetBehavior.scrimOpacityForOffset(
    activeOffset,
    detents,
    dismissOffset,
    peek,
  )
  const swiping = g.dragPhase !== 'Idle'

  const dispatch: SheetDragDispatch<Msg> = {
    started: frame => send(Message.StartedSheetDrag(frame)),
    dragged: frame => send(Message.DraggedSheet(frame)),
    ended: frame => send(Message.EndedSheetDrag(frame)),
    cancelled: ds => send(Message.CancelledSheetDrag({ detents: ds })),
  }

  if (!model.hasScrim) {
    return h.div(
      [
        h.DataAttribute('slot', 'bottom-sheet-root'),
        h.Role('dialog'),
        h.AriaModal(false),
        h.AriaLabel(props.label),
        h.Class(
          cn(
            'pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center',
            props.class,
          ),
        ),
      ],
      model.dialog.isOpen || model.isExiting
        ? [
            h.div(
              [
                h.DataAttribute('slot', 'bottom-sheet-panel'),
                h.DataAttribute('sheet-purpose', model.purpose),
                h.OnMount(
                  Mount.mapMessage(SheetBehavior.ObserveSheet(), message =>
                    send(message),
                  ),
                ),
                h.Style(panelStyle(g, model.height, false, model.isExiting)),
                h.Class(cn(SHEET_CLASS, props.class)),
                dragStartAttribute(dispatch, h),
                ...dragTrackingAttributes(dispatch, detents, swiping, h),
              ],
              panelBody(props.content, h),
            ),
          ]
        : [],
    )
  }

  return h.submodel({
    slotId: model.dialog.id,
    model: model.dialog,
    view: DialogPrimitive.view,
    viewInputs: {
      toView: ({
        dialog: dialogAttributes,
        backdrop,
        panel: panelAttributes,
        isVisible,
      }: DialogPrimitive.RenderInfo) => {
        const hd = h
        const leaving =
          model.dialog.animation.transitionState === 'LeaveStart' ||
          model.dialog.animation.transitionState === 'LeaveAnimating'
        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'bottom-sheet'),
            hd.Class(cn(DIALOG_CLASS, props.class)),
            ...(model.purpose === 'required' ? [hd.Role('alertdialog')] : []),
            ...dragTrackingAttributes(dispatch, detents, swiping, hd),
          ],
          isVisible
            ? [
                hd.span(
                  [
                    hd.Id(DialogPrimitive.titleId(model.dialog)),
                    hd.Class(SR_ONLY_CLASS),
                  ],
                  [props.label],
                ),
                hd.div(
                  [
                    ...(model.purpose === 'info' ? backdrop : []),
                    hd.DataAttribute('slot', 'bottom-sheet-scrim'),
                    hd.Class(SCRIM_CLASS),
                    hd.Style({ opacity: String(leaving ? 0 : scrimOpacity) }),
                  ],
                  [],
                ),
                hd.div(
                  [
                    hd.DataAttribute('slot', 'bottom-sheet-positioner'),
                    hd.Class(POSITIONER_CLASS),
                  ],
                  [
                    hd.div(
                      [
                        ...panelAttributes,
                        hd.DataAttribute('slot', 'bottom-sheet-panel'),
                        hd.DataAttribute('sheet-purpose', model.purpose),
                        hd.OnMount(
                          Mount.mapMessage(
                            SheetBehavior.ObserveSheet(),
                            message => send(message),
                          ),
                        ),
                        hd.Style(panelStyle(g, model.height, leaving, false)),
                        hd.Class(cn(SHEET_CLASS, props.class)),
                        dragStartAttribute(dispatch, hd),
                      ],
                      panelBody(props.content, hd),
                    ),
                  ],
                ),
              ]
            : [],
        )
      },
    },
    toParentMessage: message =>
      send(Message.GotBottomSheetDialogMessage({ message })),
  })
}

// ——— Switcher

export type SwitcherSheetContent = Readonly<{
  id: string
  content: Html
}>

export type BottomSheetSwitcherProps<Msg> = Readonly<{
  model: SwitcherModel
  toParentMessage: (message: SwitcherMessage) => Msg
  sheets: ReadonlyArray<SwitcherSheetContent>
  class?: string
}>

const switcherScrimOpacity = (sheet: SheetState): number => {
  const detents = detentsFor(sheet.gesture.sheetHeight, sheet.snapPoints)
  const peek = SheetBehavior.peekOffsetFor(detents, sheet.gesture.sheetHeight)
  const maxOffset = detents[detents.length - 1] ?? 0
  const dismissOffset =
    maxOffset +
    SheetBehavior.visibleHeightForOffset(sheet.gesture.sheetHeight, maxOffset) *
      SheetBehavior.DISMISS_OVERSHOOT_RATIO
  const activeOffset =
    sheet.gesture.dragPhase === 'Dragging'
      ? sheet.gesture.dragOffset
      : sheet.gesture.settledOffset
  return SheetBehavior.scrimOpacityForOffset(
    activeOffset,
    detents,
    dismissOffset,
    peek,
  )
}

const switcherDispatch = <Msg>(
  send: (message: SwitcherMessage) => Msg,
): SheetDragDispatch<Msg> => ({
  started: frame => send(SwitcherMessage.StartedSheetDrag(frame)),
  dragged: frame => send(SwitcherMessage.DraggedSheet(frame)),
  ended: frame => send(SwitcherMessage.EndedSheetDrag(frame)),
  cancelled: ds => send(SwitcherMessage.CancelledSheetDrag({ detents: ds })),
})

/** One shared dialog hosting several sheets; requesting a sheet slides it in
    over the currently mounted one, which is retained covered and then fades
    (astryx BottomSheetSwitcher). */
export const bottomSheetSwitcher = <Msg>(
  props: BottomSheetSwitcherProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const model = props.model
  const send = props.toParentMessage
  const activeId = Option.getOrUndefined(model.activeSheetId)
  const previousId = Option.getOrUndefined(model.previousSheetId)
  const activeSheet =
    activeId === undefined ? undefined : model.sheets[activeId]
  const swiping =
    activeSheet !== undefined && activeSheet.gesture.dragPhase !== 'Idle'
  const dispatch = switcherDispatch(send)
  const activeDetents =
    activeSheet === undefined
      ? [0]
      : detentsFor(activeSheet.gesture.sheetHeight, activeSheet.snapPoints)

  return h.submodel({
    slotId: model.dialog.id,
    model: model.dialog,
    view: DialogPrimitive.view,
    viewInputs: {
      toView: ({
        dialog: dialogAttributes,
        backdrop,
        panel: panelAttributes,
        isVisible,
      }: DialogPrimitive.RenderInfo) => {
        const hd = h
        const leaving =
          model.dialog.animation.transitionState === 'LeaveStart' ||
          model.dialog.animation.transitionState === 'LeaveAnimating'

        const renderSheet = (
          spec: SwitcherSheetContent,
          hidden: boolean,
        ): Html | undefined => {
          const sheet = model.sheets[spec.id]
          if (sheet === undefined) return undefined
          return hd.keyed('div')(
            `sheet-${spec.id}-${hidden ? 'retained' : 'active'}`,
            [
              ...(hidden ? [] : panelAttributes),
              hd.DataAttribute('slot', 'bottom-sheet-panel'),
              hd.DataAttribute('sheet-id', spec.id),
              hd.DataAttribute('sheet-purpose', sheet.purpose),
              hd.OnMount(
                Mount.mapMessage(
                  SheetBehavior.ObserveSwitcherSheet({ sheetId: spec.id }),
                  message => send(message),
                ),
              ),
              hd.Style(panelStyle(sheet.gesture, sheet.height, leaving, false)),
              hd.Class(
                cn(
                  SHEET_CLASS,
                  hidden
                    ? 'invisible opacity-0 transition-opacity delay-300 duration-300 starting:opacity-100'
                    : '',
                ),
              ),
              ...(hidden ? [hd.Inert(true), hd.AriaHidden(true)] : []),
              dragStartAttribute(dispatch, hd),
            ],
            panelBody(spec.content, hd),
          )
        }

        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'bottom-sheet-switcher'),
            hd.Class(cn(DIALOG_CLASS, props.class)),
            ...dragTrackingAttributes(dispatch, activeDetents, swiping, hd),
          ],
          isVisible && activeSheet !== undefined
            ? [
                hd.div(
                  [
                    ...(activeSheet.purpose === 'info' ? backdrop : []),
                    hd.DataAttribute('slot', 'bottom-sheet-switcher-scrim'),
                    hd.Class(SCRIM_CLASS),
                    hd.Style({
                      opacity: String(
                        leaving ? 0 : switcherScrimOpacity(activeSheet),
                      ),
                    }),
                  ],
                  [],
                ),
                hd.div(
                  [
                    hd.DataAttribute(
                      'slot',
                      'bottom-sheet-switcher-positioner',
                    ),
                    hd.Class(POSITIONER_CLASS),
                  ],
                  [
                    ...(previousId === undefined
                      ? []
                      : props.sheets
                          .filter(spec => spec.id === previousId)
                          .map(spec => renderSheet(spec, true))
                          .filter((el): el is Html => el !== undefined)),
                    ...(activeId === undefined
                      ? []
                      : props.sheets
                          .filter(spec => spec.id === activeId)
                          .map(spec => renderSheet(spec, false))
                          .filter((el): el is Html => el !== undefined)),
                  ],
                ),
              ]
            : [],
        )
      },
    },
    toParentMessage: message =>
      send(SwitcherMessage.GotSwitcherDialogMessage({ message })),
  })
}
