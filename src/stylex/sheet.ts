import { reset } from '@/stylex/reset'
import { Option } from 'effect'
import * as Mount from 'foldkit/mount'
import type { Attribute, ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'

import { Dialog as DialogPrimitive } from '@foldkit/ui'

import * as Icon from '@/lib/icon'
import * as SheetBehavior from '@/lib/sheet'
import type { SheetHeight, SheetSnapPoint } from '@/lib/sheet'
import type { ComponentLayoutStyle } from './contracts'
import { foundationTokens } from './foundations-tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { overlayStyles } from './overlay-tokens.stylex'
import { className } from './style'
import { tokens } from './tokens.stylex'

/* One sheet component: the shadcn/ui sheet.tsx edge-panel port for `top`,
   `right`, `bottom`, and `left`, with Meta Astryx's BottomSheet gesture engine
   (detent offsets, magnetic drags, flick/overshoot dismissal, scrim opacity
   coupling, grab handle) engaged when `side` is 'bottom'. The fullscreen
   native <dialog> is the flex positioning context, so each side aligns the
   panel to an edge without fixed panel positioning. Radix slide keyframes are
   foldkit data-closed CSS transitions.
   astryx exits the sheet on an accelerate curve (cubic-bezier(0.3,0,0.6,0.6));
   Crease UI has no accelerate token, so the exit curve is applied via the
   dynamic style below while the panel is leaving.
   PORT-NOTE: needs token 'ease-accelerate' = cubic-bezier(0.3,0,0.6,0.6). */

const styles = stylex.create({
  // edge panels (shadcn sheet.tsx port)
  bottomDialog: {
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  bottomPanel: {
    transform: { default: 'none', ':is([data-closed])': 'translateY(100%)' },
    borderTopWidth: 1,
    height: 'auto',
    width: '100%',
  },
  leftDialog: {
    alignItems: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  leftPanel: {
    transform: { default: 'none', ':is([data-closed])': 'translateX(-100%)' },
    borderRightWidth: 1,
    height: '100%',
    maxWidth: '24rem',
    width: '75%',
  },
  rightDialog: {
    alignItems: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rightPanel: {
    transform: { default: 'none', ':is([data-closed])': 'translateX(100%)' },
    borderLeftWidth: 1,
    height: '100%',
    maxWidth: '24rem',
    width: '75%',
  },
  topDialog: {
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  topPanel: {
    transform: { default: 'none', ':is([data-closed])': 'translateY(-100%)' },
    borderBottomWidth: 1,
    height: 'auto',
    width: '100%',
  },
  // bottom sheet (astryx BottomSheet port)
  body: {
    overscrollBehavior: 'contain',
    backgroundColor: tokens.background,
    flexGrow: 1,
    touchAction: 'pan-y',
    minHeight: 0,
    overflowY: 'auto',
  },
  bodyContent: {
    boxSizing: 'border-box',
    display: 'flow-root',
    height: '100%',
    minHeight: 'min-content',
  },
  bottomSheetDialog: {
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
  nonModalBottom: {
    display: 'flex',
    insetInlineEnd: 0,
    insetInlineStart: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 50,
    bottom: 0,
  },
  nonModalTop: {
    display: 'flex',
    insetInlineEnd: 0,
    insetInlineStart: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 50,
    top: 0,
  },
  nonModalLeft: {
    alignItems: 'center',
    display: 'flex',
    insetBlockEnd: 0,
    insetBlockStart: 0,
    insetInlineStart: 0,
    justifyContent: 'flex-start',
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 50,
  },
  nonModalRight: {
    alignItems: 'center',
    display: 'flex',
    insetBlockEnd: 0,
    insetBlockStart: 0,
    insetInlineEnd: 0,
    justifyContent: 'flex-end',
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 50,
  },
  enterBottom: {
    transform: {
      '@starting-style': 'translateY(100%)',
      default: 'none',
    },
  },
  enterTop: {
    transform: {
      '@starting-style': 'translateY(-100%)',
      default: 'none',
    },
  },
  enterLeft: {
    transform: {
      '@starting-style': 'translateX(-100%)',
      default: 'none',
    },
  },
  enterRight: {
    transform: {
      '@starting-style': 'translateX(100%)',
      default: 'none',
    },
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
  bottomSheetPanel: {
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
    minHeight: 0,
    width: '100%',
  },
  retainedPanel: {
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

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

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
export type { SheetHeight, SheetPurpose, SheetSnapPoint } from '@/lib/sheet'

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

export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

const DIALOG_STYLE: Readonly<Record<SheetSide, StaticStyles>> = {
  top: styles.topDialog,
  right: styles.rightDialog,
  bottom: styles.bottomDialog,
  left: styles.leftDialog,
}

const OVERLAY_STYLE = overlayStyles.overlay

const CONTENT_STYLE = overlayStyles.panel

const SIDE_STYLE: Readonly<Record<SheetSide, StaticStyles>> = {
  right: styles.rightPanel,
  left: styles.leftPanel,
  top: styles.topPanel,
  bottom: styles.bottomPanel,
}

const NON_MODAL_ROOT_STYLE: Readonly<Record<SheetSide, StaticStyles>> = {
  bottom: styles.nonModalBottom,
  top: styles.nonModalTop,
  left: styles.nonModalLeft,
  right: styles.nonModalRight,
}

const ENTER_STYLE: Readonly<Record<SheetSide, StaticStyles>> = {
  bottom: styles.enterBottom,
  top: styles.enterTop,
  left: styles.enterLeft,
  right: styles.enterRight,
}

const EXIT_TRANSFORM: Readonly<Record<SheetSide, string>> = {
  bottom: 'translateY(100%)',
  top: 'translateY(-100%)',
  left: 'translateX(-100%)',
  right: 'translateX(100%)',
}

const HEADER_STYLE = overlayStyles.header
const FOOTER_STYLE = overlayStyles.footer
const TITLE_STYLE = overlayStyles.title
const DESCRIPTION_STYLE = overlayStyles.description

const CLOSE_STYLE = overlayStyles.close

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
  snapPoints: ReadonlyArray<SheetSnapPoint>,
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

/** translateY for a bottom panel: undefined when the element should rest at
    its natural position (entry/exit transforms come from the data-state
    classes); a px value while dragging or settled at a detent. */
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
  if (target.closest('[data-slot="sheet-handle"]') !== null) return 'handle'
  const body = target.closest('[data-slot="sheet-body"]')
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

const bottomPanelBody = <Msg>(
  content: ReadonlyArray<Html>,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Html> => [
  h.div(
    [
      h.DataAttribute('slot', 'sheet-handle'),
      h.AriaHidden(true),
      h.Class(className(styles.handle)),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'sheet-pill'),
          h.Class(className(styles.pill)),
        ],
        [],
      ),
    ],
  ),
  h.div(
    [h.DataAttribute('slot', 'sheet-body'), h.Class(className(styles.body))],
    [
      h.div(
        [
          h.DataAttribute('slot', 'sheet-body-content'),
          h.Class(className(styles.bodyContent)),
        ],
        [...content],
      ),
    ],
  ),
]

// ——— Shared parts

export type SheetSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>
  initialFocusAttributes: () => ReadonlyArray<ChildAttribute>
}>
export type SheetPartProps = Readonly<{
  children: ReadonlyArray<Html | string>
  layoutStyle?: ComponentLayoutStyle
}>
export type SheetTextPartProps = SheetPartProps &
  Readonly<{ attributes: ReadonlyArray<ChildAttribute> }>
export type SheetCloseProps = Readonly<{
  children?: ReadonlyArray<Html | string>
  layoutStyle?: ComponentLayoutStyle
  ariaLabel?: string
}>

export const sheetHeader = <Msg>(
  props: SheetPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sheet-header'),
      h.Class(cn(HEADER_STYLE, props.layoutStyle)),
    ],
    [...props.children],
  )
export const sheetTitle = <Msg>(
  props: SheetTextPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.h2(
    [
      ...props.attributes,
      h.DataAttribute('slot', 'sheet-title'),
      h.Class(cn(reset.text, TITLE_STYLE, props.layoutStyle)),
    ],
    [...props.children],
  )
export const sheetDescription = <Msg>(
  props: SheetTextPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.p(
    [
      ...props.attributes,
      h.DataAttribute('slot', 'sheet-description'),
      h.Class(cn(reset.text, DESCRIPTION_STYLE, props.layoutStyle)),
    ],
    [...props.children],
  )
export const sheetFooter = <Msg>(
  props: SheetPartProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'sheet-footer'),
      h.Class(cn(FOOTER_STYLE, props.layoutStyle)),
    ],
    [...props.children],
  )

export type SheetParts<Msg> = Readonly<{
  header: (props: SheetPartProps) => Html
  title: (props: Omit<SheetTextPartProps, 'attributes'>) => Html
  description: (props: Omit<SheetTextPartProps, 'attributes'>) => Html
  footer: (props: SheetPartProps) => Html
  close: (props?: SheetCloseProps) => Html
  closeButtonAttributes: ReadonlyArray<ChildAttribute>
  initialFocusAttributes: () => ReadonlyArray<ChildAttribute>
}>

export type SheetProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  /** Accessible title. Rendered as the visible header on edge sides and as a
      screen-reader label on bottom sheets whose layout composes its own
      headings — when `layout` never uses `parts.title`, an sr-only element
      carrying the Dialog title id is added automatically. */
  title: string
  description?: string
  content?: (slots: SheetSlots) => ReadonlyArray<Html>
  footer?: (slots: SheetSlots) => ReadonlyArray<Html>
  layout?: (parts: SheetParts<Msg>) => ReadonlyArray<Html>
  side?: SheetSide
  showCloseButton?: boolean
  direction?: 'ltr' | 'rtl'
  layoutStyle?: ComponentLayoutStyle
}>

type ComposedSheetBody = Readonly<{
  children: ReadonlyArray<Html>
  titleClaimed: boolean
  descriptionClaimed: boolean
}>

/** Composes the sheet's visible body: the caller's `layout` wins outright;
    otherwise header (title + description), `content`, `footer`, and the close
    button stack in order. On edge sides the close button defaults on; on
    bottom sheets (drag/scrim/Escape dismissals) it defaults off. */
const composeSheetBody = <Msg>(
  props: SheetProps<Msg>,
  side: SheetSide,
  slots: SheetSlots,
  parts: SheetParts<Msg>,
): ComposedSheetBody => {
  let titleClaimed = false
  let descriptionClaimed = false
  const wrappedParts: SheetParts<Msg> = {
    ...parts,
    title: partProps => {
      titleClaimed = true
      return parts.title(partProps)
    },
    description: partProps => {
      descriptionClaimed = true
      return parts.description(partProps)
    },
  }
  const viaLayout = props.layout?.(wrappedParts)
  const children = viaLayout ?? [
    parts.header({
      children: [
        wrappedParts.title({ children: [props.title] }),
        ...(props.description === undefined
          ? []
          : [wrappedParts.description({ children: [props.description] })]),
      ],
    }),
    ...(props.content?.(slots) ?? []),
    ...(props.footer === undefined
      ? []
      : [parts.footer({ children: props.footer(slots) })]),
    ...((props.showCloseButton ?? side !== 'bottom') ? [parts.close()] : []),
  ]
  return { children, titleClaimed, descriptionClaimed }
}

/** Screen-reader fallbacks for the Dialog's title/description ids when the
    composed body never mounted the visible parts. */
const srOnlyFallbacks = <Msg>(
  props: SheetProps<Msg>,
  model: Model,
  composed: ComposedSheetBody,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Html> => [
  ...(composed.titleClaimed
    ? []
    : [
        h.span(
          [
            h.Id(DialogPrimitive.titleId(model.dialog)),
            h.Class(className(styles.srOnly)),
          ],
          [props.title],
        ),
      ]),
  ...(props.description === undefined || composed.descriptionClaimed
    ? []
    : [
        h.span(
          [
            h.Id(DialogPrimitive.descriptionId(model.dialog)),
            h.Class(className(styles.srOnly)),
          ],
          [props.description],
        ),
      ]),
]

const buildParts = <Msg>(
  hd: HtmlBuilder<Msg>,
  renderInfo: Pick<
    DialogPrimitive.RenderInfo,
    'title' | 'description' | 'initialFocus' | 'closeButton'
  >,
  initialFocusClaimedRef: { claimed: boolean },
): SheetParts<Msg> => {
  const { title, description, initialFocus, closeButton } = renderInfo
  const initialFocusAttributes = (): ReadonlyArray<ChildAttribute> => {
    initialFocusClaimedRef.claimed = true
    return initialFocus
  }
  return {
    header: partProps => sheetHeader(partProps, hd),
    title: partProps => sheetTitle({ ...partProps, attributes: title }, hd),
    description: partProps =>
      sheetDescription({ ...partProps, attributes: description }, hd),
    footer: partProps => sheetFooter(partProps, hd),
    close: (partProps = {}) =>
      hd.button(
        [
          ...closeButton,
          ...(initialFocusClaimedRef.claimed ? [] : initialFocusAttributes()),
          hd.Type('button'),
          hd.DataAttribute('slot', 'sheet-close'),
          hd.AriaLabel(partProps.ariaLabel ?? 'Close'),
          hd.Class(cn(reset.button, CLOSE_STYLE, partProps.layoutStyle)),
        ],
        [
          ...(partProps.children ?? [
            Icon.x({ class: className(overlayStyles.icon) }, hd),
          ]),
        ],
      ),
    closeButtonAttributes: closeButton,
    initialFocusAttributes,
  }
}

const nonModalParts = <Msg>(hd: HtmlBuilder<Msg>): SheetParts<Msg> => ({
  header: partProps => sheetHeader(partProps, hd),
  title: partProps => sheetTitle({ ...partProps, attributes: [] }, hd),
  description: partProps =>
    sheetDescription({ ...partProps, attributes: [] }, hd),
  footer: partProps => sheetFooter(partProps, hd),
  close: (partProps = {}) =>
    hd.button(
      [
        hd.Type('button'),
        hd.DataAttribute('slot', 'sheet-close'),
        hd.AriaLabel(partProps.ariaLabel ?? 'Close'),
        hd.Class(cn(reset.button, CLOSE_STYLE, partProps.layoutStyle)),
      ],
      [
        ...(partProps.children ?? [
          Icon.x({ class: className(overlayStyles.icon) }, hd),
        ]),
      ],
    ),
  closeButtonAttributes: [],
  initialFocusAttributes: () => [],
})

const EMPTY_SLOTS: SheetSlots = {
  closeButton: [],
  initialFocusAttributes: () => [],
}

export const sheet = <Msg>(
  props: SheetProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const side = props.side ?? 'right'
  const model = props.model
  const send = props.toParentMessage
  const g = model.gesture

  if (side === 'bottom') {
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
      const composed = composeSheetBody(
        props,
        side,
        EMPTY_SLOTS,
        nonModalParts(h),
      )
      return h.div(
        [
          h.DataAttribute('slot', 'sheet-root'),
          h.Role('dialog'),
          h.AriaModal(false),
          h.AriaLabel(props.title),
          h.Class(className(NON_MODAL_ROOT_STYLE[side], props.layoutStyle)),
        ],
        model.dialog.isOpen || model.isExiting
          ? [
              h.div(
                [
                  h.DataAttribute('slot', 'sheet-panel'),
                  h.DataAttribute('sheet-purpose', model.purpose),
                  h.OnMount(
                    Mount.mapMessage(SheetBehavior.ObserveSheet(), message =>
                      send(message),
                    ),
                  ),
                  h.Style(panelStyle(g, model.height, false, model.isExiting)),
                  h.Class(className(styles.bottomSheetPanel)),
                  dragStartAttribute(dispatch, h),
                  ...dragTrackingAttributes(dispatch, detents, swiping, h),
                  ...(props.direction === 'rtl' ? [h.Dir('rtl')] : []),
                ],
                [
                  ...srOnlyFallbacks(props, model, composed, h),
                  ...bottomPanelBody(composed.children, h),
                ],
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
          title,
          description,
          initialFocus,
          closeButton,
          isVisible,
        }: DialogPrimitive.RenderInfo) => {
          const hd = h
          const leaving =
            model.dialog.animation.transitionState === 'LeaveStart' ||
            model.dialog.animation.transitionState === 'LeaveAnimating'
          const focusRef = { claimed: false }
          const parts = buildParts(
            hd,
            { title, description, initialFocus, closeButton },
            focusRef,
          )
          const slots: SheetSlots = {
            closeButton,
            initialFocusAttributes: parts.initialFocusAttributes,
          }
          const composed = composeSheetBody(props, side, slots, parts)
          return hd.dialog(
            [
              ...dialogAttributes,
              hd.DataAttribute('slot', 'sheet'),
              hd.Class(
                className(
                  overlayStyles.dialog,
                  styles.bottomSheetDialog,
                  props.layoutStyle,
                ),
              ),
              ...(model.purpose === 'required' ? [hd.Role('alertdialog')] : []),
              ...dragTrackingAttributes(dispatch, detents, swiping, hd),
            ],
            isVisible
              ? [
                  ...srOnlyFallbacks(props, model, composed, hd),
                  hd.div(
                    [
                      ...(model.purpose === 'info' ? backdrop : []),
                      hd.DataAttribute('slot', 'sheet-scrim'),
                      hd.Class(className(styles.scrim)),
                      hd.Style({ opacity: String(leaving ? 0 : scrimOpacity) }),
                    ],
                    [],
                  ),
                  hd.div(
                    [
                      hd.DataAttribute('slot', 'sheet-positioner'),
                      hd.Class(className(styles.positioner)),
                    ],
                    [
                      hd.div(
                        [
                          ...panelAttributes,
                          ...(focusRef.claimed
                            ? []
                            : [
                                ...initialFocus,
                                hd.Attribute('tabindex', '-1'),
                              ]),
                          hd.DataAttribute('slot', 'sheet-panel'),
                          hd.DataAttribute('sheet-purpose', model.purpose),
                          hd.OnMount(
                            Mount.mapMessage(
                              SheetBehavior.ObserveSheet(),
                              message => send(message),
                            ),
                          ),
                          hd.Style(panelStyle(g, model.height, leaving, false)),
                          hd.Class(className(styles.bottomSheetPanel)),
                          dragStartAttribute(dispatch, hd),
                          ...(props.direction === 'rtl' ? [hd.Dir('rtl')] : []),
                        ],
                        bottomPanelBody(composed.children, hd),
                      ),
                    ],
                  ),
                ]
              : [],
          )
        },
      },
      toParentMessage: message =>
        send(Message.GotSheetDialogMessage({ message })),
    })
  }

  if (!model.hasScrim) {
    return h.div(
      [
        h.DataAttribute('slot', 'sheet-root'),
        h.Role('dialog'),
        h.AriaModal(false),
        h.AriaLabel(props.title),
        h.Class(className(NON_MODAL_ROOT_STYLE[side], props.layoutStyle)),
      ],
      model.dialog.isOpen || model.isExiting
        ? [
            h.div(
              [
                h.DataAttribute('slot', 'sheet-panel'),
                h.Class(cn(CONTENT_STYLE, SIDE_STYLE[side], ENTER_STYLE[side])),
                h.Style(
                  model.isExiting ? { transform: EXIT_TRANSFORM[side] } : {},
                ),
                ...(props.direction === 'rtl' ? [h.Dir('rtl')] : []),
              ],
              (() => {
                const composed = composeSheetBody(
                  props,
                  side,
                  EMPTY_SLOTS,
                  nonModalParts(h),
                )
                return [
                  ...srOnlyFallbacks(props, model, composed, h),
                  ...composed.children,
                ]
              })(),
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
        panel,
        title,
        description,
        initialFocus,
        closeButton,
        isVisible,
      }: DialogPrimitive.RenderInfo) => {
        const hd = h
        const focusRef = { claimed: false }
        const parts = buildParts(
          hd,
          { title, description, initialFocus, closeButton },
          focusRef,
        )
        const slots: SheetSlots = {
          closeButton,
          initialFocusAttributes: parts.initialFocusAttributes,
        }
        const composed = composeSheetBody(props, side, slots, parts)
        const panelFocusAttributes = focusRef.claimed
          ? []
          : [...initialFocus, hd.Attribute('tabindex', '-1')]

        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'sheet'),
            hd.Class(className(overlayStyles.dialog, DIALOG_STYLE[side])),
            ...(model.purpose === 'required' ? [hd.Role('alertdialog')] : []),
          ],
          isVisible
            ? [
                ...srOnlyFallbacks(props, model, composed, hd),
                hd.div(
                  [
                    ...(model.purpose === 'info' ? backdrop : []),
                    hd.DataAttribute('slot', 'sheet-overlay'),
                    hd.Class(className(OVERLAY_STYLE)),
                  ],
                  [],
                ),
                hd.div(
                  [
                    ...panel,
                    ...panelFocusAttributes,
                    hd.DataAttribute('slot', 'sheet-content'),
                    ...(props.direction === 'rtl' ? [hd.Dir('rtl')] : []),
                    hd.Class(
                      cn(CONTENT_STYLE, SIDE_STYLE[side], props.layoutStyle),
                    ),
                  ],
                  [...composed.children],
                ),
              ]
            : [],
        )
      },
    },
    toParentMessage: message =>
      send(Message.GotSheetDialogMessage({ message })),
  })
}

// ——— Switcher (one shared dialog, multiple bottom sheets)

export type SwitcherSheetContent = Readonly<{
  id: string
  content: Html
}>

export type SheetSwitcherProps<Msg> = Readonly<{
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

/** One shared dialog hosting several bottom sheets; requesting a sheet slides
    it in over the currently mounted one, which is retained covered and then
    fades (astryx BottomSheetSwitcher). */
export const sheetSwitcher = <Msg>(
  props: SheetSwitcherProps<Msg>,
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
          const sheetState = model.sheets[spec.id]
          if (sheetState === undefined) return undefined
          return hd.keyed('div')(
            `sheet-${spec.id}-${hidden ? 'retained' : 'active'}`,
            [
              ...(hidden ? [] : panelAttributes),
              hd.DataAttribute('slot', 'sheet-panel'),
              hd.DataAttribute('sheet-id', spec.id),
              hd.DataAttribute('sheet-purpose', sheetState.purpose),
              hd.OnMount(
                Mount.mapMessage(
                  SheetBehavior.ObserveSwitcherSheet({ sheetId: spec.id }),
                  message => send(message),
                ),
              ),
              hd.Style(
                panelStyle(
                  sheetState.gesture,
                  sheetState.height,
                  leaving,
                  false,
                ),
              ),
              hd.Class(
                cn(styles.bottomSheetPanel, hidden ? styles.retainedPanel : ''),
              ),
              ...(hidden ? [hd.Inert(true), hd.AriaHidden(true)] : []),
              dragStartAttribute(dispatch, hd),
            ],
            bottomPanelBody([spec.content], hd),
          )
        }

        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'sheet-switcher'),
            hd.Class(
              className(
                overlayStyles.dialog,
                styles.bottomSheetDialog,
                props.layoutStyle,
              ),
            ),
            ...dragTrackingAttributes(dispatch, activeDetents, swiping, hd),
          ],
          isVisible && activeSheet !== undefined
            ? [
                hd.div(
                  [
                    ...(activeSheet.purpose === 'info' ? backdrop : []),
                    hd.DataAttribute('slot', 'sheet-switcher-scrim'),
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
                    hd.DataAttribute('slot', 'sheet-switcher-positioner'),
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
