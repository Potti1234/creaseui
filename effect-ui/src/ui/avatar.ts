import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { AvatarBehavior } from '../behaviors/avatar'

type Options<Msg> = Parameters<typeof AvatarBehavior<Msg>>[1]

const tailwind = {
  root: 'relative inline-flex size-8 shrink-0 select-none rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6',
  image: 'aspect-square size-full rounded-full object-cover',
  fallback:
    'absolute inset-0 grid place-items-center rounded-full bg-muted text-sm text-foreground data-[size=sm]:text-xs data-[tone=accent]:bg-primary/15 data-[tone=accent]:text-primary data-[tone=accent]:font-medium',
  badge:
    'absolute end-0 bottom-0 z-10 grid size-2.5 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background data-[size=sm]:size-2 data-[size=lg]:size-3',
}

export const Avatar = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    alt,
    fallbackContent,
    badge,
    size = 'default',
    tone = 'muted',
    className,
    ...options
  }: Omit<Options<Msg>, 'view' | 'fallback'> & {
    readonly alt: string
    readonly fallbackContent: View.Children<NoInfer<Msg>, R>
    readonly badge?: View.Children<NoInfer<Msg>, R>
    readonly size?: 'default' | 'sm' | 'lg'
    readonly tone?: 'muted' | 'accent'
    readonly className?: string
  },
  styles: typeof tailwind = tailwind,
) =>
  AvatarBehavior(h, {
    ...options,
    view: avatar =>
      avatar
        .root(
          h.span.class(styles.root, className).attrs({
            'data-slot': 'avatar',
            'data-size': size,
          }),
        )
        .children(
          avatar.image(
            h.img
              .class(styles.image)
              .attrs({ 'data-slot': 'avatar-image', alt }),
          ),
          avatar.fallback(
            h.span
              .class(styles.fallback)
              .attrs({
                'data-slot': 'avatar-fallback',
                'data-size': size,
                'data-tone': tone,
                role: alt ? 'img' : undefined,
                'aria-label': alt || undefined,
                'aria-hidden': !alt ? 'true' : undefined,
              })
              .children(fallbackContent),
          ),
          badge === undefined
            ? undefined
            : h.span
                .class(styles.badge)
                .attrs({
                  'data-slot': 'avatar-badge',
                  'data-size': size,
                })
                .children(badge),
        ),
  })
