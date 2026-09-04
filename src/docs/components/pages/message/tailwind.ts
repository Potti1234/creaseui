import { interactionPreviewProgram } from '@/docs/components/pages/authored-page';
import { messageFixtures, messagePreviewText } from '@/docs/components/pages/message/shared';
import * as Bubble from '@/ui/bubble';
import * as Button from '@/ui/button';
import * as MessageUi from '@/ui/message';

export const messageTailwindPreviewProgram = interactionPreviewProgram('message', (index, interaction, h) => {
  const fixture = messageFixtures[index] ?? messageFixtures[0];
  const row = MessageUi.message({ ...(!fixture.incoming ? { align: 'end' as const } : {}), ...(fixture.live ? { announcement: 'status' as const, ariaLabel: 'New message from Ada' } : {}), class: 'max-w-xl', children: [MessageUi.messageAvatar({ children: [fixture.incoming ? 'A' : 'Y'] }, h), MessageUi.messageContent({ children: [MessageUi.messageAuthor({ children: [fixture.incoming ? 'Ada' : 'You'] }, h), Bubble.bubble({ ...(fixture.incoming ? { variant: 'secondary' as const } : { align: 'end' as const }), children: [Bubble.bubbleContent({ children: [messagePreviewText(index)] }, h)] }, h), MessageUi.messageMetadata({ children: [fixture.live ? 'Delivery failed' : fixture.incoming ? '10:42' : 'Delivered'] }, h), ...(fixture.live ? [MessageUi.messageActions({ children: [Button.button({ variant: 'outline', size: 'sm', onClick: interaction, children: ['Retry delivery'] }, h)] }, h)] : [])] }, h)] }, h);
  return fixture.live ? MessageUi.messageGroup({ live: 'polite', ariaLabel: 'Project conversation', children: [row] }, h) : MessageUi.messageGroup({ children: [row] }, h);
});
