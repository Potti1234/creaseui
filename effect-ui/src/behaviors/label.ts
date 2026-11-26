import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type LabelProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly for?: string
  readonly id?: string
  readonly required?: boolean
  readonly disabled?: boolean
}

export const LabelBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    children,
    for: control,
    id,
    required = false,
    disabled = false,
  }: LabelProps<NoInfer<Msg>, R>,
) =>
  h.label
    .attrs({
      for: control,
      id,
      'data-slot': 'label',
      'data-required': String(required),
      'data-disabled': String(disabled),
      'aria-disabled': disabled ? 'true' : undefined,
    })
    .children(
      children,
      required ? h.span.attr('aria-hidden', 'true').children('*') : undefined,
    )
