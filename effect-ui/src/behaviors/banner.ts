import { Mount, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Effect, Schema, Stream } from 'effect'

import { CollapsibleBehavior } from './collapsible'

const FocusOrigin = Mount.makeStream(
  'CreaseBannerFocusOrigin',
  { args: {} },
  (banner: HTMLElement) =>
    Stream.callback<never>(() =>
      Effect.gen(function* () {
        const document = banner.ownerDocument
        let previous: HTMLElement | undefined
        const remember = (target: EventTarget | null) => {
          if (
            target instanceof HTMLElement &&
            target !== document.body &&
            !banner.contains(target)
          )
            previous = target
        }
        const onFocus = (event: FocusEvent) => remember(event.relatedTarget)
        const onPress = () => remember(document.activeElement)
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            banner.addEventListener('focusin', onFocus)
            banner.addEventListener('pointerdown', onPress, true)
          }),
          () =>
            Effect.sync(() => {
              banner.removeEventListener('focusin', onFocus)
              banner.removeEventListener('pointerdown', onPress, true)
              if (
                previous?.isConnected &&
                (document.activeElement === document.body ||
                  banner.contains(document.activeElement))
              )
                previous.focus()
            }),
        )
        return yield* Effect.never
      }),
    ),
)
const Message = UiSchema.TaggedEnum({
  Dismissed: {},
  Toggled: { open: Schema.Boolean },
})

export const BannerBehavior = Html.component({
  name: 'CreaseBanner',
  props: Schema.Struct({
    open: Schema.optional(Schema.Boolean),
    defaultOpen: Schema.optional(Schema.Boolean),
  }),
  model: Schema.Struct({ dismissed: Schema.Boolean }),
  message: Message,
  events: Message,
}).make({
  init: () => ({ dismissed: false }),
  update: {
    Dismissed: ($, event) => $.evolve({ dismissed: true }).emit(event),
    Toggled: ($, event) => $.emit(event),
  },
  parts: (p, model) =>
    p.child(CollapsibleBehavior, {
      props: p.props,
      onEmit: {
        Toggled: ({ open }) => Message.Toggled({ open }),
        Settled: () => undefined,
      },
      parts: disclosure => ({
        disclosure,
        dismissed: model.dismissed,
        root: p.part('section', element => element.onMount(FocusOrigin())),
        dismiss: p.part('button', element =>
          element.attr('type', 'button').on('click', Message.Dismissed()),
        ),
      }),
    }),
})
