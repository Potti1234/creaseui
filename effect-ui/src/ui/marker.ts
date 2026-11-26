import type { Html } from '@effect/ui/html'
import { MarkerBehavior, type MarkerProps } from '../behaviors/marker'

const tailwind = {
  root: 'relative flex min-h-4 w-full items-center gap-2 text-start text-sm text-muted-foreground data-[variant=border]:border-b data-[variant=border]:pb-2 [&>a]:underline [&>button]:cursor-pointer [&>button]:text-inherit',
  icon: 'size-4 shrink-0',
  content:
    'inline-flex min-w-0 items-center gap-2 wrap-break-word data-[variant=separator]:text-center data-shimmer:animate-pulse motion-reduce:animate-none',
  line: 'h-px min-w-0 flex-1 bg-border',
}
export const Marker = <Msg, R = never>(
  h: Html.H<Msg>,
  options: MarkerProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => MarkerBehavior(h, options, styles)
