import * as MessageUi from '@/ui/message';
import * as Bubble from '@/ui/bubble';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string => staticComponentApplication({ componentName: 'MessageUi', componentSlug: 'message', exampleName: name, viewBody, componentImports: `import * as Bubble from '@/ui/bubble'` });

export const messagePage = authoredPage({
  slug: 'message', title: 'Message', kind: 'recipe',
  previewMode: 'static',
  definition: {
    kind: 'recipe', description: 'Composes sender identity, conversational content, and delivery metadata into one transcript row.',
    architecture: 'Message is a stateless composition recipe. The parent owns the ordered transcript and maps each domain message into Message and Bubble helpers.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'MessageGroup\n└── Message → MessageAvatar / MessageContent\n              └── MessageHeader / Bubble / MessageFooter',
    styling: 'Keep sender alignment consistent across the transcript and use Bubble variants for content tone rather than reordering the DOM.',
    accessibility: 'Render transcript updates in an appropriately labeled log when they arrive live. Sender names and delivery state must be text, not color alone.',
    examples: [
      {
        title: 'Incoming', description: 'Keep sender, content, and timestamp in one readable row.',
        preview: (_model, h) => MessageUi.message({ class: 'max-w-xl', children: [
          MessageUi.messageAvatar({ children: ['A'] }, h),
          MessageUi.messageContent({ children: [MessageUi.messageHeader({ children: ['Ada'] }, h), Bubble.bubble({ variant: 'secondary', children: [Bubble.bubbleContent({ children: ['The Foldkit example is ready for review.'] }, h)] }, h), MessageUi.messageFooter({ children: ['10:42'] }, h)] }, h),
        ] }, h),
        code: source('Incoming', `MessageUi.message({ class: 'max-w-xl', children: [
  MessageUi.messageAvatar({ children: ['A'] }, h),
  MessageUi.messageContent({ children: [
    MessageUi.messageHeader({ children: ['Ada'] }, h),
    Bubble.bubble({ variant: 'secondary', children: [
      Bubble.bubbleContent({ children: ['The Foldkit example is ready for review.'] }, h),
    ] }, h),
    MessageUi.messageFooter({ children: ['10:42'] }, h),
  ] }, h),
] }, h),`),
      },
      {
        title: 'Outgoing', description: 'Alignment distinguishes the local participant without changing chronological order.',
        preview: (_model, h) => MessageUi.message({ align: 'end', class: 'max-w-xl', children: [MessageUi.messageAvatar({ children: ['Y'] }, h), MessageUi.messageContent({ children: [MessageUi.messageHeader({ children: ['You'] }, h), Bubble.bubble({ align: 'end', children: [Bubble.bubbleContent({ children: ['I will check the update and command flow.'] }, h)] }, h), MessageUi.messageFooter({ children: ['Delivered'] }, h)] }, h)] }, h),
        code: source('Outgoing', `MessageUi.message({ align: 'end', class: 'max-w-xl', children: [
  MessageUi.messageAvatar({ children: ['Y'] }, h),
  MessageUi.messageContent({ children: [
    MessageUi.messageHeader({ children: ['You'] }, h),
    Bubble.bubble({ align: 'end', children: [
      Bubble.bubbleContent({ children: ['I will check the update and command flow.'] }, h),
    ] }, h),
    MessageUi.messageFooter({ children: ['Delivered'] }, h),
  ] }, h),
] }, h),`),
      },
    ],
  },
});
