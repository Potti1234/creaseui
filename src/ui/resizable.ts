import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Mount from 'foldkit/mount'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

import {
  GroupMessage,
  Message,
  ObserveGroupResize,
  ObserveResize,
  clampTo,
  type GroupModel,
  type Model,
} from '@/lib/resizable'

export {
  GroupMessage,
  GroupModel,
  Message,
  Model,
  init,
  initGroup,
  update,
  updateGroup,
} from '@/lib/resizable'

export type ResizableProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  first: Html | string
  second: Html | string
  direction?: 'horizontal' | 'vertical'
  rtl?: boolean
  withHandle?: boolean
  minSize?: number
  maxSize?: number
  /** Pixel extent of the panel group. Supply this when the group is not viewport-sized. */
  extent?: number
  keyboardStep?: number
  disabled?: boolean
  ariaLabel?: string
  class?: string
}>

export const resizable = <Msg>(
  props: ResizableProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const vertical = props.direction === 'vertical'
  const rtl = props.rtl === true && !vertical
  const dragging = Option.isSome(props.model.drag)
  const minSize = clampTo(props.minSize ?? 10, 0, 100)
  const maxSize = clampTo(props.maxSize ?? 90, minSize, 100)
  const size = clampTo(props.model.firstSize, minSize, maxSize)
  return h.div(
    [
      h.DataAttribute('slot', 'resizable-panel-group'),
      h.DataAttribute('direction', vertical ? 'vertical' : 'horizontal'),
      ...(rtl ? [h.Dir('rtl')] : []),
      ...(props.extent === undefined
        ? []
        : [h.DataAttribute('resizable-extent', String(props.extent))]),
      h.OnMount(Mount.mapMessage(ObserveResize(), props.toParentMessage)),
      h.Class(
        cn(
          'flex size-full overflow-hidden rounded-lg border data-[direction=vertical]:flex-col',
          dragging ? 'select-none' : undefined,
          props.class,
        ),
      ),
    ],
    [
      panel({ size, children: props.first }, h),
      h.div(
        [
          h.Role('separator'),
          h.AriaLabel(props.ariaLabel ?? 'Resize panels'),
          h.AriaOrientation(vertical ? 'horizontal' : 'vertical'),
          h.AriaValuemin(minSize),
          h.AriaValuemax(maxSize),
          h.AriaValuenow(Math.round(size)),
          h.AriaDisabled(props.disabled === true),
          h.Tabindex(props.disabled === true ? -1 : 0),
          h.DataAttribute('slot', 'resizable-handle'),
          h.DataAttribute('direction', vertical ? 'vertical' : 'horizontal'),
          h.OnKeyDownPreventDefault((key, modifiers) => {
            if (
              props.disabled === true ||
              modifiers.ctrlKey ||
              modifiers.altKey ||
              modifiers.metaKey
            )
              return Option.none()
            const step = props.keyboardStep ?? 2
            if (
              key === (vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft')
            )
              return Option.some(
                props.toParentMessage(Message.NudgedResize({ delta: -step })),
              )
            if (
              key ===
              (vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight')
            )
              return Option.some(
                props.toParentMessage(Message.NudgedResize({ delta: step })),
              )
            if (key === 'Home')
              return Option.some(
                props.toParentMessage(
                  Message.NudgedResize({ delta: minSize - size }),
                ),
              )
            if (key === 'End')
              return Option.some(
                props.toParentMessage(
                  Message.NudgedResize({ delta: maxSize - size }),
                ),
              )
            return Option.none()
          }),
          h.Class(
            cn(
              'relative flex touch-none w-px items-center justify-center bg-border outline-none focus-visible:ring-1 focus-visible:ring-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
              vertical
                ? 'h-px w-full cursor-row-resize'
                : 'h-full w-px cursor-col-resize',
            ),
          ),
        ],
        [
          // Invisible ±6px hit target — the visible line stays 1px but the
          // strip drags from anywhere near it.
          h.div(
            [
              h.AriaHidden(true),
              h.Class(
                vertical
                  ? 'absolute inset-x-0 -inset-y-1.5'
                  : 'absolute inset-y-0 -inset-x-1.5',
              ),
            ],
            [],
          ),
          ...(props.withHandle === true
            ? [
                h.div(
                  [
                    h.Class(
                      'z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border',
                    ),
                  ],
                  [
                    Icon.gripVertical<Msg>(
                      {
                        class: cn(
                          'size-2.5',
                          vertical ? 'rotate-90' : undefined,
                        ),
                      },
                      h,
                    ),
                  ],
                ),
              ]
            : []),
        ],
      ),
      panel({ size: 100 - size, children: props.second }, h),
    ],
  )
}

const panel = <Msg>(
  props: Readonly<{ size: number; children: Html | string }>,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'resizable-panel'),
      h.Style({ flexBasis: `${props.size}%` }),
      h.Class('min-h-0 min-w-0 shrink-0 overflow-auto'),
    ],
    [props.children],
  )
}

// Multi-panel API. The original two-panel API above remains source-compatible.

export type ResizableGroupProps<Msg> = Readonly<{
  model: GroupModel
  toParentMessage: (message: GroupMessage) => Msg
  panels: ReadonlyArray<Html | string>
  direction?: 'horizontal' | 'vertical'
  rtl?: boolean
  minSize?: number
  extent: number
  withHandles?: boolean
  disabled?: boolean
  class?: string
}>

export const resizableGroup = <Msg>(
  props: ResizableGroupProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const vertical = props.direction === 'vertical'
  const rtl = props.rtl === true && !vertical
  const dragging = Option.isSome(props.model.drag)
  const minSize = Math.max(0, props.minSize ?? 5)
  const children: Array<Html> = []
  props.panels.forEach((child, index) => {
    children.push(
      panel({ size: props.model.sizes[index] ?? 0, children: child }, h),
    )
    if (index >= props.panels.length - 1) return
    const value = props.model.sizes
      .slice(0, index + 1)
      .reduce((sum, size) => sum + size, 0)
    children.push(
      h.div(
        [
          h.Role('separator'),
          h.AriaOrientation(vertical ? 'horizontal' : 'vertical'),
          h.AriaValuemin(minSize),
          h.AriaValuemax(100 - minSize),
          h.AriaValuenow(Math.round(value)),
          h.AriaDisabled(props.disabled === true),
          h.Tabindex(props.disabled === true ? -1 : 0),
          h.DataAttribute('slot', 'resizable-handle'),
          h.DataAttribute('resizable-index', String(index)),
          h.OnKeyDownPreventDefault((key, modifiers) =>
            props.disabled === true ||
            modifiers.ctrlKey ||
            modifiers.altKey ||
            modifiers.metaKey
              ? Option.none()
              : key ===
                  (vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft')
                ? Option.some(
                    props.toParentMessage(
                      GroupMessage.NudgedGroupResize({
                        handle: index,
                        delta: -2,
                        minSize,
                      }),
                    ),
                  )
                : key ===
                    (vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight')
                  ? Option.some(
                      props.toParentMessage(
                        GroupMessage.NudgedGroupResize({
                          handle: index,
                          delta: 2,
                          minSize,
                        }),
                      ),
                    )
                  : Option.none(),
          ),
          h.Class(
            cn(
              'relative flex touch-none items-center justify-center bg-border outline-none focus-visible:ring-1 focus-visible:ring-ring',
              vertical
                ? 'h-px w-full cursor-row-resize'
                : 'h-full w-px cursor-col-resize',
            ),
          ),
        ],
        [
          h.div(
            [
              h.AriaHidden(true),
              h.Class(
                vertical
                  ? 'absolute inset-x-0 -inset-y-1.5'
                  : 'absolute inset-y-0 -inset-x-1.5',
              ),
            ],
            [],
          ),
          ...(props.withHandles === true
            ? [
                h.div(
                  [
                    h.Class(
                      'z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border',
                    ),
                  ],
                  [
                    Icon.gripVertical<Msg>(
                      {
                        class: cn(
                          'size-2.5',
                          vertical ? 'rotate-90' : undefined,
                        ),
                      },
                      h,
                    ),
                  ],
                ),
              ]
            : []),
        ],
      ),
    )
  })
  return h.div(
    [
      h.DataAttribute('slot', 'resizable-panel-group'),
      h.DataAttribute('direction', vertical ? 'vertical' : 'horizontal'),
      ...(rtl ? [h.Dir('rtl')] : []),
      h.DataAttribute('resizable-extent', String(props.extent)),
      h.DataAttribute('resizable-min-size', String(minSize)),
      h.OnMount(Mount.mapMessage(ObserveGroupResize(), props.toParentMessage)),
      h.Class(
        cn(
          'flex size-full overflow-hidden rounded-lg border',
          vertical ? 'flex-col' : undefined,
          dragging ? 'select-none' : undefined,
          props.class,
        ),
      ),
    ],
    children,
  )
}

export {
  BoxResizeMessage,
  BoxResizeModel,
  initBoxResize,
  resizableBox,
  updateBoxResize,
  type ResizableBoxProps,
} from '@/lib/box-resizer'
