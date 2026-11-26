import type { Html } from '@effect/ui/html'

export type LayoutSpace = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10
export type LayoutLength = string | number

export type LayoutElement =
  | 'article'
  | 'aside'
  | 'div'
  | 'fieldset'
  | 'footer'
  | 'form'
  | 'header'
  | 'li'
  | 'main'
  | 'nav'
  | 'ol'
  | 'section'
  | 'span'
  | 'ul'

export type LayoutSize = {
  readonly width?: LayoutLength
  readonly height?: LayoutLength
  readonly maxWidth?: LayoutLength
  readonly minHeight?: LayoutLength
}

export type LayoutPadding = {
  readonly padding?: LayoutSpace
  readonly paddingInline?: LayoutSpace
  readonly paddingInlineStart?: LayoutSpace
  readonly paddingInlineEnd?: LayoutSpace
  readonly paddingBlock?: LayoutSpace
  readonly paddingBlockStart?: LayoutSpace
  readonly paddingBlockEnd?: LayoutSpace
}

export const px = (value: LayoutLength | undefined) =>
  typeof value === 'number' ? `${value}px` : value

export const space = (value: LayoutSpace | undefined) =>
  value === undefined ? undefined : px(value * 4)

/** The dynamic tag builder takes raw attributes. Use the HTML builder to serialize CSS. */
export const layoutElement = <Msg>(
  h: Html.H<Msg>,
  tag: LayoutElement,
  attrs: Readonly<Record<string, string | undefined>>,
  style: Html.Style,
) => h.el(tag).attrs({ ...attrs, style: h.div.style(style).elementAttrs.style })

export const sizing = ({ width, height, maxWidth, minHeight }: LayoutSize) => ({
  width: px(width),
  height: px(height),
  maxWidth: px(maxWidth),
  minHeight: px(minHeight),
})

export const paddingStyles = ({
  padding,
  paddingInline = padding,
  paddingBlock = padding,
  paddingInlineStart = paddingInline,
  paddingInlineEnd = paddingInline,
  paddingBlockStart = paddingBlock,
  paddingBlockEnd = paddingBlock,
}: LayoutPadding) => ({
  paddingInlineStart: space(paddingInlineStart),
  paddingInlineEnd: space(paddingInlineEnd),
  paddingBlockStart: space(paddingBlockStart),
  paddingBlockEnd: space(paddingBlockEnd),
})
