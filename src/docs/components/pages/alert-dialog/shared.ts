import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const alertDialogFixtures = [
  {
    title: 'Async deletion',
    description: 'Confirmed starts parent-owned work, disables decisions while pending, and closes only after completion.',
    triggerLabel: 'Delete project',
    dialogTitle: 'Delete this project?',
    dialogDescription: 'This action permanently removes releases, environments, and team access.',
    actionLabel: 'Delete project',
    cancelLabel: 'Cancel',
    pendingLabel: 'Deleting…',
    completeLabel: 'Project deleted.',
    size: 'default',
  },
  {
    title: 'Compact decision',
    description: 'Cancel remains the initial safe focus and Escape follows the same explicit cancellation path.',
    triggerLabel: 'Leave workspace',
    dialogTitle: 'Leave workspace?',
    dialogDescription: 'You will lose access to every project in this workspace.',
    actionLabel: 'Leave workspace',
    cancelLabel: 'Stay',
    pendingLabel: 'Leaving…',
    completeLabel: 'Workspace left.',
    size: 'sm',
  },
] as const;

const source = (
  fixture: (typeof alertDialogFixtures)[number],
  renderer: 'tailwind' | 'stylex',
): string => foldkitApplication({
  title: `Alert Dialog — ${fixture.title}`,
  imports: `import { Effect, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as AlertDialog from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/alert-dialog'
import * as Button from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/button'`,
  model: `export const Model = S.Struct({ dialog: AlertDialog.Model, status: S.Literals(['idle', 'pending', 'deleted']) })
export type Model = typeof Model.Type`,
  messages: `import { defineMessageUnion } from 'foldkit/message'



export const Message = defineMessageUnion({
  ClickedDelete: {},
  CompletedDelete: {},
  GotAlertDialogMessage: { message: AlertDialog.Message },
});
export type Message = typeof Message.Type`,
  init: `export const init = (): Update.Return<Model, Message> => ({ model: { dialog: AlertDialog.init({ id: 'delete-project', isAnimated: true }), status: 'idle' } })`,
  update: `const DeleteProject = Command.define('DeleteProject', {
  messages: [Message.CompletedDelete],
  execute: Effect.sleep('500 millis').pipe(Effect.as(Message.CompletedDelete())),
})

const applyDialog = (model: Model, result: ReturnType<typeof AlertDialog.update>): Update.Return<Model, Message> => {
  const dialog = result.model
  const mapped = Command.mapMessages(result.commands, message => Message.GotAlertDialogMessage({ message }))
  const out = result.outMessage
  if (out === undefined) return { model: { ...model, dialog }, commands: mapped }
  return out._tag === 'ConfirmedAlertDialog'
    ? { model: { ...model, dialog, status: 'pending' }, commands: [...mapped, DeleteProject()] }
    : { model: { ...model, dialog, status: 'idle' }, commands: mapped }
}

export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ClickedDelete': return applyDialog(model, AlertDialog.open(model.dialog))
    case 'CompletedDelete': return applyDialog({ ...model, status: 'deleted' }, AlertDialog.close(model.dialog))
    case 'GotAlertDialogMessage': return applyDialog(model, AlertDialog.update(model.dialog, message.message))
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Alert Dialog — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'destructive', onClick: Message.ClickedDelete(), children: ['${fixture.triggerLabel}'] }, h),
    AlertDialog.alertDialog({
      model: model.dialog,
      toParentMessage: message => Message.GotAlertDialogMessage({ message }),
      title: '${fixture.dialogTitle}',
      description: '${fixture.dialogDescription}',
      actionLabel: '${fixture.actionLabel}',
      cancelLabel: '${fixture.cancelLabel}',
      pendingLabel: '${fixture.pendingLabel}',
      isPending: model.status === 'pending',
      size: '${fixture.size}',
    }, h),
    h.p([h.Role('status')], [
      model.status === 'deleted' ? '${fixture.completeLabel}' : 'No action taken.',
    ]),
  ]),
})`,
});

export const alertDialogExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => alertDialogFixtures.map(fixture => ({
  title: fixture.title,
  description: fixture.description,
  code: source(fixture, renderer),
}));
