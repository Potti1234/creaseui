import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Context, Option } from 'effect'
import * as FoldkitCalendar from '@foldkit/ui/calendar'
import {
  __clearRuntime,
  __htmlBuilder,
  __setRuntime,
} from '../node_modules/foldkit/dist/html/index.js'
import * as Calendar from '@/lib/behaviors/calendar'

const date = (day: number, month = 6) => ({ year: 2025, month, day })
const key = (key: string) =>
  Calendar.Message.PressedKeyOnGrid({ key, isShift: false })
const init = (disabledDates: ReadonlyArray<ReturnType<typeof date>> = []) =>
  Calendar.focusDate(
    Calendar.init({ id: 'calendar', today: date(4), disabledDates }),
    date(4),
  )

describe('Calendar behavior', () => {
  it('preserves the model, commands, and out messages of the existing navigation API', () => {
    const config = {
      id: 'calendar',
      today: date(4),
      initialViewDate: date(31, 5),
      minDate: date(1, 5),
      disabledDates: [date(1)],
    }
    let model = Calendar.init(config)
    assert.deepEqual(model, FoldkitCalendar.init(config))
    for (const message of [
      key('ArrowRight'),
      key('PageDown'),
      Calendar.Message.FocusedGrid(),
      key('Enter'),
      Calendar.Message.ClickedHeading(),
      key('ArrowDown'),
      Calendar.Message.ClickedHeading(),
      Calendar.Message.PagedYears({ direction: 1 }),
      Calendar.Message.SelectedYear({ year: 2034 }),
      Calendar.Message.SelectedMonth({ month: 2 }),
      Calendar.Message.ClickedPreviousMonthButton(),
      Calendar.Message.BlurredGrid(),
    ]) {
      const result = Calendar.update(model, message)
      const expected = FoldkitCalendar.update(model, message)
      assert.deepEqual(result.model, expected.model)
      assert.deepEqual(result.outMessage, expected.outMessage)
      assert.deepEqual(
        result.commands?.map(({ name, args }) => ({ name, args })),
        expected.commands?.map(({ name, args }) => ({ name, args })),
      )
      model = result.model
    }
  })

  it('preserves grid attributes and controlled selection in every view mode', () => {
    const h = __htmlBuilder<Calendar.Message>()
    const baseModel = Calendar.update(
      init([date(1)]),
      Calendar.Message.FocusedGrid(),
    ).model
    const attributes = (view: typeof Calendar.view, model: Calendar.Model) => {
      let result: Calendar.CalendarAttributes | undefined
      view(
        model,
        {
          maybeSelectedDate: Option.some(date(5)),
          toView: value => {
            result = value
            return null
          },
        },
        h,
      )
      assert.ok(result)
      return result
    }

    __setRuntime(() => undefined, Context.empty())
    try {
      for (const viewMode of ['Days', 'Months', 'Years'] as const) {
        const model = { ...baseModel, viewMode }
        const actual = attributes(Calendar.view, model)
        const expected = attributes(FoldkitCalendar.view, model)
        // Compare attributes and cell metadata with handler identity omitted.
        assert.deepEqual(
          JSON.parse(JSON.stringify(actual)),
          JSON.parse(JSON.stringify(expected)),
        )
      }
    } finally {
      __clearRuntime()
    }
  })

  it('mirrors only horizontal grid keys in RTL', () => {
    assert.equal(
      Calendar.mirrorNavigationKeyForRtl(key('ArrowLeft')).key,
      'ArrowRight',
    )
    for (const [direction, expected] of [
      ['ltr', 3],
      ['rtl', 5],
    ] as const) {
      assert.deepEqual(
        Calendar.update(init(), key('ArrowLeft'), { direction }).model
          .maybeFocusedDate,
        Option.some(date(expected)),
      )
    }
    const message = Calendar.Message.ClickedHeading()
    assert.equal(Calendar.mirrorNavigationKeyForRtl(message), message)
    assert.equal(Calendar.mirrorNavigationKeyForRtl(key('Home')).key, 'Home')
  })

  it('keeps Home and End inside a row with disabled edges', () => {
    const model = init([date(1), date(7)])
    assert.deepEqual(
      Calendar.update(model, key('Home')).model.maybeFocusedDate,
      Option.some(date(2)),
    )
    assert.deepEqual(
      Calendar.update(model, key('End')).model.maybeFocusedDate,
      Option.some(date(6)),
    )
    assert.equal(Calendar.isDisabled(model, date(1)), true)
  })

  it('emits month crossing and does nothing for a fully disabled row', () => {
    const model = Calendar.focusDate(init([date(31, 5)]), date(1))
    const result = Calendar.update(model, key('Home'))
    assert.deepEqual(result.model.maybeFocusedDate, Option.some(date(1)))
    const crossing = Calendar.update(
      Calendar.focusDate(init(), date(30)),
      key('End'),
    )
    assert.deepEqual(
      crossing.outMessage,
      Calendar.OutMessage.ChangedViewMonth({ year: 2025, month: 7 }),
    )
    const disabled = init(Array.from({ length: 7 }, (_, i) => date(i + 1)))
    assert.equal(Calendar.update(disabled, key('End')).model, disabled)
  })

  it('normalizes and classifies ranges including empty and single ranges', () => {
    const range = { start: date(5), end: date(2) }
    assert.deepEqual(Calendar.normalizeRange(range), {
      start: date(2),
      end: date(5),
    })
    for (const [day, position] of [
      [1, 'outside'],
      [2, 'start'],
      [3, 'middle'],
      [5, 'end'],
    ] as const)
      assert.equal(Calendar.rangePosition(date(day), range), position)
    assert.equal(Calendar.rangePosition(date(2), undefined), 'outside')
    assert.equal(
      Calendar.rangePosition(date(2), { start: date(2), end: date(2) }),
      'single',
    )
    assert.throws(
      () => Calendar.dateInTimeZone(new Date(), 'Not/AZone'),
      RangeError,
    )
  })
})
