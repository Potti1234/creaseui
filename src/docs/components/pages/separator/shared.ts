import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

const stylexImports = `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  horizontal: { display: 'grid', gap: '1rem', maxWidth: '28rem', width: '100%' },
  vertical: { alignItems: 'center', display: 'flex', gap: '1rem', height: '1.25rem' },
})`;

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => staticComponentApplication({
  componentName: 'Separator',
  componentSlug: 'separator',
  renderer,
  exampleName: index === 0 ? 'Horizontal' : 'Vertical',
  ...(renderer === 'stylex' ? { componentImports: stylexImports } : {}),
  viewBody: index === 0
    ? `h.div([${renderer === 'tailwind' ? "h.Class('w-full max-w-md space-y-4')" : "h.Class(stylex.props(styles.horizontal).className ?? '')"}], [
  'Account',
  Separator.separator({}, h),
  'Preferences',
]),`
    : `h.div([${renderer === 'tailwind' ? "h.Class('flex h-5 items-center gap-4')" : "h.Class(stylex.props(styles.vertical).className ?? '')"}], [
  'Docs',
  Separator.separator({ orientation: 'vertical', decorative: false }, h),
  'API',
]),`,
});

export const separatorExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Horizontal',
    description: 'Divide vertically stacked regions with a full-width rule.',
    code: source(0, renderer),
  },
  {
    title: 'Vertical',
    description: 'Give a vertical separator an explicit height through its parent or layout style.',
    code: source(1, renderer),
  },
];
