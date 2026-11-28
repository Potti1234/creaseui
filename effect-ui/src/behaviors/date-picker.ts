import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Popover, PopoverProps } from '@effect/ui-kit'
import { Schema } from 'effect'

import {
  CalendarBehavior,
  CalendarBehaviorProps,
  CalendarDate,
} from './calendar'

const Props = Schema.Struct({
  ...PopoverProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
  calendar: CalendarBehaviorProps,
})
const Message = UiSchema.TaggedEnum({
  Opened: { triggerId: Schema.NullOr(Schema.String) },
  Closed: {},
  Picked: { date: Schema.NullOr(CalendarDate) },
})
const Events = UiSchema.TaggedEnum({
  OpenChanged: { open: Schema.Boolean },
  Picked: { date: Schema.NullOr(CalendarDate) },
})

/** Owns disclosure and closes it after a pick when the consumer leaves it uncontrolled. */
export const DatePickerBehavior = Html.component({
  name: 'CreaseDatePicker',
  props: Props,
  model: Schema.Struct({
    open: Schema.Boolean,
    triggerId: Schema.NullOr(Schema.String),
  }),
  message: Message,
  events: Events,
}).make({
  init: ({ props }) => ({ open: props.defaultOpen ?? false, triggerId: null }),
  update: {
    Opened: ($, { triggerId }) =>
      $.evolve({ open: true, triggerId }).emit(
        Events.OpenChanged({ open: true }),
      ),
    Closed: $ =>
      $.evolve({ open: false }).emit(Events.OpenChanged({ open: false })),
    Picked: ($, { date }) =>
      $.evolve({ open: false })
        .emit(Events.Picked({ date }))
        .emit(Events.OpenChanged({ open: false })),
  },
  parts: (p, model) => {
    const {
      calendar: props,
      defaultOpen: _defaultOpen,
      open = model.open,
      triggerId = model.triggerId,
      ...popupProps
    } = p.props
    const clear = p.part('button', element =>
      element
        .attr('type', 'button')
        .on('click', Message.Picked({ date: null })),
    )
    return p.child(Popover, {
      props: {
        side: 'bottom',
        align: 'start',
        sideOffset: 4,
        ...popupProps,
        open,
        triggerId,
      },
      onEmit: {
        RequestedOpen: ({ triggerId }) => Message.Opened({ triggerId }),
        RequestedClose: () => Message.Closed(),
        Settled: () => undefined,
      },
      parts: popup =>
        p.child(CalendarBehavior, {
          key: props.value ?? 'empty',
          props,
          onEmit: { Picked: ({ date }) => Message.Picked({ date }) },
          parts: calendar => ({ popup, calendar, clear }),
        }),
    })
  },
})
