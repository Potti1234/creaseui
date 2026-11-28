import type { Html } from '@effect/ui/html'

import { SkeletonBehavior, type SkeletonProps } from '../behaviors/skeleton'

const tailwind = {
  root: 'rounded-md bg-accent motion-safe:animate-pulse data-[shape=text]:rounded-sm data-[shape=circle]:rounded-full data-[size=sm]:h-3 data-[size=sm]:w-24 data-[size=md]:h-4 data-[size=md]:w-32 data-[size=lg]:size-12',
}

export const Skeleton = <Msg>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: SkeletonProps & { readonly className?: string } = {},
  styles: typeof tailwind = tailwind,
) => {
  return SkeletonBehavior(h, options).class(styles.root, className)
}
