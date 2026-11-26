import assert from 'node:assert/strict'
import { test } from 'node:test'

import { UiSchema } from '@effect/ui'
import { Html, HtmlServer } from '@effect/ui/html'
import { HtmlLocator, HtmlPlay } from '@effect/ui/html/testing'
import { Locator, TestHost } from '@effect/ui/testing'
import { Effect, Schema } from 'effect'

import { CalendarDate, CalendarRange } from '../src/behaviors/calendar'
import { Calendar, RangeCalendar } from '../src/ui/calendar'

const Message = UiSchema.TaggedEnum({ Selected: { date: CalendarDate } })
const CalendarFixture = Html.component({
  name: 'CalendarFixture',
  model: Schema.NullOr(CalendarDate),
  message: Message,
}).make({
  init: () => '2028-02-29',
  update: (_, { date }) => date,
  view: (h, value) =>
    h.div(
      Calendar(h, {
        props: {
          today: '2028-02-29',
          value,
          locale: 'en-US',
          disabledDates: ['2028-02-28'],
        },
        onEmit: { Picked: ({ date }) => Message.Selected({ date }) },
      }),
      h.output(value ?? 'No date'),
    ),
})

test('calendar stays serializable and renders a selected leap day', async () => {
  assert.equal(Schema.is(CalendarDate)('2027-02-29'), false)
  const { html } = await Effect.runPromise(
    HtmlServer.renderToHtml(CalendarFixture, {}),
  )
  assert.match(html, /role="grid"/)
  assert.match(html, /aria-selected="true".*February 29, 2028/)
  assert.match(
    html,
    /aria-label="Monday, February 28, 2028"[^>]*aria-disabled="true"/,
  )
})

test('a calendar click is delivered to the part owner before emitting the selected date', () =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const play = yield* HtmlPlay.make(CalendarFixture, {})
        yield* play.click(
          HtmlLocator.role('button', { name: 'Sunday, February 27, 2028' }),
        )
        yield* play.expect(HtmlLocator.role('status')).toHaveText('2028-02-27')
        yield* play.expect(Locator.attr('aria-selected', 'true')).toHaveCount(1)
      }),
    ).pipe(Effect.provide(TestHost.layer())),
  ))

test('Calendar month navigation keeps the controlled selection', () =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const play = yield* HtmlPlay.make(CalendarFixture, {})
        yield* play.click(HtmlLocator.role('button', { name: 'Next month' }))
        yield* play.expect(HtmlLocator.role('heading')).toHaveText('March 2028')
        yield* play.expect(HtmlLocator.role('status')).toHaveText('2028-02-29')
      }),
    ).pipe(Effect.provide(TestHost.layer())),
  ))

const RangeMessage = UiSchema.TaggedEnum({ Picked: CalendarRange.fields })
const RangeFixture = Html.component({
  name: 'CalendarRangeFixture',
  model: Schema.NullOr(CalendarRange),
  message: RangeMessage,
}).make({
  init: () => null,
  update: (_, { start, end }) => ({ start, end }),
  view: (h, value) =>
    h.div(
      RangeCalendar(h, {
        props: { today: '2028-02-29', value, locale: 'en-US' },
        onEmit: {
          Picked: ({ start, end }) => RangeMessage.Picked({ start, end }),
        },
      }),
      h.output(value === null ? 'No range' : `${value.start} to ${value.end}`),
    ),
})

test('Range Calendar emits both ISO dates after the second pick', () =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const play = yield* HtmlPlay.make(RangeFixture, {})
        yield* play.click(
          HtmlLocator.role('button', { name: 'Tuesday, February 29, 2028' }),
        )
        yield* play.expect(HtmlLocator.role('status')).toHaveText('No range')
        yield* play.click(
          HtmlLocator.role('button', { name: 'Sunday, February 27, 2028' }),
        )
        yield* play
          .expect(HtmlLocator.role('status'))
          .toHaveText('2028-02-27 to 2028-02-29')
        yield* play.expect(Locator.attr('aria-selected', 'true')).toHaveCount(3)
      }),
    ).pipe(Effect.provide(TestHost.layer())),
  ))
