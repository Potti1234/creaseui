import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Calendar, Input, RangeCalendar } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const today = '2026-07-08'
const initialRange = { start: '2026-07-09', end: '2026-07-17' }
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
  init: () => ({ date: '2026-07-08', range: initialRange }),
  update: {
    PickedDate: ($, { value }) => $.evolve({ date: value }),
    PickedRange: ($, { value }) => $.evolve({ range: value }),
    PickedPreset: ($, { days }) => $.evolve({ date: shift(days) }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const single = (className?: string) =>
      Calendar(h, {
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
      })
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
          .class('flex flex-col overflow-hidden rounded-lg border sm:flex-row')
          .children(
            h.div
              .class(
                'flex gap-1 border-b p-3 sm:w-36 sm:flex-col sm:border-e sm:border-b-0',
              )
              .children(
                [
                  ['Today', 0],
                  ['Tomorrow', 1],
                  ['In 3 days', 3],
                  ['In a week', 7],
                  ['In 2 weeks', 14],
                ].map(([label, days]) =>
                  Button(h, {
                    variant: 'ghost',
                    size: 'sm',
                    className: 'justify-start',
                  })
                    .on('click', () =>
                      Message.PickedPreset({ days: days as number }),
                    )
                    .children(label as string),
                ),
              ),
            h.div.class('p-3').children(single('border-0 p-0')),
          )
      case 'time':
        return h.div
          .class('flex flex-col overflow-hidden rounded-lg border sm:flex-row')
          .children(
            h.div
              .class('border-b p-3 sm:border-e sm:border-b-0')
              .children(single('border-0 p-0')),
            h.div.class('flex flex-col gap-4 p-4').children(
              ['Start time', 'End time'].map((label, index) =>
                h.label.class('grid gap-2 text-sm font-medium').children(
                  label,
                  Input(h, {
                    id: `${label.replaceAll(' ', '-')}-${index}`,
                    element: h.input.attrs({
                      type: 'time',
                      value: index === 0 ? '09:00' : '17:00',
                    }),
                    props: { value: index === 0 ? '09:00' : '17:00' },
                    onUpdate: () => undefined,
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
