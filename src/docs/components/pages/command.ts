import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as CommandMenu from '@/ui/command';

const actions = ['calendar', 'search', 'settings'] as const;
const labelFor = (value: string): string => value[0]?.toUpperCase() + value.slice(1);

const source = (name: string, grouped: boolean): string => foldkitApplication({
  title: `Command — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as CommandMenu from '@/ui/command'`,
  model: `export const Action = S.Literals(['calendar', 'search', 'settings'])
export type Action = typeof Action.Type
const ApplicationCommand = CommandMenu.create<Action>()
export const Model = S.Struct({ command: CommandMenu.Model, maybeAction: S.Option(Action)${name === 'Remote loading' ? ', items: S.Array(Action), requestId: S.Number, isLoading: S.Boolean' : ''} })
export type Model = typeof Model.Type`,
  messages: `export const GotCommandMessage = m('GotCommandMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: CommandMenu.Message })
${name === 'Remote loading' ? "export const ReceivedRemoteCommands = m('ReceivedRemoteCommands', { requestId: S.Number, items: S.Array(Action) })\n" : ''}export const Message = S.Union([GotCommandMessage${name === 'Remote loading' ? ', ReceivedRemoteCommands' : ''}])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { command: CommandMenu.init({ id: 'application-command', isAnimated: true }), maybeAction: Option.none()${name === 'Remote loading' ? ', items: [], requestId: 0, isLoading: true' : ''} },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    ${name === 'Remote loading' ? `case 'ReceivedRemoteCommands':
      return message.requestId === model.requestId
        ? [{ ...model, items: message.items, isLoading: false }, []]
        : [model, []]
    ` : ''}case 'GotCommandMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [command, commands, maybeSelection] = ApplicationCommand.update(model.command, message.message)
      const maybeAction = Option.match(maybeSelection, {
        onNone: () => model.maybeAction,
        onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<Action>(),
      })
      return [{ ...model, command, maybeAction${name === 'Remote loading' ? ", requestId: command.inputValue === model.command.inputValue ? model.requestId : model.requestId + 1, isLoading: command.inputValue === model.command.inputValue ? model.isLoading : true" : ''} }, Command.mapMessages(commands, next => GotCommandMessage({ message: next }))]
    }
  }
}`,
  view: `const actions: ReadonlyArray<Action> = ['calendar', 'search', 'settings']
const labelFor = (action: Action): string => action[0]?.toUpperCase() + action.slice(1)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Command — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    ApplicationCommand.command({
      model: model.command,
      maybeSelectedValue: model.maybeAction,
      restingInputValue: Option.match(model.maybeAction, { onNone: () => '', onSome: labelFor }),
      toParentMessage: message => GotCommandMessage({ message }),
      class: 'w-full max-w-md border shadow-md',
      items: ${name === 'No results' ? '[]' : name === 'Remote loading' ? 'model.items' : 'actions'},
      itemToConfig: action => ({ content: labelFor(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}) }),
      placeholder: 'Type a command or search…',
      ariaLabel: 'Application commands',${grouped ? `
      itemGroupKey: action => action === 'settings' ? 'System' : 'Navigation',
      groupToHeading: group => group,` : ''}
      ${name === 'No results' ? "emptyContent: 'No matching application commands.'," : ''}
      ${name === 'Remote loading' ? "status: model.isLoading ? 'loading' : 'ready',\n      loadingContent: 'Loading remote commands…'," : ''}
      ${name === 'Large result policy' ? 'maxVisibleItems: 2,' : ''}
    }, h),
  ]),
})`,
});

const GotCommandPreviewMessage = m('GotCommandPreviewMessage', { message: CommandMenu.Message });
type GotCommandPreviewMessage = typeof GotCommandPreviewMessage.Type;
const CommandPreviewModel = S.Struct({ _docsPage: S.Literal('command'), command: CommandMenu.Model, maybeAction: S.Option(S.Literals(['calendar', 'search', 'settings'])) });
type CommandPreviewModel = typeof CommandPreviewModel.Type;
type PreviewAction = typeof actions[number];
const PreviewCommand = CommandMenu.create<PreviewAction>();
const previewProgram = definePreviewProgram<CommandPreviewModel, GotCommandPreviewMessage>({
  Model: CommandPreviewModel, Message: GotCommandPreviewMessage,
  init: index => ({ _docsPage: 'command', command: CommandMenu.init({ id: `docs-command-${String(index)}`, isAnimated: true }), maybeAction: Option.none() }),
  update: (model, message) => {
    const [command, commands, maybeSelection] = PreviewCommand.update(model.command, message.message);
    const maybeAction = Option.match(maybeSelection, { onNone: () => model.maybeAction, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<PreviewAction>() });
    return [{ ...model, command, maybeAction }, Command.mapMessages(commands, next => GotCommandPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => PreviewCommand.command({ model: model.command, maybeSelectedValue: model.maybeAction, restingInputValue: Option.match(model.maybeAction, { onNone: () => '', onSome: labelFor }), toParentMessage: message => GotCommandPreviewMessage({ message }), class: 'w-full max-w-md border shadow-md', items: index === 2 ? [] : actions, itemToConfig: action => ({ content: labelFor(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}) }), placeholder: 'Type a command or search…', ariaLabel: 'Application commands', ...(index === 1 ? { itemGroupKey: (action: PreviewAction) => action === 'settings' ? 'System' : 'Navigation', groupToHeading: (group: string) => group } : {}), ...(index === 2 ? { emptyContent: 'No matching application commands.' } : {}), ...(index === 3 ? { status: 'loading' as const, loadingContent: 'Loading remote commands…' } : {}), ...(index === 4 ? { maxVisibleItems: 2 } : {}) }, h),
});

export const commandPage = authoredPage({
  slug: 'command', title: 'Command', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Provides a searchable command surface for selecting an application action.',
    architecture: 'Bind the action union once with CommandMenu.create<Action>(). Foldkit Combobox owns query, active descendant, disclosure, and focus; shared pure filtering derives visible actions. The parent owns result data, loading policy, stale-result rejection, and the consequences of typed Selected output.',
    apiHref: 'https://foldkit.dev/ui/combobox',
    composition: 'Command child Model\n├── search input + toggle\n├── filtered action list\n│   ├── label\n│   ├── shortcut hint\n│   └── disabled/group metadata\n└── typed OutMessage to parent',
    styling: 'Command can render inline or be composed inside a Dialog for a global palette. Shortcut text is a visual hint; register global keyboard shortcuts separately in the parent program.',
    accessibility: 'The primitive supplies combobox/listbox semantics and keyboard navigation. Shortcuts do not replace accessible action labels.',
    keyboard: [['Type', 'Filters commands by their configured search text.'], ['Arrow Up / Down', 'Moves the active command.'], ['Enter', 'Emits the selected action to the parent.'], ['Escape', 'Closes the list without running an action.']],
    examples: [
      { title: 'Application commands', description: 'The parent stores the typed output; executing its domain effect remains an explicit parent decision.',  code: source('Application commands', false) },
      { title: 'Grouped commands', description: 'Group headings and shortcut hints enrich the same complete selection architecture.',  code: source('Grouped commands', true) },
      { title: 'No results', description: 'An empty result is announced as polite status without inventing an action.', code: source('No results', false) },
      { title: 'Remote loading', description: 'The parent keeps request identity and stale-result rejection in its Commands, then passes explicit loading state.', code: source('Remote loading', false) },
      { title: 'Large result policy', description: 'Bound the rendered result window and announce that a narrower query reveals additional commands.', code: source('Large result policy', false) },
    ],
  },
});
