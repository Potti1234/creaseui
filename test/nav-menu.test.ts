import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Option } from 'effect'

import * as NavMenu from '../src/lib/nav-menu'

const init = (
  config: Partial<NavMenu.InitConfig> & { id: string } = { id: 'menu' },
): NavMenu.Model => NavMenu.init(config)

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
    model = flushShow(model, 1150)
    assert.equal(model.openMode, 'hover')
  })

  it('cancels the pending show when the pointer leaves before the delay', () => {
    let model = init()
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuTrigger()).model
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 1000 }),
    ).model
    model = NavMenu.update(model, NavMenu.Message.LeftNavMenuTrigger()).model
    // a stale completion for the old version must not open
    model = flushShow(model, 1150)
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
    assert.equal(model.openMode, 'hover')
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
    assert.equal(model.openMode, 'hover')
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
    assert.equal(model.openMode, 'closed')
  })
})

describe('click semantics', () => {
  it('pointer click on a closed trigger pins it open', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    assert.equal(model.openMode, 'pinned')
  })

  it('pointer click on a hover-opened trigger pins it open', () => {
    let model = init({ id: 'menu', clickGuardMs: 500 })
    model = NavMenu.update(model, NavMenu.Message.EnteredNavMenuTrigger()).model
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 0 }),
    ).model
    model = flushShow(model, 150)
    // click within the 500ms guard of the hover open
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 400 }),
    ).model
    assert.equal(model.openMode, 'pinned')
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
    assert.equal(model.openMode, 'closed')
  })

  it('pointer click on a pinned trigger closes it', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    assert.equal(model.openMode, 'pinned')
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 6000 }),
    ).model
    assert.equal(model.openMode, 'closed')
  })

  it('keyboard activation always opens and never dismisses', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.ActivatedNavMenuTrigger(),
    ).model
    assert.equal(model.openMode, 'pinned')
    model = NavMenu.update(
      model,
      NavMenu.Message.ActivatedNavMenuTrigger(),
    ).model
    assert.equal(model.openMode, 'pinned')
  })
})

describe('dismissal paths', () => {
  it('Escape closes and emits the focus-restore command', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    const result = NavMenu.update(model, NavMenu.Message.PressedEscapeNavMenu())
    assert.equal(result.model.openMode, 'closed')
    assert.ok((result.commands ?? []).length >= 2)
  })

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
    model = NavMenu.update(
      model,
      NavMenu.Message.RecordedNavMenuEnter({ atMs: 6400 }),
    ).model
    assert.equal(model.showVersion > 0, true)
  })

  it('backdrop press closes without focus restore', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    const result = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuBackdrop(),
    )
    assert.equal(result.model.openMode, 'closed')
  })

  it('leaving a pinned trigger does not close it', () => {
    let model = init()
    model = NavMenu.update(
      model,
      NavMenu.Message.PressedNavMenuTrigger({ atMs: 5000 }),
    ).model
    model = NavMenu.update(model, NavMenu.Message.LeftNavMenuTrigger()).model
    model = flushClose(model)
    assert.equal(model.openMode, 'pinned')
  })
})
