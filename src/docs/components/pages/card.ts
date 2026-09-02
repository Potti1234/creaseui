import * as Card from '@/ui/card';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Card', componentSlug: 'card', exampleName: name, viewBody });

export const cardPage = authoredPage({
  slug: 'card', title: 'Card', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper',
    description: 'Groups related information and actions into one visually distinct surface.',
    architecture: 'Card is a family of stateless layout helpers. The parent view chooses semantic elements and supplies all behavior through child components.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'Card\n├── CardHeader → CardTitle / CardDescription / CardAction\n├── CardContent\n└── CardFooter',
    styling: 'Compose named parts instead of rebuilding their spacing. Use the element option when section or article better describes the content.',
    accessibility: 'Card adds no landmark by default. Choose section or article only when the content has the corresponding document meaning and provide a heading.',
    examples: [
      {
        title: 'Article', description: 'Use the article element for a self-contained item with its own heading.',
        staticPreview: (_model, h) => Card.card({ element: 'article', class: 'w-full max-w-sm', children: [
          Card.cardHeader({ children: [Card.cardTitle({ element: 'h2', children: ['Release notes'] }, h), Card.cardDescription({ children: ['Crease UI 0.1.0'] }, h)] }, h),
          Card.cardContent({ children: ['A source-owned component library for Foldkit applications.'] }, h),
        ] }, h),
        code: source('Article', `Card.card({
  element: 'article',
  class: 'w-full max-w-sm',
  children: [
    Card.cardHeader({ children: [
      Card.cardTitle({ element: 'h2', children: ['Release notes'] }, h),
      Card.cardDescription({ children: ['Crease UI 0.1.0'] }, h),
    ] }, h),
    Card.cardContent({ children: ['A source-owned component library for Foldkit applications.'] }, h),
  ],
}, h),`),
      },
      {
        title: 'With Footer', description: 'Keep supporting actions in the footer while domain behavior remains in the child controls.',
        staticPreview: (_model, h) => Card.card({ class: 'w-full max-w-sm', children: [
          Card.cardHeader({ children: [Card.cardTitle({ children: ['Deploy project'] }, h), Card.cardDescription({ children: ['Production is ready.'] }, h)] }, h),
          Card.cardContent({ children: ['All checks passed.'] }, h),
          Card.cardFooter({ class: 'justify-end text-sm font-medium', children: ['Ready to deploy'] }, h),
        ] }, h),
        code: source('With Footer', `Card.card({
  class: 'w-full max-w-sm',
  children: [
    Card.cardHeader({ children: [
      Card.cardTitle({ children: ['Deploy project'] }, h),
      Card.cardDescription({ children: ['Production is ready.'] }, h),
    ] }, h),
    Card.cardContent({ children: ['All checks passed.'] }, h),
    Card.cardFooter({ class: 'justify-end', children: ['Ready to deploy'] }, h),
  ],
}, h),`),
      },
    ],
  },
});
