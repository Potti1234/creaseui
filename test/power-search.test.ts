import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as PowerSearch from '../src/ui/power-search.ts'

const config: PowerSearch.PowerSearchConfig = {
  name: 'TestSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ],
          },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        { key: 'contains', label: 'contains', value: { type: 'string' } },
      ],
    },
  ],
}

describe('PowerSearch', () => {
  it('indexes fields by key in the internal config', () => {
    const internal = PowerSearch.createInternalConfig(config)
    assert.ok(internal.fieldsByKey.has('status'))
    assert.ok(internal.fieldsByKey.has('title'))
  })

  it('formats an enum filter value using its label', () => {
    const internal = PowerSearch.createInternalConfig(config)
    const text = PowerSearch.formatFilterValue(
      internal,
      {
        type: 'enum',
        values: [
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ],
      },
      { type: 'enum', value: 'open' },
      30,
    )
    assert.match(text, /Open/)
  })

  it('builds a config + applyFilters pair from field definitions', () => {
    const { config: generated, applyFilters } =
      PowerSearch.createPowerSearchConfig(
        [
          { key: 'title', type: 'string', label: 'Title' },
          { key: 'year', type: 'number', label: 'Year' },
        ],
        'Books',
      )
    const books = [
      { title: 'Dune', year: 1965 },
      { title: 'Sapiens', year: 2011 },
    ]
    const filtered = applyFilters(
      [
        {
          field: 'title',
          operator: 'contains',
          value: { type: 'string', value: 'dune' },
        },
      ],
      books,
    )
    assert.deepEqual(
      filtered.map((book) => book.title),
      ['Dune'],
    )
    assert.ok(generated.fields.some((field) => field.key === 'year'))
  })
})
