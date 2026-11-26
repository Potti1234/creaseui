import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type KbdProps<Msg, R = never> = {
  readonly children?: View.Children<Msg, R>
  readonly icon?: 'inline-start' | 'inline-end'
  readonly group?: boolean
}

export const KbdBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { children, icon, group = false }: KbdProps<NoInfer<Msg>, R>,
) =>
  h.kbd
    .attrs({ 'data-slot': group ? 'kbd-group' : 'kbd', 'data-icon': icon })
    .children(children)
