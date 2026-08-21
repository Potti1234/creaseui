import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as DropdownMenu from '@/ui/dropdown-menu';

const actions = ['profile', 'billing', 'settings', 'logout'] as const;
const labelFor = (value: string): string => value[0]?.toUpperCase() + value.slice(1);

const source = (name: string, destructive: boolean): string => foldkitApplication({
  title: `Dropdown Menu — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as DropdownMenu from '@/ui/dropdown-menu'`,
  model: `export const Action = S.Literals(['profile', 'billing', 'settings', 'logout'])
export type Action = typeof Action.Type
export const Model = S.Struct({ menu: DropdownMenu.Model, maybeLastAction: S.Option(Action) })
export type Model = typeof Model.Type`,
  messages: `export const GotMenuMessage = m('GotDropdownMenuMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: DropdownMenu.Message })
export const Message = S.Union([GotMenuMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { menu: DropdownMenu.init({ id: 'account-menu', isAnimated: true }), maybeLastAction: Option.none() },
  [],
]`,
  update: `const AccountMenu = DropdownMenu.create<Action>()

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotDropdownMenuMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
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
  title: 'Dropdown Menu — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    DropdownMenu.dropdownMenu({
      model: model.menu,
      toParentMessage: message => GotMenuMessage({ message }),
      trigger: 'Open account menu',
      triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',
      ariaLabel: 'Account actions',
      items: actions,
      itemToConfig: action => ({
        label: labelFor(action),
        shortcut: action === 'settings' ? '⌘,' : undefined,
        ${destructive ? "variant: action === 'logout' ? 'destructive' : 'default'," : ''}
      }),
    }, h),
    h.p([h.Role('status'), h.Class('text-sm')], [Option.match(model.maybeLastAction, { onNone: () => 'No action selected', onSome: value => \`Selected: \${labelFor(value)}\` })]),
  ]),
})`,
}).replace("shortcut: action === 'settings' ? '⌘,' : undefined,", "...(action === 'settings' ? { shortcut: '⌘,' } : {}),");

const preview = (model: State.Model, destructive: boolean, h: HtmlBuilder<State.Message>) => DropdownMenu.dropdownMenu({ model: model.dropdownMenu, toParentMessage: (message) => State.GotDropdownMenuMessage({ message }), trigger: 'Open account menu', triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium', ariaLabel: 'Account actions', items: actions, itemToConfig: (action) => ({ label: labelFor(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}), ...(destructive && action === 'logout' ? { variant: 'destructive' as const } : {}) }) }, h);

export const dropdownMenuPage = authoredPage({
  slug: 'dropdown-menu', title: 'Dropdown Menu', kind: 'submodel',
  definition: {
    kind: 'submodel', description: 'Presents a keyboard-navigable set of actions from a button trigger.',
    architecture: 'Dropdown Menu owns disclosure, active item, submenu, and anchor state. Use create<Action>() so its Selected OutMessage is typed, persist or execute that domain action in the parent, and map returned Commands.',
    apiHref: 'https://foldkit.dev/ui/menu',
    composition: 'Parent Model\n├── Dropdown Menu child Model\n├── optional last domain action\n└── menu view\n    ├── trigger\n    ├── items / checked items\n    ├── shortcuts\n    └── optional submenu',
    styling: 'Use destructive treatment only for destructive actions and separate unrelated groups. Shortcut labels are hints, not event handlers.',
    accessibility: 'The menu implements menu/menuitem roles, roving active state, disabled items, and Escape dismissal. The trigger needs a clear accessible name.',
    keyboard: [['Enter / Space', 'Opens the menu or selects the active action.'], ['Arrow Up / Down', 'Moves among enabled items.'], ['Arrow Right / Left', 'Opens or closes a submenu.'], ['Escape', 'Closes the complete menu tree.']],
    examples: [
      { title: 'Account actions', description: 'The complete parent consumes the typed Selected output rather than dropping the action.', preview: (model, h) => preview(model, false, h), code: source('Account actions', false) },
      { title: 'Destructive action', description: 'Visual severity is item configuration; selection still follows the same typed output path.', preview: (model, h) => preview(model, true, h), code: source('Destructive action', true) },
    ],
  },
});
