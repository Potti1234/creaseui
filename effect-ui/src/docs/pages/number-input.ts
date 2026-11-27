import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { NumberInput } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Entry = Readonly<{
  id: string
  label: string
  initial: number | null
  placeholder?: string
  units?: string
  min?: number
  max?: number
  description?: string
  status?: Readonly<{ type: 'error' | 'warning' | 'success'; message: string }>
  clear?: boolean
  steppers?: boolean
  items?: boolean
}>
const fixtures: Readonly<Record<string, ReadonlyArray<Entry>>> = {
  basic: [
    {
      id: 'quantity',
      label: 'Quantity',
      placeholder: 'Enter quantity',
      initial: 0,
      items: true,
      steppers: true,
    },
  ],
  clearable: [
    {
      id: 'progress',
      label: 'Progress',
      units: '%',
      min: 0,
      max: 100,
      initial: 75,
      clear: true,
    },
  ],
  range: [
    {
      id: 'team-size',
      label: 'Team Size',
      placeholder: '1–50',
      min: 1,
      max: 50,
      description: 'Number of people on the team',
      initial: 3,
    },
  ],
  status: [
    {
      id: 'budget',
      label: 'Budget',
      initial: -5,
      status: { type: 'error', message: 'Must be a positive amount' },
    },
    {
      id: 'headcount',
      label: 'Headcount',
      initial: 150,
      status: { type: 'warning', message: 'Exceeds typical team size' },
    },
    {
      id: 'completion',
      label: 'Completion',
      units: '%',
      initial: 25,
      status: { type: 'success', message: 'On track' },
    },
  ],
  units: [
    {
      id: 'discount',
      label: 'Discount',
      placeholder: 'Enter discount',
      min: 0,
      max: 100,
      units: '%',
      initial: 50,
    },
  ],
}
const Message = UiSchema.TaggedEnum({
  UpdatedValue: { id: Schema.String, value: Schema.NullOr(Schema.Number) },
})
const NumberInputsDemo = Html.component({
  name: 'DocsNumberInputs',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({
    values: Schema.Record(Schema.String, Schema.NullOr(Schema.Number)),
  }),
  message: Message,
}).make({
  init: ({ props }) => ({
    values: Object.fromEntries(
      (fixtures[props.kind] ?? []).map(entry => [entry.id, entry.initial]),
    ),
  }),
  update: {
    UpdatedValue: ($, { id, value }) =>
      $.evolve({ values: { ...$.model.values, [id]: value } }),
  },
  view: (h, model) =>
    h.div.class('grid w-full max-w-xs gap-4').children(
      (fixtures[h.props.kind] ?? []).map(entry =>
        NumberInput(h, {
          key: entry.id,
          id: `${h.props.kind}-${entry.id}`,
          label: [entry.label],
          ...(entry.description === undefined
            ? {}
            : { description: [entry.description] }),
          ...(entry.status === undefined
            ? {}
            : { status: { ...entry.status, announcement: 'status' as const } }),
          ...(entry.units === undefined ? {} : { units: entry.units }),
          ...(entry.placeholder === undefined
            ? {}
            : { placeholder: entry.placeholder }),
          ...(entry.items === true
            ? { formatValue: (value: number) => `${value} items` }
            : {}),
          ...(entry.clear === true
            ? { onClear: Message.UpdatedValue({ id: entry.id, value: null }) }
            : {}),
          steppers: entry.steppers === true,
          props: {
            value: model.values[entry.id] ?? null,
            ...(entry.min === undefined ? {} : { min: entry.min }),
            ...(entry.max === undefined ? {} : { max: entry.max }),
          },
          onEmit: {
            Updated: ({ value }) =>
              Message.UpdatedValue({ id: entry.id, value }),
            Committed: () => undefined,
          },
        }),
      ),
    ),
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    NumberInputsDemo(h, { key: `${context.idPrefix}-${kind}`, props: { kind } })
const source = exampleApplicationSource({
  imports: `import { NumberInput } from '@/ui/effect/ui'`,
  body: `NumberInput(h, {
  key: 'quantity',
  id: 'quantity',
  label: ['Quantity'],
  props: { value: model.quantity, min: 0 },
  onEmit: { Updated: ({ value }) => UpdatedQuantity({ value }) },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { NumberInput } from '@/ui/effect/ui'\n\nNumberInput(h, { key: 'amount', id: 'amount', label: ['Amount'], props: { value }, onEmit })`,
  examples: [
    { title: 'Number Input', view: view('basic'), source },
    { title: 'NumberInput — Clearable', view: view('clearable'), source },
    { title: 'NumberInput — Range Constrained', view: view('range'), source },
    { title: 'NumberInput — Status Variants', view: view('status'), source },
    { title: 'NumberInput — With Units', view: view('units'), source },
  ],
})
