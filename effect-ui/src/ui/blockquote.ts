import type { Html } from '@effect/ui/html'

import {
  BlockquoteBehavior,
  type BlockquoteProps,
} from '../behaviors/blockquote'

const tailwind = {
  root: 'm-0 border-s-2 border-border ps-4 break-words text-muted-foreground',
  cite: 'mt-2 block text-xs leading-5 not-italic',
}

export const Blockquote = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: BlockquoteProps<NoInfer<Msg>, R> & { readonly className?: string },
  styles: typeof tailwind = tailwind,
) => {
  return BlockquoteBehavior(h, options, styles.cite).class(
    styles.root,
    className,
  )
}
