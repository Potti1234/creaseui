import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as Calendar from '@/ui/calendar';

const source = (name: string, roomy: boolean): string => foldkitApplication({
  title: `Calendar — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Calendar from '@/ui/calendar'`,
  model: `export const Model = S.Struct({
  calendar: Calendar.Model,
  selectedDate: S.Option(FoldkitCalendar.CalendarDate),
})
export type Model = typeof Model.Type`,
  messages: `export const GotCalendarMessage = m('GotCalendarMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Calendar.Message })
export const Message = S.Union([GotCalendarMessage])
export type Message = typeof Message.Type`,
  init: `const initialDate = { year: 2026, month: 7, day: 18 }

export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  {
    calendar: Calendar.init({
      id: 'booking-calendar',
      today: { year: 2026, month: 7, day: 28 },
      initialViewDate: initialDate,
    }),
    selectedDate: Option.some(initialDate),
  },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotCalendarMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [calendar, commands, maybeOutput] = Calendar.update(model.calendar, message.message)
      const selectedDate = Option.match(maybeOutput, {
        onNone: () => model.selectedDate,
        onSome: output => output._tag === 'SelectedDate' ? Option.some(output.date) : model.selectedDate,
      })
      return [
        { ...model, calendar, selectedDate },
        Command.mapMessages(commands, next => GotCalendarMessage({ message: next })),
      ]
    }
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Calendar — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Calendar.calendar({
      model: model.calendar,
      maybeSelectedDate: model.selectedDate,
      toParentMessage: message => GotCalendarMessage({ message }),${roomy ? "\n      class: '[--cell-size:--spacing(10)]'," : ''}
    }, h),
  ]),
})`,
});

const preview = (model: State.Model, h: HtmlBuilder<State.Message>, roomy: boolean) => Calendar.calendar({
  model: model.calendar,
  maybeSelectedDate: model.selectedCalendarDate,
  toParentMessage: message => State.GotCalendarMessage({ message }),
  ...(roomy ? { class: '[--cell-size:--spacing(10)]' } : {}),
}, h);

export const calendarPage = authoredPage({
  slug: 'calendar', title: 'Calendar', kind: 'submodel',
  definition: {
    kind: 'submodel', description: 'A keyboard-accessible date grid with month and year navigation.',
    architecture: 'Calendar owns navigation mode, focused date, and disabled-date rules. The parent owns the domain selection: update returns SelectedDate as an OutMessage, which the parent deliberately stores.',
    apiHref: 'https://foldkit.dev/ui/calendar',
    composition: 'Parent Model\n├── selectedDate (domain state)\n└── Calendar Model\n    ├── days / months / years view\n    ├── focused date\n    └── navigation constraints',
    styling: 'The renderer exposes a --cell-size token for density changes. Keep day targets large enough to operate and let the submodel retain its date semantics.',
    accessibility: 'The calendar is a labeled grid with roving focus. Today, the selected date, unavailable dates, and view-navigation controls remain programmatically distinguishable.',
    keyboard: [['Arrow keys', 'Moves focus between dates.'], ['Page Up / Page Down', 'Moves to the previous or next month.'], ['Enter / Space', 'Selects the focused date and emits SelectedDate.']],
    examples: [
      { title: 'Selected date', description: 'The parent stores the selected date emitted by the child while Calendar keeps focus and navigation state.', preview: (model, h) => preview(model, h, false), code: source('Selected date', false) },
      { title: 'Roomier cells', description: 'View density changes through a CSS token; the Model, Message, update, and output contract stay identical.', preview: (model, h) => preview(model, h, true), code: source('Roomier cells', true) },
    ],
  },
});
