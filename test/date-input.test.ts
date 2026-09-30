import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import * as Calendar from 'foldkit/calendar'

import * as DateInput from '../src/lib/date-input.ts'

const today = Calendar.make(2026, 9, 30)

describe('DateInput submodel', () => {
  it('initializes empty with no committed value', () => {
    const model = DateInput.init({ id: 'birthday', today })
    assert.equal(model.id, 'birthday')
    assert.equal(Option.isNone(model.value), true)
    assert.equal(Option.isNone(model.pendingInput), true)
    assert.equal(model.isInputInvalid, false)
    assert.equal(model.locale, 'en')
  })

  it('seeds a committed value and points the calendar view at it', () => {
    const value = Calendar.make(2026, 3, 14)
    const model = DateInput.init({ id: 'start', today, value })
    assert.deepEqual(model.value, Option.some(value))
    assert.equal(model.datePicker.calendar.viewYear, 2026)
    assert.equal(model.datePicker.calendar.viewMonth, 3)
  })

  it('reflect clears pending text and invalid flags', () => {
    const value = Calendar.make(2026, 1, 1)
    const seeded = DateInput.init({ id: 'end', today })
    const dirty = {
      ...seeded,
      pendingInput: Option.some('not a date'),
      isInputInvalid: true,
    }
    const synced = DateInput.reflect(dirty, Option.some(value))
    assert.deepEqual(synced.value, Option.some(value))
    assert.equal(Option.isNone(synced.pendingInput), true)
    assert.equal(synced.isInputInvalid, false)
  })

  it('open/close drive the embedded calendar popover', () => {
    const model = DateInput.init({ id: 'openable', today })
    const opened = DateInput.open(model)
    assert.equal(opened.model.datePicker.popover.isOpen, true)
    const closed = DateInput.close(opened.model)
    assert.equal(closed.model.datePicker.popover.isOpen, false)
  })
})
