import { Match as M, Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { type Html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import { badge } from '@/ui/badge'
import * as Calendar from '@/ui/calendar'
import {
  card,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitle,
} from '@/ui/card'
import {
  item,
  itemContent,
  itemDescription,
  itemGroup,
  itemTitle,
} from '@/ui/item'

const payments = [
  {
    title: 'Netflix Subscription',
    date: 'Apr 15, 2024',
    amount: '$19.99',
  },
  {
    title: 'Rent Payment',
    date: 'Apr 1, 2024',
    amount: '$2,400.00',
  },
  {
    title: 'Auto Insurance',
    date: 'Apr 22, 2024',
    amount: '$186.00',
  },
] as const

export const Model = S.Struct({
  calendar: Calendar.Model,
  selectedDate: S.Option(FoldkitCalendar.CalendarDate),
})
export type Model = typeof Model.Type

export const GotCalendarMessage = m('GotCalendarMessage', {
  message: Calendar.Message,
})
export const Message = S.Union([GotCalendarMessage])
export type Message = typeof Message.Type

type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
]

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotCalendarMessage: ({ message: childMessage }) => {
        const [calendar, commands, maybeSelection] = Calendar.update(
          model.calendar,
          childMessage,
        )
        return [
          evo(model, { calendar: () => calendar, selectedDate: current => Option.match(maybeSelection, { onNone: () => current, onSome: selection => selection._tag === 'SelectedDate' ? Option.some(selection.date) : current }) }),
          Command.mapMessages(commands, next =>
            GotCalendarMessage({ message: next }),
          ),
        ]
      },
    }),
  )

export const init = (): Model => {
  const now = new Date()
  const today = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  }

  return {
    calendar: Calendar.init({
      id: 'upcoming-payments-calendar',
      today,
      initialViewDate: today,
    }),
    selectedDate: Option.some(today),
  }
}

export const view = (model: Model): Html =>
  card<Message>({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Upcoming Payments'] }),
          cardDescription({
            children: ['Select a date to view scheduled payments.'],
          }),
        ],
      }),
      cardContent({
        class: 'flex flex-col gap-4',
        children: [
          item({
            variant: 'outline',
            class: 'justify-center',
            children: [
              Calendar.calendar({
                model: model.calendar,
                maybeSelectedDate: model.selectedDate,
                toParentMessage: message =>
                  GotCalendarMessage({ message }),
                class:
                  'w-full [--cell-size:--spacing(8)] md:[--cell-size:--spacing(10)] [&_[role=row]:last-child:has(>[data-outside-month]:first-child):has(>[data-outside-month]:last-child)]:hidden',
              }),
            ],
          }),
          itemGroup({
            class: 'w-full',
            children: payments.map(payment =>
              item({
                variant: 'muted',
                children: [
                  itemContent({
                    children: [
                      itemTitle({ children: [payment.title] }),
                      itemDescription({ children: [payment.date] }),
                    ],
                  }),
                  badge({
                    variant: 'secondary',
                    children: [payment.amount],
                  }),
                ],
              }),
            ),
          }),
        ],
      }),
    ],
  })

/*
Stateful? yes.
Submodels wired: Calendar (single selected date).
PORT NOTEs: none.
*/
