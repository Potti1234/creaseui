import type { Html, HtmlBuilder } from 'foldkit/html';

import { attachmentDescription, attachmentFixtures, attachmentStates } from '@/docs/components/pages/attachment/shared';
import * as Attachment from '@/ui/attachment';
import * as Button from '@/ui/button';

const attachment = <Msg>(state: Attachment.AttachmentState, withAction: boolean, h: HtmlBuilder<Msg>) => Attachment.attachment({
  state,
  children: [
    Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }, h),
    Attachment.attachmentContent({ children: [Attachment.attachmentTitle({ children: ['project-brief.pdf'] }, h), Attachment.attachmentDescription({ children: [attachmentDescription(state)] }, h)] }, h),
    ...(withAction ? [Attachment.attachmentActions({ children: [Button.button({ variant: 'ghost', size: 'sm', children: ['Remove'] }, h)] }, h)] : []),
  ],
}, h);

export type AttachmentStaticPreview = <Msg>(model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) => Html;
export const attachmentTailwindPreviews: ReadonlyArray<AttachmentStaticPreview> = attachmentFixtures.map((fixture) => <Msg>(_model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) => {
  return fixture.lifecycle ? h.div([h.Class('grid gap-3')], attachmentStates.map(state => attachment(state, false, h))) : attachment('done', true, h);
});
