import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type StatusDotProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly variant: 'success' | 'warning' | 'error' | 'accent' | 'neutral'
  readonly label: string
  readonly pulsing?: boolean
}

export const StatusDotBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { children, label, pulsing, variant }: StatusDotProps<NoInfer<Msg>, R>,
) =>
  h.span
    .attrs({
      role: 'img',
      'aria-label': label,
      'data-slot': 'status-dot',
      'data-variant': variant,
      'data-pulsing': pulsing ? '' : undefined,
    })
    .children(children)
