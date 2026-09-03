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
  imports: `import { Effect, Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as AlertDialog from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/alert-dialog'
import * as Button from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/button'`,
  model: `export const Model = S.Struct({ dialog: AlertDialog.Model, status: S.Literals(['idle', 'pending', 'deleted']) })
export type Model = typeof Model.Type`,
  messages: `export const ClickedDelete = m('ClickedDelete')
export const CompletedDelete = m('CompletedDelete')
export const GotAlertDialogMessage = m('GotAlertDialogMessage', { message: AlertDialog.Message })
export const Message = S.Union([ClickedDelete, CompletedDelete, GotAlertDialogMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { dialog: AlertDialog.init({ id: 'delete-project', isAnimated: true }), status: 'idle' },
  [],
]`,
  update: `const DeleteProject = Command.define('DeleteProject', {
  messages: [CompletedDelete],
  execute: Effect.sleep('500 millis').pipe(Effect.as(CompletedDelete())),
})

const applyDialog = (model: Model, result: ReturnType<typeof AlertDialog.update>): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [dialog, commands, out] = result
  const mapped = Command.mapMessages(commands, message => GotAlertDialogMessage({ message }))
  if (Option.isNone(out)) return [{ ...model, dialog }, mapped]
  return out.value._tag === 'ConfirmedAlertDialog'
    ? [{ ...model, dialog, status: 'pending' }, [...mapped, DeleteProject()]]
    : [{ ...model, dialog, status: 'idle' }, mapped]
}

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ClickedDelete': return applyDialog(model, AlertDialog.open(model.dialog))
    case 'CompletedDelete': return applyDialog({ ...model, status: 'deleted' }, AlertDialog.close(model.dialog))
    case 'GotAlertDialogMessage': return applyDialog(model, AlertDialog.update(model.dialog, message.message))
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Alert Dialog — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'destructive', onClick: ClickedDelete(), children: ['${fixture.triggerLabel}'] }, h),
    AlertDialog.alertDialog({
      model: model.dialog,
      toParentMessage: message => GotAlertDialogMessage({ message }),
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
