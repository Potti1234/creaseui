import { Html } from '@effect/ui/html'
import { Popover, PopoverEvents, PopoverProps } from '@effect/ui-kit'
import { Schema } from 'effect'

const Props = Schema.Struct({
  ...PopoverProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
})

/** Tracks the active trigger and supplies open state when the consumer omits it. */
export const PopoverBehavior = Html.component({
  name: 'CreasePopover',
  props: Props,
  model: Schema.Struct({
    open: Schema.Boolean,
    triggerId: Schema.NullOr(Schema.String),
  }),
  message: PopoverEvents,
  events: PopoverEvents,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen ?? false, triggerId: null }),
  update: {
    RequestedOpen: ($, event) =>
      $.evolve({ open: true, triggerId: event.triggerId }).emit(event),
    RequestedClose: ($, event) => $.evolve({ open: false }).emit(event),
    Settled: ($, event) => $.emit(event),
  },
  parts: (p, model) => {
    const {
      defaultOpen: _defaultOpen,
      open = model.open,
      triggerId = model.triggerId,
      ...options
    } = p.props
    return p.child(Popover, {
      props: { sideOffset: 4, ...options, open, triggerId },
      onEmit: {
        RequestedOpen: event => event,
        RequestedClose: event => event,
        Settled: event => event,
      },
      parts: popover => popover,
    })
  },
})
