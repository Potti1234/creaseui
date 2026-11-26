import { Html } from '@effect/ui/html'
import { Accordion, AccordionEvents, AccordionProps } from '@effect/ui-kit'
import { Schema } from 'effect'

export { AccordionItem as AccordionItemBehavior } from '@effect/ui-kit'
export type { AccordionItemProps } from '@effect/ui-kit'

const Values = Schema.Array(Schema.String)
const Props = Schema.Struct({
  ...AccordionProps.fields,
  value: Schema.optional(Values),
  defaultValue: Schema.optional(Values),
})

/** Uses local disclosure state unless the consumer supplies the open values. */
export const AccordionBehavior = Html.component({
  name: 'CreaseAccordion',
  props: Props,
  model: Schema.Struct({ value: Values }),
  message: AccordionEvents,
  events: AccordionEvents,
}).make({
  init: ({ props }) => ({ value: props.defaultValue ?? [] }),
  update: {
    Toggled: ($, event) => $.evolve({ value: event.value }).emit(event),
  },
  parts: (p, model) => {
    const {
      defaultValue: _defaultValue,
      value = model.value,
      ...options
    } = p.props
    return p.child(Accordion, {
      props: {
        ...options,
        value: options.multiple ? value : value.slice(0, 1),
      },
      onEmit: { Toggled: event => event },
      parts: accordion => accordion,
    })
  },
})
