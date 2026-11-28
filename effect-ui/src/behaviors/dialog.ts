import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Dialog, DialogDismissReason, DialogProps } from '@effect/ui-kit'
import { Schema } from 'effect'

const Props = Schema.Struct({
  ...DialogProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
})

const Message = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: { reason: DialogDismissReason },
})

const Events = UiSchema.TaggedEnum({
  Opened: {},
  Closed: { reason: DialogDismissReason },
})

/** Owns disclosure state and exposes Effect UI's dialog parts to the renderer. */
export const DialogBehavior = Html.component({
  name: 'CreaseDialog',
  props: Props,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen ?? false }),
  update: {
    RequestedOpen: $ => $.evolve({ open: true }).emit(Events.Opened()),
    RequestedClose: ($, { reason }) =>
      $.evolve({ open: false }).emit(Events.Closed({ reason })),
  },
  parts: (p, model) => {
    const { defaultOpen: _defaultOpen, open = model.open, ...options } = p.props
    return p.child(Dialog, {
      props: { ...options, open },
      onEmit: {
        RequestedOpen: () => Message.RequestedOpen(),
        RequestedClose: ({ reason }) => Message.RequestedClose({ reason }),
        Settled: () => undefined,
      },
      parts: dialog => dialog,
    })
  },
})
