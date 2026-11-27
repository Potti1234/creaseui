import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { DateRangeInput } from '#components'
import type { DateRangePreset } from '../../ui/date-range-input'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Range = Schema.Struct({ start: Schema.String, end: Schema.String })
type RangeValue = typeof Range.Type
const isoDaysAgo = (days: number) => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}
const today = new Date().toISOString().slice(0, 10)
const makePresets = (days: readonly number[]): readonly DateRangePreset[] =>
  days.map(count => ({
    label: `Last ${count} days`,
    value: { start: isoDaysAgo(count), end: today },
  }))
const validationFields = [
  {
    label: 'Booking period',
    value: { start: '2026-01-01', end: '2026-01-31' },
    status: {
      type: 'error',
      message: 'Selected dates are no longer available',
    },
  },
  {
    label: 'Preferred period',
    value: { start: '2026-06-01', end: '2026-06-30' },
    status: { type: 'warning', message: 'High demand — limited availability' },
  },
  {
    label: 'Confirmed period',
    value: { start: '2026-03-01', end: '2026-03-31' },
    status: { type: 'success', message: 'Dates confirmed and available' },
  },
] as const

const Message = UiSchema.TaggedEnum({
  PickedRange: { slot: Schema.Number, value: Schema.NullOr(Range) },
})
const DateRangeDemo = Html.component({
  name: 'DocsDateRangeInputDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ values: Schema.Array(Schema.NullOr(Range)) }),
  message: Message,
}).make({
  init: h => ({
    values:
      h.props.kind === 'validation'
        ? validationFields.map(field => field.value)
        : [null],
  }),
  update: {
    PickedRange: ($, { slot, value }) =>
      $.evolve({
        values: $.model.values.map((entry, index) =>
          index === slot ? value : entry,
        ),
      }),
  },
  view: (h, model) => {
    const inputAt = (
      slot: number,
      options: {
        label: string
        description?: string
        presets?: readonly DateRangePreset[]
        status?: { type: 'error' | 'warning' | 'success'; message: string }
      },
    ) =>
      DateRangeInput(h, {
        key: `${h.props.idPrefix}-${slot}`,
        id: `${h.props.idPrefix}-${slot}`,
        label: options.label,
        clearable: true,
        invalid: options.status?.type === 'error',
        ...(options.description === undefined
          ? {}
          : { description: options.description }),
        ...(options.presets === undefined ? {} : { presets: options.presets }),
        ...(options.status === undefined
          ? {}
          : {
              status: h.div
                .class(
                  options.status.type === 'error'
                    ? 'text-sm text-destructive'
                    : options.status.type === 'warning'
                      ? 'text-sm text-warning'
                      : 'text-sm text-success',
                )
                .attr('role', 'status')
                .children(options.status.message),
            }),
        props: {
          calendar: { today, value: model.values[slot] ?? null },
        },
        onEmit: {
          OpenChanged: () => undefined,
          Picked: ({ value }) => Message.PickedRange({ slot, value }),
        },
      })
    const rangeText = (value: RangeValue | null) =>
      value === null ? 'No range selected' : `${value.start} – ${value.end}`
    return h.div.class('grid w-full max-w-100 gap-4').children(
      h.props.kind === 'validation'
        ? validationFields.map((field, slot) =>
            inputAt(slot, { label: field.label, status: field.status }),
          )
        : [
            h.props.kind === 'presets'
              ? h.p
                  .class('text-muted-foreground text-sm')
                  .children(rangeText(model.values[0] ?? null))
              : undefined,
            inputAt(0, {
              label:
                h.props.kind === 'presets' ? 'Report period' : 'Date range',
              ...(h.props.kind === 'presets'
                ? {
                    description: 'Use a preset or pick a custom range',
                    presets: makePresets([7, 14, 30, 90]),
                  }
                : { presets: makePresets([7, 30]) }),
            }),
          ],
    )
  },
})

const view =
  (
    kind: 'showcase' | 'presets' | 'validation',
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    DateRangeDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    }) as never

const source = exampleApplicationSource({
  imports: `import { DateRangeInput } from '@/ui/effect/ui'`,
  body: `DateRangeInput(h, {
  key: 'report-period',
  id: 'report-period',
  label: 'Report period',
  clearable: true,
  presets,
  props: { calendar: { today, value: range } },
  onEmit: { Picked: ({ value }) => PickedRange({ value }) },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { DateRangeInput } from '@/ui/effect/ui'\n\nDateRangeInput(h, { key, id, label, props, onEmit })`,
  examples: [
    { title: 'Date Range Input', view: view('showcase'), source },
    { title: 'With Presets', view: view('presets'), source },
    { title: 'Validation', view: view('validation'), source },
  ],
})
