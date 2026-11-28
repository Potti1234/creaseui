import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type AvatarGroupSize = 'sm' | 'md' | 'lg' | number
export type AvatarShape = 'circle' | 'rounded' | 'square'
export type AvatarStatusDotSize = 'xsm' | 'sm' | 'md' | 'lg' | 'xl' | number
export type AvatarStatus = 'success' | 'neutral' | 'error'

type Classes = Partial<
  Record<'root' | 'member' | 'overflow' | 'status' | 'glyph', string>
>

const nameSizes = { sm: 24, md: 32, lg: 40 }
const statusSizes = { xsm: 20, sm: 24, md: 36, lg: 48, xl: 128 }
const corners = {
  circle: '999px',
  rounded: 'calc(var(--radius) - 2px)',
  square: '0',
}

const resolveSize = ({
  avatarSize = 'md',
}: {
  readonly avatarSize?: AvatarGroupSize
}) => (typeof avatarSize === 'number' ? avatarSize : nameSizes[avatarSize])

export type AvatarGroupProps<Msg, R = never> = {
  readonly ariaLabel?: string
  readonly avatarSize?: AvatarGroupSize
  readonly shape?: AvatarShape
  readonly children: View.Children<Msg, R>
  readonly className?: string
}

export const AvatarGroupBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    ariaLabel = 'Avatar group',
    shape = 'circle',
    className,
    children,
    ...options
  }: AvatarGroupProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const overlap = Math.round(resolveSize(options) * 0.25)
  return h.div
    .class(styles.root, className)
    .attrs({
      role: 'group',
      'aria-label': ariaLabel,
      'data-slot': 'avatar-group',
    })
    .style({
      '--avatar-group-overlap': `-${overlap}px`,
      '--avatar-group-radius': corners[shape],
    })
    .children(
      children.map((child, index) =>
        h.span
          .class(styles.member)
          .attr('data-slot', 'avatar-group-member')
          .style({
            marginInlineStart:
              index === 0 ? undefined : 'var(--avatar-group-overlap)',
          })
          .children(child),
      ),
    )
}

export type AvatarGroupOverflowProps<Msg, R = never> = {
  readonly count?: number
  readonly avatarSize?: AvatarGroupSize
  readonly shape?: AvatarShape
  readonly ariaLabel?: string
  readonly onPress?: Msg
  readonly children?: View.Children<Msg, R>
  readonly className?: string
}

export const AvatarGroupOverflowBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    count = 0,
    shape = 'circle',
    ariaLabel,
    onPress,
    children,
    className,
    ...options
  }: AvatarGroupOverflowProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const avatarSize = resolveSize(options)
  const content = children ?? [count > 0 ? `+${count}` : '']
  const label =
    ariaLabel ??
    (children === undefined && count > 0 ? `${count} more` : undefined)
  const attrs = { 'data-slot': 'avatar-group-overflow', 'aria-label': label }
  const dimensions = {
    borderRadius: corners[shape],
    minWidth: `${avatarSize + 4}px`,
    height: `${avatarSize + 4}px`,
    fontSize: `${Math.max(12, Math.round(avatarSize * 0.35))}px`,
    lineHeight: '1',
  }
  return onPress === undefined
    ? h.span
        .class(styles.overflow, className)
        .attrs({ ...attrs, role: label === undefined ? undefined : 'img' })
        .style(dimensions)
        .children(content)
    : h.button
        .class(styles.overflow, className)
        .attrs({ ...attrs, type: 'button' })
        .style(dimensions)
        .on('click', onPress)
        .children(content)
}

export type AvatarStatusDotProps = {
  readonly variant: AvatarStatus
  readonly avatarSize?: AvatarStatusDotSize
  readonly ariaLabel?: string
  readonly className?: string
}

export const AvatarStatusDotBehavior = <Msg>(
  h: Html.H<Msg>,
  { variant, avatarSize = 'md', ariaLabel, className }: AvatarStatusDotProps,
  styles: Classes = {},
) => {
  const size =
    typeof avatarSize === 'number' ? avatarSize : statusSizes[avatarSize]
  const dot = size <= 36 ? 10 : size <= 72 ? 20 : 32
  const border = size <= 36 ? 1 : size <= 72 ? 2 : 4
  const glyph = size <= 36 ? 0 : size <= 72 ? 12 : 18
  return h.span
    .class(styles.status, className)
    .attrs({
      'data-slot': 'avatar-status-dot',
      'data-variant': variant,
      role: ariaLabel === undefined ? undefined : 'img',
      'aria-hidden': ariaLabel === undefined ? 'true' : undefined,
      'aria-label': ariaLabel,
    })
    .style({
      width: `${dot}px`,
      height: `${dot}px`,
      borderWidth: `${border}px`,
    })
    .children(
      glyph === 0 || variant === 'success'
        ? undefined
        : h.span
            .class(styles.glyph)
            .attrs({
              'aria-hidden': 'true',
              'data-variant': variant,
            })
            .style({
              width: `${glyph}px`,
              height: variant === 'neutral' ? `${glyph}px` : '2px',
            }),
    )
}
