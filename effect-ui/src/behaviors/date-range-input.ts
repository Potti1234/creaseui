import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Popover, PopoverProps } from '@effect/ui-kit'
import { Schema } from 'effect'

import {
  CalendarRange,
  RangeCalendarBehavior,
  RangeCalendarBehaviorProps,
} from './calendar'

const Props = Schema.Struct({
  ...PopoverProps.fields,
  open: Schema.optional(Schema.Boolean),
  defaultOpen: Schema.optional(Schema.Boolean),
  calendar: RangeCalendarBehaviorProps,
})
const Message = UiSchema.TaggedEnum({
  Opened: { triggerId: Schema.NullOr(Schema.String) },
  Closed: {},
  Picked: { value: Schema.NullOr(CalendarRange) },
})
const Events = UiSchema.TaggedEnum({
  OpenChanged: { open: Schema.Boolean },
  Picked: { value: Schema.NullOr(CalendarRange) },
})

export const DateRangeInputBehavior = Html.component({
  name: 'CreaseDateRangeInput',
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
    Picked: ($, { value }) =>
      $.evolve({ open: false })
        .emit(Events.Picked({ value }))
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
    const preset = p.part(
      'button',
      (element, value: typeof CalendarRange.Type | null) =>
        element
          .attr('type', 'button')
          .disabled(props.disabled === true || props.readOnly === true)
          .on('click', Message.Picked({ value })),
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
        p.child(RangeCalendarBehavior, {
          key:
            props.value === null
              ? 'empty'
              : `${props.value.start}/${props.value.end}`,
          props,
          onEmit: {
            Picked: ({ start, end }) =>
              Message.Picked({ value: { start, end } }),
          },
          parts: calendar => ({ popup, calendar, preset }),
        }),
    })
  },
})
