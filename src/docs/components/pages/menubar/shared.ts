import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const menubarTargets = ['file', 'edit', 'view'] as const;
export type MenubarTarget = (typeof menubarTargets)[number];
export const menubarActions = ['new', 'open', 'save', 'export'] as const;
export const menubarLabels = [['file', 'File'], ['edit', 'Edit'], ['view', 'View']] as const;
export const menubarLabel = (value: string): string => value[0]?.toUpperCase() + value.slice(1);
export const menubarFixtures = [
  { title: 'Coordinated menus', description: 'Three child models are routed by target and horizontal movement is explicit parent state.', direction: 'ltr' },
  { title: 'Shortcut hints', description: 'Shortcut labels enrich items but global keyboard subscriptions remain separate application behavior.', direction: 'ltr' },
  { title: 'RTL switching', description: 'The shared focus adapter mirrors horizontal movement while child menus mirror submenu keys.', direction: 'rtl' },
  { title: 'Disabled submenu', description: 'Disabled items are skipped and nested actions stay within the typed action union.', direction: 'ltr' },
] as const;

const source = (renderer: 'tailwind' | 'stylex'): string => foldkitApplication({
  title: 'Menubar — Coordinated menus',
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as DropdownMenu from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/dropdown-menu'
import * as Menubar from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/menubar'`,
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
  messages: `import { defineMessageUnion } from 'foldkit/message'


export const Message = defineMessageUnion({
  'GotMenubarMenuMessage': { target: MenuTarget, message: DropdownMenu.Message },
  'GotMenubarBehaviorMessage': { message: Menubar.Message },
});
export type Message = typeof Message.Type`,
  init: `export const init = (): Update.Return<Model, Message> => ({ model: {
    file: DropdownMenu.init({ id: 'file-menu' }),
    edit: DropdownMenu.init({ id: 'edit-menu' }),
    view: DropdownMenu.init({ id: 'view-menu' }),
    menubar: Menubar.init({ id: 'application-menubar' }),
    maybeLastAction: Option.none(),
  } })`,
  update: `const ActionMenu = DropdownMenu.create<Action>()
const targets: ReadonlyArray<MenuTarget> = ['file', 'edit', 'view']

export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotMenubarMenuMessage': {
      const menuOp__ = ActionMenu.update(model[message.target], message.message);
    const menu = menuOp__.model;
    const commands = menuOp__.commands ?? [];
    const maybeSelection = Option.fromNullishOr(menuOp__.outMessage);
      return { model: {
          ...model,
          [message.target]: menu,
          maybeLastAction: Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selected => Option.some(selected.value) }),
        }, commands: Command.mapMessages(commands, next => Message['GotMenubarMenuMessage']({ target: message.target, message: next })) }
    }
    case 'GotMenubarBehaviorMessage': {
      const menubarOp__ = Menubar.update(model.menubar, message.message);
    const menubar = menubarOp__.model;
    const commands = menubarOp__.commands ?? [];
    const maybeMove = Option.fromNullishOr(menubarOp__.outMessage);
      const index = Option.match(maybeMove, { onNone: () => menubar.activeIndex, onSome: move => move.index })
      const target = targets[index]
      if (target === undefined) return { model: model }
      const file = (target === 'file' ? DropdownMenu.open(model.file) : DropdownMenu.close(model.file)).model
      const edit = (target === 'edit' ? DropdownMenu.open(model.edit) : DropdownMenu.close(model.edit)).model
      const view = (target === 'view' ? DropdownMenu.open(model.view) : DropdownMenu.close(model.view)).model
      return { model: { ...model, file, edit, view, menubar }, commands: Command.mapMessages(commands, next => Message['GotMenubarBehaviorMessage']({ message: next })) }
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
      toParentMessage: message => Message['GotMenubarBehaviorMessage']({ message }),
      menus: ([['file', 'File'], ['edit', 'Edit'], ['view', 'View']] as const).map(([target, label]) => ({
        id: \`\${target}-menu\`, label, model: model[target],
        toParentMessage: message => Message['GotMenubarMenuMessage']({ target, message }),
        items: actions,
        itemToConfig: action => ({ label: labelFor(action), ...(action === 'save' ? { shortcut: '⌘S', isDisabled: true } : {}), ...(action === 'export' ? { submenu: { items: ['pdf', 'csv'], itemToConfig: child => ({ label: child.toUpperCase() }) } } : {}) }),
      })),
    }, h),
  ]),
})`,
});

export const menubarExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => {
  const code = source(renderer);
  return menubarFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code }));
};
