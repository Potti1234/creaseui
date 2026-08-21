import * as Separator from '@/ui/separator';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Separator', componentSlug: 'separator', exampleName: name, viewBody });

export const separatorPage = authoredPage({
  slug: 'separator', title: 'Separator', kind: 'helper',
  definition: {
    kind: 'helper', description: 'Visually separates adjacent content without adding semantic structure.',
    architecture: 'Separator is a stateless decorative helper. Content grouping belongs in semantic parent elements.',
    apiHref: 'https://foldkit.dev/ui/overview',
    accessibility: 'The separator is hidden from the accessibility tree with role="none" because it is purely visual.',
    examples: [
      {
        title: 'Horizontal', description: 'Divide vertically stacked regions with a full-width rule.',
        preview: (_model, h) => h.div([h.Class('w-full max-w-md space-y-4')], ['Account', Separator.separator({}, h), 'Preferences']),
        code: source('Horizontal', `h.div([h.Class('w-full max-w-md space-y-4')], [
  'Account',
  Separator.separator({}, h),
  'Preferences',
]),`),
      },
      {
        title: 'Vertical', description: 'Give a vertical separator an explicit height through its parent or class.',
        preview: (_model, h) => h.div([h.Class('flex h-5 items-center gap-4')], ['Docs', Separator.separator({ orientation: 'vertical' }, h), 'API']),
        code: source('Vertical', `h.div([h.Class('flex h-5 items-center gap-4')], [
  'Docs',
  Separator.separator({ orientation: 'vertical' }, h),
  'API',
]),`),
      },
    ],
  },
});
