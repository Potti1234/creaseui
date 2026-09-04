import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { messageScrollerFixtures } from '@/docs/components/pages/message-scroller/shared';
import * as Bubble from '@/ui/bubble';
import * as MessageScroller from '@/ui/message-scroller';

const messages = <Msg>(h: HtmlBuilder<Msg>) => Array.from({ length: 18 }, (_, index) => MessageScroller.messageScrollerItem({ scrollAnchor: index === 17, children: [Bubble.bubble({ align: index % 2 === 0 ? 'start' : 'end', children: [Bubble.bubbleContent({ children: [`Message ${index + 1}`] }, h)] }, h)] }, h));
const GotMessageScrollerPreviewMessage = m('GotMessageScrollerPreviewMessage', { message: MessageScroller.Message });
type GotMessageScrollerPreviewMessage = typeof GotMessageScrollerPreviewMessage.Type;
const Model = S.Struct({ _docsPage: S.Literal('message-scroller'), scroller: MessageScroller.Model });
type Model = typeof Model.Type;
export const messageScrollerTailwindPreviewProgram = definePreviewProgram<Model, GotMessageScrollerPreviewMessage>({ Model, Message: GotMessageScrollerPreviewMessage, init: index => ({ _docsPage: 'message-scroller', scroller: MessageScroller.init(`docs-message-scroller-${String(index)}`) }), update: (model, message) => { const [scroller, commands] = MessageScroller.update(model.scroller, message.message); return [{ ...model, scroller }, Command.mapMessages(commands, next => GotMessageScrollerPreviewMessage({ message: next }))]; }, view: (index, model, h) => MessageScroller.messageScroller({ class: 'relative h-72 w-full max-w-md rounded-md border', children: [MessageScroller.messageScrollerViewport({ model: model.scroller, toParentMessage: message => GotMessageScrollerPreviewMessage({ message }), children: [MessageScroller.messageScrollerContent({ children: messages(h) }, h)] }, h), MessageScroller.messageScrollerButton({ model: model.scroller, toParentMessage: message => GotMessageScrollerPreviewMessage({ message }), direction: (messageScrollerFixtures[index] ?? messageScrollerFixtures[0]).direction }, h)] }, h) });
