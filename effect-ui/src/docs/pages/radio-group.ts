import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { RadioGroup } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './radio-group.css'

type OptionSpec = Readonly<{
  value: string
  label: string
  description?: string
  disabled?: boolean
  invalid?: boolean
}>
type Fixture = Readonly<{
  title: string
  selected: string
  ariaLabel: string
  width: 'fit' | 'sm' | 'xs'
  readOnly?: boolean
  rtl?: boolean
  fieldLegend?: string
  fieldDescription?: string
  options: ReadonlyArray<OptionSpec>
}>

const density: ReadonlyArray<OptionSpec> = [
  {
    value: 'default',
    label: 'Default',
    description: 'Standard spacing for most use cases.',
  },
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'More space between elements.',
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Minimal spacing for dense layouts.',
  },
]
const labelsOnly = density.map(({ value, label }) => ({ value, label }))

const fixtures: ReadonlyArray<Fixture> = [
  {
    title: 'Basic',
    selected: 'comfortable',
    ariaLabel: 'Density',
    width: 'fit',
    options: labelsOnly,
  },
  {
    title: 'Description',
    selected: 'comfortable',
    ariaLabel: 'Density',
    width: 'fit',
    options: density,
  },
  {
    title: 'Choice Card',
    selected: 'plus',
    ariaLabel: 'Plan',
    width: 'sm',
    options: [
      {
        value: 'plus',
        label: 'Plus',
        description: 'For individuals and small teams.',
      },
      { value: 'pro', label: 'Pro', description: 'For growing businesses.' },
      {
        value: 'enterprise',
        label: 'Enterprise',
        description: 'For large teams and enterprises.',
      },
    ],
  },
  {
    title: 'Fieldset',
    selected: 'monthly',
    ariaLabel: 'Subscription Plan',
    width: 'xs',
    fieldLegend: 'Subscription Plan',
    fieldDescription: 'Yearly and lifetime plans offer significant savings.',
    options: [
      { value: 'monthly', label: 'Monthly ($9.99/month)' },
      { value: 'yearly', label: 'Yearly ($99.99/year)' },
      { value: 'lifetime', label: 'Lifetime ($299.99)' },
    ],
  },
  {
    title: 'Disabled',
    selected: 'option2',
    ariaLabel: 'Options',
    width: 'fit',
    options: [
      { value: 'option1', label: 'Disabled', disabled: true },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
  {
    title: 'Invalid',
    selected: 'email',
    ariaLabel: 'Notification Preferences',
    width: 'xs',
    fieldLegend: 'Notification Preferences',
    fieldDescription: 'Choose how you want to receive notifications.',
    options: [
      { value: 'email', label: 'Email only', invalid: true },
      { value: 'sms', label: 'SMS only', invalid: true },
      { value: 'both', label: 'Both Email & SMS', invalid: true },
    ],
  },
  {
    title: 'Read Only',
    selected: 'comfortable',
    ariaLabel: 'Density',
    width: 'fit',
    readOnly: true,
    options: labelsOnly,
  },
  {
    title: 'RTL',
    selected: 'comfortable',
    ariaLabel: 'Density',
    width: 'fit',
    rtl: true,
    options: [
      {
        value: 'default',
        label: 'افتراضي',
        description: 'تباعد قياسي لمعظم حالات الاستخدام.',
      },
      {
        value: 'comfortable',
        label: 'مريح',
        description: 'مساحة أكبر بين العناصر.',
      },
      {
        value: 'compact',
        label: 'مضغوط',
        description: 'تباعد أدنى للتخطيطات الكثيفة.',
      },
    ],
  },
]

const Message = UiSchema.TaggedEnum({ Picked: { value: Schema.String } })
const demo = (name: string, fixture: Fixture) =>
  Html.component({
    name,
    model: Schema.Struct({ value: Schema.String }),
    message: Message,
  }).make({
    init: () => ({ value: fixture.selected }),
    update: { Picked: ($, { value }) => $.evolve({ value }) },
    view: (h, model) => {
      const group = RadioGroup(h, {
        key: 'group',
        id: `${name}-radio`,
        ariaLabel: fixture.ariaLabel,
        className: `radio-docs-${fixture.width}`,
        direction: fixture.rtl === true ? 'rtl' : 'ltr',
        props: {
          value: model.value,
          readOnly: fixture.readOnly,
          name: `${name}-radio`,
        },
        items: fixture.options.map(option => ({
          value: option.value,
          label: option.label,
          ...(option.description === undefined
            ? {}
            : { description: option.description }),
          ...(option.disabled === true ? { disabled: true } : {}),
          ...(option.invalid === true ? { invalid: true } : {}),
        })),
        onEmit: { Picked: ({ value }) => Message.Picked({ value }) },
      })
      return fixture.fieldLegend === undefined
        ? group
        : h.fieldset
            .class('radio-docs-fieldset')
            .children(
              h.legend.class('radio-docs-legend').children(fixture.fieldLegend),
              h.p
                .class('radio-docs-description')
                .children(fixture.fieldDescription ?? ''),
              group,
            )
    },
  })

const source = exampleApplicationSource({
  imports: `import { RadioGroup } from '@/ui/effect/ui'
import './radio-group.css'`,
  body: `RadioGroup(h, {
  id: 'density',
  ariaLabel: 'Density',
  props: { value: model.density, name: 'density' },
  items: [{ value: 'comfortable', label: 'Comfortable' }],
  onEmit: { Picked: ({ value }) => Message.PickedDensity({ value }) },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { RadioGroup } from '@/ui/effect/ui'

RadioGroup(h, {
  id: 'density',
  ariaLabel: 'Density',
  props: { value: model.density, name: 'density' },
  items: [{ value: 'comfortable', label: 'Comfortable' }],
  onEmit: { Picked: ({ value }) => Message.PickedDensity({ value }) },
})`,
  examples: fixtures.map((fixture, index) => {
    const Demo = demo(`DocsRadio${index}`, fixture)
    return {
      title: fixture.title,
      view: ((h, context) =>
        Demo(h, {
          key: `${context.idPrefix}-radio`,
          props: {},
        })) as DocsExampleImplementation['view'],
      source,
    }
  }),
})
