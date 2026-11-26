import type { Html } from '@effect/ui/html'

import { SpinnerBehavior, type SpinnerProps } from '../behaviors/spinner'

const tailwind = {
  root: 'inline-block size-4 shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin data-[size=sm]:size-3 data-[size=lg]:size-6 data-[size=xl]:size-8 data-[tone=muted]:text-muted-foreground data-[tone=primary]:text-primary',
}

export const Spinner = <Msg>(
  h: Html.H<Msg>,
  { className, ...options }: SpinnerProps & { readonly className?: string },
  styles: typeof tailwind = tailwind,
) => {
  return SpinnerBehavior(h, options).class(styles.root, className)
}
