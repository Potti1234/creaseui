import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Slider } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './slider.css'

type Instance = Readonly<{
  id: string
  values: ReadonlyArray<number>
  min: number
  max: number
  step: number
  orientation?: 'horizontal' | 'vertical'
  direction?: 'ltr' | 'rtl'
  label?: string
  showValue?: boolean
}>
type Config = Readonly<{
  instances: ReadonlyArray<Instance>
  vertical?: boolean
  controlled?: boolean
  disabled?: boolean
}>

const Message = UiSchema.TaggedEnum({
  MovedSlider: {
    id: Schema.String,
    value: Schema.Union([Schema.Number, Schema.Array(Schema.Number)]),
  },
})
const demo = (name: string, config: Config) =>
  Html.component({
    name,
    model: Schema.Struct({
      values: Schema.Record(Schema.String, Schema.Array(Schema.Number)),
    }),
    message: Message,
  }).make({
    init: () => ({
      values: Object.fromEntries(
        config.instances.map(instance => [instance.id, [...instance.values]]),
      ),
    }),
    update: {
      MovedSlider: ($, { id, value }) =>
        $.evolve({
          values: {
            ...$.model.values,
            [id]: typeof value === 'number' ? [value] : value,
          },
        }),
    },
    view: (h, model) => {
      const sliders = config.instances.map(instance =>
        Slider(h, {
          key: instance.id,
          ariaLabel: instance.label ?? instance.id,
          ...(instance.label === undefined ? {} : { label: instance.label }),
          showValue: instance.showValue ?? false,
          ...(instance.direction === undefined
            ? {}
            : { direction: instance.direction }),
          props: {
            value: model.values[instance.id] ?? [...instance.values],
            min: instance.min,
            max: instance.max,
            step: instance.step,
            orientation: instance.orientation,
            disabled: config.disabled,
          },
          onEmit: {
            Moved: ({ value }) =>
              Message.MovedSlider({ id: instance.id, value }),
            Committed: () => undefined,
          },
        }),
      )
      if (config.vertical === true)
        return h.div.class('slider-docs-vertical').children(sliders)
      if (config.controlled === true) {
        const values = model.values['temperature'] ?? [0.3, 0.7]
        return h.div
          .class('slider-docs-controlled')
          .children(
            h.div
              .class('slider-docs-caption')
              .children(
                h.span
                  .class('slider-docs-caption-label')
                  .children('Temperature'),
                h.span
                  .class('slider-docs-caption-value')
                  .children(values.join(', ')),
              ),
            sliders,
          )
      }
      return h.div.class('slider-docs-frame').children(sliders)
    },
  })

const source = exampleApplicationSource({
  imports: `import { Slider } from '@/ui/effect/ui'
import './slider.css'`,
  body: `Slider(h, {
  key: 'volume',
  ariaLabel: 'Volume',
  props: { value: model.volume, min: 0, max: 100, step: 1 },
  onEmit: {
    Moved: ({ value }) => typeof value === 'number' ? Message.MovedVolume({ value }) : undefined,
    Committed: () => undefined,
  },
})`,
})

const configs: ReadonlyArray<readonly [string, Config]> = [
  [
    'Basic',
    { instances: [{ id: 'basic', values: [75], min: 0, max: 100, step: 1 }] },
  ],
  [
    'Range',
    {
      instances: [{ id: 'range', values: [25, 50], min: 0, max: 100, step: 5 }],
    },
  ],
  [
    'Multiple Thumbs',
    {
      instances: [
        { id: 'multi', values: [10, 20, 70], min: 0, max: 100, step: 10 },
      ],
    },
  ],
  [
    'Vertical',
    {
      vertical: true,
      instances: [
        {
          id: 'v1',
          values: [50],
          min: 0,
          max: 100,
          step: 1,
          orientation: 'vertical',
        },
        {
          id: 'v2',
          values: [25],
          min: 0,
          max: 100,
          step: 1,
          orientation: 'vertical',
        },
      ],
    },
  ],
  [
    'Controlled',
    {
      controlled: true,
      instances: [
        { id: 'temperature', values: [0.3, 0.7], min: 0, max: 1, step: 0.1 },
      ],
    },
  ],
  [
    'Disabled',
    {
      disabled: true,
      instances: [{ id: 'disabled', values: [50], min: 0, max: 100, step: 1 }],
    },
  ],
  [
    'RTL',
    {
      instances: [
        {
          id: 'rtl',
          values: [75],
          min: 0,
          max: 100,
          step: 1,
          direction: 'rtl',
        },
      ],
    },
  ],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Slider } from '@/ui/effect/ui'

Slider(h, {
  key: 'volume',
  ariaLabel: 'Volume',
  props: { value: model.volume, min: 0, max: 100, step: 1 },
  onEmit: {
    Moved: ({ value }) => typeof value === 'number' ? Message.MovedVolume({ value }) : undefined,
    Committed: () => undefined,
  },
})`,
  examples: configs.map(([title, config], index) => {
    const Demo = demo(`DocsSlider${index}`, config)
    return {
      title,
      view: ((h, context) =>
        Demo(h, {
          key: `${context.idPrefix}-slider`,
          props: {},
        })) as DocsExampleImplementation['view'],
      source,
    }
  }),
})
