import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as Menubar from '@/ui/menubar';
import * as DropdownMenu from '@/ui/dropdown-menu';

const preview = (model: State.Model, h: HtmlBuilder<State.Message>) => Menubar.menubar<string, State.Message>({ ariaLabel: 'Application menu', menus: ([['file', 'File', model.menubarFile], ['edit', 'Edit', model.menubarEdit], ['view', 'View', model.menubarView]] as const).map(([target, label, menu]) => ({ id: `docs-menubar-${target}`, label, model: menu, toParentMessage: (message) => State.GotMenubarMessage({ target, message }), items: ['new', 'open', 'save'], itemToConfig: (item) => ({ label: item[0]?.toUpperCase() + item.slice(1), ...(item === 'save' ? { shortcut: '⌘S' } : {}) }) })) }, h);

const source = foldkitApplication({
  title: 'Menubar — Coordinated menus',
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as DropdownMenu from '@/ui/dropdown-menu'
import * as Menubar from '@/ui/menubar'`,
  model: `export const MenuTarget = S.Literals(['file', 'edit', 'view'])
export type MenuTarget = typeof MenuTarget.Type
export const Action = S.Literals(['new', 'open', 'save'])
export type Action = typeof Action.Type
export const Model = S.Struct({
  file: DropdownMenu.Model,
  edit: DropdownMenu.Model,
  view: DropdownMenu.Model,
  activeMenu: S.Number,
  maybeLastAction: S.Option(Action),
})
export type Model = typeof Model.Type`,
  messages: `export const GotMenuMessage = m('GotMenubarMenuMessage', { target: MenuTarget, message: DropdownMenu.Message })
export const MovedMenu = m('MovedMenubarMenu', { index: S.Number })
export const Message = S.Union([GotMenuMessage, MovedMenu])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  {
    file: DropdownMenu.init({ id: 'file-menu' }),
    edit: DropdownMenu.init({ id: 'edit-menu' }),
    view: DropdownMenu.init({ id: 'view-menu' }),
    activeMenu: 0,
    maybeLastAction: Option.none(),
  },
  [],
]`,
  update: `const ActionMenu = DropdownMenu.create<Action>()
const targets: ReadonlyArray<MenuTarget> = ['file', 'edit', 'view']

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotMenubarMenuMessage': {
      const [menu, commands, maybeSelection] = ActionMenu.update(model[message.target], message.message)
      return [
        {
          ...model,
          [message.target]: menu,
          maybeLastAction: Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selected => Option.some(selected.value) }),
        },
        Command.mapMessages(commands, next => GotMenuMessage({ target: message.target, message: next })),
      ]
    }
    case 'MovedMenubarMenu': {
      const target = targets[message.index]
      if (target === undefined) return [model, []]
      const [file] = target === 'file' ? DropdownMenu.open(model.file) : DropdownMenu.close(model.file)
      const [edit] = target === 'edit' ? DropdownMenu.open(model.edit) : DropdownMenu.close(model.edit)
      const [view] = target === 'view' ? DropdownMenu.open(model.view) : DropdownMenu.close(model.view)
      return [{ ...model, file, edit, view, activeMenu: message.index }, []]
    }
  }
}`,
  view: `const actions: ReadonlyArray<Action> = ['new', 'open', 'save']
const labelFor = (action: Action): string => action[0]?.toUpperCase() + action.slice(1)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Menubar — Coordinated menus',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Menubar.menubar<Action, Message>({
      ariaLabel: 'Application menu',
      activeIndex: model.activeMenu,
      onMove: index => MovedMenu({ index }),
      menus: ([['file', 'File'], ['edit', 'Edit'], ['view', 'View']] as const).map(([target, label]) => ({
        id: \`\${target}-menu\`, label, model: model[target],
        toParentMessage: message => GotMenuMessage({ target, message }),
        items: actions,
        itemToConfig: action => ({ label: labelFor(action), ...(action === 'save' ? { shortcut: '⌘S' } : {}) }),
      })),
    }, h),
  ]),
})`,
});

const MenuTarget = S.Literals(['file', 'edit', 'view']);
type MenuTarget = typeof MenuTarget.Type;
const GotMenubarPreviewMessage = m('GotMenubarPreviewMessage', { target: MenuTarget, message: DropdownMenu.Message });
const MovedMenubarPreview = m('MovedMenubarPreview', { index: S.Number });
const MenubarPreviewMessage = S.Union([GotMenubarPreviewMessage, MovedMenubarPreview]);
type MenubarPreviewMessage = typeof MenubarPreviewMessage.Type;
const MenubarPreviewModel = S.Struct({ _docsPage: S.Literal('menubar'), file: DropdownMenu.Model, edit: DropdownMenu.Model, view: DropdownMenu.Model, activeMenu: S.Number, maybeLastAction: S.Option(S.String) });
type MenubarPreviewModel = typeof MenubarPreviewModel.Type;
const ActionMenu = DropdownMenu.create<string>();
const targets: ReadonlyArray<MenuTarget> = ['file', 'edit', 'view'];
const previewProgram = definePreviewProgram<MenubarPreviewModel, MenubarPreviewMessage>({
  Model: MenubarPreviewModel, Message: MenubarPreviewMessage,
  init: index => ({ _docsPage: 'menubar', file: DropdownMenu.init({ id: `docs-menubar-file-${String(index)}` }), edit: DropdownMenu.init({ id: `docs-menubar-edit-${String(index)}` }), view: DropdownMenu.init({ id: `docs-menubar-view-${String(index)}` }), activeMenu: 0, maybeLastAction: Option.none() }),
  update: (model, message) => {
    if (message._tag === 'MovedMenubarPreview') {
      const target = targets[message.index];
      if (target === undefined) return [model, []];
      const [file] = target === 'file' ? DropdownMenu.open(model.file) : DropdownMenu.close(model.file);
      const [edit] = target === 'edit' ? DropdownMenu.open(model.edit) : DropdownMenu.close(model.edit);
      const [view] = target === 'view' ? DropdownMenu.open(model.view) : DropdownMenu.close(model.view);
      return [{ ...model, file, edit, view, activeMenu: message.index }, []];
    }
    const [menu, commands, maybeSelection] = ActionMenu.update(model[message.target], message.message);
    return [{ ...model, [message.target]: menu, maybeLastAction: Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selection => Option.some(selection.value) }) }, Command.mapMessages(commands, next => GotMenubarPreviewMessage({ target: message.target, message: next }))];
  },
  view: (_index, model, h) => Menubar.menubar<string, MenubarPreviewMessage>({ ariaLabel: 'Application menu', activeIndex: model.activeMenu, onMove: index => MovedMenubarPreview({ index }), menus: ([['file', 'File'], ['edit', 'Edit'], ['view', 'View']] as const).map(([target, label]) => ({ id: `docs-menubar-${target}`, label, model: model[target], toParentMessage: message => GotMenubarPreviewMessage({ target, message }), items: ['new', 'open', 'save'], itemToConfig: item => ({ label: item[0]?.toUpperCase() + item.slice(1), ...(item === 'save' ? { shortcut: '⌘S' } : {}) }) })) }, h),
});

export const menubarPage = authoredPage({
  slug: 'menubar', title: 'Menubar', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Coordinates several persistent top-level application menus with typed child actions.',
    architecture: 'Each top-level label owns an independent Dropdown Menu Model. Parent Messages carry a stable target, map child Commands back to that target, persist typed Selected outputs, and coordinate ArrowLeft/ArrowRight movement with activeIndex/onMove.',
    apiHref: 'https://foldkit.dev/ui/menu',
    composition: 'Parent Menubar state\n├── active top-level index\n├── File Dropdown Menu Model\n├── Edit Dropdown Menu Model\n└── View Dropdown Menu Model\n    └── each emits typed Action OutMessage',
    styling: 'Menubars suit desktop-style applications with stable command categories. On narrow consumer layouts, provide an alternative navigation pattern rather than forcing horizontal overflow.',
    accessibility: 'The wrapper exposes a named menubar and each child retains menu/menuitem semantics. Horizontal arrows move between top-level menus; vertical arrows remain inside the active child.',
    keyboard: [['Arrow Left / Right', 'Moves to and opens the adjacent top-level menu.'], ['Arrow Up / Down', 'Moves within the current child menu.'], ['Enter / Space', 'Opens a menu or selects an action.'], ['Escape', 'Closes the active menu.']],
    examples: [
      { title: 'Coordinated menus', description: 'Three child models are routed by target and horizontal movement is explicit parent state.', preview, code: source },
      { title: 'Shortcut hints', description: 'Shortcut labels enrich items but global keyboard subscriptions remain separate application behavior.', preview, code: source },
    ],
  },
});
