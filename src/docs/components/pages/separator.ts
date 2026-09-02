import * as Separator from '@/ui/separator';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Separator', componentSlug: 'separator', exampleName: name, viewBody });

export const separatorPage = authoredPage({
  slug: 'separator', title: 'Separator', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Separates adjacent content visually or as an explicit semantic boundary.',
    architecture: 'Separator is stateless. It defaults to decorative role none; decorative: false opts into the separator role when the boundary conveys structure.',
    apiHref: 'https://foldkit.dev/ui/overview',
    accessibility: 'Keep decorative separators out of the accessibility tree. Use decorative: false only when the boundary itself conveys organization.',
    examples: [
      {
        title: 'Horizontal', description: 'Divide vertically stacked regions with a full-width rule.',
        staticPreview: (_model, h) => h.div([h.Class('w-full max-w-md space-y-4')], ['Account', Separator.separator({}, h), 'Preferences']),
        code: source('Horizontal', `h.div([h.Class('w-full max-w-md space-y-4')], [
  'Account',
  Separator.separator({}, h),
  'Preferences',
]),`),
      },
      {
        title: 'Vertical', description: 'Give a vertical separator an explicit height through its parent or class.',
        staticPreview: (_model, h) => h.div([h.Class('flex h-5 items-center gap-4')], ['Docs', Separator.separator({ orientation: 'vertical', decorative: false }, h), 'API']),
        code: source('Vertical', `h.div([h.Class('flex h-5 items-center gap-4')], [
  'Docs',
  Separator.separator({ orientation: 'vertical', decorative: false }, h),
  'API',
]),`),
      },
    ],
  },
});
