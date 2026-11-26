import type { Html } from '@effect/ui/html'

import { IconBehavior } from './icon'

export type ThumbnailProps<Msg> = {
  readonly src?: string
  readonly alt?: string
  readonly label?: string
  readonly loading?: boolean
  readonly error?: boolean
  readonly disabled?: boolean
  readonly onClick?: Msg
  readonly onRemove?: Msg
  readonly onError?: Msg
  readonly onLoad?: Msg
  readonly showRemoveOn?: 'always' | 'hover'
  readonly className?: string
}
type Classes = Partial<
  Record<
    | 'root'
    | 'media'
    | 'img'
    | 'open'
    | 'remove'
    | 'overlay'
    | 'placeholder'
    | 'spinner',
    string
  >
>

export const ThumbnailBehavior = <Msg>(
  h: Html.H<Msg>,
  {
    src,
    alt = '',
    label,
    loading,
    error,
    disabled,
    onClick,
    onRemove,
    onError,
    onLoad,
    showRemoveOn = 'hover',
    className,
  }: ThumbnailProps<NoInfer<Msg>>,
  styles: Classes = {},
) => {
  const name =
    label === undefined
      ? alt || 'Thumbnail'
      : alt === ''
        ? label
        : `${label} — ${alt}`
  const hasSrc = src !== undefined && src !== ''
  const content =
    hasSrc && !error
      ? h.img
          .class(styles.img)
          .attrs({ src, alt, loading: 'lazy', 'data-slot': 'thumbnail-image' })
          .on('error', () => onError)
          .on('load', () => onLoad)
          .key(src)
      : loading && !hasSrc
        ? undefined
        : h.span
            .class(styles.placeholder)
            .attr('data-slot', 'thumbnail-placeholder')
            .children(IconBehavior(h, { name: 'image', size: 'lg' }))
  return h.div
    .class(styles.root, className)
    .attrs({
      role: 'group',
      'aria-label': name,
      'aria-busy': loading ? 'true' : undefined,
      'data-slot': 'thumbnail',
      'data-disabled': disabled ? '' : undefined,
      'data-remove-on': showRemoveOn,
    })
    .children(
      h.div
        .class(styles.media)
        .attrs({
          'data-slot': 'thumbnail-media',
          'data-loading': loading && !hasSrc ? '' : undefined,
        })
        .children(
          disabled || loading || onClick === undefined
            ? content
            : h.button
                .class(styles.open)
                .attrs({ type: 'button', 'aria-label': `Open ${name}` })
                .on('click', onClick)
                .children(content),
          loading && hasSrc
            ? h.span
                .class(styles.overlay)
                .attrs({
                  'aria-hidden': 'true',
                  'data-slot': 'thumbnail-overlay',
                })
                .children(
                  h.span
                    .class(styles.spinner)
                    .children(
                      IconBehavior(h, { name: 'loader-circle', size: 'sm' }),
                    ),
                )
            : undefined,
        ),
      disabled || onRemove === undefined
        ? undefined
        : h.button
            .class(styles.remove)
            .attrs({
              type: 'button',
              'aria-label': `Remove ${name}`,
              'data-slot': 'thumbnail-remove',
            })
            .on('click', onRemove)
            .children(IconBehavior(h, { name: 'x', size: '2xs' })),
    )
}
