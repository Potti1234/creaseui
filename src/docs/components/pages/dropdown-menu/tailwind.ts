import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { dropdownMenuActions, dropdownMenuFixtures, dropdownMenuLabel } from '@/docs/components/pages/dropdown-menu/shared';
import * as DropdownMenu from '@/ui/dropdown-menu';

const GotDropdownPreviewMessage = m('GotDropdownPreviewMessage', { message: DropdownMenu.Message });
type GotDropdownPreviewMessage = typeof GotDropdownPreviewMessage.Type;
const DropdownPreviewModel = S.Struct({ _docsPage: S.Literal('dropdown-menu'), dropdownMenu: DropdownMenu.Model });
type DropdownPreviewModel = typeof DropdownPreviewModel.Type;

export const dropdownMenuTailwindPreviewProgram = definePreviewProgram<DropdownPreviewModel, GotDropdownPreviewMessage>({
  Model: DropdownPreviewModel,
  Message: GotDropdownPreviewMessage,
  init: index => ({ _docsPage: 'dropdown-menu', dropdownMenu: DropdownMenu.init({ id: `docs-dropdown-${String(index)}`, isAnimated: false }) }),
  update: (model, message) => {
    const [dropdownMenu, commands] = DropdownMenu.update(model.dropdownMenu, message.message);
    return [{ ...model, dropdownMenu }, Command.mapMessages(commands, next => GotDropdownPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const fixture = dropdownMenuFixtures[index] ?? dropdownMenuFixtures[0];
    return DropdownMenu.dropdownMenu({
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
    }, h);
  },
});
