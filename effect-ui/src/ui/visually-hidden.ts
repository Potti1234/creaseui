import { Html } from '@effect/ui/html'

import {
  VisuallyHiddenBehavior,
  type VisuallyHiddenProps,
} from '../behaviors/visually-hidden'

const tailwind = {
  root: 'sr-only top-0 start-0 pointer-events-none select-none',
}

export const VisuallyHidden = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: VisuallyHiddenProps<NoInfer<Msg>, R> & { readonly className?: string },
  styles: typeof tailwind = tailwind,
) => {
  return VisuallyHiddenBehavior(
    h,
    options,
    Html.classNames(styles.root, className),
  )
}
