import { Schema as S } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { attachmentDescription, attachmentFixtures, attachmentStates } from '@/docs/components/pages/attachment/shared';
import * as Attachment from '@/ui/attachment';
import * as Button from '@/ui/button';

const RemovedFile = m('RemovedAttachmentFile');
const RestoredFile = m('RestoredAttachmentFile');
const PreviewMessage = S.Union([RemovedFile, RestoredFile]);
type PreviewMessage = typeof PreviewMessage.Type;
const PreviewModel = S.Struct({
  _docsPage: S.Literal('attachment'),
  removed: S.Boolean,
});
type PreviewModel = typeof PreviewModel.Type;

const attachment = <Msg>(state: Attachment.AttachmentState, actions: ReadonlyArray<Html>, h: HtmlBuilder<Msg>) => Attachment.attachment({
  state,
  children: [
    Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }, h),
    Attachment.attachmentContent({ children: [Attachment.attachmentTitle({ children: ['project-brief.pdf'] }, h), Attachment.attachmentDescription({ children: [attachmentDescription(state)] }, h)] }, h),
    ...actions,
  ],
}, h);

export const attachmentTailwindPreviewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: () => ({ _docsPage: 'attachment', removed: false }),
  update: (model, message) => [{ ...model, removed: message._tag === 'RemovedAttachmentFile' }, []],
  view: (index, model, h) => {
    const fixture = attachmentFixtures[index] ?? attachmentFixtures[0];
    if (fixture.lifecycle) return h.div([h.Class('grid gap-3')], attachmentStates.map(state => attachment(state, [], h)));
    return h.div([h.Class('grid justify-items-center gap-3')], model.removed
      ? [
          h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], ['Removed project-brief.pdf.']),
          Button.button({ variant: 'outline', size: 'sm', onClick: RestoredFile(), children: ['Restore'] }, h),
        ]
      : [
          attachment('done', [
            Attachment.attachmentActions({
              children: [Button.button({ variant: 'ghost', size: 'sm', onClick: RemovedFile(), children: ['Remove'] }, h)],
            }, h),
          ], h),
        ]);
  },
});
