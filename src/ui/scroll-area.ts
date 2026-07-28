import { type Html, html } from 'foldkit/html'

import { cn } from '@/lib/utils'

/* CSS-only adaptation of shadcn's scroll-area viewport.

   PORT NOTE: Radix's custom scrollbar tracks, thumbs, and corner are not
   ported. This version uses the browser's native scrollbars. */

export type ScrollAreaProps = Readonly<{
  class?: string
  children: ReadonlyArray<Html | string>
}>

export const scrollArea = <Msg>(props: ScrollAreaProps): Html => {
  const h = html<Msg>()

  return h.div(
    [
      h.DataAttribute('slot', 'scroll-area'),
      h.Class(
        cn(
          'relative size-full overflow-auto rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1',
          props.class,
        ),
      ),
    ],
    [...props.children],
  )
}
