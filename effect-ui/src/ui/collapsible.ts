import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import type { ButtonElement } from '@effect/ui-kit'

import { CollapsibleBehavior } from '../behaviors/collapsible'

type Options<Msg> = Parameters<typeof CollapsibleBehavior<Msg>>[1]

const tailwind = {
  panel:
    'h-(--collapsible-panel-height) transition-[height] duration-200 data-starting-style:h-0 data-starting-style:overflow-hidden data-ending-style:h-0 data-ending-style:overflow-hidden data-[css-hidden]:hidden motion-reduce:transition-none',
}

export const Collapsible = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    trigger,
    content,
    id,
    className,
    contentClass,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly trigger: ButtonElement<NoInfer<Msg>, R>
    readonly content:
      | View.Input<NoInfer<Msg>, R>
      | View.Children<NoInfer<Msg>, R>
    readonly id?: string
    readonly className?: string
    readonly contentClass?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  CollapsibleBehavior(h, {
    ...options,
    view: collapsible =>
      collapsible
        .root(h.div.class(className).attr('data-slot', 'collapsible'))
        .children(
          collapsible.trigger(trigger.attr('data-slot', 'collapsible-trigger')),
          collapsible
            .panel(
              h.div.class(styles.panel).attrs({
                id,
                'data-slot': 'collapsible-content',
                'data-css-hidden':
                  options.props?.keepMounted === 'css' &&
                  !options.props.hiddenUntilFound &&
                  !collapsible.mounted
                    ? ''
                    : undefined,
              }),
            )
            ?.children(h.div.class(contentClass).children(content)),
        ),
  })
