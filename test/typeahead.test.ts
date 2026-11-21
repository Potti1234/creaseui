import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Effect, Option } from 'effect'

import * as Typeahead from '../src/lib/behaviors/typeahead.ts'

const labels = ['Lion', 'Llama', 'Lemon', 'École notes', 'Echo']
const search = (model: Typeahead.Model, key: string, currentIndex = -1) =>
  Typeahead.search(model, { key, labels, currentIndex })

describe('Typeahead', () => {
  it('folds accents and case and trims labels', () => {
    assert.equal(Typeahead.normalize('  ÉCOLE  '), 'ecole')
    assert.deepEqual(search(Typeahead.init(), 'é').maybeIndex, Option.some(3))
  })

  it('preserves standalone punctuation while folding combining accents', () => {
    for (const key of ['^', '`']) {
      const next = Typeahead.search(Typeahead.init(), {
        key,
        labels: [`${key}notes.md`, 'École'],
        currentIndex: -1,
      })
      assert.deepEqual(next.maybeIndex, Option.some(0))
      assert.equal(Typeahead.normalize(`${key}École`), `${key}ecole`)
    }
  })

  it('ignores non-character keys and leading Space without commands or state changes', () => {
    const model = Typeahead.init()
    for (const key of ['', 'Enter', 'ArrowDown', ' ']) {
      const next = search(model, key)
      assert.equal(next.model, model)
      assert.deepEqual(next.commands, [])
      assert.deepEqual(next.maybeIndex, Option.none())
    }
    const modifiers = { ctrlKey: false, metaKey: false, altKey: false }
    assert.equal(Typeahead.isTypeaheadKey(' ', modifiers), true)
    assert.equal(Typeahead.isTypeaheadKey('Shift', modifiers), false)
    for (const modifier of ['ctrlKey', 'metaKey', 'altKey']) {
      assert.equal(
        Typeahead.isTypeaheadKey('a', { ...modifiers, [modifier]: true }),
        false,
      )
    }
  })

  it('steps repeated characters, but prefers the full repeated prefix', () => {
    const first = search(Typeahead.init(), 'l')
    assert.deepEqual(first.maybeIndex, Option.some(0))
    const second = search(first.model, 'l', 0)
    assert.equal(second.model.query, 'll')
    assert.equal(second.model.isStepping, true)
    assert.deepEqual(second.maybeIndex, Option.some(1))
    const third = search(second.model, 'l', 1)
    assert.deepEqual(third.maybeIndex, Option.some(2))
    assert.deepEqual(search(third.model, 'l', 2).maybeIndex, Option.some(0))
  })

  it('starts single characters after current, longer queries at current, and wraps', () => {
    const first = search(Typeahead.init(), 'e', 3)
    assert.deepEqual(first.maybeIndex, Option.some(4))
    const second = search(first.model, 'c', 4)
    assert.deepEqual(second.maybeIndex, Option.some(4))
    assert.deepEqual(
      search(Typeahead.init(), 'l', 4).maybeIndex,
      Option.some(0),
    )
    assert.deepEqual(search(first.model, 'c', -1).maybeIndex, Option.some(3))
  })

  it('refines a prefix after cycling with repeated characters', () => {
    const labels = ['public', 'package.json', 'patch.txt']
    const result = [...'ppat'].reduce(
      ({ model, currentIndex }, key) => {
        const next = Typeahead.search(model, { key, labels, currentIndex })
        return {
          model: next.model,
          currentIndex: Option.getOrElse(next.maybeIndex, () => currentIndex),
        }
      },
      { model: Typeahead.init(), currentIndex: -1 },
    )
    assert.equal(result.model.query, 'pat')
    assert.equal(result.model.isStepping, false)
    assert.equal(result.currentIndex, 2)
  })

  it('continues an active query with Space', () => {
    const model = { ...Typeahead.init(), query: 'ecole', lastKey: 'e' }
    assert.equal(Typeahead.isActive(model), true)
    const next = search(model, ' ', 3)
    assert.equal(next.model.query, 'ecole ')
    assert.deepEqual(next.maybeIndex, Option.some(3))
  })

  it('skips disabled full-prefix and stepping matches', () => {
    const first = Typeahead.search(Typeahead.init(), {
      key: 'l',
      labels,
      currentIndex: -1,
      isDisabled: index => index === 0,
    })
    assert.deepEqual(first.maybeIndex, Option.some(1))
    const second = Typeahead.search(first.model, {
      key: 'l',
      labels,
      currentIndex: 1,
      isDisabled: index => index === 1,
    })
    assert.deepEqual(second.maybeIndex, Option.some(2))
  })

  it('handles empty, all-disabled and unmatched collections', () => {
    for (const input of [
      { labels: [], key: 'a' },
      { labels, key: 'z' },
      { labels, key: 'l', isDisabled: () => true },
    ]) {
      const next = Typeahead.search(Typeahead.init(), {
        ...input,
        currentIndex: -1,
      })
      assert.deepEqual(next.maybeIndex, Option.none())
      assert.equal(next.model.version, 1)
      assert.equal(next.commands?.length, 1)
    }
  })

  it('emits versioned timeouts and ignores stale resets, including after a reset', async () => {
    const first = search(Typeahead.init(), 'l')
    const second = search(first.model, 'l', 0)
    const stale = Typeahead.Message.ElapsedTimeout({
      version: first.model.version,
    })
    assert.equal(Typeahead.update(second.model, stale).model, second.model)
    const message = await Effect.runPromise(
      Typeahead.WaitBeforeResettingTypeahead({
        version: second.model.version,
        timeoutMs: 0,
      }).effect,
    )
    const reset = Typeahead.update(second.model, message).model
    assert.equal(Typeahead.isActive(reset), false)
    assert.equal(reset.lastKey, '')
    assert.equal(reset.isStepping, false)
    const next = search(reset, 'e').model
    assert.equal(Typeahead.update(next, stale).model, next)
    assert.equal(Typeahead.DEFAULT_TIMEOUT_MS, 500)
  })
})
