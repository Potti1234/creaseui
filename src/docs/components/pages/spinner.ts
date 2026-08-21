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
    styling: 'Size and color inherit from class and surrounding text. Prefer Skeleton when the shape of loading content is known.',
    accessibility: 'The icon carries a Loading label. Pair it with visible text when users need to understand which operation is active.',
    examples: [
      {
        title: 'Default', description: 'Use the default size for compact control feedback.',
        staticPreview: (_model, h) => Spinner.spinner({}, h),
        code: source('Default', `Spinner.spinner({}, h),`),
      },
      {
        title: 'With Label', description: 'Visible text clarifies the operation represented by the spinner.',
        staticPreview: (_model, h) => h.div([h.Class('flex items-center gap-2 text-sm')], [Spinner.spinner({}, h), 'Saving changes']),
        code: source('With Label', `h.div([h.Class('flex items-center gap-2 text-sm')], [
  Spinner.spinner({}, h),
  'Saving changes',
]),`),
      },
    ],
  },
});
