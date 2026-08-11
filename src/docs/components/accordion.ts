import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import * as Accordion from '@/ui/accordion';
import {
  componentPage,
  example,
  type ExampleConfig,
} from '@/docs/component-page';
import * as CopyFeedback from '@/docs/copy-feedback';
import { completeExample } from '@/docs/components/complete-example';
import { componentApi } from '@/docs/generated-component-api';

const Target = S.Literals([
  'basic',
  'multiple',
  'disabled',
  'borders',
  'card',
  'rtl',
]);
type Target = typeof Target.Type;

export const Model = S.Struct({
  basic: Accordion.Model,
  multiple: Accordion.Model,
  disabled: Accordion.Model,
  borders: Accordion.Model,
  card: Accordion.Model,
  rtl: Accordion.Model,
  copiedCode: CopyFeedback.Model,
});
export type Model = typeof Model.Type;

export const GotAccordionMessage = m('GotAccordionMessage', {
  target: Target,
  message: Accordion.Message,
});
export const Message = S.Union([GotAccordionMessage, CopyFeedback.Message]);
export type Message = typeof Message.Type;

const items = [
  {
    value: 'product',
    trigger: 'Is it accessible?',
    content:
      'Yes. It follows the WAI-ARIA disclosure pattern through Foldkit UI.',
  },
  {
    value: 'style',
    trigger: 'Is it styled?',
    content:
      'Yes. It ships with the same token-driven visual language as shadcn/ui.',
  },
  {
    value: 'animation',
    trigger: 'Is it animated?',
    content:
      'Yes. The panel uses a finite grid-row transition that respects Foldkit state.',
  },
] as const;

const makeAccordion = (
  id: string,
  type: Accordion.AccordionType = 'single',
  openValues: ReadonlyArray<string> = [],
): Accordion.Model =>
  Accordion.init({
    id,
    type,
    items: items.map((item) => ({
      value: item.value,
      isOpen: openValues.includes(item.value),
    })),
  });

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
  copiedCode: null,
});

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag !== 'GotAccordionMessage') {
    const [copiedCode, commands] = CopyFeedback.update(
      model.copiedCode,
      message,
    );
    return [
      { ...model, copiedCode },
      Command.mapMessages(commands, (next) => next),
    ];
  }

  const target = message.target;
  const current = model[target];
  const [next, commands] = Accordion.update(current, message.message);

  return [
    { ...model, [target]: next },
    Command.mapMessages(commands, (childMessage) =>
      GotAccordionMessage({ target, message: childMessage }),
    ),
  ];
};

const accordionPreview = (
  model: Accordion.Model,
  target: Target,
  config: Readonly<{
    class?: string;
    itemClass?: string;
    disabledValue?: string;
  }> = {},
  h: HtmlBuilder<Message>,
): Html =>
  Accordion.accordion<Message>(
    {
      model,
      toParentMessage: (message) => GotAccordionMessage({ target, message }),
      items: items.map((item) => ({
        ...item,
        isDisabled: item.value === config.disabledValue,
      })),
      ...(config.class === undefined ? {} : { class: config.class }),
      ...(config.itemClass === undefined
        ? {}
        : { itemClass: config.itemClass }),
    },
    h,
  );

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
})`;

const INSTALLATION = 'npx shadcn@latest add Potti1234/creaseui/accordion';

const USAGE = `import * as Accordion from '@/ui/accordion'

// Store Accordion.Model in the parent Model, delegate Accordion.Message in
// update, then render it with Accordion.accordion({ ... }).`;

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const width = 'w-full max-w-xl';
  const docsExample = (
    config: Omit<ExampleConfig<Message>, 'isCopied'>,
  ): Html => {
    const code = completeExample({
      componentName: 'Accordion',
      componentSlug: 'accordion',
      exampleName: config.title,
      viewCode: config.code,
    });
    return example<Message>(
      {
        ...config,
        code,
        onCopy: CopyFeedback.ClickedCopyCode({ code }),
        isCopied: model.copiedCode === code,
      },
      h,
    );
  };

  return componentPage<Message>(
    {
      name: 'Accordion',
      description:
        'A vertically stacked set of interactive headings that each reveal a section of content.',
      installation: INSTALLATION,
      usage: USAGE,
      composition: `Parent Model\n└── accordion: Accordion.Model\n\nParent Message\n└── GotAccordionMessage(Accordion.Message)\n\nupdate delegates to Accordion.update; view maps child messages back to the parent.`,
      copiedCode: model.copiedCode,
      onCopyCode: (code) => CopyFeedback.ClickedCopyCode({ code }),
      exampleTitles: [
        'Basic',
        'Multiple',
        'Disabled',
        'Borders',
        'Card',
        'RTL',
      ],
      sidebarScrolled: CopyFeedback.ObservedSidebarScroll(),
      apiHref: 'https://foldkit.dev/ui/disclosure',
      apiEntries: componentApi.accordion ?? [],
      sourceHref:
        'https://github.com/Potti1234/creaseui/blob/main/src/ui/accordion.ts',
      examples: [
        docsExample({
          title: 'Basic',
          description:
            'A single-open accordion. The first item is open by default.',
          preview: h.div(
            [h.Class(width)],
            [accordionPreview(model.basic, 'basic', {}, h)],
          ),
          code: BASIC_CODE,
          onCopy: CopyFeedback.ClickedCopyCode({ code: BASIC_CODE }),
        }),
        docsExample({
          title: 'Multiple',
          description:
            'Use multiple mode when more than one item may stay open.',
          preview: h.div(
            [h.Class(width)],
            [accordionPreview(model.multiple, 'multiple', {}, h)],
          ),
          code: `Accordion.init({
  id: 'filters',
  type: 'multiple',
  items: [{ value: 'product', isOpen: true }, { value: 'style', isOpen: true }],
})`,
          onCopy: CopyFeedback.ClickedCopyCode({
            code: `Accordion.init({
  id: 'filters',
  type: 'multiple',
  items: [{ value: 'product', isOpen: true }, { value: 'style', isOpen: true }],
})`,
          }),
        }),
        docsExample({
          title: 'Disabled',
          description: 'Individual items can remain visible while unavailable.',
          preview: h.div(
            [h.Class(width)],
            [
              accordionPreview(
                model.disabled,
                'disabled',
                { disabledValue: 'style' },
                h,
              ),
            ],
          ),
          code: `{ value: 'style', trigger: 'Is it styled?', content, isDisabled: true }`,
          onCopy: CopyFeedback.ClickedCopyCode({
            code: `{ value: 'style', trigger: 'Is it styled?', content, isDisabled: true }`,
          }),
        }),
        docsExample({
          title: 'Borders',
          description: 'Wrap the default separators in a contained border.',
          preview: h.div(
            [h.Class(width)],
            [
              accordionPreview(
                model.borders,
                'borders',
                { class: 'rounded-lg border px-4' },
                h,
              ),
            ],
          ),
          code: `Accordion.accordion({
  ...props,
  class: 'rounded-lg border px-4',
})`,
          onCopy: CopyFeedback.ClickedCopyCode({
            code: `Accordion.accordion({
  ...props,
  class: 'rounded-lg border px-4',
})`,
          }),
        }),
        docsExample({
          title: 'Card',
          description:
            'Place the accordion in a card surface for grouped settings or FAQs.',
          preview: h.div(
            [
              h.Class(
                `${width} rounded-xl bg-card p-5 shadow-sm ring-1 ring-border`,
              ),
            ],
            [accordionPreview(model.card, 'card', {}, h)],
          ),
          code: `<div class="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border">
  {accordion}
</div>`,
          onCopy: CopyFeedback.ClickedCopyCode({
            code: `<div class="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border">
  {accordion}
</div>`,
          }),
        }),
        docsExample({
          title: 'RTL',
          description:
            'The component follows the surrounding document direction.',
          preview: h.div(
            [h.Dir('rtl'), h.Class(width)],
            [accordionPreview(model.rtl, 'rtl', {}, h)],
          ),
          code: `<div dir="rtl">{accordion}</div>`,
          onCopy: CopyFeedback.ClickedCopyCode({
            code: `<div dir="rtl">{accordion}</div>`,
          }),
        }),
      ],
    },
    h,
  );
};
