import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Toast from '../src/lib/toast.ts'

describe('Toast notification behavior', () => {
  it('uses deterministic IDs and schedules non-sticky entries', () => {
    const op1__ = Toast.show(Toast.init({ id: 'notice' }), Toast.success({ title: 'Saved', duration: '2 seconds' })); const model = op1__.model; const commands = op1__.commands ?? [];
    assert.equal(model.entries[0]?.id, 'notice-0')
    assert.equal(commands.length, 1)
  })

  it('ignores a stale timer after an entry update', () => {
    const op2__ = Toast.show(Toast.init({ id: 'notice' }), Toast.info({ title: 'Uploading' })); const shown = op2__.model;
    const id = shown.entries[0]!.id
    const { model: updated } = Toast.updateToast(shown, id, { title: 'Uploaded', variant: 'Success' })
    const op3__ = Toast.update(updated, Toast.Message.CompletedWaitBeforeDismissingToast({ id, timerVersion: 0 })); const afterStale = op3__.model; const _commands = op3__.commands ?? []; const out = op3__.outMessage;
    assert.equal(afterStale.entries.length, 1)
    assert.equal(out === undefined, true)
  })

  it('pauses expiry and schedules a new generation on resume', () => {
    const op4__ = Toast.show(Toast.init({ id: 'notice' }), Toast.warning({ title: 'Heads up' })); const shown = op4__.model;
    const id = shown.entries[0]!.id
    const op5__ = Toast.update(shown, Toast.Message.PausedToast({ id })); const paused = op5__.model;
    const op6__ = Toast.update(paused, Toast.Message.CompletedWaitBeforeDismissingToast({ id, timerVersion: 0 })); const afterTimer = op6__.model;
    assert.equal(afterTimer.entries.length, 1)
    const op7__ = Toast.update(afterTimer, Toast.Message.ResumedToast({ id })); const resumed = op7__.model; const commands = op7__.commands ?? [];
    assert.equal(resumed.entries[0]?.timerVersion, 1)
    assert.equal(commands.length, 1)
  })

  it('emits a typed action fact and removes the acted-on entry', () => {
    const op8__ = Toast.show(Toast.init({ id: 'notice' }), Toast.error({ title: 'Failed', actionLabel: 'Retry', sticky: true })); const shown = op8__.model;
    const id = shown.entries[0]!.id
    const op9__ = Toast.update(shown, Toast.Message.ActivatedToastAction({ id })); const next = op9__.model; const _commands = op9__.commands ?? []; const out = op9__.outMessage;
    assert.equal(next.entries.length, 0)
    assert.equal(out._tag, 'ActivatedToast')
  })
})
