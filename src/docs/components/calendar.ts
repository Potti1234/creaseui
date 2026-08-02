import { Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'

import { componentPage, example, type ExampleConfig } from '@/docs/component-page'
import * as CopyFeedback from '@/docs/copy-feedback'
import * as Calendar from '@/ui/calendar'
import * as Card from '@/ui/card'
import * as Direction from '@/ui/direction'

export const Model = S.Struct({
  basic: Calendar.Model,
  selected: Calendar.Model,
  disabled: Calendar.Model,
  customSize: Calendar.Model,
  rtl: Calendar.Model,
  selectedDates: S.Record(S.String, S.Option(FoldkitCalendar.CalendarDate)),
  copiedCode: CopyFeedback.Model,
})
export type Model = typeof Model.Type

const Target = S.Literals(['basic', 'selected', 'disabled', 'customSize', 'rtl'])
type Target = typeof Target.Type

export const GotCalendarMessage = m('GotCalendarMessage', {
  target: Target,
  message: Calendar.Message,
})
export const Message = S.Union([GotCalendarMessage, CopyFeedback.Message])
export type Message = typeof Message.Type

const date = (year: number, month: number, day: number) => ({ year, month, day })

export const init = (): Model => ({
  basic: Calendar.init({ id: 'docs-calendar-basic', today: date(2026, 7, 28) }),
  selected: Calendar.init({
    id: 'docs-calendar-selected',
    today: date(2026, 7, 28),
    initialViewDate: date(2026, 7, 18),
  }),
  disabled: Calendar.init({
    id: 'docs-calendar-disabled',
    today: date(2026, 7, 28),
    initialViewDate: date(2026, 7, 18),
    disabledDaysOfWeek: ['Sunday', 'Saturday'],
  }),
  customSize: Calendar.init({ id: 'docs-calendar-custom-size', today: date(2026, 7, 28) }),
  rtl: Calendar.init({ id: 'docs-calendar-rtl', today: date(2026, 7, 28), initialViewDate: date(2026, 7, 18) }),
  selectedDates: {
    basic: Option.none(),
    selected: Option.some(date(2026, 7, 18)),
    disabled: Option.some(date(2026, 7, 18)),
    customSize: Option.none(),
    rtl: Option.some(date(2026, 7, 18)),
  },
  copiedCode: null,
})

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag !== 'GotCalendarMessage') {
    const [copiedCode, commands] = CopyFeedback.update(model.copiedCode, message)
    return [{ ...model, copiedCode }, Command.mapMessages(commands, next => next)]
  }

  const target = message.target
  const [calendar, commands, maybeSelection] = Calendar.update(model[target], message.message)
  const currentSelection = model.selectedDates[target] ?? Option.none()
  const selectedDate = Option.match(maybeSelection, {
    onNone: () => currentSelection,
    onSome: selection => selection._tag === 'SelectedDate' ? Option.some(selection.date) : currentSelection,
  })
  return [
    { ...model, [target]: calendar, selectedDates: { ...model.selectedDates, [target]: selectedDate } },
    Command.mapMessages(commands, next =>
      GotCalendarMessage({ target, message: next }),
    ),
  ]
}

const preview = (model: Calendar.Model, target: Target, maybeSelectedDate: Option.Option<FoldkitCalendar.CalendarDate>): Html =>
  Calendar.calendar<Message>({
    model,
    maybeSelectedDate,
    toParentMessage: message => GotCalendarMessage({ target, message }),
  })

const INSTALLATION = 'npx shadcn@latest add Potti1234/creaseui/calendar'
const USAGE = `import * as Calendar from '@/ui/calendar'\n\nCalendar.calendar({\n  model: model.calendar,\n  toParentMessage: message => GotCalendarMessage({ message }),\n})`

export const view = (model: Model): Html => {
  const h = html<Message>()
  const docsExample = (config: Omit<ExampleConfig<Message>, 'isCopied'>): Html =>
    example<Message>({ ...config, isCopied: model.copiedCode === config.code })
  return componentPage<Message>({
    name: 'Calendar',
    description: 'A date field component that allows users to enter and edit dates.',
    installation: INSTALLATION,
    usage: USAGE,
    copiedCode: model.copiedCode,
    onCopyCode: code => CopyFeedback.ClickedCopyCode({ code }),
    exampleTitles: ['Basic', 'Selected Date', 'Disabled Dates', 'Custom Cell Size', 'RTL'],
    sidebarScrolled: CopyFeedback.ObservedSidebarScroll(),
    composition: 'Calendar.Model\n├── calendar navigation and view mode\n├── focused and selected dates\n└── disabled-date constraints',
    examples: [
      docsExample({
        title: 'Basic',
        description: 'A standalone calendar with month and year navigation.',
        preview: preview(model.basic, 'basic', model.selectedDates.basic ?? Option.none()),
        code: `Calendar.init({ id: 'calendar', today })`,
        onCopy: CopyFeedback.ClickedCopyCode({ code: `Calendar.init({ id: 'calendar', today })` }),
      }),
      docsExample({
        title: 'Selected Date',
        description: 'Initialize the calendar with a selected date.',
        preview: Card.card({ children: [
          Card.cardContent({ class: 'p-0', children: [preview(model.selected, 'selected', model.selectedDates.selected ?? Option.none())] }),
        ] }),
        code: `// Parent Model owns selectedDate\nCalendar.init({\n  id: 'calendar',\n  today,\n  initialViewDate: selectedDate,\n})\n\nCalendar.calendar({ model: model.calendar, maybeSelectedDate: model.selectedDate, ... })`,
        onCopy: CopyFeedback.ClickedCopyCode({ code: `// Parent Model owns selectedDate\nCalendar.init({\n  id: 'calendar',\n  today,\n  initialViewDate: selectedDate,\n})\n\nCalendar.calendar({ model: model.calendar, maybeSelectedDate: model.selectedDate, ... })` }),
      }),
      docsExample({
        title: 'Disabled Dates',
        description: 'Weekend dates remain visible while unavailable for selection.',
        preview: h.div([h.Class('rounded-lg border')], [preview(model.disabled, 'disabled', model.selectedDates.disabled ?? Option.none())]),
        code: `Calendar.init({\n  id: 'calendar',\n  today,\n  disabledDaysOfWeek: ['Sunday', 'Saturday'],\n})`,
        onCopy: CopyFeedback.ClickedCopyCode({ code: `Calendar.init({\n  id: 'calendar',\n  today,\n  disabledDaysOfWeek: ['Sunday', 'Saturday'],\n})` }),
      }),
      docsExample({
        title: 'Custom Cell Size',
        description: 'Override the calendar cell token to create a roomier picker without changing its behavior.',
        preview: Calendar.calendar({
          model: model.customSize,
          maybeSelectedDate: model.selectedDates.customSize ?? Option.none(),
          toParentMessage: message => GotCalendarMessage({ target: 'customSize', message }),
          class: '[--cell-size:--spacing(10)]',
        }),
        code: `Calendar.calendar({\n  ...props,\n  class: '[--cell-size:--spacing(10)]',\n})`,
        onCopy: CopyFeedback.ClickedCopyCode({ code: `Calendar.calendar({\n  ...props,\n  class: '[--cell-size:--spacing(10)]',\n})` }),
      }),
      docsExample({
        title: 'RTL',
        description: 'Calendar navigation, headings, and grid interaction follow the surrounding text direction.',
        preview: Direction.direction({
          direction: 'rtl',
          children: [preview(model.rtl, 'rtl', model.selectedDates.rtl ?? Option.none())],
        }),
        code: `Direction.direction({\n  direction: 'rtl',\n  children: [Calendar.calendar(props)],\n})`,
        onCopy: CopyFeedback.ClickedCopyCode({ code: `Direction.direction({\n  direction: 'rtl',\n  children: [Calendar.calendar(props)],\n})` }),
      }),
    ],
    apiHref: 'https://foldkit.dev/ui/calendar',
    sourceHref: 'https://github.com/Potti1234/creaseui/blob/main/src/ui/calendar.ts',
    apiDescription: 'Calendar delegates focus, keyboard navigation, date selection, and view-mode changes to the Foldkit Calendar state machine.',
  })
}
