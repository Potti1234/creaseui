import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import { Combobox } from '@foldkit/ui'

import * as Tokenizer from '../src/lib/tokenizer.ts'
import * as FocusRecovery from '../src/lib/behaviors/focus-recovery.ts'

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
  it('recovers by stable token ID and falls back to the combobox input', () => {
    const tokens = [...people, { id: 'carol', label: 'Carol' }]
    const initial = Tokenizer.init({ id: 'team', tokens })
    const focused = Tokenizer.update(
      initial,
      Tokenizer.Message.FocusedToken({ key: 'bob' }),
    ).model
    const removed = Tokenizer.update(
      focused,
      Tokenizer.Message.RemovedToken({ index: 1 }),
    )
    assert.deepEqual(removed.commands?.[0]?.args, {
      lostId: Tokenizer.tokenRemoveId('team', 'bob'),
      targetId: Tokenizer.tokenRemoveId('team', 'carol'),
    })
    assert.equal(removed.commands?.[0]?.name, FocusRecovery.RecoverFocus.name)
    assert.equal(removed.model.focusRecovery.version, 1)
    const last = Tokenizer.update(
      Tokenizer.init({ id: 'team', tokens: [people[0]] }),
      Tokenizer.Message.FocusedToken({ key: 'alice' }),
    ).model
    assert.deepEqual(
      Tokenizer.update(last, Tokenizer.Message.RemovedToken({ index: 0 }))
        .commands?.[0]?.args,
      {
        lostId: Tokenizer.tokenRemoveId('team', 'alice'),
        targetId: 'team-combobox-input',
      },
    )
  })

  it('clear-all recovers only when a removed token held focus', () => {
    const initial = Tokenizer.init({ id: 'team', tokens: [...people] })
    const focused = Tokenizer.update(
      initial,
      Tokenizer.Message.FocusedToken({ key: 'bob' }),
    ).model
    const cleared = Tokenizer.update(
      focused,
      Tokenizer.Message.ClickedClearAll(),
    )
    assert.equal(cleared.commands?.length, 1)
    assert.equal(cleared.commands?.[0]?.args.targetId, 'team-combobox-input')
    const blurred = Tokenizer.update(
      focused,
      Tokenizer.Message.BlurredToken(),
    ).model
    assert.deepEqual(blurred.focusRecovery.maybeFocusedKey, Option.none())
    for (const model of [initial, blurred]) {
      assert.deepEqual(
        Tokenizer.update(model, Tokenizer.Message.ClickedClearAll()).commands,
        [],
      )
      assert.deepEqual(
        Tokenizer.update(model, Tokenizer.Message.RemovedToken({ index: 0 }))
          .commands,
        [],
      )
    }
    assert.equal(
      Tokenizer.update(
        cleared.model,
        Tokenizer.Message.GotFocusRecoveryMessage({
          message: FocusRecovery.Message.CompletedRecoverFocus(),
        }),
      ).model,
      cleared.model,
    )
  })

  it('leaves focus alone when the input toggles a selected token', () => {
    const initial = Tokenizer.init({ id: 'team', tokens: [...people] })
    const result = select(initial, 'alice')
    assert.deepEqual(result.model.tokens, [people[1]])
    assert.equal(
      result.commands?.some(
        command => command.name === FocusRecovery.RecoverFocus.name,
      ),
      false,
    )
    assert.equal(
      Tokenizer.tokenRemoveId('team', 'a b'),
      'team-token-remove-a b',
    )
  })

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
