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
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

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

export const menubarExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => {
  const code = source(renderer);
  return menubarFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code }));
};
