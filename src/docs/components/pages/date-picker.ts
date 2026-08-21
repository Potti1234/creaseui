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
type GotDatePickerPreviewMessage = typeof GotDatePickerPreviewMessage.Type;
const DatePickerPreviewModel = S.Struct({ _docsPage: S.Literal('date-picker'), datePicker: DatePicker.Model, selectedDate: S.Option(FoldkitCalendar.CalendarDate) });
type DatePickerPreviewModel = typeof DatePickerPreviewModel.Type;
const previewProgram = definePreviewProgram<DatePickerPreviewModel, GotDatePickerPreviewMessage>({
  Model: DatePickerPreviewModel, Message: GotDatePickerPreviewMessage,
  init: index => {
    const initialDate = { year: 2026, month: 7, day: 18 };
    return { _docsPage: 'date-picker', datePicker: DatePicker.init({ id: `docs-date-picker-${String(index)}`, today: { year: 2026, month: 7, day: 28 }, initialViewDate: initialDate, isAnimated: true }), selectedDate: index === 0 ? Option.some(initialDate) : Option.none() };
  },
  update: (model, message) => {
    const [datePicker, commands, maybeOutput] = DatePicker.update(model.datePicker, message.message);
    const selectedDate = Option.match(maybeOutput, { onNone: () => model.selectedDate, onSome: output => output._tag === 'SelectedDate' ? Option.some(output.date) : output._tag === 'ClearedDate' ? Option.none() : model.selectedDate });
    return [{ ...model, datePicker, selectedDate }, Command.mapMessages(commands, next => GotDatePickerPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => DatePicker.datePicker({ model: model.datePicker, maybeSelectedDate: model.selectedDate, toParentMessage: message => GotDatePickerPreviewMessage({ message }), name: index === 0 ? 'dueDate' : 'newDueDate', ariaLabel: index === 0 ? 'Change due date' : 'Choose a new due date', placeholder: 'Pick a due date' }, h),
});

export const datePickerPage = authoredPage({
  slug: 'date-picker', title: 'Date Picker', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Combines an anchored disclosure with Calendar to select a date.',
    architecture: 'DatePicker is one nested child Model: its disclosure state contains a Calendar Model. The parent maps child Commands and owns the optional selected date returned by SelectedDate or ClearedDate outputs.',
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
