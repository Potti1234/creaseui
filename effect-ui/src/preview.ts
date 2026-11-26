import { UiSchema } from '@effect/ui'
import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'

import {
  Accordion,
  Button,
  Calendar,
  Checkbox,
  Combobox,
  Dialog,
  Popover,
  Select,
  Switch,
  Tabs,
  Tooltip,
} from '#components'
import { CalendarDate } from './behaviors/calendar'
import '#theme'
import './preview.css'

const Message = UiSchema.TaggedEnum({
  Pressed: {},
  PickedFruit: { value: Schema.NullOr(Schema.String) },
  PickedDate: { value: CalendarDate },
  PickedTheme: { value: Schema.NullOr(Schema.String) },
  ToggledSummary: { checked: Schema.Boolean },
  ToggledAlerts: { checked: Schema.Boolean },
  SelectedSettingsTab: { value: Schema.String },
})

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'pear', label: 'Pear' },
  { value: 'plum', label: 'Plum', disabled: true },
]
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dim', label: 'Dim', disabled: true },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
const today = new Date().toISOString().slice(0, 10)

const Preview = Html.component({
  name: 'CreaseUiPreview',
  message: Message,
  model: Schema.Struct({
    presses: Schema.Number,
    fruit: Schema.NullOr(Schema.String),
    date: Schema.NullOr(CalendarDate),
    theme: Schema.NullOr(Schema.String),
    summary: Schema.Boolean,
    alerts: Schema.Boolean,
    settingsTab: Schema.String,
  }),
}).make({
  init: () => ({
    presses: 0,
    fruit: 'banana',
    date: null,
    theme: 'light',
    summary: false,
    alerts: false,
    settingsTab: 'profile',
  }),
  update: {
    Pressed: $ => $.evolve({ presses: count => count + 1 }),
    PickedFruit: ($, { value }) => $.evolve({ fruit: value }),
    PickedDate: ($, { value }) => $.evolve({ date: value }),
    PickedTheme: ($, { value }) => $.evolve({ theme: value }),
    ToggledSummary: ($, { checked }) => $.evolve({ summary: checked }),
    ToggledAlerts: ($, { checked }) => $.evolve({ alerts: checked }),
    SelectedSettingsTab: ($, { value }) => $.evolve({ settingsTab: value }),
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
        h.section.class('example example-compact').children(
          h.h2.children('Select'),
          Select(h, {
            label: 'Theme',
            props: { items: themes, value: model.theme },
            onEmit: {
              Picked: ({ value }) =>
                typeof value === 'string' || value === null
                  ? Message.PickedTheme({ value })
                  : undefined,
              RequestedOpen: () => undefined,
              RequestedClose: () => undefined,
              Settled: () => undefined,
            },
          }),
          h.output.children(`Selected theme: ${model.theme ?? 'None'}`),
        ),
        h.section.class('example').children(
          h.h2.children('Checkbox and Switch'),
          h.form.class('example-label').children(
            Checkbox(h, {
              id: 'weekly-summary',
              label: 'Weekly summary',
              description: 'Get one email each week.',
              props: { checked: model.summary, name: 'summary' },
              onEmit: {
                Toggled: ({ checked }) => Message.ToggledSummary({ checked }),
              },
            }),
            Switch(h, {
              id: 'email-alerts',
              label: 'Email alerts',
              props: { checked: model.alerts, name: 'alerts' },
              onToggle: Message.ToggledAlerts,
            }),
          ),
        ),
        h.section.class('example').children(
          h.h2.children('Popover'),
          h.div.class('example-end').children(
            Popover(h, {
              props: { side: 'right' },
              title: 'Display options',
              trigger: Button(h, { variant: 'outline' }).children(
                'Display options',
              ),
              content: h.label
                .class('example-label')
                .children(
                  'Display name',
                  h.input.class('example-input').attr('autocomplete', 'name'),
                ),
            }),
          ),
        ),
        h.section.class('example example-compact').children(
          h.h2.children('Tooltip'),
          Tooltip(h, {
            props: { delay: 250 },
            trigger: Button(h, { variant: 'outline' }).children(
              'Retention details',
            ),
            content: 'Archived items are kept for 30 days.',
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Tabs'),
          Tabs(h, {
            ariaLabel: 'Settings',
            props: { value: model.settingsTab },
            tabs: [
              {
                value: 'profile',
                label: 'Profile',
                content: 'Update your profile.',
              },
              {
                value: 'billing',
                label: 'Billing',
                content: 'Billing is unavailable.',
                disabled: true,
              },
              {
                value: 'privacy',
                label: 'Privacy',
                content: 'Manage how information is shared.',
              },
            ],
            onEmit: {
              Selected: ({ value }) => Message.SelectedSettingsTab({ value }),
            },
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Accordion'),
          Accordion(h, {
            props: { defaultValue: ['delivery'] },
            items: [
              {
                value: 'delivery',
                trigger: 'When will it arrive?',
                content: 'Delivery takes three to five days.',
              },
              {
                value: 'return',
                trigger: 'Can I return it?',
                content: 'Returns are accepted within 30 days.',
              },
              {
                value: 'status',
                trigger: 'Where is my order?',
                content: 'Tracking is unavailable.',
                disabled: true,
              },
            ],
          }),
        ),
      ),
    ),
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing preview root')
Layer.launch(BrowserHost.mount(Preview, {}, root)).pipe(Effect.runFork)
