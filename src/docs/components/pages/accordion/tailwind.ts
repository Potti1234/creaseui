import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { accordionItems } from '@/docs/components/pages/accordion/shared';
import * as Accordion from '@/ui/accordion';

const GotAccordionPreviewMessage = defineMessageUnion({
  GotAccordionPreviewMessage: {
  message: Accordion.Message,
},
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
    const accordionOp__ = Accordion.update(
      model.accordion,
      message.message,
    );
    const accordion = accordionOp__.model;
    const commands = accordionOp__.commands ?? [];
    const maybeToggle = Option.fromNullishOr(accordionOp__.outMessage);;
    return { model: {
        ...model,
        accordion,
        maybeLastToggledValue: Option.match(maybeToggle, {
          onNone: () => model.maybeLastToggledValue,
          onSome: changed => Option.some(changed.toggledValue),
        }),
      }, commands: Command.mapMessages(commands, next =>
        GotAccordionPreviewMessage.GotAccordionPreviewMessage({ message: next }),
      ) };
  },
  view: (_index, model, h) =>
    h.div([h.Class('w-full max-w-xl')], [
      h.submodel({
        slotId: 'docs-accordion',
        model: model.accordion,
        view: Accordion.view,
        viewInputs: { items: accordionItems },
        toParentMessage: message => GotAccordionPreviewMessage.GotAccordionPreviewMessage({ message }),
      }),
    ]),
});
