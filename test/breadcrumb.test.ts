import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { collapseBreadcrumbItems, type BreadcrumbTrailItem } from '../src/lib/breadcrumb.ts'

const items: ReadonlyArray<BreadcrumbTrailItem> = [
  { kind: 'link', label: 'Home', href: '/' },
  { kind: 'link', label: 'Workspace', href: '/workspace' },
  { kind: 'link', label: 'Projects', href: '/workspace/projects' },
  { kind: 'link', label: 'Crease UI', href: '/workspace/projects/crease-ui' },
  { kind: 'page', label: 'Breadcrumb' },
]

describe('Breadcrumb trail policy', () => {
  it('preserves route data when the trail fits', () => {
    assert.deepEqual(collapseBreadcrumbItems(items, 5), items)
  })

  it('collapses only middle ancestors and keeps the current page', () => {
    assert.deepEqual(collapseBreadcrumbItems(items, 4), [
      items[0],
      { kind: 'ellipsis', label: '2 omitted levels' },
      items[3],
      items[4],
    ])
  })

  it('respects an explicitly authored ellipsis', () => {
    const authored: ReadonlyArray<BreadcrumbTrailItem> = [items[0]!, { kind: 'ellipsis' }, items[4]!]
    assert.equal(collapseBreadcrumbItems(authored, 3), authored)
  })
})
