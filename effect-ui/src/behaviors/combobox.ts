import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Combobox, ComboboxItem } from '@effect/ui-kit'
import { Schema } from 'effect'

const Props = Schema.Struct({
  items: Schema.Array(ComboboxItem),
  value: Schema.NullOr(
    Schema.Union([Schema.String, Schema.Array(Schema.String)]),
  ),
  multiple: Schema.optional(Schema.Boolean),
  disabled: Schema.optional(Schema.Boolean),
  readOnly: Schema.optional(Schema.Boolean),
  name: Schema.optional(Schema.String),
  required: Schema.optional(Schema.Boolean),
})

const Message = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: {},
  Edited: { text: Schema.String },
  Picked: { value: Props.fields.value },
})

const Events = UiSchema.TaggedEnum({
  Picked: { value: Props.fields.value },
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
    Picked: ($, { value }) => $.emit(Events.Picked({ value })),
  },
  parts: (p, model) => {
    const { items, value } = p.props
    const multiple = p.props.multiple ?? Array.isArray(value)
    const label = multiple
      ? ''
      : (items.find(item => item.value === value)?.label ?? '')
    // The kit draws consecutive runs as groups. Keep each name in one run so
    // repeated group names share one accessible label and the keyboard order.
    const groups = new Map<string | undefined, (typeof items)[number][]>()
    for (const item of items) {
      const group = groups.get(item.group)
      if (group === undefined) groups.set(item.group, [item])
      else group.push(item)
    }
    return p.child(Combobox, {
      props: {
        ...p.props,
        items: Array.from(groups.values()).flat(),
        multiple,
        open: model.open,
        inputValue: model.draft ?? label,
      },
      onEmit: {
        RequestedOpen: () => Message.RequestedOpen(),
        RequestedClose: ({ reason }) =>
          multiple && reason === 'item-press'
            ? undefined
            : Message.RequestedClose(),
        RequestedInputValue: ({ inputValue }) =>
          Message.Edited({ text: inputValue }),
        Picked: ({ value }) => Message.Picked({ value }),
        Highlighted: () => undefined,
        Settled: () => undefined,
      },
      parts: combobox => combobox,
    })
  },
})
