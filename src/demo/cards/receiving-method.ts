import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html } from 'foldkit/html'
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
  fieldGroup,
  fieldLabel,
  fieldLegend,
  fieldSet,
} from '@/ui/field'
import { input } from '@/ui/input'
import * as RadioGroup from '@/ui/radio-group'

export const Model = S.Struct({
  accountHolder: S.String,
  receivingMethod: RadioGroup.Model,
  iban: S.String,
})
export type Model = typeof Model.Type

export const UpdatedAccountHolder = m('UpdatedAccountHolder', {
  value: S.String,
})
export const GotReceivingMethodMessage = m(
  'GotReceivingMethodMessage',
  { message: RadioGroup.Message },
)
export const UpdatedIban = m('UpdatedIban', { value: S.String })
export const Message = S.Union([
  UpdatedAccountHolder,
  GotReceivingMethodMessage,
  UpdatedIban,
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
      UpdatedAccountHolder: ({ value }) => [
        evo(model, { accountHolder: () => value }),
        [],
      ],
      GotReceivingMethodMessage: ({ message: childMessage }) => {
        const [receivingMethod, commands] = RadioGroup.update(
          model.receivingMethod,
          childMessage,
        )
        return [
          evo(model, { receivingMethod: () => receivingMethod }),
          Command.mapMessages(commands, next =>
            GotReceivingMethodMessage({ message: next }),
          ),
        ]
      },
      UpdatedIban: ({ value }) => [
        evo(model, { iban: () => value }),
        [],
      ],
    }),
  )

export const init = (): Model => ({
  accountHolder: 'Synthetic Horizons Music LLC',
  receivingMethod: RadioGroup.init({
    id: 'receiving-method-choice',
    selectedValue: 'bank',
  }),
  iban: '',
})

export const view = (model: Model): Html =>
  card<Message>({
    children: [
      cardHeader({
        children: [
          cardDescription({ children: ['Payout Preferences'] }),
          cardTitle({ children: ['Receiving Method'] }),
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
                    for: 'receiving-method-account-holder',
                    children: ['Account Holder Name'],
                  }),
                  input({
                    id: 'receiving-method-account-holder',
                    value: model.accountHolder,
                    onInput: value => UpdatedAccountHolder({ value }),
                  }),
                ],
              }),
              fieldSet({
                children: [
                  fieldLegend({
                    variant: 'label',
                    children: ['Receiving Method'],
                  }),
                  RadioGroup.radioGroup({
                    model: model.receivingMethod,
                    toParentMessage: message =>
                      GotReceivingMethodMessage({ message }),
                    ariaLabel: 'Receiving Method',
                    options: [
                      {
                        value: 'bank',
                        label: 'Bank Transfer',
                        description: 'SWIFT / IBAN',
                      },
                      {
                        value: 'paypal',
                        label: 'PayPal',
                        description: 'Instant Payout',
                      },
                    ],
                    class:
                      'grid grid-cols-1 items-start gap-3 md:grid-cols-2',
                  }),
                ],
              }),
              field({
                children: [
                  fieldLabel({
                    for: 'receiving-method-iban',
                    children: ['IBAN / Account Number'],
                  }),
                  input({
                    id: 'receiving-method-iban',
                    value: model.iban,
                    onInput: value => UpdatedIban({ value }),
                    placeholder: 'DE89 3704 0044 ....',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      cardFooter({
        children: [
          button({
            class: 'w-full',
            isDisabled: true,
            children: ['Save Payout Settings'],
          }),
        ],
      }),
    ],
  })

/*
Stateful? yes.
Submodels wired: RadioGroup (receiving method).
PORT NOTEs: The shared RadioGroup wrapper cannot reproduce shadcn's Field-inside-FieldLabel option cards, so it uses the closest two-column labeled radio layout.
*/
