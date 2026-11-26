import { Html } from '@effect/ui/html'
import {
  PreviewCard,
  PreviewCardEvents,
  PreviewCardProps,
} from '@effect/ui-kit'
import { Schema } from 'effect'

export { PopoverBehavior as HoverCardButtonBehavior } from './popover'

const Props = Schema.Struct({
  ...PreviewCardProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
})

export const HoverCardBehavior = Html.component({
  name: 'CreaseHoverCard',
  props: Props,
  model: Schema.Struct({
    open: Schema.Boolean,
    triggerId: Schema.NullOr(Schema.String),
  }),
  message: PreviewCardEvents,
  events: PreviewCardEvents,
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
    return p.child(PreviewCard, {
      props: { sideOffset: 4, ...options, open, triggerId },
      onEmit: {
        RequestedOpen: event => event,
        RequestedClose: event => event,
        Settled: event => event,
      },
      parts: card => card,
    })
  },
})
