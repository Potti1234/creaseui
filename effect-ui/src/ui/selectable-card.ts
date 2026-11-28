import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { SelectableCardBehavior } from '../behaviors/selectable-card'
import './selectable-card.css'

type Options<Msg> = Parameters<typeof SelectableCardBehavior<Msg>>[1]
const colors = {
  default: 'var(--ring)',
  transparent: 'var(--ring)',
  muted: 'var(--ring)',
  blue: 'var(--chart-3)',
  cyan: 'var(--chart-2)',
  gray: 'var(--muted-foreground)',
  green: 'var(--chart-2)',
  orange: 'var(--chart-5)',
  pink: 'var(--chart-1)',
  purple: 'var(--chart-3)',
  red: 'var(--destructive)',
  teal: 'var(--chart-2)',
  yellow: 'var(--chart-4)',
}
const shadows = {
  none: '0 0 0 transparent',
  low: '0 1px 2px rgb(0 0 0 / 7%)',
  medium: '0 4px 9px rgb(0 0 0 / 10%)',
  high: '0 10px 22px rgb(0 0 0 / 14%)',
}

export type SelectableCardProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly label: string
  readonly children?: View.Children<Msg, R>
  readonly padding?: number
  readonly variant?: keyof typeof colors
  readonly elevation?: keyof typeof shadows
  readonly width?: string
  readonly height?: string
  readonly maxWidth?: string
  readonly minHeight?: string
  readonly className?: string
}

const tailwind = {
  root: 'relative isolate min-w-0 rounded-xl border bg-card text-card-foreground data-disabled:opacity-50',
  control:
    'absolute inset-0 z-10 cursor-pointer rounded-[inherit] border-0 bg-transparent outline-none enabled:hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default',
  content: 'relative min-w-0',
}

export const SelectableCard = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    children,
    padding = 4,
    variant = 'default',
    elevation = 'none',
    width,
    height,
    maxWidth,
    minHeight,
    className,
    ...options
  }: SelectableCardProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  SelectableCardBehavior(h, {
    ...options,
    view: checkbox =>
      h.div
        .class(styles.root, className)
        .attrs({
          'data-slot': 'selectable-card',
          'data-selected': String(checkbox.checked),
          'data-disabled': options.props?.disabled ? '' : undefined,
          'data-variant': variant,
        })
        .style({
          padding: `${Math.max(0, padding) * 4}px`,
          width,
          height,
          maxWidth,
          minHeight,
          backgroundColor:
            variant === 'transparent'
              ? 'transparent'
              : variant === 'muted'
                ? 'var(--muted)'
                : variant === 'default'
                  ? undefined
                  : `color-mix(in oklab, ${colors[variant]} 9%, var(--card))`,
          borderColor: checkbox.checked ? colors[variant] : undefined,
          boxShadow: checkbox.checked
            ? `inset 0 0 0 2px ${colors[variant]}, ${shadows[elevation]}`
            : shadows[elevation],
        })
        .children(
          checkbox.root(
            h.button
              .class(styles.control)
              .attrs({
                'data-slot': 'selectable-card-control',
                'aria-label': label,
              }),
          ),
          h.div
            .class(styles.content)
            .attr('data-slot', 'selectable-card-body')
            .children(children),
        ),
  })
