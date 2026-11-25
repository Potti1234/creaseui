import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Schema } from 'effect'
import { Window } from 'happy-dom'

import * as Observe from '@/lib/behaviors/observe'

const change = (input: Partial<Parameters<typeof Observe.change>[0]> = {}) =>
  Observe.change({
    ref: 'panel/region',
    component: 'select',
    label: 'Region',
    key: 'value',
    value: 'Frankfurt',
    previous: 'London',
    reason: 'item-press',
    source: 'agent',
    phase: 'Commit',
    ...input,
  })

describe('Observe changes', () => {
  it('constructs Schema changes and redacts both values only when secret', () => {
    assert.equal(Schema.is(Observe.Change)(change()), true)
    assert.equal(change().value, 'Frankfurt')
    assert.equal(change().redacted, false)
    const secret = change({ secret: true })
    assert.equal(secret.value, '[redacted]')
    assert.equal(secret.previous, '[redacted]')
    assert.equal(secret.redacted, true)
    assert.equal('secret' in secret, false)
  })

  it('selects commits with their interaction baseline or live steps, never both', () => {
    const first = change({ phase: 'Live', value: 'Paris' })
    const next = change({ phase: 'Live', previous: 'Paris' })
    const commit = change()
    assert.deepEqual(Observe.filter([first, next, commit]), [commit])
    assert.equal(Observe.filter(commit)[0]?.previous, 'London')
    assert.deepEqual(Observe.filter([first, next, commit], { live: true }), [
      first,
      next,
    ])
    assert.equal(Observe.accepts({}, first), false)
    assert.equal(Observe.accepts({ live: true }, commit), false)
    assert.deepEqual(Observe.filter([]), [])
  })

  it('scopes selection to ref prefixes or a predicate', () => {
    const item = change()
    assert.equal(Observe.accepts({ within: ['other/', 'panel/'] }, item), true)
    assert.equal(Observe.accepts({ within: ['other/'] }, item), false)
    assert.equal(Observe.accepts({ within: [] }, item), false)
    assert.equal(
      Observe.accepts({ within: ref => ref.endsWith('/region') }, item),
      true,
    )
    assert.deepEqual(Observe.filter(item, { within: () => false }), [])
  })

  it('resolves exact refs in the caller scope and follows DOM replacement', async () => {
    const window = new Window()
    try {
      const { document } = window
      const outside = document.createElement('button')
      const scope = document.createElement('section')
      const control = document.createElement('input')
      const ref = 'panel/choice["a"]'
      outside.setAttribute('data-observe-ref', ref)
      control.setAttribute('data-observe-ref', ref)
      scope.setAttribute('data-observe-ref', 'panel')
      document.body.append(outside, scope)
      scope.append(control)
      const testElement: unknown = scope
      const root = testElement as Element

      assert.equal(Observe.elementOf(root, ref), control)
      assert.equal(Observe.elementOf(root, 'panel'), scope)
      assert.equal(Observe.elementOf(root, 'panel/choice'), null)
      control.remove()
      assert.equal(Observe.elementOf(root, ref), null)
      const replacement = control.cloneNode()
      scope.append(replacement)
      assert.equal(Observe.elementOf(root, ref), replacement)
    } finally {
      await window.happyDOM.close()
    }
  })
})
