import * as Badge from '@/ui/badge';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Badge', componentSlug: 'badge', exampleName: name, viewBody });

export const badgePage = authoredPage({
  slug: 'badge',
  title: 'Badge',
  kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper',
    description: 'Displays a compact status, category, or count next to related content.',
    architecture: 'Badge is a stateless render helper. Its content comes from the parent Model and it returns Html directly.',
    apiHref: 'https://foldkit.dev/ui/overview',
    styling: 'Choose a semantic variant and keep labels short. Use class only for local spacing or an application-owned variant.',
    accessibility: 'Badge text should make sense without color. Do not use a badge as the only label for an interactive control.',
    examples: [
      {
        title: 'Variants',
        description: 'Variants communicate hierarchy and status while preserving readable text.',
        staticPreview: (_model, h) => h.div([h.Class('flex flex-wrap gap-2')], [
          Badge.badge({ children: ['Default'] }, h),
          Badge.badge({ variant: 'secondary', children: ['Secondary'] }, h),
          Badge.badge({ variant: 'outline', children: ['Outline'] }, h),
          Badge.badge({ variant: 'destructive', children: ['Blocked'] }, h),
        ]),
        code: source('Variants', `h.div([h.Class('flex flex-wrap gap-2')], [
  Badge.badge({ children: ['Default'] }, h),
  Badge.badge({ variant: 'secondary', children: ['Secondary'] }, h),
  Badge.badge({ variant: 'outline', children: ['Outline'] }, h),
  Badge.badge({ variant: 'destructive', children: ['Blocked'] }, h),
]),`),
      },
      {
        title: 'Status',
        description: 'Pair a concise state with nearby content instead of encoding meaning through color alone.',
        staticPreview: (_model, h) => Badge.badge({ variant: 'secondary', children: ['Ready to publish'] }, h),
        code: source('Status', `Badge.badge({
  variant: 'secondary',
  children: ['Ready to publish'],
}, h),`),
      },
    ],
  },
});
