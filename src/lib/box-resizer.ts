import { Option, Schema as S, Stream } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

import * as Drag from '@/lib/behaviors/drag'
import { resizeBox, type Limits } from '@/lib/behaviors/resize'

export const Box = S.Struct({
  x: S.Number,
  y: S.Number,
  width: S.Number,
  height: S.Number,
})
const handles = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'move'] as const
const Handle = S.Literals(handles)
type Handle = typeof Handle.Type

const Draft = S.Struct({ handle: Handle, box: Box })
export const BoxResizeModel = S.Struct({ box: Box, draft: S.NullOr(Draft) })
export type BoxResizeModel = typeof BoxResizeModel.Type

export const BoxResizeMessage = defineMessageUnion({
  StartedBoxResize: { handle: Handle },
  DraggedBoxResize: { dx: S.Number, dy: S.Number, lockAspect: S.Boolean },
  FinishedBoxResize: { cancelled: S.Boolean },
  NudgedBoxResize: { handle: Handle, dx: S.Number, dy: S.Number },
})
export type BoxResizeMessage = typeof BoxResizeMessage.Type

export const initBoxResize = (box: typeof Box.Type): BoxResizeModel => ({
  box,
  draft: null,
})

export const updateBoxResize = (
  model: BoxResizeModel,
  message: BoxResizeMessage,
  limits: Limits = {},
): BoxResizeModel => {
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

const ObserveBoxResize = Mount.defineStream('ObserveBoxResize', {
  messages: [
    BoxResizeMessage.StartedBoxResize,
    BoxResizeMessage.DraggedBoxResize,
    BoxResizeMessage.FinishedBoxResize,
  ],
  execute: ({ element }) =>
    !(element instanceof HTMLElement)
      ? Stream.empty
      : Drag.observeDrag<
          Exclude<BoxResizeMessage, { _tag: 'NudgedBoxResize' }>
        >(element, (down, send) => {
          if (!(down.target instanceof Element)) return
          const control = down.target.closest('button[data-box-resize-handle]')
          if (
            !(control instanceof HTMLButtonElement) ||
            control.disabled ||
            control.closest('[data-slot="resizable-box"]') !== element
          )
            return
          const handle = handles.find(
            handle => handle === control.dataset.boxResizeHandle,
          )
          if (handle === undefined) return
          return {
            captureElement: control,
            threshold: Drag.dragThreshold,
            cancelOnEscape: true,
            onStart: () => {
              control.focus({ preventScroll: true })
              send(BoxResizeMessage.StartedBoxResize({ handle }))
            },
            onMove: ({ event, x, y }) =>
              send(
                BoxResizeMessage.DraggedBoxResize({
                  dx: x - down.clientX,
                  dy: y - down.clientY,
                  lockAspect: event.shiftKey,
                }),
              ),
            onEnd: (_event, cancelled) =>
              send(BoxResizeMessage.FinishedBoxResize({ cancelled })),
          }
        }),
})

const axes = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
} as const

const cursors: Record<Handle, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  move: 'move',
}

const label: Record<Handle, string> = {
  n: 'Resize top edge',
  ne: 'Resize top right corner',
  e: 'Resize right edge',
  se: 'Resize bottom right corner',
  s: 'Resize bottom edge',
  sw: 'Resize bottom left corner',
  w: 'Resize left edge',
  nw: 'Resize top left corner',
  move: 'Move box',
}

export type ResizableBoxProps<Msg> = Readonly<{
  model: BoxResizeModel
  toParentMessage: (message: BoxResizeMessage) => Msg
  children: ReadonlyArray<Html | string>
  disabled?: boolean
  step?: number
  class?: string
}>

export const resizableBox = <Msg>(
  props: ResizableBoxProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const { x, y, width, height } = props.model.draft?.box ?? props.model.box
  return h.div(
    [
      h.DataAttribute('slot', 'resizable-box'),
      h.Class(props.class ?? ''),
      h.Style({
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }),
      h.OnMount(Mount.mapMessage(ObserveBoxResize(), props.toParentMessage)),
    ],
    [
      ...props.children,
      ...handles.map(handle =>
        h.button(
          [
            h.Key(handle),
            h.Type('button'),
            h.AriaLabel(label[handle]),
            h.Disabled(props.disabled ?? false),
            h.DataAttribute('box-resize-handle', handle),
            h.Style({
              position: 'absolute',
              left:
                handle === 'move'
                  ? '50%'
                  : handle.includes('w')
                    ? '0%'
                    : handle.includes('e')
                      ? '100%'
                      : '50%',
              top:
                handle === 'move'
                  ? '50%'
                  : handle.includes('n')
                    ? '0%'
                    : handle.includes('s')
                      ? '100%'
                      : '50%',
              transform: 'translate(-50%, -50%)',
              width: '1rem',
              height: '1rem',
              cursor: cursors[handle],
              touchAction: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--background)',
            }),
            h.OnKeyDownPreventDefault((key, modifiers) => {
              const delta = axes[key as keyof typeof axes]
              if (
                !delta ||
                modifiers.altKey ||
                modifiers.ctrlKey ||
                modifiers.metaKey ||
                (delta[0] !== 0 && (handle === 'n' || handle === 's')) ||
                (delta[1] !== 0 && (handle === 'e' || handle === 'w'))
              )
                return Option.none()
              const step = (props.step ?? 1) * (modifiers.shiftKey ? 10 : 1)
              return Option.some(
                props.toParentMessage(
                  BoxResizeMessage.NudgedBoxResize({
                    handle,
                    dx: delta[0] * step,
                    dy: delta[1] * step,
                  }),
                ),
              )
            }),
          ],
          [],
        ),
      ),
      h.div(
        [
          h.Role('status'),
          h.Style({
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clipPath: 'inset(50%)',
          }),
        ],
        [
          `Box ${Math.round(props.model.box.width)} by ${Math.round(props.model.box.height)} at ${Math.round(props.model.box.x)}, ${Math.round(props.model.box.y)}`,
        ],
      ),
    ],
  )
}
