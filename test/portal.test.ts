import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as Portal from '../src/lib/behaviors/portal'

const surface = (previous: string | null = null) => {
  let open = false
  let attribute = previous
  let hides = 0
  const element = {
    isConnected: true,
    matches: (selector: string) => selector === ':popover-open' && open,
    getAttribute: () => attribute,
    setAttribute: (_name: string, value: string) => {
      attribute = value
    },
    removeAttribute: () => {
      attribute = null
    },
    showPopover: () => {
      open = true
    },
    hidePopover: () => {
      hides++
      open = false
    },
  }
  return { element, hides: () => hides }
}

const asElement = (element: object) => element as HTMLElement

describe('Portal', () => {
  it('acquires a manual popover and releases it exactly once', () => {
    const { element, hides } = surface('auto')
    const release = Portal.activate(asElement(element))
    assert.equal(element.getAttribute(), 'manual')
    assert.equal(element.matches(':popover-open'), true)
    release()
    release()
    assert.equal(element.getAttribute(), 'auto')
    assert.equal(element.matches(':popover-open'), false)
    assert.equal(hides(), 1)
  })

  it('keeps unsupported, disconnected, and refused activations inline', () => {
    const unsupported = { ...surface().element, hidePopover: undefined }
    const disconnected = { ...surface().element, isConnected: false }
    const cancelled = { ...surface().element, showPopover: () => {} }
    const refused = {
      ...surface().element,
      showPopover: () => {
        throw new Error('inactive document')
      },
    }
    for (const element of [unsupported, disconnected, cancelled, refused]) {
      Portal.activate(asElement(element))()
      assert.equal(element.getAttribute(), null)
      assert.equal(element.matches(':popover-open'), false)
    }
  })

  it('leaves an existing open popover owned by its original caller', () => {
    const { element, hides } = surface('auto')
    element.showPopover()
    Portal.activate(asElement(element))()
    assert.equal(element.getAttribute(), 'auto')
    assert.equal(hides(), 0)
    assert.equal(element.matches(':popover-open'), true)
  })
})
