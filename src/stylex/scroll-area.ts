import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as ScrollAreaBehavior from '@/lib/scroll-area'

import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

export const Model = ScrollAreaBehavior.Model
export type Model = ScrollAreaBehavior.Model
export const Message = ScrollAreaBehavior.Message
export type Message = ScrollAreaBehavior.Message
export const init = ScrollAreaBehavior.init
export const update = ScrollAreaBehavior.update

export type ScrollAreaProps = Readonly<{
  layoutStyle?: ComponentLayoutStyle
  children: ReadonlyArray<Html | string>
  orientation?: 'vertical' | 'horizontal' | 'both'
  direction?: 'ltr' | 'rtl'
  ariaLabel?: string
  tabIndex?: number
  model?: Model
}>

const styles = stylex.create({
  base: {
    borderRadius: tokens.controlRadius,
    boxShadow: { default: tokens.shadowNone, ':focus-visible': tokens.focusRingShadow },
    outlineColor: { default: tokens.transparent, ':focus-visible': tokens.ring },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: { default: 0, ':focus-visible': 1 },
    position: 'relative',
    scrollbarColor: `${tokens.border} ${tokens.transparent}`,
    scrollbarWidth: 'thin',
    transitionProperty: 'color, box-shadow',
    height: '100%',
    width: '100%',
  },
  both: { overflow: 'auto' },
  horizontal: { overflowX: 'auto', overflowY: 'hidden' },
  vertical: { overflowX: 'hidden', overflowY: 'auto' },
})

export const scrollArea = <Msg>(
  props: ScrollAreaProps &
    Readonly<{
      toParentMessage?: (message: Message) => Msg;
    }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const orientation = props.orientation ?? 'both'
  // Base UI keeps the viewport out of the tab order until overflow is
  // measured on either axis. An unwired scrollArea stays tabbable
  // (historical creaseui default); a wired model reflects the real
  // measurement — both flags false is the pre-measurement state → -1.
  const tabIndex =
    props.tabIndex ??
    (props.model === undefined ||
    props.model.hasOverflowX ||
    props.model.hasOverflowY
      ? 0
      : -1)
  return h.div(
    [
      h.DataAttribute('slot', 'scroll-area'),
      h.DataAttribute('orientation', orientation),
      ...(props.direction === undefined ? [] : [h.Dir(props.direction)]),
      ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
      h.Tabindex(tabIndex),
      ...(props.toParentMessage === undefined
        ? []
        : [h.OnMount(ScrollAreaBehavior.overflowMount(props.toParentMessage))]),
      h.Class(className(styles.base, styles[orientation], props.layoutStyle)),
    ],
    [...props.children],
  )
}

