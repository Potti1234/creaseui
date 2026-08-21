import * as Empty from '@/ui/empty';
import * as Button from '@/ui/button';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, statelessComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  statelessComponentApplication({
    componentName: 'Empty', componentSlug: 'empty', exampleName: name, viewBody,
    componentImports: `import * as Button from '@/ui/button'`,
  });

const clicked = State.ClickedPreviewAction();

export const emptyPage = authoredPage({
  slug: 'empty', title: 'Empty', kind: 'recipe',
  definition: {
    kind: 'recipe',
    description: 'Explains an empty collection or unavailable result and offers a useful next action.',
    architecture: 'Empty is a stateless composition recipe. The parent Model determines why content is absent and the action dispatches a domain Message.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'Empty\n├── EmptyHeader → EmptyMedia / EmptyTitle / EmptyDescription\n└── EmptyContent → application actions',
    styling: 'Keep the composition focused: one explanation, one primary recovery action, and optional supporting guidance.',
    accessibility: 'Use a real heading for the title when the empty state is the main content. Action labels should describe what happens next.',
    examples: [
      {
        title: 'Create First Item', description: 'Teach the empty collection and provide the action that resolves it.',
        preview: (_model, h) => Empty.empty({ class: 'w-full max-w-xl border', children: [
          Empty.emptyHeader({ children: [
            Empty.emptyMedia({ variant: 'icon', children: ['+'] }, h),
            Empty.emptyTitle({ children: ['No projects yet'] }, h),
            Empty.emptyDescription({ children: ['Create a project to start shipping with Crease UI.'] }, h),
          ] }, h),
          Empty.emptyContent({ children: [Button.button({ onClick: clicked, children: ['Create project'] }, h)] }, h),
        ] }, h),
        code: source('Create First Item', `Empty.empty({
  class: 'w-full max-w-xl border',
  children: [
    Empty.emptyHeader({ children: [
      Empty.emptyMedia({ variant: 'icon', children: ['+'] }, h),
      Empty.emptyTitle({ children: ['No projects yet'] }, h),
      Empty.emptyDescription({ children: ['Create a project to start shipping.'] }, h),
    ] }, h),
    Empty.emptyContent({ children: [
      Button.button({ onClick: ClickedExample(), children: ['Create project'] }, h),
    ] }, h),
  ],
}, h),`),
      },
      {
        title: 'No Results', description: 'Describe the active filter and offer a direct way to clear it.',
        preview: (_model, h) => Empty.empty({ class: 'w-full max-w-xl', children: [
          Empty.emptyHeader({ children: [Empty.emptyTitle({ children: ['No matching components'] }, h), Empty.emptyDescription({ children: ['Try a different search or clear the current filters.'] }, h)] }, h),
          Empty.emptyContent({ children: [Button.button({ variant: 'outline', onClick: clicked, children: ['Clear filters'] }, h)] }, h),
        ] }, h),
        code: source('No Results', `Empty.empty({
  class: 'w-full max-w-xl',
  children: [
    Empty.emptyHeader({ children: [
      Empty.emptyTitle({ children: ['No matching components'] }, h),
      Empty.emptyDescription({ children: ['Try a different search or clear the filters.'] }, h),
    ] }, h),
    Empty.emptyContent({ children: [
      Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Clear filters'] }, h),
    ] }, h),
  ],
}, h),`),
      },
    ],
  },
});
