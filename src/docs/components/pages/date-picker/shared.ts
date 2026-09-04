import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const datePickerFixtures = [
  { title: 'Existing value', description: 'The trigger formats parent-owned selection while the child owns disclosure and calendar interaction.', empty: false },
  { title: 'Empty value', description: 'An absent domain value produces a clear placeholder without changing the child Model shape.', empty: true },
] as const;

const source = (fixture: (typeof datePickerFixtures)[number], renderer: 'tailwind' | 'stylex'): string => { const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, ''); return foldkitApplication({
  title: `Date Picker — ${fixture.title}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as DatePicker from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/date-picker'`,
  model: `export const Model = S.Struct({ datePicker: DatePicker.Model, selectedDate: S.Option(FoldkitCalendar.CalendarDate) })
export type Model = typeof Model.Type`,
  messages: `export const GotDatePickerMessage = m('GotDatePickerMessage${tag}', { message: DatePicker.Message })
export const Message = S.Union([GotDatePickerMessage])
export type Message = typeof Message.Type`,
  init: `const initialDate = { year: 2026, month: 7, day: 18 }
export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [{ datePicker: DatePicker.init({ id: 'due-date-picker', today: { year: 2026, month: 7, day: 28 }, initialViewDate: initialDate, isAnimated: true }), selectedDate: ${fixture.empty ? 'Option.none()' : 'Option.some(initialDate)'} }, []]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotDatePickerMessage${tag}': {
      const [datePicker, commands, maybeOutput] = DatePicker.update(model.datePicker, message.message)
      const selectedDate = Option.match(maybeOutput, { onNone: () => model.selectedDate, onSome: output => output._tag === 'SelectedDate' ? Option.some(output.date) : output._tag === 'ClearedDate' ? Option.none() : model.selectedDate })
      return [{ ...model, datePicker, selectedDate }, Command.mapMessages(commands, next => GotDatePickerMessage({ message: next }))]
    }
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({ title: 'Date Picker — ${fixture.title}', body: h.main([], [DatePicker.datePicker({ model: model.datePicker, maybeSelectedDate: model.selectedDate, toParentMessage: message => GotDatePickerMessage({ message }), name: 'dueDate', ariaLabel: 'Choose due date', placeholder: 'Pick a due date' }, h)]) })`,
}); };
export const datePickerExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => datePickerFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: source(fixture, renderer) }));
