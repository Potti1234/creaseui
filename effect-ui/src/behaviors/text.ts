import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type TextType =
  | 'body'
  | 'large'
  | 'label'
  | 'supporting'
  | 'code'
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'inherit'
export type TextSize =
  | '4xs'
  | '3xs'
  | '2xs'
  | 'xsm'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'placeholder'
  | 'accent'
  | 'inherit'
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'

const sizeValues: Record<TextSize, string> = {
  '4xs': '0.375rem',
  '3xs': '0.4375rem',
  '2xs': '0.5rem',
  xsm: '0.625rem',
  sm: '0.75rem',
  base: '0.875rem',
  lg: '1.0625rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.8125rem',
  '4xl': '2.1875rem',
}
const colors: Record<TextColor, string> = {
  primary: 'var(--foreground)',
  secondary: 'var(--muted-foreground)',
  disabled: 'var(--muted-foreground)',
  placeholder: 'var(--muted-foreground)',
  accent: 'var(--primary)',
  inherit: 'inherit',
}
const weights: Record<TextWeight, string> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}

export const textTypeStyles = {
  body: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  large: { fontSize: '1.0625rem', lineHeight: '1.5rem', fontWeight: '600' },
  label: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: '500' },
  supporting: { fontSize: '0.75rem', lineHeight: '1.25rem' },
  code: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontFamily: 'var(--font-mono, monospace)',
  },
  'display-1': {
    fontSize: '2.625rem',
    lineHeight: '3.25rem',
    fontWeight: '400',
  },
  'display-2': {
    fontSize: '2.1875rem',
    lineHeight: '2.75rem',
    fontWeight: '400',
  },
  'display-3': {
    fontSize: '1.8125rem',
    lineHeight: '2.25rem',
    fontWeight: '400',
  },
  inherit: { font: 'inherit' },
} satisfies Record<TextType, Html.Style>

export type TextFormat = {
  readonly color?: TextColor
  readonly weight?: TextWeight
  readonly display?: 'inline' | 'block'
  readonly maxLines?: number
  readonly wordBreak?: 'break-all' | 'break-word'
  readonly textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty'
  readonly justify?: 'start' | 'center' | 'end'
  readonly hasCapsize?: boolean
  readonly hasStrikethrough?: boolean
  readonly hasTabularNumbers?: boolean
}

export type TextProps<Msg, R = never> = TextFormat & {
  readonly as?: 'span' | 'p' | 'div' | 'label' | 'h1' | 'h2' | 'h3'
  readonly type?: TextType
  readonly size?: TextSize
  readonly htmlFor?: string
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}

export const textFormatting = ({
  color = 'primary',
  weight,
  display = 'inline',
  maxLines = 0,
  wordBreak,
  textWrap,
  justify,
  hasCapsize,
  hasStrikethrough,
  hasTabularNumbers,
}: TextFormat): Html.Style => ({
  color: colors[color],
  opacity: color === 'disabled' ? '0.5' : undefined,
  ...(weight === undefined ? {} : { fontWeight: weights[weight] }),
  display:
    maxLines > 1
      ? '-webkit-box'
      : maxLines === 1 || hasCapsize
        ? 'block'
        : display,
  textWrap,
  textAlign: justify,
  wordBreak:
    wordBreak === 'break-all' || (wordBreak === undefined && maxLines === 1)
      ? 'break-all'
      : undefined,
  overflowWrap:
    wordBreak === 'break-word' || maxLines > 1 ? 'break-word' : undefined,
  overflow: maxLines > 0 ? 'hidden' : undefined,
  whiteSpace: maxLines === 1 ? 'nowrap' : undefined,
  textOverflow: maxLines === 1 ? 'ellipsis' : undefined,
  webkitBoxOrient: maxLines > 1 ? 'vertical' : undefined,
  webkitLineClamp: maxLines > 1 ? String(maxLines) : undefined,
  textBoxEdge: hasCapsize ? 'cap alphabetic' : undefined,
  textBoxTrim: hasCapsize ? 'trim-both' : undefined,
  textDecorationLine: hasStrikethrough ? 'line-through' : undefined,
  fontVariantNumeric: hasTabularNumbers ? 'tabular-nums' : undefined,
})

export const TextBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    as = 'span',
    type = 'body',
    size,
    htmlFor,
    className,
    children,
    ...format
  }: TextProps<NoInfer<Msg>, R>,
) => {
  const color =
    format.color ??
    (type === 'supporting'
      ? 'secondary'
      : type === 'inherit'
        ? 'inherit'
        : 'primary')
  const style = h.span.style({
    ...textTypeStyles[type],
    ...(size === undefined ? {} : { fontSize: sizeValues[size] }),
    ...textFormatting({ ...format, color }),
  }).elementAttrs.style
  return h
    .el(as)
    .attrs({
      'data-slot': 'text',
      'data-type': type,
      'data-color': color,
      for: as === 'label' ? htmlFor : undefined,
      class: className,
      style,
    })
    .children(children)
}
