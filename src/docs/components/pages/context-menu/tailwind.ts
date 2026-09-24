import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { contextMenuActions, contextMenuLabel } from '@/docs/components/pages/context-menu/shared';
import * as ContextMenu from '@/ui/context-menu';

const GotContextMenuPreviewMessage = defineMessageUnion({
  GotContextMenuPreviewMessage: { message: ContextMenu.Message },
});
type GotContextMenuPreviewMessage = typeof GotContextMenuPreviewMessage.Type;
const ContextMenuPreviewModel = S.Struct({ _docsPage: S.Literal('context-menu'), contextMenu: ContextMenu.Model, maybeLastAction: S.Option(S.String) });
type ContextMenuPreviewModel = typeof ContextMenuPreviewModel.Type;

export const contextMenuTailwindPreviewProgram = definePreviewProgram<ContextMenuPreviewModel, GotContextMenuPreviewMessage>({
  Model: ContextMenuPreviewModel,
  Message: GotContextMenuPreviewMessage,
  init: index => ({ _docsPage: 'context-menu', contextMenu: ContextMenu.init({ id: `docs-context-menu-${String(index)}` }), maybeLastAction: Option.none() }),
  update: (model, message) => {
    const contextMenuOp__ = ContextMenu.update(model.contextMenu, message.message);
    const contextMenu = contextMenuOp__.model;
    const commands = contextMenuOp__.commands ?? [];
    const maybeSelection = Option.fromNullishOr(contextMenuOp__.outMessage);;
    return { model: {
      ...model,
      contextMenu,
      maybeLastAction: Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selected => Option.some(selected.value) }),
    }, commands: Command.mapMessages(commands, next => GotContextMenuPreviewMessage.GotContextMenuPreviewMessage({ message: next })) };
  },
  view: (_index, model, h) => h.div([h.Class('grid justify-items-center gap-3')], [
    ContextMenu.contextMenu({
      model: model.contextMenu,
      toParentMessage: message => GotContextMenuPreviewMessage.GotContextMenuPreviewMessage({ message }),
      class: 'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm',
      trigger: 'Right click here',
      ariaLabel: 'Browser actions',
      items: contextMenuActions,
      itemToConfig: action => ({ label: contextMenuLabel(action), ...(action === 'forward' ? { isDisabled: true } : {}) }),
    }, h),
    h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], [
      Option.match(model.maybeLastAction, {
        onNone: () => 'No action selected.',
        onSome: action => `Last action: ${contextMenuLabel(action)}`,
      }),
    ]),
  ]),
});
