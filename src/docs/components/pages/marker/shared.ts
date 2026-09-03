import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

const bodies = [
  `Marker.marker({
  variant: 'separator',
  LAYOUT_INPUT
  children: [Marker.markerContent({ children: ['Today'] }, h)],
}, h),`,
  `Marker.marker({
  LAYOUT_INPUT
  children: [
    Marker.markerIcon({ children: ['●'] }, h),
    Marker.markerContent({ children: ['Deployment completed'] }, h),
  ],
}, h),`,
  `Marker.marker({
  variant: 'border',
  LAYOUT_INPUT
  children: [Marker.markerContent({ children: ['Earlier'] }, h)],
}, h),`,
] as const;

const metadata = [
  { title: 'Separator', description: 'Separate groups in a timeline with a centered textual marker.' },
  { title: 'With Icon', description: 'Pair a decorative icon with content when it helps scanning.' },
  { title: 'Border', description: 'Use a border marker as a compact heading between adjacent regions.' },
] as const;

export const markerExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map((item, index) =>
  ({
    ...item,
    code: staticComponentApplication({
      componentName: 'Marker',
      componentSlug: 'marker',
      renderer,
      exampleName: item.title,
      ...(renderer === 'stylex'
        ? {
            componentImports: `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({ marker: { maxWidth: '32rem' } })`,
          }
        : {}),
      viewBody: (bodies[index] ?? bodies[0]).replace(
        'LAYOUT_INPUT',
        renderer === 'tailwind'
          ? "class: 'max-w-lg',"
          : 'layoutStyle: styles.marker,',
      ),
    }),
  })
);
