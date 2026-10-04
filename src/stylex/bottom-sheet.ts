/* Ported from Meta Astryx BottomSheet (packages/core/src/BottomSheet/) — examples and visual spec adapted to Crease UI tokens. */

import * as stylex from '@stylexjs/stylex'
import { Option } from 'effect'
import * as Mount from 'foldkit/mount'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { Dialog as DialogPrimitive } from '@foldkit/ui'

import * as SheetBehavior from '@/lib/bottom-sheet'
import type {
  BottomSheetSnapPoint,
  SheetHeight,
  SheetPurpose,
} from '@/lib/bottom-sheet'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { overlayStyles } from './overlay-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'

/* astryx exits the sheet on an accelerate curve (cubic-bezier(0.3,0,0.6,0.6));
   Crease UI has no accelerate token, so the exit curve is applied via the
   dynamic style below while the panel is leaving. */
/* PORT-NOTE: needs token 'ease-accelerate' = cubic-bezier(0.3,0,0.6,0.6). */

const styles = stylex.create({
  body: {
    overscrollBehavior: 'contain',
    backgroundColor: tokens.background,
    flexGrow: 1,
    touchAction: 'pan-y',
    minHeight: 0,
    overflowY: 'auto',
  },
  content: {
    boxSizing: 'border-box',
    display: 'flow-root',
    height: '100%',
    minHeight: 'min-content',
  },
  dialog: {
    padding: 0,
    overflow: 'hidden',
    overscrollBehavior: 'contain',
    backgroundColor: tokens.transparent,
    justifyContent: 'stretch',
    touchAction: 'none',
  },
  handle: {
    alignItems: 'center',
    backgroundImage:
      'linear-gradient(to bottom, var(--background) 60%, transparent)',
    cursor: interactionTokens.cursorResizeVertical,
    display: 'flex',
    insetBlockStart: 0,
    insetInlineEnd: 0,
    insetInlineStart: 0,
    justifyContent: 'center',
    position: 'absolute',
    touchAction: 'none',
    zIndex: 1,
    height: '1.5rem',
  },
  nonModalRoot: {
    display: 'flex',
    insetInlineEnd: 0,
    insetInlineStart: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 50,
    bottom: 0,
  },
  pill: {
    borderRadius: foundationTokens.radiusFull,
    backgroundColor: tokens.border,
    height: '0.25rem',
    width: '2rem',
  },
  positioner: {
    display: 'flex',
    insetInlineEnd: 0,
    insetInlineStart: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
    bottom: 0,
  },
  scrim: {
    inset: 0,
    backgroundColor: tokens.backdrop,
    position: 'absolute',
    transitionDuration: {
      default: interactionTokens.motionModerate,
      '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone,
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  sheet: {
    borderColor: tokens.border,
    borderStyle: 'solid',
    overflow: 'hidden',
    backgroundColor: tokens.background,
    borderBlockStartWidth: '1px',
    borderInlineEndWidth: '1px',
    borderInlineStartWidth: '1px',
    borderStartEndRadius: foundationTokens.radiusXl,
    borderStartStartRadius: foundationTokens.radiusXl,
    boxShadow: tokens.shadowCard,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    outlineStyle: 'none',
    pointerEvents: 'auto',
    position: 'relative',
    transform: {
      '@starting-style': 'translateY(100%)',
      default: 'translateY(0)',
      ':is([data-closed])': 'translateY(100%)',
    },
    transitionDuration: {
      default: interactionTokens.motionSlow,
      '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone,
    },
    transitionProperty: 'transform, opacity, height',
    transitionTimingFunction: interactionTokens.easingStandard,
    willChange: 'transform, opacity',
    maxWidth: '640px',
    minHeight: 0,
    width: '100%',
  },
  sheetRetained: {
    opacity: {
      '@starting-style': 1,
      default: 0,
    },
    transitionDelay: interactionTokens.motionSlow,
    transitionDuration: interactionTokens.motionSlow,
    transitionProperty: 'opacity',
    visibility: 'hidden',
  },
  srOnly: {
    margin: '-1px',
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
})

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
): Record<string, string> => {
  const transform = sheetTransform(g, isLeaving, isExiting)
  return {
    ...sheetHeightStyle(g, height),
    paddingBlockEnd: `calc(env(safe-area-inset-bottom, 0px) + ${String(OVERSCROLL_PADDING)}px)`,
    marginBlockEnd: `${String(-OVERSCROLL_PADDING)}px`,
    ...(transform === undefined ? {} : { transform }),
    ...(g.dragPhase !== 'Idle' ? { transitionProperty: 'none' } : {}),
    ...(isLeaving || isExiting
      ? { transitionTimingFunction: 'cubic-bezier(0.3, 0, 0.6, 0.6)' }
      : {}),
  }
}

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
      h.Class(className(styles.handle)),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'bottom-sheet-pill'),
          h.Class(className(styles.pill)),
        ],
        [],
      ),
    ],
  ),
  h.div(
    [
      h.DataAttribute('slot', 'bottom-sheet-body'),
      h.Class(className(styles.body)),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'bottom-sheet-content'),
          h.Class(className(styles.content)),
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
  layoutStyle?: ComponentLayoutStyle
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
        h.Class(className(styles.nonModalRoot, props.layoutStyle)),
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
                h.Class(className(styles.sheet)),
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
            hd.Class(
              className(overlayStyles.dialog, styles.dialog, props.layoutStyle),
            ),
            ...(model.purpose === 'required' ? [hd.Role('alertdialog')] : []),
            ...dragTrackingAttributes(dispatch, detents, swiping, hd),
          ],
          isVisible
            ? [
                hd.span(
                  [
                    hd.Id(DialogPrimitive.titleId(model.dialog)),
                    hd.Class(className(styles.srOnly)),
                  ],
                  [props.label],
                ),
                hd.div(
                  [
                    ...(model.purpose === 'info' ? backdrop : []),
                    hd.DataAttribute('slot', 'bottom-sheet-scrim'),
                    hd.Class(className(styles.scrim)),
                    hd.Style({ opacity: String(leaving ? 0 : scrimOpacity) }),
                  ],
                  [],
                ),
                hd.div(
                  [
                    hd.DataAttribute('slot', 'bottom-sheet-positioner'),
                    hd.Class(className(styles.positioner)),
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
                        hd.Class(className(styles.sheet)),
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
  layoutStyle?: ComponentLayoutStyle
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
                className(
                  styles.sheet,
                  hidden ? styles.sheetRetained : undefined,
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
            hd.Class(
              className(overlayStyles.dialog, styles.dialog, props.layoutStyle),
            ),
            ...dragTrackingAttributes(dispatch, activeDetents, swiping, hd),
          ],
          isVisible && activeSheet !== undefined
            ? [
                hd.div(
                  [
                    ...(activeSheet.purpose === 'info' ? backdrop : []),
                    hd.DataAttribute('slot', 'bottom-sheet-switcher-scrim'),
                    hd.Class(className(styles.scrim)),
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
                    hd.Class(className(styles.positioner)),
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
