import * as Empty from '@/ui/empty';
import * as Button from '@/ui/button';
import { authoredPage, interactionPreviewProgram, statelessComponentApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, viewBody: string): string =>
  statelessComponentApplication({
    componentName: 'Empty', componentSlug: 'empty', exampleName: name, viewBody,
    componentImports: `import * as Button from '@/ui/button'`,
  });
const previewProgram = interactionPreviewProgram('empty', (index, interaction, h) => {
  const titles = ['No projects yet', 'No matching components', 'Could not load projects', 'Access required'] as const;
  const descriptions = ['Create a project to start shipping with Crease UI.', 'Try a different search or clear the current filters.', 'The project service did not respond. Your existing data is unchanged; retry when the connection is available.', 'Ask a workspace administrator for permission to view this area. This request does not change your current access.'] as const;
  const actions = ['Create project', 'Clear filters', 'Retry', 'Request access'] as const;
  return Empty.empty({ class: `w-full max-w-xl${index === 0 ? ' border' : ''}`, children: [Empty.emptyHeader({ children: [Empty.emptyMedia({ variant: 'icon', children: [index === 2 ? '!' : index === 3 ? '×' : '+'] }, h), Empty.emptyTitle({ children: [titles[index] ?? titles[0]] }, h), Empty.emptyDescription({ children: [descriptions[index] ?? descriptions[0]] }, h)] }, h), Empty.emptyContent({ children: [Button.button({ ...(index === 1 ? { variant: 'outline' as const } : {}), onClick: interaction, children: [actions[index] ?? actions[0]] }, h)] }, h)] }, h);
});

export const emptyPage = authoredPage({
  slug: 'empty', title: 'Empty', kind: 'recipe',
  previewProgram,
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
      {
        title: 'Error recovery', description: 'Explain the failure without implying data loss and offer a retry Message.',
        code: source('Error recovery', `Empty.empty({
  class: 'w-full max-w-xl',
  children: [
    Empty.emptyHeader({ children: [
      Empty.emptyTitle({ children: ['Could not load projects'] }, h),
      Empty.emptyDescription({ children: ['The project service did not respond. Your existing data is unchanged.'] }, h),
    ] }, h),
    Empty.emptyContent({ children: [Button.button({ onClick: ClickedExample(), children: ['Retry'] }, h)] }, h),
  ],
}, h),`),
      },
      {
        title: 'Permission denied', description: 'Name the missing access and provide a parent-owned request action.',
        code: source('Permission denied', `Empty.empty({
  class: 'w-full max-w-xl',
  children: [
    Empty.emptyHeader({ children: [
      Empty.emptyTitle({ children: ['Access required'] }, h),
      Empty.emptyDescription({ children: ['Ask a workspace administrator for permission to view this area.'] }, h),
    ] }, h),
    Empty.emptyContent({ children: [Button.button({ onClick: ClickedExample(), children: ['Request access'] }, h)] }, h),
  ],
}, h),`),
      },
    ],
  },
});
