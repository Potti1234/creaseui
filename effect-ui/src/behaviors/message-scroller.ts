import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Queue, Schema, Stream } from 'effect'

const Model = Schema.Struct({
  ready: Schema.Boolean,
  atStart: Schema.Boolean,
  atEnd: Schema.Boolean,
  hasNew: Schema.Boolean,
})
const Message = UiSchema.TaggedEnum({ Measured: { state: Model } })
type Message = typeof Message.Type

const Watch = Mount.makeStream(
  'WatchCreaseMessageScroller',
  { args: { startAtEnd: Schema.Boolean, threshold: Schema.Number } },
  (root: HTMLDivElement, { startAtEnd, threshold }) =>
    Stream.callback<Message>(queue =>
      Effect.gen(function* () {
        const view = root.querySelector<HTMLElement>(
          '[data-slot="message-scroller-viewport"]',
        )
        const content = root.querySelector<HTMLElement>(
          '[data-slot="message-scroller-content"]',
        )
        if (view === null || content === null) return yield* Effect.never
        let height = view.scrollHeight
        let following = startAtEnd
        let hasNew = false
        let requestedEnd = false
        let last = ''
        const report = () => {
          const atEnd =
            view.scrollHeight - view.clientHeight - view.scrollTop <= threshold
          const atStart = view.scrollTop <= 1
          if (atEnd) {
            requestedEnd = false
            hasNew = false
          }
          following = atEnd || requestedEnd
          const state = { ready: true, atStart, atEnd, hasNew }
          const current = JSON.stringify(state)
          if (last === current) return
          last = current
          Queue.offerUnsafe(queue, Message.Measured({ state }))
        }
        const resize = () => {
          const nextHeight = view.scrollHeight
          if (following) view.scrollTop = nextHeight
          else if (nextHeight > height) hasNew = true
          height = nextHeight
          report()
        }
        const onClick = (event: MouseEvent) => {
          const target =
            event.target instanceof Element
              ? event.target.closest<HTMLButtonElement>('[data-scroll-edge]')
              : null
          if (
            target?.closest('[data-slot="message-scroller"]') !== root ||
            target.disabled
          )
            return
          const end = target.dataset.scrollEdge === 'end'
          requestedEnd = end
          following = end
          const reduced = root.ownerDocument.defaultView?.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches
          view.scrollTo({
            top: end ? view.scrollHeight : 0,
            behavior: reduced ? 'instant' : 'smooth',
          })
          if (reduced) report()
        }
        const interrupt = () => {
          requestedEnd = false
        }
        const resizeObserver = new ResizeObserver(resize)
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            if (startAtEnd) view.scrollTop = view.scrollHeight
            report()
            resizeObserver.observe(view)
            resizeObserver.observe(content)
            view.addEventListener('scroll', report, { passive: true })
            view.addEventListener('wheel', interrupt, { passive: true })
            view.addEventListener('pointerdown', interrupt, { passive: true })
            root.addEventListener('click', onClick)
          }),
          () =>
            Effect.sync(() => {
              resizeObserver.disconnect()
              view.removeEventListener('scroll', report)
              view.removeEventListener('wheel', interrupt)
              view.removeEventListener('pointerdown', interrupt)
              root.removeEventListener('click', onClick)
            }),
        )
        return yield* Effect.never
      }),
    ),
)

export const MessageScrollerBehavior = Html.component({
  name: 'CreaseMessageScroller',
  props: Schema.Struct({
    startAtEnd: Schema.optional(Schema.Boolean),
    threshold: Schema.optional(Schema.Number),
  }),
  model: Model,
  message: Message,
  events: Message,
}).make({
  init: () => ({ ready: false, atStart: true, atEnd: true, hasNew: false }),
  update: { Measured: ($, event) => $.set(event.state).emit(event) },
  parts: (p, model) => ({
    ...model,
    root: p.part('div', element =>
      element.onMount(
        Watch({
          startAtEnd: p.props.startAtEnd ?? true,
          threshold: Math.max(1, p.props.threshold ?? 12),
        }),
      ),
    ),
  }),
})
