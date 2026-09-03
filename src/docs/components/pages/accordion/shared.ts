import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';
import type { AccordionType } from '@/lib/accordion-state';

export const accordionItems = [
  { value: 'product', trigger: 'Is it accessible?', content: 'Yes. It follows the WAI-ARIA disclosure pattern through Foldkit UI.' },
  { value: 'style', trigger: 'Is it styled?', content: 'Yes. It uses the same token-driven visual language as the rest of Crease UI.' },
  { value: 'animation', trigger: 'Is it animated?', content: 'Yes. Panel visibility is a finite transition driven by child state.' },
] as const;

const source = (
  name: string,
  type: AccordionType,
  renderer: 'tailwind' | 'stylex',
): string => foldkitApplication({
  title: `Accordion — ${name}`,
  imports: `import { Match as M, Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import * as Accordion from '@/${renderer === 'tailwind' ? 'ui' : 'stylex'}/accordion'`,
  model: `export const Model = S.Struct({ accordion: Accordion.Model, maybeLastToggledValue: S.Option(S.String) })
export type Model = typeof Model.Type`,
  messages: `export const GotAccordionMessage = m('GotAccordionMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Accordion.Message })
export const Message = S.Union([GotAccordionMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  {
    accordion: Accordion.init({
      id: 'product-faq', type: '${type}',
      value: ['product'${type === 'multiple' ? ", 'style'" : ''}],
    }),
    maybeLastToggledValue: Option.none(),
  },
  [],
]`,
  update: `const foldAccordionOutMessage = (
  outMessage: Accordion.OutMessage,
): Update.Step<Model, Message> =>
  M.value(outMessage).pipe(
    M.withReturnType<Update.Step<Model, Message>>(),
    M.tagsExhaustive({
      ChangedValue: ({ toggledValue }) => model => [
        evo(model, { maybeLastToggledValue: () => Option.some(toggledValue) }),
        [],
      ],
    }),
  )

const foldAccordion = Update.foldChild({
  update: Accordion.update,
  read: (model: Model) => Option.some(model.accordion),
  write: (model: Model, accordion: Accordion.Model) =>
    evo(model, { accordion: () => accordion }),
  toParentMessage: message => GotAccordionMessage({ message }),
  foldOutMessage: foldAccordionOutMessage,
})

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotAccordionMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return foldAccordion(model, message.message)
  }
}`,
  view: `const items: ReadonlyArray<Accordion.AccordionItem> = [
  { value: 'product', trigger: 'Is it accessible?', content: 'Yes. It follows the WAI-ARIA disclosure pattern through Foldkit UI.' },
  { value: 'style', trigger: 'Is it styled?', content: 'Yes. It uses the same token-driven visual language as the rest of Crease UI.' },
  { value: 'animation', trigger: 'Is it animated?', content: 'Yes. Panel visibility is a finite transition driven by child state.' },
]

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Accordion — ${name}',
  body: h.main([h.Class('mx-auto flex min-h-screen w-full max-w-xl items-center p-8')], [
    h.submodel({
      slotId: 'product-faq',
      model: model.accordion,
      view: Accordion.view,
      viewInputs: { items },
      toParentMessage: message => GotAccordionMessage({ message }),
    }),
  ]),
})`,
});

export const accordionExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Single disclosure',
    description: 'Opening one item closes the previous item and emits the toggled value to the parent.',
    code: source('Single disclosure', 'single', renderer),
  },
  {
    title: 'Multiple disclosures',
    description: 'Multiple mode preserves independent open states using the same child Message and update path.',
    code: source('Multiple disclosures', 'multiple', renderer),
  },
];
