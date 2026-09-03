import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

const withLabelSource = (renderer: 'tailwind' | 'stylex'): string =>
  staticComponentApplication({
    componentName: 'Spinner',
    componentSlug: 'spinner',
    renderer,
    exampleName: 'With Label',
    ...(renderer === 'stylex'
      ? {
          componentImports: `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  status: { alignItems: 'center', display: 'flex', fontSize: '0.875rem', gap: '0.5rem' },
})`,
        }
      : {}),
    viewBody: `h.div([
  h.Role('status'),
  ${renderer === 'tailwind' ? "h.Class('flex items-center gap-2 text-sm')" : "h.Class(stylex.props(styles.status).className ?? '')"},
], [
  Spinner.spinner({ isDecorative: true, size: 'sm', tone: 'muted' }, h),
  'Saving changes',
]),`,
  });

export const spinnerExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Default',
    description: 'Use the default size for compact control feedback.',
    code: staticComponentApplication({
      componentName: 'Spinner',
      componentSlug: 'spinner',
      renderer,
      exampleName: 'Default',
      viewBody: `Spinner.spinner({
  label: 'Loading content',
  size: 'md',
  tone: 'primary',
}, h),`,
    }),
  },
  {
    title: 'With Label',
    description: 'Visible text clarifies the operation represented by the spinner.',
    code: withLabelSource(renderer),
  },
];
