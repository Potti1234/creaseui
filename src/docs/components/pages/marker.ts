import * as Marker from '@/ui/marker';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Marker', componentSlug: 'marker', exampleName: name, viewBody });

export const markerPage = authoredPage({
  slug: 'marker', title: 'Marker', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Labels a boundary, timestamp, or contextual point inside a longer stream of content.',
    architecture: 'Marker is a stateless view helper. The parent Model chooses where markers occur in the surrounding sequence.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'Marker → MarkerIcon / MarkerContent',
    styling: 'Choose separator for a centered label between rules or border for a conventional section boundary.',
    accessibility: 'Marker text should describe the boundary in words. Decorative icons are hidden by MarkerIcon and must not carry unique meaning.',
    examples: [
      {
        title: 'Separator', description: 'Separate groups in a timeline with a centered textual marker.',
        staticPreview: (_model, h) => Marker.marker({ variant: 'separator', class: 'max-w-lg', children: [Marker.markerContent({ children: ['Today'] }, h)] }, h),
        code: source('Separator', `Marker.marker({
  variant: 'separator',
  class: 'max-w-lg',
  children: [Marker.markerContent({ children: ['Today'] }, h)],
}, h),`),
      },
      {
        title: 'With Icon', description: 'Pair a decorative icon with content when it helps scanning.',
        staticPreview: (_model, h) => Marker.marker({ class: 'max-w-lg', children: [Marker.markerIcon({ children: ['●'] }, h), Marker.markerContent({ children: ['Deployment completed'] }, h)] }, h),
        code: source('With Icon', `Marker.marker({
  class: 'max-w-lg',
  children: [
    Marker.markerIcon({ children: ['●'] }, h),
    Marker.markerContent({ children: ['Deployment completed'] }, h),
  ],
}, h),`),
      },
      {
        title: 'Border', description: 'Use a border marker as a compact heading between adjacent regions.',
        staticPreview: (_model, h) => Marker.marker({ variant: 'border', class: 'max-w-lg', children: [Marker.markerContent({ children: ['Earlier'] }, h)] }, h),
        code: source('Border', `Marker.marker({ variant: 'border', class: 'max-w-lg', children: [
  Marker.markerContent({ children: ['Earlier'] }, h),
] }, h),`),
      },
    ],
  },
});
