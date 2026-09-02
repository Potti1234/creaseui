import * as MessageUi from '@/ui/message';
import * as Bubble from '@/ui/bubble';
import * as Button from '@/ui/button';
import { authoredPage, interactionPreviewProgram, statelessComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string => statelessComponentApplication({ componentName: 'MessageUi', componentSlug: 'message', exampleName: name, viewBody, componentImports: `import * as Bubble from '@/ui/bubble'
import * as Button from '@/ui/button'` });

const previewProgram = interactionPreviewProgram('message', (index, interaction, h) => {
  const incoming = index !== 1;
  const content = index === 2 ? 'This deliberately long inbound message demonstrates wrapping inside a narrow responsive transcript without forcing the page wider than its viewport or losing delivery metadata.' : incoming ? 'The Foldkit example is ready for review.' : 'I will check the update and command flow.';
  return MessageUi.messageGroup({ ...(index === 2 ? { live: 'polite' as const, ariaLabel: 'Project conversation' } : {}), children: [MessageUi.message({ ...(incoming ? {} : { align: 'end' as const }), ...(index === 2 ? { announcement: 'status' as const, ariaLabel: 'New message from Ada' } : {}), class: 'max-w-xl', children: [MessageUi.messageAvatar({ children: [incoming ? 'A' : 'Y'] }, h), MessageUi.messageContent({ children: [MessageUi.messageAuthor({ children: [incoming ? 'Ada' : 'You'] }, h), Bubble.bubble({ ...(incoming ? { variant: 'secondary' as const } : { align: 'end' as const }), children: [Bubble.bubbleContent({ children: [content] }, h)] }, h), MessageUi.messageMetadata({ children: [incoming ? '10:42' : 'Delivered'] }, h), ...(index === 2 ? [MessageUi.messageActions({ children: [Button.button({ variant: 'outline', size: 'sm', onClick: interaction, children: ['Retry delivery'] }, h)] }, h)] : [])] }, h)] }, h)] }, h);
});

export const messagePage = authoredPage({
  slug: 'message', title: 'Message', kind: 'recipe',
  previewProgram,
  definition: {
    kind: 'recipe', description: 'Composes sender identity, conversational content, and delivery metadata into one transcript row.',
    architecture: 'Message is a stateless composition recipe. The parent owns ordered message data, delivery status, and action Messages; the helper only renders semantic author, content, metadata, and action parts.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'MessageGroup\n└── Message → MessageAvatar / MessageContent\n              └── MessageHeader / Bubble / MessageFooter',
    styling: 'Keep sender alignment consistent across the transcript and use Bubble variants for content tone rather than reordering the DOM.',
    accessibility: 'Render transcript updates in an appropriately labeled log when they arrive live. Sender names and delivery state must be text, not color alone.',
    examples: [
      {
        title: 'Incoming', description: 'Keep sender, content, and timestamp in one readable row.',
        code: source('Incoming', `MessageUi.message({ class: 'max-w-xl', children: [
  MessageUi.messageAvatar({ children: ['A'] }, h),
  MessageUi.messageContent({ children: [
    MessageUi.messageAuthor({ children: ['Ada'] }, h),
    Bubble.bubble({ variant: 'secondary', children: [
      Bubble.bubbleContent({ children: ['The Foldkit example is ready for review.'] }, h),
    ] }, h),
    MessageUi.messageMetadata({ children: ['10:42'] }, h),
  ] }, h),
] }, h),`),
      },
      {
        title: 'Outgoing', description: 'Alignment distinguishes the local participant without changing chronological order.',
        code: source('Outgoing', `MessageUi.message({ align: 'end', class: 'max-w-xl', children: [
  MessageUi.messageAvatar({ children: ['Y'] }, h),
  MessageUi.messageContent({ children: [
    MessageUi.messageAuthor({ children: ['You'] }, h),
    Bubble.bubble({ align: 'end', children: [
      Bubble.bubbleContent({ children: ['I will check the update and command flow.'] }, h),
    ] }, h),
    MessageUi.messageMetadata({ children: ['Delivered'] }, h),
  ] }, h),
] }, h),`),
      },
      {
        title: 'Live recovery', description: 'A long inbound status update exposes a keyboard action that remains a parent Message.',
        code: source('Live recovery', `MessageUi.messageGroup({ live: 'polite', ariaLabel: 'Project conversation', children: [
  MessageUi.message({ announcement: 'status', ariaLabel: 'New message from Ada', class: 'max-w-xl', children: [
    MessageUi.messageAvatar({ children: ['A'] }, h),
    MessageUi.messageContent({ children: [
      MessageUi.messageAuthor({ children: ['Ada'] }, h),
      Bubble.bubble({ variant: 'secondary', children: [Bubble.bubbleContent({ children: ['A long inbound message that wraps without widening the transcript.'] }, h)] }, h),
      MessageUi.messageMetadata({ children: ['Delivery failed'] }, h),
      MessageUi.messageActions({ children: [Button.button({ variant: 'outline', size: 'sm', onClick: ClickedExample(), children: ['Retry delivery'] }, h)] }, h),
    ] }, h),
  ] }, h),
] }, h),`),
      },
    ],
  },
});
