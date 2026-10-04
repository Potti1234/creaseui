import type { Update } from 'foldkit'
import {
  Array as A,
  Duration,
  Effect,
  Option,
  Queue,
  Result,
  Schema as S,
  Stream,
} from 'effect'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import { Dialog } from '@foldkit/ui'

/* Renderer-neutral state + pure geometry for the BottomSheet port of Meta
   Astryx's BottomSheet: detent offsets, magnetic drags, flick/overshoot
   dismissal, scrim opacity coupling, and a shared-dialog sheet switcher. */

// ——— Geometry (ported from astryx packages/core/src/BottomSheet/snapOffsets.ts)

export type BottomSheetSnapPoint = number | string
export const SnapPoint = S.Union([S.Number, S.String])

/** Detents whose resting offsets land within this many px of each other are
    treated as the same stop (the taller one wins). */
export const DETENT_DEDUP_PX = 48
/** Largest share of the fully open sheet the shortest stop may fill and still
    be a peek. Above it the stop is a working surface. */
export const PEEK_MAX_HEIGHT_RATIO = 0.25
/** Minimum scrim opacity at the peek detent. */
export const MIN_PEEK_SCRIM_OPACITY = 0.3
/** Reserved bottom padding the overscroll lift reveals (px). */
export const OVERSCROLL_PADDING = 48
/** A flick (fast throw) dismisses down / expands up regardless of landing. */
export const FLICK_VELOCITY = 1.2 // px/ms
export const FLICK_MIN_DISTANCE = 48 // px traveled during the gesture
/** On a slow drag below the shortest detent, dismiss once dragged past it by
    more than this fraction of that detent's visible height. */
export const DISMISS_OVERSHOOT_RATIO = 0.4
/** Within this many px of a detent the live drag eases toward it. */
export const MAGNET_RANGE = 40
/** How far a finger on the body must travel down before the pull becomes a
    sheet drag rather than a tap. */
export const DRAG_PROMOTION_SLOP = 8
/** Rubber-band factor for dragging up past fully-open, capped at OVERSCROLL. */
export const OVERSCROLL_RESISTANCE = 0.35
export const OVERSCROLL_MAX = 48

export const SheetPurpose = S.Literals(['required', 'form', 'info'])
export type SheetPurpose = typeof SheetPurpose.Type
export const SheetHeight = S.Union([
  S.Literals(['hug', 'capped', 'tall']),
  S.Number,
  S.String,
])
export type SheetHeight = typeof SheetHeight.Type

/** Named height budgets as viewport fractions (astryx HEIGHT_BUDGETS). */
export const HEIGHT_BUDGETS: Readonly<
  Record<'hug' | 'capped' | 'tall', number>
> = {
  hug: 0.92,
  capped: 0.62,
  tall: 0.92,
}

const SNAP_POINT_PATTERN = /^(\d+(?:\.\d+)?|\.\d+)(px|%)$/i

const parseSnapPoint = (
  point: BottomSheetSnapPoint,
  viewportPx: number,
): number | null => {
  if (typeof point === 'number') {
    return Number.isFinite(point) && point > 0 && point <= 1
      ? point * viewportPx
      : null
  }
  const match = SNAP_POINT_PATTERN.exec(point.trim())
  if (match === null) return null
  const numeric = match[1]
  const unit = match[2]
  if (numeric === undefined || unit === undefined) return null
  const value = Number.parseFloat(numeric)
  if (!(value > 0)) return null
  return unit.toLowerCase() === '%' ? (value / 100) * viewportPx : value
}

export const isValidSnapPoint = (point: BottomSheetSnapPoint): boolean =>
  parseSnapPoint(point, 1) !== null

export const resolveSnapPoints = (
  points: ReadonlyArray<BottomSheetSnapPoint>,
  viewportPx: number,
): number[] =>
  A.filterMap(points, point => {
    const resolved = parseSnapPoint(point, viewportPx)
    return resolved === null ? Result.failVoid : Result.succeed(resolved)
  })

/** Resting offsets from fully-open (0 = open, larger = more collapsed),
    ascending and de-duplicated. 0 is always the first detent. */
export const computeDetentOffsets = (
  sheetHeight: number,
  detentHeights: ReadonlyArray<number>,
  dedupPx: number = DETENT_DEDUP_PX,
): number[] => {
  const collapsed = detentHeights
    .filter(h => h > 0 && h < sheetHeight)
    .map(h => sheetHeight - h)
  const ascending = [0, ...collapsed].sort((a, b) => a - b)
  const deduped: number[] = []
  for (const offset of ascending) {
    const last = deduped[deduped.length - 1]
    if (last === undefined || offset - last >= dedupPx) {
      deduped.push(offset)
    }
  }
  return deduped
}

export const nearestOffset = (
  value: number,
  offsets: ReadonlyArray<number>,
): number =>
  offsets.reduce<number>(
    (best, o) => (Math.abs(o - value) < Math.abs(best - value) ? o : best),
    offsets[0] ?? 0,
  )

/** The peek detent's offset, or null when this sheet has no peek: a peek is
    the shortest stop AND a sliver — at most PEEK_MAX_HEIGHT_RATIO of the
    fully open sheet. */
export const peekOffsetFor = (
  offsets: ReadonlyArray<number>,
  visibleSheetHeight: number,
): number | null => {
  if (offsets.length < 2 || visibleSheetHeight <= 0) return null
  const shortest = offsets.at(-1)
  if (shortest === undefined) return null
  const heightAtShortest = visibleSheetHeight - shortest
  return heightAtShortest <= PEEK_MAX_HEIGHT_RATIO * visibleSheetHeight
    ? shortest
    : null
}

/** Scrim opacity (1 = fully visible) for a drag/settle offset. Full down to
    the last working stop, thinning onto a peek (floor MIN_PEEK_SCRIM_OPACITY)
    or out through the dismiss overshoot. */
export const scrimOpacityForOffset = (
  offset: number,
  offsets: ReadonlyArray<number>,
  dismissOffset: number,
  peekOffset: number | null,
): number => {
  const hasPeek = peekOffset !== null
  const fadeStart = hasPeek ? offsets.at(-2) : offsets.at(-1)
  if (fadeStart === undefined) return 1
  const fadeEnd = hasPeek ? peekOffset : dismissOffset
  const floor = hasPeek ? MIN_PEEK_SCRIM_OPACITY : 0
  if (offset <= fadeStart) return 1
  if (offset >= fadeEnd) return floor
  return 1 - (1 - floor) * ((offset - fadeStart) / (fadeEnd - fadeStart))
}

/** Settle target for a released drag, restricted to the drag direction so a
    committed drag never snaps back past where it started.
    dir: 1 = down, -1 = up, 0 = neither. */
export const resolveSettleOffset = (
  value: number,
  offsets: ReadonlyArray<number>,
  dir: number,
  baseOffset: number,
): number => {
  let candidates = offsets
  if (dir > 0) {
    const downward = offsets.filter(o => o >= baseOffset)
    if (downward.length > 0) candidates = downward
  } else if (dir < 0) {
    const upward = offsets.filter(o => o <= baseOffset)
    if (upward.length > 0) candidates = upward
  }
  return nearestOffset(value, candidates)
}

/** Pull a value toward the nearest target when within MAGNET_RANGE, easing the
    last stretch so the surface clicks into place while dragging. */
export const magnetize = (
  value: number,
  targets: ReadonlyArray<number>,
): number => {
  if (targets.length === 0) return value
  let nearestTarget = targets[0] ?? 0
  let nearestDist = Math.abs(value - nearestTarget)
  for (const t of targets) {
    const d = Math.abs(value - t)
    if (d < nearestDist) {
      nearestDist = d
      nearestTarget = t
    }
  }
  if (nearestDist >= MAGNET_RANGE) return value
  const t = nearestDist / MAGNET_RANGE
  const pull = 1 - t * t
  return value + (nearestTarget - value) * pull
}

/** Visible sheet height for an offset: the panel's measured height already
    includes the OVERSCROLL_PADDING that hangs below the viewport edge. */
export const visibleHeightForOffset = (
  sheetHeight: number,
  offset: number,
): number => Math.max(0, sheetHeight - OVERSCROLL_PADDING - offset)

/** How much of a detent offset is expressed as reduced layout height vs a
    transform slide: peeks keep full layout and slide below the viewport. */
export const layoutOffsetFor = (
  offset: number,
  peekOffset: number | null,
): number => (peekOffset !== null && offset === peekOffset ? 0 : offset)

// ——— Gesture state machine

export const DragPhase = S.Literals(['Idle', 'Arming', 'Dragging'])
export type DragPhase = typeof DragPhase.Type

export const GestureState = S.Struct({
  dragPhase: DragPhase,
  dragStartY: S.Option(S.Number),
  dragBaseOffset: S.Number,
  dragOffset: S.Number,
  dragLift: S.Number,
  dragVelocity: S.Number,
  lastOffset: S.Number,
  lastTimeStamp: S.Number,
  settledOffset: S.Number,
  settledLayoutOffset: S.Number,
  sheetHeight: S.Number,
})
export type GestureState = typeof GestureState.Type

export const initGesture = (): GestureState => ({
  dragPhase: 'Idle',
  dragStartY: Option.none(),
  dragBaseOffset: 0,
  dragOffset: 0,
  dragLift: 0,
  dragVelocity: 0,
  lastOffset: 0,
  lastTimeStamp: 0,
  settledOffset: 0,
  settledLayoutOffset: 0,
  sheetHeight: 0,
})

export type DragFrame = Readonly<{
  y: number
  timeStamp: number
}>

/** A drag begins on the handle immediately; on the body it first arms and
    promotes only after DRAG_PROMOTION_SLOP of downward travel. */
export const startDrag = (
  gesture: GestureState,
  frame: DragFrame,
  armOnly: boolean,
): GestureState => ({
  ...gesture,
  dragPhase: armOnly ? 'Arming' : 'Dragging',
  dragStartY: Option.some(frame.y),
  dragBaseOffset: gesture.settledOffset,
  dragVelocity: 0,
  lastOffset: gesture.settledOffset,
  lastTimeStamp: frame.timeStamp,
  dragOffset: gesture.settledOffset,
})

/** Live drag frame. In the dismiss overshoot zone the raw offset wins so the
    drag-to-close never fights the magnet. */
export const applyDrag = (
  gesture: GestureState,
  frame: DragFrame,
  detents: ReadonlyArray<number>,
): GestureState => {
  if (gesture.dragPhase === 'Idle') return gesture
  const startY = Option.getOrElse(gesture.dragStartY, () => frame.y)
  const delta = frame.y - startY
  if (gesture.dragPhase === 'Arming') {
    if (delta > DRAG_PROMOTION_SLOP) {
      return {
        ...gesture,
        dragPhase: 'Dragging',
        dragStartY: Option.some(startY),
        lastTimeStamp: frame.timeStamp,
      }
    }
    if (delta < -DRAG_PROMOTION_SLOP) {
      return { ...gesture, dragPhase: 'Idle', dragStartY: Option.none() }
    }
    return gesture
  }
  const raw = gesture.dragBaseOffset + delta
  if (raw < 0) {
    const lift = Math.min(OVERSCROLL_MAX, -raw * OVERSCROLL_RESISTANCE)
    return {
      ...gesture,
      dragOffset: 0,
      dragLift: lift,
      dragVelocity: 0,
      lastOffset: 0,
      lastTimeStamp: frame.timeStamp,
    }
  }
  const maxOffset = detents[detents.length - 1] ?? 0
  const shortestVisible = visibleHeightForOffset(gesture.sheetHeight, maxOffset)
  const dismissBoundary = maxOffset + shortestVisible * DISMISS_OVERSHOOT_RATIO
  const offset = raw > dismissBoundary ? raw : magnetize(raw, detents)
  const elapsed = Math.max(1, frame.timeStamp - gesture.lastTimeStamp)
  return {
    ...gesture,
    dragOffset: offset,
    dragLift: 0,
    dragVelocity: (offset - gesture.lastOffset) / elapsed,
    lastOffset: offset,
    lastTimeStamp: frame.timeStamp,
  }
}

export type SettleResult = Readonly<{
  gesture: GestureState
  dismiss: boolean
}>

/** Release the drag: flick down dismisses (when allowed), flick up expands to
    fully open, an overshoot past the last detent dismisses, otherwise the
    sheet settles to the nearest direction-restricted detent. */
export const settleDrag = (
  gesture: GestureState,
  frame: DragFrame,
  detents: ReadonlyArray<number>,
  canDismiss: boolean,
  peekOffset: number | null,
): SettleResult => {
  if (gesture.dragPhase === 'Idle') return { gesture, dismiss: false }
  const startY = Option.getOrElse(gesture.dragStartY, () => frame.y)
  const delta = frame.y - startY
  const travel = Math.abs(delta)
  const dir = delta === 0 ? 0 : delta > 0 ? 1 : -1
  const velocity = gesture.dragVelocity
  const offset = gesture.dragOffset
  const maxOffset = detents[detents.length - 1] ?? 0
  const shortestVisible = visibleHeightForOffset(gesture.sheetHeight, maxOffset)
  const dismissOffset = maxOffset + shortestVisible * DISMISS_OVERSHOOT_RATIO

  const at = (target: number): SettleResult => ({
    gesture: {
      ...initGesture(),
      sheetHeight: gesture.sheetHeight,
      settledOffset: target,
      settledLayoutOffset: layoutOffsetFor(target, peekOffset),
    },
    dismiss: false,
  })
  const dismiss = (): SettleResult => ({
    gesture: { ...initGesture(), sheetHeight: gesture.sheetHeight },
    dismiss: true,
  })
  if (gesture.dragPhase === 'Arming') {
    return {
      gesture: { ...initGesture(), sheetHeight: gesture.sheetHeight },
      dismiss: false,
    }
  }
  const isFlick =
    Math.abs(velocity) > FLICK_VELOCITY && travel > FLICK_MIN_DISTANCE
  if (dir > 0 && isFlick) {
    return canDismiss ? dismiss() : at(maxOffset)
  }
  if (dir < 0 && isFlick) {
    return at(0)
  }
  if (offset > dismissOffset) {
    return canDismiss ? dismiss() : at(maxOffset)
  }
  return at(resolveSettleOffset(offset, detents, dir, gesture.dragBaseOffset))
}

export const cancelDrag = (
  gesture: GestureState,
  detents: ReadonlyArray<number>,
  peekOffset: number | null,
): GestureState => ({
  ...initGesture(),
  sheetHeight: gesture.sheetHeight,
  settledOffset: resolveSettleOffset(
    gesture.dragOffset,
    detents,
    0,
    gesture.dragBaseOffset,
  ),
  settledLayoutOffset: layoutOffsetFor(
    resolveSettleOffset(gesture.dragOffset, detents, 0, gesture.dragBaseOffset),
    peekOffset,
  ),
})

// ——— Standalone sheet

export const Model = S.Struct({
  dialog: Dialog.Model,
  purpose: SheetPurpose,
  hasScrim: S.Boolean,
  height: SheetHeight,
  snapPoints: S.Array(SnapPoint),
  gesture: GestureState,
  isExiting: S.Boolean,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  GotBottomSheetDialogMessage: { message: Dialog.Message },
  RequestedSheetDismiss: {},
  StartedSheetDrag: { y: S.Number, timeStamp: S.Number, armOnly: S.Boolean },
  DraggedSheet: {
    y: S.Number,
    timeStamp: S.Number,
    detents: S.Array(S.Number),
  },
  EndedSheetDrag: {
    y: S.Number,
    timeStamp: S.Number,
    detents: S.Array(S.Number),
  },
  CancelledSheetDrag: { detents: S.Array(S.Number) },
  MeasuredSheet: { height: S.Number },
  CompletedSheetExit: {},
})
export type Message = typeof Message.Type
export const OutMessage = Dialog.OutMessage
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Dialog.InitConfig &
  Readonly<{
    purpose?: SheetPurpose
    hasScrim?: boolean
    height?: SheetHeight
    snapPoints?: ReadonlyArray<BottomSheetSnapPoint>
  }>

export const init = (config: InitConfig): Model => ({
  dialog: Dialog.init(config),
  purpose: config.purpose ?? 'info',
  hasScrim: config.hasScrim ?? true,
  height: config.height ?? 'capped',
  snapPoints: [...(config.snapPoints ?? [])],
  gesture: initGesture(),
  isExiting: false,
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const mapDialogResult = (
  model: Model,
  result: ReturnType<typeof Dialog.update>,
): UpdateReturn => {
  const { model: dialog, commands: dialogCommands, outMessage } = result
  const commands = dialogCommands ?? []
  return {
    model: { ...model, dialog },
    commands: Command.mapMessages(commands, message =>
      Message['GotBottomSheetDialogMessage']({ message }),
    ),
    ...(outMessage === undefined ? {} : { outMessage }),
  }
}

const ExitSheet = Command.define('BottomSheetExit', {
  messages: [Message.CompletedSheetExit],
  execute: Effect.as(
    Effect.sleep(Duration.millis(320)),
    Message.CompletedSheetExit(),
  ),
})

const canSwipeDismiss = (model: Model): boolean => model.purpose === 'info'

const requestClose = (model: Model): UpdateReturn => {
  if (model.purpose === 'required') return { model }
  if (model.hasScrim) {
    return mapDialogResult(model, Dialog.close(model.dialog))
  }
  if (model.isExiting || !model.dialog.isOpen) return { model }
  return {
    model: { ...model, isExiting: true },
    commands: [ExitSheet()],
  }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotBottomSheetDialogMessage': {
      if (
        model.purpose === 'required' &&
        message.message._tag === 'RequestedClose'
      ) {
        return { model }
      }
      return mapDialogResult(
        model,
        Dialog.update(model.dialog, message.message),
      )
    }
    case 'RequestedSheetDismiss':
      return requestClose(model)
    case 'StartedSheetDrag':
      if (!model.dialog.isOpen) return { model }
      return {
        model: {
          ...model,
          gesture: startDrag(model.gesture, message, message.armOnly),
        },
      }
    case 'DraggedSheet':
      return {
        model: {
          ...model,
          gesture: applyDrag(model.gesture, message, message.detents),
        },
      }
    case 'CancelledSheetDrag': {
      const peek = peekOffsetFor(message.detents, model.gesture.sheetHeight)
      return {
        model: {
          ...model,
          gesture: cancelDrag(model.gesture, message.detents, peek),
        },
      }
    }
    case 'EndedSheetDrag': {
      const peek = peekOffsetFor(message.detents, model.gesture.sheetHeight)
      const result = settleDrag(
        model.gesture,
        message,
        message.detents,
        canSwipeDismiss(model),
        peek,
      )
      if (result.dismiss) {
        return requestClose({ ...model, gesture: result.gesture })
      }
      return { model: { ...model, gesture: result.gesture } }
    }
    case 'MeasuredSheet':
      return {
        model: {
          ...model,
          gesture: { ...model.gesture, sheetHeight: message.height },
        },
      }
    case 'CompletedSheetExit':
      return {
        model: {
          ...model,
          isExiting: false,
          dialog: { ...model.dialog, isOpen: false },
        },
      }
  }
}

export const open = (model: Model): UpdateReturn => {
  const rested = {
    ...model,
    isExiting: false,
    gesture: { ...initGesture(), sheetHeight: model.gesture.sheetHeight },
  }
  if (!model.hasScrim) {
    return { model: { ...rested, dialog: { ...rested.dialog, isOpen: true } } }
  }
  return mapDialogResult(rested, Dialog.open(model.dialog))
}

export const close = (model: Model): UpdateReturn => requestClose(model)

// ——— Switcher (one shared dialog, multiple sheets)

export const SheetState = S.Struct({
  id: S.String,
  label: S.String,
  purpose: SheetPurpose,
  height: SheetHeight,
  snapPoints: S.Array(SnapPoint),
  gesture: GestureState,
})
export type SheetState = typeof SheetState.Type

export const SwitcherModel = S.Struct({
  dialog: Dialog.Model,
  hasScrim: S.Boolean,
  sheets: S.Record(S.String, SheetState),
  activeSheetId: S.Option(S.String),
  previousSheetId: S.Option(S.String),
})
export type SwitcherModel = typeof SwitcherModel.Type

export const SwitcherMessage = defineMessageUnion({
  GotSwitcherDialogMessage: { message: Dialog.Message },
  RequestedSheet: { sheetId: S.String },
  RequestedSwitcherDismiss: {},
  StartedSheetDrag: { y: S.Number, timeStamp: S.Number, armOnly: S.Boolean },
  DraggedSheet: {
    y: S.Number,
    timeStamp: S.Number,
    detents: S.Array(S.Number),
  },
  EndedSheetDrag: {
    y: S.Number,
    timeStamp: S.Number,
    detents: S.Array(S.Number),
  },
  CancelledSheetDrag: { detents: S.Array(S.Number) },
  MeasuredSheet: { sheetId: S.String, height: S.Number },
})
export type SwitcherMessage = typeof SwitcherMessage.Type
export const SwitcherOutMessage = Dialog.OutMessage
export type SwitcherOutMessage = typeof SwitcherOutMessage.Type

export type SwitcherInitConfig = Dialog.InitConfig &
  Readonly<{
    hasScrim?: boolean
    sheets: ReadonlyArray<
      Readonly<{
        id: string
        label: string
        purpose?: SheetPurpose
        height?: SheetHeight
        snapPoints?: ReadonlyArray<BottomSheetSnapPoint>
      }>
    >
  }>

export const initSwitcher = (config: SwitcherInitConfig): SwitcherModel => ({
  dialog: Dialog.init(config),
  hasScrim: config.hasScrim ?? true,
  sheets: Object.fromEntries(
    config.sheets.map(sheet => [
      sheet.id,
      {
        id: sheet.id,
        label: sheet.label,
        purpose: sheet.purpose ?? 'info',
        height: sheet.height ?? 'capped',
        snapPoints: [...(sheet.snapPoints ?? [])],
        gesture: initGesture(),
      },
    ]),
  ),
  activeSheetId: Option.none(),
  previousSheetId: Option.none(),
})

type SwitcherUpdateReturn = Update.ReturnWithOutMessage<
  SwitcherModel,
  SwitcherMessage,
  SwitcherOutMessage
>

const mapSwitcherDialog = (
  model: SwitcherModel,
  result: ReturnType<typeof Dialog.update>,
): SwitcherUpdateReturn => {
  const { model: dialog, commands: dialogCommands, outMessage } = result
  const commands = dialogCommands ?? []
  return {
    model: { ...model, dialog },
    commands: Command.mapMessages(commands, message =>
      SwitcherMessage['GotSwitcherDialogMessage']({ message }),
    ),
    ...(outMessage === undefined ? {} : { outMessage }),
  }
}

const updateActiveGesture = (
  model: SwitcherModel,
  next: (sheet: SheetState) => GestureState,
): SwitcherModel => {
  const activeId = Option.getOrUndefined(model.activeSheetId)
  const sheet = activeId === undefined ? undefined : model.sheets[activeId]
  if (activeId === undefined || sheet === undefined) return model
  return {
    ...model,
    sheets: {
      ...model.sheets,
      [activeId]: { ...sheet, gesture: next(sheet) },
    },
  }
}

export const updateSwitcher = (
  model: SwitcherModel,
  message: SwitcherMessage,
): SwitcherUpdateReturn => {
  const activeId = Option.getOrUndefined(model.activeSheetId)
  const activeSheet =
    activeId === undefined ? undefined : model.sheets[activeId]
  switch (message._tag) {
    case 'GotSwitcherDialogMessage': {
      if (
        activeSheet !== undefined &&
        activeSheet.purpose === 'required' &&
        message.message._tag === 'RequestedClose'
      ) {
        return { model }
      }
      const result = Dialog.update(model.dialog, message.message)
      if (message.message._tag === 'RequestedClose') {
        // Dismiss: collapse the active sheet first so it slides out with the dialog.
        const withDrop = updateActiveGesture(model, sheet => ({
          ...initGesture(),
          sheetHeight: sheet.gesture.sheetHeight,
          settledOffset: sheet.gesture.sheetHeight,
          settledLayoutOffset: 0,
        }))
        return mapSwitcherDialog(withDrop, result)
      }
      return mapSwitcherDialog(model, result)
    }
    case 'RequestedSheet': {
      const target = model.sheets[message.sheetId]
      if (target === undefined) return { model }
      if (
        model.activeSheetId._tag === 'Some' &&
        model.activeSheetId.value === message.sheetId
      ) {
        return { model }
      }
      const previousId = Option.getOrUndefined(model.activeSheetId)
      const nextModel: SwitcherModel = {
        ...model,
        previousSheetId: Option.fromNullishOr(previousId),
        activeSheetId: Option.some(message.sheetId),
        sheets: Object.fromEntries(
          Object.entries(model.sheets).map(([id, sheet]) => [
            id,
            {
              ...sheet,
              gesture: {
                ...sheet.gesture,
                dragPhase: 'Idle',
                dragStartY: Option.none(),
              },
            },
          ]),
        ),
      }
      if (!model.dialog.isOpen) {
        return mapSwitcherDialog(nextModel, Dialog.open(model.dialog))
      }
      return { model: nextModel }
    }
    case 'RequestedSwitcherDismiss': {
      if (activeSheet !== undefined && activeSheet.purpose === 'required') {
        return { model }
      }
      const withDrop = updateActiveGesture(model, sheet => ({
        ...initGesture(),
        sheetHeight: sheet.gesture.sheetHeight,
        settledOffset: sheet.gesture.sheetHeight,
        settledLayoutOffset: 0,
      }))
      return mapSwitcherDialog(withDrop, Dialog.close(model.dialog))
    }
    case 'StartedSheetDrag':
      return {
        model: updateActiveGesture(model, sheet =>
          startDrag(sheet.gesture, message, message.armOnly),
        ),
      }
    case 'DraggedSheet':
      return {
        model: updateActiveGesture(model, sheet =>
          applyDrag(sheet.gesture, message, message.detents),
        ),
      }
    case 'CancelledSheetDrag': {
      if (activeSheet === undefined) return { model }
      const peek = peekOffsetFor(
        message.detents,
        activeSheet.gesture.sheetHeight,
      )
      return {
        model: updateActiveGesture(model, s =>
          cancelDrag(s.gesture, message.detents, peek),
        ),
      }
    }
    case 'EndedSheetDrag': {
      if (activeSheet === undefined) return { model }
      const peek = peekOffsetFor(
        message.detents,
        activeSheet.gesture.sheetHeight,
      )
      const result = settleDrag(
        activeSheet.gesture,
        message,
        message.detents,
        activeSheet.purpose === 'info',
        peek,
      )
      const nextModel = updateActiveGesture(model, () => result.gesture)
      if (result.dismiss) {
        return mapSwitcherDialog(nextModel, Dialog.close(nextModel.dialog))
      }
      return { model: nextModel }
    }
    case 'MeasuredSheet': {
      const sheet = model.sheets[message.sheetId]
      if (sheet === undefined) return { model }
      return {
        model: {
          ...model,
          sheets: {
            ...model.sheets,
            [message.sheetId]: {
              ...sheet,
              gesture: { ...sheet.gesture, sheetHeight: message.height },
            },
          },
        },
      }
    }
  }
}

export const openSheet = (
  model: SwitcherModel,
  sheetId: string,
): SwitcherUpdateReturn =>
  updateSwitcher(model, SwitcherMessage.RequestedSheet({ sheetId }))

export const closeSwitcher = (model: SwitcherModel): SwitcherUpdateReturn =>
  updateSwitcher(model, SwitcherMessage.RequestedSwitcherDismiss())

/** Observes a panel's rendered height (the measured box includes the
    OVERSCROLL_PADDING that hangs below the viewport edge). */
export const ObserveSheet = Mount.defineStream('ObserveBottomSheetPanel', {
  messages: [Message.MeasuredSheet],
  execute: ({ element }) =>
    Stream.callback<typeof Message.MeasuredSheet.Type>(queue =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            if (!(element instanceof HTMLElement)) return undefined
            const emit = () =>
              Queue.offerUnsafe(
                queue,
                Message.MeasuredSheet({ height: element.offsetHeight }),
              )
            const resize = new ResizeObserver(emit)
            resize.observe(element)
            emit()
            return resize
          }),
          resize => Effect.sync(() => resize?.disconnect()),
        )
        return yield* Effect.never
      }),
    ),
})

export const ObserveSwitcherSheet = Mount.defineStream(
  'ObserveBottomSheetSwitcherPanel',
  {
    args: { sheetId: S.String },
    messages: [SwitcherMessage.MeasuredSheet],
    execute: ({ element, sheetId }) =>
      Stream.callback<typeof SwitcherMessage.MeasuredSheet.Type>(queue =>
        Effect.gen(function* () {
          yield* Effect.acquireRelease(
            Effect.sync(() => {
              if (!(element instanceof HTMLElement)) return undefined
              const emit = () =>
                Queue.offerUnsafe(
                  queue,
                  SwitcherMessage.MeasuredSheet({
                    sheetId,
                    height: element.offsetHeight,
                  }),
                )
              const resize = new ResizeObserver(emit)
              resize.observe(element)
              emit()
              return resize
            }),
            resize => Effect.sync(() => resize?.disconnect()),
          )
          return yield* Effect.never
        }),
      ),
  },
)
