import type { Html } from '@effect/ui/html'

export type SpinnerProps = (
  | { readonly isDecorative: true; readonly label?: never }
  | { readonly isDecorative?: false; readonly label: string }
) & {
  readonly size?: 'sm' | 'md' | 'lg' | 'xl'
  readonly tone?: 'current' | 'muted' | 'primary'
  readonly dataIcon?: 'inline-start' | 'inline-end'
}

export const SpinnerBehavior = <Msg>(
  h: Html.H<Msg>,
  {
    isDecorative,
    label,
    size = 'md',
    tone = 'current',
    dataIcon,
  }: SpinnerProps,
) =>
  h.span.attrs({
    role: isDecorative ? undefined : 'img',
    'aria-label': label,
    'aria-hidden': isDecorative ? 'true' : undefined,
    'data-slot': 'spinner',
    'data-size': size,
    'data-tone': tone,
    'data-icon': dataIcon,
  })
