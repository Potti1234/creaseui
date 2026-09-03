import { Effect, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { alertDialogFixtures } from '@/docs/components/pages/alert-dialog/shared';
import * as AlertDialog from '@/ui/alert-dialog';
import * as Button from '@/ui/button';

const Opened = m('OpenedAlertDialogPreview');
const CompletedAction = m('CompletedAlertDialogAction');
const GotMessage = m('GotAlertDialogPreviewMessage', { message: AlertDialog.Message });
const PreviewMessage = S.Union([Opened, CompletedAction, GotMessage]);
type PreviewMessage = typeof PreviewMessage.Type;
const PreviewModel = S.Struct({
  _docsPage: S.Literal('alert-dialog'),
  dialog: AlertDialog.Model,
  status: S.Literals(['idle', 'pending', 'complete']),
});
type PreviewModel = typeof PreviewModel.Type;

const FinishAction = Command.define('FinishAlertDialogAction', {
  messages: [CompletedAction],
  execute: Effect.sleep('350 millis').pipe(Effect.as(CompletedAction())),
});

const applyDialog = (
  model: PreviewModel,
  result: ReturnType<typeof AlertDialog.update>,
): readonly [PreviewModel, ReadonlyArray<Command.Command<PreviewMessage>>] => {
  const [dialog, commands, out] = result;
  const mapped = Command.mapMessages(commands, message => GotMessage({ message }));
  if (Option.isNone(out)) return [{ ...model, dialog }, mapped];
  return out.value._tag === 'ConfirmedAlertDialog'
    ? [{ ...model, dialog, status: 'pending' }, [...mapped, FinishAction()]]
    : [{ ...model, dialog, status: 'idle' }, mapped];
};

export const alertDialogTailwindPreviewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: index => ({
    _docsPage: 'alert-dialog',
    dialog: AlertDialog.init({ id: `docs-alert-dialog-${String(index)}`, isAnimated: true }),
    status: 'idle',
  }),
  update: (model, message) => message._tag === 'OpenedAlertDialogPreview'
    ? applyDialog(model, AlertDialog.open(model.dialog))
    : message._tag === 'CompletedAlertDialogAction'
      ? applyDialog({ ...model, status: 'complete' }, AlertDialog.close(model.dialog))
      : applyDialog(model, AlertDialog.update(model.dialog, message.message)),
  view: (index, model, h) => {
    const fixture = alertDialogFixtures[index] ?? alertDialogFixtures[0];
    return h.div([h.Class('grid justify-items-center gap-3')], [
      Button.button({
        variant: index === 0 ? 'destructive' : 'outline',
        onClick: Opened(),
        children: [fixture.triggerLabel],
      }, h),
      AlertDialog.alertDialog({
        model: model.dialog,
        toParentMessage: message => GotMessage({ message }),
        title: fixture.dialogTitle,
        description: fixture.dialogDescription,
        actionLabel: fixture.actionLabel,
        cancelLabel: fixture.cancelLabel,
        pendingLabel: fixture.pendingLabel,
        isPending: model.status === 'pending',
        ...(index === 1 ? { size: 'sm' as const } : {}),
      }, h),
      h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], [
        model.status === 'complete'
          ? fixture.completeLabel
          : model.status === 'pending' ? 'Working…' : 'No action taken.',
      ]),
    ]);
  },
});
