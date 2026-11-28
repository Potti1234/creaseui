import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

type Orientation = 'horizontal' | 'vertical'
type Classes = Partial<Record<'root' | 'separator' | 'text', string>>
type Slot<Msg, R> = {
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}

const parts = <Msg>(
  h: Html.H<Msg>,
  styles: Classes,
  orientation: Orientation,
) => ({
  separator: (
    axis: Orientation = orientation === 'vertical' ? 'horizontal' : 'vertical',
  ) =>
    h.div.class(styles.separator).attrs({
      role: 'none',
      'aria-hidden': 'true',
      'data-slot': 'button-group-separator',
      'data-orientation': axis,
    }),
  text: <R = never>({ children, className }: Slot<NoInfer<Msg>, R>) =>
    h.div
      .class(styles.text, className)
      .attr('data-slot', 'button-group-text')
      .children(children),
})

export type ButtonGroupProps<Msg, R = never> = Omit<
  Slot<Msg, R>,
  'children'
> & {
  readonly orientation?: Orientation
  readonly ariaLabel?: string
  readonly children?:
    | View.Children<Msg, R>
    | ((group: ReturnType<typeof parts<Msg>>) => View.Children<Msg, R>)
}

export const ButtonGroupBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    orientation = 'horizontal',
    ariaLabel,
    className,
    children,
  }: ButtonGroupProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  h.div
    .class(styles.root, className)
    .attrs({
      'data-slot': 'button-group',
      'data-orientation': orientation,
      role: 'group',
      'aria-label': ariaLabel,
    })
    .children(
      typeof children === 'function'
        ? children(parts(h, styles, orientation))
        : children,
    )
