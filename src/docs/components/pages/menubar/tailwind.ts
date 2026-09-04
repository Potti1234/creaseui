import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { menubarActions, menubarFixtures, menubarLabel, menubarLabels, menubarTargets, type MenubarTarget } from '@/docs/components/pages/menubar/shared';
import * as DropdownMenu from '@/ui/dropdown-menu';
import * as Menubar from '@/ui/menubar';

const MenuTarget = S.Literals(['file', 'edit', 'view']);
const GotMenubarPreviewMessage = m('GotMenubarPreviewMessage', { target: MenuTarget, message: DropdownMenu.Message });
const GotMenubarBehaviorPreview = m('GotMenubarBehaviorPreview', { message: Menubar.Message });
const MenubarPreviewMessage = S.Union([GotMenubarPreviewMessage, GotMenubarBehaviorPreview]);
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
      const [menubar, commands, maybeMove] = Menubar.update(model.menubar, message.message);
      const index = Option.match(maybeMove, { onNone: () => menubar.activeIndex, onSome: move => move.index });
      const target = menubarTargets[index];
      if (target === undefined) return [model, []];
      const [file] = target === 'file' ? DropdownMenu.open(model.file) : DropdownMenu.close(model.file);
      const [edit] = target === 'edit' ? DropdownMenu.open(model.edit) : DropdownMenu.close(model.edit);
      const [view] = target === 'view' ? DropdownMenu.open(model.view) : DropdownMenu.close(model.view);
      return [{ ...model, file, edit, view, menubar }, Command.mapMessages(commands, next => GotMenubarBehaviorPreview({ message: next }))];
    }
    const [menu, commands, maybeSelection] = ActionMenu.update(model[message.target], message.message);
    return [{ ...model, [message.target]: menu, maybeLastAction: Option.match(maybeSelection, { onNone: () => model.maybeLastAction, onSome: selection => Option.some(selection.value) }) }, Command.mapMessages(commands, next => GotMenubarPreviewMessage({ target: message.target, message: next }))];
  },
  view: (index, model, h) => Menubar.menubar<string, MenubarPreviewMessage>({
    model: model.menubar,
    toParentMessage: message => GotMenubarBehaviorPreview({ message }),
    ariaLabel: 'Application menu',
    ...(menubarFixtures[index]?.direction === 'rtl' ? { direction: 'rtl' as const } : {}),
    menus: menubarLabels.map(([target, label]) => ({
      id: `docs-menubar-${target}`, label, model: model[target],
      toParentMessage: message => GotMenubarPreviewMessage({ target: target as MenubarTarget, message }),
      items: menubarActions,
      itemToConfig: item => ({ label: menubarLabel(item), ...(item === 'save' ? { shortcut: '⌘S', isDisabled: true } : {}), ...(item === 'export' ? { submenu: { items: ['pdf', 'csv'], itemToConfig: child => ({ label: child.toUpperCase() }) } } : {}) }),
    })),
  }, h),
});
