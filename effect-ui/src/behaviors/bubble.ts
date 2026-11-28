import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

type Classes = Partial<
  Record<'root' | 'content' | 'group' | 'reactions', string>
>
type Align = 'start' | 'end'
type Slot<Msg, R> = {
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}

export type BubbleVariant =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'tinted'
  | 'outline'
  | 'ghost'
  | 'destructive'
export type BubbleProps<Msg, R = never> = Slot<Msg, R> & {
  readonly align?: Align
  readonly variant?: BubbleVariant
  readonly onPress?: Msg
  readonly reactions?: View.Children<Msg, R>
  readonly reactionLabel?: string
  readonly reactionSide?: 'top' | 'bottom'
  readonly reactionAlign?: Align
}

export const BubbleBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    align = 'start',
    variant = 'default',
    onPress,
    children,
    className,
    reactions,
    reactionLabel,
    reactionSide = 'bottom',
    reactionAlign = 'end',
  }: BubbleProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const attrs = { 'data-slot': 'bubble-content', 'data-variant': variant }
  return h.div
    .class(styles.root, className)
    .attrs({
      'data-slot': 'bubble',
      'data-align': align,
      'data-variant': variant,
    })
    .children(
      onPress === undefined
        ? h.div.class(styles.content).attrs(attrs).children(children)
        : h.button
            .class(styles.content)
            .attrs({ ...attrs, type: 'button' })
            .on('click', onPress)
            .children(children),
      reactions === undefined
        ? undefined
        : h.div
            .class(styles.reactions)
            .attrs({
              'data-slot': 'bubble-reactions',
              'data-side': reactionSide,
              'data-align': reactionAlign,
              'aria-label': reactionLabel,
              role: reactionLabel === undefined ? undefined : 'img',
            })
            .children(reactions),
    )
}

export const BubbleGroupBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  { children, className }: Slot<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  h.div
    .class(styles.group, className)
    .attr('data-slot', 'bubble-group')
    .children(children)
