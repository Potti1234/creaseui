import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import { button } from '@/ui/button'
import {
  card,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/ui/card'
import * as Checkbox from '@/ui/checkbox'
import { fieldGroup } from '@/ui/field'

const notifications = [
  {
    key: 'transactions',
    label: 'Transaction alerts',
    description: 'Deposits, withdrawals, and transfers.',
  },
  {
    key: 'security',
    label: 'Security alerts',
    description: 'Login attempts and account changes.',
  },
  {
    key: 'goals',
    label: 'Goal milestones',
    description: 'Updates at 25%, 50%, 75%, and 100%.',
  },
  {
    key: 'market',
    label: 'Market updates',
    description: 'Daily portfolio summary and price alerts.',
  },
] as const

export const Model = S.Struct({
  all: Checkbox.Model,
  transactions: Checkbox.Model,
  security: Checkbox.Model,
  goals: Checkbox.Model,
  market: Checkbox.Model,
})
export type Model = typeof Model.Type

export const GotAllMessage = m('GotAllMessage', {
  message: Checkbox.Message,
})
export const GotTransactionsMessage = m('GotTransactionsMessage', {
  message: Checkbox.Message,
})
export const GotSecurityMessage = m('GotSecurityMessage', {
  message: Checkbox.Message,
})
export const GotGoalsMessage = m('GotGoalsMessage', {
  message: Checkbox.Message,
})
export const GotMarketMessage = m('GotMarketMessage', {
  message: Checkbox.Message,
})
export const Message = S.Union([
  GotAllMessage,
  GotTransactionsMessage,
  GotSecurityMessage,
  GotGoalsMessage,
  GotMarketMessage,
])
export type Message = typeof Message.Type

type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
]

const childStates = (model: Model): ReadonlyArray<boolean> => [
  model.transactions.isChecked,
  model.security.isChecked,
  model.goals.isChecked,
  model.market.isChecked,
]

const reconcileAll = (model: Model): Model =>
  evo(model, {
    all: () =>
      Checkbox.reflectChecked(
        model.all,
        childStates(model).every(Boolean),
      ),
  })

const updateChild = (
  model: Model,
  key: 'transactions' | 'security' | 'goals' | 'market',
  childMessage: Checkbox.Message,
  wrap: (message: Checkbox.Message) => Message,
): UpdateReturn => {
  const [next, commands] = Checkbox.update(model[key], childMessage)
  const updated = reconcileAll(
    M.value(key).pipe(
      M.withReturnType<Model>(),
      M.when('transactions', () =>
        evo(model, { transactions: () => next }),
      ),
      M.when('security', () => evo(model, { security: () => next })),
      M.when('goals', () => evo(model, { goals: () => next })),
      M.when('market', () => evo(model, { market: () => next })),
      M.exhaustive,
    ),
  )
  return [updated, Command.mapMessages(commands, wrap)]
}

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotAllMessage: ({ message: childMessage }) => {
        const [all, commands] = Checkbox.update(model.all, childMessage)
        const isChecked = all.isChecked
        return [
          evo(model, {
            all: () => all,
            transactions: current =>
              Checkbox.reflectChecked(current, isChecked),
            security: current =>
              Checkbox.reflectChecked(current, isChecked),
            goals: current => Checkbox.reflectChecked(current, isChecked),
            market: current => Checkbox.reflectChecked(current, isChecked),
          }),
          Command.mapMessages(commands, next =>
            GotAllMessage({ message: next }),
          ),
        ]
      },
      GotTransactionsMessage: ({ message: childMessage }) =>
        updateChild(
          model,
          'transactions',
          childMessage,
          next => GotTransactionsMessage({ message: next }),
        ),
      GotSecurityMessage: ({ message: childMessage }) =>
        updateChild(
          model,
          'security',
          childMessage,
          next => GotSecurityMessage({ message: next }),
        ),
      GotGoalsMessage: ({ message: childMessage }) =>
        updateChild(
          model,
          'goals',
          childMessage,
          next => GotGoalsMessage({ message: next }),
        ),
      GotMarketMessage: ({ message: childMessage }) =>
        updateChild(
          model,
          'market',
          childMessage,
          next => GotMarketMessage({ message: next }),
        ),
    }),
  )

export const init = (): Model => ({
  all: Checkbox.init({
    id: 'notification-settings-all',
    isChecked: false,
  }),
  transactions: Checkbox.init({
    id: 'notification-settings-transactions',
    isChecked: true,
  }),
  security: Checkbox.init({
    id: 'notification-settings-security',
    isChecked: true,
  }),
  goals: Checkbox.init({
    id: 'notification-settings-goals',
    isChecked: false,
  }),
  market: Checkbox.init({
    id: 'notification-settings-market',
    isChecked: false,
  }),
})

export const view = (model: Model): Html => {
  const states = childStates(model)
  const allChecked = states.every(Boolean)
  const someChecked = states.some(Boolean) && !allChecked

  return card<Message>({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Notifications'] }),
          cardDescription({
            children: ['Choose what you want to be notified about.'],
          }),
        ],
      }),
      cardContent({
        children: [
          fieldGroup({
            class: 'gap-[22px]',
            children: [
              Checkbox.checkbox({
                model: model.all,
                toParentMessage: message => GotAllMessage({ message }),
                label: 'Select all',
                isIndeterminate: someChecked,
              }),
              ...notifications.map(notification =>
                Checkbox.checkbox({
                  model: model[notification.key],
                  toParentMessage: message =>
                    M.value(notification.key).pipe(
                      M.when('transactions', () =>
                        GotTransactionsMessage({ message }),
                      ),
                      M.when('security', () =>
                        GotSecurityMessage({ message }),
                      ),
                      M.when('goals', () =>
                        GotGoalsMessage({ message }),
                      ),
                      M.when('market', () =>
                        GotMarketMessage({ message }),
                      ),
                      M.exhaustive,
                    ),
                  label: notification.label,
                  description: notification.description,
                }),
              ),
            ],
          }),
        ],
      }),
      cardFooter({
        children: [
          button({ class: 'w-full', children: ['Save Preferences'] }),
        ],
      }),
    ],
  })
}

/*
Stateful? yes.
Submodels wired: Checkbox (select all and four notification choices).
PORT NOTEs: The shared Checkbox wrapper owns its label/description layout, so each source horizontal Field is represented by that equivalent accessible wrapper.
*/
