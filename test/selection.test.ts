import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'

import * as Selection from '../src/lib/behaviors/selection.ts'

type Key = 'a' | 'b' | 'c' | 'd' | 'hidden'
const selection = Selection.create<Key>()
const collection = { multiple: true, order: ['a', 'b', 'c', 'd'] } as const

describe('Selection', () => {
  it('chooses exclusively and toggles a single selection off', () => {
    const initial = selection.init(['a'])
    const chosen = selection.choose(initial, 'b', { multiple: true })
    assert.deepEqual(initial.values, ['a'])
    assert.deepEqual(chosen.values, ['b'])
    assert.equal(selection.isSelected(chosen, 'b'), true)
    assert.deepEqual(selection.toggle(chosen, 'b').values, [])
    assert.deepEqual(selection.toggle(chosen, 'c').values, ['c'])
    assert.deepEqual(selection.extend(chosen, 'd', { order: [] }).values, ['d'])
    assert.equal(selection.toggleAll(chosen, { order: ['a', 'b'] }), chosen)
  })

  it('adds and removes keys in multiple mode and records their range baseline', () => {
    const initial = selection.init(['hidden'])
    const added = selection.toggle(initial, 'c', collection)
    assert.deepEqual(added.values, ['hidden', 'c'])
    const removed = selection.toggle(added, 'c', collection)
    assert.deepEqual(removed.values, ['hidden'])
    assert.deepEqual(
      removed.maybeAnchor,
      Option.some({ key: 'c', base: ['hidden'] }),
    )
    assert.equal(Schema.is(Selection.Model)(removed), true)
  })

  it('recomputes reverse and shrinking ranges from the original baseline', () => {
    const initial = selection.toggle(
      selection.init(['hidden']),
      'd',
      collection,
    )
    const extended = selection.extend(initial, 'a', collection)
    assert.deepEqual(extended.values, ['hidden', 'd', 'a', 'b', 'c'])
    const shrunk = selection.extend(extended, 'c', collection)
    assert.deepEqual(shrunk.values, ['hidden', 'd', 'c'])
    const replaced = selection.extend(shrunk, 'b', {
      ...collection,
      additive: false,
    })
    assert.deepEqual(replaced.values, ['b', 'c', 'd'])
    assert.deepEqual(replaced.maybeAnchor, initial.maybeAnchor)
  })

  it('starts a range at focus, a new anchor, or the target when the old anchor disappears', () => {
    const initial = selection.init(['hidden'])
    const extended = selection.extend(initial, 'c', {
      ...collection,
      from: 'a',
    })
    assert.deepEqual(extended.values, ['hidden', 'a', 'b', 'c'])
    const anchored = selection.setAnchor(initial, 'c')
    assert.equal(anchored.values, initial.values)
    assert.deepEqual(selection.extend(anchored, 'b', collection).values, [
      'hidden',
      'b',
      'c',
    ])
    const withoutAnchor = selection.setAnchor(anchored, null)
    assert.deepEqual(withoutAnchor.maybeAnchor, Option.none())
    assert.deepEqual(
      selection.extend(extended, 'd', {
        ...collection,
        order: ['b', 'c', 'd'],
        from: 'a',
        additive: false,
      }).values,
      ['d'],
    )
    assert.equal(
      selection.extend(initial, 'a', { ...collection, order: [] }),
      initial,
    )
  })

  it('skips unselectable keys and retains selections outside a filtered select-all', () => {
    const initial = selection.init(['hidden', 'b'])
    const policy = { ...collection, isSelectable: (key: Key) => key !== 'b' }
    assert.equal(selection.choose(initial, 'b', policy), initial)
    assert.equal(selection.toggle(initial, 'b', policy), initial)
    assert.deepEqual(
      selection.extend(initial, 'c', { ...policy, from: 'a', additive: false })
        .values,
      ['a', 'c'],
    )
    const all = selection.toggleAll(initial, policy)
    assert.deepEqual(all.values, ['hidden', 'b', 'a', 'c', 'd'])
    assert.deepEqual(selection.toggleAll(all, policy).values, initial.values)
    assert.equal(
      selection.toggleAll(initial, { ...policy, order: ['b'] }),
      initial,
    )
    assert.equal(
      selection.toggleAll(initial, { ...policy, order: [] }),
      initial,
    )
  })

  it('retains the range when reflected keys match and resets it on new membership', () => {
    const initial = selection.toggle(
      selection.init(['hidden']),
      'a',
      collection,
    )
    assert.equal(selection.reflect(initial, ['hidden', 'a']), initial)
    const reordered = selection.reflect(initial, ['a', 'hidden'])
    assert.deepEqual(reordered.values, ['a', 'hidden'])
    assert.equal(reordered.maybeAnchor, initial.maybeAnchor)
    const reflected = selection.reflect(initial, ['b'])
    assert.deepEqual(reflected.maybeAnchor, Option.none())
    assert.deepEqual(
      selection.extend(reflected, 'd', { ...collection, from: 'c' }).values,
      ['b', 'c', 'd'],
    )
  })
})
