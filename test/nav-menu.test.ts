import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Option } from 'effect'

import * as Popup from '../src/lib/behaviors/popup'
import * as NavMenu from '../src/lib/nav-menu'

const init = (
  config: Partial<NavMenu.InitConfig> & { id: string } = { id: 'menu' },
): NavMenu.Model => NavMenu.init(config)

const assertPinned = (model: NavMenu.Model): void => {
  assert.equal(NavMenu.isOpen(model), true)
  assert.ok(Option.isNone(model.hoverOpenedAtMs))
}

/** Applies a message then immediately completes any pending show/close timer
    at the given timestamp — the runtime would do this via commands. */
const flushShow = (model: NavMenu.Model, atMs: number): NavMenu.Model =>
  NavMenu.update(
    model,
    NavMenu.Message.CompletedWaitBeforeShowingNavMenu({
      version: model.showVersion,
      atMs,
    }),
  ).model

const flushClose = (model: NavMenu.Model): NavMenu.Model =>
  NavMenu.update(
    model,
    NavMenu.Message.CompletedWaitBeforeClosingNavMenu({
      version: model.closeVersion,
      atMs: 99999,
    }),
  ).model

describe('hover intent', () => {
  it('schedules open on enter and completes after the delay', () => {
    let model = init()
    const entered = NavMenu.update(
      model,
      NavMenu.Message.EnteredNavMenuTrigger(),
    )
    // enter arms a stamp command; simulate the recorded enter
    model = NavMenu.update(
      entered.model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 1000 }),
    ).model
    assert.equal(NavMenu.isOpen(model), false)
    assert.deepEqual(model.popup, Popup.init())
    model = flushShow(model, 1150)
    assert.deepEqual(model.popup, Popup.init({ defaultOpen: true }))
    assert.deepEqual(model.hoverOpenedAtMs, Option.some(1150))
  })

  it('cancels the pending show when the pointer leaves before the delay', () => {
    let model = init()
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuTrigger()).model
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 1000 }),
    ).model
    const pendingShowVersion = model.showVersion
    model = NavMenu.update(model, NavMenu.Message.LeftNavMenuTrigger()).model
    // a stale completion for the old version must not open
    model = NavMenu.update(
      model,
      NavMenu.Message.CompletedWaitBeforeShowingNavMenu({
        version: pendingShowVersion,
        atMs: 1150,
      }),
    ).model
    assert.equal(NavMenu.isOpen(model), false)
  })

  it('schedules close on trigger leave and cancels on panel enter', () => {
    let model = init()
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuTrigger()).model
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 1000 }),
    ).model
    model = flushShow(model, 1150)
    assert.equal(NavMenu.isOpen(model), true)
    // leave trigger → pending close at this version
    const left = NavMenu.update(model, NavMenu.Message.LeftNavMenuTrigger())
    model = left.model
    const pendingCloseVersion = model.closeVersion
    // cross into panel before close completes → the pending close is stale
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuPanel()).model
    model = NavMenu.update(
      model,
      NavMenu.Message.CompletedWaitBeforeClosingNavMenu({
        version: pendingCloseVersion,
        atMs: 99999,
      }),
    ).model
    assert.equal(NavMenu.isOpen(model), true)
  })

  it('closes on panel leave', () => {
    let model = init({ id: 'menu', showDelayMs: 0 })
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuTrigger()).model
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 1000 }),
    ).model
    model = flushShow(model, 1000)
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuPanel()).model
    model = NavMenu.update(model, NavMenu.Message.LeftNavMenuPanel()).model
    model = flushClose(model)
    assert.equal(Popup.isMounted(model.popup), false)
    assert.ok(Option.isNone(model.hoverOpenedAtMs))
    assert.ok(Option.isNone(model.lastClosedAtMs))
  })
})

describe('click semantics', () => {
  it('pointer click on a closed trigger pins it open', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    assertPinned(model)
  })

  it('pointer click on a hover-opened trigger pins it open', () => {
    let model = init({ id: 'menu', clickGuardMs: 500 })
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuTrigger()).model
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 0 }),
    ).model
    model = flushShow(model, 150)
    model = NavMenu.update(model, NavMenu.Message.LeftNavMenuPanel()).model
    // click within the 500ms guard of the hover open
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 400 }),
    ).model
    assertPinned(model)
    assertPinned(flushClose(model))
  })

  it('pointer click past the guard on a hover-opened trigger closes it', () => {
    let model = init({ id: 'menu', clickGuardMs: 500 })
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuTrigger()).model
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 0 }),
    ).model
    model = flushShow(model, 150)
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 900 }),
    ).model
    assert.equal(NavMenu.isOpen(model), false)
  })

  it('pointer click on a pinned trigger closes it', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    assertPinned(model)
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 6000 }),
    ).model
    assert.equal(NavMenu.isOpen(model), false)
  })

  it('keyboard activation always opens and never dismisses', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.ActivatedNavMenuTrigger(),
    ).model
    assertPinned(model)
    model = NavMenu.update(
      model,
      NavMenu.Message.ActivatedNavMenuTrigger(),
    ).model
    assertPinned(model)
  })
})

describe('dismissal paths', () => {
  for (const [label, message, restoresFocus] of [
    ['Escape', NavMenu.Message.PressedEscapeNavMenu(), true],
    ['the close button', NavMenu.Message.ClosedNavMenu(), true],
    ['a backdrop press', NavMenu.Message.PressedNavMenuBackdrop(), false],
    ['item selection', NavMenu.Message.SelectedNavMenuItem(), false],
  ] as const) {
    it(`${label} closes the popup with the expected focus policy`, () => {
      const opened = NavMenu.update(
        init(),
        NavMenu.Message.ActivatedNavMenuTrigger(),
      ).model
      const result = NavMenu.update(opened, message)
      assert.equal(Popup.isMounted(result.model.popup), false)
      assert.deepEqual(
        result.commands?.map(command => command.name),
        [
          'StampNavMenuClose',
          ...(restoresFocus ? ['FocusNavMenuTrigger'] : []),
        ],
      )
    })
  }

  it('a deliberate close suppresses hover reopen for 300ms', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    const closed = NavMenu.update(model, NavMenu.Message.PressedEscapeNavMenu())
    model = closed.model
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuClose({ atMs: 6000 }),
    ).model
    // pointer re-enters 100ms later — suppressed
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuTrigger()).model
    const recorded = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 6100 }),
    )
    assert.equal(recorded.commands === undefined, true)
    // 400ms later — allowed
    const next = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 6400 }),
    )
    assert.equal(next.commands?.length, 1)
    assert.equal(NavMenu.isOpen(flushShow(next.model, 6550)), true)
  })

  it('leaving a pinned trigger does not close it', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    model = NavMenu.update(model, NavMenu.Message.LeftNavMenuTrigger()).model
    model = flushClose(model)
    assertPinned(model)
  })
})
