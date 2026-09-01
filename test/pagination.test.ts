import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { normalizePagination, paginationItems } from '../src/lib/pagination.ts'

describe('Pagination range policy', () => {
  it('keeps finite boundaries and siblings around the current page', () => {
    assert.deepEqual(paginationItems({ page: 5, totalPages: 10, siblingCount: 1, boundaryCount: 1 }), [
      1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10,
    ])
  })

  it('uses the missing page instead of an ellipsis for a one-page gap', () => {
    assert.deepEqual(paginationItems({ page: 3, totalPages: 5, siblingCount: 0, boundaryCount: 1 }), [1, 2, 3, 4, 5])
  })

  it('supports the compact mobile neighborhood', () => {
    assert.deepEqual(paginationItems({ page: 6, totalPages: 12, siblingCount: 0, boundaryCount: 1 }), [
      1, 'start-ellipsis', 6, 'end-ellipsis', 12,
    ])
  })

  it('normalizes invalid external page values deterministically', () => {
    assert.deepEqual(normalizePagination({ page: 99, totalPages: 8, siblingCount: -1, boundaryCount: 99 }), {
      page: 8, totalPages: 8, siblingCount: 0, boundaryCount: 8,
    })
  })
})
