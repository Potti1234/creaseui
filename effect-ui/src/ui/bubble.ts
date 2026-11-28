import type { Html } from '@effect/ui/html'

import { BubbleBehavior, BubbleGroupBehavior } from '../behaviors/bubble'

const tailwind = {
  root: 'relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 data-[align=end]:self-end data-[variant=ghost]:max-w-full',
  group: 'flex min-w-0 flex-col gap-2',
  content:
    'w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-start text-sm leading-relaxed wrap-break-word data-[variant=default]:bg-primary data-[variant=default]:text-primary-foreground data-[variant=secondary]:bg-secondary data-[variant=secondary]:text-secondary-foreground data-[variant=muted]:bg-muted data-[variant=tinted]:bg-primary/10 data-[variant=tinted]:text-foreground data-[variant=outline]:border-border data-[variant=outline]:bg-background data-[variant=ghost]:rounded-none data-[variant=ghost]:p-0 data-[variant=destructive]:bg-destructive/10 data-[variant=destructive]:text-destructive',
  reactions:
    'absolute z-10 inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-3 ring-card data-[align=start]:start-1 data-[align=end]:end-1 data-[side=top]:top-0 data-[side=top]:-translate-y-1/2 data-[side=bottom]:bottom-0 data-[side=bottom]:translate-y-1/2',
}
export const Bubble = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof BubbleBehavior<Msg, R>>[1],
  styles: typeof tailwind = tailwind,
) => BubbleBehavior(h, options, styles)
export const BubbleGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof BubbleGroupBehavior<Msg, R>>[1],
  styles: typeof tailwind = tailwind,
) => BubbleGroupBehavior(h, options, styles)
