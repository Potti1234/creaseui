import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Queue, Schema, Stream } from 'effect'

export { DrawerBehavior as MobileNavBehavior } from './drawer'

export const MobileNavSide = Schema.Literals(['start', 'end', 'auto'])
export type MobileNavSide = typeof MobileNavSide.Type
const Direction = Schema.Literals(['ltr', 'rtl'])
const Edge = Schema.Literals(['left', 'right'])

export const resolveMobileNavSide = (
  side: Exclude<MobileNavSide, 'auto'>,
  direction: typeof Direction.Type,
): typeof Edge.Type =>
  (side === 'start') === (direction === 'ltr') ? 'left' : 'right'

const Message = UiSchema.TaggedEnum({ Measured: { edge: Edge } })
type Message = typeof Message.Type

const ObserveTrigger = Mount.makeStream(
  'ObserveMobileNavTrigger',
  { args: {} },
  (root: HTMLDivElement) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        const window = root.ownerDocument.defaultView
        if (window === null) return yield* Effect.never
        let previous: typeof Edge.Type | undefined
        const measure = () => {
          const trigger = root.querySelector<HTMLElement>(
            '[data-slot="mobile-nav-toggle"]',
          )
          if (trigger === null) return
          const rect = trigger.getBoundingClientRect()
          if (rect.width === 0) return
          const edge =
            rect.left + rect.width / 2 < window.innerWidth / 2
              ? 'left'
              : 'right'
          if (edge === previous) return
          previous = edge
          Queue.offerUnsafe(queue, Message.Measured({ edge }))
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            window.addEventListener('resize', measure)
            root.addEventListener('pointerdown', measure, true)
            root.addEventListener('focusin', measure)
            measure()
          }),
          () =>
            Effect.sync(() => {
              window.removeEventListener('resize', measure)
              root.removeEventListener('pointerdown', measure, true)
              root.removeEventListener('focusin', measure)
            }),
        )
        return yield* Effect.never
      }),
    ),
)

export const MobileNavPosition = Html.component({
  name: 'CreaseMobileNavPosition',
  props: Schema.Struct({ side: MobileNavSide, direction: Direction }),
  model: Schema.Struct({ measured: Schema.NullOr(Edge) }),
  message: Message,
}).make({
  init: () => ({ measured: null }),
  update: { Measured: ($, { edge }) => $.evolve({ measured: edge }) },
  parts: (p, model) => ({
    edge:
      p.props.side === 'auto'
        ? (model.measured ?? resolveMobileNavSide('start', p.props.direction))
        : resolveMobileNavSide(p.props.side, p.props.direction),
    root: p.part('div', element =>
      p.props.side === 'auto' ? element.onMount(ObserveTrigger()) : element,
    ),
  }),
})
