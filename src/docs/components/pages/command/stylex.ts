import { Option } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { commandActions, commandFixtures, commandLabel } from '@/docs/components/pages/command/shared';
import * as CommandMenu from '@/stylex/command';

const styles = stylex.create({ command: { width: '100%', maxWidth: '28rem' } });

export const commandStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = commandFixtures[index] ?? commandFixtures[0];
  const preview = model as { command: CommandMenu.Model; maybeAction: Option.Option<string> };
  return CommandMenu.create<string>().command({
    model: preview.command, maybeSelectedValue: preview.maybeAction,
    restingInputValue: Option.match(preview.maybeAction, { onNone: () => '', onSome: commandLabel }),
    toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotCommandPreviewMessage', message })), layoutStyle: styles.command,
    items: fixture.mode === 'empty' ? [] : commandActions,
    itemToConfig: action => ({ content: commandLabel(action), ...(action === 'settings' ? { shortcut: '⌘,' } : {}) }),
    placeholder: 'Type a command or search…', ariaLabel: 'Application commands',
    ...(fixture.grouped ? { itemGroupKey: (action: string) => action === 'settings' ? 'System' : 'Navigation', groupToHeading: (group: string) => group } : {}),
    ...(fixture.mode === 'empty' ? { emptyContent: 'No matching application commands.' } : {}),
    ...(fixture.mode === 'loading' ? { status: 'loading' as const, loadingContent: 'Loading remote commands…' } : {}),
    ...(fixture.mode === 'limited' ? { maxVisibleItems: 2 } : {}),
  }, h);
};
