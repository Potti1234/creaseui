import { Effect, Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { m } from 'foldkit/message'

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page'
import * as AlertDialog from '@/ui/alert-dialog'
import * as Button from '@/ui/button'

const Opened = m('OpenedAlertDialogPreview')
const CompletedAction = m('CompletedAlertDialogAction')
const GotMessage = m('GotAlertDialogPreviewMessage', { message: AlertDialog.Message })
const PreviewMessage = S.Union([Opened, CompletedAction, GotMessage])
type PreviewMessage = typeof PreviewMessage.Type
const PreviewModel = S.Struct({ _docsPage: S.Literal('alert-dialog'), dialog: AlertDialog.Model, status: S.Literals(['idle', 'pending', 'complete']) })
type PreviewModel = typeof PreviewModel.Type

const FinishAction = Command.define('FinishAlertDialogAction', {
  messages: [CompletedAction],
  execute: Effect.sleep('350 millis').pipe(Effect.as(CompletedAction())),
})

const applyDialog = (model: PreviewModel, result: ReturnType<typeof AlertDialog.update>): readonly [PreviewModel, ReadonlyArray<Command.Command<PreviewMessage>>] => {
  const [dialog, commands, out] = result
  const mapped = Command.mapMessages(commands, message => GotMessage({ message }))
  if (Option.isNone(out)) return [{ ...model, dialog }, mapped]
  return out.value._tag === 'ConfirmedAlertDialog'
    ? [{ ...model, dialog, status: 'pending' }, [...mapped, FinishAction()]]
    : [{ ...model, dialog, status: 'idle' }, mapped]
}

const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: index => ({ _docsPage: 'alert-dialog', dialog: AlertDialog.init({ id: `docs-alert-dialog-${String(index)}`, isAnimated: true }), status: 'idle' }),
  update: (model, message) => message._tag === 'OpenedAlertDialogPreview'
    ? applyDialog(model, AlertDialog.open(model.dialog))
    : message._tag === 'CompletedAlertDialogAction'
      ? applyDialog({ ...model, status: 'complete' }, AlertDialog.close(model.dialog))
      : applyDialog(model, AlertDialog.update(model.dialog, message.message)),
  view: (index, model, h) => h.div([h.Class('grid justify-items-center gap-3')], [
    Button.button({ variant: index === 0 ? 'destructive' : 'outline', onClick: Opened(), children: [index === 0 ? 'Delete project' : 'Leave workspace'] }, h),
    AlertDialog.alertDialog({ model: model.dialog, toParentMessage: message => GotMessage({ message }), title: index === 0 ? 'Delete this project?' : 'Leave workspace?', description: index === 0 ? 'This action permanently removes releases, environments, and team access.' : 'You will lose access to every project in this workspace.', actionLabel: index === 0 ? 'Delete project' : 'Leave workspace', cancelLabel: index === 0 ? 'Cancel' : 'Stay', pendingLabel: index === 0 ? 'Deleting…' : 'Leaving…', isPending: model.status === 'pending', ...(index === 1 ? { size: 'sm' as const } : {}) }, h),
    h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], [model.status === 'complete' ? (index === 0 ? 'Project deleted.' : 'Workspace left.') : model.status === 'pending' ? 'Working…' : 'No action taken.']),
  ]),
})

const source = (name: string, size: 'default' | 'sm'): string => foldkitApplication({
  title: `Alert Dialog — ${name}`,
  imports: `import { Effect, Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as AlertDialog from '@/ui/alert-dialog'
import * as Button from '@/ui/button'`,
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
  title: 'Alert Dialog — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'destructive', onClick: ClickedDelete(), children: ['Delete project'] }, h),
    AlertDialog.alertDialog({
      model: model.dialog,
      toParentMessage: message => GotAlertDialogMessage({ message }),
      title: 'Delete this project?',
      description: 'This action permanently removes releases, environments, and team access.',
      actionLabel: 'Delete project',
      cancelLabel: 'Cancel',
      pendingLabel: 'Deleting…',
      isPending: model.status === 'pending',
      size: '${size}',
    }, h),
    h.p([h.Role('status')], [model.status === 'deleted' ? 'Project deleted.' : 'No action taken.']),
  ]),
})`,
})

export const alertDialogPage = authoredPage({
  slug: 'alert-dialog', title: 'Alert Dialog', kind: 'submodel', previewProgram,
  definition: {
    kind: 'submodel', description: 'Interrupts with a consequential choice and emits explicit confirm or cancel facts.',
    architecture: 'Alert Dialog reuses the canonical Dialog Model, view, focus trap, animation, and Commands. Its wrapper adds only RequestedConfirm/RequestedCancel messages and Confirmed/Cancelled OutMessages. Confirmation does not auto-close: the parent owns async consequences and closes after success.',
    apiHref: 'https://foldkit.dev/ui/dialog',
    composition: 'Dialog behavior Submodel\n└── alertdialog panel\n    ├── required title + description\n    └── safe Cancel focus + explicit Confirm decision',
    styling: 'Reserve this pattern for consequential choices. Use a specific action label and keep pending feedback in the same stable action control.',
    accessibility: 'The panel has alertdialog semantics, required accessible name and description, no backdrop dismissal, a focus trap, and focus restoration. The safe Cancel action receives initial focus; Escape emits Cancelled.',
    keyboard: [['Tab / Shift+Tab', 'Cycles between the decision actions.'], ['Enter / Space', 'Activates the focused explicit decision.'], ['Escape', 'Emits Cancelled, closes, and restores trigger focus.']],
    examples: [
      { title: 'Async deletion', description: 'Confirmed starts parent-owned work, disables decisions while pending, and closes only after completion.', code: source('Async deletion', 'default') },
      { title: 'Compact decision', description: 'Cancel remains the initial safe focus and Escape follows the same explicit cancellation path.', code: source('Compact decision', 'sm') },
    ],
  },
})
