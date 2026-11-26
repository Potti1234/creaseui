import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type BlockquoteProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly cite?: string
}

export const BlockquoteBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { children, cite }: BlockquoteProps<NoInfer<Msg>, R>,
  citeClass?: string,
) =>
  h.blockquote
    .attr('data-slot', 'blockquote')
    .children(
      children,
      cite === undefined
        ? undefined
        : h.cite
            .class(citeClass)
            .attr('data-slot', 'blockquote-cite')
            .children(cite),
    )
