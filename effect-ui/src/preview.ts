import { UiSchema } from '@effect/ui'
import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'

import { Button, Calendar, Combobox, Dialog } from '#components'
import { CalendarDate } from './behaviors/calendar'
import '#theme'
import './preview.css'

const Message = UiSchema.TaggedEnum({
  Pressed: {},
  PickedFruit: { value: Schema.NullOr(Schema.String) },
  PickedDate: { value: CalendarDate },
})

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'pear', label: 'Pear' },
  { value: 'plum', label: 'Plum', disabled: true },
]
const today = new Date().toISOString().slice(0, 10)

const Preview = Html.component({
  name: 'CreaseUiPreview',
  message: Message,
  model: Schema.Struct({
    presses: Schema.Number,
    fruit: Schema.NullOr(Schema.String),
    date: Schema.NullOr(CalendarDate),
  }),
}).make({
  init: () => ({ presses: 0, fruit: 'banana', date: null }),
  update: {
    Pressed: $ => $.evolve({ presses: count => count + 1 }),
    PickedFruit: ($, { value }) => $.evolve({ fruit: value }),
    PickedDate: ($, { value }) => $.evolve({ date: value }),
  },
  view: (h, model) =>
    h.main.class('preview').children(
      h.h1.children('CreaseUI for Effect UI'),
      h.div.class('examples').children(
        h.section
          .class('example example-compact')
          .children(
            h.h2.children('Button'),
            Button(h, { onPress: Message.Pressed() }).children('Count'),
            Button(h, { disabled: true, variant: 'outline' }).children(
              'Disabled',
            ),
            h.output.children(`Presses: ${model.presses}`),
          ),
        h.section.class('example example-compact').children(
          h.h2.children('Dialog'),
          Dialog(h, {
            props: {},
            title: 'Edit profile',
            description:
              'Try opening the dialog with the keyboard and closing it with Escape.',
            trigger: Button(h, { variant: 'outline' }).children('Edit profile'),
            content: h.label
              .class('example-label')
              .children(
                'Display name',
                h.input.class('example-input').attr('autocomplete', 'name'),
              ),
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Combobox'),
          Combobox(h, {
            label: 'Fruit',
            placeholder: 'Choose fruit',
            props: { items: fruits, value: model.fruit },
            onEmit: { Picked: Message.PickedFruit },
          }),
          h.output.children(`Selected fruit: ${model.fruit ?? 'None'}`),
        ),
        h.section.class('example').children(
          h.h2.children('Calendar'),
          Calendar(h, {
            props: { today, locale: 'en-US', value: model.date },
            onEmit: {
              Picked: ({ date }) => Message.PickedDate({ value: date }),
            },
          }),
          h.output.children(`Selected date: ${model.date ?? 'None'}`),
        ),
      ),
    ),
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing preview root')
Layer.launch(BrowserHost.mount(Preview, {}, root)).pipe(Effect.runFork)
