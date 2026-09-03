import type { HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { dialogFixtures } from '@/docs/components/pages/dialog/shared';
import * as Button from '@/stylex/button';
import * as Dialog from '@/stylex/dialog';

const styles = stylex.create({
  copy: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  action: {
    borderColor: 'var(--border)',
    borderRadius: '0.375rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    fontSize: '0.875rem',
  },
  primaryAction: {
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
  },
  compact: { maxWidth: '24rem' },
});

export const dialogStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = dialogFixtures[exampleIndex] ?? dialogFixtures[0];
  const dialogModel = (model as { dialog: Dialog.Model }).dialog;
  const parentMessage = (message: Dialog.Message): Msg => onMessageJson(JSON.stringify({
    _tag: 'GotDialogPreviewMessage',
    message,
  }));
  return h.div([], [
    Button.button({
      ...(exampleIndex === 1 ? { variant: 'outline' as const } : {}),
      onClick: onMessageJson(JSON.stringify({ _tag: 'OpenedDialogPreview' })),
      children: [exampleIndex === 0 ? 'Open profile' : 'Review change'],
    }, h),
    Dialog.dialog({
      model: dialogModel,
      toParentMessage: parentMessage,
      title: fixture.dialogTitle,
      description: fixture.dialogDescription,
      ...(exampleIndex === 1 ? { layoutStyle: styles.compact } : {}),
      ...(exampleIndex === 0
        ? { content: () => [h.p([h.Class(stylex.props(styles.copy).className ?? '')], ['Profile fields belong here.'])] }
        : {}),
      footer: slots => [
        h.button([
          ...slots.closeButton,
          ...(exampleIndex === 0 ? slots.initialFocusAttributes() : []),
          h.Type('button'),
          h.Class(stylex.props(styles.action).className ?? ''),
        ], [exampleIndex === 0 ? 'Cancel' : 'Back']),
        h.button([
          ...slots.closeButton,
          h.Type('button'),
          h.Class(stylex.props(styles.action, styles.primaryAction).className ?? ''),
        ], [exampleIndex === 0 ? 'Save' : 'Confirm']),
      ],
    }, h),
  ]);
};
