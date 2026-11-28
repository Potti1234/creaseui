import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { ContextMenuBehavior } from '../behaviors/context-menu'
import { MenuPopup, menuStyles, type MenuUiOptions } from './dropdown-menu'

type Options<Msg> = Parameters<typeof ContextMenuBehavior<Msg>>[1]

export const ContextMenu = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    trigger,
    triggerLabel,
    triggerId,
    triggerClassName,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> &
    MenuUiOptions<NoInfer<Msg>, R> & {
      readonly trigger: View.Input<NoInfer<Msg>, R>
      readonly triggerLabel?: string
      readonly triggerId?: string
      readonly triggerClassName?: string
    },
  styles: typeof menuStyles = menuStyles,
) =>
  ContextMenuBehavior(h, {
    ...options,
    view: menu =>
      h.div.attr('dir', options.direction).children(
        menu
          .trigger(
            h.div.class(triggerClassName ?? styles.contextTrigger).attrs({
              id: triggerId,
              'data-slot': 'context-menu-trigger',
              'aria-label': triggerLabel,
              tabindex: '0',
            }),
          )
          .children(trigger),
        MenuPopup(h, menu, options.props.items, options, styles),
      ),
  })
