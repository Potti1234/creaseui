import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Menubar from '../src/lib/menubar.ts'

describe('Menubar focus behavior', () => {
  it('stores only the active top-level index', () => {
    assert.deepEqual(Menubar.init({ id: 'app-menu' }), { id: 'app-menu', activeIndex: 0 })
  })

  it('emits movement and schedules focus for the target trigger', () => {
    const [model, commands, maybeMove] = Menubar.update(
      Menubar.init({ id: 'app-menu' }),
      Menubar.Moved({ index: 2, triggerId: 'view-trigger' }),
    )
    assert.equal(model.activeIndex, 2)
    assert.equal(commands.length, 1)
    assert.deepEqual(Option.getOrUndefined(maybeMove), { _tag: 'MovedToMenubar', index: 2 })
  })

  it('tracks focus without emitting an application fact', () => {
    const [model, commands, maybeMove] = Menubar.update(
      Menubar.init({ id: 'app-menu' }),
      Menubar.Focused({ index: 1 }),
    )
    assert.equal(model.activeIndex, 1)
    assert.deepEqual(commands, [])
    assert.equal(Option.isNone(maybeMove), true)
  })
})
