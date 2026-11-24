import { Schema as S, Stream } from 'effect'
import { defineMessageUnion } from 'foldkit/message'

import * as Drag from './drag'

export const Box = S.Struct({
  x: S.Number,
  y: S.Number,
  width: S.Number,
  height: S.Number,
})
export type Box = typeof Box.Type

export const handles = [
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
  'move',
] as const
export const Handle = S.Literals(handles)
export type Handle = typeof Handle.Type

type Size = Readonly<{ width: number; height: number }>
export type Limits = Readonly<{
  min?: Size
  max?: Size
  bounds?: Readonly<{
    left: number
    right: number
    top: number
    bottom: number
  }>
  aspect?: number
}>

export const clampTo = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export const resizeBox = (
  box: Box,
  handle: Handle,
  dx: number,
  dy: number,
  limits: Limits = {},
): Box => {
  const {
    left = -Infinity,
    right = Infinity,
    top = -Infinity,
    bottom = Infinity,
  } = limits.bounds ?? {}
  if (handle === 'move') {
    return {
      ...box,
      x: clampTo(box.x + dx, left, Math.max(left, right - box.width)),
      y: clampTo(box.y + dy, top, Math.max(top, bottom - box.height)),
    }
  }

  const west = handle.includes('w')
  const east = handle.includes('e')
  const north = handle.includes('n')
  const south = handle.includes('s')
  const horizontal = west || east
  const vertical = north || south
  const anchorX = west ? box.x + box.width : box.x
  const anchorY = north ? box.y + box.height : box.y
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  const roomX = Math.min(
    limits.max?.width ?? Infinity,
    west
      ? anchorX - left
      : east
        ? right - anchorX
        : 2 * Math.min(centerX - left, right - centerX),
  )
  const roomY = Math.min(
    limits.max?.height ?? Infinity,
    north
      ? anchorY - top
      : south
        ? bottom - anchorY
        : 2 * Math.min(centerY - top, bottom - centerY),
  )
  const minWidth = limits.min?.width ?? 1
  const minHeight = limits.min?.height ?? 1
  let width = box.width + (west ? -dx : east ? dx : 0)
  let height = box.height + (north ? -dy : south ? dy : 0)
  const ratio = limits.aspect

  if (ratio !== undefined && Number.isFinite(ratio) && ratio > 0) {
    const useWidth =
      horizontal &&
      (!vertical ||
        Math.abs(width - box.width) / Math.max(box.width, 1) >=
          Math.abs(height - box.height) / Math.max(box.height, 1))
    width = clampTo(
      useWidth ? width : height * ratio,
      Math.max(minWidth, minHeight * ratio),
      Math.min(roomX, roomY * ratio),
    )
    height = width / ratio
  } else {
    if (horizontal) width = clampTo(width, minWidth, roomX)
    if (vertical) height = clampTo(height, minHeight, roomY)
  }

  return {
    x: west ? anchorX - width : east ? anchorX : centerX - width / 2,
    y: north ? anchorY - height : south ? anchorY : centerY - height / 2,
    width,
    height,
  }
}

const Draft = S.Struct({ handle: Handle, box: Box })
export const Model = S.Struct({ box: Box, draft: S.NullOr(Draft) })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  StartedBoxResize: { handle: Handle },
  DraggedBoxResize: { dx: S.Number, dy: S.Number, lockAspect: S.Boolean },
  FinishedBoxResize: { cancelled: S.Boolean },
  NudgedBoxResize: { handle: Handle, dx: S.Number, dy: S.Number },
})
export type Message = typeof Message.Type

export const init = (box: typeof Box.Type): Model => ({
  box,
  draft: null,
})

export const update = (
  model: Model,
  message: Message,
  limits: Limits = {},
): Model => {
  switch (message._tag) {
    case 'StartedBoxResize':
      return model.draft === null
        ? { ...model, draft: { handle: message.handle, box: model.box } }
        : model
    case 'DraggedBoxResize': {
      if (model.draft === null) return model
      return {
        ...model,
        draft: {
          ...model.draft,
          box: resizeBox(
            model.box,
            model.draft.handle,
            message.dx,
            message.dy,
            message.lockAspect &&
              limits.aspect === undefined &&
              model.box.height > 0
              ? { ...limits, aspect: model.box.width / model.box.height }
              : limits,
          ),
        },
      }
    }
    case 'FinishedBoxResize':
      return model.draft === null
        ? model
        : { box: message.cancelled ? model.box : model.draft.box, draft: null }
    case 'NudgedBoxResize':
      return model.draft === null
        ? {
            ...model,
            box: resizeBox(
              model.box,
              message.handle,
              message.dx,
              message.dy,
              limits,
            ),
          }
        : model
  }
}

/** Format committed dimensions for a live region. Callers can supply localized text. */
export const resizeMessage = (box: Box, label = 'Box'): string =>
  `${label} ${Math.round(box.width)} by ${Math.round(box.height)} at ${Math.round(box.x)}, ${Math.round(box.y)}`

export const percentDelta = (
  start: number,
  position: number,
  extent: number,
): number => ((position - start) / Math.max(1, extent)) * 100

type ResizeSample = Drag.PointerSample & Readonly<{ dx: number; dy: number }>

type PointerResize<Msg> = Readonly<{
  handle: HTMLElement
  threshold?: number
  cancelOnEscape?: boolean
  start: () => Msg
  move: (sample: ResizeSample) => Msg | undefined
  finish: (cancelled: boolean) => Msg
}>

/** Bind a resize handle to a streaming Mount. Omit threshold to start on pointerdown. */
export const observeResize = <Msg>(
  element: Element,
  bind: (down: PointerEvent) => PointerResize<Msg> | undefined,
): Stream.Stream<Msg> => {
  if (!(element instanceof HTMLElement)) return Stream.empty
  return Drag.observeDrag<Msg>(element, (down, send) => {
    const resize = bind(down)
    if (!resize) return
    const deferred = (resize.threshold ?? 0) > 0
    if (!deferred) send(resize.start())
    return {
      captureElement: resize.handle,
      threshold: resize.threshold ?? 0,
      cancelOnEscape: resize.cancelOnEscape ?? false,
      ...(deferred && { onStart: () => send(resize.start()) }),
      onMove: sample => {
        const message = resize.move({
          ...sample,
          dx: sample.x - down.clientX,
          dy: sample.y - down.clientY,
        })
        if (message !== undefined) send(message)
      },
      onEnd: (_event, cancelled) => send(resize.finish(cancelled)),
    }
  })
}
