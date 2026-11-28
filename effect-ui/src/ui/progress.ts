import type { Html } from '@effect/ui/html'

import { ProgressBehavior, type ProgressProps } from '../behaviors/progress'

const tailwind = {
  root: 'grid gap-1.5',
  caption: 'flex justify-between gap-2 text-sm',
  value: 'text-muted-foreground tabular-nums',
  track: 'h-2 w-full overflow-hidden rounded-full bg-primary/20',
  indicator:
    'h-full rounded-full bg-primary transition-[width] data-indeterminate:w-2/5 motion-safe:data-indeterminate:animate-pulse motion-reduce:transition-none',
}

export const Progress = <Msg>(
  h: Html.H<Msg>,
  {
    props,
    label,
    ariaLabel,
    showValue = false,
    id,
    key = id,
    direction,
    className,
  }: {
    readonly props: ProgressProps
    readonly label?: string
    readonly ariaLabel?: string
    readonly showValue?: boolean
    readonly id?: string
    readonly key?: string
    readonly direction?: 'ltr' | 'rtl'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  ProgressBehavior(h, {
    key,
    props,
    view: progress =>
      progress
        .root(
          h.div.class(styles.root, className).attrs({
            id,
            dir: direction,
            'aria-label': ariaLabel,
            'data-slot': 'progress',
          }),
        )
        .children(
          label === undefined &&
            (!showValue || progress.valueText === undefined)
            ? undefined
            : h.div
                .class(styles.caption)
                .children(
                  label === undefined
                    ? undefined
                    : progress.label(h.span).children(label),
                  showValue && progress.valueText !== undefined
                    ? progress.value(h.span.class(styles.value))
                    : undefined,
                ),
          progress
            .track(
              h.div.class(styles.track).attr('data-slot', 'progress-track'),
            )
            .children(
              progress.indicator(
                h.div
                  .class(styles.indicator)
                  .attr('data-slot', 'progress-indicator'),
              ),
            ),
        ),
  })
