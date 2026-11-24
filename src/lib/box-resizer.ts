import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Mount from 'foldkit/mount'

import { dragThreshold } from '@/lib/behaviors/drag'
import * as Resize from '@/lib/behaviors/resize'
import { handles, type Handle } from '@/lib/behaviors/resize'

export {
  Box,
  Model as BoxResizeModel,
  Message as BoxResizeMessage,
  init as initBoxResize,
  update as updateBoxResize,
} from '@/lib/behaviors/resize'

const ObserveBoxResize = Mount.defineStream('ObserveBoxResize', {
  messages: [
    Resize.Message.StartedBoxResize,
    Resize.Message.DraggedBoxResize,
    Resize.Message.FinishedBoxResize,
  ],
  execute: ({ element }) =>
    Resize.observeResize<Exclude<Resize.Message, { _tag: 'NudgedBoxResize' }>>(
      element,
      down => {
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
          handle: control,
          threshold: dragThreshold,
          cancelOnEscape: true,
          start: () => {
            control.focus({ preventScroll: true })
            return Resize.Message.StartedBoxResize({ handle })
          },
          move: ({ event, dx, dy }) =>
            Resize.Message.DraggedBoxResize({
              dx,
              dy,
              lockAspect: event.shiftKey,
            }),
          finish: cancelled => Resize.Message.FinishedBoxResize({ cancelled }),
        }
      },
    ),
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
  model: Resize.Model
  toParentMessage: (message: Resize.Message) => Msg
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
                  Resize.Message.NudgedBoxResize({
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
        [Resize.resizeMessage(props.model.box)],
      ),
    ],
  )
}
