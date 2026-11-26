import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

type Classes = Partial<
  Record<
    'root' | 'header' | 'media' | 'title' | 'description' | 'content',
    string
  >
>

export type EmptyProps<Msg, R = never> = {
  readonly title: View.Input<Msg, R>
  readonly description?: View.Input<Msg, R>
  readonly media?: View.Input<Msg, R>
  readonly mediaVariant?: 'default' | 'icon'
  readonly children?: View.Children<Msg, R>
  readonly className?: string
}

export const EmptyBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    title,
    description,
    media,
    mediaVariant = 'default',
    children,
    className,
  }: EmptyProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  h.div
    .class(styles.root, className)
    .attr('data-slot', 'empty')
    .children(
      h.div
        .class(styles.header)
        .attr('data-slot', 'empty-header')
        .children(
          media === undefined
            ? undefined
            : h.div
                .class(styles.media)
                .attrs({
                  'data-slot': 'empty-icon',
                  'data-variant': mediaVariant,
                })
                .children(media),
          h.h2
            .class(styles.title)
            .attr('data-slot', 'empty-title')
            .children(title),
          description === undefined
            ? undefined
            : h.div
                .class(styles.description)
                .attr('data-slot', 'empty-description')
                .children(description),
        ),
      children === undefined
        ? undefined
        : h.div
            .class(styles.content)
            .attr('data-slot', 'empty-content')
            .children(children),
    )
