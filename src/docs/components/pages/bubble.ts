import * as Bubble from '@/ui/bubble';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Bubble', componentSlug: 'bubble', exampleName: name, viewBody });

const message = <Msg>(
  text: string,
  variant: Bubble.BubbleVariant,
  align: 'start' | 'end',
  h: Parameters<typeof Bubble.bubble<Msg>>[1],
) => Bubble.bubble({ variant, align, children: [Bubble.bubbleContent({ children: [text] }, h)] }, h);

export const bubblePage = authoredPage({
  slug: 'bubble', title: 'Bubble', kind: 'helper',
  definition: {
    kind: 'helper',
    description: 'Presents one message in a conversational thread with alignment, tone, and optional reactions.',
    architecture: 'Bubble is a stateless composition helper. The application Model owns the message list, sender, delivery state, and reactions; view maps those values to bubbles.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'BubbleGroup\n└── Bubble → BubbleContent / BubbleReactions',
    styling: 'Use align to distinguish participants and variants for semantic tone. Keep message width bounded for readable line length.',
    accessibility: 'Render the surrounding transcript as a list or log when messages update live. Alignment and color must not be the only indication of the sender.',
    examples: [
      {
        title: 'Conversation', description: 'Map sender identity to alignment while preserving a chronological DOM order.',
        preview: (_model, h) => Bubble.bubbleGroup({ class: 'w-full max-w-md', children: [
          message('Can you review the Foldkit update?', 'secondary', 'start', h),
          message('Yes — I will check the model and command flow.', 'default', 'end', h),
        ] }, h),
        code: source('Conversation', `Bubble.bubbleGroup({
  class: 'w-full max-w-md',
  children: [
    Bubble.bubble({ variant: 'secondary', align: 'start', children: [
      Bubble.bubbleContent({ children: ['Can you review the Foldkit update?'] }, h),
    ] }, h),
    Bubble.bubble({ align: 'end', children: [
      Bubble.bubbleContent({ children: ['Yes — I will check the model and command flow.'] }, h),
    ] }, h),
  ],
}, h),`),
      },
      {
        title: 'Reaction', description: 'Place reactions as supporting metadata without changing the message content.',
        preview: (_model, h) => Bubble.bubble({ variant: 'tinted', children: [
          Bubble.bubbleContent({ children: ['The documentation build passed.'] }, h),
          Bubble.bubbleReactions({ children: ['👍 3'] }, h),
        ] }, h),
        code: source('Reaction', `Bubble.bubble({
  variant: 'tinted',
  children: [
    Bubble.bubbleContent({ children: ['The documentation build passed.'] }, h),
    Bubble.bubbleReactions({ children: ['👍 3'] }, h),
  ],
}, h),`),
      },
      {
        title: 'Error', description: 'Use destructive tone for a failed message and include readable explanatory text.',
        preview: (_model, h) => message('Message could not be sent.', 'destructive', 'end', h),
        code: source('Error', `Bubble.bubble({ variant: 'destructive', align: 'end', children: [
  Bubble.bubbleContent({ children: ['Message could not be sent.'] }, h),
] }, h),`),
      },
    ],
  },
});
