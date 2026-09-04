import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export const cardFixtures = [
  { title: 'Article', description: 'Use the article element for a self-contained item with its own heading.' },
  { title: 'With Footer', description: 'Keep supporting actions in the footer while domain behavior remains in the child controls.' },
] as const;

const body = (index: number, renderer: 'tailwind' | 'stylex'): string => index === 0 ? `Card.card({
  element: 'article',
  ${renderer === 'stylex' ? 'layoutStyle: styles.card,' : "class: 'w-full max-w-sm',"}
  children: [
    Card.cardHeader({ children: [
      Card.cardTitle({ element: 'h2', children: ['Release notes'] }, h),
      Card.cardDescription({ children: ['Crease UI 0.1.0'] }, h),
    ] }, h),
    Card.cardContent({ children: ['A source-owned component library for Foldkit applications.'] }, h),
  ],
}, h)` : `Card.card({
  ${renderer === 'stylex' ? 'layoutStyle: styles.card,' : "class: 'w-full max-w-sm',"}
  children: [
    Card.cardHeader({ children: [
      Card.cardTitle({ children: ['Deploy project'] }, h),
      Card.cardDescription({ children: ['Production is ready.'] }, h),
    ] }, h),
    Card.cardContent({ children: ['All checks passed.'] }, h),
    Card.cardFooter({ ${renderer === 'stylex' ? "children: [h.span([h.Class(stylex.props(styles.footerCopy).className ?? '')], ['Ready to deploy'])]" : "class: 'justify-end', children: ['Ready to deploy']"} }, h),
  ],
}, h)`;

export const cardExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => cardFixtures.map((fixture, index) => ({
  title: fixture.title, description: fixture.description,
  code: staticComponentApplication({ componentName: 'Card', componentSlug: 'card', renderer, exampleName: fixture.title, ...(renderer === 'stylex' ? { componentImports: "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ card: { width: '100%', maxWidth: '24rem' }, footerCopy: { marginInlineStart: 'auto', fontSize: '0.875rem', fontWeight: 500 } })" } : {}), viewBody: body(index, renderer) }),
}));
