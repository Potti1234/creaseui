import { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { BannerBehavior } from '../behaviors/banner'
import { IconBehavior, type IconName } from '../behaviors/icon'

type Options<Msg> = Parameters<typeof BannerBehavior<Msg>>[1]
type Status = 'info' | 'warning' | 'error' | 'success'
const iconName = {
  info: 'info',
  warning: 'triangle-alert',
  error: 'circle-alert',
  success: 'circle-check',
} satisfies Record<Status, IconName>

export type BannerProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly id: string
  readonly title: View.Input<Msg, R>
  readonly description?: View.Input<Msg, R>
  readonly status: Status
  readonly icon?: View.Input<Msg, R>
  readonly dismissible?: boolean
  readonly dismissLabel?: string
  readonly collapsible?: boolean
  readonly endContent?: View.Children<Msg, R>
  readonly children?: View.Children<Msg, R>
  readonly container?: 'card' | 'section'
  readonly elevation?: 'none' | 'low' | 'med' | 'high'
  readonly className?: string
}
const tailwind = {
  root: 'grid min-w-0 overflow-hidden rounded-md border bg-card text-sm text-card-foreground data-[container=section]:rounded-none data-[container=section]:border-x-0 data-[elevation=low]:shadow-sm data-[elevation=med]:shadow-md data-[elevation=high]:shadow-lg',
  header:
    'flex min-w-0 flex-wrap items-start gap-2 p-3 data-[status=info]:bg-primary/20 data-[status=warning]:bg-warning/20 data-[status=error]:bg-destructive/20 data-[status=success]:bg-success/20',
  icon: 'mt-0.5 shrink-0 data-[status=info]:text-primary data-[status=warning]:text-warning data-[status=error]:text-destructive data-[status=success]:text-success',
  body: 'grid min-w-34 flex-1 gap-0.5',
  title: 'font-semibold',
  description: 'text-muted-foreground',
  end: 'flex shrink-0 items-center gap-1',
  action:
    'inline-grid size-7 place-items-center rounded-sm border-0 bg-transparent text-foreground outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring',
  panel: 'min-w-0 p-3 data-ending-style:invisible',
}

export const Banner = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    title,
    description,
    status,
    icon,
    dismissible,
    dismissLabel = 'Dismiss banner',
    collapsible = true,
    endContent,
    children,
    container = 'card',
    elevation = 'none',
    className,
    ...options
  }: BannerProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  BannerBehavior(h, {
    ...options,
    props: options.props ?? {},
    key: options.key ?? id,
    view: ({ dismissed, root, dismiss, disclosure }) => {
      if (dismissed) return View.text('')
      const header = h.div
        .class(styles.header)
        .attrs({
          'data-slot': 'banner-header',
          'data-status': status,
          role: status === 'error' || status === 'warning' ? 'alert' : 'status',
        })
        .children(
          h.span
            .class(styles.icon)
            .attrs({ 'aria-hidden': 'true', 'data-status': status })
            .children(
              icon ?? IconBehavior(h, { name: iconName[status], size: 'sm' }),
            ),
          h.div.class(styles.body).children(
            h.div
              .class(styles.title)
              .attrs({ id: `${id}-title`, 'data-slot': 'banner-title' })
              .children(title),
            description === undefined
              ? undefined
              : h.div
                  .class(styles.description)
                  .attr('data-slot', 'banner-description')
                  .children(description),
          ),
          h.div.class(styles.end).children(
            endContent,
            collapsible && children !== undefined
              ? disclosure
                  .trigger(
                    h.button.class(styles.action).attrs({
                      'data-slot': 'banner-toggle',
                      'aria-label': disclosure.open ? 'Show less' : 'Show more',
                    }),
                  )
                  .children(
                    IconBehavior(h, {
                      name: disclosure.open ? 'chevron-up' : 'chevron-down',
                      size: 'sm',
                    }),
                  )
              : undefined,
            dismissible
              ? dismiss(
                  h.button.class(styles.action).attrs({
                    'data-slot': 'banner-dismiss',
                    'aria-label': dismissLabel,
                  }),
                ).children(IconBehavior(h, { name: 'x', size: 'sm' }))
              : undefined,
          ),
        )
      const panel = h.div
        .class(styles.panel)
        .attr('data-slot', 'banner-content')
      return root(
        h.section.class(styles.root, className).attrs({
          id,
          'aria-labelledby': `${id}-title`,
          'data-slot': 'banner',
          'data-container': container,
          'data-elevation': elevation,
        }),
      ).children(
        header,
        children === undefined
          ? undefined
          : collapsible
            ? disclosure.panel(panel)?.children(children)
            : panel.children(children),
      )
    },
  })
