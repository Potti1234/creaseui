import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export const aspectRatioFixtures = [
  {
    title: 'Video',
    description: 'Use 16 / 9 for common video and landscape media.',
    ratio: 16 / 9,
    label: '16:9',
  },
  {
    title: 'Square',
    description: 'A ratio of 1 keeps avatars and artwork square.',
    ratio: 1,
    label: '1:1',
  },
] as const;

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => {
  const item = aspectRatioFixtures[index] ?? aspectRatioFixtures[0];
  const componentInput = renderer === 'tailwind'
    ? `class: '${index === 0 ? 'w-full max-w-lg overflow-hidden rounded-lg bg-muted' : 'w-48 overflow-hidden rounded-lg bg-muted'}',`
    : `layoutStyle: styles.${index === 0 ? 'video' : 'square'},`;
  const componentImports = renderer === 'stylex'
    ? `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  video: { maxWidth: '32rem', width: '100%' },
  square: { width: '12rem' },
  content: {
    alignItems: 'center',
    backgroundColor: 'var(--muted)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--muted-foreground)',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
})`
    : undefined;
  const childAttributes = renderer === 'tailwind'
    ? `[h.Class('flex size-full items-center justify-center text-sm text-muted-foreground')]`
    : `[h.Class(stylex.props(styles.content).className ?? '')]`;

  return staticComponentApplication({
    componentName: 'AspectRatio',
    componentSlug: 'aspect-ratio',
    renderer,
    exampleName: item.title,
    ...(componentImports === undefined ? {} : { componentImports }),
    viewBody: `AspectRatio.aspectRatio({
  ratio: ${index === 0 ? '16 / 9' : '1'},
  ${componentInput}
  children: [h.div(${childAttributes}, ['${item.label}'])],
}, h),`,
  });
};

export const aspectRatioExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => aspectRatioFixtures.map((_item, index) => ({
  title: aspectRatioFixtures[index]!.title,
  description: aspectRatioFixtures[index]!.description,
  code: source(index, renderer),
}));
