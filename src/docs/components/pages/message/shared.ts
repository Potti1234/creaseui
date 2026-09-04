import type { DocsExample } from '@/docs/components/page-definition';
import { statelessComponentApplication } from '@/docs/components/pages/authored-page';

export const messageFixtures = [
  { title: 'Incoming', description: 'Keep sender, content, and timestamp in one readable row.', incoming: true, live: false },
  { title: 'Outgoing', description: 'Alignment distinguishes the local participant without changing chronological order.', incoming: false, live: false },
  { title: 'Live recovery', description: 'A long inbound status update exposes a keyboard action that remains a parent Message.', incoming: true, live: true },
] as const;
export const messagePreviewText = (index: number): string => index === 2 ? 'This deliberately long inbound message demonstrates wrapping inside a narrow responsive transcript without forcing the page wider than its viewport or losing delivery metadata.' : index === 0 ? 'The Foldkit example is ready for review.' : 'I will check the update and command flow.';

const bubbleContent = (text: string, incoming: boolean, renderer: 'tailwind' | 'stylex'): string => `Bubble.bubble({ ${incoming ? "variant: 'secondary'" : "align: 'end'"}, children: [
      Bubble.bubbleContent({${renderer === 'stylex' && incoming ? " variant: 'secondary'," : ''} children: ['${text}'] }, h),
    ] }, h)`;
const body = (fixture: (typeof messageFixtures)[number], renderer: 'tailwind' | 'stylex'): string => fixture.live ? `MessageUi.messageGroup({ live: 'polite', ariaLabel: 'Project conversation', children: [
  MessageUi.message({ announcement: 'status', ariaLabel: 'New message from Ada', ${renderer === 'stylex' ? 'layoutStyle: styles.message' : "class: 'max-w-xl'"}, children: [
    MessageUi.messageAvatar({ children: ['A'] }, h),
    MessageUi.messageContent({ children: [
      MessageUi.messageAuthor({ children: ['Ada'] }, h),
      ${bubbleContent('A long inbound message that wraps without widening the transcript.', true, renderer)},
      MessageUi.messageMetadata({ children: ['Delivery failed'] }, h),
      MessageUi.messageActions({ children: [Button.button({ variant: 'outline', size: 'sm', onClick: ClickedExample(), children: ['Retry delivery'] }, h)] }, h),
    ] }, h),
  ] }, h),
] }, h)` : `MessageUi.message({${fixture.incoming ? '' : " align: 'end',"} ${renderer === 'stylex' ? 'layoutStyle: styles.message' : "class: 'max-w-xl'"}, children: [
  MessageUi.messageAvatar({ children: ['${fixture.incoming ? 'A' : 'Y'}'] }, h),
  MessageUi.messageContent({ children: [
    MessageUi.messageAuthor({ children: ['${fixture.incoming ? 'Ada' : 'You'}'] }, h),
    ${bubbleContent(fixture.incoming ? 'The Foldkit example is ready for review.' : 'I will check the update and command flow.', fixture.incoming, renderer)},
    MessageUi.messageMetadata({ children: ['${fixture.incoming ? '10:42' : 'Delivered'}'] }, h),
  ] }, h),
] }, h)`;

export const messageExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => messageFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: statelessComponentApplication({ componentName: 'MessageUi', componentSlug: 'message', renderer, exampleName: fixture.title, componentImports: `${renderer === 'stylex' ? "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ message: { maxWidth: '36rem' } })\n" : ''}import * as Bubble from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/bubble'\nimport * as Button from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/button'`, viewBody: body(fixture, renderer) }) }));
