import * as Spinner from '@/ui/spinner';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Spinner', componentSlug: 'spinner', exampleName: name, viewBody });

export const spinnerPage = authoredPage({
  slug: 'spinner', title: 'Spinner', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Indicates short, indeterminate work with a compact animated icon.',
    architecture: 'Spinner is a stateless view helper. Command state in the parent Model determines when it appears.',
    apiHref: 'https://foldkit.dev/ui/overview',
    styling: 'Choose from finite sm, md, or lg sizes and current, muted, or primary tones. Prefer Skeleton when the shape of loading content is known.',
    accessibility: 'Provide label for a standalone spinner, or set isDecorative when a surrounding status already names the operation. Reduced-motion mode keeps the icon still.',
    examples: [
      {
        title: 'Default', description: 'Use the default size for compact control feedback.',
        staticPreview: (_model, h) => Spinner.spinner({ label: 'Loading content', size: 'md', tone: 'primary' }, h),
        code: source('Default', `Spinner.spinner({ label: 'Loading content', size: 'md', tone: 'primary' }, h),`),
      },
      {
        title: 'With Label', description: 'Visible text clarifies the operation represented by the spinner.',
        staticPreview: (_model, h) => h.div([h.Role('status'), h.Class('flex items-center gap-2 text-sm')], [Spinner.spinner({ isDecorative: true, size: 'sm', tone: 'muted' }, h), 'Saving changes']),
        code: source('With Label', `h.div([h.Class('flex items-center gap-2 text-sm')], [
  Spinner.spinner({ isDecorative: true, size: 'sm', tone: 'muted' }, h),
  'Saving changes',
]),`),
      },
    ],
  },
});
