import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { MessageScrollerBehavior } from '../behaviors/message-scroller'
import { ScrollAreaBehavior } from '../behaviors/scroll-area'
import { IconBehavior } from '../behaviors/icon'

type Options<Msg> = Parameters<typeof MessageScrollerBehavior<Msg>>[1]
export type MessageScrollerProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly id: string
  readonly label?: string
  readonly edge?: 'start' | 'end' | 'both'
  readonly startLabel?: string
  readonly endLabel?: string
  readonly newContentLabel?: string
  readonly live?: 'off' | 'polite'
  readonly children: View.Children<Msg, R>
  readonly height?: string
  readonly className?: string
}
const tailwind = {
  root: 'relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden',
  scrollArea: 'min-h-0 flex-1',
  viewport:
    'h-full min-w-0 overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-pending:invisible',
  content: 'flex min-h-full min-w-0 flex-col gap-4',
  button:
    'absolute left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-foreground shadow-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[scroll-edge=start]:top-2 data-[scroll-edge=end]:bottom-2',
}

export const MessageScroller = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    label = 'Messages',
    edge = 'end',
    startLabel = 'Jump to start',
    endLabel = 'Jump to latest',
    newContentLabel = 'New messages',
    live = 'off',
    height,
    children,
    className,
    ...options
  }: MessageScrollerProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  MessageScrollerBehavior(h, {
    ...options,
    key: options.key ?? id,
    view: state =>
      state
        .root(
          h.div
            .class(styles.root, className)
            .attrs({ 'data-slot': 'message-scroller', id })
            .style({ height }),
        )
        .children(
          ScrollAreaBehavior(h, {
            props: {},
            view: scroll =>
              scroll.root(h.div.class(styles.scrollArea)).children(
                scroll
                  .viewport(
                    h.div
                      .class(styles.viewport)
                      .attrs({
                        'data-slot': 'message-scroller-viewport',
                        'aria-label': label,
                        'aria-live': live,
                        'data-pending':
                          !state.ready && options.props?.startAtEnd !== false
                            ? ''
                            : undefined,
                        'data-new-messages': state.hasNew ? '' : undefined,
                        role: live === 'polite' ? 'log' : 'region',
                      })
                      .style({
                        overflowX: 'hidden !important',
                        overflowY: 'auto !important',
                      }),
                  )
                  .children(
                    scroll
                      .content(
                        h.div
                          .class(styles.content)
                          .attr('data-slot', 'message-scroller-content'),
                      )
                      .children(children),
                  ),
              ),
          }),
          !state.ready || state.atStart || edge === 'end'
            ? undefined
            : h.button
                .class(styles.button)
                .attrs({
                  'data-scroll-edge': 'start',
                  'aria-label': startLabel,
                  type: 'button',
                })
                .children(IconBehavior(h, { name: 'arrow-up', size: 'xs' })),
          !state.ready || state.atEnd || edge === 'start'
            ? undefined
            : h.button
                .class(styles.button)
                .attrs({
                  'data-scroll-edge': 'end',
                  'aria-label': endLabel,
                  type: 'button',
                })
                .children(
                  IconBehavior(h, { name: 'arrow-down', size: 'xs' }),
                  state.hasNew ? newContentLabel : undefined,
                ),
        ),
  })
