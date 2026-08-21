import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as ContextMenu from '@/ui/context-menu';

const actions = ['back', 'forward', 'reload'] as const;
const labelFor = (value: string): string => value[0]?.toUpperCase() + value.slice(1);

const source = (name: string): string => foldkitApplication({
  title: `Context Menu — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ContextMenu from '@/ui/context-menu'`,
  model: `export const Action = S.Literals(['back', 'forward', 'reload'])
export type Action = typeof Action.Type
export const Model = S.Struct({ menu: ContextMenu.Model, maybeLastAction: S.Option(Action) })
export type Model = typeof Model.Type`,
  messages: `export const GotContextMenuMessage = m('GotContextMenuMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: ContextMenu.Message })
export const Message = S.Union([GotContextMenuMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { menu: ContextMenu.init({ id: 'browser-context-menu' }), maybeLastAction: Option.none() },
  [],
]`,
  update: `const BrowserMenu = ContextMenu.create<Action>()

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotContextMenuMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [menu, commands, maybeSelection] = BrowserMenu.update(model.menu, message.message)
      const maybeLastAction = Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selected => Option.some(selected.value) })
      return [{ ...model, menu, maybeLastAction }, Command.mapMessages(commands, next => GotContextMenuMessage({ message: next }))]
    }
  }
}`,
  view: `const actions: ReadonlyArray<Action> = ['back', 'forward', 'reload']
const labelFor = (action: Action): string => action[0]?.toUpperCase() + action.slice(1)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Context Menu — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    ContextMenu.contextMenu({
      model: model.menu,
      toParentMessage: message => GotContextMenuMessage({ message }),
      class: 'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm',
      trigger: 'Right click here',
      ariaLabel: 'Browser actions',
      items: actions,
      itemToConfig: action => ({ label: labelFor(action), ...(action === 'forward' ? { isDisabled: true } : {}) }),
    }, h),
  ]),
})`,
});

const preview = (model: State.Model, h: HtmlBuilder<State.Message>) => ContextMenu.contextMenu({ model: model.contextMenu, toParentMessage: (message) => State.GotContextMenuMessage({ message }), class: 'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm', trigger: 'Right click here', ariaLabel: 'Browser actions', items: actions, itemToConfig: (action) => ({ label: labelFor(action), ...(action === 'forward' ? { isDisabled: true } : {}) }) }, h);

const GotContextMenuPreviewMessage = m('GotContextMenuPreviewMessage', { message: ContextMenu.Message });
type GotContextMenuPreviewMessage = typeof GotContextMenuPreviewMessage.Type;
const ContextMenuPreviewModel = S.Struct({ _docsPage: S.Literal('context-menu'), contextMenu: ContextMenu.Model });
type ContextMenuPreviewModel = typeof ContextMenuPreviewModel.Type;
const previewProgram = definePreviewProgram<ContextMenuPreviewModel, GotContextMenuPreviewMessage>({
  Model: ContextMenuPreviewModel,
  Message: GotContextMenuPreviewMessage,
  init: index => ({ _docsPage: 'context-menu', contextMenu: ContextMenu.init({ id: `docs-context-menu-${String(index)}` }) }),
  update: (model, message) => {
    const [contextMenu, commands] = ContextMenu.update(model.contextMenu, message.message);
    return [{ ...model, contextMenu }, Command.mapMessages(commands, next => GotContextMenuPreviewMessage({ message: next }))];
  },
  view: (_index, model, h) => ContextMenu.contextMenu({ model: model.contextMenu, toParentMessage: message => GotContextMenuPreviewMessage({ message }), class: 'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm', trigger: 'Right click here', ariaLabel: 'Browser actions', items: actions, itemToConfig: action => ({ label: labelFor(action), ...(action === 'forward' ? { isDisabled: true } : {}) }) }, h),
});

export const contextMenuPage = authoredPage({
  slug: 'context-menu', title: 'Context Menu', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Opens a typed action menu at the pointer coordinates of a secondary click.',
    architecture: 'Context Menu reuses the Dropdown Menu Model and typed update, adding contextmenu coordinate anchoring. The parent must still consume Selected output and map any returned Commands.',
    apiHref: 'https://foldkit.dev/ui/menu',
    composition: 'Context target\n└── secondary-click Message with x/y\n    └── menu child Model\n        ├── coordinate anchor\n        ├── active item\n        └── typed selection output',
    styling: 'Use context menus as accelerators, not the only route to important actions. The dashed preview target makes the activation region explicit.',
    accessibility: 'A pointer context menu needs equivalent visible controls elsewhere. Once open, the menu remains fully keyboard navigable and Escape dismissible.',
    keyboard: [['Shift+F10 / context-menu key', 'Browsers may dispatch the context-menu event from the focused target.'], ['Arrow Up / Down', 'Moves among enabled actions.'], ['Enter', 'Selects the active action.'], ['Escape', 'Closes the menu.']],
    examples: [
      { title: 'Browser actions', description: 'Secondary-click coordinates live in the child model; the chosen action returns to the parent.', preview, code: source('Browser actions') },
      { title: 'Disabled action', description: 'Disabled entries are skipped by pointer and keyboard navigation.', preview, code: source('Disabled action') },
    ],
  },
});
