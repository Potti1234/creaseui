import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { DialogBehavior } from '../behaviors/dialog'
import { IconBehavior } from '../behaviors/icon'

type DialogOptions<Msg> = Parameters<typeof DialogBehavior<Msg>>[1]
const tailwind = {
  backdrop:
    'fixed inset-0 bg-black/50 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none',
  viewport: 'fixed inset-0 grid place-items-center overflow-y-auto p-4',
  popup:
    'relative grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none transition-[opacity,scale] duration-200 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none',
  title: 'pr-14 text-lg leading-none font-semibold',
  description: 'text-sm text-muted-foreground',
  close:
    'absolute top-4 right-4 cursor-pointer rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2',
}

export const Dialog = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    title,
    description,
    trigger,
    content,
    className,
    showCloseButton = true,
    ...options
  }: Omit<DialogOptions<Msg>, 'view' | 'fallback'> & {
    readonly title: string
    readonly description?: string
    readonly trigger: Html.Element<
      NoInfer<Msg>,
      R,
      Html.EventsOf<'button'>,
      HTMLButtonElement,
      'button'
    >
    readonly content?:
      | View.Input<NoInfer<Msg>, R>
      | View.Children<NoInfer<Msg>, R>
    readonly className?: string
    readonly showCloseButton?: boolean
  },
  styles: typeof tailwind = tailwind,
) =>
  DialogBehavior(h, {
    ...options,
    view: dialog =>
      h.div(
        dialog.trigger(trigger),
        dialog.portal(h.dialog.attr('data-slot', 'dialog'))?.children(
          dialog.backdrop(h.div.class(styles.backdrop)),
          dialog.viewport(h.div.class(styles.viewport)).children(
            dialog.popup(h.div.class(styles.popup, className)).children(
              h.div
                .class('flex flex-col gap-2 text-center sm:text-left')
                .attr('data-slot', 'dialog-header')
                .children(
                  dialog
                    .title(
                      h.h2
                        .class(styles.title)
                        .attr('data-slot', 'dialog-title'),
                    )
                    .children(title),
                  description === undefined
                    ? undefined
                    : dialog
                        .description(h.p.class(styles.description))
                        .children(description),
                ),
              content,
              dialog
                .close(
                  h.button
                    .class(styles.close)
                    .attr('data-slot', 'dialog-close'),
                )
                .children(IconBehavior(h, { name: 'x', size: 'sm' })),
            ),
          ),
        ),
      ),
  })
