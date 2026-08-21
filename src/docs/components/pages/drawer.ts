import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as Button from '@/ui/button';
import * as Drawer from '@/ui/drawer';

const source = (name: string, direction: Drawer.DrawerDirection): string => foldkitApplication({
  title: `Drawer — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'
import * as Drawer from '@/ui/drawer'`,
  model: `export const Model = S.Struct({ drawer: Drawer.Model })
export type Model = typeof Model.Type`,
  messages: `export const ClickedOpen = m('ClickedOpenDrawer${name.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const GotDrawerMessage = m('GotDrawerMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Drawer.Message })
export const Message = S.Union([ClickedOpen, GotDrawerMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { drawer: Drawer.init({ id: 'goal-drawer', isAnimated: true }) },
  [],
]`,
  update: `const mapDrawer = (
  model: Model,
  result: ReturnType<typeof Drawer.update>,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [drawer, commands] = result
  return [
    { ...model, drawer },
    Command.mapMessages(commands, next => GotDrawerMessage({ message: next })),
  ]
}

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ClickedOpenDrawer${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapDrawer(model, Drawer.open(model.drawer))
    case 'GotDrawerMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapDrawer(model, Drawer.update(model.drawer, message.message))
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Drawer — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'outline', onClick: ClickedOpen(), children: ['Open ${direction} drawer'] }, h),
    Drawer.drawer({
      model: model.drawer,
      toParentMessage: message => GotDrawerMessage({ message }),
      direction: '${direction}',
      title: 'Move goal',
      description: 'Set your daily activity goal.',
      content: () => [
        h.div([h.Class('px-4 pb-6 text-center')], [
          h.p([h.Class('text-5xl font-bold tabular-nums')], ['350']),
          h.p([h.Class('text-sm text-muted-foreground')], ['Calories per day']),
        ]),
      ],
      footer: slots => [
        h.button([...slots.closeButton, h.Type('button'), h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground')], ['Save goal']),
        h.button([...slots.closeButton, h.Type('button'), h.Class('rounded-md border px-4 py-2 text-sm')], ['Cancel']),
      ],
    }, h),
  ]),
})`,
});

const preview = (model: State.Model, direction: Drawer.DrawerDirection, h: HtmlBuilder<State.Message>) => h.div([], [
  Button.button({ variant: 'outline', onClick: State.OpenedOverlay({ target: 'drawer' }), children: [`Open ${direction} drawer`] }, h),
  Drawer.drawer({ model: model.drawer, toParentMessage: (message) => State.GotDrawerMessage({ message }), direction, title: 'Move goal', description: 'Set your daily activity goal.', content: () => [h.div([h.Class('px-4 pb-6 text-center')], [h.p([h.Class('text-5xl font-bold tabular-nums')], ['350']), h.p([h.Class('text-sm text-muted-foreground')], ['Calories per day'])])], footer: (slots) => [h.button([...slots.closeButton, h.Type('button'), h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground')], ['Save goal']), h.button([...slots.closeButton, h.Type('button'), h.Class('rounded-md border px-4 py-2 text-sm')], ['Cancel'])] }, h),
]);

const OpenedDrawerPreview = m('OpenedDrawerPreview');
const GotDrawerPreviewMessage = m('GotDrawerPreviewMessage', { message: Drawer.Message });
const DrawerPreviewMessage = S.Union([OpenedDrawerPreview, GotDrawerPreviewMessage]);
type DrawerPreviewMessage = typeof DrawerPreviewMessage.Type;
const DrawerPreviewModel = S.Struct({ _docsPage: S.Literal('drawer'), drawer: Drawer.Model });
type DrawerPreviewModel = typeof DrawerPreviewModel.Type;
const previewProgram = definePreviewProgram<DrawerPreviewModel, DrawerPreviewMessage>({
  Model: DrawerPreviewModel,
  Message: DrawerPreviewMessage,
  init: index => ({ _docsPage: 'drawer', drawer: Drawer.init({ id: `docs-drawer-${String(index)}`, isAnimated: true }) }),
  update: (model, message) => {
    const [drawer, commands] = message._tag === 'OpenedDrawerPreview'
      ? Drawer.open(model.drawer)
      : Drawer.update(model.drawer, message.message);
    return [{ ...model, drawer }, Command.mapMessages(commands, next => GotDrawerPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const direction: Drawer.DrawerDirection = index === 0 ? 'bottom' : 'right';
    return h.div([], [Button.button({ variant: 'outline', onClick: OpenedDrawerPreview(), children: [`Open ${direction} drawer`] }, h), Drawer.drawer({ model: model.drawer, toParentMessage: message => GotDrawerPreviewMessage({ message }), direction, title: 'Move goal', description: 'Set your daily activity goal.', content: () => [h.div([h.Class('px-4 pb-6 text-center')], [h.p([h.Class('text-5xl font-bold tabular-nums')], ['350']), h.p([h.Class('text-sm text-muted-foreground')], ['Calories per day'])])], footer: slots => [h.button([...slots.closeButton, h.Type('button'), h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground')], ['Save goal']), h.button([...slots.closeButton, h.Type('button'), h.Class('rounded-md border px-4 py-2 text-sm')], ['Cancel'])] }, h)]);
  },
});

export const drawerPage = authoredPage({
  slug: 'drawer', title: 'Drawer', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Presents a dismissible task panel that can be dragged away from any screen edge.',
    architecture: 'Drawer owns a nested Dialog Model plus drag start and offset state. The parent delegates every Drawer.Message and maps the returned Commands so focus and animation effects run.',
    apiHref: 'https://foldkit.dev/ui/drawer',
    composition: 'Trigger (parent Message)\nDrawer submodel\n├── modal dialog lifecycle\n├── drag gesture state\n└── panel\n    ├── handle\n    ├── title / description\n    ├── content\n    └── footer actions',
    styling: 'Bottom drawers work well on touch-first layouts. Side drawers suit wider screens. Keep the drag direction aligned with the configured edge and constrain long content explicitly.',
    accessibility: 'The nested Dialog supplies naming, focus containment, Escape dismissal, and trigger focus restoration. The drag handle is decorative; every workflow still needs ordinary keyboard-operable close controls.',
    keyboard: [['Tab / Shift+Tab', 'Moves through controls while focus remains in the drawer.'], ['Escape', 'Closes the drawer and restores focus to its trigger.'], ['Pointer drag', 'Dragging at least 120px toward the configured edge dismisses the drawer.']],
    examples: [
      { title: 'Activity goal', description: 'A complete bottom drawer with content, footer controls, and swipe-to-dismiss state.', preview: (model, h) => preview(model, 'bottom', h), code: source('Activity goal', 'bottom') },
      { title: 'Side drawer', description: 'The same child integration can present a compact task from the right edge.', preview: (model, h) => preview(model, 'right', h), code: source('Side drawer', 'right') },
    ],
  },
});
