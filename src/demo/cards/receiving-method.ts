import { Match as M, Option, Schema as S } from 'effect';
import type { Command } from 'foldkit';
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
import {
  field,
  fieldGroup,
  fieldLabel,
  fieldLegend,
  fieldSet,
} from '@/ui/field';
import { input } from '@/ui/input';
import * as RadioGroup from '@/ui/radio-group';

export const Model = S.Struct({
  accountHolder: S.String,
  receivingMethod: S.String,
  iban: S.String,
});
export type Model = typeof Model.Type;

export const UpdatedAccountHolder = m('UpdatedAccountHolder', {
  value: S.String,
});
export const SelectedReceivingMethod = m('SelectedReceivingMethod', {
  value: S.String,
});
export const UpdatedIban = m('UpdatedIban', { value: S.String });
export const Message = S.Union([
  UpdatedAccountHolder,
  SelectedReceivingMethod,
  UpdatedIban,
]);
export type Message = typeof Message.Type;

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      UpdatedAccountHolder: ({ value }) => [
        evo(model, { accountHolder: () => value }),
        [],
      ],
      SelectedReceivingMethod: ({ value }) => [
        { ...model, receivingMethod: value },
        [],
      ],
      UpdatedIban: ({ value }) => [evo(model, { iban: () => value }), []],
    }),
  );

export const init = (): Model => ({
  accountHolder: 'Synthetic Horizons Music LLC',
  receivingMethod: 'bank',
  iban: '',
});

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  card<Message>(
    {
      children: [
        cardHeader(
          {
            children: [
              cardDescription({ children: ['Payout Preferences'] }, h),
              cardTitle({ children: ['Receiving Method'] }, h),
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
                  children: [
                    field(
                      {
                        children: [
                          fieldLabel(
                            {
                              for: 'receiving-method-account-holder',
                              children: ['Account Holder Name'],
                            },
                            h,
                          ),
                          input(
                            {
                              id: 'receiving-method-account-holder',
                              value: model.accountHolder,
                              onInput: (value) =>
                                UpdatedAccountHolder({ value }),
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    fieldSet(
                      {
                        children: [
                          fieldLegend(
                            {
                              variant: 'label',
                              children: ['Receiving Method'],
                            },
                            h,
                          ),
                          RadioGroup.radioGroup(
                            {
                              id: 'receiving-method-choice',
                              selectedValue: Option.some(model.receivingMethod),
                              onSelect: (value) =>
                                SelectedReceivingMethod({ value }),
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
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    field(
                      {
                        children: [
                          fieldLabel(
                            {
                              for: 'receiving-method-iban',
                              children: ['IBAN / Account Number'],
                            },
                            h,
                          ),
                          input(
                            {
                              id: 'receiving-method-iban',
                              value: model.iban,
                              onInput: (value) => UpdatedIban({ value }),
                              placeholder: 'DE89 3704 0044 ....',
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
            ],
          },
          h,
        ),
        cardFooter(
          {
            children: [
              button(
                {
                  class: 'w-full',
                  isDisabled: true,
                  children: ['Save Payout Settings'],
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
Submodels wired: RadioGroup (receiving method).
PORT NOTEs: The shared RadioGroup wrapper cannot reproduce shadcn's Field-inside-FieldLabel option cards, so it uses the closest two-column labeled radio layout.
*/
