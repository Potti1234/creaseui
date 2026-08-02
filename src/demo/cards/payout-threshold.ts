import { Match as M, Option, Schema as S } from 'effect'
import { Command, Subscription } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import * as Icon from '@/lib/icon'
import { button } from '@/ui/button'
import {
  card,
  cardAction,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/ui/card'
import {
  field,
  fieldDescription,
  fieldGroup,
  fieldLabel,
} from '@/ui/field'
import * as Select from '@/ui/select'
import * as Slider from '@/ui/slider'
import { textarea } from '@/ui/textarea'

const currencies = [
  { value: 'usd', label: 'USD — United States Dollar' },
  { value: 'eur', label: 'EUR — Euro' },
  { value: 'gbp', label: 'GBP — British Pound' },
  { value: 'jpy', label: 'JPY — Japanese Yen' },
] as const

export const Model = S.Struct({
  currency: Select.Model,
  selectedCurrency: S.String,
  amount: Slider.Model,
  amountValue: S.Number,
  notes: S.String,
})
export type Model = typeof Model.Type

export const GotCurrencyMessage = m('GotCurrencyMessage', {
  message: Select.Message,
})
export const GotAmountMessage = m('GotAmountMessage', {
  message: Slider.Message,
})
export const UpdatedNotes = m('UpdatedNotes', { value: S.String })
export const Message = S.Union([
  GotCurrencyMessage,
  GotAmountMessage,
  UpdatedNotes,
])
export type Message = typeof Message.Type

type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
]

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotCurrencyMessage: ({ message: childMessage }) => {
        const [currency, commands, maybeSelection] = Select.update(
          model.currency,
          childMessage,
        )
        return [
          evo(model, { currency: () => currency, selectedCurrency: current => Option.match(maybeSelection, { onNone: () => current, onSome: selection => selection._tag === 'Selected' ? selection.value : current }) }),
          Command.mapMessages(commands, next =>
            GotCurrencyMessage({ message: next }),
          ),
        ]
      },
      GotAmountMessage: ({ message: childMessage }) => {
        const [amount, commands, maybeChange] = Slider.update(model.amount, childMessage)
        return [
          evo(model, { amount: () => amount, amountValue: current => Option.match(maybeChange, { onNone: () => current, onSome: change => change.value }) }),
          Command.mapMessages(commands, next =>
            GotAmountMessage({ message: next }),
          ),
        ]
      },
      UpdatedNotes: ({ value }) => [
        evo(model, { notes: () => value }),
        [],
      ],
    }),
  )

export const init = (): Model => ({
  currency: Select.init({
    id: 'payout-threshold-currency',
    isAnimated: true,
  }),
  selectedCurrency: 'usd',
  amount: Slider.init({
    id: 'payout-threshold-amount',
    min: 50,
    max: 10000,
    step: 50,
  }),
  amountValue: 2500,
  notes: '',
})

export const view = (model: Model): Html => {
  const h = html<Message>()

  return card<Message>({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Payout Threshold'] }),
          cardDescription({
            children: [
              'Set the minimum balance required before a payout is triggered.',
            ],
          }),
          cardAction({
            children: [
              button({
                variant: 'ghost',
                size: 'icon',
                class: 'size-8 bg-muted',
                children: [Icon.icon('x')],
              }),
            ],
          }),
        ],
      }),
      cardContent({
        children: [
          fieldGroup({
            children: [
              field({
                children: [
                  fieldLabel({
                    for: 'payout-threshold-currency',
                    children: ['Preferred Currency'],
                  }),
                  Select.select({
                    model: model.currency,
                    maybeSelectedValue: Option.some(model.selectedCurrency),
                    toParentMessage: message =>
                      GotCurrencyMessage({ message }),
                    items: currencies,
                    itemToValue: currency => currency.value,
                    itemToLabel: currency => currency.label,
                    triggerClass: 'w-full',
                  }),
                ],
              }),
              field({
                children: [
                  h.div(
                    [h.Class('flex items-baseline justify-between')],
                    [
                      fieldLabel({
                        for: 'payout-threshold-amount',
                        children: ['Minimum Payout Amount'],
                      }),
                      h.span(
                        [
                          h.Class(
                            'text-2xl font-semibold tabular-nums',
                          ),
                        ],
                        [`$${model.amountValue.toFixed(2)}`],
                      ),
                    ],
                  ),
                  Slider.slider({
                    model: model.amount,
                    value: model.amountValue,
                    toParentMessage: message =>
                      GotAmountMessage({ message }),
                    ariaLabel: 'Minimum Payout Amount',
                  }),
                  h.div(
                    [h.Class('flex items-center justify-between')],
                    [
                      fieldDescription({ children: ['$50 (MIN)'] }),
                      fieldDescription({ children: ['$10,000 (MAX)'] }),
                    ],
                  ),
                ],
              }),
              field({
                children: [
                  fieldLabel({
                    for: 'payout-threshold-notes',
                    children: ['Notes'],
                  }),
                  textarea({
                    id: 'payout-threshold-notes',
                    value: model.notes,
                    onInput: value => UpdatedNotes({ value }),
                    placeholder:
                      'Add any notes for this payout configuration...',
                    class: 'min-h-[100px]',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      cardFooter({
        children: [
          button({ class: 'w-full', children: ['Save Threshold'] }),
        ],
      }),
    ],
  })
}

// SUBSCRIPTIONS — slider drag needs document-level pointer subscriptions.

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift({
    payoutAmountPointer: Slider.subscriptions.dragPointer,
    payoutAmountEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>({
    toChildModel: model => model.amount,
    toParentMessage: message => GotAmountMessage({ message }),
  }),
)

/*
Stateful? yes.
Submodels wired: Select (preferred currency), Slider (minimum payout).
PORT NOTEs: none.
*/
