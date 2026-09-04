import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const commandActions = ['calendar', 'search', 'settings'] as const;
export const commandLabel = (value: string): string => value[0]?.toUpperCase() + value.slice(1);
export const commandFixtures = [
  { title: 'Application commands', description: 'The parent stores the typed output; executing its domain effect remains an explicit parent decision.', grouped: false, mode: 'ready' },
  { title: 'Grouped commands', description: 'Group headings and shortcut hints enrich the same complete selection architecture.', grouped: true, mode: 'ready' },
  { title: 'No results', description: 'An empty result is announced as polite status without inventing an action.', grouped: false, mode: 'empty' },
  { title: 'Remote loading', description: 'The parent keeps request identity and stale-result rejection in its Commands, then passes explicit loading state.', grouped: false, mode: 'loading' },
  { title: 'Large result policy', description: 'Bound the rendered result window and announce that a narrower query reveals additional commands.', grouped: false, mode: 'limited' },
] as const;

const source = (fixture: (typeof commandFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const remote = fixture.mode === 'loading';
  const isStyleX = renderer === 'stylex';
  return foldkitApplication({
    title: `Command — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
${isStyleX ? "import * as stylex from '@stylexjs/stylex'\n" : ''}
import * as CommandMenu from '@/${isStyleX ? 'stylex' : 'ui'}/command'`,
    model: `export const Action = S.Literals(['calendar', 'search', 'settings'])
export type Action = typeof Action.Type
const ApplicationCommand = CommandMenu.create<Action>()
${isStyleX ? "const styles = stylex.create({ command: { width: '100%', maxWidth: '28rem' } })\n" : ''}export const Model = S.Struct({ command: CommandMenu.Model, maybeAction: S.Option(Action)${remote ? ', items: S.Array(Action), requestId: S.Number, isLoading: S.Boolean' : ''} })
export type Model = typeof Model.Type`,
    messages: `export const GotCommandMessage = m('GotCommandMessage${tag}', { message: CommandMenu.Message })
${remote ? "export const ReceivedRemoteCommands = m('ReceivedRemoteCommands', { requestId: S.Number, items: S.Array(Action) })\n" : ''}export const Message = S.Union([GotCommandMessage${remote ? ', ReceivedRemoteCommands' : ''}])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { command: CommandMenu.init({ id: 'application-command', isAnimated: true }), maybeAction: Option.none()${remote ? ', items: [], requestId: 0, isLoading: true' : ''} },
  [],
]`,
    update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    ${remote ? `case 'ReceivedRemoteCommands':
      return message.requestId === model.requestId
        ? [{ ...model, items: message.items, isLoading: false }, []]
        : [model, []]
    ` : ''}case 'GotCommandMessage${tag}': {
      const [command, commands, maybeSelection] = ApplicationCommand.update(model.command, message.message)
      const maybeAction = Option.match(maybeSelection, {
        onNone: () => model.maybeAction,
        onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<Action>(),
      })
      return [{ ...model, command, maybeAction${remote ? ", requestId: command.inputValue === model.command.inputValue ? model.requestId : model.requestId + 1, isLoading: command.inputValue === model.command.inputValue ? model.isLoading : true" : ''} }, Command.mapMessages(commands, next => GotCommandMessage({ message: next }))]
    }
  }
}`,
    view: `const actions: ReadonlyArray<Action> = ['calendar', 'search', 'settings']
const labelFor = (action: Action): string => action[0]?.toUpperCase() + action.slice(1)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Command — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    ApplicationCommand.command({
      model: model.command,
      maybeSelectedValue: model.maybeAction,
      restingInputValue: Option.match(model.maybeAction, { onNone: () => '', onSome: labelFor }),
      toParentMessage: message => GotCommandMessage({ message }),
      ${isStyleX ? 'layoutStyle: styles.command,' : "class: 'w-full max-w-md border shadow-md',"}
      items: ${fixture.mode === 'empty' ? '[] as ReadonlyArray<Action>' : remote ? 'model.items' : 'actions'},
      itemToConfig: action => ({ content: labelFor(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}) }),
      placeholder: 'Type a command or search…',
      ariaLabel: 'Application commands',${fixture.grouped ? `
      itemGroupKey: action => action === 'settings' ? 'System' : 'Navigation',
      groupToHeading: group => group,` : ''}
      ${fixture.mode === 'empty' ? "emptyContent: 'No matching application commands.'," : ''}
      ${remote ? "status: model.isLoading ? 'loading' : 'ready',\n      loadingContent: 'Loading remote commands…'," : ''}
      ${fixture.mode === 'limited' ? 'maxVisibleItems: 2,' : ''}
    }, h),
  ]),
})`,
  });
};

export const commandExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => commandFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: source(fixture, renderer) }));
