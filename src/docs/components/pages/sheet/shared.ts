import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const sheetFixtures = [
  { title: 'Compound layout', description: 'Compose content and footer controls while Foldkit owns the modal lifecycle.', side: 'right', panelTitle: 'Edit profile' },
  { title: 'Bottom task', description: 'Changing the edge is view configuration; the child integration remains identical.', side: 'bottom', panelTitle: 'Quick settings' },
  { title: 'Top sheet', description: 'Top placement uses the same Dialog behavior and focus lifecycle.', side: 'top', panelTitle: 'Command palette' },
  { title: 'Left sheet', description: 'Left placement remains a render-time choice rather than model state.', side: 'left', panelTitle: 'Workspace navigation' },
] as const;

const source = (
  fixture: (typeof sheetFixtures)[number],
  renderer: 'tailwind' | 'stylex',
): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  return foldkitApplication({
    title: `Sheet — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\n" : ''}
import * as Button from '@/${isStyleX ? 'stylex' : 'ui'}/button'
import * as Sheet from '@/${isStyleX ? 'stylex' : 'ui'}/sheet'${isStyleX ? "\n\nconst styles = stylex.create({\n  content: { paddingInline: '1rem', fontSize: '0.875rem' },\n  cancel: { borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: '1px', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },\n  save: { backgroundColor: 'var(--primary)', borderRadius: '0.375rem', color: 'var(--primary-foreground)', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },\n})" : ''}`,
    model: `export const Model = S.Struct({ sheet: Sheet.Model })
export type Model = typeof Model.Type`,
    messages: `export const ClickedOpen = m('ClickedOpenSheet${tag}')
export const GotSheetMessage = m('GotSheetMessage${tag}', { message: Sheet.Message })
export const Message = S.Union([ClickedOpen, GotSheetMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { sheet: Sheet.init({ id: 'settings-sheet', isAnimated: true }) },
  [],
]`,
    update: `const mapSheet = (
  model: Model,
  result: ReturnType<typeof Sheet.update>,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [sheet, commands] = result
  return [
    { ...model, sheet },
    Command.mapMessages(commands, next => GotSheetMessage({ message: next })),
  ]
}

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ClickedOpenSheet${tag}':
      return mapSheet(model, Sheet.open(model.sheet))
    case 'GotSheetMessage${tag}':
      return mapSheet(model, Sheet.update(model.sheet, message.message))
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Sheet — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'outline', onClick: ClickedOpen(), children: ['Open ${fixture.side} sheet'] }, h),
    Sheet.sheet({
      model: model.sheet,
      toParentMessage: message => GotSheetMessage({ message }),
      side: '${fixture.side}',
      title: '${fixture.panelTitle}',
      description: 'Update the settings, then save or cancel.',
      content: () => [
        h.div([h.Class(${isStyleX ? "stylex.props(styles.content).className ?? ''" : "'px-4 text-sm'"} )], [
          'Sheet content remains ordinary Foldkit Html.',
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
          h.Class(${isStyleX ? "stylex.props(styles.save).className ?? ''" : "'rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'"}),
        ], ['Save']),
      ],
    }, h),
  ]),
})`,
  });
};

export const sheetExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => sheetFixtures.map(fixture => ({
  title: fixture.title,
  description: fixture.description,
  code: source(fixture, renderer),
}));
