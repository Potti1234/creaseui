import type { Html } from '@effect/ui/html'

import {
  AspectRatioBehavior,
  type AspectRatioProps,
} from '../behaviors/aspect-ratio'

const tailwind = { root: 'relative w-full' }

export const AspectRatio = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: AspectRatioProps<NoInfer<Msg>, R> & { readonly className?: string },
  styles: typeof tailwind = tailwind,
) => {
  return AspectRatioBehavior(h, options).class(styles.root, className)
}
