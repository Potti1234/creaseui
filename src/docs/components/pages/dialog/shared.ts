import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const dialogFixtures = [
  {
    title: 'Edit profile',
    description: 'Opening and closing map focus/transition Commands through the parent update loop.',
    dialogTitle: 'Edit profile',
    dialogDescription: 'Make changes to your public details.',
  },
  {
    title: 'Compact confirmation',
    description: 'A separate dialog instance owns a separate child Model and stable id.',
    dialogTitle: 'Review change',
    dialogDescription: 'Confirm the updated workspace name.',
  },
] as const;

const dialogSource = (
  fixture: (typeof dialogFixtures)[number],
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  return foldkitApplication({
    title: `Dialog — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\n" : ''}
import * as Button from '@/${isStyleX ? 'stylex' : 'ui'}/button'
import * as Dialog from '@/${isStyleX ? 'stylex' : 'ui'}/dialog'${isStyleX ? "\n\nconst styles = stylex.create({\n  body: { fontSize: '0.875rem' },\n  cancel: { borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: '1px', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },\n  confirm: { backgroundColor: 'var(--primary)', borderRadius: '0.375rem', color: 'var(--primary-foreground)', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },\n  compact: { maxWidth: '24rem' },\n})" : ''}`,
    model: `export const Model = S.Struct({ dialog: Dialog.Model })
export type Model = typeof Model.Type`,
    messages: `export const ClickedOpen = m('ClickedOpen${tag}')
export const GotDialogMessage = m('GotDialogMessage${tag}', { message: Dialog.Message })
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
    case 'ClickedOpen${tag}':
      return mapDialog(model, Dialog.open(model.dialog))
    case 'GotDialogMessage${tag}':
      return mapDialog(model, Dialog.update(model.dialog, message.message))
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Dialog — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ onClick: ClickedOpen(), children: ['Open dialog'] }, h),
    Dialog.dialog({
      model: model.dialog,
      toParentMessage: message => GotDialogMessage({ message }),
      title: '${fixture.dialogTitle}',
      description: '${fixture.dialogDescription}',
      ${index === 1 ? (isStyleX ? 'layoutStyle: styles.compact,' : "class: 'sm:max-w-sm',") : ''}
      content: () => [
        h.p([h.Class(${isStyleX ? "stylex.props(styles.body).className ?? ''" : "'text-sm'"} )], [
          'Dialog content remains ordinary Foldkit Html.',
        ]),
      ],
      footer: slots => [
        h.button([
          ...slots.closeButton,
          ...slots.initialFocusAttributes(),
          h.Type('button'),
          h.Class(${isStyleX ? "stylex.props(styles.cancel).className ?? ''" : "'rounded-md border px-4 py-2 text-sm'"}),
        ], ['Cancel']),
        h.button([
          ...slots.closeButton,
          h.Type('button'),
          h.Class(${isStyleX ? "stylex.props(styles.confirm).className ?? ''" : "'rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'"}),
        ], ['Save']),
      ],
    }, h),
  ]),
})`,
  });
};

export const dialogExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => dialogFixtures.map((fixture, index) => ({
  title: fixture.title,
  description: fixture.description,
  code: dialogSource(fixture, index, renderer),
}));
