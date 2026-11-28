import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { IconBehavior } from './icon'
import { TextBehavior, type TextProps } from './text'

export const linkTarget = (
  target: string | undefined,
  rel: string | undefined,
) => ({
  target,
  rel:
    target === '_blank'
      ? [
          ...new Set([
            ...(rel?.split(/\s+/).filter(Boolean) ?? []),
            'noopener',
            'noreferrer',
          ]),
        ].join(' ')
      : rel,
})

export type LinkProps<Msg, R = never> = Pick<
  TextProps<Msg, R>,
  'type' | 'size' | 'color' | 'weight' | 'display' | 'maxLines'
> & {
  readonly children: View.Children<Msg, R>
  readonly href?: string
  readonly label?: string
  readonly variant?: 'default' | 'underlined'
  readonly hasUnderline?: boolean
  readonly disabled?: boolean
  readonly external?: boolean
  readonly newTabLabel?: string
  readonly target?: string
  readonly rel?: string
  readonly download?: string
  readonly onClick?: Msg
  readonly standalone?: boolean
  readonly className?: string
}

type Classes = Partial<Record<'root' | 'newTabLabel', string>>

export const LinkBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    href,
    label,
    variant,
    hasUnderline,
    disabled,
    external,
    newTabLabel = '(opens in new tab)',
    target,
    rel,
    download,
    onClick,
    standalone,
    className,
    color = 'accent',
    type,
    children,
    ...format
  }: LinkProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const externalLink = href !== undefined && external === true
  const attributes = {
    'data-slot': 'link',
    'data-variant': variant ?? 'default',
    'data-underline': variant === 'underlined' || hasUnderline ? '' : undefined,
    'aria-label':
      label === undefined
        ? undefined
        : externalLink
          ? `${label} ${newTabLabel}`
          : label,
    'aria-disabled': disabled ? 'true' : undefined,
  }
  const content = [
    TextBehavior(h, {
      ...format,
      type: type ?? (standalone === true ? 'body' : 'inherit'),
      color,
      children,
    }),
    externalLink
      ? IconBehavior(h, { name: 'external-link', size: '2xs' })
      : undefined,
    externalLink && label === undefined
      ? h.span.class(styles.newTabLabel).children(newTabLabel)
      : undefined,
  ]
  if (href === undefined) {
    return h.button
      .class(styles.root, className)
      .attrs({
        ...attributes,
        type: 'button',
      })
      .disabled(disabled === true)
      .on('click', () => (disabled ? undefined : onClick))
      .children(content)
  }
  return h.a
    .class(styles.root, className)
    .attrs({
      ...attributes,
      role: disabled ? 'link' : undefined,
      href: disabled ? undefined : href,
      ...linkTarget(
        disabled ? undefined : externalLink ? '_blank' : target,
        disabled ? undefined : rel,
      ),
      download: disabled ? undefined : download,
      tabindex: disabled ? '-1' : undefined,
    })
    .on('click', () => (disabled ? undefined : onClick))
    .children(content)
}
