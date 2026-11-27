import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { DateTimeInput, Icon } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Value = Schema.Struct({
  date: Schema.NullOr(Schema.String),
  time: Schema.NullOr(Schema.String),
})
const validationFields = [
  {
    label: 'Meeting time',
    value: { date: '2026-01-25', time: '09:00' },
    status: { type: 'error', message: 'This time slot is already booked' },
  },
  {
    label: 'Preferred time',
    value: { date: '2026-12-25', time: '14:00' },
    status: { type: 'warning', message: 'This falls outside business hours' },
  },
  {
    label: 'Start time',
    value: { date: '2026-03-10', time: '10:30' },
    status: { type: 'success', message: 'Time confirmed' },
  },
] as const

const validationDisplay = [
  ['Jan 25, 2026', '9:00 AM'],
  ['Dec 25, 2026', '2:00 PM'],
  ['Mar 10, 2026', '10:30 AM'],
] as const
const validationIcon = {
  error: 'octagon-x',
  warning: 'triangle-alert',
  success: 'circle-check',
} as const
const validationTone = {
  error: 'border-destructive text-destructive',
  warning: 'border-warning text-warning',
  success: 'border-success text-success',
} as const
const validationBox = (
  h: Html.H<DocsMessage>,
  kind: 'date' | 'time',
  value: string,
  type: 'error' | 'warning' | 'success',
) =>
  h.div
    .class(
      `relative flex h-8 min-w-0 ${kind === 'date' ? 'w-71' : 'w-63'} items-center gap-2 rounded-md border border-input bg-transparent px-2 py-1 shadow-xs ${validationTone[type]}`,
    )
    .style({
      borderColor:
        type === 'error'
          ? 'var(--destructive)'
          : type === 'warning'
            ? 'var(--warning)'
            : 'var(--success)',
    })
    .children(
      Icon(h, {
        name: kind === 'date' ? ('calendar' as never) : ('clock' as never),
        size: 'sm',
        className: 'shrink-0 text-muted-foreground',
      }),
      h.input
        .class(
          'block min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-foreground outline-none',
        )
        .attrs({ type: 'text', readonly: '' })
        .value(value),
      kind === 'date'
        ? Icon(h, {
            name: validationIcon[type] as never,
            size: 'sm',
            className: 'shrink-0',
          })
        : undefined,
    )
const validationField = (
  h: Html.H<DocsMessage>,
  field: (typeof validationFields)[number],
  index: number,
) =>
  h.div.class('grid gap-2').children(
    h.label
      .class(
        'flex items-center gap-2 text-sm leading-none font-medium select-none',
      )
      .children(field.label),
    h.div
      .class('flex flex-wrap gap-2')
      .children(
        validationBox(
          h,
          'date',
          validationDisplay[index]![0],
          field.status.type,
        ),
        validationBox(
          h,
          'time',
          validationDisplay[index]![1],
          field.status.type,
        ),
      ),
    h.div
      .class(
        field.status.type === 'error'
          ? 'text-sm text-destructive'
          : field.status.type === 'warning'
            ? 'text-sm text-warning'
            : 'text-sm text-success',
      )
      .attr('role', 'status')
      .children(field.status.message),
  )

const Message = UiSchema.TaggedEnum({
  CommittedDate: { slot: Schema.Number, value: Schema.NullOr(Schema.String) },
  CommittedTime: { slot: Schema.Number, value: Schema.NullOr(Schema.String) },
})
const DateTimeDemo = Html.component({
  name: 'DocsDateTimeInputDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ values: Schema.Array(Value) }),
  message: Message,
}).make({
  init: h => ({
    values:
      h.props.kind === 'validation'
        ? validationFields.map(field => field.value)
        : h.props.kind === 'options'
          ? [{ date: '2026-03-15', time: '09:00' }]
          : [{ date: null, time: null }],
  }),
  update: {
    CommittedDate: ($, { slot, value }) =>
      $.evolve({
        values: $.model.values.map((entry, index) =>
          index === slot ? { ...entry, date: value } : entry,
        ),
      }),
    CommittedTime: ($, { slot, value }) =>
      $.evolve({
        values: $.model.values.map((entry, index) =>
          index === slot ? { ...entry, time: value } : entry,
        ),
      }),
  },
  view: (h, model) => {
    const render = (
      slot: number,
      label: string,
      status?: { type: 'error' | 'warning' | 'success'; message: string },
    ) => {
      const value = model.values[slot] ?? { date: null, time: null }
      return h.div.key(String(slot)).children(
        DateTimeInput(h, {
          id: `${h.props.idPrefix}-${slot}`,
          label,
          ...(h.props.kind === 'options' ? { timeOptionInterval: 30 } : {}),
          date: {
            label: `${label} date`,
            hideLabel: true,
            placeholder: 'Select a date',
            presentation: 'popover',
            clearable: true,
            invalid: status?.type === 'error',
            props: { value: value.date },
            onCommit: next => Message.CommittedDate({ slot, value: next }),
          },
          time: {
            label: `${label} time`,
            hideLabel: true,
            clearable: true,
            invalid: status?.type === 'error',
            props: { value: value.time },
            onCommit: next => Message.CommittedTime({ slot, value: next }),
          },
        }),
        status === undefined
          ? undefined
          : h.div
              .class(
                status.type === 'error'
                  ? 'mt-2 text-sm text-destructive'
                  : status.type === 'warning'
                    ? 'mt-2 text-sm text-warning'
                    : 'mt-2 text-sm text-success',
              )
              .attr('role', 'status')
              .children(status.message),
      )
    }
    return h.div
      .class('grid w-full min-w-60 max-w-100 gap-4')
      .children(
        h.props.kind === 'validation'
          ? validationFields.map(
              (field, slot) =>
                validationField(h as never, field, slot) as never,
            )
          : [render(0, 'Meeting time')],
      )
  },
})

const view =
  (
    kind: 'single' | 'validation' | 'options',
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    DateTimeDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    }) as never

const source = exampleApplicationSource({
  imports: `import { DateTimeInput } from '@/ui/effect/ui'`,
  body: `DateTimeInput(h, {
  key: 'meeting-time',
  id: 'meeting-time',
  label: 'Meeting time',
  date: {
    label: 'Meeting date',
    presentation: 'popover',
    props: { value: date },
    onCommit: value => CommittedDate({ value }),
  },
  time: {
    label: 'Meeting time',
    props: { value: time },
    onCommit: value => CommittedTime({ value }),
  },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { DateTimeInput } from '@/ui/effect/ui'\n\nDateTimeInput(h, { key, id, label, date, time })`,
  examples: [
    { title: 'Date Time Input', view: view('single'), source },
    { title: 'DateTimeInput — Validation', view: view('validation'), source },
    { title: 'DateTimeInput — Time options', view: view('options'), source },
  ],
})
