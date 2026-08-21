import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
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
export const Model = S.Struct({ command: CommandMenu.Model, maybeAction: S.Option(Action) })
export type Model = typeof Model.Type`,
  messages: `export const GotCommandMessage = m('GotCommandMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: CommandMenu.Message })
export const Message = S.Union([GotCommandMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { command: CommandMenu.init({ id: 'application-command', isAnimated: true }), maybeAction: Option.none() },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotCommandMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [command, commands, maybeSelection] = CommandMenu.update(model.command, message.message)
      const maybeAction = Option.match(maybeSelection, {
        onNone: () => model.maybeAction,
        onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value as Action) : Option.none<Action>(),
      })
      return [{ ...model, command, maybeAction }, Command.mapMessages(commands, next => GotCommandMessage({ message: next }))]
    }
  }
}`,
  view: `const actions: ReadonlyArray<Action> = ['calendar', 'search', 'settings']
const labelFor = (action: Action): string => action[0]?.toUpperCase() + action.slice(1)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Command — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    CommandMenu.command({
      model: model.command,
      maybeSelectedValue: model.maybeAction,
      restingInputValue: Option.match(model.maybeAction, { onNone: () => '', onSome: labelFor }),
      toParentMessage: message => GotCommandMessage({ message }),
      class: 'w-full max-w-md border shadow-md',
      items: actions,
      itemToConfig: action => ({ content: labelFor(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}) }),
      placeholder: 'Type a command or search…',
      ariaLabel: 'Application commands',${grouped ? `
      itemGroupKey: action => action === 'settings' ? 'System' : 'Navigation',
      groupToHeading: group => group,` : ''}
    }, h),
  ]),
})`,
});

const preview = (model: State.Model, grouped: boolean, h: HtmlBuilder<State.Message>) => CommandMenu.command<string, State.Message>({ model: model.command, maybeSelectedValue: model.selectedCommandValue, restingInputValue: Option.match(model.selectedCommandValue, { onNone: () => '', onSome: labelFor }), toParentMessage: (message) => State.GotCommandMessage({ message }), class: 'w-full max-w-md border shadow-md', items: actions, itemToConfig: (action) => ({ content: labelFor(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}) }), placeholder: 'Type a command or search…', ariaLabel: 'Application commands', ...(grouped ? { itemGroupKey: (action: string) => action === 'settings' ? 'System' : 'Navigation', groupToHeading: (group: string) => group } : {}) }, h);

const GotCommandPreviewMessage = m('GotCommandPreviewMessage', { message: CommandMenu.Message });
type GotCommandPreviewMessage = typeof GotCommandPreviewMessage.Type;
const CommandPreviewModel = S.Struct({ _docsPage: S.Literal('command'), command: CommandMenu.Model, maybeAction: S.Option(S.String) });
type CommandPreviewModel = typeof CommandPreviewModel.Type;
const previewProgram = definePreviewProgram<CommandPreviewModel, GotCommandPreviewMessage>({
  Model: CommandPreviewModel, Message: GotCommandPreviewMessage,
  init: index => ({ _docsPage: 'command', command: CommandMenu.init({ id: `docs-command-${String(index)}`, isAnimated: true }), maybeAction: Option.none() }),
  update: (model, message) => {
    const [command, commands, maybeSelection] = CommandMenu.update(model.command, message.message);
    const maybeAction = Option.match(maybeSelection, { onNone: () => model.maybeAction, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<string>() });
    return [{ ...model, command, maybeAction }, Command.mapMessages(commands, next => GotCommandPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => CommandMenu.command<string, GotCommandPreviewMessage>({ model: model.command, maybeSelectedValue: model.maybeAction, restingInputValue: Option.match(model.maybeAction, { onNone: () => '', onSome: labelFor }), toParentMessage: message => GotCommandPreviewMessage({ message }), class: 'w-full max-w-md border shadow-md', items: actions, itemToConfig: action => ({ content: labelFor(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}) }), placeholder: 'Type a command or search…', ariaLabel: 'Application commands', ...(index === 1 ? { itemGroupKey: (action: string) => action === 'settings' ? 'System' : 'Navigation', groupToHeading: (group: string) => group } : {}) }, h),
});

export const commandPage = authoredPage({
  slug: 'command', title: 'Command', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Provides a searchable command surface for selecting an application action.',
    architecture: 'Command uses Foldkit’s Combobox submodel. Query/disclosure state lives in the child; the parent consumes its typed Selected/Cleared output and decides what application action that selection represents.',
    apiHref: 'https://foldkit.dev/ui/combobox',
    composition: 'Command child Model\n├── search input + toggle\n├── filtered action list\n│   ├── label\n│   ├── shortcut hint\n│   └── disabled/group metadata\n└── typed OutMessage to parent',
    styling: 'Command can render inline or be composed inside a Dialog for a global palette. Shortcut text is a visual hint; register global keyboard shortcuts separately in the parent program.',
    accessibility: 'The primitive supplies combobox/listbox semantics and keyboard navigation. Shortcuts do not replace accessible action labels.',
    keyboard: [['Type', 'Filters commands by their configured search text.'], ['Arrow Up / Down', 'Moves the active command.'], ['Enter', 'Emits the selected action to the parent.'], ['Escape', 'Closes the list without running an action.']],
    examples: [
      { title: 'Application commands', description: 'The parent stores the typed output; executing its domain effect remains an explicit parent decision.', preview: (model, h) => preview(model, false, h), code: source('Application commands', false) },
      { title: 'Grouped commands', description: 'Group headings and shortcut hints enrich the same complete selection architecture.', preview: (model, h) => preview(model, true, h), code: source('Grouped commands', true) },
    ],
  },
});
