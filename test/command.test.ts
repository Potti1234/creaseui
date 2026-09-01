import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { filterCommandItems, normalizeCommandQuery } from '../src/lib/command.ts'

describe('Command query policy', () => {
  it('normalizes whitespace and case', () => {
    assert.equal(normalizeCommandQuery('  SeTT  '), 'sett')
  })

  it('filters by application-provided search text', () => {
    const items = ['calendar', 'settings', 'search'] as const
    assert.deepEqual(
      filterCommandItems(items, 'pref', '', item => item === 'settings' ? 'Preferences' : item),
      ['settings'],
    )
  })

  it('keeps the full result set while the selected label is resting', () => {
    const items = ['calendar', 'settings'] as const
    assert.deepEqual(filterCommandItems(items, 'Settings', 'Settings', item => item), items)
  })

  it('filters a large result collection deterministically', () => {
    const items = Array.from({ length: 10_000 }, (_, index) => `command-${String(index)}`)
    const result = filterCommandItems(items, 'command-999', '', item => item)
    assert.deepEqual(result, ['command-999', 'command-9990', 'command-9991', 'command-9992', 'command-9993', 'command-9994', 'command-9995', 'command-9996', 'command-9997', 'command-9998', 'command-9999'])
  })
})
