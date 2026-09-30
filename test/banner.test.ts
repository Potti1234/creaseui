import assert from 'node:assert/strict'
import test from 'node:test'

import * as Banner from '../src/lib/banner.ts'

test('init defaults to closed content unless defaultIsOpen is set', () => {
  assert.deepEqual(Banner.init(), { isDismissed: false, isOpen: false })
  assert.deepEqual(Banner.init({ defaultIsOpen: true }), {
    isDismissed: false,
    isOpen: true,
  })
})

test('dismiss marks the banner dismissed and emits the Dismissed out message', () => {
  const initial = Banner.init({ defaultIsOpen: true })
  const op__ = Banner.update(initial, Banner.Message.Dismissed())
  assert.equal(op__.model.isDismissed, true)
  assert.equal(op__.outMessage?._tag, 'Dismissed')
})

test('toggling content flips isOpen without emitting an out message', () => {
  const closed = Banner.init()
  const open__ = Banner.update(closed, Banner.Message.ToggledContent())
  assert.equal(open__.model.isOpen, true)
  assert.equal(open__.outMessage, undefined)
  const closedAgain__ = Banner.update(open__.model, Banner.Message.ToggledContent())
  assert.equal(closedAgain__.model.isOpen, false)
})
