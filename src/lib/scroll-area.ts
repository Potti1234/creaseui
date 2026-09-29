import { Effect, Queue, Schema as S, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'

// Base UI keeps a scrollable viewport keyboard-focusable only while its
// content overflows on at least one axis, per
// https://accessibilityinsights.io/info-examples/web/scrollable-region-focusable/.
// `hasOverflowX`/`hasOverflowY` mirror Base UI's `hiddenState` (inverted):
// both false is the pre-measurement state, which renders tabIndex=-1.
export const Model = S.Struct({
  hasOverflowX: S.Boolean,
  hasOverflowY: S.Boolean,
})
export type Model = typeof Model.Type

export const init = (): Model => ({ hasOverflowX: false, hasOverflowY: false })

export const Message = defineMessageUnion({
  ObservedScrollAreaViewport: {
    scrollWidth: S.Number,
    clientWidth: S.Number,
    scrollHeight: S.Number,
    clientHeight: S.Number,
  },
})
export type Message = typeof Message.Type

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ObservedScrollAreaViewport':
      return {
        model: {
          ...model,
          hasOverflowX: message.scrollWidth > message.clientWidth,
          hasOverflowY: message.scrollHeight > message.clientHeight,
        },
      }
  }
}

const measure = (element: HTMLElement) =>
  Message.ObservedScrollAreaViewport({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  })

export const ObserveScrollAreaOverflow = Mount.defineStream(
  'ObserveScrollAreaOverflow',
  {
    messages: [Message.ObservedScrollAreaViewport],
    execute: ({ element }) =>
      Stream.callback<typeof Message.ObservedScrollAreaViewport.Type>(
        queue =>
          Effect.gen(function* () {
            yield* Effect.acquireRelease(
              Effect.sync(() => {
                if (!(element instanceof HTMLElement)) return undefined
                const emit = () =>
                  Queue.offerUnsafe(queue, measure(element))
                const resize = new ResizeObserver(emit)
                const mutation = new MutationObserver(emit)
                resize.observe(element)
                mutation.observe(element, { childList: true, subtree: true })
                emit()
                return { resize, mutation }
              }),
              resource =>
                Effect.sync(() => {
                  resource?.resize.disconnect()
                  resource?.mutation.disconnect()
                }),
            )
            return yield* Effect.never
          }),
      ),
  },
)

export const overflowMount = <Msg>(
  toParentMessage: (message: Message) => Msg,
) => Mount.mapMessage(ObserveScrollAreaOverflow(), toParentMessage)
