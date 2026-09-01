import { Match as M, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { evo } from 'foldkit/struct';
import * as stylex from '@stylexjs/stylex'

import * as Icon from '@/demo/icon-preview';
import { button } from '@/stylex/button';
import {
  card,
  cardAction,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/stylex/card';
import {
  field,
  fieldGroup,
  fieldLabel,
  fieldLegend,
  fieldSet,
} from '@/stylex/field';
import { input } from '@/stylex/input';
import * as RadioGroup from '@/stylex/radio-group';
import { className } from '@/stylex/style'

const styles = stylex.create({
  action: { display: 'grid', width: '100%' },
  icon: { display: 'inline-flex', flexShrink: 0, height: '1rem', width: '1rem' },
  srOnly: {
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
})

export const Model = S.Struct({
  accountHolder: S.String,
  receivingMethod: S.String,
  iban: S.String,
  radioGroup: RadioGroup.Model,
});
export type Model = typeof Model.Type;

export const UpdatedAccountHolder = m('UpdatedAccountHolder', {
  value: S.String,
});
export const SelectedReceivingMethod = m('SelectedReceivingMethod', {
  value: S.String,
});
export const UpdatedIban = m('UpdatedIban', { value: S.String });
export const GotRadioGroupMessage = m('GotReceivingMethodRadioGroupMessage', { message: RadioGroup.Message });
export const Message = S.Union([
  UpdatedAccountHolder,
  SelectedReceivingMethod,
  UpdatedIban,
  GotRadioGroupMessage,
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
      GotReceivingMethodRadioGroupMessage: ({ message }) => {
        const [radioGroup, commands, maybeSelection] = RadioGroup.update(model.radioGroup, message);
        return [
          {
            ...model,
            radioGroup,
            receivingMethod: Option.match(maybeSelection, {
              onNone: () => model.receivingMethod,
              onSome: selection => selection.value,
            }),
          },
          Command.mapMessages(commands, childMessage => GotRadioGroupMessage({ message: childMessage })),
        ];
      },
    }),
  );

export const init = (): Model => ({
  accountHolder: 'Synthetic Horizons Music LLC',
  receivingMethod: 'bank',
  iban: '',
  radioGroup: RadioGroup.init({ id: 'receiving-method-choice' }),
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
                        variant: 'secondary',
                        size: 'icon',
                        children: [
                          Icon.icon('x', { class: className(styles.icon) }, h),
                          h.span([h.Class(className(styles.srOnly))], ['Close Receiving Method']),
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
                              model: model.radioGroup,
                              selectedValue: Option.some(model.receivingMethod),
                              toParentMessage: (message) => GotRadioGroupMessage({ message }),
                              ariaLabel: 'Receiving Method',
                              columns: 2,
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
              h.div([h.Class(className(styles.action))], [button(
                {
                  isDisabled: true,
                  children: ['Save Payout Settings'],
                },
                h,
              )]),
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
