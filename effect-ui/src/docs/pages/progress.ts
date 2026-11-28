import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'
import { Progress, Slider } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './progress.css'

const ProgressDemoMessage = UiSchema.TaggedEnum({
  MovedValue: { value: Schema.Number },
})
const ControlledDemo = Html.component({
  name: 'DocsProgressControlledDemo',
  model: Schema.Struct({ value: Schema.Number }),
  message: ProgressDemoMessage,
}).make({
  init: () => ({ value: 50 }),
  update: {
    MovedValue: ($, { value }) => $.evolve({ value }),
  },
  view: (h, model) =>
    h.div.class('progress-docs-column').children(
      Progress(h, {
        key: 'controlled-progress',
        props: { value: model.value },
      }),
      Slider(h, {
        key: 'progress-slider',
        ariaLabel: 'Progress value',
        props: { value: model.value, min: 0, max: 100, step: 1 },
        onEmit: {
          Moved: ({ value }) =>
            typeof value === 'number'
              ? ProgressDemoMessage.MovedValue({ value })
              : undefined,
          Committed: () => undefined,
        },
      }),
    ),
})

const labeled =
  (rtl = false): DocsExampleImplementation['view'] =>
  (h, context) =>
    Progress(h, {
      key: `${context.idPrefix}-${rtl ? 'rtl' : 'label'}-progress`,
      id: `${context.idPrefix}-upload`,
      label: rtl ? 'تقدم الرفع' : 'Upload progress',
      showValue: true,
      direction: rtl ? 'rtl' : 'ltr',
      className: 'progress-docs-field',
      props: { value: 66, valueText: rtl ? '٦٦%' : '66%' },
    })

const specimen =
  (
    key: string,
    value: number | null,
    max: number | undefined,
    ariaLabel: string,
    valueText: string,
    narrow = false,
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    Progress(h, {
      key: `${context.idPrefix}-${key}`,
      ariaLabel,
      className: narrow ? 'progress-docs-narrow' : 'progress-docs-wide',
      props: {
        value,
        ...(max === undefined ? {} : { max }),
        valueText,
      },
    })

const progressSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Progress, Slider } from '@/ui/effect/ui'
import './progress.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Progress } from '@/ui/effect/ui'

Progress(h, { props: { value: 66 } })`,
  examples: [
    {
      title: 'Basic',
      view: (h, context) =>
        Progress(h, {
          key: `${context.idPrefix}-basic`,
          className: 'progress-docs-60',
          props: { value: 66 },
        }),
      source: progressSource(
        `Progress(h, { className: 'progress-docs-60', props: { value: 66 } })`,
      ),
    },
    {
      title: 'Label',
      view: labeled(),
      source: progressSource(`Progress(h, {
  label: 'Upload progress',
  showValue: true,
  props: { value: 66, valueText: '66%' },
})`),
    },
    {
      title: 'Controlled',
      view: (h, context) =>
        ControlledDemo(h, {
          key: `${context.idPrefix}-controlled`,
          props: {},
        }),
      source: progressSource(`h.div.class('progress-docs-column').children(
  Progress(h, { props: { value: model.value } }),
  Slider(h, {
    props: { value: model.value, min: 0, max: 100, step: 1 },
    onEmit: { Moved: ({ value }) => Message.MovedValue({ value }) },
  }),
)`),
    },
    {
      title: 'RTL',
      view: labeled(true),
      source: progressSource(`Progress(h, {
  label: 'تقدم الرفع',
  direction: 'rtl',
  showValue: true,
  props: { value: 66, valueText: '٦٦%' },
})`),
    },
    {
      title: 'Determinate',
      view: specimen(
        'determinate',
        64,
        80,
        'Upload progress',
        '64 of 80 files',
      ),
      source: progressSource(`Progress(h, {
  ariaLabel: 'Upload progress',
  props: { value: 64, max: 80, valueText: '64 of 80 files' },
})`),
    },
    {
      title: 'Indeterminate',
      view: specimen(
        'indeterminate',
        null,
        undefined,
        'Loading report',
        'Loading',
      ),
      source: progressSource(`Progress(h, {
  ariaLabel: 'Loading report',
  props: { value: null, valueText: 'Loading' },
})`),
    },
    {
      title: 'Narrow Range',
      view: specimen('narrow', 3, 4, 'Setup progress', '3 of 4 steps', true),
      source: progressSource(`Progress(h, {
  ariaLabel: 'Setup progress',
  className: 'progress-docs-narrow',
  props: { value: 3, max: 4, valueText: '3 of 4 steps' },
})`),
    },
  ],
})
