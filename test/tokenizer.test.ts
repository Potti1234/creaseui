import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import { Combobox } from '@foldkit/ui'

import * as Tokenizer from '../src/lib/tokenizer.ts'

const people = [
  { id: 'alice', label: 'Alice' },
  { id: 'bob', label: 'Bob' },
] as const

const typeQuery = (model: Tokenizer.Model, value: string) =>
  Tokenizer.update(
    model,
    Tokenizer.Message.GotComboboxMessage({
      message: Combobox.Message.UpdatedInputValue({ value }),
    }),
  ).model

const select = (model: Tokenizer.Model, value: string) =>
  Tokenizer.update(
    model,
    Tokenizer.Message.GotComboboxMessage({
      message: Combobox.Message.SelectedItem({
        item: value,
        displayText: value,
        wasSelected: false,
      }),
    }),
  )

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

  it('clears the query after creating a token and stays open for the next one', () => {
    const typed = typeQuery(Tokenizer.init({ id: 'tags' }), '  New tag  ')
    const created = select(typed, `${Tokenizer.CREATE_ID_PREFIX}New tag`)
    assert.deepEqual(created.model.tokens, [
      { id: 'New tag', label: 'New tag' },
    ])
    assert.deepEqual(created.outMessage, {
      _tag: 'ChangedTokens',
      tokens: created.model.tokens,
    })
    assert.equal(created.model.combobox.inputValue, '')
    assert.equal(created.model.combobox.isOpen, true)
    const next = select(
      typeQuery(created.model, 'Next tag'),
      `${Tokenizer.CREATE_ID_PREFIX}Next tag`,
    )
    assert.deepEqual(
      next.model.tokens.map(token => token.label),
      ['New tag', 'Next tag'],
    )
    assert.equal(next.model.combobox.inputValue, '')
  })

  it('retains the query when a duplicate or entry limit prevents creation', () => {
    for (const config of [
      { tokens: [{ id: 'New tag', label: 'New tag' }] },
      { tokens: [people[0]], maxEntries: 1 },
    ]) {
      const typed = typeQuery(
        Tokenizer.init({ id: 'tags', ...config }),
        'New tag',
      )
      const rejected = select(typed, `${Tokenizer.CREATE_ID_PREFIX}New tag`)
      assert.deepEqual(rejected.model.tokens, typed.tokens)
      assert.equal(rejected.model.combobox.inputValue, 'New tag')
      assert.equal(rejected.outMessage, undefined)
    }
  })

  it('keeps the existing search query when selecting a predefined item', () => {
    const typed = typeQuery(
      Tokenizer.init({ id: 'team', items: [...people] }),
      'Ali',
    )
    const selected = select(typed, 'alice')
    assert.deepEqual(selected.model.tokens, [people[0]])
    assert.equal(selected.model.combobox.inputValue, 'Ali')
  })
})
