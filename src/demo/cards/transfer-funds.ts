import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
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
import { field, fieldGroup, fieldLabel } from '@/ui/field'
import {
  inputGroup,
  inputGroupAddon,
  inputGroupInput,
  inputGroupText,
} from '@/ui/input-group'
import { item, itemContent } from '@/ui/item'
import * as Select from '@/ui/select'
import { separator } from '@/ui/separator'

const fromAccounts = [
  {
    value: 'checking',
    label: 'Main Checking (··8402) — $12,450.00',
  },
  {
    value: 'business',
    label: 'Business (··7731) — $8,920.00',
  },
] as const

const toAccounts = [
  {
    value: 'savings',
    label: 'High Yield Savings (··1192) — $42,100.00',
  },
  {
    value: 'investment',
    label: 'Investment (··3349) — $18,200.00',
  },
] as const

export const Model = S.Struct({
  amount: S.String,
  fromAccount: Select.Model,
  toAccount: Select.Model,
})
export type Model = typeof Model.Type

export const UpdatedAmount = m('UpdatedAmount', { value: S.String })
export const GotFromAccountMessage = m('GotFromAccountMessage', {
  message: Select.Message,
})
export const GotToAccountMessage = m('GotToAccountMessage', {
  message: Select.Message,
})
export const Message = S.Union([
  UpdatedAmount,
  GotFromAccountMessage,
  GotToAccountMessage,
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
      UpdatedAmount: ({ value }) => [
        evo(model, { amount: () => value }),
        [],
      ],
      GotFromAccountMessage: ({ message: childMessage }) => {
        const [fromAccount, commands] = Select.update(
          model.fromAccount,
          childMessage,
        )
        return [
          evo(model, { fromAccount: () => fromAccount }),
          Command.mapMessages(commands, next =>
            GotFromAccountMessage({ message: next }),
          ),
        ]
      },
      GotToAccountMessage: ({ message: childMessage }) => {
        const [toAccount, commands] = Select.update(
          model.toAccount,
          childMessage,
        )
        return [
          evo(model, { toAccount: () => toAccount }),
          Command.mapMessages(commands, next =>
            GotToAccountMessage({ message: next }),
          ),
        ]
      },
    }),
  )

export const init = (): Model => ({
  amount: '1,200.00',
  fromAccount: Select.init({
    id: 'transfer-funds-from-account',
    selectedItem: 'checking',
    isAnimated: true,
  }),
  toAccount: Select.init({
    id: 'transfer-funds-to-account',
    selectedItem: 'savings',
    isAnimated: true,
  }),
})

const summaryRow = (
  label: string,
  value: string,
  isTotal = false,
): Html => {
  const h = html<Message>()

  return h.div(
    [h.Class('flex items-center justify-between')],
    [
      h.span(
        [
          h.Class(
            isTotal
              ? 'text-sm font-medium'
              : 'text-sm text-muted-foreground',
          ),
        ],
        [label],
      ),
      h.span(
        [
          h.Class(
            isTotal
              ? 'text-sm font-semibold tabular-nums'
              : 'text-sm font-medium tabular-nums',
          ),
        ],
        [value],
      ),
    ],
  )
}

export const view = (model: Model): Html =>
  card<Message>({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Transfer Funds'] }),
          cardDescription({
            children: ['Move money between your connected accounts.'],
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
            class: 'gap-[21px]',
            children: [
              field({
                children: [
                  fieldLabel({
                    for: 'transfer-funds-amount',
                    children: ['Amount to Transfer'],
                  }),
                  inputGroup({
                    children: [
                      inputGroupAddon({
                        children: [
                          inputGroupText({ children: ['$'] }),
                        ],
                      }),
                      inputGroupInput({
                        id: 'transfer-funds-amount',
                        value: model.amount,
                        onInput: value => UpdatedAmount({ value }),
                      }),
                    ],
                  }),
                ],
              }),
              field({
                children: [
                  fieldLabel({
                    for: 'transfer-funds-from-account',
                    children: ['From Account'],
                  }),
                  Select.select({
                    model: model.fromAccount,
                    toParentMessage: message =>
                      GotFromAccountMessage({ message }),
                    items: fromAccounts,
                    itemToValue: account => account.value,
                    itemToLabel: account => account.label,
                    triggerClass: 'w-full',
                  }),
                ],
              }),
              field({
                children: [
                  fieldLabel({
                    for: 'transfer-funds-to-account',
                    children: ['To Account'],
                  }),
                  Select.select({
                    model: model.toAccount,
                    toParentMessage: message =>
                      GotToAccountMessage({ message }),
                    items: toAccounts,
                    itemToValue: account => account.value,
                    itemToLabel: account => account.label,
                    triggerClass: 'w-full',
                  }),
                ],
              }),
              item({
                variant: 'muted',
                class: 'flex-col items-stretch',
                children: [
                  itemContent({
                    class: 'gap-3',
                    children: [
                      summaryRow(
                        'Estimated arrival',
                        'Today, Apr 14',
                      ),
                      separator(),
                      summaryRow('Transaction fee', '$0.00'),
                      separator(),
                      summaryRow('Total amount', '$1,200.00', true),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      cardFooter({
        children: [
          button({ class: 'w-full', children: ['Confirm Transfer'] }),
        ],
      }),
    ],
  })

/*
Stateful? yes.
Submodels wired: Select (from account, to account).
PORT NOTEs: none.
*/
