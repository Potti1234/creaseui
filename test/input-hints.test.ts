import assert from 'node:assert/strict'
import { it } from 'node:test'
import { __htmlBuilder } from '../node_modules/foldkit/dist/html/index.js'

import * as Hints from '../src/lib/behaviors/input-hints.ts'

it('builds input attributes for mobile keyboards and autofill', () => {
  const h = __htmlBuilder<never>()
  assert.deepEqual(Hints.attributes('one-time-code', h, { enter: 'done' }), [
    h.InputMode('numeric'),
    h.Autocapitalize('none'),
    h.Autocorrect('off'),
    h.Spellcheck(false),
    h.EnterKeyHint('done'),
    h.Autocomplete('one-time-code'),
  ])
  const message = Hints.attributes('message', h, {
    enter: 'next',
    mode: 'search',
  })
  assert.ok(
    message.some(
      attribute => attribute._tag === 'Spellcheck' && attribute.value,
    ),
  )
  assert.ok(
    message.some(
      attribute =>
        attribute._tag === 'EnterKeyHint' && attribute.value === 'next',
    ),
  )
  assert.ok(
    message.some(
      attribute =>
        attribute._tag === 'InputMode' && attribute.value === 'search',
    ),
  )
})
