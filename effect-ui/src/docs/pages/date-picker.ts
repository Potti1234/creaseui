import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { DatePicker, Input, Label } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  PickedDate: { field: Schema.String, value: Schema.NullOr(Schema.String) },
  ChangedQuery: { value: Schema.String },
})
const DatePickerDemo = Html.component({
  name: 'DocsDatePickerDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({
    dates: Schema.Record(Schema.String, Schema.NullOr(Schema.String)),
    query: Schema.String,
  }),
  message: Message,
}).make({
  init: ({ props }) => ({
    dates: {
      main: null,
      start: '2026-01-20',
      end: '2026-02-09',
    },
    query: '',
  }),
  update: {
    PickedDate: ($, { field, value }) =>
      $.evolve({ dates: dates => ({ ...dates, [field]: value }) }),
    ChangedQuery: ($, { value }) => $.evolve({ query: value }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const prefix = h.props.idPrefix
    const picker = (
      field: string,
      label: string,
      placeholder: string,
      extra: Record<string, unknown> = {},
    ) =>
      DatePicker(h, {
        key: `${prefix}-${field}`,
        label,
        placeholder,
        clearable: true,
        direction: kind === 'rtl' ? 'rtl' : undefined,
        captionLayout: kind === 'dob' ? 'dropdown' : undefined,
        props: {
          calendar: {
            today: '2026-07-08',
            value: model.dates[field] ?? null,
            locale: kind === 'rtl' ? 'ar-SA' : 'en-US',
          },
        },
        onEmit: {
          Picked: ({ date }: any) =>
            Message.PickedDate({
              field,
              value: date === null ? null : String(date).slice(0, 10),
            }),
          OpenChanged: () => undefined,
        },
        ...extra,
      } as any)
    const field = (label: string, control: unknown) =>
      h.div
        .class('grid gap-2')
        .children(Label(h, {}).children(label) as never, control as never)
    if (kind === 'range')
      return h.div
        .class('flex flex-wrap items-end gap-3')
        .children(
          field(
            'Start date',
            picker('start', 'Start date', 'Pick a date') as never,
          ),
          h.span.class('pb-2 text-muted-foreground').children('→'),
          field('End date', picker('end', 'End date', 'Pick a date') as never),
        )
    if (kind === 'input' || kind === 'natural')
      return picker(
        'main',
        kind === 'input' ? 'Date' : 'When',
        kind === 'input' ? 'Select date' : 'Tomorrow at noon',
        {
          query: {
            value: model.query,
            label: kind === 'input' ? 'Enter a date' : 'Natural language',
            error:
              model.query.length > 8 && Number.isNaN(Date.parse(model.query))
                ? 'Enter a valid date.'
                : undefined,
            onInput: (value: string) => Message.ChangedQuery({ value }),
          },
        } as never,
      )
    if (kind === 'time')
      return h.div.class('flex flex-wrap items-end gap-3').children(
        field('Date', picker('main', 'Date', 'Select date') as never),
        h.div.class('grid gap-2').children(
          Label(h, { for: `${prefix}-time` }).children('Time') as never,
          Input(h, {
            id: `${prefix}-time`,
            element: h.input.attrs({ type: 'time' }),
            props: { value: '10:30' },
            onUpdate: () => undefined,
          }) as never,
        ),
      )
    const label =
      kind === 'dob'
        ? 'Date of birth'
        : kind === 'rtl'
          ? 'اختر تاريخًا'
          : 'Pick a date'
    const content = picker('main', label, label)
    return kind === 'demo'
      ? content
      : field(kind === 'dob' ? 'Date of birth' : 'Date', content as never)
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    DatePickerDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { DatePicker } from '@/ui/effect/ui'`,
  body: `DatePicker(h, {
  key: 'date',
  label: 'Date',
  placeholder: 'Pick a date',
  props: {
    calendar: { today, value: model.date, locale: 'en-US' },
  },
  onEmit: {
    Picked: ({ date }) => PickedDate({ date }),
    OpenChanged: () => undefined,
  },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { DatePicker } from '@/ui/effect/ui'\n\nDatePicker(h, { key, label, props: { calendar }, onEmit })`,
  examples: [
    { title: 'Pick a date', view: view('demo'), source },
    { title: 'Basic', view: view('basic'), source },
    { title: 'Range Picker', view: view('range'), source },
    { title: 'Date of Birth', view: view('dob'), source },
    { title: 'Input', view: view('input'), source },
    { title: 'Time Picker', view: view('time'), source },
    { title: 'Natural Language Picker', view: view('natural'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
