import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { NativeSelect } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './native-select.css'

type Option = Readonly<{ value: string; label: string }>
type Spec = Readonly<{
  placeholder: string
  options: ReadonlyArray<Option>
  groups?: ReadonlyArray<
    Readonly<{ label: string; options: ReadonlyArray<Option> }>
  >
  disabled?: boolean
  invalid?: boolean
  rtl?: boolean
}>

const status: ReadonlyArray<Option> = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
]
const fruit: ReadonlyArray<Option> = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
]

const specs: Record<string, Spec> = {
  demo: { placeholder: 'Select status', options: status },
  groups: {
    placeholder: 'Select department',
    options: [],
    groups: [
      {
        label: 'Engineering',
        options: [
          { value: 'frontend', label: 'Frontend' },
          { value: 'backend', label: 'Backend' },
          { value: 'devops', label: 'DevOps' },
        ],
      },
      {
        label: 'Sales',
        options: [
          { value: 'sales-rep', label: 'Sales Rep' },
          { value: 'account-manager', label: 'Account Manager' },
          { value: 'sales-director', label: 'Sales Director' },
        ],
      },
      {
        label: 'Operations',
        options: [
          { value: 'support', label: 'Customer Support' },
          { value: 'product-manager', label: 'Product Manager' },
          { value: 'ops-manager', label: 'Operations Manager' },
        ],
      },
    ],
  },
  disabled: { placeholder: 'Disabled', options: fruit, disabled: true },
  invalid: { placeholder: 'Error state', options: fruit, invalid: true },
  rtl: {
    placeholder: 'اختر الحالة',
    options: [
      { value: 'todo', label: 'مهام' },
      { value: 'in-progress', label: 'قيد التنفيذ' },
      { value: 'done', label: 'منجز' },
      { value: 'cancelled', label: 'ملغي' },
    ],
    rtl: true,
  },
}

const Message = UiSchema.TaggedEnum({ ChangedValue: { value: Schema.String } })
const SelectDemo = Html.component({
  name: 'DocsNativeSelectDemo',
  props: Schema.Struct({ kind: Schema.String, id: Schema.String }),
  model: Schema.Struct({ value: Schema.String }),
  message: Message,
}).make({
  init: () => ({ value: '' }),
  update: { ChangedValue: ($, { value }) => $.evolve({ value }) },
  view: (h, model) => {
    const spec = (specs[h.props.kind] ?? specs.demo)!
    return h.div.class('native-select-docs-frame').children(
      NativeSelect(h, {
        id: h.props.id,
        value: model.value,
        onChange: value => Message.ChangedValue({ value }),
        options: [{ value: '', label: spec.placeholder }, ...spec.options],
        ...(spec.groups === undefined ? {} : { groups: spec.groups }),
        ...(spec.invalid === true ? { invalid: true } : {}),
        element: h.select.attrs({
          disabled: spec.disabled === true ? '' : undefined,
          dir: spec.rtl === true ? 'rtl' : undefined,
        }),
      }),
    )
  },
})

const render =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    SelectDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, id: `${context.idPrefix}-select` },
    })

const source = exampleApplicationSource({
  imports: `import { NativeSelect } from '@/ui/effect/ui'
import './native-select.css'`,
  body: `NativeSelect(h, {
  id: 'status',
  value: model.value,
  onChange: value => Message.ChangedValue({ value }),
  options: [{ value: '', label: 'Select status' }],
})`,
})

const examples: ReadonlyArray<readonly [string, string]> = [
  ['Basic', 'demo'],
  ['Groups', 'groups'],
  ['Disabled', 'disabled'],
  ['Invalid', 'invalid'],
  ['RTL', 'rtl'],
]

export const componentDocs = defineComponentDocs({
  usage: `import { NativeSelect } from '@/ui/effect/ui'

NativeSelect(h, { id: 'status', value: model.value, onChange: value => Message.ChangedValue({ value }) })`,
  examples: examples.map(([title, kind]) => ({
    title,
    view: render(kind),
    source,
  })),
})
