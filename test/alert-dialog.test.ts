import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import { Dialog } from '@foldkit/ui'

import * as AlertDialog from '../src/lib/alert-dialog.ts'

describe('Alert Dialog decision behavior', () => {
  it('emits Confirmed without closing parent-owned async work', () => {
    const model = AlertDialog.init({ id: 'decision', isOpen: true })
    const [next, commands, out] = AlertDialog.update(model, AlertDialog.RequestedConfirm())
    assert.equal(next.isOpen, true)
    assert.equal(commands.length, 0)
    assert.equal(Option.getOrThrow(out)._tag, 'ConfirmedAlertDialog')
  })

  it('closes and emits Cancelled for the explicit safe action', () => {
    const model = AlertDialog.init({ id: 'decision', isOpen: true })
    const [next, _commands, out] = AlertDialog.update(model, AlertDialog.RequestedCancel())
    assert.equal(next.isOpen, false)
    assert.equal(Option.getOrThrow(out)._tag, 'CancelledAlertDialog')
  })

  it('maps Escape through primitive close behavior to Cancelled', () => {
    const model = AlertDialog.init({ id: 'decision', isOpen: true })
    const [next, _commands, out] = AlertDialog.update(model, AlertDialog.GotDialogMessage({ message: Dialog.RequestedClose() }))
    assert.equal(next.isOpen, false)
    assert.equal(Option.getOrThrow(out)._tag, 'CancelledAlertDialog')
  })
})
