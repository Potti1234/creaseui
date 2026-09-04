import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { hoverCardFixtures } from '@/docs/components/pages/hover-card/shared';
import * as HoverCard from '@/ui/hover-card';

const card = <Msg>(h: HtmlBuilder<Msg>) => h.div([h.Class('space-y-1')], [
  h.h4([h.Class('font-semibold')], ['@foldkit']),
  h.p([h.Class('text-sm')], ['Typed functional web applications without a virtual DOM.']),
]);

const GotHoverCardPreviewMessage = m('GotHoverCardPreviewMessage', { message: HoverCard.Message });
type GotHoverCardPreviewMessage = typeof GotHoverCardPreviewMessage.Type;
const HoverCardPreviewModel = S.Struct({ _docsPage: S.Literal('hover-card'), hoverCard: HoverCard.Model });
type HoverCardPreviewModel = typeof HoverCardPreviewModel.Type;

export const hoverCardTailwindPreviewProgram = definePreviewProgram<HoverCardPreviewModel, GotHoverCardPreviewMessage>({
  Model: HoverCardPreviewModel,
  Message: GotHoverCardPreviewMessage,
  init: index => ({ _docsPage: 'hover-card', hoverCard: HoverCard.init({ id: `docs-hover-card-${String(index)}`, showDelay: 200, closeDelay: 150 }) }),
  update: (model, message) => {
    const [hoverCard, commands] = HoverCard.update(model.hoverCard, message.message);
    return [{ ...model, hoverCard }, Command.mapMessages(commands, next => GotHoverCardPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => HoverCard.hoverCard({
    model: model.hoverCard,
    toParentMessage: message => GotHoverCardPreviewMessage({ message }),
    trigger: '@foldkit',
    triggerClass: 'underline underline-offset-4',
    ariaLabel: 'Preview the Foldkit profile',
    side: (hoverCardFixtures[index] ?? hoverCardFixtures[0]).side,
    content: card(h),
  }, h),
});
