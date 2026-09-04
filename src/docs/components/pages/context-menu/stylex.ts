import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { contextMenuActions, contextMenuLabel } from '@/docs/components/pages/context-menu/shared';
import * as ContextMenu from '@/stylex/context-menu';

const styles = stylex.create({
  target: { height: '10rem', width: '18rem' },
});

export const contextMenuStyleXPreview: StyleXExamplePreviewProvider = <Msg>(_exampleIndex: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const contextMenu = (model as { contextMenu: ContextMenu.Model }).contextMenu;
  return ContextMenu.contextMenu({
    model: contextMenu,
    toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotContextMenuPreviewMessage', message })),
    layoutStyle: styles.target,
    trigger: 'Right click here',
    ariaLabel: 'Browser actions',
    items: contextMenuActions,
    itemToConfig: action => ({ label: contextMenuLabel(action), ...(action === 'forward' ? { isDisabled: true } : {}) }),
  }, h);
};
