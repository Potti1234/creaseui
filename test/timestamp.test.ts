import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  formatInstant,
  formatRelativeTime,
} from '../src/lib/timestamp-format.ts'

const now = new Date(Date.UTC(2024, 5, 15, 12, 0, 0))

describe('Timestamp formatting', () => {
  it('formats an instant as a date-time string', () => {
    const text = formatInstant(
      new Date(Date.UTC(2024, 0, 5, 15, 30, 0)),
      'date_time',
    )
    assert.match(text, /2024/u)
  })

  it('formats sub-minute diffs as just now', () => {
    const text = formatRelativeTime(
      new Date(now.getTime() - 5_000),
      now,
      'long',
    )
    assert.match(text, /now|second/u)
  })

  it('formats minute and day diffs relatively', () => {
    assert.match(
      formatRelativeTime(new Date(now.getTime() - 5 * 60_000), now, 'long'),
      /5\s*minutes?|5\s*min/u,
    )
    assert.match(
      formatRelativeTime(new Date(now.getTime() - 2 * 86_400_000), now, 'long'),
      /2\s*days?/u,
    )
  })
})
