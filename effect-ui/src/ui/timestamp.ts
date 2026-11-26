import type { Html } from '@effect/ui/html'
import { View } from '@effect/ui'

import { IconBehavior } from '../behaviors/icon'
import { TextBehavior, type TextProps } from '../behaviors/text'
import {
  TimestampBehavior,
  formatTooltipLines,
  type TimestampTooltipEntry,
} from '../behaviors/timestamp'
import { HoverCard } from './hover-card'

type Options<Msg> = Parameters<typeof TimestampBehavior<Msg>>[1]
export type TimestampProps<Msg> = Omit<Options<Msg>, 'view' | 'fallback'> &
  Pick<TextProps<Msg>, 'type' | 'size' | 'color' | 'weight' | 'className'> & {
    readonly id: string
    readonly tooltip?: boolean
    readonly tooltipEntries?: readonly TimestampTooltipEntry[]
  }
const tailwind = {
  root: 'inline-flex shrink-0',
  trigger:
    'rounded-sm border-0 bg-transparent p-0 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring',
  rows: 'grid gap-1',
  row: 'flex min-w-0 items-center justify-between gap-2 text-xs',
  value: 'min-w-0 wrap-break-word',
  label: 'block font-semibold',
  copy: 'inline-grid size-7 shrink-0 place-items-center rounded-sm border-0 bg-transparent outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
  feedback: 'text-xs text-muted-foreground',
}
export const Timestamp = <Msg>(
  h: Html.H<Msg>,
  {
    id,
    tooltip = true,
    tooltipEntries,
    type = 'supporting',
    size,
    color = 'secondary',
    weight,
    className,
    ...options
  }: TimestampProps<NoInfer<Msg>>,
  styles: typeof tailwind = tailwind,
  renderHoverCard: typeof HoverCard = HoverCard,
) =>
  TimestampBehavior(h, {
    ...options,
    key: options.key ?? id,
    view: timestamp => {
      if (timestamp.text === undefined) return View.text('')
      const time = h.time
        .attrs({
          datetime: timestamp.dateTime,
          'data-slot': 'timestamp-value',
        })
        .children(
          TextBehavior(h, {
            type,
            color,
            children: [timestamp.text],
            hasTabularNumbers: true,
            ...(size === undefined ? {} : { size }),
            ...(weight === undefined ? {} : { weight }),
          }),
        )
      if (!tooltip)
        return timestamp
          .root(
            h.div.class(styles.root, className).attr('data-slot', 'timestamp'),
          )
          .children(time)
      const entries = tooltipEntries?.length
        ? tooltipEntries
        : [{ isCopyable: true }]
      const lines = formatTooltipLines(timestamp.date, entries)
      return timestamp
        .root(
          h.div.class(styles.root, className).attr('data-slot', 'timestamp'),
        )
        .children(
          renderHoverCard(h, {
            props: {},
            key: id,
            ariaLabel: timestamp.text,
            trigger: h.button.class(styles.trigger).children(time),
            content: h.div.class(styles.rows).children(
              lines.map((line, index) =>
                h.div
                  .key(String(index))
                  .class(styles.row)
                  .attr('data-slot', 'timestamp-detail')
                  .children(
                    h.div
                      .class(styles.value)
                      .children(
                        line.label === undefined
                          ? undefined
                          : h.span.class(styles.label).children(line.label),
                        line.value,
                      ),
                    line.isCopyable
                      ? timestamp
                          .copy(
                            h.button
                              .class(styles.copy)
                              .attr(
                                'aria-label',
                                `Copy ${line.label ?? 'timestamp'}`,
                              ),
                            index,
                            line.value,
                          )
                          .children(
                            IconBehavior(h, {
                              name:
                                timestamp.copyState?.index === index &&
                                timestamp.copyState.copied
                                  ? 'check'
                                  : 'copy',
                              size: 'xs',
                            }),
                          )
                      : undefined,
                  ),
              ),
              timestamp.copyState === null
                ? undefined
                : h.div
                    .class(styles.feedback)
                    .attr('role', 'status')
                    .children(
                      timestamp.copyState.copied
                        ? 'Copied'
                        : 'Copy unavailable',
                    ),
            ),
          }),
        )
    },
  })
