import type { HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { alertDialogFixtures } from '@/docs/components/pages/alert-dialog/shared';
import * as AlertDialog from '@/stylex/alert-dialog';
import * as Button from '@/stylex/button';

const styles = stylex.create({
  frame: { display: 'grid', gap: '0.75rem', justifyItems: 'center' },
  status: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
});

export const alertDialogStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = alertDialogFixtures[exampleIndex] ?? alertDialogFixtures[0];
  const previewModel = model as {
    dialog: AlertDialog.Model;
    status: 'idle' | 'pending' | 'complete';
  };
  return h.div([h.Class(stylex.props(styles.frame).className ?? '')], [
    Button.button({
      variant: exampleIndex === 0 ? 'destructive' : 'outline',
      onClick: onMessageJson(JSON.stringify({ _tag: 'OpenedAlertDialogPreview' })),
      children: [fixture.triggerLabel],
    }, h),
    AlertDialog.alertDialog({
      model: previewModel.dialog,
      toParentMessage: message => onMessageJson(JSON.stringify({
        _tag: 'GotAlertDialogPreviewMessage',
        message,
      })),
      title: fixture.dialogTitle,
      description: fixture.dialogDescription,
      actionLabel: fixture.actionLabel,
      cancelLabel: fixture.cancelLabel,
      pendingLabel: fixture.pendingLabel,
      isPending: previewModel.status === 'pending',
      ...(exampleIndex === 1 ? { size: 'sm' as const } : {}),
    }, h),
    h.p([
      h.Role('status'),
      h.Class(stylex.props(styles.status).className ?? ''),
    ], [
      previewModel.status === 'complete'
        ? fixture.completeLabel
        : previewModel.status === 'pending' ? 'Working…' : 'No action taken.',
    ]),
  ]);
};
