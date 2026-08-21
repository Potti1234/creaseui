import * as Progress from '@/ui/progress';
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  staticComponentApplication({ componentName: 'Progress', componentSlug: 'progress', exampleName: name, viewBody });

export const progressPage = authoredPage({
  slug: 'progress', title: 'Progress', kind: 'helper',
  definition: {
    kind: 'helper',
    description: 'Shows the completion of a task as a determinate or indeterminate horizontal indicator.',
    architecture: 'Progress is a stateless projection of a value in the parent Model. Commands update that value; the view only renders it.',
    apiHref: 'https://foldkit.dev/ui/overview',
    styling: 'The root owns the track and the indicator uses a transform, keeping updates compositor-friendly.',
    accessibility: 'The component exposes progressbar semantics and clamps determinate values to 0–100. Indeterminate progress omits aria-valuenow.',
    examples: [
      {
        title: 'Determinate', description: 'Pass a numeric percentage when total work is known.',
        preview: (_model, h) => Progress.progress({ value: 64, class: 'max-w-md' }, h),
        code: source('Determinate', `Progress.progress({ value: 64, class: 'max-w-md' }, h),`),
      },
      {
        title: 'Indeterminate', description: 'Pass null while work is active but its total cannot be measured.',
        preview: (_model, h) => Progress.progress({ value: null, class: 'max-w-md' }, h),
        code: source('Indeterminate', `Progress.progress({ value: null, class: 'max-w-md' }, h),`),
      },
    ],
  },
});
