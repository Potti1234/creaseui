import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { messageFixtures, messagePreviewText } from '@/docs/components/pages/message/shared';
import * as Bubble from '@/stylex/bubble';
import * as Button from '@/stylex/button';
import * as MessageUi from '@/stylex/message';

const styles = stylex.create({ message: { maxWidth: '36rem' } });
export const messageStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, _model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = messageFixtures[index] ?? messageFixtures[0];
  const row = MessageUi.message({ ...(!fixture.incoming ? { align: 'end' as const } : {}), ...(fixture.live ? { announcement: 'status' as const, ariaLabel: 'New message from Ada' } : {}), layoutStyle: styles.message, children: [MessageUi.messageAvatar({ children: [fixture.incoming ? 'A' : 'Y'] }, h), MessageUi.messageContent({ children: [MessageUi.messageAuthor({ children: [fixture.incoming ? 'Ada' : 'You'] }, h), Bubble.bubble({ ...(fixture.incoming ? { variant: 'secondary' as const } : { align: 'end' as const }), children: [Bubble.bubbleContent({ ...(fixture.incoming ? { variant: 'secondary' as const } : {}), children: [messagePreviewText(index)] }, h)] }, h), MessageUi.messageMetadata({ children: [fixture.live ? 'Delivery failed' : fixture.incoming ? '10:42' : 'Delivered'] }, h), ...(fixture.live ? [MessageUi.messageActions({ children: [Button.button({ variant: 'outline', size: 'sm', onClick: onMessageJson(JSON.stringify({ _tag: 'InteractedWithDocsPreview' })), children: ['Retry delivery'] }, h)] }, h)] : [])] }, h)] }, h);
  return fixture.live ? MessageUi.messageGroup({ live: 'polite', ariaLabel: 'Project conversation', children: [row] }, h) : MessageUi.messageGroup({ children: [row] }, h);
};
