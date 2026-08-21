import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as AlertDialog from '@/ui/alert-dialog';
import * as Button from '@/ui/button';

const OpenedAlertDialogPreview = m('OpenedAlertDialogPreview');
const ConfirmedAlertDialogPreview = m('ConfirmedAlertDialogPreview');
const GotAlertDialogPreviewMessage = m('GotAlertDialogPreviewMessage', { message: AlertDialog.Message });
const AlertDialogPreviewMessage = S.Union([OpenedAlertDialogPreview, ConfirmedAlertDialogPreview, GotAlertDialogPreviewMessage]);
type AlertDialogPreviewMessage = typeof AlertDialogPreviewMessage.Type;
const AlertDialogPreviewModel = S.Struct({ _docsPage: S.Literal('alert-dialog'), alertDialog: AlertDialog.Model, isConfirmed: S.Boolean });
type AlertDialogPreviewModel = typeof AlertDialogPreviewModel.Type;
const previewProgram = definePreviewProgram<AlertDialogPreviewModel, AlertDialogPreviewMessage>({
  Model: AlertDialogPreviewModel,
  Message: AlertDialogPreviewMessage,
  init: index => ({ _docsPage: 'alert-dialog', alertDialog: AlertDialog.init({ id: `docs-alert-dialog-${String(index)}`, isAnimated: true }), isConfirmed: false }),
  update: (model, message) => {
    const base = message._tag === 'ConfirmedAlertDialogPreview' ? { ...model, isConfirmed: true } : model;
    const [alertDialog, commands] = message._tag === 'OpenedAlertDialogPreview'
      ? AlertDialog.open(model.alertDialog)
      : message._tag === 'ConfirmedAlertDialogPreview'
        ? AlertDialog.close(model.alertDialog)
        : AlertDialog.update(model.alertDialog, message.message);
    return [{ ...base, alertDialog }, Command.mapMessages(commands, next => GotAlertDialogPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => h.div([h.Class('grid justify-items-center gap-3')], [Button.button({ variant: index === 0 ? 'destructive' : 'outline', onClick: OpenedAlertDialogPreview(), children: [index === 0 ? 'Delete project' : 'Leave workspace'] }, h), AlertDialog.alertDialog({ model: model.alertDialog, toParentMessage: message => GotAlertDialogPreviewMessage({ message }), title: index === 0 ? 'Delete this project?' : 'Leave workspace?', description: index === 0 ? 'This action cannot be undone.' : 'You will lose access to team projects.', actionLabel: index === 0 ? 'Delete' : 'Leave', onAction: ConfirmedAlertDialogPreview(), cancelLabel: index === 0 ? 'Cancel' : 'Stay', ...(index === 1 ? { size: 'sm' as const } : {}) }, h), ...(index === 0 ? [h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], [model.isConfirmed ? 'Project deleted.' : 'Project is active.'])] : [])]),
});

const source = (name: string, size: 'default' | 'sm'): string => foldkitApplication({
  title: `Alert Dialog — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as AlertDialog from '@/ui/alert-dialog'
import * as Button from '@/ui/button'`,
  model: `export const Model = S.Struct({
  alertDialog: AlertDialog.Model,
  isDeleted: S.Boolean,
})
export type Model = typeof Model.Type`,
  messages: `export const ClickedDelete = m('ClickedDelete${name.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const ConfirmedDelete = m('ConfirmedDelete${name.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const GotAlertDialogMessage = m('GotAlertDialogMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: AlertDialog.Message })
export const Message = S.Union([ClickedDelete, ConfirmedDelete, GotAlertDialogMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { alertDialog: AlertDialog.init({ id: 'delete-project', isAnimated: true }), isDeleted: false },
  [],
]`,
  update: `const mapDialog = (
  model: Model,
  result: ReturnType<typeof AlertDialog.update>,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [alertDialog, commands] = result
  return [{ ...model, alertDialog }, Command.mapMessages(
    commands,
    next => GotAlertDialogMessage({ message: next }),
  )]
}

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ClickedDelete${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapDialog(model, AlertDialog.open(model.alertDialog))
    case 'ConfirmedDelete${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapDialog({ ...model, isDeleted: true }, AlertDialog.close(model.alertDialog))
    case 'GotAlertDialogMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapDialog(model, AlertDialog.update(model.alertDialog, message.message))
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Alert Dialog — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'destructive', onClick: ClickedDelete(), children: ['Delete project'] }, h),
    AlertDialog.alertDialog({
      model: model.alertDialog,
      toParentMessage: message => GotAlertDialogMessage({ message }),
      title: 'Delete this project?',
      description: 'This action cannot be undone.',
      actionLabel: 'Delete',
      onAction: ConfirmedDelete(),
      cancelLabel: 'Cancel',
      size: '${size}',
    }, h),
    ...(model.isDeleted ? [h.p([h.Role('status')], ['Project deleted.'])] : []),
  ]),
})`,
});

export const alertDialogPage = authoredPage({
  slug: 'alert-dialog', title: 'Alert Dialog', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Interrupts with a consequential decision that requires an explicit confirm or cancel action.',
    architecture: 'Alert Dialog uses the Dialog child Model and Commands. The primary action emits a domain Message; that parent branch performs the action and calls AlertDialog.close so confirmation is observable and focus restoration remains intact.',
    apiHref: 'https://foldkit.dev/ui/dialog',
    styling: 'Reserve this pattern for destructive or irreversible decisions. State the consequence in the title and make the action label specific.',
    accessibility: 'The panel exposes alertdialog semantics and cannot be dismissed by backdrop click. Focus is trapped and restored; explicit actions remain keyboard reachable.',
    keyboard: [['Tab / Shift+Tab', 'Moves between cancel and confirm actions.'], ['Escape', 'Cancels and restores focus without confirming.']],
    examples: [
      {
        title: 'Delete project', description: 'Confirmation is a distinct domain Message, not merely a close side effect.',
        preview: (model, h) => h.div([h.Class('grid justify-items-center gap-3')], [Button.button({ variant: 'destructive', onClick: State.OpenedOverlay({ target: 'alertDialog' }), children: ['Delete project'] }, h), AlertDialog.alertDialog({ model: model.alertDialog, toParentMessage: (message) => State.GotAlertDialogMessage({ message }), title: 'Delete this project?', description: 'This action cannot be undone.', actionLabel: 'Delete', onAction: State.ConfirmedAlertDialog(), cancelLabel: 'Cancel' }, h), h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], [model.alertDialogConfirmed ? 'Project deleted.' : 'Project is active.'])]),
        code: source('Delete project', 'default'),
      },
      {
        title: 'Compact decision', description: 'The small layout suits a short binary decision and still owns an independent child Model.',
        preview: (model, h) => h.div([], [Button.button({ variant: 'outline', onClick: State.OpenedAlertDialogCompact(), children: ['Leave workspace'] }, h), AlertDialog.alertDialog({ model: model.alertDialogCompact, toParentMessage: (message) => State.GotAlertDialogCompactMessage({ message }), title: 'Leave workspace?', description: 'You will lose access to team projects.', actionLabel: 'Leave', onAction: State.ConfirmedAlertDialogCompact(), cancelLabel: 'Stay', size: 'sm' }, h)]),
        code: source('Compact decision', 'sm'),
      },
    ],
  },
});
