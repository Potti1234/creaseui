import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { accordionItems } from '@/docs/components/pages/accordion/shared';
import * as Accordion from '@/ui/accordion';

const GotAccordionPreviewMessage = m('GotAccordionPreviewMessage', {
  message: Accordion.Message,
});
type GotAccordionPreviewMessage = typeof GotAccordionPreviewMessage.Type;

const AccordionPreviewModel = S.Struct({
  _docsPage: S.Literal('accordion'),
  accordion: Accordion.Model,
  maybeLastToggledValue: S.Option(S.String),
});
type AccordionPreviewModel = typeof AccordionPreviewModel.Type;

export const accordionTailwindPreviewProgram = definePreviewProgram<
  AccordionPreviewModel,
  GotAccordionPreviewMessage
>({
  Model: AccordionPreviewModel,
  Message: GotAccordionPreviewMessage,
  init: index => ({
    _docsPage: 'accordion',
    accordion: Accordion.init({
      id: `docs-accordion-${String(index)}`,
      type: index === 0 ? 'single' : 'multiple',
      value: index === 0 ? ['product'] : ['product', 'style'],
    }),
    maybeLastToggledValue: Option.none(),
  }),
  update: (model, message) => {
    const [accordion, commands, maybeToggle] = Accordion.update(
      model.accordion,
      message.message,
    );
    return [
      {
        ...model,
        accordion,
        maybeLastToggledValue: Option.match(maybeToggle, {
          onNone: () => model.maybeLastToggledValue,
          onSome: changed => Option.some(changed.toggledValue),
        }),
      },
      Command.mapMessages(commands, next =>
        GotAccordionPreviewMessage({ message: next }),
      ),
    ];
  },
  view: (_index, model, h) =>
    h.div([h.Class('w-full max-w-xl')], [
      h.submodel({
        slotId: 'docs-accordion',
        model: model.accordion,
        view: Accordion.view,
        viewInputs: { items: accordionItems },
        toParentMessage: message => GotAccordionPreviewMessage({ message }),
      }),
    ]),
});
