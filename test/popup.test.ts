import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as Popup from '../src/lib/behaviors/popup.ts'

const open = Popup.Message.RequestedOpen({ reason: 'trigger-press' })
const close = Popup.Message.RequestedClose({ reason: 'close-press' })
const dismiss = Popup.Message.RequestedDismissal({ reason: 'escape-key' })

describe('Popup lifecycle', () => {
  it('starts closed unless initially opened and reports only changes', () => {
    const initial = Popup.init()
    assert.equal(Popup.isMounted(initial), false)
    assert.deepEqual(Popup.update(initial, close), { model: initial })
    assert.deepEqual(Popup.update(initial, dismiss), { model: initial })
    assert.equal(Popup.isMounted(Popup.init({ defaultOpen: true })), true)

    const opened = Popup.update(initial, open)
    assert.equal(opened.model.isOpen, true)
    assert.equal(Popup.isMounted(opened.model), true)
    assert.deepEqual(
      opened.outMessage,
      Popup.OutMessage.Opened({ reason: 'trigger-press' }),
    )
    assert.deepEqual(Popup.update(opened.model, open), { model: opened.model })

    const closed = Popup.update(opened.model, dismiss)
    assert.equal(closed.model.isOpen, false)
    assert.equal(Popup.isMounted(closed.model), false)
    assert.deepEqual(
      closed.outMessage,
      Popup.OutMessage.Closed({ reason: 'escape-key' }),
    )
  })

  it('disables opening without preventing an already open popup from closing', () => {
    const closed = Popup.init()
    assert.deepEqual(Popup.update(closed, open, { disabled: true }), {
      model: closed,
    })
    const opened = Popup.init({ defaultOpen: true })
    const result = Popup.update(opened, close, { disabled: true })
    assert.equal(Popup.isMounted(result.model), false)
    assert.deepEqual(
      result.outMessage,
      Popup.OutMessage.Closed({ reason: 'close-press' }),
    )
  })

  it('reports blocked dismissal without blocking explicit close', () => {
    const model = Popup.init({ defaultOpen: true })
    const options = { dismissible: false }
    for (const reason of [
      'escape-key',
      'outside-press',
      'focus-out',
    ] as const) {
      assert.deepEqual(
        Popup.update(
          model,
          Popup.Message.RequestedDismissal({ reason }),
          options,
        ),
        { model, outMessage: Popup.OutMessage.PreventedDismissal({ reason }) },
      )
    }
    const closed = Popup.update(model, close, options)
    assert.equal(closed.model.isOpen, false)
    assert.deepEqual(
      closed.outMessage,
      Popup.OutMessage.Closed({ reason: 'close-press' }),
    )
  })

  it('keeps a closed popup mounted until the current exit completes', () => {
    const options = { waitForExit: true }
    const firstExit = Popup.update(
      Popup.init({ defaultOpen: true }),
      close,
      options,
    )
    const firstComplete = Popup.Message.CompletedExit({
      version: firstExit.model.exitVersion,
    })
    assert.equal(firstExit.model.isOpen, false)
    assert.equal(Popup.isMounted(firstExit.model), true)

    const reopened = Popup.update(firstExit.model, open, options)
    assert.deepEqual(Popup.update(reopened.model, firstComplete), {
      model: reopened.model,
    })
    const secondExit = Popup.update(reopened.model, close, options)
    assert.deepEqual(Popup.update(secondExit.model, firstComplete), {
      model: secondExit.model,
    })
    const completed = Popup.update(
      secondExit.model,
      Popup.Message.CompletedExit({ version: secondExit.model.exitVersion }),
    )
    assert.equal(Popup.isMounted(completed.model), false)
    assert.equal(completed.outMessage, undefined)
  })
})
