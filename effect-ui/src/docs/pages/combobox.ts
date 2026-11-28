import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Combobox, Icon, InputGroup } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const frameworks = [
  { value: 'foldkit', label: 'Foldkit' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
]
const timezones = [
  { value: 'new-york', label: '(GMT-5) New York', group: 'Americas' },
  { value: 'los-angeles', label: '(GMT-8) Los Angeles', group: 'Americas' },
  { value: 'chicago', label: '(GMT-6) Chicago', group: 'Americas' },
  { value: 'toronto', label: '(GMT-5) Toronto', group: 'Americas' },
  { value: 'vancouver', label: '(GMT-8) Vancouver', group: 'Americas' },
  { value: 'sao-paulo', label: '(GMT-3) São Paulo', group: 'Americas' },
  { value: 'london', label: '(GMT+0) London', group: 'Europe' },
  { value: 'paris', label: '(GMT+1) Paris', group: 'Europe' },
  { value: 'berlin', label: '(GMT+1) Berlin', group: 'Europe' },
  { value: 'rome', label: '(GMT+1) Rome', group: 'Europe' },
  { value: 'madrid', label: '(GMT+1) Madrid', group: 'Europe' },
  { value: 'amsterdam', label: '(GMT+1) Amsterdam', group: 'Europe' },
  { value: 'tokyo', label: '(GMT+9) Tokyo', group: 'Asia/Pacific' },
  { value: 'shanghai', label: '(GMT+8) Shanghai', group: 'Asia/Pacific' },
  { value: 'singapore', label: '(GMT+8) Singapore', group: 'Asia/Pacific' },
  { value: 'dubai', label: '(GMT+4) Dubai', group: 'Asia/Pacific' },
  { value: 'sydney', label: '(GMT+11) Sydney', group: 'Asia/Pacific' },
  { value: 'seoul', label: '(GMT+9) Seoul', group: 'Asia/Pacific' },
]
const countries = [
  ['ar', 'argentina', 'Argentina', 'South America'],
  ['au', 'australia', 'Australia', 'Oceania'],
  ['br', 'brazil', 'Brazil', 'South America'],
  ['ca', 'canada', 'Canada', 'North America'],
  ['cn', 'china', 'China', 'Asia'],
  ['co', 'colombia', 'Colombia', 'South America'],
  ['eg', 'egypt', 'Egypt', 'Africa'],
  ['fr', 'france', 'France', 'Europe'],
  ['de', 'germany', 'Germany', 'Europe'],
  ['it', 'italy', 'Italy', 'Europe'],
  ['jp', 'japan', 'Japan', 'Asia'],
  ['ke', 'kenya', 'Kenya', 'Africa'],
  ['mx', 'mexico', 'Mexico', 'North America'],
  ['nz', 'new-zealand', 'New Zealand', 'Oceania'],
  ['ng', 'nigeria', 'Nigeria', 'Africa'],
  ['za', 'south-africa', 'South Africa', 'Africa'],
  ['kr', 'south-korea', 'South Korea', 'Asia'],
  ['es', 'spain', 'Spain', 'Europe'],
  ['se', 'sweden', 'Sweden', 'Europe'],
  ['ch', 'switzerland', 'Switzerland', 'Europe'],
  ['gb', 'united-kingdom', 'United Kingdom', 'Europe'],
  ['us', 'united-states', 'United States', 'North America'],
].map(([code, value, label, continent]) => ({
  code,
  value: value!,
  label: label!,
  continent,
}))
const rtlCategories = [
  { value: 'technology', label: 'التكنولوجيا' },
  { value: 'design', label: 'التصميم' },
  { value: 'business', label: 'الأعمال' },
  { value: 'marketing', label: 'التسويق' },
  { value: 'education', label: 'التعليم' },
  { value: 'health', label: 'الصحة' },
]
const Value = Schema.NullOr(
  Schema.Union([Schema.String, Schema.Array(Schema.String)]),
)
const Message = UiSchema.TaggedEnum({ PickedValue: { value: Value } })
const itemsFor = (kind: string) =>
  kind === 'groups' || kind === 'inputGroup'
    ? timezones
    : kind === 'custom' || kind === 'popup'
      ? countries
      : kind === 'rtl'
        ? rtlCategories
        : frameworks
const ComboboxDemo = Html.component({
  name: 'DocsComboboxDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({ value: Value }),
  message: Message,
}).make({
  init: ({ props }) => ({
    value:
      props.kind === 'multiple'
        ? []
        : props.kind === 'clear'
          ? 'foldkit'
          : null,
  }),
  update: {
    PickedValue: ($, { value }) => $.evolve({ value }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const combobox = Combobox(h, {
      key: kind,
      label:
        kind === 'groups' || kind === 'inputGroup'
          ? 'Timezone'
          : kind === 'custom' || kind === 'popup'
            ? 'Country'
            : kind === 'rtl'
              ? 'الفئة'
              : 'Framework',
      placeholder:
        kind === 'groups' || kind === 'inputGroup'
          ? 'Select a timezone'
          : kind === 'custom' || kind === 'popup'
            ? 'Select country'
            : kind === 'rtl'
              ? 'اختر فئة...'
              : 'Select a framework',
      props: {
        items: itemsFor(kind),
        value: model.value,
        multiple: kind === 'multiple',
        disabled: kind === 'disabled',
        dir: kind === 'rtl' ? 'rtl' : undefined,
      },
      showTrigger: kind === 'popup',
      onEmit: {
        Picked: ({ value }: any) => Message.PickedValue({ value }),
      },
    } as any)
    if (kind === 'inputGroup')
      return InputGroup(h, {
        className: 'max-w-sm',
        control: group =>
          h.div
            .class(
              'min-w-0 flex-1 [&_[data-slot=combobox]]:border-0 [&_[data-slot=combobox]]:shadow-none',
            )
            .attr('data-slot', 'input-group-control')
            .children(combobox as never),
      })
    const body = h.div
      .class(kind === 'multiple' ? 'w-full max-w-xs' : 'w-[250px]')
      .children(combobox as never)
    return h.div
      .class(kind === 'clear' ? 'flex items-center gap-2' : undefined)
      .attrs({ dir: kind === 'rtl' ? 'rtl' : undefined })
      .children(
        body,
        kind === 'clear'
          ? h.button
              .class(
                'grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-accent',
              )
              .attrs({ type: 'button', 'aria-label': 'Clear selection' })
              .on('click', () => Message.PickedValue({ value: null }))
              .children(Icon(h, { name: 'x', size: 'sm' }))
          : undefined,
      )
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    ComboboxDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Combobox } from '@/ui/effect/ui'`,
  body: `Combobox(h, {
  label: 'Framework',
  placeholder: 'Select a framework',
  props: { items: frameworks, value: model.value },
  onEmit: {
    Picked: ({ value }) => PickedValue({ value }),
  },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Combobox } from '@/ui/effect/ui'\n\nCombobox(h, { label, props: { items, value }, onEmit })`,
  examples: [
    { title: 'Demo', view: view('frameworks'), source },
    { title: 'Basic', view: view('frameworks'), source },
    { title: 'Multiple', view: view('multiple'), source },
    { title: 'Clear Button', view: view('clear'), source },
    { title: 'Groups', view: view('groups'), source },
    { title: 'Custom Items', view: view('custom'), source },
    { title: 'Invalid', view: view('invalid'), source },
    { title: 'Disabled', view: view('disabled'), source },
    { title: 'Auto Highlight', view: view('autoHighlight'), source },
    { title: 'Popup', view: view('popup'), source },
    { title: 'Input Group', view: view('inputGroup'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
