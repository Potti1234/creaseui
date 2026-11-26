import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import type { ButtonElement } from '@effect/ui-kit'

import { TooltipBehavior } from '../behaviors/tooltip'

type TooltipOptions<Msg> = Parameters<typeof TooltipBehavior<Msg>>[1]
type TooltipTrigger<Msg, R> =
  | ButtonElement<Msg, R>
  | Html.Element<Msg, R, Html.EventsOf<'a'>, HTMLAnchorElement, 'a'>

const tailwind = {
  root: 'inline-block',
  positioner:
    'm-0 w-max overflow-visible border-0 bg-transparent p-0 data-anchor-hidden:invisible',
  popup:
    'relative max-w-[min(18rem,calc(100vw-1rem))] origin-(--transform-origin) rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground',
  arrow:
    'size-2 rotate-45 rounded-xs bg-primary data-[side=top]:-bottom-1 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1',
}

export const Tooltip = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    trigger,
    content,
    showArrow = true,
    className,
    ...options
  }: Omit<TooltipOptions<Msg>, 'view' | 'fallback'> & {
    readonly trigger: TooltipTrigger<NoInfer<Msg>, R>
    readonly content:
      | View.Input<NoInfer<Msg>, R>
      | View.Children<NoInfer<Msg>, R>
    readonly showArrow?: boolean
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  TooltipBehavior(h, {
    ...options,
    view: tooltip =>
      h.div
        .class(styles.root)
        .attr('data-slot', 'tooltip')
        .children(
          tooltip.trigger(trigger.attr('data-slot', 'tooltip-trigger')),
          tooltip
            .positioner(h.div.class(styles.positioner))
            .children(
              tooltip
                .popup(
                  h.div
                    .class(styles.popup, className)
                    .attr('data-slot', 'tooltip-content'),
                )
                .children(
                  showArrow
                    ? tooltip.arrow(h.div.class(styles.arrow))
                    : undefined,
                  content,
                ),
            ),
        ),
  })
