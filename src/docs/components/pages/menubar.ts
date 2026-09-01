import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Menubar from '@/ui/menubar';
import * as DropdownMenu from '@/ui/dropdown-menu';

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
export const Action = S.Literals(['new', 'open', 'save', 'export', 'pdf', 'csv'])
export type Action = typeof Action.Type
export const Model = S.Struct({
  file: DropdownMenu.Model,
  edit: DropdownMenu.Model,
  view: DropdownMenu.Model,
  menubar: Menubar.Model,
  maybeLastAction: S.Option(Action),
})
export type Model = typeof Model.Type`,
  messages: `export const GotMenuMessage = m('GotMenubarMenuMessage', { target: MenuTarget, message: DropdownMenu.Message })
export const GotMenubarMessage = m('GotMenubarBehaviorMessage', { message: Menubar.Message })
export const Message = S.Union([GotMenuMessage, GotMenubarMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  {
    file: DropdownMenu.init({ id: 'file-menu' }),
    edit: DropdownMenu.init({ id: 'edit-menu' }),
    view: DropdownMenu.init({ id: 'view-menu' }),
    menubar: Menubar.init({ id: 'application-menubar' }),
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
    case 'GotMenubarBehaviorMessage': {
      const [menubar, commands, maybeMove] = Menubar.update(model.menubar, message.message)
      const index = Option.match(maybeMove, { onNone: () => menubar.activeIndex, onSome: move => move.index })
      const target = targets[index]
      if (target === undefined) return [model, []]
      const [file] = target === 'file' ? DropdownMenu.open(model.file) : DropdownMenu.close(model.file)
      const [edit] = target === 'edit' ? DropdownMenu.open(model.edit) : DropdownMenu.close(model.edit)
      const [view] = target === 'view' ? DropdownMenu.open(model.view) : DropdownMenu.close(model.view)
      return [{ ...model, file, edit, view, menubar }, Command.mapMessages(commands, next => GotMenubarMessage({ message: next }))]
    }
  }
}`,
  view: `const actions: ReadonlyArray<Action> = ['new', 'open', 'save', 'export']
const labelFor = (action: Action): string => action[0]?.toUpperCase() + action.slice(1)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Menubar — Coordinated menus',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Menubar.menubar<Action, Message>({
      ariaLabel: 'Application menu',
      model: model.menubar,
      toParentMessage: message => GotMenubarMessage({ message }),
      menus: ([['file', 'File'], ['edit', 'Edit'], ['view', 'View']] as const).map(([target, label]) => ({
        id: \`\${target}-menu\`, label, model: model[target],
        toParentMessage: message => GotMenuMessage({ target, message }),
        items: actions,
        itemToConfig: action => ({ label: labelFor(action), ...(action === 'save' ? { shortcut: '⌘S', isDisabled: true } : {}), ...(action === 'export' ? { submenu: { items: ['pdf', 'csv'], itemToConfig: child => ({ label: child.toUpperCase() }) } } : {}) }),
      })),
    }, h),
  ]),
})`,
});

const MenuTarget = S.Literals(['file', 'edit', 'view']);
type MenuTarget = typeof MenuTarget.Type;
const GotMenubarPreviewMessage = m('GotMenubarPreviewMessage', { target: MenuTarget, message: DropdownMenu.Message });
const GotMenubarBehaviorPreview = m('GotMenubarBehaviorPreview', { message: Menubar.Message });
const MenubarPreviewMessage = S.Union([GotMenubarPreviewMessage, GotMenubarBehaviorPreview]);
type MenubarPreviewMessage = typeof MenubarPreviewMessage.Type;
const MenubarPreviewModel = S.Struct({ _docsPage: S.Literal('menubar'), menubar: Menubar.Model, file: DropdownMenu.Model, edit: DropdownMenu.Model, view: DropdownMenu.Model, maybeLastAction: S.Option(S.String) });
type MenubarPreviewModel = typeof MenubarPreviewModel.Type;
const ActionMenu = DropdownMenu.create<string>();
const targets: ReadonlyArray<MenuTarget> = ['file', 'edit', 'view'];
const previewProgram = definePreviewProgram<MenubarPreviewModel, MenubarPreviewMessage>({
  Model: MenubarPreviewModel, Message: MenubarPreviewMessage,
  init: index => ({ _docsPage: 'menubar', menubar: Menubar.init({ id: `docs-menubar-${String(index)}` }), file: DropdownMenu.init({ id: `docs-menubar-file-${String(index)}` }), edit: DropdownMenu.init({ id: `docs-menubar-edit-${String(index)}` }), view: DropdownMenu.init({ id: `docs-menubar-view-${String(index)}` }), maybeLastAction: Option.none() }),
  update: (model, message) => {
    if (message._tag === 'GotMenubarBehaviorPreview') {
      const [menubar, commands, maybeMove] = Menubar.update(model.menubar, message.message);
      const index = Option.match(maybeMove, { onNone: () => menubar.activeIndex, onSome: move => move.index });
      const target = targets[index];
      if (target === undefined) return [model, []];
      const [file] = target === 'file' ? DropdownMenu.open(model.file) : DropdownMenu.close(model.file);
      const [edit] = target === 'edit' ? DropdownMenu.open(model.edit) : DropdownMenu.close(model.edit);
      const [view] = target === 'view' ? DropdownMenu.open(model.view) : DropdownMenu.close(model.view);
      return [{ ...model, file, edit, view, menubar }, Command.mapMessages(commands, next => GotMenubarBehaviorPreview({ message: next }))];
    }
    const [menu, commands, maybeSelection] = ActionMenu.update(model[message.target], message.message);
    return [{ ...model, [message.target]: menu, maybeLastAction: Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selection => Option.some(selection.value) }) }, Command.mapMessages(commands, next => GotMenubarPreviewMessage({ target: message.target, message: next }))];
  },
  view: (index, model, h) => Menubar.menubar<string, MenubarPreviewMessage>({ model: model.menubar, toParentMessage: message => GotMenubarBehaviorPreview({ message }), ariaLabel: 'Application menu', ...(index === 2 ? { direction: 'rtl' as const } : {}), menus: ([['file', 'File'], ['edit', 'Edit'], ['view', 'View']] as const).map(([target, label]) => ({ id: `docs-menubar-${target}`, label, model: model[target], toParentMessage: message => GotMenubarPreviewMessage({ target, message }), items: ['new', 'open', 'save', 'export'], itemToConfig: item => ({ label: item[0]?.toUpperCase() + item.slice(1), ...(item === 'save' ? { shortcut: '⌘S', isDisabled: true } : {}), ...(item === 'export' ? { submenu: { items: ['pdf', 'csv'], itemToConfig: child => ({ label: child.toUpperCase() }) } } : {}) }) })) }, h),
});

export const menubarPage = authoredPage({
  slug: 'menubar', title: 'Menubar', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Coordinates several persistent top-level application menus with typed child actions.',
    architecture: 'A thin Menubar Model owns only the roving top-level focus index and focus Command. Each label owns an independent Dropdown Menu Model for open state, disabled traversal, typeahead, submenu routing, and dismissal. The parent folds Menubar MovedTo facts to switch menus and typed menu Selected facts to application actions.',
    apiHref: 'https://foldkit.dev/ui/menu',
    composition: 'Parent Menubar state\n├── active top-level index\n├── File Dropdown Menu Model\n├── Edit Dropdown Menu Model\n└── View Dropdown Menu Model\n    └── each emits typed Action OutMessage',
    styling: 'Menubars suit desktop-style applications with stable command categories. On narrow consumer layouts, provide an alternative navigation pattern rather than forcing horizontal overflow.',
    accessibility: 'The wrapper exposes a named menubar and each child retains menu/menuitem semantics. Horizontal arrows move between top-level menus; vertical arrows remain inside the active child.',
    keyboard: [['Arrow Left / Right', 'Moves to and opens the adjacent top-level menu.'], ['Arrow Up / Down', 'Moves within the current child menu.'], ['Enter / Space', 'Opens a menu or selects an action.'], ['Escape', 'Closes the active menu.']],
    examples: [
      { title: 'Coordinated menus', description: 'Three child models are routed by target and horizontal movement is explicit parent state.', code: source },
      { title: 'Shortcut hints', description: 'Shortcut labels enrich items but global keyboard subscriptions remain separate application behavior.', code: source },
      { title: 'RTL switching', description: 'The shared focus adapter mirrors horizontal movement while child menus mirror submenu keys.', code: source },
      { title: 'Disabled submenu', description: 'Disabled items are skipped and nested actions stay within the typed action union.', code: source },
    ],
  },
});
