import assert from 'node:assert/strict'
import { it } from 'node:test'

import * as Parts from '../src/lib/behaviors/parts.ts'

it('escapes keyed ID parts consistently without collapsing distinct keys', () => {
  const keys = ['', 'a b', 'a%20b', 'café', '😀', '\ud800', '\ud801', '%ud800']
  const ids = keys.map(key => Parts.keyedPartId('files', 'item', key))
  assert.equal(new Set(ids).size, keys.length)
  assert.equal(Parts.idPart('a b'), 'a%20b')
  assert.equal(Parts.idPart('😀'), '%F0%9F%98%80')
  assert.deepEqual(
    keys.toReversed().map(key => Parts.keyedPartId('files', 'item', key)),
    ids.toReversed(),
  )
})

it('frames arbitrary instance, slot, and key boundaries independently', () => {
  const tuples = [
    ['a-b', 'c', 'd'],
    ['a', 'b-c', 'd'],
    ['a', 'b', 'c-d'],
    ['a:b', 'c', 'd'],
    ['a', 'b:c', 'd'],
    ['a', 'b', 'c:d'],
    ['a%3Ab', 'c', 'd'],
    ['', ':', ''],
    [':', '', ''],
    ['', '', ':'],
  ] as const
  const ids = tuples.map(([instance, slot, key]) =>
    Parts.keyedPartId(instance, slot, key),
  )
  assert.equal(new Set(ids).size, tuples.length)
})
