import { Effect, Option, Schema as S } from 'effect';
import type { Update } from 'foldkit';
import { Command } from 'foldkit';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { alertDialogFixtures } from '@/docs/components/pages/alert-dialog/shared';
import * as AlertDialog from '@/ui/alert-dialog';
import * as Button from '@/ui/button';




const PreviewMessage = defineMessageUnion({
  'OpenedAlertDialogPreview': {},
  'CompletedAlertDialogAction': {},
  'GotAlertDialogPreviewMessage': { message: AlertDialog.Message },
});
type PreviewMessage = typeof PreviewMessage.Type;
const PreviewModel = S.Struct({
  _docsPage: S.Literal('alert-dialog'),
  dialog: AlertDialog.Model,
  status: S.Literals(['idle', 'pending', 'complete']),
});
type PreviewModel = typeof PreviewModel.Type;

const FinishAction = Command.define('FinishAlertDialogAction', {
  messages: [PreviewMessage['CompletedAlertDialogAction']],
  execute: Effect.sleep('350 millis').pipe(Effect.as(PreviewMessage['CompletedAlertDialogAction']())),
});

const applyDialog = (
  model: PreviewModel,
  result: ReturnType<typeof AlertDialog.update>,
): Update.Return<PreviewModel, PreviewMessage> => {
  const { model: dialog, commands: dialogCommands__, outMessage: dialogOut__ } = result
  const commands = dialogCommands__ ?? []
  const out = Option.fromNullishOr(dialogOut__)
  const mapped = Command.mapMessages(commands, message => PreviewMessage['GotAlertDialogPreviewMessage']({ message }));
  if (Option.isNone(out)) return { model: { ...model, dialog }, commands: mapped };
  return out.value._tag === 'ConfirmedAlertDialog'
    ? { model: { ...model, dialog, status: 'pending' }, commands: [...mapped, FinishAction()] }
    : {
        model: {
          ...model,
          dialog,
          status: model.status === 'pending' ? 'idle' : model.status,
        },
        commands: mapped,
      };
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
        onClick: PreviewMessage['OpenedAlertDialogPreview'](),
        children: [fixture.triggerLabel],
      }, h),
      AlertDialog.alertDialog({
        model: model.dialog,
        toParentMessage: message => PreviewMessage['GotAlertDialogPreviewMessage']({ message }),
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
