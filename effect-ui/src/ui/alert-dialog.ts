import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { AlertDialogBehavior } from '../behaviors/alert-dialog'

type Options<Msg> = Parameters<typeof AlertDialogBehavior<Msg>>[1]

const tailwind = {
  backdrop:
    'fixed inset-0 bg-black/50 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none',
  viewport: 'fixed inset-0 grid place-items-center overflow-y-auto p-4',
  popup:
    'relative grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none transition-[opacity,scale] duration-200 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 data-[size=sm]:max-w-xs motion-reduce:transition-none',
  header: 'grid gap-1.5',
  title: 'text-lg font-semibold',
  description: 'text-sm text-muted-foreground',
  media:
    'mb-2 grid size-16 place-items-center rounded-md bg-muted data-[tone=destructive]:bg-destructive/10 data-[tone=destructive]:text-destructive',
  footer: 'flex flex-wrap justify-end gap-2',
  cancel:
    'h-9 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50',
  action:
    'h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 data-[tone=destructive]:bg-destructive data-[tone=destructive]:text-white',
}

export const AlertDialog = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    title,
    description,
    trigger,
    media,
    mediaVariant = 'muted',
    actionLabel,
    actionVariant = 'default',
    cancelLabel = 'Cancel',
    pendingLabel = actionLabel,
    pending = false,
    size = 'default',
    onAction,
    className,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly title: string
    readonly description: string
    readonly trigger?: Html.Element<
      NoInfer<Msg>,
      R,
      Html.EventsOf<'button'>,
      HTMLButtonElement,
      'button'
    >
    readonly media?: View.Children<NoInfer<Msg>, R>
    readonly mediaVariant?: 'muted' | 'destructive'
    readonly actionLabel: string
    readonly actionVariant?: 'default' | 'destructive'
    readonly cancelLabel?: string
    readonly pendingLabel?: string
    readonly pending?: boolean
    readonly size?: 'default' | 'sm'
    readonly onAction: NoInfer<Msg>
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  AlertDialogBehavior(h, {
    ...options,
    view: alert =>
      h.div(
        trigger === undefined ? undefined : alert.trigger(trigger),
        alert.portal(h.dialog.attr('data-slot', 'alert-dialog'))?.children(
          alert.backdrop(h.div.class(styles.backdrop)),
          alert.viewport(h.div.class(styles.viewport)).children(
            alert
              .popup(
                h.div.class(styles.popup, className).attrs({
                  'data-slot': 'alert-dialog-content',
                  'data-size': size,
                  'aria-busy': pending ? 'true' : undefined,
                }),
              )
              .children(
                h.div.class(styles.header).children(
                  media === undefined
                    ? undefined
                    : h.div
                        .class(styles.media)
                        .attrs({
                          'data-slot': 'alert-dialog-media',
                          'data-tone': mediaVariant,
                        })
                        .children(media),
                  alert.title(h.h2.class(styles.title)).children(title),
                  alert
                    .description(h.p.class(styles.description))
                    .children(description),
                ),
                h.div.class(styles.footer).children(
                  alert
                    .initialFocus(
                      alert
                        .close(h.button.class(styles.cancel))
                        .disabled(pending),
                    )
                    .children(cancelLabel),
                  h.button
                    .class(styles.action)
                    .attrs({ type: 'button', 'data-tone': actionVariant })
                    .disabled(pending)
                    .on('click', onAction)
                    .children(pending ? pendingLabel : actionLabel),
                ),
              ),
          ),
        ),
      ),
  })
