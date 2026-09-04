import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { menubarActions, menubarFixtures, menubarLabel, menubarLabels, type MenubarTarget } from '@/docs/components/pages/menubar/shared';
import type * as DropdownMenu from '@/stylex/dropdown-menu';
import * as Menubar from '@/stylex/menubar';

type PreviewModel = Readonly<{ menubar: Menubar.Model; file: DropdownMenu.Model; edit: DropdownMenu.Model; view: DropdownMenu.Model }>;

export const menubarStyleXPreview: StyleXExamplePreviewProvider = <Msg>(exampleIndex: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const preview = model as PreviewModel;
  const fixture = menubarFixtures[exampleIndex] ?? menubarFixtures[0];
  return Menubar.menubar<string, Msg>({
    model: preview.menubar,
    toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotMenubarBehaviorPreview', message })),
    ariaLabel: 'Application menu',
    ...(fixture.direction === 'rtl' ? { direction: 'rtl' as const } : {}),
    menus: menubarLabels.map(([target, label]) => ({
      id: `docs-menubar-${target}`, label, model: preview[target],
      toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotMenubarPreviewMessage', target: target as MenubarTarget, message })),
      items: menubarActions,
      itemToConfig: item => ({ label: menubarLabel(item), ...(item === 'save' ? { shortcut: '⌘S', isDisabled: true } : {}), ...(item === 'export' ? { submenu: { items: ['pdf', 'csv'], itemToConfig: child => ({ label: child.toUpperCase() }) } } : {}) }),
    })),
  }, h);
};
