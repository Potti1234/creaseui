import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => staticComponentApplication({
  componentName: 'Typography',
  componentSlug: 'typography',
  renderer,
  exampleName: index === 0 ? 'Article' : index === 1 ? 'Inline Code' : 'Quotation',
  ...(renderer === 'stylex' && index === 0
    ? {
        componentImports: `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({ article: { maxWidth: '42rem', width: '100%' } })`,
      }
    : {}),
  viewBody: index === 0
    ? `h.article([${renderer === 'tailwind' ? "h.Class('w-full max-w-2xl')" : "h.Class(stylex.props(styles.article).className ?? '')"}], [
  Typography.typographyH2({ children: ['Foldkit architecture'] }, h),
  Typography.typographyLead({
    children: ['Model behavior explicitly and keep views pure.'],
  }, h),
  Typography.typographyP({
    children: ['Messages describe facts. The update function owns state transitions and commands describe effects.'],
  }, h),
]),`
    : index === 1
      ? `Typography.typographyP({ children: [
  'Render stateful children with ',
  Typography.typographyInlineCode({ children: ['h.submodel'] }, h),
  '.',
] }, h),`
      : `Typography.typographyBlockquote({
  children: ['The architecture is solved; model the behavior.'],
}, h),`,
});

export const typographyExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Article',
    description: 'Compose semantic headings and paragraphs into a readable article rhythm.',
    code: source(0, renderer),
  },
  {
    title: 'Inline Code',
    description: 'Use inline code for symbols, package names, and short expressions inside prose.',
    code: source(1, renderer),
  },
  {
    title: 'Quotation',
    description: 'Preserve blockquote semantics for attributed or quoted prose.',
    code: source(2, renderer),
  },
];
