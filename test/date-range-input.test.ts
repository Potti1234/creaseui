import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import * as Calendar from 'foldkit/calendar'

import * as DateRangeInput from '../src/lib/date-range-input.ts'

const today = Calendar.make(2026, 9, 30)

const range = (
  start: Calendar.CalendarDate,
  end: Calendar.CalendarDate,
): DateRangeInput.Range => ({ start, end })

describe('DateRangeInput range policy', () => {
  it('initializes empty with default span bounds', () => {
    const model = DateRangeInput.init({ id: 'stay', today })
    assert.equal(Option.isNone(model.value), true)
    assert.equal(Option.isNone(model.pendingStart), true)
    assert.equal(model.minRangeSpan, 1)
    assert.equal(Option.isNone(model.maxRangeSpan), true)
  })

  it('counts the inclusive day span of a range', () => {
    assert.equal(
      DateRangeInput.rangeSpan(
        range(Calendar.make(2026, 9, 1), Calendar.make(2026, 9, 1)),
      ),
      1,
    )
    assert.equal(
      DateRangeInput.rangeSpan(
        range(Calendar.make(2026, 9, 1), Calendar.make(2026, 9, 7)),
      ),
      7,
    )
  })

  it('enforces minRangeSpan and maxRangeSpan on committability', () => {
    const model = DateRangeInput.init({
      id: 'bounded',
      today,
      minRangeSpan: 2,
      maxRangeSpan: 5,
    })
    const threeDay = range(
      Calendar.make(2026, 9, 1),
      Calendar.make(2026, 9, 3),
    )
    const singleDay = range(
      Calendar.make(2026, 9, 1),
      Calendar.make(2026, 9, 1),
    )
    const tenDay = range(
      Calendar.make(2026, 9, 1),
      Calendar.make(2026, 9, 10),
    )
    assert.equal(DateRangeInput.isRangeCommittable(model, threeDay), true)
    assert.equal(DateRangeInput.isRangeCommittable(model, singleDay), false)
    assert.equal(DateRangeInput.isRangeCommittable(model, tenDay), false)
  })

  it('seeds a committed range into the calendar view', () => {
    const model = DateRangeInput.init({
      id: 'preset',
      today,
      value: range(Calendar.make(2026, 3, 14), Calendar.make(2026, 3, 20)),
    })
    assert.equal(model.calendar.viewYear, 2026)
    assert.equal(model.calendar.viewMonth, 3)
  })
})
