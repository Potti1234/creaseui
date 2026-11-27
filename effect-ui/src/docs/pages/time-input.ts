import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { TimeInput } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Entry = Readonly<{
  id: string
  label: string
  initial: string | null
  placeholder?: string
  min?: string
  max?: string
  increment?: number
  hourFormat?: '12h' | '24h'
  presentation?: 'input' | 'select'
  seconds?: boolean
  clear?: boolean
  disabled?: boolean
  description?: string
  status?: Readonly<{ type: 'error' | 'warning' | 'success'; message: string }>
}>
const fixtures: Readonly<Record<string, ReadonlyArray<Entry>>> = {
  basic: [
    { id: 'time', label: 'Time', placeholder: 'Select a time', initial: null },
  ],
  constrained: [
    {
      id: 'dinner',
      label: 'Dinner reservation',
      min: '17:00',
      max: '22:00',
      description: 'Evening seating: 5 PM – 10 PM',
      placeholder: 'Select reservation time',
      clear: true,
      initial: null,
    },
  ],
  formats: [
    { id: '24h', label: '24-hour', hourFormat: '24h', initial: '14:30' },
    {
      id: 'seconds',
      label: 'With seconds',
      seconds: true,
      initial: '14:30:45',
    },
  ],
  increment: [
    {
      id: 'slot',
      label: 'Appointment slot',
      increment: 15,
      description: 'Use arrow keys to change by 15 minutes',
      initial: '09:00',
      clear: true,
    },
  ],
  states: [
    {
      id: 'disabled',
      label: 'Disabled field',
      initial: '10:00',
      disabled: true,
    },
    {
      id: 'error',
      label: 'Error message',
      initial: '22:00',
      status: { type: 'error', message: 'Time must be during business hours' },
    },
    {
      id: 'warning',
      label: 'Warning message',
      initial: '07:00',
      status: { type: 'warning', message: 'Early morning — are you sure?' },
    },
    {
      id: 'success',
      label: 'Success message',
      initial: '10:00',
      status: { type: 'success', message: 'Time slot is available' },
    },
  ],
  picker: [
    {
      id: 'picker-24h',
      label: '24-hour time',
      presentation: 'select',
      hourFormat: '24h',
      initial: '10:30',
      clear: true,
    },
    {
      id: 'picker-12h',
      label: '12-hour time with seconds',
      presentation: 'select',
      seconds: true,
      initial: '14:30:45',
    },
    {
      id: 'picker-constrained',
      label: 'Business hours',
      presentation: 'select',
      hourFormat: '24h',
      initial: '10:30',
      min: '09:15',
      max: '17:45',
      description: 'Available from 09:15 to 17:45',
    },
    {
      id: 'picker-disabled',
      label: 'Disabled picker',
      presentation: 'select',
      hourFormat: '24h',
      initial: '10:30',
      disabled: true,
    },
  ],
}
const Message = UiSchema.TaggedEnum({
  CommittedTime: { id: Schema.String, value: Schema.NullOr(Schema.String) },
})
const TimesDemo = Html.component({
  name: 'DocsTimeInputs',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({
    values: Schema.Record(Schema.String, Schema.NullOr(Schema.String)),
  }),
  message: Message,
}).make({
  init: ({ props }) => ({
    values: Object.fromEntries(
      (fixtures[props.kind] ?? []).map(entry => [entry.id, entry.initial]),
    ),
  }),
  update: {
    CommittedTime: ($, { id, value }) =>
      $.evolve({ values: { ...$.model.values, [id]: value } }),
  },
  view: (h, model) =>
    h.div.class('flex w-full max-w-sm flex-col gap-3').children(
      h.props.kind === 'formats'
        ? h.p
            .class('text-xs text-muted-foreground')
            .children('Format variations for different contexts')
        : undefined,
      (fixtures[h.props.kind] ?? []).map(entry =>
        TimeInput(h, {
          key: entry.id,
          id: `${h.props.idPrefix}-${entry.id}`,
          label: entry.label,
          ...(entry.description === undefined
            ? {}
            : { description: entry.description }),
          ...(entry.placeholder === undefined
            ? {}
            : { placeholder: entry.placeholder }),
          ...(entry.clear === true ? { clearable: true } : {}),
          ...(entry.presentation === undefined
            ? {}
            : { presentation: entry.presentation }),
          ...(entry.status === undefined
            ? {}
            : {
                status: h.span
                  .class(
                    entry.status.type === 'error'
                      ? 'text-destructive'
                      : entry.status.type === 'warning'
                        ? 'text-warning'
                        : 'text-success',
                  )
                  .children(entry.status.message),
              }),
          invalid: entry.status?.type === 'error',
          props: {
            value: model.values[entry.id] ?? null,
            ...(entry.min === undefined ? {} : { min: entry.min }),
            ...(entry.max === undefined ? {} : { max: entry.max }),
            ...(entry.increment === undefined
              ? {}
              : { increment: entry.increment }),
            ...(entry.hourFormat === undefined
              ? {}
              : { hourFormat: entry.hourFormat }),
            ...(entry.seconds === true ? { hasSeconds: true } : {}),
            ...(entry.disabled === true ? { disabled: true } : {}),
          },
          onCommit: value => Message.CommittedTime({ id: entry.id, value }),
        }),
      ),
    ),
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    TimesDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    })
const source = exampleApplicationSource({
  imports: `import { TimeInput } from '@/ui/effect/ui'`,
  body: `TimeInput(h, {
  key: 'time',
  id: 'time',
  label: 'Time',
  props: { value: model.time },
  onCommit: value => CommittedTime({ value }),
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { TimeInput } from '@/ui/effect/ui'\n\nTimeInput(h, { key: 'time', id: 'time', label: 'Time', props: { value }, onCommit })`,
  examples: [
    { title: 'Time Input', view: view('basic'), source },
    { title: 'TimeInput — Constrained', view: view('constrained'), source },
    { title: 'TimeInput — Formats', view: view('formats'), source },
    { title: 'TimeInput — Increment', view: view('increment'), source },
    { title: 'TimeInput — States', view: view('states'), source },
    { title: 'Hour and Minute Picker', view: view('picker'), source },
  ],
})
