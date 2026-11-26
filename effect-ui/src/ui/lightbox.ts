import type { Html } from '@effect/ui/html'

import { IconBehavior } from '../behaviors/icon'
import { LightboxBehavior } from '../behaviors/lightbox'

type Options<Msg> = Parameters<typeof LightboxBehavior<Msg>>[1]

export interface LightboxMedia {
  readonly src: string
  readonly alt: string
  readonly caption?: string
  readonly type?: 'image' | 'video'
}

export type LightboxProps<Msg, R = never> = Omit<
  Options<Msg>,
  'props' | 'view' | 'fallback'
> & {
  readonly props?: Omit<Options<Msg>['props'], 'itemCount' | 'zoomableIndices'>
  readonly trigger?: Html.Element<
    Msg,
    R,
    Html.EventsOf<'button'>,
    HTMLButtonElement,
    'button'
  >
  readonly media: LightboxMedia | readonly LightboxMedia[]
  readonly hasZoom?: boolean
  readonly hasAutoPlay?: boolean
  readonly className?: string
}

const tailwind = {
  root: 'bg-transparent p-0',
  backdrop:
    'fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none',
  viewport: 'pointer-events-none fixed inset-0',
  popup:
    'absolute inset-0 flex flex-col items-center justify-center overflow-hidden outline-none transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none',
  title: 'sr-only',
  group:
    'pointer-events-auto relative z-10 flex max-h-full max-w-full flex-col items-center justify-center gap-2 px-3',
  frame:
    'relative flex max-h-full max-w-full items-center justify-center overflow-hidden outline-none data-zoomable:cursor-zoom-in data-zoomable:touch-none data-zoomable:select-none data-zoomed:cursor-grab data-panning:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  image:
    'pointer-events-none max-h-[calc(100dvh-6rem)] max-w-full shrink-0 object-contain select-none transition-transform duration-200 ease-out data-panning:transition-none motion-reduce:transition-none',
  video: 'max-h-[calc(100dvh-6rem)] max-w-full',
  caption: 'w-full max-w-[600px] px-3 pt-2 text-base text-white',
  counter: 'absolute start-3 top-3 z-10 text-sm text-white',
  control:
    'pointer-events-auto absolute z-10 inline-flex size-10 items-center justify-center rounded-full border-0 bg-black/40 text-white transition-colors hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none',
  previous: 'start-3 top-1/2 -translate-y-1/2',
  next: 'end-3 top-1/2 -translate-y-1/2',
  close: 'end-3 top-3',
}

export const Lightbox = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    props,
    media,
    trigger,
    hasZoom = false,
    hasAutoPlay = false,
    className,
    ...options
  }: LightboxProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const items: readonly LightboxMedia[] = 'src' in media ? [media] : media
  return LightboxBehavior(h, {
    ...options,
    props: {
      ...props,
      itemCount: items.length,
      zoomableIndices: hasZoom
        ? items.flatMap((item, index) => (item.type === 'video' ? [] : [index]))
        : [],
    },
    view: ({ dialog, index, dragging, pose, root, keys, frame, navigate }) => {
      const item = items[index]
      const media =
        item === undefined
          ? undefined
          : item.type === 'video'
            ? h.video
                .key(`${index}:${item.src}`)
                .class(styles.video)
                .attrs({
                  src: item.src,
                  preload: 'metadata',
                  controls: '',
                  draggable: 'false',
                  autoplay: hasAutoPlay ? '' : undefined,
                  muted: hasAutoPlay ? '' : undefined,
                  playsinline: hasAutoPlay ? '' : undefined,
                  'aria-label': item.alt,
                  'data-slot': 'lightbox-media',
                })
            : frame(
                h.div
                  .key(`${index}:${item.src}`)
                  .class(styles.frame)
                  .attr('data-slot', 'lightbox-zoom-frame'),
              ).children(
                h.img
                  .class(styles.image)
                  .attrs({
                    src: item.src,
                    alt: item.alt,
                    draggable: 'false',
                    'data-slot': 'lightbox-media',
                    'data-panning': dragging ? '' : undefined,
                  })
                  .style({
                    transform: `translate(${pose.x}px, ${pose.y}px) scale(${pose.zoom})`,
                  }),
              )
      const navigation = (offset: number, side: 'previous' | 'next') =>
        navigate(
          h.button.class(styles.control, styles[side]).attrs({
            'data-slot': `lightbox-${side}`,
            'aria-label': side === 'previous' ? 'Previous image' : 'Next image',
          }),
          offset,
        ).children(
          IconBehavior(h, {
            name: side === 'previous' ? 'chevron-left' : 'chevron-right',
            size: 'sm',
          }),
        )
      return root(h.div).children(
        trigger === undefined ? undefined : dialog.trigger(trigger),
        item === undefined
          ? undefined
          : dialog
              .portal(
                h.dialog
                  .class(styles.root, className)
                  .attr('data-slot', 'lightbox'),
              )
              ?.children(
                dialog.backdrop(
                  h.div
                    .class(styles.backdrop)
                    .attr('data-slot', 'lightbox-backdrop'),
                ),
                dialog.viewport(h.div.class(styles.viewport)).children(
                  dialog
                    .popup(
                      keys(
                        h.div
                          .class(styles.popup)
                          .attr('data-slot', 'lightbox-container'),
                      ),
                    )
                    .children(
                      dialog
                        .title(h.h2.class(styles.title))
                        .children(item.alt || 'Media viewer'),
                      h.div
                        .class(styles.group)
                        .attr('data-slot', 'lightbox-media-group')
                        .children(
                          media,
                          item.caption === undefined
                            ? undefined
                            : dialog
                                .description(
                                  h.p
                                    .class(styles.caption)
                                    .attr('data-slot', 'lightbox-caption'),
                                )
                                .children(item.caption),
                        ),
                      items.length <= 1
                        ? undefined
                        : h.div
                            .class(styles.counter)
                            .attrs({
                              'data-slot': 'lightbox-counter',
                              'aria-live': 'polite',
                            })
                            .children(`${index + 1} / ${items.length}`),
                      items.length <= 1
                        ? undefined
                        : navigation(-1, 'previous'),
                      items.length <= 1 ? undefined : navigation(1, 'next'),
                      dialog
                        .close(
                          h.button.class(styles.control, styles.close).attrs({
                            'data-slot': 'lightbox-close',
                            'aria-label': 'Close',
                          }),
                        )
                        .children(IconBehavior(h, { name: 'x', size: 'sm' })),
                    ),
                ),
              ),
      )
    },
  })
}
