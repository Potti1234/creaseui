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
  fieldSeparator,
} from '@/ui/field'
import * as Select from '@/ui/select'
import * as Switch from '@/ui/switch'

const currencies = [
  { value: 'usd', label: 'USD — United States Dollar' },
  { value: 'eur', label: 'EUR — Euro' },
  { value: 'gbp', label: 'GBP — British Pound' },
  { value: 'jpy', label: 'JPY — Japanese Yen' },
] as const

export const Model = S.Struct({
  currency: Select.Model,
  publicStatistics: Switch.Model,
  emailNotifications: Switch.Model,
})
export type Model = typeof Model.Type

export const GotCurrencyMessage = m('GotCurrencyMessage', {
  message: Select.Message,
})
export const GotPublicStatisticsMessage = m(
  'GotPublicStatisticsMessage',
  { message: Switch.Message },
)
export const GotEmailNotificationsMessage = m(
  'GotEmailNotificationsMessage',
  { message: Switch.Message },
)
export const Message = S.Union([
  GotCurrencyMessage,
  GotPublicStatisticsMessage,
  GotEmailNotificationsMessage,
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
        const [currency, commands] = Select.update(
          model.currency,
          childMessage,
        )
        return [
          evo(model, { currency: () => currency }),
          Command.mapMessages(commands, next =>
            GotCurrencyMessage({ message: next }),
          ),
        ]
      },
      GotPublicStatisticsMessage: ({ message: childMessage }) => {
        const [publicStatistics, commands] = Switch.update(
          model.publicStatistics,
          childMessage,
        )
        return [
          evo(model, { publicStatistics: () => publicStatistics }),
          Command.mapMessages(commands, next =>
            GotPublicStatisticsMessage({ message: next }),
          ),
        ]
      },
      GotEmailNotificationsMessage: ({ message: childMessage }) => {
        const [emailNotifications, commands] = Switch.update(
          model.emailNotifications,
          childMessage,
        )
        return [
          evo(model, { emailNotifications: () => emailNotifications }),
          Command.mapMessages(commands, next =>
            GotEmailNotificationsMessage({ message: next }),
          ),
        ]
      },
    }),
  )

export const init = (): Model => ({
  currency: Select.init({
    id: 'preferences-currency',
    selectedItem: 'usd',
    isAnimated: true,
  }),
  publicStatistics: Switch.init({
    id: 'preferences-public-statistics',
    isChecked: true,
  }),
  emailNotifications: Switch.init({
    id: 'preferences-email-notifications',
    isChecked: true,
  }),
})

export const view = (model: Model): Html =>
  card<Message>({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Preferences'] }),
          cardDescription({
            children: [
              'Manage your account settings and notifications.',
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
            class: 'gap-[22px]',
            children: [
              field({
                children: [
                  fieldLabel({
                    for: 'preferences-currency',
                    children: ['Default Currency'],
                  }),
                  Select.select({
                    model: model.currency,
                    toParentMessage: message =>
                      GotCurrencyMessage({ message }),
                    items: currencies,
                    itemToValue: currency => currency.value,
                    itemToLabel: currency => currency.label,
                    triggerClass: 'w-full',
                  }),
                ],
              }),
              fieldSeparator({ class: '-my-4' }),
              Switch.switch({
                model: model.publicStatistics,
                toParentMessage: message =>
                  GotPublicStatisticsMessage({ message }),
                label: 'Public Statistics',
                description:
                  'Allow others to see your total stream count and listening activity',
                class: 'order-2 ml-auto',
              }),
              fieldSeparator({ class: '-my-4' }),
              Switch.switch({
                model: model.emailNotifications,
                toParentMessage: message =>
                  GotEmailNotificationsMessage({ message }),
                label: 'Email Notifications',
                description:
                  'Monthly royalty reports and distribution updates',
                class: 'order-2 ml-auto',
              }),
            ],
          }),
        ],
      }),
      cardFooter({
        children: [
          button({ variant: 'outline', children: ['Reset'] }),
          button({
            class: 'ml-auto',
            children: ['Save Preferences'],
          }),
        ],
      }),
    ],
  })

/*
Stateful? yes.
Submodels wired: Select (currency), Switch (public statistics, email notifications).
PORT NOTEs: Switch wrapper content is reordered with utility classes to match the source's horizontal Field layout.
*/
