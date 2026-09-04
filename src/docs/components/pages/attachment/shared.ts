import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export const attachmentStates = ['uploading', 'processing', 'error', 'done'] as const;
export const attachmentDescription = (state: string): string => state === 'error' ? 'Upload failed' : state === 'done' ? '2.4 MB · Uploaded' : `${state[0]?.toUpperCase()}${state.slice(1)}…`;
export const attachmentFixtures = [
  { title: 'Uploaded file', description: 'Compose a completed file record; a real Remove action should emit a parent Message that mutates the file collection.', lifecycle: false },
  { title: 'Lifecycle states', description: 'Render upload lifecycle as domain data. Attachment itself does not start, poll, or retry an upload.', lifecycle: true },
] as const;

const basicBody = `Attachment.attachment({
  state: 'done',
  children: [
    Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }, h),
    Attachment.attachmentContent({ children: [
      Attachment.attachmentTitle({ children: ['project-brief.pdf'] }, h),
      Attachment.attachmentDescription({ children: ['2.4 MB · Uploaded'] }, h),
    ] }, h),
    Attachment.attachmentActions({ children: [
      Button.button({ variant: 'ghost', size: 'sm', children: ['Remove'] }, h),
    ] }, h),
  ],
}, h)`;

const statesBody = (renderer: 'tailwind' | 'stylex'): string => `${renderer === 'stylex' ? "h.div([h.Class(stylex.props(styles.list).className ?? '')]," : "h.div([h.Class('grid gap-3')],"}
  (['uploading', 'processing', 'error', 'done'] as const).map(state =>
    Attachment.attachment({
      state,
      children: [
        Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }, h),
        Attachment.attachmentContent({ children: [
          Attachment.attachmentTitle({ children: ['project-brief.pdf'] }, h),
          Attachment.attachmentDescription({ children: [state === 'error' ? 'Upload failed' : state] }, h),
        ] }, h),
      ],
    }, h),
  ),
)`;

const application = (fixture: (typeof attachmentFixtures)[number], renderer: 'tailwind' | 'stylex'): string => staticComponentApplication({
  componentName: 'Attachment', componentSlug: 'attachment', renderer, exampleName: fixture.title,
  componentImports: `${renderer === 'stylex' && fixture.lifecycle ? "import * as stylex from '@stylexjs/stylex'\nconst styles = stylex.create({ list: { display: 'grid', gap: '0.75rem' } })\n" : ''}import * as Button from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/button'`,
  viewBody: fixture.lifecycle ? statesBody(renderer) : basicBody,
});

export const attachmentExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => attachmentFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: application(fixture, renderer) }));
