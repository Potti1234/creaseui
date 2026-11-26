import { Html } from '@effect/ui/html'
import { Select, SelectEvents, SelectProps } from '@effect/ui-kit'
import { Schema } from 'effect'

const Props = Schema.Struct({
  ...SelectProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
})

/** Owns the popup when uncontrolled. The consumer owns the selected value. */
export const SelectBehavior = Html.component({
  name: 'CreaseSelect',
  props: Props,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: SelectEvents,
  events: SelectEvents,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen ?? false }),
  update: {
    RequestedOpen: ($, event) => $.evolve({ open: true }).emit(event),
    RequestedClose: ($, event) => $.evolve({ open: false }).emit(event),
    Picked: ($, event) => $.emit(event),
    Settled: ($, event) => $.emit(event),
  },
  parts: (p, model) => {
    const { defaultOpen: _defaultOpen, open = model.open, ...options } = p.props
    return p.child(Select, {
      props: {
        side: 'bottom',
        align: 'start',
        sideOffset: 4,
        alignItemWithTrigger: false,
        ...options,
        open,
      },
      onEmit: {
        RequestedOpen: event => event,
        RequestedClose: event => event,
        Picked: event => event,
        Settled: event => event,
      },
      parts: select => select,
    })
  },
})
