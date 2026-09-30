import assert from 'node:assert/strict'
import test from 'node:test'

import * as MetadataList from '../src/lib/metadata-list.ts'

test('update toggles the collapsed state', () => {
  const initial = MetadataList.init()
  assert.equal(initial.isOpen, false)
  const open__ = MetadataList.update(initial, MetadataList.Message.ToggledShowAll())
  assert.equal(open__.model.isOpen, true)
  const closed__ = MetadataList.update(open__.model, MetadataList.Message.ToggledShowAll())
  assert.equal(closed__.model.isOpen, false)
})

test('horizontal orientation always stacks labels on top', () => {
  assert.deepEqual(
    MetadataList.resolveLayout({ orientation: 'horizontal' }),
    { kind: 'horizontal', isStacked: true },
  )
  // astryx stacks whenever labelPosition is 'top' OR orientation is 'horizontal'
  assert.equal(
    MetadataList.resolveLayout({
      orientation: 'horizontal',
      label: { position: 'start' },
    }).isStacked,
    true,
  )
})

test('multi-column defaults to top labels; single-column to start labels', () => {
  assert.deepEqual(MetadataList.resolveLayout({ columns: 'multi' }), {
    kind: 'grid-stacked-multi',
    isStacked: true,
  })
  assert.deepEqual(MetadataList.resolveLayout({}), {
    kind: 'grid-single',
    isStacked: false,
  })
  assert.deepEqual(MetadataList.resolveLayout({ columns: 'single', label: { position: 'top' } }), {
    kind: 'grid-stacked-single',
    isStacked: true,
  })
})

test('numeric columns and label widths resolve to grid templates', () => {
  assert.deepEqual(MetadataList.resolveLayout({ columns: 3 }), {
    kind: 'grid-stacked-multi',
    isStacked: true,
    gridTemplateColumns: 'repeat(3, 1fr)',
  })
  assert.deepEqual(
    MetadataList.resolveLayout({ columns: 3, label: { position: 'start' } }),
    {
      kind: 'grid-multi',
      isStacked: false,
      gridTemplateColumns: 'repeat(3, auto minmax(0, 1fr))',
    },
  )
  assert.deepEqual(
    MetadataList.resolveLayout({ label: { position: 'start', width: 120 } }),
    {
      kind: 'grid-single',
      isStacked: false,
      gridTemplateColumns: '120px minmax(0, 1fr)',
    },
  )
})
