import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import * as FoldkitCalendar from 'foldkit/calendar';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as DatePicker from '@/ui/date-picker';

const source = (name: string, empty: boolean): string => foldkitApplication({
  title: `Date Picker — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as DatePicker from '@/ui/date-picker'`,
  model: `export const Model = S.Struct({
  datePicker: DatePicker.Model,
  selectedDate: S.Option(FoldkitCalendar.CalendarDate),
})
export type Model = typeof Model.Type`,
  messages: `export const GotDatePickerMessage = m('GotDatePickerMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: DatePicker.Message })
export const Message = S.Union([GotDatePickerMessage])
export type Message = typeof Message.Type`,
  init: `const initialDate = { year: 2026, month: 7, day: 18 }

export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  {
    datePicker: DatePicker.init({
      id: 'due-date-picker',
      today: { year: 2026, month: 7, day: 28 },
      initialViewDate: initialDate,
      isAnimated: true,
    }),
    selectedDate: ${empty ? 'Option.none()' : 'Option.some(initialDate)'},
  },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotDatePickerMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [datePicker, commands, maybeOutput] = DatePicker.update(model.datePicker, message.message)
      const selectedDate = Option.match(maybeOutput, {
        onNone: () => model.selectedDate,
        onSome: output => output._tag === 'SelectedDate'
          ? Option.some(output.date)
          : output._tag === 'ClearedDate'
            ? Option.none()
            : model.selectedDate,
      })
      return [
        { ...model, datePicker, selectedDate },
        Command.mapMessages(commands, next => GotDatePickerMessage({ message: next })),
      ]
    }
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Date Picker — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    DatePicker.datePicker({
      model: model.datePicker,
      maybeSelectedDate: model.selectedDate,
      toParentMessage: message => GotDatePickerMessage({ message }),
      name: 'dueDate',
      ariaLabel: 'Choose due date',
      placeholder: 'Pick a due date',
    }, h),
  ]),
})`,
});

const GotDatePickerPreviewMessage = m('GotDatePickerPreviewMessage', { message: DatePicker.Message });
const ChangedDateQuery = m('ChangedDatePickerQuery', { value: S.String });
const LoadedExternalDate = m('LoadedExternalDate');
const DatePickerPreviewMessage = S.Union([GotDatePickerPreviewMessage, ChangedDateQuery, LoadedExternalDate]);
type DatePickerPreviewMessage = typeof DatePickerPreviewMessage.Type;
const DatePickerPreviewModel = S.Struct({ _docsPage: S.Literal('date-picker'), datePicker: DatePicker.Model, selectedDate: S.Option(FoldkitCalendar.CalendarDate), query: S.String, parseError: S.NullOr(S.String) });
type DatePickerPreviewModel = typeof DatePickerPreviewModel.Type;
const encodeDate = S.encodeSync(FoldkitCalendar.CalendarDateFromIsoString);
const parseDate = (value: string): Option.Option<FoldkitCalendar.CalendarDate> => {
  try { return Option.some(S.decodeUnknownSync(FoldkitCalendar.CalendarDateFromIsoString)(value)); }
  catch { return Option.none(); }
};
const previewProgram = definePreviewProgram<DatePickerPreviewModel, DatePickerPreviewMessage>({
  Model: DatePickerPreviewModel, Message: DatePickerPreviewMessage,
  init: index => {
    const initialDate = { year: 2026, month: 7, day: 18 };
    const selectedDate = index === 0 ? Option.some(initialDate) : Option.none<FoldkitCalendar.CalendarDate>();
    return { _docsPage: 'date-picker', datePicker: DatePicker.init({ id: `docs-date-picker-${String(index)}`, today: FoldkitCalendar.fromDateInZone(new Date('2026-07-28T12:00:00Z'), 'Europe/Berlin'), initialViewDate: initialDate, isAnimated: true }), selectedDate, query: Option.match(selectedDate, { onNone: () => '', onSome: encodeDate }), parseError: null };
  },
  update: (model, message) => {
    if (message._tag === 'ChangedDatePickerQuery') {
      const maybeDate = parseDate(message.value);
      return [Option.match(maybeDate, { onNone: () => ({ ...model, query: message.value, parseError: message.value === '' ? null : 'Enter a real date as YYYY-MM-DD.' }), onSome: date => ({ ...model, datePicker: DatePicker.focusDate(model.datePicker, date), selectedDate: Option.some(date), query: message.value, parseError: null }) }), []];
    }
    if (message._tag === 'LoadedExternalDate') {
      const date = { year: 2026, month: 8, day: 12 };
      return [{ ...model, datePicker: DatePicker.focusDate(model.datePicker, date), selectedDate: Option.some(date), query: encodeDate(date), parseError: null }, []];
    }
    const [datePicker, commands, maybeOutput] = DatePicker.update(model.datePicker, message.message);
    const selectedDate = Option.match(maybeOutput, { onNone: () => model.selectedDate, onSome: output => output._tag === 'SelectedDate' ? Option.some(output.date) : output._tag === 'ClearedDate' ? Option.none() : model.selectedDate });
    const query = Option.match(maybeOutput, { onNone: () => model.query, onSome: output => output._tag === 'SelectedDate' ? encodeDate(output.date) : output._tag === 'ClearedDate' ? '' : model.query });
    return [{ ...model, datePicker, selectedDate, query, parseError: null }, Command.mapMessages(commands, next => GotDatePickerPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => h.form([h.OnSubmit(LoadedExternalDate({}))], [
    DatePicker.datePicker({ model: model.datePicker, maybeSelectedDate: model.selectedDate, query: model.query, onQueryInput: value => ChangedDateQuery({ value }), inputLabel: 'Due date (YYYY-MM-DD)', ...(model.parseError === null ? {} : { parseError: model.parseError }), toParentMessage: message => GotDatePickerPreviewMessage({ message }), name: index === 0 ? 'dueDate' : 'newDueDate', ariaLabel: index === 0 ? 'Change due date' : 'Choose a new due date', placeholder: 'Pick a due date', mobilePresentation: 'dialog' }, h),
    h.button([h.Type('button'), h.OnClick(LoadedExternalDate({})), h.Class('mt-3 rounded-md border px-3 py-2 text-sm')], ['Load saved date']),
  ]),
});

export const datePickerPage = authoredPage({
  slug: 'date-picker', title: 'Date Picker', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Combines an anchored disclosure with Calendar to select a date.',
    architecture: 'DatePicker is one nested child Model: its disclosure state contains a Calendar Model. The parent owns the committed date, text query, and parsing policy; focusDate synchronizes the child’s transient displayed month after valid typed or external updates.',
    apiHref: 'https://foldkit.dev/ui/date-picker',
    composition: 'Parent Model\n├── selectedDate (domain state)\n└── DatePicker Model\n    ├── popover disclosure + positioning\n    └── Calendar Model\n        └── focus and navigation state',
    styling: 'Trigger, panel, and calendar classes are separate view inputs. Preserve the compact trigger label and avoid constraining the panel below the calendar’s usable width.',
    accessibility: 'Give the trigger a purpose-specific accessible name. Opening moves interaction into the date grid; selection closes the panel and returns the chosen value to the parent.',
    keyboard: [['Enter / Space', 'Opens the picker from its trigger or selects the focused date.'], ['Arrow keys', 'Moves through dates inside the calendar.'], ['Escape', 'Closes the panel and restores trigger focus.']],
    examples: [
      { title: 'Existing value', description: 'The trigger formats parent-owned selection while the child owns disclosure and calendar interaction.',  code: source('Existing value', false) },
      { title: 'Empty value', description: 'An absent domain value produces a clear placeholder without changing the child Model shape.',  code: source('Empty value', true) },
    ],
  },
});
