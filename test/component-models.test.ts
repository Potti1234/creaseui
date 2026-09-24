import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Option } from 'effect';

import * as Carousel from '../src/ui/carousel.ts';
import * as ContextMenu from '../src/ui/context-menu.ts';
import * as Drawer from '../src/ui/drawer.ts';
import * as DropdownMenuBehavior from '../src/lib/dropdown-menu-behavior.ts';
import * as DropdownMenu from '../src/ui/dropdown-menu.ts';
import * as HoverCard from '../src/ui/hover-card.ts';
import * as Resizable from '../src/ui/resizable.ts';
import * as Sidebar from '../src/ui/sidebar.ts';
import * as Sonner from '../src/ui/sonner.ts';

describe('stateful component models', () => {
  it('bounds carousel navigation at the available slides', () => {
    const model = Carousel.init('gallery', 3);
    assert.equal(Carousel.update(model, Carousel.Message.WentTo({ index: -99 })).index, 0);
    assert.equal(
      Carousel.update(model, Carousel.Message.WentTo({ index: 99 })).index,
      2,
    );
    assert.equal(
      Carousel.update({ ...model, index: 1 }, Carousel.Message.WentTo({ index: 99 })).index,
      2,
    );
  });

  it('clamps resizable panels and ends pointer drags', () => {
    const started = Resizable.update(
      Resizable.init('panels', 50),
      Resizable.Message.StartedResize({ position: 100 }),
    );
    const dragged = Resizable.update(
      started,
      Resizable.Message.DraggedResize({ position: 1000, extent: 500 }),
    );
    assert.equal(dragged.firstSize, 90);
    assert.equal(
      Option.isNone(Resizable.update(dragged, Resizable.Message.EndedResize()).drag),
      true,
    );
  });

  it('resizes adjacent panels without changing the group total', () => {
    const initial = Resizable.initGroup('group', 3, [25, 50, 25]);
    const started = Resizable.updateGroup(
      initial,
      Resizable.GroupMessage.StartedGroupResize({ handle: 1, position: 0 }),
    );
    const dragged = Resizable.updateGroup(
      started,
      Resizable.GroupMessage.DraggedGroupResize({
        position: 200,
        extent: 1000,
        minSize: 10,
      }),
    );
    assert.deepEqual(dragged.sizes.map(Math.round), [25, 65, 10]);
    assert.equal(
      Math.round(dragged.sizes.reduce((sum, size) => sum + size, 0)),
      100,
    );
  });

  it('emits typed dropdown selections and closes the menu', () => {
    const Menu = DropdownMenu.create<'profile' | 'billing'>();
    const op1__ = Menu.open(DropdownMenu.init({ id: 'account' })); const opened = op1__.model;;
    const op2__ = Menu.update(
      opened,
      DropdownMenu.Message.ActivatedItem({ index: 1 }),
    ); const active = op2__.model;
    const op3__ = Menu.selectItem(active, 'billing', 1); const closed = op3__.model; const selection = op3__.outMessage;;
    assert.equal(closed.isOpen, false);
    assert.deepEqual(selection, {
      _tag: 'Selected',
      value: 'billing',
      index: 1,
    });
  });

  it('shares disabled traversal, typeahead, and submenu routing across menu skins', () => {
    const items = ['profile', 'billing', 'settings', 'more'] as const;
    const itemToBehavior = (item: typeof items[number]) => ({
      label: item,
      isDisabled: item === 'billing',
      ...(item === 'more'
        ? {
            submenu: {
              items: ['invite', 'remove'],
              itemToBehavior: (child: string) => ({
                label: child,
                isDisabled: child === 'remove',
              }),
            },
          }
        : {}),
    });
    const model = DropdownMenu.init({ id: 'account' });

    assert.deepEqual(
      DropdownMenuBehavior.keyMessage(model, items, itemToBehavior, 'ArrowDown'),
      { _tag: 'ActivatedItem', index: 2 },
    );
    assert.deepEqual(
      DropdownMenuBehavior.keyMessage(model, items, itemToBehavior, 's'),
      { _tag: 'ActivatedItem', index: 2 },
    );
    const submenuModel = {
      ...model,
      activeIndex: 3,
      openSubmenuIndex: Option.some(3),
    };
    assert.deepEqual(
      DropdownMenuBehavior.keyMessage(
        submenuModel,
        items,
        itemToBehavior,
        'ArrowDown',
      ),
      { _tag: 'ActivatedSubmenuItem', index: 0 },
    );
    assert.deepEqual(
      DropdownMenuBehavior.keyMessage(submenuModel, items, itemToBehavior, 'Escape'),
      { _tag: 'Closed' },
    );
    assert.deepEqual(
      DropdownMenuBehavior.keyMessage(
        submenuModel,
        items,
        itemToBehavior,
        'ArrowRight',
        'rtl',
      ),
      { _tag: 'ClosedSubmenu' },
    );
  });

  it('keeps a context menu anchored to the secondary-click coordinates', () => {
    const op4__ = ContextMenu.update(
      ContextMenu.init({ id: 'context' }),
      DropdownMenu.Message.AnchoredAt({ x: 144, y: 233 }),
    ); const anchored = op4__.model;
    assert.equal(anchored.isOpen, false);
    const op5__ = ContextMenu.update(
      anchored,
      DropdownMenu.Message.OpenedFromContext(),
    ); const opened = op5__.model;
    assert.equal(opened.isOpen, true);
    assert.equal(Option.getOrUndefined(opened.anchorX), 144);
    assert.equal(Option.getOrUndefined(opened.anchorY), 233);
    const op6__ = ContextMenu.update(opened, DropdownMenu.Message.Closed()); const closed = op6__.model;;
    assert.equal(Option.isNone(closed.anchorX), true);
    assert.equal(Option.isNone(closed.anchorY), true);
  });

  it('keeps hover cards open when a stale close delay completes', () => {
    const op7__ = HoverCard.update(
      HoverCard.init({ id: 'profile' }),
      HoverCard.Message.EnteredHoverCard(),
    ); const hovering = op7__.model;
    const op8__ = HoverCard.update(
      hovering,
      HoverCard.Message.CompletedWaitBeforeShowingHoverCard({ version: hovering.showVersion }),
    ); const opened = op8__.model;
    const op9__ = HoverCard.update(opened, HoverCard.Message.LeftHoverCard()); const leaving = op9__.model;;
    const staleVersion = leaving.closeVersion;
    const op10__ = HoverCard.update(leaving, HoverCard.Message.EnteredHoverCard()); const reentered = op10__.model;;
    const op11__ = HoverCard.update(
      reentered,
      HoverCard.Message.CompletedWaitBeforeClosingHoverCard({ version: staleVersion }),
    ); const current = op11__.model;
    assert.equal(current.isOpen, true);
  });

  it('stores toast payloads and exposes caller-addressable actions', () => {
    const { model, commands = [] } = Sonner.show(
      Sonner.init({ id: 'notifications' }),
      Sonner.success({ title: 'Saved', actionLabel: 'Undo', sticky: true }),
    );
    assert.equal(commands.length, 0);
    assert.equal(model.entries[0]?.payload.actionLabel, 'Undo');
    const { model: empty, outMessage: dismissed } = Sonner.dismiss(
      model,
      model.entries[0]?.id ?? '',
    );
    assert.equal(empty.entries.length, 0);
    assert.equal(dismissed?._tag, 'DismissedToast');
  });

  it('persists desktop sidebar toggles and separates mobile state', () => {
    const op12__ = Sidebar.update(
      { isOpen: true, isMobileOpen: false, storageKey: 'sidebar-test' },
      Sidebar.Message.Toggled(),
    ); const collapsed = op12__.model; const commands = op12__.commands ?? [];
    assert.equal(collapsed.isOpen, false);
    assert.equal(commands.length, 1);
    const op13__ = Sidebar.update(collapsed, Sidebar.Message.ToggledMobile()); const mobile = op13__.model;;
    assert.equal(mobile.isMobileOpen, true);
    assert.equal(mobile.isOpen, false);
  });

  it('initializes sidebar state only from explicit configuration', () => {
    assert.equal(Sidebar.init().isOpen, true);
    assert.equal(Sidebar.init({ defaultOpen: false }).isOpen, false);
  });

  it('tracks drawer drag distance and resets below the dismissal threshold', () => {
    const model = Drawer.init({ id: 'filters', isAnimated: true });
    const op14__ = Drawer.update(
      model,
      Drawer.Message.StartedDrawerDrag({ position: 20, timeStamp: 0 }),
    ); const started = op14__.model;
    const op15__ = Drawer.update(started, Drawer.Message.DraggedDrawer({ offset: 80, timeStamp: 200 })); const dragged = op15__.model;;
    const op16__ = Drawer.update(dragged, Drawer.Message.EndedDrawerDrag()); const settled = op16__.model;;
    assert.equal(settled.dragOffset, 0);
    assert.equal(Option.isNone(settled.dragStart), true);
    assert.equal(settled.snapDecision, 'ReturnOpen');
  });
});
