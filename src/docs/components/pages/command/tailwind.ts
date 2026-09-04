import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { commandActions, commandFixtures, commandLabel } from '@/docs/components/pages/command/shared';
import * as CommandMenu from '@/ui/command';

const GotCommandPreviewMessage = m('GotCommandPreviewMessage', { message: CommandMenu.Message });
type GotCommandPreviewMessage = typeof GotCommandPreviewMessage.Type;
const PreviewActionSchema = S.Literals(['calendar', 'search', 'settings']);
const CommandPreviewModel = S.Struct({ _docsPage: S.Literal('command'), command: CommandMenu.Model, maybeAction: S.Option(PreviewActionSchema) });
type CommandPreviewModel = typeof CommandPreviewModel.Type;
type PreviewAction = typeof commandActions[number];
const PreviewCommand = CommandMenu.create<PreviewAction>();

export const commandTailwindPreviewProgram = definePreviewProgram<CommandPreviewModel, GotCommandPreviewMessage>({
  Model: CommandPreviewModel, Message: GotCommandPreviewMessage,
  init: index => ({ _docsPage: 'command', command: CommandMenu.init({ id: `docs-command-${String(index)}`, isAnimated: true }), maybeAction: Option.none() }),
  update: (model, message) => {
    const [command, commands, maybeSelection] = PreviewCommand.update(model.command, message.message);
    const maybeAction = Option.match(maybeSelection, { onNone: () => model.maybeAction, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<PreviewAction>() });
    return [{ ...model, command, maybeAction }, Command.mapMessages(commands, next => GotCommandPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const fixture = commandFixtures[index] ?? commandFixtures[0];
    return PreviewCommand.command({
      model: model.command, maybeSelectedValue: model.maybeAction,
      restingInputValue: Option.match(model.maybeAction, { onNone: () => '', onSome: commandLabel }),
      toParentMessage: message => GotCommandPreviewMessage({ message }), class: 'w-full max-w-md border shadow-md',
      items: fixture.mode === 'empty' ? [] : commandActions,
      itemToConfig: action => ({ content: commandLabel(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}) }),
      placeholder: 'Type a command or search…', ariaLabel: 'Application commands',
      ...(fixture.grouped ? { itemGroupKey: (action: PreviewAction) => action === 'settings' ? 'System' : 'Navigation', groupToHeading: (group: string) => group } : {}),
      ...(fixture.mode === 'empty' ? { emptyContent: 'No matching application commands.' } : {}),
      ...(fixture.mode === 'loading' ? { status: 'loading' as const, loadingContent: 'Loading remote commands…' } : {}),
      ...(fixture.mode === 'limited' ? { maxVisibleItems: 2 } : {}),
    }, h);
  },
});
