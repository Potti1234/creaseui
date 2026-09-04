import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const dropdownMenuActions = ['profile', 'billing', 'settings', 'logout'] as const;
export type DropdownMenuAction = (typeof dropdownMenuActions)[number];
export const dropdownMenuLabel = (value: string): string => value[0]?.toUpperCase() + value.slice(1);

export const dropdownMenuFixtures = [
  { title: 'Account actions', description: 'The complete parent consumes the typed Selected output rather than dropping the action.', destructive: false, submenu: false, direction: 'ltr' },
  { title: 'Destructive action', description: 'Visual severity is item configuration; selection still follows the same typed output path.', destructive: true, submenu: false, direction: 'ltr' },
  { title: 'Submenu and disabled action', description: 'Submenu routing and disabled-item traversal use the same shared typed action union.', destructive: false, submenu: true, direction: 'ltr' },
  { title: 'RTL submenu', description: 'Forward and back submenu keys mirror with direction while Escape closes the complete tree.', destructive: false, submenu: true, direction: 'rtl' },
] as const;

const source = (fixture: (typeof dropdownMenuFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  const submenuConfig = fixture.submenu
    ? `...(action === 'billing' ? { isDisabled: true } : {}),
        ...(action === 'settings' ? { submenu: { items: ['profile', 'billing'], itemToConfig: child => ({ label: labelFor(child), isDisabled: child === 'billing' }) } } : {}),`
    : '';
  return foldkitApplication({
    title: `Dropdown Menu — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as DropdownMenu from '@/${isStyleX ? 'stylex' : 'ui'}/dropdown-menu'`,
    model: `export const Action = S.Literals(['profile', 'billing', 'settings', 'logout'])
export type Action = typeof Action.Type
export const Model = S.Struct({ menu: DropdownMenu.Model, maybeLastAction: S.Option(Action) })
export type Model = typeof Model.Type`,
    messages: `export const GotMenuMessage = m('GotDropdownMenuMessage${tag}', { message: DropdownMenu.Message })
export const Message = S.Union([GotMenuMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { menu: DropdownMenu.init({ id: 'account-menu', isAnimated: true }), maybeLastAction: Option.none() },
  [],
]`,
    update: `const AccountMenu = DropdownMenu.create<Action>()

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotDropdownMenuMessage${tag}': {
      const [menu, commands, maybeSelection] = AccountMenu.update(model.menu, message.message)
      const maybeLastAction = Option.match(maybeSelection, {
        onNone: () => model.maybeLastAction,
        onSome: selection => Option.some(selection.value),
      })
      return [{ ...model, menu, maybeLastAction }, Command.mapMessages(commands, next => GotMenuMessage({ message: next }))]
    }
  }
}`,
    view: `const actions: ReadonlyArray<Action> = ['profile', 'billing', 'settings', 'logout']
const labelFor = (action: Action): string => action[0]?.toUpperCase() + action.slice(1)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Dropdown Menu — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    DropdownMenu.dropdownMenu({
      model: model.menu,
      toParentMessage: message => GotMenuMessage({ message }),
      trigger: 'Open account menu',
      ${isStyleX ? '' : "triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',"}
      ariaLabel: 'Account actions',
      items: actions,
      itemToConfig: action => ({
        label: labelFor(action),
        ...(action === 'settings' ? { shortcut: '⌘,' } : {}),
        ${fixture.destructive ? "variant: action === 'logout' ? 'destructive' : 'default'," : ''}
        ${submenuConfig}
      }),
      ${fixture.direction === 'rtl' ? "direction: 'rtl'," : ''}
    }, h),
    h.p([h.Role('status'), h.Class('text-sm')], [Option.match(model.maybeLastAction, { onNone: () => 'No action selected', onSome: value => \`Selected: \${labelFor(value)}\` })]),
  ]),
})`,
  });
};

export const dropdownMenuExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => dropdownMenuFixtures.map(fixture => ({
  title: fixture.title,
  description: fixture.description,
  code: source(fixture, renderer),
}));
