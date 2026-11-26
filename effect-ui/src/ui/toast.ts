import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  ToastBehavior,
  TrackToastSwipe,
  type ToastItem,
} from '../behaviors/toast'
import { IconBehavior, type IconName } from '../behaviors/icon'
import './toast.css'

type Options<Msg> = Parameters<typeof ToastBehavior<Msg>>[1]
export type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
export type ToastProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly children: View.Children<Msg, R>
  readonly position?: ToastPosition
  readonly regionLabel?: string
  readonly closeLabel?: string
  readonly className?: string
  readonly stacked?: boolean
  readonly expanded?: boolean
  readonly swipeToDismiss?:
    | false
    | {
        readonly direction?: 'left' | 'right'
        readonly threshold?: number
      }
  readonly action?: (
    toast: ToastItem,
  ) => { readonly label: string; readonly onClick: Msg } | undefined
}

const icons: Readonly<Partial<Record<string, IconName>>> = {
  success: 'circle-check',
  error: 'circle-alert',
  warning: 'triangle-alert',
  info: 'info',
  loading: 'loader-circle',
}

const tailwind = {
  viewport: '',
  root: 'rounded-lg border bg-popover text-sm text-popover-foreground shadow-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
  content: 'flex items-start gap-2 p-3',
  text: 'min-w-0 flex-1',
  title: 'block font-medium',
  description: 'm-0 text-sm text-muted-foreground',
  icon: 'mt-0.5 shrink-0 text-primary data-[type=error]:text-destructive data-[type=warning]:text-warning data-[type=success]:text-success',
  button:
    'inline-flex min-h-6 shrink-0 items-center rounded-sm border-0 bg-transparent px-1 text-xs outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
}

export const Toast = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    children,
    position = 'bottom-end',
    regionLabel = 'Notifications',
    closeLabel = 'Dismiss notification',
    className,
    stacked = true,
    expanded = false,
    swipeToDismiss,
    action,
    ...options
  }: ToastProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  ToastBehavior(h, {
    ...options,
    view: stack => {
      const provider = h.div.attr('data-slot', 'toast-provider')
      return (
        swipeToDismiss === false
          ? provider
          : provider.attr('data-swipe-enabled', '').onMount(
              TrackToastSwipe({
                direction:
                  swipeToDismiss?.direction ??
                  (swipeToDismiss !== undefined || position.endsWith('center')
                    ? 'right'
                    : position.endsWith('start')
                      ? 'start'
                      : 'end'),
                threshold: Math.max(0, swipeToDismiss?.threshold ?? 40),
              }),
            )
      ).children(
        children,
        stack
          .viewport(
            h.div.class(styles.viewport, className).attrs({
              'data-slot': 'toast-viewport',
              'data-position': position,
              'data-stack-expanded': !stacked || expanded ? '' : undefined,
              'aria-label': regionLabel,
            }),
          )
          .children(
            stack.toasts.map(toast => {
              const glyph = icons[toast.type ?? '']
              const shortcut = action?.(toast)
              return stack
                .root({
                  element: h.div.class(styles.root).attr('data-slot', 'toast'),
                  toast,
                })
                .children(
                  stack
                    .content({
                      element: h.div
                        .class(styles.content)
                        .attr('data-slot', 'toast-content'),
                      toast,
                    })
                    .children(
                      glyph === undefined
                        ? undefined
                        : h.span
                            .class(styles.icon)
                            .attrs({
                              'data-slot': 'toast-icon',
                              'data-type': toast.type,
                              'aria-hidden': 'true',
                            })
                            .children(
                              IconBehavior(h, { name: glyph, size: 'sm' }),
                            ),
                      h.div.class(styles.text).children(
                        toast.title === undefined
                          ? undefined
                          : stack
                              .title({
                                element: h.strong.class(styles.title),
                                toast,
                              })
                              .children(toast.title),
                        toast.description === undefined
                          ? undefined
                          : stack
                              .description({
                                element: h.p.class(styles.description),
                                toast,
                              })
                              .children(toast.description),
                      ),
                      shortcut === undefined
                        ? undefined
                        : stack
                            .action({
                              element: h.button
                                .class(styles.button)
                                .on('click', shortcut.onClick),
                              toast,
                            })
                            .children(shortcut.label),
                      stack
                        .close({
                          element: h.button.class(styles.button).attrs({
                            'aria-label': closeLabel,
                            'data-toast-close': '',
                          }),
                          toast,
                        })
                        .children(IconBehavior(h, { name: 'x', size: 'sm' })),
                    ),
                )
            }),
          ),
      )
    },
  })
