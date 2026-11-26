import type { Html } from '@effect/ui/html'

import { StatusDotBehavior, type StatusDotProps } from '../behaviors/status-dot'

const tailwind = {
  root: 'inline-flex size-2 shrink-0 items-center justify-center rounded-full bg-success text-[oklch(0.985_0_0)] data-[variant=warning]:bg-warning data-[variant=warning]:text-[oklch(0.205_0_0)] data-[variant=error]:bg-destructive data-[variant=accent]:bg-primary data-[variant=accent]:text-primary-foreground data-[variant=neutral]:bg-muted-foreground data-[variant=neutral]:text-background motion-safe:data-pulsing:animate-pulse [&>svg]:size-2',
}

export const StatusDot = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: StatusDotProps<NoInfer<Msg>, R> & { readonly className?: string },
  styles: typeof tailwind = tailwind,
) => {
  return StatusDotBehavior(h, options).class(styles.root, className)
}
