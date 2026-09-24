import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { menubarActions, menubarFixtures, menubarLabel, menubarLabels, menubarTargets, type MenubarTarget } from '@/docs/components/pages/menubar/shared';
import * as DropdownMenu from '@/ui/dropdown-menu';
import * as Menubar from '@/ui/menubar';

const MenuTarget = S.Literals(['file', 'edit', 'view']);


const MenubarPreviewMessage = defineMessageUnion({
  GotMenubarPreviewMessage: { target: MenuTarget, message: DropdownMenu.Message },
  GotMenubarBehaviorPreview: { message: Menubar.Message },
});
type MenubarPreviewMessage = typeof MenubarPreviewMessage.Type;
const MenubarPreviewModel = S.Struct({ _docsPage: S.Literal('menubar'), menubar: Menubar.Model, file: DropdownMenu.Model, edit: DropdownMenu.Model, view: DropdownMenu.Model, maybeLastAction: S.Option(S.String) });
type MenubarPreviewModel = typeof MenubarPreviewModel.Type;
const ActionMenu = DropdownMenu.create<string>();

export const menubarTailwindPreviewProgram = definePreviewProgram<MenubarPreviewModel, MenubarPreviewMessage>({
  Model: MenubarPreviewModel,
  Message: MenubarPreviewMessage,
  init: index => ({ _docsPage: 'menubar', menubar: Menubar.init({ id: `docs-menubar-${String(index)}` }), file: DropdownMenu.init({ id: `docs-menubar-file-${String(index)}` }), edit: DropdownMenu.init({ id: `docs-menubar-edit-${String(index)}` }), view: DropdownMenu.init({ id: `docs-menubar-view-${String(index)}` }), maybeLastAction: Option.none() }),
  update: (model, message) => {
    if (message._tag === 'GotMenubarBehaviorPreview') {
      const menubarOp__ = Menubar.update(model.menubar, message.message);
    const menubar = menubarOp__.model;
    const commands = menubarOp__.commands ?? [];
    const maybeMove = Option.fromNullishOr(menubarOp__.outMessage);;
      const index = Option.match(maybeMove, { onNone: () => menubar.activeIndex, onSome: move => move.index });
      const target = menubarTargets[index];
      if (target === undefined) return { model: model };
      const { model: file } = target === 'file' ? DropdownMenu.open(model.file) : DropdownMenu.close(model.file);
      const { model: edit } = target === 'edit' ? DropdownMenu.open(model.edit) : DropdownMenu.close(model.edit);
      const { model: view } = target === 'view' ? DropdownMenu.open(model.view) : DropdownMenu.close(model.view);
      return { model: { ...model, file, edit, view, menubar }, commands: Command.mapMessages(commands, next => MenubarPreviewMessage.GotMenubarBehaviorPreview({ message: next })) };
    }
    const menuOp__ = ActionMenu.update(model[message.target], message.message);
    const menu = menuOp__.model;
    const commands = menuOp__.commands ?? [];
    const maybeSelection = Option.fromNullishOr(menuOp__.outMessage);;
    const file = message.target === 'file' ? menu : DropdownMenu.close(model.file).model;
    const edit = message.target === 'edit' ? menu : DropdownMenu.close(model.edit).model;
    const view = message.target === 'view' ? menu : DropdownMenu.close(model.view).model;
    return { model: { ...model, file, edit, view, maybeLastAction: Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selection => Option.some(selection.value) }) }, commands: Command.mapMessages(commands, next => MenubarPreviewMessage.GotMenubarPreviewMessage({ target: message.target, message: next })) };
  },
  view: (index, model, h) => h.div([h.Class('grid justify-items-center gap-3')], [
    Menubar.menubar<string, MenubarPreviewMessage>({
    model: model.menubar,
    toParentMessage: message => MenubarPreviewMessage.GotMenubarBehaviorPreview({ message }),
    ariaLabel: 'Application menu',
    ...(menubarFixtures[index]?.direction === 'rtl' ? { direction: 'rtl' as const } : {}),
    menus: menubarLabels.map(([target, label]) => ({
      id: `docs-menubar-${target}`, label, model: model[target],
      toParentMessage: message => MenubarPreviewMessage.GotMenubarPreviewMessage({ target: target as MenubarTarget, message }),
      items: menubarActions,
      itemToConfig: item => ({ label: menubarLabel(item), ...(item === 'save' ? { shortcut: '⌘S', isDisabled: true } : {}), ...(item === 'export' ? { submenu: { items: ['pdf', 'csv'], itemToConfig: child => ({ label: child.toUpperCase() }) } } : {}) }),
    })),
    }, h),
    h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], [
      Option.match(model.maybeLastAction, {
        onNone: () => 'No action selected.',
        onSome: action => `Last action: ${menubarLabel(action)}`,
      }),
    ]),
  ]),
});
