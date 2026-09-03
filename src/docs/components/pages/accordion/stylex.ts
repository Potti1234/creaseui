import type { Html, HtmlBuilder } from 'foldkit/html';

import { accordionItems } from '@/docs/components/pages/accordion/shared';
import * as Accordion from '@/stylex/accordion';

export const accordionStyleXPreview = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div([h.Class('w-full max-w-xl')], [
    h.submodel({
      slotId: `docs-stylex-accordion-${String(exampleIndex)}`,
      model: (model as { accordion: Accordion.Model }).accordion,
      view: Accordion.view,
      viewInputs: { items: accordionItems },
      toParentMessage: message => onMessageJson(JSON.stringify({
        _tag: 'GotAccordionPreviewMessage',
        message,
      })),
    }),
  ]);
