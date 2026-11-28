import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type MarkerPurpose = 'annotation' | 'status' | 'decorative'
type Classes = Partial<Record<'root' | 'icon' | 'content' | 'line', string>>
export type MarkerProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly icon?: View.Input<Msg, R>
  readonly purpose?: MarkerPurpose
  readonly variant?: 'default' | 'separator' | 'border'
  readonly ariaLabel?: string
  readonly className?: string
  readonly shimmer?: boolean
  readonly href?: string
  readonly onClick?: Msg
}

export const MarkerBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    children,
    icon,
    purpose = 'annotation',
    variant = 'default',
    ariaLabel,
    className,
    shimmer,
    href,
    onClick,
  }: MarkerProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const contents = h.span
    .class(styles.content)
    .attrs({
      'data-slot': 'marker-content',
      'data-shimmer': shimmer ? '' : undefined,
      'data-variant': variant,
    })
    .children(
      icon === undefined
        ? undefined
        : h.span
            .class(styles.icon)
            .attrs({ 'data-slot': 'marker-icon', 'aria-hidden': 'true' })
            .children(icon),
      children,
    )
  const inner =
    href !== undefined
      ? h.a.attr('href', href).attr('aria-label', ariaLabel).children(contents)
      : onClick === undefined
        ? contents
        : h.button
            .attrs({ 'aria-label': ariaLabel, type: 'button' })
            .on('click', onClick)
            .children(contents)
  const line = h.span.class(styles.line).attr('aria-hidden', 'true')
  return h.div
    .class(styles.root, className)
    .attrs({
      'data-slot': 'marker',
      'data-variant': variant,
      'data-purpose': purpose,
      'aria-label':
        href === undefined && onClick === undefined ? ariaLabel : undefined,
      role:
        purpose === 'decorative'
          ? 'none'
          : purpose === 'status'
            ? 'status'
            : 'note',
      'aria-hidden':
        purpose === 'decorative' && href === undefined && onClick === undefined
          ? 'true'
          : undefined,
    })
    .children(
      variant === 'separator' ? line : undefined,
      inner,
      variant === 'separator' ? line : undefined,
    )
}
