import { Style, When } from '@pleat/core'
import { Option } from 'effect'
import type { Attribute, ChildAttribute, Html, HtmlBuilder } from 'foldkit/html'
import * as Mount from 'foldkit/mount'

import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { complexTokens } from './complex-tokens'
import { tokens } from './tokens'
import { interactionTokens } from './interaction-tokens'

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

const styles = {
  disabled: Style.make({
    cursor: interactionTokens.cursorDisabled,
    opacity: 0.5,
  }),
  dragging: Style.make({ userSelect: 'none' }),
  group: Style.make({
    borderColor: tokens.border,
    borderRadius: tokens.radius,
    borderStyle: 'solid',
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    height: '100%',
    width: '100%',
  }),
  handle: Style.make({
    alignItems: 'center',
    backgroundColor: tokens.border,
    boxShadow: tokens.shadowNone,
    display: 'flex',
    justifyContent: 'center',
    outlineStyle: 'none',
    position: 'relative',
    touchAction: 'none',
  }).pipe(Style.when(When.focusVisible, { boxShadow: tokens.focusRingShadow })),
  handleHorizontal: Style.make({
    cursor: interactionTokens.cursorResizeHorizontal,
    height: '100%',
    width: 1,
  }),
  handleVertical: Style.make({
    cursor: interactionTokens.cursorResizeVertical,
    height: 1,
    width: '100%',
  }),
  hitHorizontal: Style.make({
    position: 'absolute',
    bottom: 0,
    left: '-0.375rem',
    right: '-0.375rem',
    top: 0,
  }),
  hitVertical: Style.make({
    position: 'absolute',
    bottom: '-0.375rem',
    left: 0,
    right: 0,
    top: '-0.375rem',
  }),
  grip: Style.make({
    borderColor: tokens.border,
    borderRadius: complexTokens.smallRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: tokens.border,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 10,
    height: '1rem',
    width: '0.75rem',
  }),
  icon: Style.make({ height: '0.75rem', width: '0.75rem' }),
  iconSm: Style.make({ height: '0.625rem', width: '0.625rem' }),
  iconVertical: Style.make({ transform: 'rotate(90deg)' }),
  panel: Style.make({
    overflow: 'auto',
    flexShrink: 0,
    minHeight: 0,
    minWidth: 0,
  }),
  vertical: Style.make({ flexDirection: 'column' }),
}

const panel = <Msg>(
  props: Readonly<{ size: number; children: Html | string }>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      h.DataAttribute('slot', 'resizable-panel'),
      h.Style({ flexBasis: `${props.size}%` }),
      h.Class(className(styles.panel)),
    ],
    [props.children],
  )
const handleView = <Msg>(
  props: Readonly<{
    vertical: boolean
    disabled: boolean
    attributes: ReadonlyArray<Attribute<Msg> | ChildAttribute>
    withHandle: boolean
    gripWrapped: boolean
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      ...props.attributes,
      h.Class(
        className(
          styles.handle,
          props.vertical ? styles.handleVertical : styles.handleHorizontal,
          props.disabled && styles.disabled,
        ),
      ),
    ],
    [
      // Invisible ±6px hit target — the visible line stays 1px but the strip
      // drags from anywhere near it.
      h.span(
        [
          h.AriaHidden(true),
          h.Class(
            className(
              props.vertical ? styles.hitVertical : styles.hitHorizontal,
            ),
          ),
        ],
        [],
      ),
      ...(props.withHandle
        ? props.gripWrapped
          ? [
              h.div(
                [h.Class(className(styles.grip))],
                [
                  Icon.gripVertical<Msg>(
                    {
                      class: className(
                        styles.iconSm,
                        props.vertical && styles.iconVertical,
                      ),
                    },
                    h,
                  ),
                ],
              ),
            ]
          : [
              Icon.gripVertical<Msg>(
                {
                  class: className(
                    styles.icon,
                    props.vertical && styles.iconVertical,
                  ),
                },
                h,
              ),
            ]
        : []),
    ],
  )

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
  extent?: number
  keyboardStep?: number
  disabled?: boolean
  ariaLabel?: string
  layoutStyle?: ComponentLayoutStyle | undefined
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
  const handleAttributes = [
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
      if (key === (vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'))
        return Option.some(
          props.toParentMessage(Message.NudgedResize({ delta: -step })),
        )
      if (key === (vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'))
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
  ]
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
        className(
          styles.group,
          vertical && styles.vertical,
          dragging && styles.dragging,
          props.layoutStyle,
        ),
      ),
    ],
    [
      panel({ size, children: props.first }, h),
      handleView(
        {
          vertical,
          disabled: props.disabled === true,
          attributes: handleAttributes,
          withHandle: props.withHandle === true,
          gripWrapped: true,
        },
        h,
      ),
      panel({ size: 100 - size, children: props.second }, h),
    ],
  )
}

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
  layoutStyle?: ComponentLayoutStyle | undefined
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
    const attributes = [
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
          : key === (vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft')
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
    ]
    children.push(
      handleView(
        {
          vertical,
          disabled: props.disabled === true,
          attributes,
          withHandle: props.withHandles === true,
          gripWrapped: true,
        },
        h,
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
        className(
          styles.group,
          vertical && styles.vertical,
          dragging && styles.dragging,
          props.layoutStyle,
        ),
      ),
    ],
    children,
  )
}
