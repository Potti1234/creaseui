import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as Tokenizer from '../src/lib/tokenizer.ts'

const people = [
  { id: 'alice', label: 'Alice' },
  { id: 'bob', label: 'Bob' },
] as const

describe('Tokenizer submodel', () => {
  it('initializes empty and registers labels from items', () => {
    const model = Tokenizer.init({ id: 'tags', items: [...people] })
    assert.deepEqual(model.tokens, [])
    assert.deepEqual(model.itemLabels, { alice: 'Alice', bob: 'Bob' })
    assert.equal(Option.isNone(model.maxEntries), true)
    assert.equal(model.combobox.inputValue, '')
    assert.equal(model.combobox.isOpen, false)
  })

  it('seeds tokens and merges their labels', () => {
    const model = Tokenizer.init({
      id: 'team',
      tokens: [people[0]],
      items: [people[1]],
    })
    assert.deepEqual(model.tokens, [people[0]])
    assert.deepEqual(model.itemLabels, { alice: 'Alice', bob: 'Bob' })
  })

  it('removes a token by index and emits ChangedTokens', () => {
    const model = Tokenizer.init({ id: 'team', tokens: [...people] })
    const next = Tokenizer.update(
      model,
      Tokenizer.Message.RemovedToken({ index: 0 }),
    )
    assert.deepEqual(next.model.tokens, [people[1]])
    assert.deepEqual(next.outMessage, {
      _tag: 'ChangedTokens',
      tokens: [people[1]],
    })
  })

  it('clear-all empties the selection once', () => {
    const model = Tokenizer.init({ id: 'team', tokens: [...people] })
    const cleared = Tokenizer.update(
      model,
      Tokenizer.Message.ClickedClearAll({}),
    )
    assert.deepEqual(cleared.model.tokens, [])
    assert.deepEqual(cleared.outMessage, {
      _tag: 'ChangedTokens',
      tokens: [],
    })
    const again = Tokenizer.update(
      cleared.model,
      Tokenizer.Message.ClickedClearAll({}),
    )
    assert.equal(again.outMessage === undefined, true)
  })

  it('reflect syncs externally-derived tokens and labels', () => {
    const model = Tokenizer.init({ id: 'team' })
    const synced = Tokenizer.reflect(model, [people[1]])
    assert.deepEqual(synced.tokens, [people[1]])
    assert.equal(synced.itemLabels['bob'], 'Bob')
  })

  it('reflectItems registers labels without changing tokens', () => {
    const model = Tokenizer.init({ id: 'team', tokens: [people[0]] })
    const synced = Tokenizer.reflectItems(model, [people[1]])
    assert.deepEqual(synced.tokens, [people[0]])
    assert.equal(synced.itemLabels['bob'], 'Bob')
  })

  it('stores maxEntries when provided', () => {
    const model = Tokenizer.init({ id: 'team', maxEntries: 3 })
    assert.deepEqual(model.maxEntries, Option.some(3))
  })
})
