import type { Html } from '@effect/ui/html'

import { EmptyBehavior, type EmptyProps } from '../behaviors/empty'

const tailwind = {
  root: 'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12',
  header: 'flex max-w-sm flex-col items-center gap-2 text-center',
  media:
    'mb-2 flex shrink-0 items-center justify-center data-[variant=icon]:size-10 data-[variant=icon]:rounded-lg data-[variant=icon]:bg-muted data-[variant=icon]:text-foreground [&_svg]:pointer-events-none',
  title: 'm-0 text-lg font-medium tracking-tight',
  description:
    'text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
  content:
    'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
}

export const Empty = <Msg, R = never>(
  h: Html.H<Msg>,
  options: EmptyProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => EmptyBehavior(h, options, styles)
