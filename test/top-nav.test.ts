import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import * as NavMenu from '../src/lib/nav-menu';
import * as TopNav from '../src/lib/top-nav';

const init = (): TopNav.Model => TopNav.init({ id: 'nav' });

const enterTrigger = (model: TopNav.Model, key: string): TopNav.Model =>
  TopNav.update(
    model,
    TopNav.Message.GotTopNavMenuMessage({
      key,
      message: NavMenu.Message.EnteredNavMenuTrigger(),
    }),
  ).model;

describe('menu key routing', () => {
  it('tracks menus per key with their own open state', () => {
    let model = init();
    model = enterTrigger(model, 'menu-0');
    assert.equal(model.menus['menu-0'] !== undefined, true);
    assert.equal(model.menus['menu-1'], undefined);
    assert.equal(TopNav.isMenuOpen(model, 'menu-0'), false); // showDelay pending
  });

  it('menuFor lazily inits per-kind NavMenu config', () => {
    const model = init();
    const dropdown = TopNav.menuFor(model, 'menu-0', 'dropdown');
    assert.equal(dropdown.showDelayMs, 150);
    assert.equal(dropdown.closeDelayMs, 200);
    const mega = TopNav.menuFor(model, 'menu-1', 'mega');
    assert.equal(mega.showDelayMs, 150);
    assert.equal(mega.closeDelayMs, 250);
    const heading = TopNav.menuFor(model, TopNav.HEADING_MENU_KEY, 'heading');
    assert.equal(heading.showDelayMs, 0);
    assert.equal(heading.closeDelayMs, 200);
  });

  it('remembers the menu kind once routed', () => {
    let model = init();
    model = enterTrigger(model, 'menu-0');
    assert.equal(model.menuKinds['menu-0'], 'dropdown');
  });
});

describe('open/close out messages', () => {
  const flushShow = (model: TopNav.Model, key: string): TopNav.Model => {
    const menu = model.menus[key]!;
    const result = TopNav.update(
      model,
      TopNav.Message.GotTopNavMenuMessage({
        key,
        message: NavMenu.Message.CompletedWaitBeforeShowingNavMenu({
          version: menu.showVersion,
          atMs: 0,
        }),
      }),
    );
    return result.model;
  };

  it('emits ChangedTopNavMenuOpen on open transitions only', () => {
    let model = init();
    const entered = TopNav.update(
      model,
      TopNav.Message.GotTopNavMenuMessage({
        key: 'menu-0',
        message: NavMenu.Message.EnteredNavMenuTrigger(),
      }),
    );
    assert.equal(entered.outMessage, undefined);
    model = entered.model;
    const menu = model.menus['menu-0']!;
    const shown = TopNav.update(
      model,
      TopNav.Message.GotTopNavMenuMessage({
        key: 'menu-0',
        message: NavMenu.Message.CompletedWaitBeforeShowingNavMenu({
          version: menu.showVersion,
          atMs: 0,
        }),
      }),
    );
    assert.equal(shown.outMessage?._tag, 'ChangedTopNavMenuOpen');
    assert.equal(
      (shown.outMessage as { isOpen: boolean }).isOpen,
      true,
    );
    assert.equal(TopNav.isMenuOpen(shown.model, 'menu-0'), true);
  });

  it('pressing a menu item closes the menu and emits SelectedTopNavMenuItem', () => {
    let model = init();
    model = enterTrigger(model, 'menu-0');
    model = flushShow(model, 'menu-0');
    assert.equal(TopNav.isMenuOpen(model, 'menu-0'), true);
    const pressed = TopNav.update(
      model,
      TopNav.Message.PressedTopNavMenuItem({
        menuKey: 'menu-0',
        itemTitle: 'Analytics',
      }),
    );
    assert.equal(TopNav.isMenuOpen(pressed.model, 'menu-0'), false);
    assert.equal(pressed.outMessage?._tag, 'SelectedTopNavMenuItem');
    assert.equal(
      (pressed.outMessage as { itemTitle: string }).itemTitle,
      'Analytics',
    );
  });
});

describe('item selection', () => {
  it('emits SelectedTopNavItem without touching menus', () => {
    const model = init();
    const pressed = TopNav.update(
      model,
      TopNav.Message.PressedTopNavItem({ id: 'Home' }),
    );
    assert.equal(pressed.outMessage?._tag, 'SelectedTopNavItem');
    assert.equal(
      (pressed.outMessage as { id: string }).id,
      'Home',
    );
    assert.equal(pressed.model.menus['menu-0'], undefined);
  });
});
