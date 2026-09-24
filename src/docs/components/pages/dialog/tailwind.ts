import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { dialogFixtures } from '@/docs/components/pages/dialog/shared';
import * as Button from '@/ui/button';
import * as Dialog from '@/ui/dialog';



const DialogPreviewMessage = defineMessageUnion({
  OpenedDialogPreview: {},
  GotDialogPreviewMessage: { message: Dialog.Message },
});
type DialogPreviewMessage = typeof DialogPreviewMessage.Type;
const DialogPreviewModel = S.Struct({ _docsPage: S.Literal('dialog'), dialog: Dialog.Model });
type DialogPreviewModel = typeof DialogPreviewModel.Type;

export const dialogTailwindPreviewProgram = definePreviewProgram<DialogPreviewModel, DialogPreviewMessage>({
  Model: DialogPreviewModel,
  Message: DialogPreviewMessage,
  init: index => ({
    _docsPage: 'dialog',
    dialog: Dialog.init({ id: `docs-dialog-${String(index)}`, isAnimated: true }),
  }),
  update: (model, message) => {
    const dialogOp__ = message._tag === 'OpenedDialogPreview'
      ? Dialog.open(model.dialog)
      : Dialog.update(model.dialog, message.message);
    const dialog = dialogOp__.model;
    const commands = dialogOp__.commands ?? []
    return { model: { ...model, dialog }, commands: Command.mapMessages(commands, next => DialogPreviewMessage.GotDialogPreviewMessage({ message: next })) };
  },
  view: (index, model, h) => {
    const fixture = dialogFixtures[index] ?? dialogFixtures[0];
    return h.div([], [
      Button.button({
        ...(index === 1 ? { variant: 'outline' as const } : {}),
        onClick: DialogPreviewMessage.OpenedDialogPreview(),
        children: [index === 0 ? 'Open profile' : 'Review change'],
      }, h),
      Dialog.dialog({
        model: model.dialog,
        toParentMessage: message => DialogPreviewMessage.GotDialogPreviewMessage({ message }),
        title: fixture.dialogTitle,
        description: fixture.dialogDescription,
        ...(index === 1 ? { class: 'sm:max-w-sm' } : {}),
        ...(index === 0 ? { content: () => [h.p([h.Class('text-sm')], ['Profile fields belong here.'])] } : {}),
        footer: slots => [
          h.button([
            ...slots.closeButton,
            ...slots.initialFocusAttributes(),
            h.Type('button'),
            h.Class('rounded-md border px-4 py-2 text-sm'),
          ], [index === 0 ? 'Cancel' : 'Back']),
          h.button([
            ...slots.closeButton,
            h.Type('button'),
            h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'),
          ], [index === 0 ? 'Save' : 'Confirm']),
        ],
      }, h),
    ]);
  },
});
