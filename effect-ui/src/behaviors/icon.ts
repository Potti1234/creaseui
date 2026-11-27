import type { Html } from '@effect/ui/html'

import { iconNodes } from './icon-nodes'

export type IconName = keyof typeof iconNodes
export const iconNames = Object.keys(iconNodes) as readonly IconName[]
export const hasIcon = (name: string): name is IconName =>
  Object.hasOwn(iconNodes, name)

const sizes = {
  '3xs': 8,
  '2xs': 12,
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}
export type IconSize = keyof typeof sizes
export type IconProps = {
  readonly name: IconName
  readonly size?: IconSize
  readonly tone?: 'muted' | 'primary'
  readonly rotation?: 0 | 90 | 180
  readonly filled?: boolean
  readonly ariaLabel?: string
  readonly dataIcon?: 'inline-start' | 'inline-end'
  readonly className?: string
}

export const IconBehavior = <Msg>(
  h: Html.H<Msg>,
  {
    name,
    size,
    tone,
    rotation,
    filled,
    ariaLabel,
    dataIcon,
    className,
  }: IconProps,
) => {
  const dimensions = size === undefined ? '1em' : String(sizes[size])
  const missing = !hasIcon(name)
  const nodes = missing ? iconNodes['circle-question-mark'] : iconNodes[name]
  const style = h.span.style({
    color:
      tone === 'muted'
        ? 'var(--muted-foreground)'
        : tone === 'primary'
          ? 'var(--primary)'
          : undefined,
    transform: rotation === undefined ? undefined : `rotate(${rotation}deg)`,
  }).elementAttrs.style
  return h
    .el('svg')
    .attrs({
      class: className,
      style,
      'data-slot': 'icon',
      'data-icon': dataIcon,
      'data-rotation': rotation === undefined ? undefined : String(rotation),
      'aria-hidden': ariaLabel === undefined ? 'true' : undefined,
      role: ariaLabel === undefined ? undefined : 'img',
      'aria-label': ariaLabel,
      'data-icon-missing': missing ? name : undefined,
      focusable: 'false',
      width: dimensions,
      height: dimensions,
      viewBox: '0 0 24 24',
      fill: filled ? 'currentColor' : 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })
    .children(
      nodes.map(([tag, attributes], index) =>
        h.el(tag).key(String(index)).attrs(attributes),
      ),
    )
}
