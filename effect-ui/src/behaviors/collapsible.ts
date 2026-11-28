import { Html } from '@effect/ui/html'
import {
  Collapsible,
  CollapsibleEvents,
  CollapsibleProps,
} from '@effect/ui-kit'
import { Schema } from 'effect'

const Props = Schema.Struct({
  ...CollapsibleProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
})

/** Owns disclosure unless the consumer supplies `open`. */
export const CollapsibleBehavior = Html.component({
  name: 'CreaseCollapsible',
  props: Props,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: CollapsibleEvents,
  events: CollapsibleEvents,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen ?? false }),
  update: {
    Toggled: ($, event) => $.evolve({ open: event.open }).emit(event),
    Settled: ($, event) => $.emit(event),
  },
  parts: (p, model) => {
    const { defaultOpen: _defaultOpen, open = model.open, ...props } = p.props
    return p.child(Collapsible, {
      props: { ...props, open },
      onEmit: { Toggled: event => event, Settled: event => event },
      parts: collapsible => collapsible,
    })
  },
})
