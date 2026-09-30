import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as MultiSelector from '../src/lib/multi-selector.ts'

describe('MultiSelector submodel', () => {
  it('initializes with seeded values and option set', () => {
    const model = MultiSelector.init({
      id: 'columns',
      values: ['name'],
      optionValues: ['name', 'email'],
    })
    assert.deepEqual(model.values, ['name'])
    assert.deepEqual(model.optionValues, ['name', 'email'])
    assert.equal(model.listbox.isOpen, false)
  })

  it('reflect replaces the committed selection', () => {
    const model = MultiSelector.init({ id: 'columns', values: ['a'] })
    const synced = MultiSelector.reflect(model, ['b', 'c'])
    assert.deepEqual(synced.values, ['b', 'c'])
  })

  it('reflectOptions updates the set the select-all row toggles', () => {
    const model = MultiSelector.init({
      id: 'columns',
      optionValues: ['a', 'b'],
    })
    const synced = MultiSelector.reflectOptions(model, ['c', 'd'])
    assert.deepEqual(synced.optionValues, ['c', 'd'])
    assert.deepEqual(synced.values, [])
  })

  it('clear-all empties the selection once', () => {
    const model = MultiSelector.init({ id: 'columns', values: ['a', 'b'] })
    const cleared = MultiSelector.update(
      model,
      MultiSelector.Message.ClickedClearAll({}),
    )
    assert.deepEqual(cleared.model.values, [])
    assert.deepEqual(cleared.outMessage, {
      _tag: 'ChangedValues',
      values: [],
    })
    const again = MultiSelector.update(
      cleared.model,
      MultiSelector.Message.ClickedClearAll({}),
    )
    assert.equal(again.outMessage === undefined, true)
  })
})
