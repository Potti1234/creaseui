import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { messageScrollerFixtures } from '@/docs/components/pages/message-scroller/shared';
import * as Bubble from '@/stylex/bubble';
import * as MessageScroller from '@/stylex/message-scroller';

const styles = stylex.create({ frame: { overflow: 'hidden', position: 'relative', height: '18rem', width: '100%', maxWidth: '28rem', borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: 1 } });
const messages = <Msg>(h: HtmlBuilder<Msg>) => Array.from({ length: 18 }, (_, index) => MessageScroller.messageScrollerItem({ scrollAnchor: index === 17, children: [Bubble.bubble({ align: index % 2 === 0 ? 'start' : 'end', children: [Bubble.bubbleContent({ children: [`Message ${index + 1}`] }, h)] }, h)] }, h));
export const messageScrollerStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = messageScrollerFixtures[index] ?? messageScrollerFixtures[0]; const preview = model as { scroller: MessageScroller.Model };
  const toParentMessage = (message: MessageScroller.Message) => onMessageJson(JSON.stringify({ _tag: 'GotMessageScrollerPreviewMessage', message }));
  return h.div([h.Class(stylex.props(styles.frame).className ?? '')], [MessageScroller.messageScroller({ children: [MessageScroller.messageScrollerViewport({ model: preview.scroller, toParentMessage, children: [MessageScroller.messageScrollerContent({ children: messages(h) }, h)] }, h), MessageScroller.messageScrollerButton({ model: preview.scroller, toParentMessage, direction: fixture.direction }, h)] }, h)]);
};
