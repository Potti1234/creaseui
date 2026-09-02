import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { dateInTimeZone, normalizeRange, rangePosition } from '@/lib/calendar'

describe('Calendar controlled contract', () => {
  it('normalizes parent-owned ranges and classifies each endpoint', () => {
    const range = normalizeRange({ start: { year: 2026, month: 7, day: 20 }, end: { year: 2026, month: 7, day: 14 } })
    assert.deepEqual(range, { start: { year: 2026, month: 7, day: 14 }, end: { year: 2026, month: 7, day: 20 } })
    assert.equal(rangePosition({ year: 2026, month: 7, day: 14 }, range), 'start')
    assert.equal(rangePosition({ year: 2026, month: 7, day: 17 }, range), 'middle')
    assert.equal(rangePosition({ year: 2026, month: 7, day: 20 }, range), 'end')
    assert.equal(rangePosition({ year: 2026, month: 7, day: 21 }, range), 'outside')
  })

  it('converts instants only at an explicit time-zone boundary', () => {
    const instant = new Date('2026-01-01T00:30:00Z')
    assert.deepEqual(dateInTimeZone(instant, 'America/Los_Angeles'), { year: 2025, month: 12, day: 31 })
    assert.deepEqual(dateInTimeZone(instant, 'Europe/Berlin'), { year: 2026, month: 1, day: 1 })
  })

  it('keeps committed selection outside the shared Calendar model', () => {
    for (const source of [readFileSync('src/ui/calendar.ts', 'utf8'), readFileSync('src/stylex/calendar.ts', 'utf8')]) {
      assert.match(source, /maybeSelectedDate/u)
      assert.match(source, /CalendarPrimitive\.Model/u)
      assert.match(source, /CalendarBehavior\.rangePosition/u)
      assert.match(source, /direction\?: 'ltr' \| 'rtl'/u)
      assert.doesNotMatch(source, /selectedDate:\s*S\./u)
    }
  })
})
