import { Option } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { contextMenuActions, contextMenuLabel } from '@/docs/components/pages/context-menu/shared';
import * as ContextMenu from '@/stylex/context-menu';

const styles = stylex.create({
  frame: { gap: '0.75rem', display: 'grid', justifyItems: 'center' },
  status: { color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: '1.25rem' },
  target: { height: '10rem', width: '18rem' },
});

export const contextMenuStyleXPreview: StyleXExamplePreviewProvider = <Msg>(_exampleIndex: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const previewModel = model as { contextMenu: ContextMenu.Model; maybeLastAction: Option.Option<string> };
  return h.div([h.Class(stylex.props(styles.frame).className ?? '')], [
    ContextMenu.contextMenu({
      model: previewModel.contextMenu,
      toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotContextMenuPreviewMessage', message })),
      layoutStyle: styles.target,
      trigger: 'Right click here',
      ariaLabel: 'Browser actions',
      items: contextMenuActions,
      itemToConfig: action => ({ label: contextMenuLabel(action), ...(action === 'forward' ? { isDisabled: true } : {}) }),
    }, h),
    h.p([h.Role('status'), h.Class(stylex.props(styles.status).className ?? '')], [
      Option.match(previewModel.maybeLastAction, {
        onNone: () => 'No action selected.',
        onSome: action => `Last action: ${contextMenuLabel(action)}`,
      }),
    ]),
  ]);
};
