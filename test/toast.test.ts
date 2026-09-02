import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Toast from '../src/lib/toast.ts'

describe('Toast notification behavior', () => {
  it('uses deterministic IDs and schedules non-sticky entries', () => {
    const [model, commands] = Toast.show(Toast.init({ id: 'notice' }), Toast.success({ title: 'Saved', duration: '2 seconds' }))
    assert.equal(model.entries[0]?.id, 'notice-0')
    assert.equal(commands.length, 1)
  })

  it('ignores a stale timer after an entry update', () => {
    const [shown] = Toast.show(Toast.init({ id: 'notice' }), Toast.info({ title: 'Uploading' }))
    const id = shown.entries[0]!.id
    const [updated] = Toast.updateToast(shown, id, { title: 'Uploaded', variant: 'Success' })
    const [afterStale, _commands, out] = Toast.update(updated, Toast.CompletedWait({ id, timerVersion: 0 }))
    assert.equal(afterStale.entries.length, 1)
    assert.equal(Option.isNone(out), true)
  })

  it('pauses expiry and schedules a new generation on resume', () => {
    const [shown] = Toast.show(Toast.init({ id: 'notice' }), Toast.warning({ title: 'Heads up' }))
    const id = shown.entries[0]!.id
    const [paused] = Toast.update(shown, Toast.Paused({ id }))
    const [afterTimer] = Toast.update(paused, Toast.CompletedWait({ id, timerVersion: 0 }))
    assert.equal(afterTimer.entries.length, 1)
    const [resumed, commands] = Toast.update(afterTimer, Toast.Resumed({ id }))
    assert.equal(resumed.entries[0]?.timerVersion, 1)
    assert.equal(commands.length, 1)
  })

  it('emits a typed action fact and removes the acted-on entry', () => {
    const [shown] = Toast.show(Toast.init({ id: 'notice' }), Toast.error({ title: 'Failed', actionLabel: 'Retry', sticky: true }))
    const id = shown.entries[0]!.id
    const [next, _commands, out] = Toast.update(shown, Toast.Activated({ id }))
    assert.equal(next.entries.length, 0)
    assert.equal(Option.getOrThrow(out)._tag, 'ActivatedToast')
  })
})
