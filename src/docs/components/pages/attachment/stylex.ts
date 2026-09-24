import type { Html, HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { attachmentDescription, attachmentFixtures, attachmentStates } from '@/docs/components/pages/attachment/shared';
import * as Attachment from '@/stylex/attachment';
import * as Button from '@/stylex/button';

const styles = stylex.create({
  frame: { gap: '0.75rem', display: 'grid', justifyItems: 'center' },
  list: { gap: '0.75rem', display: 'grid' },
  status: { color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: '1.25rem' },
});
const attachment = <Msg>(state: Attachment.AttachmentState, actions: ReadonlyArray<Html>, h: HtmlBuilder<Msg>) => Attachment.attachment({
  state,
  children: [
    Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }, h),
    Attachment.attachmentContent({ children: [Attachment.attachmentTitle({ children: ['project-brief.pdf'] }, h), Attachment.attachmentDescription({ children: [attachmentDescription(state)] }, h)] }, h),
    ...actions,
  ],
}, h);

export const attachmentStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = attachmentFixtures[index] ?? attachmentFixtures[0];
  const previewModel = model as { removed: boolean };
  if (fixture.lifecycle) return h.div([h.Class(stylex.props(styles.list).className ?? '')], attachmentStates.map(state => attachment(state, [], h)));
  return h.div([h.Class(stylex.props(styles.frame).className ?? '')], previewModel.removed
    ? [
        h.p([h.Role('status'), h.Class(stylex.props(styles.status).className ?? '')], ['Removed project-brief.pdf.']),
        Button.button({
          variant: 'outline', size: 'sm',
          onClick: onMessageJson(JSON.stringify({ _tag: 'RestoredAttachmentFile' })),
          children: ['Restore'],
        }, h),
      ]
    : [
        attachment('done', [
          Attachment.attachmentActions({
            children: [Button.button({
              variant: 'ghost', size: 'sm',
              onClick: onMessageJson(JSON.stringify({ _tag: 'RemovedAttachmentFile' })),
              children: ['Remove'],
            }, h)],
          }, h),
        ], h),
      ]);
};
