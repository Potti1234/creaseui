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
  root: 'overflow-hidden rounded-lg border bg-card font-mono text-sm text-card-foreground data-[variant=terminal]:border-[#26262a] data-[variant=terminal]:bg-[#0a0a0a]',
  row: 'grid items-baseline gap-x-3 border-b-0 border-border px-3 py-1 leading-[1.7] text-foreground [contain-intrinsic-block-size:auto_28px] [content-visibility:auto] transition-opacity duration-150 ease-out starting:opacity-0 last:border-b-0 data-[variant=terminal]:border-b-0 data-[variant=terminal]:py-px data-[variant=terminal]:text-[#b9b9c0]',
  expander:
    'w-full cursor-pointer border-x-0 border-t-0 text-left font-mono text-sm leading-5 hover:bg-current/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-open:bg-current/5 data-[variant=terminal]:hover:bg-[#141417]',
  timestamp: 'whitespace-nowrap tabular-nums opacity-70',
  level:
    'font-semibold tracking-wide uppercase data-[level=warn]:text-warning data-[level=error]:text-destructive data-[level=debug]:opacity-60',
  source: 'truncate opacity-70',
  message: 'min-w-0 wrap-break-word whitespace-pre-wrap',
  details:
    'm-0 border-b border-current/10 px-2 py-1 text-xs wrap-break-word whitespace-pre-wrap opacity-85 data-ending-style:invisible',
}

const levelTones = {
  default: {
    info: 'text-muted-foreground',
    debug: 'text-muted-foreground/60',
    warn: 'text-warning',
    error: 'text-destructive',
  },
  terminal: {
    info: 'text-[#b9b9c0]',
    debug: 'text-[#8b8b94]',
    warn: 'text-[#f2c00b]',
    error: 'text-[#ff6166]',
  },
} as const

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
  const terminal = variant === 'terminal'
  const quietTone = terminal ? 'text-[#8b8b94]' : 'text-muted-foreground'
  const rowClass = (entry: LogEntry, expandable = false) =>
    [
      expandable ? styles.row.replace(' leading-[1.7]', '') : styles.row,
      !terminal && entry.level === 'error'
        ? 'bg-[color-mix(in_srgb,var(--destructive)_6%,transparent)]'
        : undefined,
      !terminal && entry.level === 'warn'
        ? 'bg-[color-mix(in_srgb,var(--warning)_5%,transparent)]'
        : undefined,
    ]
      .filter(value => value !== undefined)
      .join(' ')
  const cells = (entry: LogEntry) => [
    timestamps
      ? h.time.class(styles.timestamp, quietTone).children(entry.timestamp)
      : undefined,
    h.span
      .class(
        'text-xs leading-5 font-semibold uppercase tracking-[0.08em]',
        levelTones[variant][entry.level],
      )
      .attr('data-level', entry.level)
      .children(entry.level),
    hasSource
      ? h.span
          .class(styles.source, quietTone)
          .attr('title', entry.source)
          .children(entry.source)
      : undefined,
    h.span
      .class(
        styles.message,
        terminal && entry.level === 'error' ? 'text-[#ff6166]' : undefined,
        terminal && entry.level === 'warn' ? 'text-[#f2c00b]' : undefined,
      )
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
                  .class(rowClass(entry))
                  .attrs({
                    'data-slot': 'log-stream-entry',
                    'data-variant': variant,
                    'data-level': entry.level,
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
                              .class(rowClass(entry, true), styles.expander)
                              .attr('data-variant', variant)
                              .attr('data-level', entry.level)
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
