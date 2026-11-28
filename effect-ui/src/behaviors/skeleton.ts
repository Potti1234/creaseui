import type { Html } from '@effect/ui/html'

export type SkeletonProps = {
  readonly shape?: 'text' | 'rectangle' | 'circle'
  readonly size?: 'sm' | 'md' | 'lg'
}

export const SkeletonBehavior = <Msg>(
  h: Html.H<Msg>,
  { shape = 'rectangle', size }: SkeletonProps = {},
) =>
  h.div.attrs({
    'aria-hidden': 'true',
    'data-slot': 'skeleton',
    'data-shape': shape,
    'data-size': size,
  })
