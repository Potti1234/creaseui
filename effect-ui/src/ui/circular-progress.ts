import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { CircularProgressBehavior } from '../behaviors/circular-progress'

const sizes = { sm: [32, 3], md: [48, 4], lg: [64, 5] } as const
const colors = {
  accent: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--destructive)',
  neutral: 'var(--muted-foreground)',
}
const tailwind = {
  root: 'inline-flex flex-col items-center gap-1 data-disabled:opacity-60',
  ring: 'relative grid place-items-center',
  svg: 'block -rotate-90 motion-safe:data-indeterminate:animate-spin',
  fill: 'transition-[stroke-dasharray] motion-reduce:transition-none',
  caption: 'text-sm',
  value:
    'absolute inset-0 grid place-items-center text-xs font-medium tabular-nums',
}

export type CircularProgressProps<Msg, R = never> = {
  readonly value?: number | null
  readonly max?: number
  readonly label: string
  readonly showLabel?: boolean
  readonly showValue?: boolean
  readonly size?: keyof typeof sizes
  readonly variant?: keyof typeof colors
  readonly disabled?: boolean
  readonly formatValue?: (value: number, max: number) => string
  readonly children?: View.Children<Msg, R>
  readonly id?: string
  readonly key?: string
  readonly className?: string
}

const asPercentage = (value: number, max: number) =>
  `${Math.round((value / max) * 100)}%`

export const CircularProgress = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    value = 0,
    max = 100,
    label,
    showLabel,
    showValue,
    size = 'md',
    variant = 'accent',
    disabled,
    formatValue = asPercentage,
    children,
    id,
    key = id,
    className,
  }: CircularProgressProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const [diameter, brush] = sizes[size]
  const center = String(diameter / 2)
  const color = colors[disabled ? 'neutral' : variant]
  const safeMax = max > 0 && Number.isFinite(max) ? max : 100
  const bounded =
    value === null
      ? null
      : Number.isFinite(value)
        ? Math.max(0, Math.min(value, safeMax))
        : 0
  const display = bounded === null ? undefined : formatValue(bounded, safeMax)
  const circleAttrs = {
    cx: center,
    cy: center,
    r: String((diameter - brush) / 2),
    fill: 'none',
    'stroke-width': String(brush),
    pathLength: '100',
  }
  return CircularProgressBehavior(h, {
    key,
    props: { max: safeMax, value: bounded, valueText: display },
    view: progress =>
      progress
        .root(
          h.div.class(styles.root, className).attrs({
            id,
            'data-slot': 'circular-progress',
            'aria-label': showLabel ? undefined : label,
            'data-disabled': disabled ? '' : undefined,
          }),
        )
        .children(
          h.div.class(styles.ring).children(
            h
              .el('svg')
              .attrs({
                class: styles.svg,
                width: String(diameter),
                height: String(diameter),
                viewBox: `0 0 ${diameter} ${diameter}`,
                'aria-hidden': 'true',
                'data-indeterminate': bounded === null ? '' : undefined,
              })
              .children(
                h
                  .el('circle')
                  .attrs({
                    ...circleAttrs,
                    'data-slot': 'circular-progress-track',
                    stroke: color,
                    opacity: '0.2',
                  }),
                h.el('circle').attrs({
                  ...circleAttrs,
                  class: styles.fill,
                  'data-slot': 'circular-progress-fill',
                  stroke: color,
                  'stroke-linecap': 'round',
                  'stroke-dasharray': `${bounded === null ? 28 : (bounded / safeMax) * 100} 100`,
                  opacity: bounded === 0 ? '0' : undefined,
                }),
              ),
            children !== undefined && children.length > 0
              ? h.span.class(styles.value).children(children)
              : showValue && display !== undefined
                ? h.span
                    .class(styles.value)
                    .attr('aria-hidden', 'true')
                    .children(display)
                : undefined,
          ),
          showLabel
            ? progress.label(h.span.class(styles.caption)).children(label)
            : undefined,
        ),
  })
}
