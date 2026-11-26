import type { Html } from '@effect/ui/html'

import { BadgeBehavior, type BadgeProps } from '../behaviors/badge'

const tailwind = {
  root: 'inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-full border border-transparent bg-primary px-2 text-xs font-medium whitespace-nowrap text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[variant=secondary]:bg-secondary data-[variant=secondary]:text-secondary-foreground data-[variant=destructive]:bg-destructive/10 data-[variant=destructive]:text-destructive data-[variant=outline]:border-border data-[variant=outline]:bg-transparent data-[variant=outline]:text-foreground data-[variant=ghost]:bg-transparent data-[variant=ghost]:text-foreground data-[variant=ghost]:hover:bg-muted data-[variant=link]:bg-transparent data-[variant=link]:text-primary data-[variant=link]:hover:underline',
}

export const Badge = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: BadgeProps<NoInfer<Msg>, R> & { readonly className?: string },
  styles: typeof tailwind = tailwind,
) => {
  return BadgeBehavior(h, options).class(styles.root, className)
}
