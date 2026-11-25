import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import {
  commandAnnouncement,
  commandLabelSegments,
  filterCommandItems,
  normalizeCommandQuery,
} from '../src/lib/command.ts'
import { docsSearchFields } from '../src/site/docs-search-fields.ts'
import * as Command from '../src/ui/command.ts'

describe('Command inline state', () => {
  const command = Command.create<'calendar' | 'settings'>()

  it('resets the active result on input and retains the query on selection', () => {
    const initial = Command.init({ id: 'command' })
    const hovered = command.update(
      initial,
      Command.Message.MovedPointerOverItem({
        index: 1,
        screenX: 12,
        screenY: 8,
      }),
    ).model
    assert.deepEqual(hovered.maybeActiveItemIndex, Option.some(1))
    assert.equal(hovered.activationTrigger, 'Pointer')

    const typing = command.update(
      hovered,
      Command.Message.UpdatedInputValue({ value: 'sett' }),
    ).model
    assert.deepEqual(typing.maybeActiveItemIndex, Option.some(0))
    assert.equal(typing.activationTrigger, 'Keyboard')
    assert.equal(typing.isOpen, true)

    for (const result of [
      command.selectItem(typing, 'settings', 'Settings'),
      command.update(
        typing,
        Command.Message.SelectedItem({
          item: 'settings',
          displayText: 'Settings',
          wasSelected: false,
        }),
      ),
    ]) {
      assert.equal(result.model.inputValue, 'sett')
      assert.equal(result.model.isOpen, false)
      assert.deepEqual(result.model.maybeActiveItemIndex, Option.none())
      assert.deepEqual(
        result.outMessage,
        Command.OutMessage.Selected({ value: 'settings' }),
      )
    }
  })
})

describe('Command query policy', () => {
  it('derives result announcements only for nonempty queries', () => {
    assert.equal(commandAnnouncement('', 4), '')
    assert.equal(commandAnnouncement('  ', 0, 'loading'), '')
    assert.equal(commandAnnouncement('a', 0), 'No results')
    assert.equal(commandAnnouncement('a', 1), '1 result')
    assert.equal(commandAnnouncement('a', 3), '3 results')
    assert.equal(commandAnnouncement('a', 3, 'loading'), 'Loading')
    assert.equal(commandAnnouncement('a', 0, 'error'), 'No results')
  })
  it('keeps groups contiguous in best-match order and ranks within each group', () => {
    const items = [
      'Calendar',
      'Search Emoji',
      'Calculator',
      'Profile',
      'Billing',
      'Settings',
    ]
    const itemGroupKey = (item: string) =>
      items.indexOf(item) < 3 ? 'Suggestions' : 'Settings'
    const search = (query: string, resting = '') =>
      filterCommandItems(items, query, resting, item => item, { itemGroupKey })
    assert.deepEqual(search('e'), [
      'Search Emoji',
      'Calendar',
      'Profile',
      'Settings',
    ])
    assert.deepEqual(search('s'), ['Settings', 'Search Emoji'])
    assert.deepEqual(search(''), items)
    assert.deepEqual(search('Profile', 'Profile'), items)
    assert.deepEqual(search('missing'), [])
    assert.deepEqual(
      filterCommandItems([], 'e', '', String, { itemGroupKey }),
      [],
    )
  })
  it('ranks exact documentation titles first and retains lower-weight cross-field matches', () => {
    const pages = [
      {
        title: 'Status Dot',
        slug: 'status-dot',
        description: 'A small colored dot that signals status.',
      },
      {
        title: 'Stat',
        slug: 'stat',
        description: 'A single KPI: a muted label and a prominent value.',
      },
      {
        title: 'Map Styles',
        slug: 'map-styles',
        description:
          'OpenFreeMap presets, custom style URLs or JSON, and Crease UI palette tokens.',
      },
      {
        title: 'Carousel',
        slug: 'carousel',
        description: 'Touch-friendly slides.',
      },
      { title: 'Example', slug: 'example', description: 'c-a-r-o-u-s-e-l' },
    ]
    const search = (query: string) =>
      filterCommandItems(pages, query, '', page => page.title, {
        itemToKeywords: page => docsSearchFields(page, query).keywords,
        itemToFallbackKeywords: page =>
          docsSearchFields(page, query).fallbackKeywords,
      })
    assert.equal(search('stat')[0], pages[1])
    assert.deepEqual(search('kpi'), [pages[1]])
    assert.deepEqual(search('map styles openfreemap'), [pages[2]])
    assert.deepEqual(search('carousel'), [pages[3]])
    assert.deepEqual(search('crsl'), [pages[3]])
    assert.deepEqual(search('tóuch-friendly'), [pages[3]])
    assert.deepEqual(search(''), pages)
    assert.deepEqual(search('missing'), [])
  })
  it('weights fallback keywords below individual keywords', () => {
    const items = [
      { label: 'Other', keywords: [], fallback: ['cat'] },
      { label: 'Example', keywords: ['cat'], fallback: [] },
      { label: 'cat', keywords: [], fallback: [] },
    ]
    assert.deepEqual(
      filterCommandItems(items, 'cat', '', item => item.label, {
        itemToKeywords: item => item.keywords,
        itemToFallbackKeywords: item => item.fallback,
      }),
      [items[2], items[1], items[0]],
    )
  })
  it('segments fuzzy label matches and leaves resting, empty and unmatched queries plain', () => {
    assert.deepEqual(commandLabelSegments('Calendar', 'cl', ''), [
      { text: 'C', match: true },
      { text: 'a', match: false },
      { text: 'l', match: true },
      { text: 'endar', match: false },
    ])
    for (const [label, input, resting] of [
      ['Calendar', 'Calendar', 'Calendar'],
      ['Calendar', '', ''],
      ['Calendar', 'zz', ''],
      ['', 'x', ''],
    ] as const) {
      assert.deepEqual(commandLabelSegments(label, input, resting), [
        { text: label, match: false },
      ])
    }
  })
  it('normalizes whitespace and case', () => {
    assert.equal(normalizeCommandQuery('  SeTT  '), 'sett')
  })

  it('folds accents and preserves empty query behavior', () => {
    const items = ['École', 'Ecole', 'apple']
    assert.deepEqual(filterCommandItems(items, 'ecole', '', String), [
      'École',
      'Ecole',
    ])
    assert.deepEqual(filterCommandItems(items, 'école', '', String), [
      'École',
      'Ecole',
    ])
    assert.equal(filterCommandItems(items, '  ', '', String), items)
    assert.deepEqual(filterCommandItems([], 'x', '', String), [])
    assert.deepEqual(filterCommandItems(items, 'missing', '', String), [])
  })

  it('filters by application-provided search text', () => {
    const items = ['calendar', 'settings', 'search'] as const
    assert.deepEqual(
      filterCommandItems(items, 'pref', '', item =>
        item === 'settings' ? 'Preferences' : item,
      ),
      ['settings'],
    )
  })

  it('keeps the full result set while the selected label is resting', () => {
    const items = ['calendar', 'settings'] as const
    assert.deepEqual(
      filterCommandItems(items, 'Settings', 'Settings', item => item),
      items,
    )
  })

  it('filters a large result collection deterministically', () => {
    const items = Array.from(
      { length: 10_000 },
      (_, index) => `command-${String(index)}`,
    )
    const result = filterCommandItems(items, 'command-999', '', item => item)
    assert.equal(result.length, 37)
    assert.deepEqual(result.slice(0, 11), [
      'command-999',
      'command-9990',
      'command-9991',
      'command-9992',
      'command-9993',
      'command-9994',
      'command-9995',
      'command-9996',
      'command-9997',
      'command-9998',
      'command-9999',
    ])
  })
})
