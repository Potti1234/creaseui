import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type CodeProps<Msg, R = never> = {
  readonly color?: 'primary' | 'secondary' | 'inherit'
  readonly size?: 'inherit'
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}

export const CodeBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { color = 'primary', size, className, children }: CodeProps<NoInfer<Msg>, R>,
) =>
  h.code
    .class(className)
    .attrs({
      'data-slot': 'code',
      'data-color': color,
      'data-size': size,
    })
    .children(children)
