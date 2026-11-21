import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Hold from '../src/lib/behaviors/hold-repeat.ts'
import * as NumberInput from '../src/lib/number-input.ts'

const press = (input: 'mouse' | 'touch' | 'pen' | 'keyboard' = 'mouse') =>
  Hold.Message.Pressed({
    input,
    pointerId: 7,
    key: input === 'keyboard' ? 'Enter' : '',
    x: 0,
    y: 0,
  })
const tick = (model: Hold.Model) =>
  Hold.Message.Waited({ version: model.version })
const release = (canceled = false) =>
  Hold.Message.Released({ pointerId: 7, key: '', canceled })

describe('Hold/Repeat', () => {
  it('steps on mouse press, waits 400ms, then repeats every 60ms without acceleration', () => {
    const started = Hold.update(Hold.init(), press())
    assert.equal(started.outMessage?._tag, 'Stepped')
    assert.deepEqual(
      started.commands?.map(command => command.args),
      [{ delay: 400, version: 1 }],
    )
    const repeated = Hold.update(started.model, tick(started.model))
    assert.equal(repeated.model.count, 2)
    assert.deepEqual(
      repeated.commands?.map(command => command.args),
      [{ delay: 60, version: 1 }],
    )
    assert.equal(
      Hold.update(repeated.model, tick(repeated.model)).model.count,
      3,
    )
  })

  it('hold alone waits 500ms and only repeats when configured', () => {
    const started = Hold.update(Hold.init(), press(), { mode: 'hold' })
    assert.equal(started.outMessage, undefined)
    assert.deepEqual(
      started.commands?.map(command => command.args),
      [{ delay: 500, version: 1 }],
    )
    const held = Hold.update(started.model, tick(started.model), {
      mode: 'hold',
    })
    assert.equal(held.model.held, true)
    assert.deepEqual(held.commands, [])
    assert.deepEqual(
      Hold.update(started.model, tick(started.model), {
        mode: 'hold',
        repeat: 100,
      }).commands?.map(command => command.args),
      [{ delay: 100, version: 1 }],
    )
  })

  it('touch and pen tap on release, but holding does not add a release step', () => {
    for (const input of ['touch', 'pen'] as const) {
      const started = Hold.update(Hold.init(), press(input))
      assert.equal(started.model.count, 0)
      assert.equal(Hold.update(started.model, release()).model.count, 1)
      assert.equal(Hold.update(started.model, release(true)).model.count, 0)
      const held = Hold.update(started.model, tick(started.model)).model
      assert.equal(Hold.update(held, release()).model.count, 1)
    }
  })

  it('pauses outside, resumes inside, and ignores other pointers', () => {
    const started = Hold.update(Hold.init(), press()).model
    const move = (pointerId: number, inside: boolean) =>
      Hold.Message.Moved({ pointerId, inside, x: 20, y: 0, released: false })
    assert.deepEqual(Hold.update(started, move(8, false)), { model: started })
    const outside = Hold.update(started, move(7, false)).model
    const paused = Hold.update(outside, tick(outside)).model
    assert.equal(paused.count, 1)
    const inside = Hold.update(paused, move(7, true)).model
    assert.equal(Hold.update(inside, tick(inside)).model.count, 2)
    assert.equal(
      Hold.update(started, move(7, false), { mode: 'hold' }).model.active,
      false,
    )
  })

  it('stops on release/cancel, disabled, or refusal, rejecting stale timers after restart', () => {
    const started = Hold.update(Hold.init(), press()).model
    for (const message of [release(), release(true), Hold.Message.Canceled()]) {
      const stopped = Hold.update(started, message).model
      assert.equal(stopped.active, false)
      assert.equal(Hold.update(stopped, tick(started)).outMessage, undefined)
      const restarted = Hold.update(stopped, press()).model
      assert.equal(Hold.update(restarted, tick(started)).model.count, 1)
    }
    assert.equal(
      Hold.update(started, tick(started), { disabled: true }).model.active,
      false,
    )
    const refused = Hold.update(started, tick(started), { canStep: false })
    assert.equal(refused.model.stopped, true)
    assert.equal(refused.outMessage, undefined)
    assert.deepEqual(refused.commands, [])
    assert.equal(
      Hold.update(Hold.init(), press(), { disabled: true }).model.count,
      0,
    )
    assert.equal(Hold.update(Hold.init(), release()).outMessage, undefined)
  })

  it('keyboard starts once, matches keyup, and assistive clicks step once', () => {
    const started = Hold.update(Hold.init(), press('keyboard')).model
    assert.equal(Hold.update(started, press('keyboard')).model.count, 1)
    assert.equal(Hold.update(started, release()).model.active, true)
    assert.equal(
      Hold.update(
        started,
        Hold.Message.Released({ pointerId: -1, key: 'Enter', canceled: false }),
      ).model.active,
      false,
    )
    assert.equal(
      Hold.update(Hold.init(), Hold.Message.Clicked()).model.count,
      1,
    )
  })

  it('number-input repeats from empty, clamps at the bound, and stops after release', () => {
    const wrap = (message: Hold.Message) =>
      NumberInput.Message.HeldStepper({
        message,
        direction: 1,
        value: null,
        min: 0,
        max: 2,
        step: null,
        disabled: false,
      })
    const started = NumberInput.update(
      NumberInput.init({ id: 'quantity' }),
      wrap(press()),
    )
    assert.equal(Option.getOrNull(started.outMessage!.value), 0)
    const repeated = NumberInput.update(
      started.model,
      wrap(tick(started.model.hold)),
    )
    assert.equal(Option.getOrNull(repeated.outMessage!.value), 1)
    const maximum = NumberInput.update(
      repeated.model,
      wrap(tick(repeated.model.hold)),
    )
    assert.equal(Option.getOrNull(maximum.outMessage!.value), 2)
    assert.equal(
      NumberInput.update(maximum.model, wrap(tick(maximum.model.hold)))
        .outMessage,
      undefined,
    )
    const released = NumberInput.update(repeated.model, wrap(release()))
    assert.equal(
      NumberInput.update(released.model, wrap(tick(repeated.model.hold)))
        .outMessage,
      undefined,
    )
  })

  it('touch hold starts from the controlled value rather than an old gesture', () => {
    const wrap = (message: Hold.Message) =>
      NumberInput.Message.HeldStepper({
        message,
        direction: 1,
        value: 10,
        min: null,
        max: null,
        step: null,
        disabled: false,
      })
    const started = NumberInput.update(
      NumberInput.init({ id: 'touch' }),
      wrap(press('touch')),
    )
    assert.equal(started.outMessage, undefined)
    const held = NumberInput.update(
      started.model,
      wrap(tick(started.model.hold)),
    )
    assert.equal(Option.getOrNull(held.outMessage!.value), 11)
  })
})
