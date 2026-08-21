import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Button from '@/ui/button';
import * as Dialog from '@/ui/dialog';

const OpenedDialogPreview = m('OpenedDialogPreview');
const GotDialogPreviewMessage = m('GotDialogPreviewMessage', { message: Dialog.Message });
const DialogPreviewMessage = S.Union([OpenedDialogPreview, GotDialogPreviewMessage]);
type DialogPreviewMessage = typeof DialogPreviewMessage.Type;
const DialogPreviewModel = S.Struct({ _docsPage: S.Literal('dialog'), dialog: Dialog.Model });
type DialogPreviewModel = typeof DialogPreviewModel.Type;

const previewProgram = definePreviewProgram<DialogPreviewModel, DialogPreviewMessage>({
  Model: DialogPreviewModel,
  Message: DialogPreviewMessage,
  init: index => ({ _docsPage: 'dialog', dialog: Dialog.init({ id: `docs-dialog-${String(index)}`, isAnimated: true }) }),
  update: (model, message) => {
    const [dialog, commands] = message._tag === 'OpenedDialogPreview'
      ? Dialog.open(model.dialog)
      : Dialog.update(model.dialog, message.message);
    return [{ ...model, dialog }, Command.mapMessages(commands, next => GotDialogPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => h.div([], [
    Button.button({ ...(index === 1 ? { variant: 'outline' as const } : {}), onClick: OpenedDialogPreview(), children: [index === 0 ? 'Open profile' : 'Review change'] }, h),
    Dialog.dialog({
      model: model.dialog,
      toParentMessage: message => GotDialogPreviewMessage({ message }),
      title: index === 0 ? 'Edit profile' : 'Review change',
      description: index === 0 ? 'Make changes to your public details.' : 'Confirm the updated workspace name.',
      ...(index === 1 ? { class: 'sm:max-w-sm' } : {}),
      ...(index === 0 ? { content: () => [h.p([h.Class('text-sm')], ['Profile fields belong here.'])] } : {}),
      footer: slots => [
        h.button([...slots.closeButton, ...(index === 0 ? slots.initialFocusAttributes() : []), h.Type('button'), h.Class('rounded-md border px-4 py-2 text-sm')], [index === 0 ? 'Cancel' : 'Back']),
        h.button([...slots.closeButton, h.Type('button'), h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground')], [index === 0 ? 'Save' : 'Confirm']),
      ],
    }, h),
  ]),
});

const source = (name: string, title: string, description: string, compact: boolean): string => foldkitApplication({
  title: `Dialog — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'
import * as Dialog from '@/ui/dialog'`,
  model: `export const Model = S.Struct({ dialog: Dialog.Model })
export type Model = typeof Model.Type`,
  messages: `export const ClickedOpen = m('ClickedOpen${name.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const GotDialogMessage = m('GotDialogMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Dialog.Message })
export const Message = S.Union([ClickedOpen, GotDialogMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { dialog: Dialog.init({ id: 'profile-dialog', isAnimated: true }) },
  [],
]`,
  update: `const mapDialog = (
  model: Model,
  result: ReturnType<typeof Dialog.update>,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [dialog, commands] = result
  return [
    { ...model, dialog },
    Command.mapMessages(commands, next => GotDialogMessage({ message: next })),
  ]
}

export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ClickedOpen${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapDialog(model, Dialog.open(model.dialog))
    case 'GotDialogMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapDialog(model, Dialog.update(model.dialog, message.message))
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Dialog — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ onClick: ClickedOpen(), children: ['Open dialog'] }, h),
    Dialog.dialog({
      model: model.dialog,
      toParentMessage: message => GotDialogMessage({ message }),
      title: '${title}',
      description: '${description}',
      ${compact ? "class: 'sm:max-w-sm'," : ''}
      content: slots => [
        h.p([h.Class('text-sm')], ['Dialog content remains ordinary Foldkit Html.']),
      ],
      footer: slots => [
        h.button([
          ...slots.closeButton,
          ...slots.initialFocusAttributes(),
          h.Type('button'),
          h.Class('rounded-md border px-4 py-2 text-sm'),
        ], ['Cancel']),
        h.button([
          ...slots.closeButton,
          h.Type('button'),
          h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'),
        ], ['Save']),
      ],
    }, h),
  ]),
})`,
});

export const dialogPage = authoredPage({
  slug: 'dialog', title: 'Dialog', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Opens focused content in a modal surface with focus trapping, restoration, dismissal, and optional transitions.',
    architecture: 'Dialog is a child submodel. Programmatic open and child update both return Commands for focus and animation timing; always map them back through the wrapper Message instead of discarding them.',
    apiHref: 'https://foldkit.dev/ui/dialog',
    composition: 'Trigger (parent Message)\nDialog submodel\n└── panel\n    ├── header / title / description\n    ├── content\n    ├── footer\n    └── close action',
    styling: 'Use dialogs for focused tasks that can be completed or cancelled in place. Keep content short enough that the modal context remains understandable.',
    accessibility: 'Foldkit owns native dialog semantics, accessible title/description IDs, focus trapping, Escape dismissal, and trigger focus restoration. Claim initialFocusAttributes on the intended first control when needed.',
    keyboard: [['Tab / Shift+Tab', 'Cycles focus within the open dialog.'], ['Escape', 'Closes the dialog and restores trigger focus.']],
    examples: [
      {
        title: 'Edit profile', description: 'Opening and closing map focus/transition Commands through the parent update loop.',

        code: source('Edit profile', 'Edit profile', 'Make changes to your public details.', false),
      },
      {
        title: 'Compact confirmation', description: 'A separate dialog instance owns a separate child Model and stable id.',

        code: source('Compact confirmation', 'Review change', 'Confirm the updated workspace name.', true),
      },
    ],
  },
});
