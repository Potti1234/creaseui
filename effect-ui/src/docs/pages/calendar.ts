import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Calendar, Input, RangeCalendar } from '#components'
import { calendarClasses } from '../../ui/calendar'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const today = '2026-07-28'
const initialRange = { start: '2026-07-14', end: '2026-07-20' }
const Message = UiSchema.TaggedEnum({
  PickedDate: { value: Schema.NullOr(Schema.String) },
  PickedRange: {
    value: Schema.NullOr(
      Schema.Struct({
        start: Schema.String,
        end: Schema.String,
      }),
    ),
  },
  PickedPreset: { days: Schema.Number },
})
const shift = (days: number) => {
  const date = new Date(`${today}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
const CalendarDemo = Html.component({
  name: 'DocsCalendarDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({
    date: Schema.NullOr(Schema.String),
    range: Schema.NullOr(
      Schema.Struct({
        start: Schema.String,
        end: Schema.String,
      }),
    ),
  }),
  message: Message,
}).make({
  init: () => ({ date: '2026-07-18', range: initialRange }),
  update: {
    PickedDate: ($, { value }) => $.evolve({ date: value }),
    PickedRange: ($, { value }) => $.evolve({ range: value }),
    PickedPreset: ($, { days }) => $.evolve({ date: shift(days) }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const single = (className?: string) =>
      Calendar(
        h,
        {
          key: `single-${kind}`,
          props: {
            today,
            value: model.date,
            locale:
              kind === 'rtl'
                ? 'de-DE'
                : kind === 'jalali'
                  ? 'fa-IR-u-ca-persian'
                  : 'en-US',
            ...(kind === 'booked'
              ? {
                  disabledDates: [
                    '2026-07-03',
                    '2026-07-12',
                    '2026-07-13',
                    '2026-07-14',
                    '2026-07-15',
                  ],
                }
              : {}),
          },
          ...(className === undefined ? {} : { className }),
          captionLayout: kind === 'selector' ? 'dropdown' : undefined,
          weekNumbers: kind === 'weeks',
          direction: kind === 'rtl' ? 'rtl' : undefined,
          onEmit: {
            Picked: ({ date }) =>
              Message.PickedDate({ value: String(date).slice(0, 10) }),
          },
        },
        kind === 'roomy'
          ? {
              ...calendarClasses,
              weekday: calendarClasses.weekday.replace('h-8 w-8', 'h-10 w-10'),
              day: calendarClasses.day.replace('size-8', 'size-10'),
            }
          : kind === 'presets' || kind === 'time'
            ? {
                ...calendarClasses,
                root: calendarClasses.root.replace('p-3', 'p-0'),
              }
            : undefined,
      )
    switch (kind) {
      case 'range':
        return RangeCalendar(h, {
          key: 'range',
          props: { today, value: model.range, locale: 'en-US' },
          onEmit: {
            Picked: ({ start, end }) =>
              Message.PickedRange({
                value: {
                  start: String(start).slice(0, 10),
                  end: String(end).slice(0, 10),
                },
              }),
          },
        })
      case 'presets':
        return h.div
          .class(
            kind === 'presets' || kind === 'time'
              ? 'flex w-fit flex-col gap-4 overflow-hidden rounded-xl border bg-card py-4 shadow-sm'
              : 'w-fit overflow-hidden rounded-lg border bg-background',
          )
          .style(kind === 'presets' ? { width: '300px' } : {})
          .children(
            single(
              kind === 'presets' ? 'border-0 calendar-presets' : 'border-0',
            ),
            h.div.class('flex flex-wrap gap-2 border-t px-4 pt-4').children(
              [
                ['Today', 0],
                ['Tomorrow', 1],
                ['In 3 days', 3],
                ['In a week', 7],
                ['In 2 weeks', 14],
              ].map(([label, days]) =>
                Button(h, {
                  variant: 'outline',
                  size: 'sm',
                  className: 'flex-1',
                })
                  .on('click', () =>
                    Message.PickedPreset({ days: days as number }),
                  )
                  .children(label as string),
              ),
            ),
          )
      case 'time':
        return h.div
          .class(
            'flex w-fit flex-col gap-4 overflow-hidden rounded-xl border bg-card py-4 shadow-sm',
          )
          .children(
            h.div.class('px-4').children(single('border-0')),
            h.div.class('flex flex-col gap-7 border-t px-4 pt-4').children(
              ['Start Time', 'End Time'].map((label, index) =>
                h.label.class('grid gap-2 text-sm font-medium').children(
                  label,
                  h.input
                    .class(
                      'h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none',
                    )
                    .attrs({
                      type: 'time',
                      value: index === 0 ? '10:30' : '12:30',
                    }),
                ),
              ),
            ),
          )
      default:
        return single(
          kind === 'roomy'
            ? '[&_button[data-calendar-day]]:size-10'
            : kind === 'jalali' ||
                kind === 'booked' ||
                kind === 'weeks' ||
                kind === 'rtl'
              ? ''
              : undefined,
        )
    }
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div.attrs({ dir: kind === 'rtl' ? 'rtl' : undefined }).children(
      CalendarDemo(h, {
        key: `${context.idPrefix}-${kind}`,
        props: { kind },
      }) as never,
    )
const source = exampleApplicationSource({
  imports: `import { Calendar } from '@/ui/effect/ui'`,
  body: `Calendar(h, {
  props: { today, value: model.date, locale: 'en-US' },
  onEmit: {
    Picked: ({ date }) => PickedDate({ value: date }),
    RequestedMonth: () => undefined,
  },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Calendar } from '@/ui/effect/ui'\n\nCalendar(h, { props: { today, value }, onEmit })`,
  examples: [
    { title: 'Demo', view: view('basic'), source },
    {
      title: 'Persian / Hijri / Jalali Calendar',
      view: view('jalali'),
      source,
    },
    { title: 'Basic', view: view('basic'), source },
    { title: 'Range Calendar', view: view('range'), source },
    { title: 'Month and Year Selector', view: view('selector'), source },
    { title: 'Presets', view: view('presets'), source },
    { title: 'Date and Time Picker', view: view('time'), source },
    { title: 'Booked dates', view: view('booked'), source },
    { title: 'Custom Cell Size', view: view('roomy'), source },
    { title: 'Week Numbers', view: view('weeks'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
