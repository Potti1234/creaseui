import type { Html } from '@effect/ui/html'
import { StatBehavior, type StatProps } from '../behaviors/stat'

const tailwind = {
  root: 'flex min-w-0 flex-col items-start gap-1',
  label: 'text-xs leading-5 font-medium text-muted-foreground',
  line: 'flex min-w-0 flex-wrap items-baseline gap-2',
  value:
    'font-semibold text-foreground tabular-nums leading-[1.4] data-[size=sm]:text-xl data-[size=md]:text-2xl data-[size=lg]:text-3xl',
  delta:
    'inline-flex items-center gap-1 text-xs leading-5 font-medium tabular-nums whitespace-nowrap text-muted-foreground data-[sentiment=positive]:text-success data-[sentiment=negative]:text-destructive',
  description: 'text-xs leading-5 text-muted-foreground',
  media: 'mt-1 w-full',
}
export const Stat = <Msg, R = never>(
  h: Html.H<Msg>,
  options: StatProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => StatBehavior(h, options, styles)
