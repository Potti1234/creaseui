import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type StatDelta = {
  readonly direction: 'up' | 'down' | 'flat'
  readonly sentiment?: 'positive' | 'negative' | 'neutral'
  readonly value: string
}
type Classes = Partial<
  Record<
    'root' | 'label' | 'line' | 'value' | 'delta' | 'description' | 'media',
    string
  >
>
const sentimentOf = { up: 'positive', down: 'negative', flat: 'neutral' }
const trendOf = {
  up: ['↗', 'Increase'],
  down: ['↘', 'Decrease'],
  flat: ['→', 'No change'],
}

export type StatProps<Msg, R = never> = {
  readonly label: string
  readonly value: string
  readonly delta?: StatDelta
  readonly size?: 'sm' | 'md' | 'lg'
  readonly description?: string
  readonly media?: View.Children<Msg, R>
  readonly className?: string
}

export const StatBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    value,
    delta,
    size = 'md',
    description,
    media,
    className,
  }: StatProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  h.div
    .class(styles.root, className)
    .attrs({ 'data-slot': 'stat', 'data-size': size })
    .children(
      h.span
        .class(styles.label)
        .attr('data-slot', 'stat-label')
        .children(label),
      h.span.class(styles.line).children(
        h.span
          .class(styles.value)
          .attrs({ 'data-slot': 'stat-value', 'data-size': size })
          .children(value),
        delta === undefined
          ? undefined
          : h.span
              .class(styles.delta)
              .attrs({
                'data-slot': 'stat-delta',
                'data-sentiment':
                  delta.sentiment ?? sentimentOf[delta.direction],
              })
              .children(
                h.span
                  .attrs({
                    'data-slot': 'stat-delta-glyph',
                    role: 'img',
                    'aria-label': trendOf[delta.direction][1],
                  })
                  .children(trendOf[delta.direction][0]),
                delta.value,
              ),
      ),
      description === undefined
        ? undefined
        : h.span
            .class(styles.description)
            .attr('data-slot', 'stat-description')
            .children(description),
      media === undefined
        ? undefined
        : h.div
            .class(styles.media)
            .attr('data-slot', 'stat-media')
            .children(media),
    )
