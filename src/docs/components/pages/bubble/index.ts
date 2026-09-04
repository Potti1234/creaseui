import { authoredPage } from '@/docs/components/pages/authored-page';
import { bubbleExamples } from '@/docs/components/pages/bubble/shared';
import { bubbleTailwindPreviews } from '@/docs/components/pages/bubble/tailwind';

const tailwindExamples = bubbleExamples('tailwind').map((example, index) => ({ ...example, staticPreview: (bubbleTailwindPreviews[index] ?? bubbleTailwindPreviews[0])! }));

export const bubblePage = authoredPage({
  slug: 'bubble', title: 'Bubble', kind: 'helper', previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Presents one message in a conversational thread with alignment, tone, and optional reactions.',
    architecture: 'Bubble is a stateless composition helper. The application Model owns the message list, sender, delivery state, and reactions; view maps those values to bubbles.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'BubbleGroup\n└── Bubble → BubbleContent / BubbleReactions',
    styling: 'Use align to distinguish participants and variants for semantic tone. Keep message width bounded for readable line length.',
    accessibility: 'Render the surrounding transcript as a list or log when messages update live. Alignment and color must not be the only indication of the sender.',
    examples: tailwindExamples, stylexExamples: bubbleExamples('stylex'),
  },
});
