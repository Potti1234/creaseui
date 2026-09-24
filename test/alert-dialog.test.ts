import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import { Dialog } from '@foldkit/ui'

import * as AlertDialog from '../src/lib/alert-dialog.ts'

describe('Alert Dialog decision behavior', () => {
  it('emits Confirmed without closing parent-owned async work', () => {
    const model = AlertDialog.open(AlertDialog.init({ id: 'decision' })).model
    const op1__ = AlertDialog.update(model, AlertDialog.Message.RequestedAlertDialogConfirm()); const next = op1__.model; const commands = op1__.commands ?? []; const out = op1__.outMessage;
    assert.equal(next.isOpen, true)
    assert.equal(commands.length, 0)
    assert.equal(out._tag, 'ConfirmedAlertDialog')
  })

  it('closes and emits Cancelled for the explicit safe action', () => {
    const model = AlertDialog.open(AlertDialog.init({ id: 'decision' })).model
    const op2__ = AlertDialog.update(model, AlertDialog.Message.RequestedAlertDialogCancel()); const next = op2__.model; const _commands = op2__.commands ?? []; const out = op2__.outMessage;
    assert.equal(next.isOpen, false)
    assert.equal(out._tag, 'CancelledAlertDialog')
  })

  it('maps Escape through primitive close behavior to Cancelled', () => {
    const model = AlertDialog.open(AlertDialog.init({ id: 'decision' })).model
    const op3__ = AlertDialog.update(model, AlertDialog.Message.GotAlertDialogPrimitiveMessage({ message: Dialog.Message.RequestedClose() })); const next = op3__.model; const _commands = op3__.commands ?? []; const out = op3__.outMessage;
    assert.equal(next.isOpen, false)
    assert.equal(out._tag, 'CancelledAlertDialog')
  })
})
