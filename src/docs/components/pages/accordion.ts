import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Accordion from '@/ui/accordion';

const items = [
  { value: 'product', trigger: 'Is it accessible?', content: 'Yes. It follows the WAI-ARIA disclosure pattern through Foldkit UI.' },
  { value: 'style', trigger: 'Is it styled?', content: 'Yes. It uses the same token-driven visual language as the rest of Crease UI.' },
  { value: 'animation', trigger: 'Is it animated?', content: 'Yes. Panel visibility is a finite transition driven by child state.' },
] as const;

const source = (name: string, type: Accordion.AccordionType): string => foldkitApplication({
  title: `Accordion — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Accordion from '@/ui/accordion'`,
  model: `export const Model = S.Struct({ accordion: Accordion.Model, maybeLastToggledValue: S.Option(S.String) })
export type Model = typeof Model.Type`,
  messages: `export const GotAccordionMessage = m('GotAccordionMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Accordion.Message })
export const Message = S.Union([GotAccordionMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  {
    accordion: Accordion.init({
      id: 'product-faq', type: '${type}',
      items: [{ value: 'product', isOpen: true }, { value: 'style', isOpen: ${String(type === 'multiple')} }, { value: 'animation' }],
    }),
    maybeLastToggledValue: Option.none(),
  },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotAccordionMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [accordion, commands, maybeToggle] = Accordion.update(model.accordion, message.message)
      return [
        { ...model, accordion, maybeLastToggledValue: Option.match(maybeToggle, { onNone: () => model.maybeLastToggledValue, onSome: toggled => Option.some(toggled.value) }) },
        Command.mapMessages(commands, next => GotAccordionMessage({ message: next })),
      ]
    }
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
    Accordion.accordion({ model: model.accordion, toParentMessage: message => GotAccordionMessage({ message }), items, class: 'w-full' }, h),
  ]),
})`,
});

const GotAccordionPreviewMessage = m('GotAccordionPreviewMessage', { message: Accordion.Message });
type GotAccordionPreviewMessage = typeof GotAccordionPreviewMessage.Type;
const AccordionPreviewModel = S.Struct({ _docsPage: S.Literal('accordion'), accordion: Accordion.Model, maybeLastToggledValue: S.Option(S.String) });
type AccordionPreviewModel = typeof AccordionPreviewModel.Type;
const previewProgram = definePreviewProgram<AccordionPreviewModel, GotAccordionPreviewMessage>({
  Model: AccordionPreviewModel,
  Message: GotAccordionPreviewMessage,
  init: index => ({
    _docsPage: 'accordion',
    accordion: Accordion.init({
      id: `docs-accordion-${String(index)}`,
      type: index === 0 ? 'single' : 'multiple',
      items: [{ value: 'product', isOpen: true }, { value: 'style', isOpen: index === 1 }, { value: 'animation' }],
    }),
    maybeLastToggledValue: Option.none(),
  }),
  update: (model, message) => {
    const [accordion, commands, maybeToggle] = Accordion.update(model.accordion, message.message);
    return [
      { ...model, accordion, maybeLastToggledValue: Option.match(maybeToggle, { onNone: () => model.maybeLastToggledValue, onSome: toggled => Option.some(toggled.value) }) },
      Command.mapMessages(commands, next => GotAccordionPreviewMessage({ message: next })),
    ];
  },
  view: (_index, model, h) => h.div([h.Class('w-full max-w-xl')], [Accordion.accordion({ model: model.accordion, toParentMessage: message => GotAccordionPreviewMessage({ message }), items }, h)]),
});

export const accordionPage = authoredPage({
  slug: 'accordion', title: 'Accordion', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Groups disclosure headings whose panels can open one-at-a-time or independently.',
    architecture: 'Accordion stores stable item ids and open booleans in one child Model, delegates indexed Disclosure messages, enforces single/multiple policy in update, and emits a ToggledItem OutMessage for parent domain logic.',
    apiHref: 'https://foldkit.dev/ui/disclosure',
    composition: 'Parent Model\n└── Accordion Model\n    ├── type: single | multiple\n    ├── stable item ids\n    └── open state per item\n        └── Disclosure heading + animated panel',
    styling: 'Item identity and order must match the Model initialized by the parent. Use single mode for mutually exclusive sections and multiple mode when comparison matters.',
    accessibility: 'Each heading contains a real button connected to its panel with Disclosure semantics. Disabled headings remain visible but unavailable; focus indication and expanded state come from the primitive.',
    keyboard: [['Tab / Shift+Tab', 'Moves between accordion heading buttons.'], ['Enter / Space', 'Toggles the focused disclosure.']],
    examples: [
      { title: 'Single disclosure', description: 'Opening one item closes the previous item and emits the toggled value to the parent.',  code: source('Single disclosure', 'single') },
      { title: 'Multiple disclosures', description: 'Multiple mode preserves independent open states using the same child Message and update path.',  code: source('Multiple disclosures', 'multiple') },
    ],
  },
});
