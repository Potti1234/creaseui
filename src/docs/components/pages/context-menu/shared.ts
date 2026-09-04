import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const contextMenuActions = ['back', 'forward', 'reload'] as const;
export const contextMenuLabel = (value: string): string => value[0]?.toUpperCase() + value.slice(1);
export const contextMenuFixtures = [
  { title: 'Browser actions', description: 'Secondary-click coordinates live in the child model; the chosen action returns to the parent.' },
  { title: 'Disabled action', description: 'Disabled entries are skipped by pointer and keyboard navigation.' },
  { title: 'Keyboard activation', description: 'Shift+F10 or the Context Menu key opens the same action model without requiring pointer coordinates.' },
] as const;

const source = (fixture: (typeof contextMenuFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  return foldkitApplication({
    title: `Context Menu — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\n" : ''}
import * as ContextMenu from '@/${isStyleX ? 'stylex' : 'ui'}/context-menu'${isStyleX ? "\n\nconst styles = stylex.create({\n  target: { height: '10rem', width: '18rem' },\n})" : ''}`,
    model: `export const Action = S.Literals(['back', 'forward', 'reload'])
export type Action = typeof Action.Type
export const Model = S.Struct({ menu: ContextMenu.Model, maybeLastAction: S.Option(Action) })
export type Model = typeof Model.Type`,
    messages: `export const GotContextMenuMessage = m('GotContextMenuMessage${tag}', { message: ContextMenu.Message })
export const Message = S.Union([GotContextMenuMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { menu: ContextMenu.init({ id: 'browser-context-menu' }), maybeLastAction: Option.none() },
  [],
]`,
    update: `const BrowserMenu = ContextMenu.create<Action>()

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotContextMenuMessage${tag}': {
      const [menu, commands, maybeSelection] = BrowserMenu.update(model.menu, message.message)
      const maybeLastAction = Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selected => Option.some(selected.value) })
      return [{ ...model, menu, maybeLastAction }, Command.mapMessages(commands, next => GotContextMenuMessage({ message: next }))]
    }
  }
}`,
    view: `const actions: ReadonlyArray<Action> = ['back', 'forward', 'reload']
const labelFor = (action: Action): string => action[0]?.toUpperCase() + action.slice(1)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Context Menu — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    ContextMenu.contextMenu({
      model: model.menu,
      toParentMessage: message => GotContextMenuMessage({ message }),
      ${isStyleX ? 'layoutStyle: styles.target,' : "class: 'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm',"}
      trigger: 'Right click here',
      ariaLabel: 'Browser actions',
      items: actions,
      itemToConfig: action => ({ label: labelFor(action), ...(action === 'forward' ? { isDisabled: true } : {}) }),
    }, h),
  ]),
})`,
  });
};

export const contextMenuExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => contextMenuFixtures.map(fixture => ({
  title: fixture.title, description: fixture.description, code: source(fixture, renderer),
}));
