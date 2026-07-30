import { Effect, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'

import { componentPage, example } from '@/docs/component-page'
import * as Calendar from '@/ui/calendar'
import * as Card from '@/ui/card'
import * as Direction from '@/ui/direction'

export const Model = S.Struct({
  basic: Calendar.Model,
  selected: Calendar.Model,
  disabled: Calendar.Model,
  customSize: Calendar.Model,
  rtl: Calendar.Model,
})
export type Model = typeof Model.Type

const Target = S.Literals(['basic', 'selected', 'disabled', 'customSize', 'rtl'])
type Target = typeof Target.Type

export const GotCalendarMessage = m('GotCalendarMessage', {
  target: Target,
  message: Calendar.Message,
})
export const ClickedCopyCode = m('ClickedCalendarCopyCode', { code: S.String })
export const CompletedCopyCode = m('CompletedCalendarCopyCode')
export const Message = S.Union([GotCalendarMessage, ClickedCopyCode, CompletedCopyCode])
export type Message = typeof Message.Type

const date = (year: number, month: number, day: number) => ({ year, month, day })

export const init = (): Model => ({
  basic: Calendar.init({ id: 'docs-calendar-basic', today: date(2026, 7, 28) }),
  selected: Calendar.init({
    id: 'docs-calendar-selected',
    today: date(2026, 7, 28),
    initialSelectedDate: date(2026, 7, 18),
  }),
  disabled: Calendar.init({
    id: 'docs-calendar-disabled',
    today: date(2026, 7, 28),
    initialSelectedDate: date(2026, 7, 18),
    disabledDaysOfWeek: ['Sunday', 'Saturday'],
  }),
  customSize: Calendar.init({ id: 'docs-calendar-custom-size', today: date(2026, 7, 28) }),
  rtl: Calendar.init({ id: 'docs-calendar-rtl', today: date(2026, 7, 28), initialSelectedDate: date(2026, 7, 18) }),
})

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

const CopyCode = Command.define(
  'CopyCalendarCode',
  { code: S.String },
  CompletedCopyCode,
)(({ code }) => Effect.promise(() => navigator.clipboard.writeText(code)).pipe(Effect.as(CompletedCopyCode())))

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag === 'ClickedCalendarCopyCode') return [model, [CopyCode({ code: message.code })]]
  if (message._tag === 'CompletedCalendarCopyCode') return [model, []]

  const target = message.target
  const [calendar, commands] = Calendar.update(model[target], message.message)
  return [
    { ...model, [target]: calendar },
    Command.mapMessages(commands, next =>
      GotCalendarMessage({ target, message: next }),
    ),
  ]
}

const preview = (model: Calendar.Model, target: Target): Html =>
  Calendar.calendar<Message>({
    model,
    toParentMessage: message => GotCalendarMessage({ target, message }),
  })

export const view = (model: Model): Html => {
  const h = html<Message>()
  return componentPage<Message>({
    name: 'Calendar',
    description: 'A date field component that allows users to enter and edit dates.',
    installation: 'npx shadcn@latest add Potti1234/creaseui/calendar',
    usage: `import * as Calendar from '@/ui/calendar'\n\nCalendar.calendar({\n  model: model.calendar,\n  toParentMessage: message => GotCalendarMessage({ message }),\n})`,
    sidebarScrolled: CompletedCopyCode(),
    composition: 'Calendar.Model\n├── calendar navigation and view mode\n├── focused and selected dates\n└── disabled-date constraints',
    examples: [
      example<Message>({
        title: 'Basic',
        description: 'A standalone calendar with month and year navigation.',
        preview: preview(model.basic, 'basic'),
        code: `Calendar.init({ id: 'calendar', today })`,
        onCopy: ClickedCopyCode({ code: `Calendar.init({ id: 'calendar', today })` }),
      }),
      example<Message>({
        title: 'Selected Date',
        description: 'Initialize the calendar with a selected date.',
        preview: Card.card({ children: [
          Card.cardContent({ class: 'p-0', children: [preview(model.selected, 'selected')] }),
        ] }),
        code: `Calendar.init({\n  id: 'calendar',\n  today,\n  initialSelectedDate: { year: 2026, month: 7, day: 18 },\n})`,
        onCopy: ClickedCopyCode({ code: `Calendar.init({\n  id: 'calendar',\n  today,\n  initialSelectedDate: { year: 2026, month: 7, day: 18 },\n})` }),
      }),
      example<Message>({
        title: 'Disabled Dates',
        description: 'Weekend dates remain visible while unavailable for selection.',
        preview: h.div([h.Class('rounded-lg border')], [preview(model.disabled, 'disabled')]),
        code: `Calendar.init({\n  id: 'calendar',\n  today,\n  disabledDaysOfWeek: ['Sunday', 'Saturday'],\n})`,
        onCopy: ClickedCopyCode({ code: `Calendar.init({\n  id: 'calendar',\n  today,\n  disabledDaysOfWeek: ['Sunday', 'Saturday'],\n})` }),
      }),
      example<Message>({
        title: 'Custom Cell Size',
        description: 'Override the calendar cell token to create a roomier picker without changing its behavior.',
        preview: Calendar.calendar({
          model: model.customSize,
          toParentMessage: message => GotCalendarMessage({ target: 'customSize', message }),
          class: '[--cell-size:--spacing(10)]',
        }),
        code: `Calendar.calendar({\n  ...props,\n  class: '[--cell-size:--spacing(10)]',\n})`,
        onCopy: ClickedCopyCode({ code: `Calendar.calendar({\n  ...props,\n  class: '[--cell-size:--spacing(10)]',\n})` }),
      }),
      example<Message>({
        title: 'RTL',
        description: 'Calendar navigation, headings, and grid interaction follow the surrounding text direction.',
        preview: Direction.direction({
          direction: 'rtl',
          children: [preview(model.rtl, 'rtl')],
        }),
        code: `Direction.direction({\n  direction: 'rtl',\n  children: [Calendar.calendar(props)],\n})`,
        onCopy: ClickedCopyCode({ code: `Direction.direction({\n  direction: 'rtl',\n  children: [Calendar.calendar(props)],\n})` }),
      }),
    ],
    apiHref: 'https://foldkit.dev/ui/calendar',
    apiDescription: 'Calendar delegates focus, keyboard navigation, date selection, and view-mode changes to the Foldkit Calendar state machine.',
  })
}
