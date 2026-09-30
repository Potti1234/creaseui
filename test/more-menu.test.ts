import assert from 'node:assert/strict'
import test from 'node:test'

import { flattenOptions } from '../src/lib/more-menu.ts'

test('flat actions map to items with their config', () => {
  const flat = flattenOptions([
    { label: 'Edit' },
    { label: 'Delete', variant: 'destructive', isDisabled: true },
  ])
  assert.equal(flat.length, 2)
  assert.equal(flat[0]?.item, 'Edit')
  assert.deepEqual(flat[1]?.config, {
    label: 'Delete',
    variant: 'destructive',
    isDisabled: true,
  })
})

test('a divider attaches separatorBefore to the next action', () => {
  const flat = flattenOptions([
    { label: 'Edit' },
    { type: 'divider' },
    { type: 'divider' },
    { label: 'Delete' },
  ])
  assert.equal(flat.length, 2)
  assert.equal(flat[0]?.config.separatorBefore, undefined)
  assert.equal(flat[1]?.config.separatorBefore, true)
})

test('sections group their actions under the section title', () => {
  const flat = flattenOptions([
    {
      type: 'section',
      title: 'Actions',
      items: [{ label: 'Edit' }, { label: 'Duplicate' }],
    },
    {
      type: 'section',
      title: 'Danger zone',
      items: [{ label: 'Delete', variant: 'destructive' }],
    },
  ])
  assert.deepEqual(
    flat.map((entry) => entry.config.group),
    ['Actions', 'Actions', 'Danger zone'],
  )
  assert.equal(flat[2]?.config.variant, 'destructive')
})

test('a trailing divider produces no dangling item', () => {
  const flat = flattenOptions([{ label: 'Edit' }, { type: 'divider' }])
  assert.equal(flat.length, 1)
})
