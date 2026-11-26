import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  layoutElement,
  paddingStyles,
  sizing,
  space,
  type LayoutElement,
  type LayoutPadding,
  type LayoutSize,
  type LayoutSpace,
} from './layout'

export type StackDirection = 'horizontal' | 'vertical'
export type StackCrossAlignment = 'start' | 'center' | 'end' | 'stretch'
export type StackMainAlignment =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly'
export type StackAlignment = StackMainAlignment | StackCrossAlignment

type StackElementProps<Msg, R> = {
  readonly as?: LayoutElement
  readonly isScrollable?: boolean
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}

export type StackProps<Msg, R = never> = StackElementProps<Msg, R> &
  LayoutSize &
  LayoutPadding & {
    readonly direction?: StackDirection
    readonly hAlign?: StackAlignment
    readonly vAlign?: StackAlignment
    readonly justify?: StackMainAlignment
    readonly align?: StackCrossAlignment
    readonly gap?: LayoutSpace
    readonly wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  }

const mainAlignment = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  stretch: undefined,
}

const crossAlignment = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  between: undefined,
  around: undefined,
  evenly: undefined,
}

export const StackBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  props: StackProps<NoInfer<Msg>, R>,
) => {
  const {
    as = 'div',
    direction = 'vertical',
    hAlign,
    vAlign,
    children,
    className,
  } = props
  const horizontal = direction === 'horizontal'
  const main = (horizontal ? hAlign : vAlign) ?? props.justify
  const cross = (horizontal ? vAlign : hAlign) ?? props.align
  return layoutElement(
    h,
    as,
    { class: className, 'data-slot': 'stack', 'data-direction': direction },
    {
      display: 'flex',
      flexDirection: horizontal ? 'row' : 'column',
      flexWrap: props.wrap,
      justifyContent: main === undefined ? undefined : mainAlignment[main],
      alignItems: cross === undefined ? undefined : crossAlignment[cross],
      gap: space(props.gap),
      overflow: props.isScrollable ? 'auto' : undefined,
      ...paddingStyles(props),
      ...sizing(props),
    },
  ).children(children)
}

export type StackItemProps<Msg, R = never> = StackElementProps<Msg, R> & {
  readonly size?: 'static' | 'fill'
  readonly crossAlignSelf?: StackCrossAlignment
}

export const StackItemBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    as = 'div',
    size = 'static',
    crossAlignSelf,
    isScrollable,
    className,
    children,
  }: StackItemProps<NoInfer<Msg>, R>,
) =>
  layoutElement(
    h,
    as,
    { class: className, 'data-slot': 'stack-item', 'data-size': size },
    {
      minWidth: '0',
      minHeight: '0',
      flexGrow: size === 'fill' ? '1' : '0',
      flexShrink: size === 'static' ? '0' : undefined,
      alignSelf:
        crossAlignSelf === undefined
          ? undefined
          : crossAlignment[crossAlignSelf],
      overflow: isScrollable ? 'auto' : undefined,
    },
  ).children(children)
