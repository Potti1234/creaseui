import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export const badgeVariants = [
  { label: 'Default', variant: 'default' },
  { label: 'Secondary', variant: 'secondary' },
  { label: 'Outline', variant: 'outline' },
  { label: 'Blocked', variant: 'destructive' },
] as const;

const variantsSource = (renderer: 'tailwind' | 'stylex'): string =>
  staticComponentApplication({
    componentName: 'Badge',
    componentSlug: 'badge',
    renderer,
    exampleName: 'Variants',
    ...(renderer === 'stylex'
      ? {
          componentImports: `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  row: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
})`,
        }
      : {}),
    viewBody: `h.div([${
      renderer === 'tailwind'
        ? "h.Class('flex flex-wrap gap-2')"
        : "h.Class(stylex.props(styles.row).className ?? '')"
    }], [
  Badge.badge({ children: ['Default'] }, h),
  Badge.badge({ variant: 'secondary', children: ['Secondary'] }, h),
  Badge.badge({ variant: 'outline', children: ['Outline'] }, h),
  Badge.badge({ variant: 'destructive', children: ['Blocked'] }, h),
]),`,
  });

export const badgeExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Variants',
    description: 'Variants communicate hierarchy and status while preserving readable text.',
    code: variantsSource(renderer),
  },
  {
    title: 'Status',
    description: 'Pair a concise state with nearby content instead of encoding meaning through color alone.',
    code: staticComponentApplication({
      componentName: 'Badge',
      componentSlug: 'badge',
      renderer,
      exampleName: 'Status',
      viewBody: `Badge.badge({
  variant: 'secondary',
  children: ['Ready to publish'],
}, h),`,
    }),
  },
];
