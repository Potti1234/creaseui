import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { dropdownMenuActions, dropdownMenuFixtures, dropdownMenuLabel } from '@/docs/components/pages/dropdown-menu/shared';
import * as DropdownMenu from '@/ui/dropdown-menu';

const GotDropdownPreviewMessage = m('GotDropdownPreviewMessage', { message: DropdownMenu.Message });
type GotDropdownPreviewMessage = typeof GotDropdownPreviewMessage.Type;
const DropdownPreviewModel = S.Struct({ _docsPage: S.Literal('dropdown-menu'), dropdownMenu: DropdownMenu.Model, maybeLastAction: S.Option(S.String) });
type DropdownPreviewModel = typeof DropdownPreviewModel.Type;

export const dropdownMenuTailwindPreviewProgram = definePreviewProgram<DropdownPreviewModel, GotDropdownPreviewMessage>({
  Model: DropdownPreviewModel,
  Message: GotDropdownPreviewMessage,
  init: index => ({ _docsPage: 'dropdown-menu', dropdownMenu: DropdownMenu.init({ id: `docs-dropdown-${String(index)}`, isAnimated: false }), maybeLastAction: Option.none() }),
  update: (model, message) => {
    const [dropdownMenu, commands, maybeSelection] = DropdownMenu.update(model.dropdownMenu, message.message);
    return [{
      ...model,
      dropdownMenu,
      maybeLastAction: Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selected => Option.some(selected.value) }),
    }, Command.mapMessages(commands, next => GotDropdownPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const fixture = dropdownMenuFixtures[index] ?? dropdownMenuFixtures[0];
    return h.div([h.Class('grid justify-items-center gap-3')], [
      DropdownMenu.dropdownMenu({
      model: model.dropdownMenu,
      toParentMessage: message => GotDropdownPreviewMessage({ message }),
      trigger: 'Open account menu',
      triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',
      ariaLabel: 'Account actions',
      items: dropdownMenuActions,
      itemToConfig: action => ({
        label: dropdownMenuLabel(action),
        ...(action === 'settings' ? { shortcut: '⌘,' } : {}),
        ...(fixture.destructive && action === 'logout' ? { variant: 'destructive' as const } : {}),
        ...(fixture.submenu && action === 'billing' ? { isDisabled: true } : {}),
        ...(fixture.submenu && action === 'settings' ? { submenu: { items: ['profile', 'billing'] as const, itemToConfig: (child: typeof dropdownMenuActions[number]) => ({ label: dropdownMenuLabel(child), isDisabled: child === 'billing' }) } } : {}),
      }),
      ...(fixture.direction === 'rtl' ? { direction: 'rtl' as const } : {}),
    }, h),
    h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], [
      Option.match(model.maybeLastAction, {
        onNone: () => 'No action selected.',
        onSome: action => `Last action: ${dropdownMenuLabel(action)}`,
      }),
    ]),
    ]);
  },
});
