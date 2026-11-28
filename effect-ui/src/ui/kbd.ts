import type { Html } from '@effect/ui/html'

import { KbdBehavior, type KbdProps } from '../behaviors/kbd'

const tailwind = {
  root: 'pointer-events-none inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none',
  group: 'inline-flex items-center gap-1',
}

export const Kbd = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: KbdProps<NoInfer<Msg>, R> & { readonly className?: string },
  styles: typeof tailwind = tailwind,
) => {
  return KbdBehavior(h, options).class(
    options.group ? styles.group : styles.root,
    className,
  )
}
