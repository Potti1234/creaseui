import { Match as M, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { evo } from 'foldkit/struct';

import * as Icon from '@/lib/icon';
import { button } from '@/ui/button';
import {
  card,
  cardAction,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/ui/card';
import { field, fieldGroup, fieldLabel, fieldSeparator } from '@/ui/field';
import * as Select from '@/ui/select';
import * as Switch from '@/ui/switch';

const currencies = [
  { value: 'usd', label: 'USD — United States Dollar' },
  { value: 'eur', label: 'EUR — Euro' },
  { value: 'gbp', label: 'GBP — British Pound' },
  { value: 'jpy', label: 'JPY — Japanese Yen' },
] as const;

export const Model = S.Struct({
  currency: Select.Model,
  selectedCurrency: S.String,
  publicStatistics: S.Boolean,
  emailNotifications: S.Boolean,
});
export type Model = typeof Model.Type;

export const GotCurrencyMessage = m('GotCurrencyMessage', {
  message: Select.Message,
});
export const ToggledPublicStatistics = m('ToggledPublicStatistics', {
  isChecked: S.Boolean,
});
export const ToggledEmailNotifications = m('ToggledEmailNotifications', {
  isChecked: S.Boolean,
});
export const Message = S.Union([
  GotCurrencyMessage,
  ToggledPublicStatistics,
  ToggledEmailNotifications,
]);
export type Message = typeof Message.Type;

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotCurrencyMessage: ({ message: childMessage }) => {
        const [currency, commands, maybeSelection] = Select.update(
          model.currency,
          childMessage,
        );
        return [
          evo(model, {
            currency: () => currency,
            selectedCurrency: (current) =>
              Option.match(maybeSelection, {
                onNone: () => current,
                onSome: (selection) =>
                  selection._tag === 'Selected' ? selection.value : current,
              }),
          }),
          Command.mapMessages(commands, (next) =>
            GotCurrencyMessage({ message: next }),
          ),
        ];
      },
      ToggledPublicStatistics: ({ isChecked }) => [
        { ...model, publicStatistics: isChecked },
        [],
      ],
      ToggledEmailNotifications: ({ isChecked }) => [
        { ...model, emailNotifications: isChecked },
        [],
      ],
    }),
  );

export const init = (): Model => ({
  currency: Select.init({
    id: 'preferences-currency',
    isAnimated: true,
  }),
  selectedCurrency: 'usd',
  publicStatistics: true,
  emailNotifications: true,
});

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  card<Message>(
    {
      children: [
        cardHeader(
          {
            children: [
              cardTitle({ children: ['Preferences'] }, h),
              cardDescription(
                {
                  children: ['Manage your account settings and notifications.'],
                },
                h,
              ),
              cardAction(
                {
                  children: [
                    button(
                      {
                        variant: 'ghost',
                        size: 'icon',
                        class: 'size-8 bg-muted',
                        children: [Icon.icon('x', {}, h)],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        cardContent(
          {
            children: [
              fieldGroup(
                {
                  class: 'gap-[22px]',
                  children: [
                    field(
                      {
                        children: [
                          fieldLabel(
                            {
                              for: 'preferences-currency',
                              children: ['Default Currency'],
                            },
                            h,
                          ),
                          Select.select(
                            {
                              model: model.currency,
                              maybeSelectedValue: Option.some(
                                model.selectedCurrency,
                              ),
                              toParentMessage: (message) =>
                                GotCurrencyMessage({ message }),
                              items: currencies,
                              itemToValue: (currency) => currency.value,
                              itemToLabel: (currency) => currency.label,
                              triggerClass: 'w-full',
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    fieldSeparator({ class: '-my-4' }, h),
                    Switch.switch(
                      {
                        id: 'preferences-public-statistics',
                        isChecked: model.publicStatistics,
                        onToggle: (isChecked) =>
                          ToggledPublicStatistics({ isChecked }),
                        label: 'Public Statistics',
                        description:
                          'Allow others to see your total stream count and listening activity',
                        class: 'order-2 ml-auto',
                      },
                      h,
                    ),
                    fieldSeparator({ class: '-my-4' }, h),
                    Switch.switch(
                      {
                        id: 'preferences-email-notifications',
                        isChecked: model.emailNotifications,
                        onToggle: (isChecked) =>
                          ToggledEmailNotifications({ isChecked }),
                        label: 'Email Notifications',
                        description:
                          'Monthly royalty reports and distribution updates',
                        class: 'order-2 ml-auto',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        cardFooter(
          {
            children: [
              button({ variant: 'outline', children: ['Reset'] }, h),
              button(
                {
                  class: 'ml-auto',
                  children: ['Save Preferences'],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

/*
Stateful? yes.
Submodels wired: Select (currency), Switch (public statistics, email notifications).
PORT NOTEs: Switch wrapper content is reordered with utility classes to match the source's horizontal Field layout.
*/
