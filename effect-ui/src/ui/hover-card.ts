import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  HoverCardBehavior,
  HoverCardButtonBehavior,
} from '../behaviors/hover-card'

type AnchorOptions<Msg> = Parameters<typeof HoverCardBehavior<Msg>>[1]
type ButtonOptions<Msg> = Parameters<typeof HoverCardButtonBehavior<Msg>>[1]
type Shared<Msg, R> = {
  readonly content: View.Input<Msg, R> | View.Children<Msg, R>
  readonly delay?: number
  readonly closeDelay?: number
  readonly className?: string
  readonly ariaLabel?: string
  readonly disabled?: boolean
}

const tailwind = {
  root: 'relative inline-flex',
  panel:
    'max-h-(--available-height) w-64 max-w-[min(var(--available-width),calc(100vw-2rem))] overflow-auto rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-md outline-none data-ending-style:invisible',
}

export const HoverCard = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Shared<NoInfer<Msg>, R> &
    (
      | (Omit<AnchorOptions<Msg>, 'view' | 'fallback'> & {
          readonly kind: 'link'
          readonly trigger: Html.Element<
            NoInfer<Msg>,
            R,
            Html.EventsOf<'a'>,
            HTMLAnchorElement,
            'a'
          >
        })
      | (Omit<ButtonOptions<Msg>, 'view' | 'fallback'> & {
          readonly kind?: 'button'
          readonly trigger: Html.Element<
            NoInfer<Msg>,
            R,
            Html.EventsOf<'button'>,
            HTMLButtonElement,
            'button'
          >
        })
    ),
  styles: typeof tailwind = tailwind,
) => {
  const {
    className,
    content,
    ariaLabel,
    delay = 300,
    closeDelay = 180,
    disabled,
  } = options
  const wrap = h.div.class(styles.root).attr('data-slot', 'hover-card')
  const panel = h.div
    .class(styles.panel, className)
    .attr('data-slot', 'hover-card-content')
  const triggerAttrs = {
    'data-slot': 'hover-card-trigger',
    'aria-label': ariaLabel,
  }
  if (options.kind === 'link') {
    const trigger = options.trigger.attrs(triggerAttrs)
    if (disabled) return wrap.children(trigger)
    return HoverCardBehavior(h, {
      ...options,
      view: card =>
        wrap.children(
          card.trigger({ element: trigger, delay, closeDelay }),
          card
            .portal(h.div)
            ?.children(
              card.backdrop(h.div),
              card
                .positioner(h.div)
                .children(card.popup(panel).children(content)),
            ),
        ),
    })
  }
  return HoverCardButtonBehavior(h, {
    ...options,
    view: card =>
      wrap.children(
        card.trigger({
          element: options.trigger.attrs(triggerAttrs),
          openOnHover: true,
          disabled,
          delay,
          closeDelay,
        }),
        card
          .portal(h.dialog.attr('aria-label', ariaLabel))
          ?.children(
            card.backdrop(h.div),
            card
              .positioner(h.div)
              .children(card.popup(panel).children(content)),
          ),
      ),
  })
}
