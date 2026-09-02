import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Button from '@/ui/button';
import * as Sheet from '@/ui/sheet';

const source = (name: string, side: Sheet.SheetSide, title: string): string => foldkitApplication({
  title: `Sheet — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'
import * as Sheet from '@/ui/sheet'`,
  model: `export const Model = S.Struct({ sheet: Sheet.Model })
export type Model = typeof Model.Type`,
  messages: `export const ClickedOpen = m('ClickedOpenSheet${name.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const GotSheetMessage = m('GotSheetMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Sheet.Message })
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
    case 'ClickedOpenSheet${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapSheet(model, Sheet.open(model.sheet))
    case 'GotSheetMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapSheet(model, Sheet.update(model.sheet, message.message))
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Sheet — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'outline', onClick: ClickedOpen(), children: ['Open ${side} sheet'] }, h),
    Sheet.sheet({
      model: model.sheet,
      toParentMessage: message => GotSheetMessage({ message }),
      side: '${side}',
      title: '${title}',
      description: 'Update the settings, then save or cancel.',
      content: () => [
        h.div([h.Class('px-4 text-sm')], ['Sheet content remains ordinary Foldkit Html.']),
      ],
      footer: slots => [
        h.button([
          ...slots.closeButton,
          ...slots.initialFocusAttributes(),
          h.Type('button'), h.Class('rounded-md border px-4 py-2 text-sm'),
        ], ['Cancel']),
        h.button([
          ...slots.closeButton,
          h.Type('button'), h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'),
        ], ['Save']),
      ],
    }, h),
  ]),
})`,
});

const OpenedSheetPreview = m('OpenedSheetPreview');
const GotSheetPreviewMessage = m('GotSheetPreviewMessage', { message: Sheet.Message });
const SheetPreviewMessage = S.Union([OpenedSheetPreview, GotSheetPreviewMessage]);
type SheetPreviewMessage = typeof SheetPreviewMessage.Type;
const SheetPreviewModel = S.Struct({ _docsPage: S.Literal('sheet'), sheet: Sheet.Model });
type SheetPreviewModel = typeof SheetPreviewModel.Type;
const previewProgram = definePreviewProgram<SheetPreviewModel, SheetPreviewMessage>({
  Model: SheetPreviewModel,
  Message: SheetPreviewMessage,
  init: index => ({ _docsPage: 'sheet', sheet: Sheet.init({ id: `docs-sheet-${String(index)}`, isAnimated: true }) }),
  update: (model, message) => {
    const [sheet, commands] = message._tag === 'OpenedSheetPreview'
      ? Sheet.open(model.sheet)
      : Sheet.update(model.sheet, message.message);
    return [{ ...model, sheet }, Command.mapMessages(commands, next => GotSheetPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const sides: ReadonlyArray<Sheet.SheetSide> = ['right', 'bottom', 'top', 'left'];
    const titles = ['Edit profile', 'Quick settings', 'Command palette', 'Workspace navigation'] as const;
    const side = sides[index] ?? 'right';
    const title = titles[index] ?? 'Edit profile';
    return h.div([], [Button.button({ variant: 'outline', onClick: OpenedSheetPreview(), children: [`Open ${side} sheet`] }, h), Sheet.sheet({ model: model.sheet, toParentMessage: message => GotSheetPreviewMessage({ message }), side, title, description: 'Update the settings, then save or cancel.', content: () => [h.div([h.Class('px-4 text-sm')], ['Sheet content remains ordinary Foldkit Html.'])], footer: slots => [h.button([...slots.closeButton, ...slots.initialFocusAttributes(), h.Type('button'), h.Class('rounded-md border px-4 py-2 text-sm')], ['Cancel']), h.button([...slots.closeButton, h.Type('button'), h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground')], ['Save'])] }, h)]);
  },
});

export const sheetPage = authoredPage({
  slug: 'sheet', title: 'Sheet', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Presents modal task content from a screen edge while preserving the underlying page context.',
    architecture: 'Sheet reuses Foldkit’s Dialog child Model. Programmatic open and child update return focus/animation Commands that the parent must map through GotSheetMessage.',
    apiHref: 'https://foldkit.dev/ui/dialog',
    composition: 'Trigger (parent Message)\nSheet submodel\n└── edge panel\n    ├── header / title / description\n    ├── content\n    ├── footer\n    └── close action',
    styling: 'Right and left sheets suit settings or navigation; top and bottom sheets suit short contextual workflows. Avoid using a sheet for content that needs the full page.',
    accessibility: 'Sheet inherits Dialog’s title/description relationships, focus trap, Escape behavior, and trigger focus restoration. Use initialFocusAttributes once when a specific control should receive focus.',
    keyboard: [['Tab / Shift+Tab', 'Cycles within the open sheet.'], ['Escape', 'Closes the sheet and returns focus to its trigger.']],
    examples: [
      { title: 'Compound layout', description: 'Compose content and footer controls while Foldkit owns the modal lifecycle.',  code: source('Compound layout', 'right', 'Edit profile') },
      { title: 'Bottom task', description: 'Changing the edge is view configuration; the child integration remains identical.',  code: source('Bottom task', 'bottom', 'Quick settings') },
      { title: 'Top sheet', description: 'Top placement uses the same Dialog behavior and focus lifecycle.', code: source('Top sheet', 'top', 'Command palette') },
      { title: 'Left sheet', description: 'Left placement remains a render-time choice rather than model state.', code: source('Left sheet', 'left', 'Workspace navigation') },
    ],
  },
});
