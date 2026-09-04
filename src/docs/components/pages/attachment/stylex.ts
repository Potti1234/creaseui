import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { attachmentDescription, attachmentFixtures, attachmentStates } from '@/docs/components/pages/attachment/shared';
import * as Attachment from '@/stylex/attachment';
import * as Button from '@/stylex/button';

const styles = stylex.create({ list: { display: 'grid', gap: '0.75rem' } });
const attachment = <Msg>(state: Attachment.AttachmentState, withAction: boolean, h: HtmlBuilder<Msg>) => Attachment.attachment({
  state,
  children: [
    Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }, h),
    Attachment.attachmentContent({ children: [Attachment.attachmentTitle({ children: ['project-brief.pdf'] }, h), Attachment.attachmentDescription({ children: [attachmentDescription(state)] }, h)] }, h),
    ...(withAction ? [Attachment.attachmentActions({ children: [Button.button({ variant: 'ghost', size: 'sm', children: ['Remove'] }, h)] }, h)] : []),
  ],
}, h);

export const attachmentStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, _model: unknown, _onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = attachmentFixtures[index] ?? attachmentFixtures[0];
  return fixture.lifecycle ? h.div([h.Class(stylex.props(styles.list).className ?? '')], attachmentStates.map(state => attachment(state, false, h))) : attachment('done', true, h);
};
