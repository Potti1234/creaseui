import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import { Effect, Queue, Schema, Stream } from 'effect'

const Orientation = Schema.Literals(['horizontal', 'vertical'])
const Args = {
  orientation: Orientation,
  loop: Schema.Boolean,
  slidesToScroll: Schema.Number,
  index: Schema.NullOr(Schema.Number),
  startIndex: Schema.Number,
  keyboardNavigation: Schema.Boolean,
}
const State = Schema.Struct({
  index: Schema.Number,
  count: Schema.Number,
  canScrollPrevious: Schema.Boolean,
  canScrollNext: Schema.Boolean,
})
const Selection = UiSchema.TaggedEnum({ Selected: { state: State } })
type Selection = typeof Selection.Type

export type CarouselRuntimeOptions = Omit<
  EmblaOptionsType,
  'axis' | 'direction' | 'loop' | 'slidesToScroll' | 'startIndex'
>

/** Register a custom carousel once at module scope to supply Embla options and plugins. */
export const createCarouselBehavior = ({
  name = 'CreaseCarousel',
  options,
  plugins = [],
}: {
  readonly name?: string
  readonly options?: CarouselRuntimeOptions
  readonly plugins?: readonly EmblaPluginType[]
} = {}) => {
  const Connect = Mount.makeStream(
    `${name}Mount`,
    { args: Args },
    (viewport: HTMLDivElement, initial, changes) =>
      Stream.callback<Selection>(queue =>
        Effect.gen(function* () {
          const browser = viewport.ownerDocument.defaultView
          const root = viewport.parentElement
          if (browser === null || root === null) return yield* Effect.never
          const { default: EmblaCarousel } = yield* Effect.promise(
            () => import('embla-carousel'),
          )
          let active = initial
          let lastState: typeof State.Type | undefined
          const reducedMotion = browser.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches
          const settings = (args: typeof initial): EmblaOptionsType => ({
            ...options,
            axis: args.orientation === 'vertical' ? 'y' : 'x',
            direction:
              browser.getComputedStyle(viewport).direction === 'rtl'
                ? 'rtl'
                : 'ltr',
            loop: args.loop,
            slidesToScroll: args.slidesToScroll,
            startIndex: args.index ?? args.startIndex,
            ...(reducedMotion ? { duration: 0 } : {}),
          })
          const carousel = yield* Effect.acquireRelease(
            Effect.sync(() =>
              EmblaCarousel(
                viewport,
                settings(initial),
                reducedMotion ? [] : [...plugins],
              ),
            ),
            api => Effect.sync(api.destroy),
          )
          const emit = () => {
            const state = {
              index: carousel.selectedScrollSnap(),
              count: carousel.scrollSnapList().length,
              canScrollPrevious: carousel.canScrollPrev(),
              canScrollNext: carousel.canScrollNext(),
            }
            if (
              lastState?.index === state.index &&
              lastState.count === state.count &&
              lastState.canScrollPrevious === state.canScrollPrevious &&
              lastState.canScrollNext === state.canScrollNext
            )
              return
            lastState = state
            Queue.offerUnsafe(queue, Selection.Selected({ state }))
          }
          const controller = new AbortController()
          const { signal } = controller
          const click = (event: MouseEvent) => {
            const control =
              event.target instanceof Element
                ? event.target.closest<HTMLButtonElement>(
                    '[data-carousel-action]',
                  )
                : null
            if (
              control?.closest('[data-slot="carousel"]') !== root ||
              control.disabled
            )
              return
            if (control.dataset.carouselAction === 'previous')
              carousel.scrollPrev()
            else carousel.scrollNext()
          }
          const keydown = (event: KeyboardEvent) => {
            if (
              !active.keyboardNavigation ||
              event.defaultPrevented ||
              event.altKey ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.target !== viewport
            )
              return
            const rtl =
              active.orientation === 'horizontal' &&
              browser.getComputedStyle(viewport).direction === 'rtl'
            const [previous, next] =
              active.orientation === 'vertical'
                ? ['ArrowUp', 'ArrowDown']
                : rtl
                  ? ['ArrowRight', 'ArrowLeft']
                  : ['ArrowLeft', 'ArrowRight']
            if (event.key === previous) carousel.scrollPrev()
            else if (event.key === next) carousel.scrollNext()
            else if (event.key === 'Home') carousel.scrollTo(0)
            else if (event.key === 'End')
              carousel.scrollTo(carousel.scrollSnapList().length - 1)
            else return
            event.preventDefault()
          }
          yield* Effect.acquireRelease(
            Effect.sync(() => {
              root.addEventListener('click', click, { signal })
              viewport.addEventListener('keydown', keydown, { signal })
              carousel.on('select', emit).on('reInit', emit)
              emit()
            }),
            () =>
              Effect.sync(() => {
                controller.abort()
                carousel.off('select', emit).off('reInit', emit)
              }),
          )
          yield* Stream.runForEach(changes, args =>
            Effect.sync(() => {
              const old = active
              active = args
              if (
                old.orientation !== args.orientation ||
                old.loop !== args.loop ||
                old.slidesToScroll !== args.slidesToScroll
              ) {
                const index = args.index ?? carousel.selectedScrollSnap()
                carousel.reInit(
                  settings({ ...args, index }),
                  reducedMotion ? [] : [...plugins],
                )
              } else if (
                args.index !== null &&
                args.index !== carousel.selectedScrollSnap()
              ) {
                carousel.scrollTo(args.index, reducedMotion)
              }
            }),
          )
          return yield* Effect.never
        }),
      ),
  )
  return Html.component({
    name,
    props: Schema.Struct({
      count: Schema.Number,
      orientation: Schema.optional(Orientation),
      loop: Schema.optional(Schema.Boolean),
      slidesToScroll: Schema.optional(Schema.Number),
      index: Schema.optional(Schema.Number),
      defaultIndex: Schema.optional(Schema.Number),
      keyboardNavigation: Schema.optional(Schema.Boolean),
    }),
    model: State,
    message: Selection,
    events: Selection,
  }).make({
    init: ({ props }) => {
      const index = props.index ?? props.defaultIndex ?? 0
      return {
        index,
        count: props.count,
        canScrollPrevious:
          index > 0 || (props.loop === true && props.count > 1),
        canScrollNext:
          index < props.count - 1 || (props.loop === true && props.count > 1),
      }
    },
    update: { Selected: ($, event) => $.set(event.state).emit(event) },
    parts: (p, model) => ({
      ...model,
      viewport: p.part('div', element =>
        element
          .onMount(
            Connect({
              orientation: p.props.orientation ?? 'horizontal',
              loop: p.props.loop ?? false,
              slidesToScroll: Math.max(
                1,
                Math.floor(p.props.slidesToScroll ?? 1),
              ),
              index: p.props.index ?? null,
              startIndex: p.props.defaultIndex ?? 0,
              keyboardNavigation: p.props.keyboardNavigation ?? true,
            }),
          )
          .attr('tabindex', p.props.keyboardNavigation === false ? '-1' : '0'),
      ),
    }),
  })
}

export const CarouselBehavior = createCarouselBehavior()
