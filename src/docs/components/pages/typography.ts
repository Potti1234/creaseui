import * as Typography from '@/ui/typography';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Typography', componentSlug: 'typography', exampleName: name, viewBody });

export const typographyPage = authoredPage({
  slug: 'typography', title: 'Typography', kind: 'recipe',
  definition: {
    kind: 'recipe', description: 'Applies a consistent prose hierarchy to headings, paragraphs, quotations, code, and supporting text.',
    architecture: 'Typography is a source-owned collection of stateless semantic helpers. Content remains ordinary Html and requires no component model.',
    apiHref: 'https://foldkit.dev/ui/overview',
    styling: 'The helpers encode the documentation type scale. Prefer semantic elements through the matching helper and use class for contextual alignment or width.',
    accessibility: 'Choose heading levels according to document outline, not visual size. Inline code and blockquotes retain their native semantics.',
    examples: [
      {
        title: 'Article', description: 'Compose semantic headings and paragraphs into a readable article rhythm.',
        preview: (_model, h) => h.article([h.Class('w-full max-w-2xl')], [
          Typography.typographyH2({ children: ['Foldkit architecture'] }, h),
          Typography.typographyLead({ children: ['Model behavior explicitly and keep views pure.'] }, h),
          Typography.typographyP({ children: ['Messages describe facts. The update function owns state transitions and commands describe effects.'] }, h),
        ]),
        code: source('Article', `h.article([h.Class('w-full max-w-2xl')], [
  Typography.typographyH2({ children: ['Foldkit architecture'] }, h),
  Typography.typographyLead({ children: ['Model behavior explicitly and keep views pure.'] }, h),
  Typography.typographyP({ children: ['Messages describe facts. Updates own state transitions.'] }, h),
]),`),
      },
      {
        title: 'Inline Code', description: 'Use inline code for symbols, package names, and short expressions inside prose.',
        preview: (_model, h) => Typography.typographyP({ children: ['Render stateful children with ', Typography.typographyInlineCode({ children: ['h.submodel'] }, h), '.'] }, h),
        code: source('Inline Code', `Typography.typographyP({ children: [
  'Render stateful children with ',
  Typography.typographyInlineCode({ children: ['h.submodel'] }, h),
  '.',
] }, h),`),
      },
      {
        title: 'Quotation', description: 'Preserve blockquote semantics for attributed or quoted prose.',
        preview: (_model, h) => Typography.typographyBlockquote({ children: ['The architecture is solved; model the behavior.'] }, h),
        code: source('Quotation', `Typography.typographyBlockquote({
  children: ['The architecture is solved; model the behavior.'],
}, h),`),
      },
    ],
  },
});
