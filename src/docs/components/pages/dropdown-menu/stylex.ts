import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { dropdownMenuActions, dropdownMenuFixtures, dropdownMenuLabel } from '@/docs/components/pages/dropdown-menu/shared';
import * as DropdownMenu from '@/stylex/dropdown-menu';

export const dropdownMenuStyleXPreview: StyleXExamplePreviewProvider = <Msg>(exampleIndex: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = dropdownMenuFixtures[exampleIndex] ?? dropdownMenuFixtures[0];
  const dropdownMenu = (model as { dropdownMenu: DropdownMenu.Model }).dropdownMenu;
  return DropdownMenu.dropdownMenu({
    model: dropdownMenu,
    toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotDropdownPreviewMessage', message })),
    trigger: 'Open account menu',
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
};
