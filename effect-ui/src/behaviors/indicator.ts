import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { IconBehavior } from './icon'

export type IndicatorState = 'unchecked' | 'checked' | 'indeterminate'
type Classes = Partial<Record<'root' | 'dot', string>>

export type IndicatorProps<Msg, R = never> = {
  readonly kind?: 'check' | 'checkbox' | 'radio'
  readonly state: IndicatorState
  readonly size?: 'sm' | 'md'
  readonly disabled?: boolean
  readonly children?: View.Children<Msg, R>
  readonly className?: string
}

export const IndicatorBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    kind = 'check',
    state,
    size = 'md',
    disabled,
    children,
    className,
  }: IndicatorProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const custom = children !== undefined && children.length > 0
  if (kind === 'check' && state === 'unchecked' && !custom) return undefined
  const checked =
    kind === 'radio' && state === 'indeterminate' ? 'checked' : state
  const mark = () => {
    if (checked === 'unchecked') return undefined
    if (kind === 'radio')
      return h.span.class(styles.dot).attrs({
        'data-slot': 'radio-indicator-dot',
        'data-size': size,
      })
    return IconBehavior(h, {
      name: checked === 'indeterminate' ? 'minus' : 'check',
      size: size === 'sm' ? '3xs' : '2xs',
    })
  }
  return h.span
    .class(styles.root, className)
    .attrs({
      'aria-hidden': 'true',
      'data-slot': `${kind}-indicator`,
      'data-kind': kind,
      'data-checked': checked,
      'data-size': size,
      'data-disabled': disabled ? '' : undefined,
    })
    .children(custom ? children : mark())
}
