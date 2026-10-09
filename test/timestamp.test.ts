import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Schema as S } from 'effect'

import { RoutedDocsPreviewMessage } from '@/docs/components/pages/authored-page'
import { timestampFixtures } from '@/docs/components/pages/timestamp/shared'
import { timestampTailwindPreviewProgram as program } from '@/docs/components/pages/timestamp/tailwind'
import * as Timestamp from '@/ui/timestamp'
import * as HoverCard from '@/lib/hover-card'

import {
  formatInstant,
  formatRelativeTime,
} from '../src/lib/timestamp-format.ts'

const now = new Date(Date.UTC(2024, 5, 15, 12, 0, 0))

const Preview = S.Struct({ stamps: S.Array(Timestamp.Model) })
const preview = (value: unknown): typeof Preview.Type => {
  assert.ok(S.is(Preview)(value))
  return value
}

describe('Timestamp docs previews', () => {
  it('gives every timestamp and hover card a unique ID across examples', () => {
    const stamps = timestampFixtures.flatMap(
      (_, index) => preview(program.init(index)).stamps,
    )
    for (const ids of [
      stamps.map(stamp => stamp.id),
      stamps.map(stamp => stamp.hoverCard.id),
    ]) {
      assert.equal(new Set(ids).size, ids.length)
    }
  })

  it('opens only the requested time-zone stamp and preserves the others', () => {
    const index = timestampFixtures.findIndex(fixture =>
      fixture.title.includes('Tooltip time zones'),
    )
    const initial = program.init(index)
    const next = program.update(
      initial,
      RoutedDocsPreviewMessage.RoutedNativeDocsPreviewMessage({
        message: {
          _tag: 'GotTimestampMessage',
          index: 1,
          message: Timestamp.Message.GotTimestampHoverCardMessage({
            message: HoverCard.Message.FocusedHoverCardTrigger(),
          }),
        },
      }),
    )
    assert.deepEqual(
      preview(next.model).stamps.map(stamp => stamp.hoverCard.isOpen),
      [false, true, false],
    )
    assert.equal(preview(next.model).stamps[0], preview(initial).stamps[0])
    assert.equal(preview(next.model).stamps[2], preview(initial).stamps[2])
  })
})

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
