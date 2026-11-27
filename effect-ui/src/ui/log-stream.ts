import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { logStreamColumns, type LogEntry } from '../behaviors/log-stream'
import { CollapsibleBehavior } from '../behaviors/collapsible'
import { MessageScroller, type MessageScrollerProps } from './message-scroller'

export type LogStreamProps<Msg, R = never> = Omit<
  MessageScrollerProps<Msg, R>,
  'children' | 'live' | 'height' | 'maxHeight' | 'newContentLabel' | 'endLabel'
> & {
  readonly entries: readonly LogEntry[]
  readonly variant?: 'default' | 'terminal'
  readonly maxHeight?: number | string
  readonly timestamps?: boolean
  readonly renderEntry?: (entry: LogEntry) => View.Input<Msg, R>
}

const tailwind = {
  root: 'overflow-hidden rounded-lg border bg-card font-mono text-sm text-card-foreground data-[variant=terminal]:border-neutral-800 data-[variant=terminal]:bg-neutral-950 data-[variant=terminal]:text-neutral-100',
  row: 'grid w-full min-w-0 items-baseline gap-x-3 border-0 border-b border-current/10 bg-transparent px-3 py-1 text-start leading-[1.7] text-inherit data-[variant=terminal]:border-b-0 data-[variant=terminal]:py-px',
  expander:
    'cursor-pointer hover:bg-current/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-open:bg-current/5',
  timestamp: 'whitespace-nowrap tabular-nums opacity-70',
  level:
    'font-semibold tracking-wide uppercase data-[level=warn]:text-warning data-[level=error]:text-destructive data-[level=debug]:opacity-60',
  source: 'truncate opacity-70',
  message: 'min-w-0 wrap-break-word whitespace-pre-wrap',
  details:
    'm-0 border-b border-current/10 px-2 py-1 text-xs wrap-break-word whitespace-pre-wrap opacity-85 data-ending-style:invisible',
}

export const LogStream = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label = 'Log stream',
    maxHeight = 320,
    entries,
    variant = 'default',
    timestamps = true,
    renderEntry,
    className,
    ...options
  }: LogStreamProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
  renderScroller: typeof MessageScroller = MessageScroller,
) => {
  const hasSource = entries.some(entry => entry.source !== undefined)
  const columns = logStreamColumns(timestamps, hasSource)
  const cells = (entry: LogEntry) => [
    timestamps
      ? h.time.class(styles.timestamp).children(entry.timestamp)
      : undefined,
    h.span
      .class(styles.level)
      .attr('data-level', entry.level)
      .children(entry.level),
    hasSource
      ? h.span
          .class(styles.source)
          .attr('title', entry.source)
          .children(entry.source)
      : undefined,
    h.span
      .class(styles.message)
      .attr('data-slot', 'log-stream-entry-message')
      .children(entry.message),
  ]
  return h.div
    .class(styles.root, className)
    .attrs({ 'data-slot': 'log-stream', 'data-variant': variant })
    .children(
      renderScroller(h, {
        ...options,
        label,
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        dense: true,
        newContentLabel: 'New log entries',
        endLabel: 'Jump to latest log entry',
        live: 'polite',
        children: entries.map(entry =>
          renderEntry !== undefined
            ? h.div
                .key(entry.id)
                .attr('data-slot', 'log-stream-custom-entry')
                .children(renderEntry(entry))
            : entry.detail === undefined
              ? h.div
                  .key(entry.id)
                  .class(styles.row)
                  .attrs({
                    'data-slot': 'log-stream-entry',
                    'data-variant': variant,
                  })
                  .style({ gridTemplateColumns: columns })
                  .children(cells(entry))
              : CollapsibleBehavior(h, {
                  key: entry.id,
                  props: {},
                  view: disclosure =>
                    disclosure
                      .root(
                        h.div.attrs({
                          'data-slot': 'log-stream-entry',
                          'data-variant': variant,
                        }),
                      )
                      .children(
                        disclosure
                          .trigger(
                            h.button
                              .class(styles.row, styles.expander)
                              .attr('data-variant', variant)
                              .style({ gridTemplateColumns: columns }),
                          )
                          .children(cells(entry)),
                        disclosure
                          .panel(
                            h.pre.class(styles.details).attrs({
                              'data-slot': 'log-stream-entry-detail',
                            }),
                          )
                          ?.children(entry.detail),
                      ),
                }),
        ),
      }),
    )
}
