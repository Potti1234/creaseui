import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { textFormatting, textTypeStyles, type TextFormat } from './text'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingType = 'display-1' | 'display-2' | 'display-3'
const levels = {
  1: { fontSize: '1.5rem', lineHeight: '2rem' },
  2: { fontSize: '1.25rem', lineHeight: '1.75rem' },
  3: { fontSize: '1.0625rem', lineHeight: '1.5rem' },
  4: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  5: { fontSize: '0.75rem', lineHeight: '1.25rem' },
  6: { fontSize: '0.625rem', lineHeight: '1rem' },
}

export type HeadingProps<Msg, R = never> = Omit<
  TextFormat,
  'hasTabularNumbers'
> & {
  readonly level: HeadingLevel
  readonly accessibilityLevel?: HeadingLevel
  readonly type?: HeadingType
  readonly id?: string
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}

export const HeadingBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    level,
    accessibilityLevel,
    type,
    id,
    className,
    children,
    ...format
  }: HeadingProps<NoInfer<Msg>, R>,
) => {
  const style = h.div.style({
    margin: '0',
    fontWeight: '600',
    ...(type === undefined ? levels[level] : textTypeStyles[type]),
    ...textFormatting({ display: 'block', ...format }),
  }).elementAttrs.style
  return h
    .el(`h${level}`)
    .attrs({
      id,
      style,
      'data-slot': 'heading',
      'data-level': String(level),
      'data-color': format.color ?? 'primary',
      'aria-level':
        accessibilityLevel === undefined || accessibilityLevel === level
          ? undefined
          : String(accessibilityLevel),
      class: className,
    })
    .children(children)
}
