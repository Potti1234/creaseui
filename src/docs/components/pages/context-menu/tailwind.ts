import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { contextMenuActions, contextMenuLabel } from '@/docs/components/pages/context-menu/shared';
import * as ContextMenu from '@/ui/context-menu';

const GotContextMenuPreviewMessage = m('GotContextMenuPreviewMessage', { message: ContextMenu.Message });
type GotContextMenuPreviewMessage = typeof GotContextMenuPreviewMessage.Type;
const ContextMenuPreviewModel = S.Struct({ _docsPage: S.Literal('context-menu'), contextMenu: ContextMenu.Model });
type ContextMenuPreviewModel = typeof ContextMenuPreviewModel.Type;

export const contextMenuTailwindPreviewProgram = definePreviewProgram<ContextMenuPreviewModel, GotContextMenuPreviewMessage>({
  Model: ContextMenuPreviewModel,
  Message: GotContextMenuPreviewMessage,
  init: index => ({ _docsPage: 'context-menu', contextMenu: ContextMenu.init({ id: `docs-context-menu-${String(index)}` }) }),
  update: (model, message) => {
    const [contextMenu, commands] = ContextMenu.update(model.contextMenu, message.message);
    return [{ ...model, contextMenu }, Command.mapMessages(commands, next => GotContextMenuPreviewMessage({ message: next }))];
  },
  view: (_index, model, h) => ContextMenu.contextMenu({
    model: model.contextMenu,
    toParentMessage: message => GotContextMenuPreviewMessage({ message }),
    class: 'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm',
    trigger: 'Right click here',
    ariaLabel: 'Browser actions',
    items: contextMenuActions,
    itemToConfig: action => ({ label: contextMenuLabel(action), ...(action === 'forward' ? { isDisabled: true } : {}) }),
  }, h),
});
