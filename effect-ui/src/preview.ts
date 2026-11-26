import { UiSchema } from '@effect/ui'
import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'

import {
  Accordion,
  Button,
  ButtonLink,
  Calendar,
  Checkbox,
  Collapsible,
  Combobox,
  Dialog,
  Input,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Separator,
  Slider,
  Switch,
  Tabs,
  Toggle,
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
  ToggledPin: { pressed: Schema.Boolean },
  UpdatedProfileName: { value: Schema.String },
  PickedFrequency: { value: Schema.String },
  MovedVolume: { value: Schema.Number },
  MovedRange: { value: Schema.Array(Schema.Number) },
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
    pinned: Schema.Boolean,
    profileName: Schema.String,
    frequency: Schema.String,
    volume: Schema.Number,
    range: Schema.Array(Schema.Number),
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
    pinned: false,
    profileName: 'Ada',
    frequency: 'daily',
    volume: 40,
    range: [20, 70],
  }),
  update: {
    Pressed: $ => $.evolve({ presses: count => count + 1 }),
    PickedFruit: ($, { value }) => $.evolve({ fruit: value }),
    PickedDate: ($, { value }) => $.evolve({ date: value }),
    PickedTheme: ($, { value }) => $.evolve({ theme: value }),
    ToggledSummary: ($, { checked }) => $.evolve({ summary: checked }),
    ToggledAlerts: ($, { checked }) => $.evolve({ alerts: checked }),
    SelectedSettingsTab: ($, { value }) => $.evolve({ settingsTab: value }),
    ToggledPin: ($, { pressed }) => $.evolve({ pinned: pressed }),
    UpdatedProfileName: ($, { value }) => $.evolve({ profileName: value }),
    PickedFrequency: ($, { value }) => $.evolve({ frequency: value }),
    MovedVolume: ($, { value }) => $.evolve({ volume: value }),
    MovedRange: ($, { value }) => $.evolve({ range: value }),
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
          h.h2.attr('id', 'retention-policy').children('Tooltip'),
          Tooltip(h, {
            key: 'retention-button',
            props: { delay: 250 },
            trigger: Button(h, { variant: 'outline' }).children(
              'Retention details',
            ),
            content: 'Archived items are kept for 30 days.',
          }),
          Tooltip(h, {
            key: 'retention-link',
            props: { delay: 250 },
            trigger: ButtonLink(h, {
              href: '#retention-policy',
              variant: 'link',
            }).children('Retention policy'),
            content: 'Read the retention policy.',
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
        h.section.class('example').children(
          h.h2.children('Collapsible'),
          Collapsible(h, {
            props: { keepMounted: 'css' },
            trigger: Button(h, { variant: 'outline' }).children(
              'Show storage details',
            ),
            content: h.p.children('Files are stored in your workspace.'),
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Progress'),
          Progress(h, {
            key: 'files-uploaded',
            props: { value: 3, max: 5 },
            label: 'Files uploaded',
            showValue: true,
          }),
          Progress(h, {
            key: 'preparing-report',
            props: { value: null },
            label: 'Preparing report',
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Toggle and Separator'),
          Toggle(h, {
            props: { pressed: model.pinned },
            onToggle: Message.ToggledPin,
            variant: 'outline',
          }).children('Pin item'),
          Separator(h),
          h.div.children('Recent items'),
        ),
        h.section.class('example').children(
          h.h2.children('Input and Radio Group'),
          h.form.class('example-label').children(
            Input(h, {
              id: 'profile-name',
              label: 'Profile name',
              description: 'Shown on your profile.',
              element: h.input.attrs({
                name: 'profileName',
                autocomplete: 'name',
              }),
              props: { value: model.profileName },
              onUpdate: Message.UpdatedProfileName,
            }),
            RadioGroup(h, {
              id: 'summary-frequency',
              ariaLabel: 'Summary frequency',
              props: { value: model.frequency, name: 'frequency' },
              items: [
                { value: 'daily', label: 'Daily' },
                { value: 'hourly', label: 'Hourly', disabled: true },
                {
                  value: 'weekly',
                  label: 'Weekly',
                  description: 'Send on Monday.',
                },
              ],
              onEmit: { Picked: Message.PickedFrequency },
            }),
          ),
        ),
        h.section.class('example').children(
          h.h2.children('Slider'),
          h.form.class('example-label').children(
            Slider(h, {
              key: 'volume',
              label: 'Volume',
              showValue: true,
              name: 'volume',
              props: { value: model.volume },
              onEmit: {
                Moved: ({ value }) =>
                  typeof value === 'number'
                    ? Message.MovedVolume({ value })
                    : undefined,
                Committed: () => undefined,
              },
            }),
            Slider(h, {
              key: 'volume-limit',
              label: 'Volume limit',
              showValue: true,
              name: 'limit',
              readOnly: true,
              props: { value: 80 },
            }),
            Slider(h, {
              key: 'range',
              label: 'Frequency range',
              thumbLabels: ['Minimum frequency', 'Maximum frequency'],
              showValue: true,
              name: 'range',
              props: {
                value: model.range,
                orientation: 'vertical',
                step: 5,
                minStepsBetweenValues: 2,
                thumbCollisionBehavior: 'none',
              },
              onEmit: {
                Moved: ({ value }) =>
                  typeof value === 'number'
                    ? undefined
                    : Message.MovedRange({ value }),
                Committed: () => undefined,
              },
            }),
          ),
        ),
      ),
    ),
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing preview root')
Layer.launch(BrowserHost.mount(Preview, {}, root)).pipe(Effect.runFork)
