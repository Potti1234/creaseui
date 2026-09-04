import { authoredPage } from '@/docs/components/pages/authored-page';
import { cardExamples } from '@/docs/components/pages/card/shared';
import { cardTailwindPreviews } from '@/docs/components/pages/card/tailwind';

const tailwindExamples = cardExamples('tailwind').map((example, index) => ({ ...example, staticPreview: (cardTailwindPreviews[index] ?? cardTailwindPreviews[0])! }));
export const cardPage = authoredPage({
  slug: 'card', title: 'Card', kind: 'helper', previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Groups related information and actions into one visually distinct surface.',
    architecture: 'Card is a family of stateless layout helpers. The parent view chooses semantic elements and supplies all behavior through child components.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'Card\n├── CardHeader → CardTitle / CardDescription / CardAction\n├── CardContent\n└── CardFooter',
    styling: 'Compose named parts instead of rebuilding their spacing. Use the element option when section or article better describes the content.',
    accessibility: 'Card adds no landmark by default. Choose section or article only when the content has the corresponding document meaning and provide a heading.',
    examples: tailwindExamples, stylexExamples: cardExamples('stylex'),
  },
});
