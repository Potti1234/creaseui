import { Effect, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Accordion from '@/ui/accordion'
import { componentPage, example } from '@/docs/component-page'

const Target = S.Literals([
  'basic',
  'multiple',
  'disabled',
  'borders',
  'card',
  'rtl',
])
type Target = typeof Target.Type

export const Model = S.Struct({
  basic: Accordion.Model,
  multiple: Accordion.Model,
  disabled: Accordion.Model,
  borders: Accordion.Model,
  card: Accordion.Model,
  rtl: Accordion.Model,
})
export type Model = typeof Model.Type

export const GotAccordionMessage = m('GotAccordionMessage', {
  target: Target,
  message: Accordion.Message,
})
export const ClickedCopyCode = m('ClickedAccordionCopyCode', { code: S.String })
export const CompletedCopyCode = m('CompletedAccordionCopyCode')

export const Message = S.Union([GotAccordionMessage, ClickedCopyCode, CompletedCopyCode])
export type Message = typeof Message.Type

const items = [
  { value: 'product', trigger: 'Is it accessible?', content: 'Yes. It follows the WAI-ARIA disclosure pattern through Foldkit UI.' },
  { value: 'style', trigger: 'Is it styled?', content: 'Yes. It ships with the same token-driven visual language as shadcn/ui.' },
  { value: 'animation', trigger: 'Is it animated?', content: 'Yes. The panel uses a finite grid-row transition that respects Foldkit state.' },
] as const

const makeAccordion = (
  id: string,
  type: Accordion.AccordionType = 'single',
  openValues: ReadonlyArray<string> = [],
): Accordion.Model =>
  Accordion.init({
    id,
    type,
    items: items.map(item => ({
      value: item.value,
      isOpen: openValues.includes(item.value),
    })),
  })

export const init = (): Model => ({
  basic: makeAccordion('docs-accordion-basic', 'single', ['product']),
  multiple: makeAccordion('docs-accordion-multiple', 'multiple', [
    'product',
    'style',
  ]),
  disabled: makeAccordion('docs-accordion-disabled'),
  borders: makeAccordion('docs-accordion-borders'),
  card: makeAccordion('docs-accordion-card', 'single', ['product']),
  rtl: makeAccordion('docs-accordion-rtl', 'single', ['product']),
})

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

const CopyCode = Command.define(
  'CopyAccordionCode',
  { code: S.String },
  CompletedCopyCode,
)(({ code }) => Effect.promise(() => navigator.clipboard.writeText(code)).pipe(Effect.as(CompletedCopyCode())))

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag === 'ClickedAccordionCopyCode') return [model, [CopyCode({ code: message.code })]]
  if (message._tag === 'CompletedAccordionCopyCode') return [model, []]

  const target = message.target
  const current = model[target]
  const [next, commands] = Accordion.update(current, message.message)

  return [
    { ...model, [target]: next },
    Command.mapMessages(commands, childMessage =>
      GotAccordionMessage({ target, message: childMessage }),
    ),
  ]
}

const accordionPreview = (
  model: Accordion.Model,
  target: Target,
  config: Readonly<{
    class?: string
    itemClass?: string
    disabledValue?: string
  }> = {},
): Html =>
  Accordion.accordion<Message>({
    model,
    toParentMessage: message => GotAccordionMessage({ target, message }),
    items: items.map(item => ({
      ...item,
      isDisabled: item.value === config.disabledValue,
    })),
    ...(config.class === undefined ? {} : { class: config.class }),
    ...(config.itemClass === undefined ? {} : { itemClass: config.itemClass }),
  })

const BASIC_CODE = `const model = Accordion.init({
  id: 'product-faq',
  type: 'single',
  items: [
    { value: 'product', isOpen: true },
    { value: 'style' },
    { value: 'animation' },
  ],
})

Accordion.accordion({
  model,
  toParentMessage: message => GotAccordionMessage({ message }),
  items,
})`

const INSTALLATION = 'npx shadcn@latest add Potti1234/creaseui/accordion'

const USAGE = `import * as Accordion from '@/ui/accordion'

// Store Accordion.Model in the parent Model, delegate Accordion.Message in
// update, then render it with Accordion.accordion({ ... }).`

export const view = (model: Model): Html => {
  const h = html<Message>()
  const width = 'w-full max-w-xl'

  return componentPage<Message>({
    name: 'Accordion',
    description:
      'A vertically stacked set of interactive headings that each reveal a section of content.',
    installation: INSTALLATION,
    usage: USAGE,
    sidebarScrolled: CompletedCopyCode(),
    apiHref: 'https://foldkit.dev/ui/disclosure',
    examples: [
      example<Message>({
        title: 'Basic',
        description:
          'A single-open accordion. The first item is open by default.',
        preview: h.div([h.Class(width)], [accordionPreview(model.basic, 'basic')]),
        code: BASIC_CODE,
        onCopy: ClickedCopyCode({ code: BASIC_CODE }),
      }),
      example<Message>({
        title: 'Multiple',
        description: 'Use multiple mode when more than one item may stay open.',
        preview: h.div([h.Class(width)], [accordionPreview(model.multiple, 'multiple')]),
        code: `Accordion.init({
  id: 'filters',
  type: 'multiple',
  items: [{ value: 'product', isOpen: true }, { value: 'style', isOpen: true }],
})`,
        onCopy: ClickedCopyCode({ code: `Accordion.init({
  id: 'filters',
  type: 'multiple',
  items: [{ value: 'product', isOpen: true }, { value: 'style', isOpen: true }],
})` }),
      }),
      example<Message>({
        title: 'Disabled',
        description: 'Individual items can remain visible while unavailable.',
        preview: h.div(
          [h.Class(width)],
          [accordionPreview(model.disabled, 'disabled', { disabledValue: 'style' })],
        ),
        code: `{ value: 'style', trigger: 'Is it styled?', content, isDisabled: true }`,
        onCopy: ClickedCopyCode({ code: `{ value: 'style', trigger: 'Is it styled?', content, isDisabled: true }` }),
      }),
      example<Message>({
        title: 'Borders',
        description: 'Wrap the default separators in a contained border.',
        preview: h.div(
          [h.Class(width)],
          [accordionPreview(model.borders, 'borders', { class: 'rounded-lg border px-4' })],
        ),
        code: `Accordion.accordion({
  ...props,
  class: 'rounded-lg border px-4',
})`,
        onCopy: ClickedCopyCode({ code: `Accordion.accordion({
  ...props,
  class: 'rounded-lg border px-4',
})` }),
      }),
      example<Message>({
        title: 'Card',
        description: 'Place the accordion in a card surface for grouped settings or FAQs.',
        preview: h.div(
          [h.Class(`${width} rounded-xl bg-card p-5 shadow-sm ring-1 ring-border`)],
          [accordionPreview(model.card, 'card')],
        ),
        code: `<div class="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border">
  {accordion}
</div>`,
        onCopy: ClickedCopyCode({ code: `<div class="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border">
  {accordion}
</div>` }),
      }),
      example<Message>({
        title: 'RTL',
        description: 'The component follows the surrounding document direction.',
        preview: h.div(
          [h.Dir('rtl'), h.Class(width)],
          [accordionPreview(model.rtl, 'rtl')],
        ),
        code: `<div dir="rtl">{accordion}</div>`,
        onCopy: ClickedCopyCode({ code: `<div dir="rtl">{accordion}</div>` }),
      }),
    ],
  })
}
