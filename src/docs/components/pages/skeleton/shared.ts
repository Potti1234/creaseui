import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

const stylexImports = `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  profile: { alignItems: 'center', display: 'flex', gap: '1rem' },
  lines: { display: 'grid', gap: '0.5rem' },
  wideLine: { width: '12rem' },
  card: { display: 'grid', gap: '0.75rem', maxWidth: '24rem', width: '100%' },
  media: { aspectRatio: 16 / 9, width: '100%' },
  title: { height: '1rem', width: '75%' },
  copy: { height: '1rem', width: '50%' },
})`;

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => staticComponentApplication({
  componentName: 'Skeleton',
  componentSlug: 'skeleton',
  renderer,
  exampleName: index === 0 ? 'Profile' : 'Card',
  ...(renderer === 'stylex' ? { componentImports: stylexImports } : {}),
  viewBody: index === 0
    ? `h.div([
  h.Role('status'),
  h.AriaBusy(true),
  h.AriaLabel('Loading profile'),
  ${renderer === 'tailwind' ? "h.Class('flex items-center gap-4')" : "h.Class(stylex.props(styles.profile).className ?? '')"},
], [
  Skeleton.skeleton({ shape: 'circle', size: 'lg' }, h),
  h.div([${renderer === 'tailwind' ? "h.Class('space-y-2')" : "h.Class(stylex.props(styles.lines).className ?? '')"}], [
    Skeleton.skeleton({ shape: 'text', size: 'md', ${renderer === 'tailwind' ? "class: 'w-48'" : 'layoutStyle: styles.wideLine'} }, h),
    Skeleton.skeleton({ shape: 'text', size: 'md' }, h),
  ]),
]),`
    : `h.div([${renderer === 'tailwind' ? "h.Class('w-full max-w-sm space-y-3')" : "h.Class(stylex.props(styles.card).className ?? '')"}], [
  Skeleton.skeleton({ ${renderer === 'tailwind' ? "class: 'aspect-video w-full'" : 'layoutStyle: styles.media'} }, h),
  Skeleton.skeleton({ ${renderer === 'tailwind' ? "class: 'h-4 w-3/4'" : 'layoutStyle: styles.title'} }, h),
  Skeleton.skeleton({ ${renderer === 'tailwind' ? "class: 'h-4 w-1/2'" : 'layoutStyle: styles.copy'} }, h),
]),`,
});

export const skeletonExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Profile',
    description: 'Mirror the avatar and text geometry of the eventual profile row.',
    code: source(0, renderer),
  },
  {
    title: 'Card',
    description: 'Reserve media and copy as one stable loading composition.',
    code: source(1, renderer),
  },
];
