import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as MultiSelector from '../src/lib/multi-selector.ts'
import { filterOptions } from '../src/lib/multi-selector-view.ts'
import { Option } from 'effect'

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

  it('search matches labels case-insensitively and ignores surrounding spaces', () => {
    assert.deepEqual(
      filterOptions(
        [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'de', label: 'Germany' },
        ],
        ' UNITED ',
      ).map(option => option.value),
      ['us', 'uk'],
    )
  })

  it('changing the query retains selections and clears a stale active option', () => {
    const model = MultiSelector.init({ id: 'countries', values: ['de'] })
    const next = MultiSelector.update(
      {
        ...model,
        listbox: { ...model.listbox, maybeActiveItemIndex: Option.some(9) },
      },
      MultiSelector.Message.ChangedSearch({ query: 'united' }),
    )
    assert.deepEqual(next.model.values, ['de'])
    assert.equal(next.model.query, 'united')
    assert.ok(Option.isNone(next.model.listbox.maybeActiveItemIndex))
    assert.equal(next.outMessage, undefined)
  })

  it('select-all toggles filtered options while preserving hidden selections', () => {
    const model = MultiSelector.init({
      id: 'countries',
      values: ['de', 'us'],
      optionValues: ['de', 'us', 'uk'],
    })
    const message = MultiSelector.Message.ClickedSelectAll({
      optionValues: ['us', 'uk'],
    })
    const selected = MultiSelector.update(model, message)
    assert.deepEqual(selected.model.values, ['de', 'us', 'uk'])
    const cleared = MultiSelector.update(selected.model, message)
    assert.deepEqual(cleared.model.values, ['de'])
    assert.deepEqual(cleared.outMessage, {
      _tag: 'ChangedValues',
      values: ['de'],
    })
    assert.deepEqual(
      MultiSelector.update(
        cleared.model,
        MultiSelector.Message.ClickedSelectAll({ optionValues: [] }),
      ).model.values,
      ['de'],
    )
  })

  it('drawer opening and dismissal synchronize the list while retaining choices', () => {
    const model = MultiSelector.init({ id: 'teams', values: ['design'] })
    const opened = MultiSelector.update(
      model,
      MultiSelector.Message.RequestedOpenDrawer({ initialIndex: 1 }),
    )
    assert.equal(opened.model.drawer.dialog.isOpen, true)
    assert.equal(opened.model.listbox.isOpen, true)
    assert.deepEqual(opened.model.listbox.maybeActiveItemIndex, Option.some(1))
    const closed = MultiSelector.update(
      { ...opened.model, query: 'design' },
      MultiSelector.Message.RequestedCloseDrawer(),
    )
    assert.equal(closed.model.drawer.dialog.isOpen, false)
    assert.equal(closed.model.listbox.isOpen, false)
    assert.deepEqual(closed.model.values, ['design'])
    assert.equal(closed.model.query, '')
    assert.equal(closed.outMessage, undefined)
  })
})
