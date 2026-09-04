import type { DocsExample } from '@/docs/components/page-definition';
import { statelessComponentApplication } from '@/docs/components/pages/authored-page';

export const emptyFixtures = [
  { title: 'Create First Item', description: 'Teach the empty collection and provide the action that resolves it.', heading: 'No projects yet', copy: 'Create a project to start shipping with Crease UI.', sourceCopy: 'Create a project to start shipping.', action: 'Create project', icon: '+', outline: false, bordered: true },
  { title: 'No Results', description: 'Describe the active filter and offer a direct way to clear it.', heading: 'No matching components', copy: 'Try a different search or clear the current filters.', sourceCopy: 'Try a different search or clear the filters.', action: 'Clear filters', icon: '+', outline: true, bordered: false },
  { title: 'Error recovery', description: 'Explain the failure without implying data loss and offer a retry Message.', heading: 'Could not load projects', copy: 'The project service did not respond. Your existing data is unchanged; retry when the connection is available.', sourceCopy: 'The project service did not respond. Your existing data is unchanged.', action: 'Retry', icon: '!', outline: false, bordered: false },
  { title: 'Permission denied', description: 'Name the missing access and provide a parent-owned request action.', heading: 'Access required', copy: 'Ask a workspace administrator for permission to view this area. This request does not change your current access.', sourceCopy: 'Ask a workspace administrator for permission to view this area.', action: 'Request access', icon: '×', outline: false, bordered: false },
] as const;

const emptyBody = (fixture: (typeof emptyFixtures)[number], renderer: 'tailwind' | 'stylex'): string => `${renderer === 'stylex' && fixture.bordered ? "h.div([h.Class(stylex.props(styles.bordered).className ?? '')], [\n" : ''}Empty.empty({
  ${renderer === 'stylex' ? 'layoutStyle: styles.empty,' : `class: 'w-full max-w-xl${fixture.bordered ? ' border' : ''}',`}
  children: [
    Empty.emptyHeader({ children: [
      Empty.emptyMedia({ variant: 'icon', children: ['${fixture.icon}'] }, h),
      Empty.emptyTitle({ children: ['${fixture.heading}'] }, h),
      Empty.emptyDescription({ children: ['${fixture.sourceCopy}'] }, h),
    ] }, h),
    Empty.emptyContent({ children: [
      Button.button({${fixture.outline ? " variant: 'outline'," : ''} onClick: ClickedExample(), children: ['${fixture.action}'] }, h),
    ] }, h),
  ],
}, h)${renderer === 'stylex' && fixture.bordered ? '\n])' : ''}`;

export const emptyExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => emptyFixtures.map(fixture => ({
  title: fixture.title, description: fixture.description,
  code: statelessComponentApplication({ componentName: 'Empty', componentSlug: 'empty', renderer, exampleName: fixture.title, componentImports: `${renderer === 'stylex' ? "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ empty: { width: '100%', maxWidth: '36rem' }, bordered: { width: '100%', maxWidth: '36rem', borderColor: 'var(--border)', borderRadius: '0.625rem', borderStyle: 'solid', borderWidth: 1 } })\n" : ''}import * as Button from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/button'`, viewBody: emptyBody(fixture, renderer) }),
}));
