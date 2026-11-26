import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Combobox, ComboboxItem } from '@effect/ui-kit'
import { Schema } from 'effect'

const Props = Schema.Struct({
  items: Schema.Array(ComboboxItem),
  value: Schema.NullOr(Schema.String),
  disabled: Schema.optional(Schema.Boolean),
  name: Schema.optional(Schema.String),
  required: Schema.optional(Schema.Boolean),
})

const Message = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: {},
  Edited: { text: Schema.String },
  Picked: { value: Schema.NullOr(Schema.String) },
})

const Events = UiSchema.TaggedEnum({
  Picked: { value: Schema.NullOr(Schema.String) },
})

/** Owns popup and draft text while the consumer owns the committed selection. */
export const ComboboxBehavior = Html.component({
  name: 'CreaseCombobox',
  props: Props,
  model: Schema.Struct({
    open: Schema.Boolean,
    draft: Schema.NullOr(Schema.String),
  }),
  message: Message,
  events: Events,
}).make({
  init: () => ({ open: false, draft: null }),
  update: {
    RequestedOpen: $ => $.evolve({ open: true }),
    RequestedClose: $ => $.evolve({ open: false, draft: null }),
    Edited: ($, { text }) => $.evolve({ draft: text }),
    Picked: ($, { value }) =>
      $.evolve({ open: false, draft: null }).emit(Events.Picked({ value })),
  },
  parts: (p, model) => {
    const { items, value } = p.props
    const label = items.find(item => item.value === value)?.label ?? ''
    return p.child(Combobox, {
      props: {
        ...p.props,
        open: model.open,
        inputValue: model.draft ?? label,
      },
      onEmit: {
        RequestedOpen: () => Message.RequestedOpen(),
        RequestedClose: () => Message.RequestedClose(),
        RequestedInputValue: ({ inputValue }) =>
          Message.Edited({ text: inputValue }),
        Picked: ({ value }) =>
          typeof value === 'string' || value === null
            ? Message.Picked({ value })
            : undefined,
        Highlighted: () => undefined,
        Settled: () => undefined,
      },
      parts: combobox => combobox,
    })
  },
})
