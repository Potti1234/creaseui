import assert from 'node:assert/strict'
import test from 'node:test'

import * as MobileNav from '../src/lib/mobile-nav.ts'

test('init defaults to auto side and closed dialog', () => {
  const model = MobileNav.init({ id: 'nav' })
  assert.equal(model.side, 'auto')
  assert.equal(model.resolvedSide, 'start')
  assert.equal(model.dialog.isOpen, false)
})

test('an explicit side is carried through open', () => {
  const model = MobileNav.init({ id: 'nav', side: 'end' })
  const opened = MobileNav.open(model).model
  assert.equal(opened.resolvedSide, 'end')
  assert.equal(opened.dialog.isOpen, true)
})

test('auto side resolves deterministically when no focused element exists', () => {
  const model = MobileNav.init({ id: 'nav', side: 'auto' })
  const opened = MobileNav.open(model).model
  assert.equal(opened.resolvedSide, 'start')
})
