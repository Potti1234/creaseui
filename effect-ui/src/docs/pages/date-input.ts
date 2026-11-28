import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { DateInput } from '#components'
import type { DocsExampleImplementation } from '../types'
import { defineComponentDocs, type DocsMessage } from '../types'
import { exampleApplicationSource } from './source'

const formatExamples = [
  { label: 'Short month (date)', format: 'date' },
  { label: 'Long month (date_long, default)', format: 'date_long' },
  { label: 'With weekday (date_weekday)', format: 'date_weekday' },
  { label: 'ISO 8601 (system_date)', format: 'system_date' },
  { label: 'Custom function', format: (iso: string) => `Ship by ${iso}` },
] as const
const validationFields = [
  {
    label: 'Event date',
    status: { type: 'error', message: 'This date is already booked' },
  },
  {
    label: 'Preferred date',
    status: { type: 'warning', message: 'This date falls on a holiday' },
  },
  {
    label: 'Start date',
    status: { type: 'success', message: 'Date confirmed' },
  },
] as const
const initialValues: Record<string, readonly (string | null)[]> = {
  clearable: ['2026-04-06'],
  formats: [
    '2026-03-21',
    '2026-03-21',
    '2026-03-21',
    '2026-03-21',
    '2026-03-21',
  ],
  validation: ['2026-01-25', '2026-12-25', '2026-03-10'],
  single: [null],
  description: [null],
  constraints: [null],
}

const Message = UiSchema.TaggedEnum({
  CommittedDate: { slot: Schema.Number, value: Schema.NullOr(Schema.String) },
})
const DateInputDemo = Html.component({
  name: 'DocsDateInputDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ values: Schema.Array(Schema.NullOr(Schema.String)) }),
  message: Message,
}).make({
  init: ({ props }) => ({ values: [...initialValues[props.kind]!] }),
  update: {
    CommittedDate: ($, { slot, value }) =>
      $.evolve({
        values: $.model.values.map((current, index) =>
          index === slot || $.props.kind === 'formats' ? value : current,
        ),
      }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const today = new Date().toISOString().slice(0, 10)
    const min = `${today.slice(0, 8)}08`
    const max = `${today.slice(0, 8)}21`
    const inputAt = (
      slot: number,
      options: {
        label: string
        description?: string
        placeholder?: string
        presentation?:
          | 'input'
          | 'native-picker'
          | 'popover'
          | 'adaptive-bottom-sheet'
        format?: (typeof formatExamples)[number]['format']
        status?: (typeof validationFields)[number]['status']
      },
    ) =>
      DateInput(h, {
        id: `${h.props.idPrefix}-${slot}`,
        label: options.label,
        ...(options.description === undefined
          ? {}
          : { description: options.description }),
        ...(options.placeholder === undefined
          ? {}
          : { placeholder: options.placeholder }),
        ...(options.presentation === undefined
          ? {}
          : { presentation: options.presentation }),
        ...(options.format === undefined ? {} : { format: options.format }),
        ...(kind === 'constraints' ? { min, max } : {}),
        ...(options.status === undefined
          ? {}
          : {
              invalid: options.status.type === 'error',
              status: h.p
                .class(
                  options.status.type === 'error'
                    ? 'm-0 text-sm text-destructive'
                    : options.status.type === 'warning'
                      ? 'm-0 text-sm text-amber-600 dark:text-amber-500'
                      : 'm-0 text-sm text-emerald-600 dark:text-emerald-500',
                )
                .children(options.status.message),
            }),
        clearable: true,
        props: { value: model.values[slot] ?? null },
        today,
        onCommit: value => Message.CommittedDate({ slot, value }),
      })
    const supporting = (text: string) =>
      h.p.class('text-muted-foreground text-sm').children(text)
    const selected = model.values[0]
    const children =
      kind === 'clearable'
        ? [
            supporting(
              selected === null || selected === undefined
                ? 'No date selected'
                : `Selected: ${selected}`,
            ),
            inputAt(0, {
              label: 'Event date',
              description: 'Pick a date for your event',
              placeholder: 'Select a date',
            }),
          ]
        : kind === 'constraints'
          ? [
              supporting(
                selected === null || selected === undefined
                  ? 'Pick a date in the available range'
                  : `Booked: ${selected}`,
              ),
              inputAt(0, {
                label: 'Booking date',
                description: `Available dates: ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(`${today}T00:00:00Z`))} 8 – 21, ${today.slice(0, 4)}`,
                placeholder: 'Select a booking date',
                presentation: 'adaptive-bottom-sheet',
              }),
            ]
          : kind === 'formats'
            ? [
                supporting(
                  'The same committed date, displayed with different formats.',
                ),
                ...formatExamples.map((entry, index) =>
                  inputAt(index, { label: entry.label, format: entry.format }),
                ),
              ]
            : kind === 'validation'
              ? validationFields.map((field, index) =>
                  inputAt(index, { label: field.label, status: field.status }),
                )
              : kind === 'description'
                ? [
                    supporting('Helper text explains what the field expects'),
                    inputAt(0, {
                      label: 'Start date',
                      description: 'Your subscription begins on this date',
                      placeholder: 'Select a start date',
                    }),
                  ]
                : [
                    inputAt(0, {
                      label: 'Start date',
                      placeholder: 'Select a date',
                    }),
                  ]
    return h.div
      .class('grid w-full max-w-100 min-w-60 gap-4')
      .children(children as never)
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    DateInputDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    }) as never

const source = exampleApplicationSource({
  imports: `import { DateInput } from '@/ui/effect/ui'`,
  body: `DateInput(h, {
  id: 'start-date',
  label: 'Start date',
  placeholder: 'Select a date',
  clearable: true,
  props: { calendar: { today, value } },
  onCommit: value => CommittedDate({ value }),
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { DateInput } from '@/ui/effect/ui'\n\nDateInput(h, { id, label, props, onCommit })`,
  examples: [
    { title: 'Date Input', view: view('single'), source },
    { title: 'Clearable', view: view('clearable'), source },
    { title: 'Min/Max Constraints', view: view('constraints'), source },
    { title: 'Formats', view: view('formats'), source },
    { title: 'Description', view: view('description'), source },
    { title: 'Validation', view: view('validation'), source },
  ],
})
