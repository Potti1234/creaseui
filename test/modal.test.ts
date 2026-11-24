import assert from 'node:assert/strict'
import { it } from 'node:test'
import { __htmlBuilder } from '../node_modules/foldkit/dist/html/index.js'

import * as Modal from '../src/lib/behaviors/modal.ts'

it('binds native modal resources only while the surface is visible', () => {
  const h = __htmlBuilder<string>()
  const events = {
    send: (message: Modal.Message) => message._tag,
    cancel: 'dismiss',
    unmounted: 'removed',
  }
  const config = { id: 'custom-modal', focusSelector: '#confirm' }
  const hidden = Modal.attributes({ ...config, visible: false }, events, h)
  const visible = Modal.attributes({ ...config, visible: true }, events, h)
  assert.deepEqual(
    hidden.map(attribute => attribute._tag),
    ['Id', 'OnCancelPreventDefault', 'Open'],
  )
  assert.ok(visible.some(attribute => attribute._tag === 'AriaModal'))
  assert.ok(visible.some(attribute => attribute._tag === 'OnUnmount'))
  const mount = visible.find(attribute => attribute._tag === 'OnMount')
  assert.ok(mount)
  assert.equal(mount.action.name, 'AcquireResources')
})
