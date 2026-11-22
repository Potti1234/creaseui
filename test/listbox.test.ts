import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Option, Schema } from 'effect'

import * as Listbox from '../src/lib/behaviors/listbox.ts'
import * as Typeahead from '../src/lib/behaviors/typeahead.ts'

const keys = ['apple', 'apricot', 'banana', 'cherry']
const initial = Listbox.init({ id: 'fruit' })
const navigate = (input: Partial<Listbox.NavigationInput<string>> = {}) =>
  Listbox.navigate({
    keys,
    currentKey: 'apple',
    pressedKey: 'ArrowDown',
    ...input,
  })

describe('Listbox pure helpers', () => {
  it('starts without a highlight and derives stable ids', () => {
    assert.equal(Schema.is(Listbox.Model)(initial), true)
    assert.deepEqual(Listbox.activeId(initial), Option.none())
    assert.deepEqual(
      Listbox.activeId(Listbox.highlight(initial, 'apple')),
      Option.some('fruit-item-apple'),
    )
  })

  it('skips disabled options, wraps in both directions, and respects no-loop', () => {
    assert.deepEqual(
      navigate({ isDisabled: key => key === 'apricot' }),
      Option.some('banana'),
    )
    assert.deepEqual(navigate({ currentKey: 'cherry' }), Option.some('apple'))
    assert.deepEqual(navigate({ pressedKey: 'ArrowUp' }), Option.some('cherry'))
    assert.deepEqual(
      navigate({ currentKey: 'cherry', loop: false }),
      Option.none(),
    )
    assert.deepEqual(
      navigate({ pressedKey: 'ArrowUp', loop: false }),
      Option.none(),
    )
    assert.deepEqual(
      navigate({
        currentKey: 'banana',
        pressedKey: 'ArrowUp',
        isDisabled: key => key === 'apricot',
      }),
      Option.some('apple'),
    )
  })

  it('moves pages and first/last, with explicit Virtual Home/End opt-in', () => {
    assert.deepEqual(
      navigate({ pressedKey: 'PageDown', pageSize: 2 }),
      Option.some('banana'),
    )
    assert.deepEqual(
      navigate({ currentKey: 'cherry', pressedKey: 'PageUp', pageSize: 2 }),
      Option.some('apricot'),
    )
    assert.deepEqual(
      navigate({ pressedKey: 'PageDown', pageSize: 10, loop: false }),
      Option.some('cherry'),
    )
    assert.deepEqual(
      navigate({
        pressedKey: 'PageDown',
        pageSize: 2,
        isDisabled: key => key === 'apricot',
      }),
      Option.some('cherry'),
    )
    for (const pressedKey of ['Home', 'first'])
      assert.deepEqual(navigate({ pressedKey }), Option.some('apple'))
    for (const pressedKey of ['End', 'last'])
      assert.deepEqual(
        navigate({ pressedKey, isDisabled: key => key === 'cherry' }),
        Option.some('banana'),
      )
    assert.deepEqual(
      navigate({ pressedKey: 'Home', focus: 'Virtual' }),
      Option.none(),
    )
    assert.deepEqual(
      navigate({ pressedKey: 'End', focus: 'Virtual', homeEnd: true }),
      Option.some('cherry'),
    )
  })

  it('handles empty, all-disabled, removed and unsupported inputs', () => {
    for (const pressedKey of [
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ]) {
      assert.deepEqual(navigate({ keys: [], pressedKey }), Option.none())
      assert.deepEqual(
        navigate({ isDisabled: () => true, pressedKey }),
        Option.none(),
      )
    }
    assert.deepEqual(navigate({ currentKey: 'removed' }), Option.some('apple'))
    assert.deepEqual(
      navigate({ currentKey: 'removed', pressedKey: 'ArrowUp' }),
      Option.some('cherry'),
    )
    assert.deepEqual(navigate({ pressedKey: 'Enter' }), Option.none())
  })

  it('filters contains and prefixes ignoring accents and case, and counts', () => {
    const items = ['École', 'Old École', 'apple']
    assert.deepEqual(
      Listbox.filter(items, ' ECO ', item => item),
      ['École', 'Old École'],
    )
    assert.deepEqual(
      Listbox.filter(items, 'eco', item => item, 'startsWith'),
      ['École'],
    )
    assert.equal(
      Listbox.count(items, 'eco', item => item),
      2,
    )
    assert.equal(
      Listbox.filter(items, '', item => item),
      items,
    )
    assert.deepEqual(Listbox.filter([], 'x', String), [])
    assert.deepEqual(Listbox.filter(items, 'missing', String), [])
    assert.equal(Listbox.count(items, 'missing', String), 0)
  })

  it('supports boolean predicates and stable descending scores, hiding zero', () => {
    assert.deepEqual(
      Listbox.filter(keys, 'x', String, item => item === 'banana'),
      ['banana'],
    )
    assert.deepEqual(
      Listbox.filter(keys, 'x', String, item =>
        item === 'banana' ? 3 : item === 'cherry' ? 0 : 1,
      ),
      ['banana', 'apple', 'apricot'],
    )
    assert.deepEqual(
      Listbox.filter(keys, 'x', String, () => false),
      [],
    )
    assert.throws(
      () =>
        Listbox.filter(keys, 'x', String, () => {
          throw new Error('filter failure')
        }),
      /filter failure/,
    )
  })
})

describe('Listbox transitions', () => {
  it('moves Real focus with a Command and only changes state for Virtual/pointer', () => {
    const real = Listbox.update(
      initial,
      Listbox.Message.MovedHighlight({ key: 'banana', focus: 'Real' }),
    )
    assert.equal(real.commands?.length, 1)
    assert.deepEqual(real.model.maybeHighlightedKey, Option.some('banana'))
    const virtual = Listbox.update(
      initial,
      Listbox.Message.MovedHighlight({ key: 'banana', focus: 'Virtual' }),
    )
    assert.deepEqual(virtual.commands, [])
    assert.deepEqual(
      Listbox.update(
        initial,
        Listbox.Message.HighlightedItem({ key: 'banana' }),
      ).model,
      virtual.model,
    )
  })

  it('routes Real typeahead timeouts through Listbox and rejects stale resets', async () => {
    const typed = (key: string, focus: Listbox.Focus = 'Real') =>
      Listbox.Message.TypedKey({
        key,
        keys,
        labels: keys,
        disabledKeys: ['apple'],
        focus,
      })
    const first = Listbox.update(initial, typed('a'))
    assert.deepEqual(first.model.maybeHighlightedKey, Option.some('apricot'))
    assert.equal(first.model.typeahead.query, 'a')
    const second = Listbox.update(first.model, typed('p'))
    const timeout = first.commands?.at(-1)
    assert.ok(timeout)
    const message = await Effect.runPromise(timeout.effect)
    assert.equal(message._tag, 'GotTypeaheadMessage')
    assert.equal(
      Listbox.update(second.model, message).model.typeahead,
      second.model.typeahead,
    )
    const reset = Listbox.update(
      second.model,
      Listbox.Message.GotTypeaheadMessage({
        message: Typeahead.Message.ElapsedTimeout({
          version: second.model.typeahead.version,
        }),
      }),
    )
    assert.equal(reset.model.typeahead.query, '')
    assert.equal(Listbox.update(initial, typed('a', 'Virtual')).model, initial)
    const missing = Listbox.update(initial, typed('z'))
    assert.deepEqual(missing.model.maybeHighlightedKey, Option.none())
    assert.equal(missing.model.typeahead.query, 'z')
  })
})
