import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Option } from 'effect';

import * as NavMenu from '../src/lib/nav-menu';
import * as SideNav from '../src/lib/side-nav';

const init = (config: SideNav.InitConfig = { id: 'nav' }): SideNav.Model =>
  SideNav.init(config);

describe('collapse toggle', () => {
  it('collapses and restores the last expanded width', () => {
    let model = init({ id: 'nav', isCollapsible: true, width: 300 });
    const collapsed = SideNav.update(model, SideNav.Message.ToggledSideNav());
    assert.equal(collapsed.model.isCollapsed, true);
    assert.equal(collapsed.model.lastExpandedWidth, 300);
    assert.equal(collapsed.outMessage?._tag, 'ChangedSideNavCollapse');
    assert.equal(
      (collapsed.outMessage as { isCollapsed: boolean }).isCollapsed,
      true,
    );
    const restored = SideNav.update(
      collapsed.model,
      SideNav.Message.ToggledSideNav(),
    );
    assert.equal(restored.model.isCollapsed, false);
    assert.equal(restored.model.width, 300);
  });
});

describe('drag resize', () => {
  it('clamps to min/max and tracks lastExpandedWidth', () => {
    let model = init({ id: 'nav', isResizable: true, width: 260 });
    model = SideNav.update(
      model,
      SideNav.Message.StartedSideNavResize({ x: 500 }),
    ).model;
    const widened = SideNav.update(
      model,
      SideNav.Message.DraggedSideNavResize({ x: 560, direction: 'ltr' }),
    ).model;
    assert.equal(widened.width, 320);
    const beyondMax = SideNav.update(
      model,
      SideNav.Message.DraggedSideNavResize({ x: 5000, direction: 'ltr' }),
    ).model;
    assert.equal(beyondMax.width, 480);
    const beyondMin = SideNav.update(
      model,
      SideNav.Message.DraggedSideNavResize({ x: 0, direction: 'ltr' }),
    ).model;
    assert.equal(beyondMin.width, 180);
  });

  it('flips the drag direction under rtl', () => {
    let model = init({ id: 'nav', isResizable: true, width: 260 });
    model = SideNav.update(
      model,
      SideNav.Message.StartedSideNavResize({ x: 500 }),
    ).model;
    const widened = SideNav.update(
      model,
      SideNav.Message.DraggedSideNavResize({ x: 440, direction: 'rtl' }),
    ).model;
    assert.equal(widened.width, 320);
  });

  it('collapses below the 160px threshold when collapsible', () => {
    let model = init({
      id: 'nav',
      isResizable: true,
      isCollapsible: true,
      width: 260,
    });
    model = SideNav.update(
      model,
      SideNav.Message.StartedSideNavResize({ x: 500 }),
    ).model;
    const shrunk = SideNav.update(
      model,
      SideNav.Message.DraggedSideNavResize({ x: 390, direction: 'ltr' }),
    ).model;
    assert.equal(shrunk.isCollapsed, true);
    assert.equal(SideNav.visibleWidth(shrunk), 48);
    const widened = SideNav.update(
      shrunk,
      SideNav.Message.DraggedSideNavResize({ x: 480, direction: 'ltr' }),
    ).model;
    assert.equal(widened.isCollapsed, false);
  });

  it('does not collapse below threshold when not collapsible', () => {
    let model = init({ id: 'nav', isResizable: true, width: 260 });
    model = SideNav.update(
      model,
      SideNav.Message.StartedSideNavResize({ x: 500 }),
    ).model;
    const shrunk = SideNav.update(
      model,
      SideNav.Message.DraggedSideNavResize({ x: 400, direction: 'ltr' }),
    ).model;
    assert.equal(shrunk.isCollapsed, false);
    assert.equal(shrunk.width, 180);
  });

  it('ends the drag', () => {
    let model = init({ id: 'nav', isResizable: true });
    model = SideNav.update(
      model,
      SideNav.Message.StartedSideNavResize({ x: 500 }),
    ).model;
    assert.equal(Option.isSome(model.drag), true);
    model = SideNav.update(
      model,
      SideNav.Message.EndedSideNavResize(),
    ).model;
    assert.equal(Option.isNone(model.drag), true);
  });
});

describe('keyboard resize', () => {
  it('nudges width and respects bounds', () => {
    let model = init({ id: 'nav', isResizable: true, width: 260 });
    model = SideNav.update(
      model,
      SideNav.Message.NudgedSideNavResize({ delta: 16 }),
    ).model;
    assert.equal(model.width, 276);
    model = SideNav.update(
      model,
      SideNav.Message.NudgedSideNavResize({ delta: -300 }),
    ).model;
    assert.equal(model.width, 180);
  });
});

describe('item collapse', () => {
  it('records per-item expansion and honors defaults', () => {
    let model = init();
    assert.equal(
      SideNav.isItemCollapsed(model, 'settings', false),
      false,
    );
    assert.equal(
      SideNav.isItemCollapsed(model, 'settings', true),
      true,
    );
    model = SideNav.update(
      model,
      SideNav.Message.ToggledSideNavItem({
        id: 'settings',
        isCollapsed: true,
      }),
    ).model;
    assert.equal(SideNav.isItemCollapsed(model, 'settings', false), true);
  });
});

describe('out messages', () => {
  it('reports item activation', () => {
    const model = init();
    const result = SideNav.update(
      model,
      SideNav.Message.PressedSideNavItemAction({ id: 'dashboard' }),
    );
    assert.equal(result.outMessage?._tag, 'SelectedSideNavItem');
    assert.equal(
      (result.outMessage as { id: string }).id,
      'dashboard',
    );
  });
});

describe('nested nav menus', () => {
  it('lazily creates the heading menu and folds its messages', () => {
    let model = init();
    const menu = SideNav.menuFor(model, SideNav.HEADING_MENU_KEY);
    assert.equal(NavMenu.isOpen(menu), false);
    const opened = SideNav.update(
      model,
      SideNav.Message.GotSideNavMenuMessage({
        key: SideNav.HEADING_MENU_KEY,
        message: NavMenu.Message.ActivatedNavMenuTrigger(),
      }),
    );
    model = opened.model;
    const headingMenu = SideNav.menuFor(model, SideNav.HEADING_MENU_KEY);
    assert.equal(NavMenu.isOpen(headingMenu), true);
    assert.equal(model.menus[SideNav.HEADING_MENU_KEY] !== undefined, true);
  });

  it('uses astryx delays: instant heading menu, delayed flyouts', () => {
    const model = init();
    const heading = SideNav.menuFor(model, SideNav.HEADING_MENU_KEY);
    assert.equal(heading.showDelayMs, 0);
    assert.equal(heading.clickGuardMs, 500);
    const flyout = SideNav.menuFor(model, SideNav.flyoutKey('settings'));
    assert.equal(flyout.showDelayMs, 150);
    assert.equal(flyout.closeDelayMs, 200);
    assert.equal(flyout.clickGuardMs, 0);
  });
});
