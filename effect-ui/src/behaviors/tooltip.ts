import { Html } from '@effect/ui/html'
import { Tooltip, TooltipEvents, TooltipProps } from '@effect/ui-kit'
import { Schema } from 'effect'

export { TooltipProvider } from '@effect/ui-kit'

const Props = Schema.Struct({
  ...TooltipProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
})

/** Supplies local visibility while preserving placement and timing in the kit. */
export const TooltipBehavior = Html.component({
  name: 'CreaseTooltip',
  props: Props,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: TooltipEvents,
  events: TooltipEvents,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen ?? false }),
  update: {
    RequestedOpen: ($, event) => $.evolve({ open: true }).emit(event),
    RequestedClose: ($, event) => $.evolve({ open: false }).emit(event),
  },
  parts: (p, model) => {
    const { defaultOpen: _defaultOpen, open = model.open, ...options } = p.props
    return p.child(Tooltip, {
      props: {
        side: 'top',
        sideOffset: 4,
        describesTrigger: true,
        ...options,
        open,
      },
      onEmit: {
        RequestedOpen: event => event,
        RequestedClose: event => event,
      },
      parts: tooltip => tooltip,
    })
  },
})
