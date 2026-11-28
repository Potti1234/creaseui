import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type TokenColor =
  | 'default'
  | 'gray'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
const colors: Record<TokenColor, readonly [string, string]> = {
  default: ['var(--muted)', 'var(--foreground)'],
  gray: ['var(--muted)', 'var(--muted-foreground)'],
  red: [
    'color-mix(in oklab, var(--destructive) 10%, transparent)',
    'var(--destructive)',
  ],
  orange: [
    'color-mix(in oklab, var(--chart-1) 10%, transparent)',
    'var(--chart-1)',
  ],
  yellow: [
    'color-mix(in oklab, var(--chart-4) 15%, transparent)',
    'var(--chart-5)',
  ],
  green: [
    'color-mix(in oklab, var(--chart-2) 10%, transparent)',
    'var(--chart-2)',
  ],
  teal: [
    'color-mix(in oklab, var(--chart-2) 15%, transparent)',
    'var(--chart-2)',
  ],
  cyan: [
    'color-mix(in oklab, var(--chart-2) 25%, transparent)',
    'var(--chart-2)',
  ],
  blue: [
    'color-mix(in oklab, var(--chart-3) 10%, transparent)',
    'var(--chart-3)',
  ],
  purple: [
    'color-mix(in oklab, var(--chart-3) 15%, transparent)',
    'var(--chart-3)',
  ],
  pink: [
    'color-mix(in oklab, var(--destructive) 15%, transparent)',
    'var(--destructive)',
  ],
}
const heights = { sm: '20px', md: '24px', lg: '28px' }
type Classes = Partial<Record<'root' | 'action' | 'label' | 'remove', string>>

export type TokenProps<Msg, R = never> = {
  readonly label: string
  readonly icon?: View.Input<Msg, R>
  readonly endContent?: View.Children<Msg, R>
  readonly color?: TokenColor
  readonly size?: keyof typeof heights
  readonly hideLabel?: boolean
  readonly href?: string
  readonly onPress?: Msg
  readonly onRemove?: Msg
  readonly disabled?: boolean
  readonly description?: string
  readonly className?: string
}

export const TokenBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    icon,
    endContent,
    color = 'default',
    size = 'md',
    hideLabel,
    href,
    onPress,
    onRemove,
    disabled,
    description,
    className,
  }: TokenProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const [backgroundColor, foreground] = colors[color]
  const content = [
    icon,
    hideLabel
      ? undefined
      : h.span
          .class(styles.label)
          .attr('data-slot', 'token-label')
          .children(label),
    endContent,
  ] as const
  const attrs = {
    'aria-label': hideLabel ? label : undefined,
    'aria-description': description,
  }
  return h.span
    .class(styles.root, className)
    .attrs({
      'data-slot': 'token',
      'data-size': size,
      'data-color': color,
      'data-disabled': disabled ? '' : undefined,
    })
    .style({ backgroundColor, color: foreground, minHeight: heights[size] })
    .children(
      disabled
        ? h.span
            .class(styles.action)
            .attrs({
              ...attrs,
              role: hideLabel ? 'img' : undefined,
              'aria-disabled': 'true',
            })
            .children(...content)
        : href !== undefined
          ? h.a
              .class(styles.action)
              .attrs({ ...attrs, href })
              .children(...content)
          : onPress !== undefined
            ? h.button
                .class(styles.action)
                .attrs({ ...attrs, type: 'button' })
                .on('click', onPress)
                .children(...content)
            : h.span
                .class(styles.action)
                .attrs({ ...attrs, role: hideLabel ? 'img' : undefined })
                .children(...content),
      disabled || onRemove === undefined
        ? undefined
        : h.button
            .class(styles.remove)
            .attrs({
              type: 'button',
              'data-slot': 'token-remove',
              'aria-label': `Remove ${label}`,
            })
            .on('click', onRemove)
            .children('×'),
    )
}
