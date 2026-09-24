import { Option } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { menubarActions, menubarFixtures, menubarLabel, menubarLabels, type MenubarTarget } from '@/docs/components/pages/menubar/shared';
import type * as DropdownMenu from '@/stylex/dropdown-menu';
import * as Menubar from '@/stylex/menubar';
import { tokens } from '../../../../stylex/tokens.stylex';

const styles = stylex.create({ frame: { gap: '0.75rem', display: 'grid', justifyItems: 'center', }, status: { color: tokens.mutedForeground, fontSize: '0.875rem', lineHeight: '1.25rem' } });

type PreviewModel = Readonly<{ menubar: Menubar.Model; file: DropdownMenu.Model; edit: DropdownMenu.Model; view: DropdownMenu.Model; maybeLastAction: Option.Option<string> }>;

export const menubarStyleXPreview: StyleXExamplePreviewProvider = <Msg>(exampleIndex: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const preview = model as PreviewModel;
  const fixture = menubarFixtures[exampleIndex] ?? menubarFixtures[0];
  return h.div([h.Class(stylex.props(styles.frame).className ?? '')], [
    Menubar.menubar<string, Msg>({
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
    }, h),
    h.p([h.Role('status'), h.Class(stylex.props(styles.status).className ?? '')], [
      Option.match(preview.maybeLastAction, {
        onNone: () => 'No action selected.',
        onSome: action => `Last action: ${menubarLabel(action)}`,
      }),
    ]),
  ]);
};
