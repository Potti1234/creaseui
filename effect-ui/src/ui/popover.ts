import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { PopoverBehavior } from '../behaviors/popover'

type PopoverOptions<Msg> = Parameters<typeof PopoverBehavior<Msg>>[1]

const tailwind = {
  popup:
    'z-50 w-max max-w-[calc(100vw-2rem)] origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition duration-200 ease-out data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none',
  title: 'm-0 text-sm leading-none font-semibold',
  description: 'm-0 text-sm text-muted-foreground',
}

export const Popover = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    title,
    description,
    ariaLabel = title,
    trigger,
    triggerOptions,
    content,
    className,
    direction,
    ...options
  }: Omit<PopoverOptions<Msg>, 'view' | 'fallback'> & {
    readonly title?: string
    readonly description?: string
    readonly ariaLabel?: string
    readonly trigger: Html.Element<
      NoInfer<Msg>,
      R,
      Html.EventsOf<'button'>,
      HTMLButtonElement,
      'button'
    >
    readonly triggerOptions?: {
      readonly openOnHover?: boolean
      readonly delay?: number
      readonly closeDelay?: number
      readonly disabled?: boolean
    }
    readonly content:
      | View.Input<NoInfer<Msg>, R>
      | View.Children<NoInfer<Msg>, R>
    readonly className?: string
    readonly direction?: 'ltr' | 'rtl'
  },
  styles: typeof tailwind = tailwind,
) =>
  PopoverBehavior(h, {
    ...options,
    view: popover =>
      h.div.attrs({ 'data-slot': 'popover', dir: direction }).children(
        popover.trigger({
          element: trigger.attr('data-popover-trigger', ''),
          ...triggerOptions,
        }),
        popover
          .portal(h.dialog.attr('aria-label', ariaLabel))
          ?.children(
            popover.backdrop(h.div),
            popover
              .positioner(h.div)
              .children(
                popover
                  .popup(
                    h.div
                      .class(
                        className
                          ? `${styles.popup} ${className}`
                          : styles.popup,
                      )
                      .attr('data-slot', 'popover-content'),
                  )
                  .children(
                    title === undefined
                      ? undefined
                      : popover.title(h.h2.class(styles.title)).children(title),
                    description === undefined
                      ? undefined
                      : popover
                          .description(h.p.class(styles.description))
                          .children(description),
                    content,
                  ),
              ),
          ),
      ),
  })
