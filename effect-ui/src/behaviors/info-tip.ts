import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { IconBehavior } from './icon'
import { FocusPopoverBehavior } from './focus-popover'

type Options<Msg> = Parameters<typeof FocusPopoverBehavior<Msg>>[1]
export type InfoTipProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly content: View.Input<Msg, R> | View.Children<Msg, R>
  readonly label?: string
  readonly size?: 'xsm' | 'sm' | 'md' | 'lg'
  readonly className?: string
}
type Classes = Partial<Record<'root' | 'trigger' | 'panel' | 'arrow', string>>

export const InfoTipBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    content,
    label = 'More information',
    size = 'sm',
    className,
    ...options
  }: InfoTipProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  FocusPopoverBehavior(h, {
    ...options,
    props: {
      side: 'top',
      sideOffset: 6,
      initialFocus: false,
      ...options.props,
    },
    view: tip =>
      tip
        .focusScope(h.span.class(styles.root).attr('data-slot', 'info-tip'))
        .children(
          tip.trigger({
            element: h.button
              .class(styles.trigger, className)
              .attrs({
                'data-slot': 'info-tip-trigger',
                'data-focus-popover-trigger': '',
                'aria-label': label,
                'data-size': size,
              })
              .children(IconBehavior(h, { name: 'info' })),
            openOnHover: true,
            delay: 180,
            closeDelay: 100,
          }),
          tip
            .portal(h.dialog.attr('aria-label', label))
            ?.children(
              tip
                .positioner(h.div)
                .children(
                  tip
                    .popup(
                      h.div
                        .class(styles.panel)
                        .attr('data-slot', 'info-tip-content'),
                    )
                    .children(tip.arrow(h.div.class(styles.arrow)), content),
                ),
            ),
        ),
  })
