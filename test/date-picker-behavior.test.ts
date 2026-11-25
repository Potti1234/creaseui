import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import * as Picker from '@/lib/behaviors/date-picker'
import * as Calendar from '@/lib/behaviors/calendar'

const date = (day: number) => ({ year: 2025, month: 6, day })
const key = (key: string) =>
  Picker.Message.GotCalendarMessage({
    message: Calendar.Message.PressedKeyOnGrid({ key, isShift: false }),
  })
const init = () =>
  Picker.focusDate(
    Picker.init({
      id: 'picker',
      today: date(4),
      disabledDates: [date(1), date(7)],
    }),
    date(4),
  )

describe('DatePicker behavior', () => {
  it('preserves open, selection, close and clear lifecycle', () => {
    const opened = Picker.open(init())
    assert.equal(opened.model.popover.isOpen, true)
    assert.equal(opened.outMessage, undefined)
    assert.deepEqual(opened.commands, [])
    const selected = Picker.selectDate(opened.model, date(4))
    assert.deepEqual(
      selected.outMessage,
      Picker.OutMessage.SelectedDate({ date: date(4) }),
    )
    assert.equal(selected.model.popover.isOpen, false)
    assert.deepEqual(
      Picker.clear(selected.model).outMessage,
      Picker.OutMessage.ClearedDate(),
    )
    assert.equal(Picker.close(opened.model).model.popover.isOpen, false)
  })

  it('routes animation through its owned popover and keeps newer opens after a stale leave', () => {
    const initial = Picker.init({
      id: 'animated-picker',
      today: date(4),
      isAnimated: true,
    })
    const opened = Picker.open(initial)
    const closed = Picker.close(opened.model)
    const reopened = Picker.open(closed.model)
    const stale = Picker.update(
      reopened.model,
      Picker.Message.GotPopoverMessage({
        message: {
          _tag: 'GotAnimationMessage',
          message: {
            _tag: 'CompletedWaitForPaint',
            generation: closed.model.popover.animation.transitionGeneration,
          },
        },
      }),
    )
    assert.equal(closed.model.popover.animation.transitionState, 'LeaveStart')
    assert.equal(stale.model.popover.isOpen, true)
    assert.equal(stale.model.popover.animation.transitionState, 'EnterStart')
    assert.deepEqual(stale.commands, [])
  })

  it('applies the same Home/End and RTL grid fixes', () => {
    assert.deepEqual(
      Picker.update(init(), key('Home')).model.calendar.maybeFocusedDate,
      Option.some(date(2)),
    )
    assert.deepEqual(
      Picker.update(init(), key('End')).model.calendar.maybeFocusedDate,
      Option.some(date(6)),
    )
    assert.deepEqual(
      Picker.update(init(), key('ArrowLeft'), { direction: 'rtl' }).model
        .calendar.maybeFocusedDate,
      Option.some(date(5)),
    )
    const crossing = Picker.update(
      Picker.focusDate(init(), date(30)),
      key('End'),
    )
    assert.deepEqual(
      crossing.outMessage,
      Picker.OutMessage.ChangedViewMonth({ year: 2025, month: 7 }),
    )
  })

  it('does not move in an entirely disabled row or select a disabled date', () => {
    const model = Picker.reflectDisabledDates(
      init(),
      Array.from({ length: 7 }, (_, i) => date(i + 1)),
    )
    assert.equal(
      Picker.update(model, key('Home')).model.calendar,
      model.calendar,
    )
    assert.equal(Picker.selectDate(model, date(1)).outMessage, undefined)
    assert.deepEqual(
      Picker.clear(model).outMessage,
      Picker.OutMessage.ClearedDate(),
    )
  })
})
