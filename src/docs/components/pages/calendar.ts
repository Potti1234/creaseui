import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import * as FoldkitCalendar from 'foldkit/calendar';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Calendar from '@/ui/calendar';

const germanLocale: FoldkitCalendar.LocaleConfig = {
  firstDayOfWeek: 'Monday',
  monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  shortMonthNames: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  shortDayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
};

const source = (name: string, roomy: boolean, range = false, localized = false): string => foldkitApplication({
  title: `Calendar — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Calendar from '@/ui/calendar'`,
  model: `${localized ? `const locale: FoldkitCalendar.LocaleConfig = ${JSON.stringify(germanLocale)}

` : ''}export const Model = S.Struct({
  calendar: Calendar.Model,
  selectedDate: S.Option(FoldkitCalendar.CalendarDate),
  rangeStart: FoldkitCalendar.CalendarDate,
  rangeEnd: FoldkitCalendar.CalendarDate,
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
      today: Calendar.dateInTimeZone(new Date('2026-07-28T12:00:00Z'), '${localized ? 'Europe/Berlin' : 'UTC'}'),
      initialViewDate: initialDate,
      ${localized ? 'locale,' : "disabledDaysOfWeek: ['Sunday'],"}
    }),
    selectedDate: Option.some(initialDate),
    rangeStart: { year: 2026, month: 7, day: 14 },
    rangeEnd: { year: 2026, month: 7, day: 20 },
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
      ${range ? "range: { start: model.rangeStart, end: model.rangeEnd }," : ''}
    }, h),
  ]),
})`,
});

const GotCalendarPreviewMessage = m('GotCalendarPreviewMessage', { message: Calendar.Message });
type GotCalendarPreviewMessage = typeof GotCalendarPreviewMessage.Type;
const CalendarPreviewModel = S.Struct({ _docsPage: S.Literal('calendar'), calendar: Calendar.Model, selectedDate: S.Option(FoldkitCalendar.CalendarDate), rangeStart: FoldkitCalendar.CalendarDate, rangeEnd: FoldkitCalendar.CalendarDate });
type CalendarPreviewModel = typeof CalendarPreviewModel.Type;
const previewProgram = definePreviewProgram<CalendarPreviewModel, GotCalendarPreviewMessage>({
  Model: CalendarPreviewModel, Message: GotCalendarPreviewMessage,
  init: index => {
    const initialDate = { year: 2026, month: 7, day: 18 };
    return { _docsPage: 'calendar', calendar: Calendar.init({ id: `docs-calendar-${String(index)}`, today: Calendar.dateInTimeZone(new Date('2026-07-28T12:00:00Z'), index === 3 ? 'Europe/Berlin' : 'UTC'), initialViewDate: initialDate, ...(index === 3 ? { locale: germanLocale } : { disabledDaysOfWeek: ['Sunday'] as const }) }), selectedDate: Option.some(initialDate), rangeStart: { year: 2026, month: 7, day: 14 }, rangeEnd: { year: 2026, month: 7, day: 20 } };
  },
  update: (model, message) => {
    const [calendar, commands, maybeOutput] = Calendar.update(model.calendar, message.message);
    const selectedDate = Option.match(maybeOutput, { onNone: () => model.selectedDate, onSome: output => output._tag === 'SelectedDate' ? Option.some(output.date) : model.selectedDate });
    return [{ ...model, calendar, selectedDate }, Command.mapMessages(commands, next => GotCalendarPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => Calendar.calendar({ model: model.calendar, maybeSelectedDate: model.selectedDate, toParentMessage: message => GotCalendarPreviewMessage({ message }), ...(index === 1 ? { class: '[--cell-size:--spacing(10)]' } : {}), ...(index === 2 ? { range: { start: model.rangeStart, end: model.rangeEnd } } : {}), ...(index === 3 ? { direction: 'rtl' as const } : {}) }, h),
});

export const calendarPage = authoredPage({
  slug: 'calendar', title: 'Calendar', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'A keyboard-accessible date grid with month and year navigation.',
    architecture: 'Calendar owns navigation mode, focused date, and disabled-date rules. The parent owns the domain selection: update returns SelectedDate as an OutMessage, which the parent deliberately stores.',
    apiHref: 'https://foldkit.dev/ui/calendar',
    composition: 'Parent Model\n├── selectedDate (domain state)\n└── Calendar Model\n    ├── days / months / years view\n    ├── focused date\n    └── navigation constraints',
    styling: 'The renderer exposes a --cell-size token for density changes. Keep day targets large enough to operate and let the submodel retain its date semantics.',
    accessibility: 'The calendar is a labeled grid with roving focus. Today, the selected date, unavailable dates, and view-navigation controls remain programmatically distinguishable.',
    keyboard: [['Arrow keys', 'Moves focus between dates.'], ['Page Up / Page Down', 'Moves to the previous or next month.'], ['Enter / Space', 'Selects the focused date and emits SelectedDate.']],
    examples: [
      { title: 'Selected date', description: 'The parent stores the selected date emitted by the child while Calendar keeps focus and navigation state.',  code: source('Selected date', false) },
      { title: 'Roomier cells', description: 'View density changes through a CSS token; the Model, Message, update, and output contract stay identical.',  code: source('Roomier cells', true) },
      { title: 'Parent-owned range', description: 'The parent owns both range endpoints; Calendar only decorates the corresponding day cells while retaining one focused cursor.', code: source('Parent-owned range', false, true) },
      { title: 'Locale zone and RTL', description: 'Locale data is serializable, the parent converts instants in an explicit time zone, and direction mirrors navigation without changing chronology.', code: source('Locale zone and RTL', false, false, true).replace('toParentMessage: message => GotCalendarMessage({ message }),', "toParentMessage: message => GotCalendarMessage({ message }),\n      direction: 'rtl',") },
    ],
  },
});
