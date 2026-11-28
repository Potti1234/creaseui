import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Select, Switch } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Item = {
  readonly value: string
  readonly label: string
  readonly group?: string
  readonly disabled?: boolean
}

const fruits: readonly Item[] = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'blueberry', label: 'Blueberry', group: 'Fruits' },
  { value: 'grapes', label: 'Grapes', group: 'Fruits' },
  { value: 'pineapple', label: 'Pineapple', group: 'Fruits' },
]
const grouped: readonly Item[] = [
  ...fruits.slice(0, 3),
  { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
  { value: 'broccoli', label: 'Broccoli', group: 'Vegetables' },
  { value: 'spinach', label: 'Spinach', group: 'Vegetables' },
]
const tz = (
  group: string,
  items: readonly (readonly [string, string])[],
): readonly Item[] => items.map(([value, label]) => ({ value, label, group }))
const timezones: readonly Item[] = [
  ...tz('North America', [
    ['est', 'Eastern Standard Time'],
    ['cst', 'Central Standard Time'],
    ['mst', 'Mountain Standard Time'],
    ['pst', 'Pacific Standard Time'],
    ['akst', 'Alaska Standard Time'],
    ['hst', 'Hawaii Standard Time'],
  ]),
  ...tz('Europe & Africa', [
    ['gmt', 'Greenwich Mean Time'],
    ['cet', 'Central European Time'],
    ['eet', 'Eastern European Time'],
    ['west', 'Western European Summer Time'],
    ['cat', 'Central Africa Time'],
    ['eat', 'East Africa Time'],
  ]),
  ...tz('Asia', [
    ['msk', 'Moscow Time'],
    ['ist', 'India Standard Time'],
    ['cst_china', 'China Standard Time'],
    ['jst', 'Japan Standard Time'],
    ['kst', 'Korea Standard Time'],
    ['ist_indonesia', 'Indonesia Central Standard Time'],
  ]),
  ...tz('Australia & Pacific', [
    ['awst', 'Australian Western Standard Time'],
    ['acst', 'Australian Central Standard Time'],
    ['aest', 'Australian Eastern Standard Time'],
    ['nzst', 'New Zealand Standard Time'],
    ['fjt', 'Fiji Time'],
  ]),
  ...tz('South America', [
    ['art', 'Argentina Time'],
    ['bot', 'Bolivia Time'],
    ['brt', 'Brasilia Time'],
    ['clt', 'Chile Standard Time'],
  ]),
]
const rtlItems: readonly Item[] = [
  { value: 'apple', label: 'تفاح', group: 'الفواكه' },
  { value: 'banana', label: 'موز', group: 'الفواكه' },
  { value: 'blueberry', label: 'توت أزرق', group: 'الفواكه' },
  { value: 'grapes', label: 'عنب', group: 'الفواكه' },
  { value: 'pineapple', label: 'أناناس', group: 'الفواكه' },
  { value: 'carrot', label: 'جزر', group: 'الخضروات' },
  { value: 'broccoli', label: 'بروكلي', group: 'الخضروات' },
  { value: 'spinach', label: 'سبانخ', group: 'الخضروات' },
]

const fixtureItems: Record<string, readonly Item[]> = {
  basic: fruits,
  alignItem: fruits.map(({ value, label }) => ({ value, label })),
  groups: grouped,
  scrollable: timezones,
  disabled: fruits.map(item =>
    item.value === 'grapes' ? { ...item, disabled: true } : item,
  ),
  invalid: fruits.slice(0, 3),
  rtl: rtlItems,
}
const placeholders: Record<string, string> = {
  basic: 'Select a fruit',
  alignItem: 'Select a fruit',
  groups: 'Select a fruit',
  scrollable: 'Select a timezone',
  disabled: 'Select a fruit',
  invalid: 'Select a fruit',
  rtl: 'اختر فاكهة',
}

const Message = UiSchema.TaggedEnum({
  PickedSelect: { value: Schema.NullOr(Schema.String) },
  RequestedOpenSelect: {},
  RequestedCloseSelect: {},
  ToggledAlignItem: { checked: Schema.Boolean },
})

const SelectDemo = Html.component({
  name: 'DocsSelectDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({
    value: Schema.NullOr(Schema.String),
    open: Schema.Boolean,
    alignItem: Schema.Boolean,
  }),
  message: Message,
}).make({
  init: h => ({
    value: h.props.kind === 'alignItem' ? 'banana' : null,
    open: false,
    alignItem: true,
  }),
  update: {
    PickedSelect: ($, { value }) => $.evolve({ value, open: false }),
    RequestedOpenSelect: $ => $.evolve({ open: true }),
    RequestedCloseSelect: $ => $.evolve({ open: false }),
    ToggledAlignItem: ($, { checked }) => $.evolve({ alignItem: checked }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const items = fixtureItems[kind] ?? fruits
    const select = Select(h, {
      ariaLabel: 'Example select',
      ...(kind === 'invalid' ? { invalid: true } : {}),
      ...(kind === 'rtl' ? { direction: 'rtl' as const } : {}),
      className:
        kind === 'scrollable'
          ? 'w-full max-w-64'
          : kind === 'rtl'
            ? 'w-32'
            : 'w-full max-w-48',
      groupForItem: item =>
        items.find(entry => entry.value === item.value)?.group ?? '',
      groupLabel: group => group,
      props: {
        open: model.open,
        items: items.map(({ value, label, disabled }) => ({
          value,
          label,
          ...(disabled === true ? { disabled: true } : {}),
        })),
        value: model.value,
        placeholder: placeholders[kind] ?? 'Select a fruit',
        ...(kind === 'disabled' ? { disabled: true } : {}),
        ...(kind === 'alignItem' && model.alignItem
          ? { alignItemWithTrigger: true }
          : {}),
      },
      onEmit: {
        Picked: ({ value }) =>
          typeof value === 'string' || value === null
            ? Message.PickedSelect({ value })
            : undefined,
        RequestedOpen: () => Message.RequestedOpenSelect(),
        RequestedClose: () => Message.RequestedCloseSelect(),
        Settled: () => undefined,
      },
    })
    if (kind === 'alignItem') {
      return h.div.class('flex min-w-0 flex-col gap-6').children(
        Switch(h, {
          id: 'align-item',
          label: 'Align Item',
          description: 'Toggle to align the item with the trigger.',
          props: { checked: model.alignItem, value: 'align-item' },
          onToggle: ({ checked }) => Message.ToggledAlignItem({ checked }),
        }),
        select,
      )
    }
    if (kind === 'invalid') {
      return h.div
        .class('grid min-w-0 gap-2')
        .children(
          h.label
            .class('flex w-fit gap-2 text-sm leading-snug font-medium')
            .children('Fruit'),
          select,
          h.p
            .class('text-sm leading-normal text-destructive')
            .children('Please select a fruit.'),
        )
    }
    return select
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div.attr('dir', kind === 'rtl' ? 'rtl' : undefined).children(
      SelectDemo(h, {
        key: `${context.idPrefix}-${kind}`,
        props: { kind },
      }) as never,
    )

const source = exampleApplicationSource({
  imports: `import { Select } from '@/ui/effect/ui'`,
  body: `Select(h, {
  ariaLabel: 'Example select',
  props: { open, items, value, placeholder: 'Select a fruit' },
  onEmit: {
    Picked: ({ value }) => PickedSelect({ value }),
    RequestedOpen: () => RequestedOpenSelect(),
    RequestedClose: () => RequestedCloseSelect(),
  },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Select } from '@/ui/effect/ui'\n\nSelect(h, { key, ariaLabel, props, onEmit })`,
  examples: [
    { title: 'Basic', view: view('basic'), source },
    { title: 'Align Item With Trigger', view: view('alignItem'), source },
    { title: 'Groups', view: view('groups'), source },
    { title: 'Scrollable', view: view('scrollable'), source },
    { title: 'Disabled', view: view('disabled'), source },
    { title: 'Invalid', view: view('invalid'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
