import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  layoutElement,
  px,
  sizing,
  space,
  type LayoutElement,
  type LayoutSize,
  type LayoutSpace,
} from './layout'

export type GridColumns =
  | number
  | {
      readonly minWidth: number
      readonly max?: number
      readonly repeat?: 'fill' | 'fit'
    }

type GridElementProps<Msg, R> = {
  readonly as?: Exclude<LayoutElement, 'span'>
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}
type GridAlignment = 'start' | 'center' | 'end' | 'stretch'

export type GridProps<Msg, R = never> = GridElementProps<Msg, R> &
  LayoutSize & {
    readonly columns?: GridColumns
    readonly rowHeight?: number
    readonly gap?: LayoutSpace
    readonly rowGap?: LayoutSpace
    readonly columnGap?: LayoutSpace
    readonly align?: GridAlignment
    readonly justify?: GridAlignment
  }

const columnTemplate = (
  columns: GridColumns | undefined,
  gap: LayoutSpace | undefined,
) => {
  if (typeof columns === 'number')
    return columns > 0 ? `repeat(${columns}, 1fr)` : '1fr'
  if (columns === undefined) return '1fr'
  const { minWidth, max, repeat = 'fill' } = columns
  const minimum =
    max !== undefined && max > 0
      ? `max(${minWidth}px, calc((100% - ${max - 1} * ${space(gap ?? 0)}) / ${max}))`
      : `${minWidth}px`
  return `repeat(auto-${repeat}, minmax(min(100%, ${minimum}), 1fr))`
}

export const GridBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  props: GridProps<NoInfer<Msg>, R>,
) =>
  layoutElement(
    h,
    props.as ?? 'div',
    { class: props.className, 'data-slot': 'grid' },
    {
      display: 'grid',
      gridTemplateColumns: columnTemplate(
        props.columns,
        props.columnGap ?? props.gap,
      ),
      gridAutoRows: px(props.rowHeight),
      rowGap: space(props.rowGap ?? props.gap),
      columnGap: space(props.columnGap ?? props.gap),
      alignItems: props.align,
      justifyItems: props.justify,
      ...sizing(props),
    },
  ).children(props.children)

export type GridSpanProps<Msg, R = never> = GridElementProps<Msg, R> & {
  readonly columns?: number | 'full'
  readonly rows?: number
}

export const GridSpanBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    as = 'div',
    className,
    columns,
    rows,
    children,
  }: GridSpanProps<NoInfer<Msg>, R>,
) =>
  layoutElement(
    h,
    as,
    { class: className, 'data-slot': 'grid-span' },
    {
      display: 'grid',
      height: '100%',
      minWidth: '0',
      gridColumn:
        columns === 'full'
          ? '1 / -1'
          : columns === undefined
            ? undefined
            : `span ${columns}`,
      gridRow: rows === undefined ? undefined : `span ${rows}`,
    },
  ).children(children)
