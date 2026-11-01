// @ts-nocheck: snapshot of creaseui-demo chapter-11:src/design/command-menu.ts
import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Command from '../ui/command'
import * as Dialog from '../ui/dialog'

/**
 * CommandMenu: every action and destination of the app, behind Ctrl+K.
 *
 * Rules:
 * - One menu for the whole app, in a dialog, opened with Ctrl+K (Cmd+K on a
 *   Mac) or the search button in the sidebar. Every entry also has a
 *   pointer route outside the menu (D9).
 * - Entries are grouped: actions first, then places to go, then issues by
 *   identifier and title. Typing filters all groups at once.
 * - An entry shows its keyboard shortcut when it has one, so the menu also
 *   teaches the shortcuts.
 * - Choosing an entry closes the menu and does the same thing as the button
 *   or link it stands for; the menu has no actions of its own.
 */

export const MENU_ID = 'command-menu'

export type CommandGroup = 'Actions' | 'Go to' | 'Issues'

export type CommandEntry = Readonly<{
  id: string
  label: string
  group: CommandGroup
  shortcut?: string
}>

export const initCommandMenu = (): Readonly<{
  dialog: Dialog.Model
  command: Command.Model
}> => ({
  dialog: Dialog.init({
    id: MENU_ID,
    focusSelector: `#${MENU_ID}-search-input`,
  }),
  command: Command.init({ id: `${MENU_ID}-search` }),
})

export const commandMenu = <Msg>(
  props: Readonly<{
    dialog: Dialog.Model
    command: Command.Model
    toDialogMessage: (message: Dialog.Message) => Msg
    toCommandMessage: (message: Command.Message) => Msg
    entries: ReadonlyArray<CommandEntry>
  }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const byId = new Map(props.entries.map(entry => [entry.id, entry]))
  return Dialog.dialog(
    {
      model: props.dialog,
      toParentMessage: props.toDialogMessage,
      title: 'Command menu',
      content: () => [
        Command.command(
          {
            model: props.command,
            maybeSelectedValue: Option.none(),
            restingInputValue: '',
            toParentMessage: props.toCommandMessage,
            items: props.entries.map(entry => entry.id),
            itemToConfig: id => {
              const entry = byId.get(id)
              return {
                content: entry?.label ?? id,
                searchText: `${entry?.group ?? ''} ${entry?.label ?? id}`,
                ...(entry?.shortcut === undefined
                  ? {}
                  : { shortcut: entry.shortcut }),
              }
            },
            itemGroupKey: id => byId.get(id)?.group ?? 'Actions',
            groupToHeading: group => group,
            placeholder: 'Type a command or search issues',
            ariaLabel: 'Commands and issues',
            emptyContent: 'Nothing matches',
          },
          h,
        ),
      ],
    },
    h,
  )
}
