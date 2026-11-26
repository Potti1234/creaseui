import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type AspectRatioProps<Msg, R = never> = {
  readonly ratio: number
  readonly children?: View.Children<Msg, R>
}

export const AspectRatioBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { ratio, children }: AspectRatioProps<NoInfer<Msg>, R>,
) =>
  h.div
    .attr('data-slot', 'aspect-ratio')
    .style({ aspectRatio: String(ratio) })
    .children(children)
