import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Menubar from '../src/lib/menubar.ts'

describe('Menubar focus behavior', () => {
  it('stores only the active top-level index', () => {
    assert.deepEqual(Menubar.init({ id: 'app-menu' }), { id: 'app-menu', activeIndex: 0 })
  })

  it('emits movement and schedules focus for the target trigger', () => {
    const op1__ = Menubar.update(
      Menubar.init({ id: 'app-menu' }),
      Menubar.Message.MovedMenubarFocus({ index: 2, triggerId: 'view-trigger' }),
    ); const model = op1__.model; const commands = op1__.commands ?? []; const maybeMove = op1__.outMessage;
    assert.equal(model.activeIndex, 2)
    assert.equal(commands.length, 1)
    assert.deepEqual(maybeMove, { _tag: 'MovedToMenubar', index: 2 })
  })

  it('tracks focus without emitting an application fact', () => {
    const op2__ = Menubar.update(
      Menubar.init({ id: 'app-menu' }),
      Menubar.Message.FocusedMenubarTrigger({ index: 1 }),
    ); const model = op2__.model; const commands = op2__.commands ?? []; const maybeMove = op2__.outMessage;
    assert.equal(model.activeIndex, 1)
    assert.deepEqual(commands, [])
    assert.equal(maybeMove === undefined, true)
  })
})
