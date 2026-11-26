import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { ScrollAreaBehavior } from '../behaviors/scroll-area'

type Options<Msg> = Parameters<typeof ScrollAreaBehavior<Msg>>[1]
type Axis = 'vertical' | 'horizontal' | 'both'

const tailwind = {
  root: 'relative size-full min-h-0 min-w-0 rounded-[inherit]',
  viewport:
    'size-full rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
  content: 'min-h-full',
  scrollbar:
    'z-10 grid p-px data-[orientation=vertical]:w-2 data-[orientation=horizontal]:h-2',
  thumb: 'rounded-full bg-border',
  corner: 'bg-background',
}

export const ScrollArea = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    orientation = 'both',
    direction,
    ariaLabel,
    tabIndex,
    keepScrollbarsMounted,
    className,
    children,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly orientation?: Axis
    readonly direction?: 'ltr' | 'rtl'
    readonly ariaLabel?: string
    readonly tabIndex?: number
    readonly keepScrollbarsMounted?: boolean
    readonly className?: string
    readonly children?: View.Children<NoInfer<Msg>, R>
  },
  styles: typeof tailwind = tailwind,
) =>
  ScrollAreaBehavior(h, {
    ...options,
    view: scroll => {
      const scrollbar = (axis: Exclude<Axis, 'both'>) =>
        scroll.scrollbar({
          element: h.div
            .class(styles.scrollbar)
            .attr('data-slot', 'scroll-area-scrollbar'),
          thumb: h.div
            .class(styles.thumb)
            .attr('data-slot', 'scroll-area-thumb'),
          orientation: axis,
          keepMounted: keepScrollbarsMounted,
        })
      // The kit appends an inline overflow shorthand for its custom scrollbars.
      // Keep the inactive axis hidden while retaining that default on the active axis.
      const viewport = scroll.viewport(
        h.div
          .class(styles.viewport)
          .attrs({
            'data-slot': 'scroll-area-viewport',
            'aria-label': ariaLabel,
            role: ariaLabel === undefined ? undefined : 'region',
          })
          .style({
            overflowX:
              orientation === 'vertical' ? 'hidden !important' : undefined,
            overflowY:
              orientation === 'horizontal' ? 'hidden !important' : undefined,
          }),
      )
      return scroll
        .root(
          h.div.class(styles.root, className).attrs({
            'data-slot': 'scroll-area',
            'data-orientation': orientation,
            dir: direction,
          }),
        )
        .children(
          viewport
            .attr(
              'tabindex',
              tabIndex === undefined
                ? viewport.elementAttrs.tabindex
                : String(tabIndex),
            )
            .children(
              scroll
                .content(
                  h.div
                    .class(styles.content)
                    .attr('data-slot', 'scroll-area-content'),
                )
                .children(children),
            ),
          orientation === 'horizontal' ? undefined : scrollbar('vertical'),
          orientation === 'vertical' ? undefined : scrollbar('horizontal'),
          orientation === 'both'
            ? scroll.corner(
                h.div
                  .class(styles.corner)
                  .attr('data-slot', 'scroll-area-corner'),
              )
            : undefined,
        )
    },
  })
