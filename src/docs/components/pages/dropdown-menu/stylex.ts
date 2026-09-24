import { Option } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { dropdownMenuActions, dropdownMenuFixtures, dropdownMenuLabel } from '@/docs/components/pages/dropdown-menu/shared';
import * as DropdownMenu from '@/stylex/dropdown-menu';

const styles = stylex.create({
  frame: { gap: '0.75rem', display: 'grid', justifyItems: 'center' },
  status: { color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: '1.25rem' },
});

export const dropdownMenuStyleXPreview: StyleXExamplePreviewProvider = <Msg>(exampleIndex: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = dropdownMenuFixtures[exampleIndex] ?? dropdownMenuFixtures[0];
  const previewModel = model as { dropdownMenu: DropdownMenu.Model; maybeLastAction: Option.Option<string> };
  return h.div([h.Class(stylex.props(styles.frame).className ?? '')], [
    DropdownMenu.dropdownMenu({
    model: previewModel.dropdownMenu,
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
  }, h),
    h.p([h.Role('status'), h.Class(stylex.props(styles.status).className ?? '')], [
      Option.match(previewModel.maybeLastAction, {
        onNone: () => 'No action selected.',
        onSome: action => `Last action: ${dropdownMenuLabel(action)}`,
      }),
    ]),
  ]);
};
