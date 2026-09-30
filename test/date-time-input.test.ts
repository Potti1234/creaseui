import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import * as Calendar from 'foldkit/calendar'

import * as DateTimeInput from '../src/lib/date-time-input.ts'

const today = Calendar.make(2026, 9, 30)

describe('DateTimeInput submodel', () => {
  it('initializes empty with 12-hour format and no seconds', () => {
    const model = DateTimeInput.init({ id: 'meeting', today })
    assert.equal(model.id, 'meeting')
    assert.equal(Option.isNone(model.value), true)
    assert.equal(model.hourFormat, '12h')
    assert.equal(model.hasSeconds, false)
    assert.equal(model.hasTimeOptions, false)
    assert.equal(model.timeIncrementMinutes, 1)
    assert.equal(Option.isNone(model.pendingDateInput), true)
    assert.equal(Option.isNone(model.pendingTimeInput), true)
  })

  it('seeds a committed date-time value', () => {
    const value = {
      date: Calendar.make(2026, 3, 14),
      time: '14:30:00',
    }
    const model = DateTimeInput.init({
      id: 'appointment',
      today,
      value,
      hourFormat: '24h',
      hasSeconds: true,
    })
    assert.deepEqual(model.value, Option.some(value))
    assert.equal(model.hourFormat, '24h')
    assert.equal(model.hasSeconds, true)
    assert.equal(model.datePicker.calendar.viewYear, 2026)
    assert.equal(model.datePicker.calendar.viewMonth, 3)
  })

  it('reflect replaces the committed value', () => {
    const model = DateTimeInput.init({ id: 'slot', today })
    const value = {
      date: Calendar.make(2026, 12, 25),
      time: '09:00:00',
    }
    const synced = DateTimeInput.reflect(model, value)
    assert.deepEqual(synced.value, Option.some(value))
    const cleared = DateTimeInput.reflect(synced, undefined)
    assert.equal(Option.isNone(cleared.value), true)
  })

  it('exposes distinct ids for the date and time inputs', () => {
    assert.equal(DateTimeInput.dateInputId('when'), 'when-date')
    assert.equal(DateTimeInput.timeInputId('when'), 'when-time')
  })
})
