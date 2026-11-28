import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { CarouselBehavior } from '../behaviors/carousel'
import { IconBehavior } from '../behaviors/icon'

type Options<Msg> = Parameters<typeof CarouselBehavior<Msg>>[1]
export type CarouselProps<Msg, R = never> = Omit<
  Options<Msg>,
  'props' | 'view' | 'fallback'
> & {
  readonly props?: Omit<Options<Msg>['props'], 'count'>
  readonly id: string
  readonly items: readonly {
    readonly key: string
    readonly content: View.Input<Msg, R>
  }[]
  readonly label?: string
  readonly orientation?: 'horizontal' | 'vertical'
  readonly direction?: 'ltr' | 'rtl'
  readonly itemSize?: number | ((index: number) => number)
  readonly previousLabel?: string
  readonly nextLabel?: string
  readonly className?: string
  readonly behavior?: typeof CarouselBehavior
}

const tailwind = {
  root: 'relative min-h-0 min-w-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
  viewport:
    'min-h-0 min-w-0 overflow-hidden outline-none data-[orientation=vertical]:h-full',
  rail: 'flex min-h-0 -ml-4 touch-pan-y data-[orientation=vertical]:-mt-4 data-[orientation=vertical]:ml-0 data-[orientation=vertical]:h-full data-[orientation=vertical]:flex-col data-[orientation=vertical]:touch-pan-x',
  slide:
    'min-h-0 min-w-0 shrink-0 grow-0 snap-start pl-4 data-[orientation=vertical]:min-h-0 data-[orientation=vertical]:pl-0 data-[orientation=vertical]:pt-4',
  controls: '',
  button:
    'absolute flex size-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-xs hover:bg-accent disabled:pointer-events-none disabled:opacity-50',
  status: 'sr-only',
}

export const Carousel = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    items,
    label = 'Carousel',
    props,
    orientation = props?.orientation ?? 'horizontal',
    direction,
    itemSize = 100,
    previousLabel = 'Previous slide',
    nextLabel = 'Next slide',
    className,
    behavior = CarouselBehavior,
    ...options
  }: CarouselProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  behavior(h, {
    ...options,
    key: options.key ?? id,
    props: { ...props, count: items.length, orientation },
    view: carousel =>
      h.section
        .class(styles.root, className)
        .attrs({
          id,
          'data-slot': 'carousel',
          'data-orientation': orientation,
          dir: direction,
          role: 'region',
          'aria-roledescription': 'carousel',
          'aria-label': label,
        })
        .children(
          carousel
            .viewport(
              h.div.class(styles.viewport).attrs({
                'data-slot': 'carousel-content',
                'data-orientation': orientation,
                'aria-label': label,
              }),
            )
            .children(
              h.div
                .class(styles.rail)
                .attrs({
                  'data-slot': 'carousel-rail',
                  'data-orientation': orientation,
                })
                .children(
                  items.map(({ key, content }, index) => {
                    const percent =
                      typeof itemSize === 'function'
                        ? itemSize(index)
                        : itemSize
                    const size = Number.isFinite(percent)
                      ? Math.max(1, Math.min(100, percent))
                      : 100
                    return h.div
                      .key(key)
                      .class(styles.slide)
                      .attrs({
                        'data-slot': 'carousel-item',
                        'data-orientation': orientation,
                        role: 'group',
                        'aria-roledescription': 'slide',
                        'aria-label': `${index + 1} of ${items.length}`,
                      })
                      .style({ flexBasis: `${size}%` })
                      .children(content)
                  }),
                ),
            ),
          h.button
            .class(
              styles.button,
              orientation === 'vertical'
                ? 'left-1/2 -top-12 -translate-x-1/2'
                : 'top-1/2 -left-12 -translate-y-1/2',
            )
            .attrs({
              'data-carousel-action': 'previous',
              'data-slot': 'carousel-previous',
              'aria-label': previousLabel,
              type: 'button',
            })
            .disabled(!carousel.canScrollPrevious)
            .children(
              IconBehavior(h, {
                name:
                  orientation === 'vertical'
                    ? 'arrow-up'
                    : direction === 'rtl'
                      ? 'arrow-right'
                      : 'arrow-left',
                size: 'sm',
              }),
              h.span.class('sr-only').children(previousLabel),
            ),
          h.button
            .class(
              styles.button,
              orientation === 'vertical'
                ? 'left-1/2 -bottom-12 -translate-x-1/2'
                : 'top-1/2 -right-12 -translate-y-1/2',
            )
            .attrs({
              'data-carousel-action': 'next',
              'data-slot': 'carousel-next',
              'aria-label': nextLabel,
              type: 'button',
            })
            .disabled(!carousel.canScrollNext)
            .children(
              IconBehavior(h, {
                name:
                  orientation === 'vertical'
                    ? 'arrow-down'
                    : direction === 'rtl'
                      ? 'arrow-left'
                      : 'arrow-right',
                size: 'sm',
              }),
              h.span.class('sr-only').children(nextLabel),
            ),
          h.span
            .class(styles.status)
            .attr('role', 'status')
            .children(
              carousel.count > 0
                ? `Position ${carousel.index + 1} of ${carousel.count}`
                : undefined,
            ),
        ),
  })
