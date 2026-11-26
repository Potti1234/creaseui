import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

type Space = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10
type Length = string | number

export type CenterProps<Msg, R = never> = {
  readonly axis?: 'both' | 'horizontal' | 'vertical'
  readonly isInline?: boolean
  readonly padding?: Space
  readonly paddingInline?: Space
  readonly paddingInlineStart?: Space
  readonly paddingInlineEnd?: Space
  readonly paddingBlock?: Space
  readonly paddingBlockStart?: Space
  readonly paddingBlockEnd?: Space
  readonly width?: Length
  readonly height?: Length
  readonly maxWidth?: Length
  readonly minHeight?: Length
  readonly children?: View.Children<Msg, R>
}

const length = (value: Length | undefined) =>
  typeof value === 'number' ? `${value}px` : value
const space = (value: Space | undefined) =>
  value === undefined ? undefined : `${value * 4}px`

export const CenterBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    axis = 'both',
    isInline,
    padding,
    paddingInline = padding,
    paddingBlock = padding,
    paddingInlineStart = paddingInline,
    paddingInlineEnd = paddingInline,
    paddingBlockStart = paddingBlock,
    paddingBlockEnd = paddingBlock,
    width,
    height,
    maxWidth,
    minHeight,
    children,
  }: CenterProps<NoInfer<Msg>, R>,
) =>
  h.div
    .attrs({ 'data-slot': 'center', 'data-axis': axis })
    .style({
      display: isInline ? 'inline-flex' : 'flex',
      alignItems: axis === 'horizontal' ? undefined : 'center',
      justifyContent: axis === 'vertical' ? undefined : 'center',
      paddingInlineStart: space(paddingInlineStart),
      paddingInlineEnd: space(paddingInlineEnd),
      paddingBlockStart: space(paddingBlockStart),
      paddingBlockEnd: space(paddingBlockEnd),
      width: length(width),
      height: length(height),
      maxWidth: length(maxWidth),
      minHeight: length(minHeight),
    })
    .children(children)
