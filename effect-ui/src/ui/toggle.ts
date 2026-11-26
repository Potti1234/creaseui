import type { Html } from '@effect/ui/html'

import { ToggleBehavior } from '../behaviors/toggle'

const tailwind = {
  control:
    'inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium whitespace-nowrap text-foreground outline-none transition-[color,background-color,box-shadow] hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-pressed:bg-accent data-pressed:text-accent-foreground data-[variant=outline]:border-input data-[variant=outline]:shadow-xs data-[size=sm]:h-8 data-[size=sm]:min-w-8 data-[size=sm]:px-1.5 data-[size=lg]:h-10 data-[size=lg]:min-w-10 data-[size=lg]:px-2.5 motion-reduce:transition-none',
}

export const Toggle = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    variant = 'default',
    size = 'default',
    className,
    ...options
  }: Parameters<typeof ToggleBehavior<Msg, R>>[1] & {
    readonly variant?: 'default' | 'outline'
    readonly size?: 'default' | 'sm' | 'lg'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  ToggleBehavior(h, options).class(styles.control, className).attrs({
    'data-slot': 'toggle',
    'data-variant': variant,
    'data-size': size,
  })
