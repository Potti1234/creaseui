import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as Attachment from '@/ui/attachment';
import * as Button from '@/ui/button';

const attachment = <Msg>(state: Attachment.AttachmentState, h: HtmlBuilder<Msg>) => Attachment.attachment({ state, children: [Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }, h), Attachment.attachmentContent({ children: [Attachment.attachmentTitle({ children: ['project-brief.pdf'] }, h), Attachment.attachmentDescription({ children: [state === 'error' ? 'Upload failed' : state === 'done' ? '2.4 MB · Uploaded' : `${state[0]?.toUpperCase()}${state.slice(1)}…`] }, h)] }, h), Attachment.attachmentActions({ children: [Button.button({ variant: 'ghost', size: 'sm', children: ['Remove'] }, h)] }, h)] }, h);

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

const statesBody = `h.div([h.Class('grid gap-3')],
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

const application = (name: string, viewBody: string) => staticComponentApplication({ componentName: 'Attachment', componentSlug: 'attachment', componentImports: `import * as Button from '@/ui/button'`, exampleName: name, viewBody });

export const attachmentPage = authoredPage({
  slug: 'attachment', title: 'Attachment', kind: 'helper',
  previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Displays a parent-owned file record with media, metadata, lifecycle state, and actions.',
    architecture: 'Attachment is stateless Html composition. File input events, upload Effects, progress, retry, and removal belong to the parent Model/Message/update; pass the resulting domain state into the view helpers.',
    apiHref: 'https://foldkit.dev/guide/effects',
    composition: 'Parent file/upload Model\n└── Attachment (derived state)\n    ├── media / preview\n    ├── content\n    │   ├── title\n    │   └── description / progress copy\n    └── actions → parent Messages',
    styling: 'Use idle, uploading, processing, error, and done to reflect real domain state. Horizontal cards suit lists; vertical cards suit image grids; AttachmentGroup provides an overflow-safe strip.',
    accessibility: 'Titles and descriptions remain readable text. Give icon-only actions an accessible label, preserve visible error copy, and do not communicate upload status through color alone.',
    keyboard: [['Tab', 'Moves to attachment actions supplied by the parent.'], ['Enter / Space', 'Activates the focused parent action.']],
    examples: [
      { title: 'Uploaded file', description: 'Compose a completed file record; a real Remove action should emit a parent Message that mutates the file collection.', staticPreview: (_model, h) => attachment('done', h), code: application('Uploaded file', basicBody) },
      { title: 'Lifecycle states', description: 'Render upload lifecycle as domain data. Attachment itself does not start, poll, or retry an upload.', staticPreview: (_model, h) => h.div([h.Class('grid gap-3')], (['uploading', 'processing', 'error', 'done'] as const).map((state) => attachment(state, h))), code: application('Lifecycle states', statesBody) },
    ],
  },
});
