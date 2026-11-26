import type { Html } from '@effect/ui/html'

import { CenterBehavior, type CenterProps } from '../behaviors/center'

export const Center = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: CenterProps<NoInfer<Msg>, R> & { readonly className?: string } = {},
) => CenterBehavior(h, options).class(className)
