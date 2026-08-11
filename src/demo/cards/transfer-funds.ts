import { Match as M, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { evo } from 'foldkit/struct';

import * as Icon from '@/demo/icon-preview';
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
import { field, fieldGroup, fieldLabel } from '@/ui/field';
import {
  inputGroup,
  inputGroupAddon,
  inputGroupInput,
  inputGroupText,
} from '@/ui/input-group';
import { item, itemContent } from '@/ui/item';
import * as Select from '@/ui/select';
import { separator } from '@/ui/separator';

const fromAccounts = [
  {
    value: 'checking',
    label: 'Main Checking (··8402) — $12,450.00',
  },
  {
    value: 'business',
    label: 'Business (··7731) — $8,920.00',
  },
] as const;

const toAccounts = [
  {
    value: 'savings',
    label: 'High Yield Savings (··1192) — $42,100.00',
  },
  {
    value: 'investment',
    label: 'Investment (··3349) — $18,200.00',
  },
] as const;

export const Model = S.Struct({
  amount: S.String,
  fromAccount: Select.Model,
  selectedFromAccount: S.String,
  toAccount: Select.Model,
  selectedToAccount: S.String,
});
export type Model = typeof Model.Type;

export const UpdatedAmount = m('UpdatedAmount', { value: S.String });
export const GotFromAccountMessage = m('GotFromAccountMessage', {
  message: Select.Message,
});
export const GotToAccountMessage = m('GotToAccountMessage', {
  message: Select.Message,
});
export const Message = S.Union([
  UpdatedAmount,
  GotFromAccountMessage,
  GotToAccountMessage,
]);
export type Message = typeof Message.Type;

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      UpdatedAmount: ({ value }) => [evo(model, { amount: () => value }), []],
      GotFromAccountMessage: ({ message: childMessage }) => {
        const [fromAccount, commands, maybeSelection] = Select.update(
          model.fromAccount,
          childMessage,
        );
        return [
          evo(model, {
            fromAccount: () => fromAccount,
            selectedFromAccount: (current) =>
              Option.match(maybeSelection, {
                onNone: () => current,
                onSome: (selection) =>
                  selection._tag === 'Selected' ? selection.value : current,
              }),
          }),
          Command.mapMessages(commands, (next) =>
            GotFromAccountMessage({ message: next }),
          ),
        ];
      },
      GotToAccountMessage: ({ message: childMessage }) => {
        const [toAccount, commands, maybeSelection] = Select.update(
          model.toAccount,
          childMessage,
        );
        return [
          evo(model, {
            toAccount: () => toAccount,
            selectedToAccount: (current) =>
              Option.match(maybeSelection, {
                onNone: () => current,
                onSome: (selection) =>
                  selection._tag === 'Selected' ? selection.value : current,
              }),
          }),
          Command.mapMessages(commands, (next) =>
            GotToAccountMessage({ message: next }),
          ),
        ];
      },
    }),
  );

export const init = (): Model => ({
  amount: '1,200.00',
  fromAccount: Select.init({
    id: 'transfer-funds-from-account',
    isAnimated: true,
  }),
  selectedFromAccount: 'checking',
  toAccount: Select.init({
    id: 'transfer-funds-to-account',
    isAnimated: true,
  }),
  selectedToAccount: 'savings',
});

const summaryRow = (
  label: string,
  value: string,
  isTotal: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  return h.div(
    [h.Class('flex items-center justify-between')],
    [
      h.span(
        [
          h.Class(
            isTotal ? 'text-sm font-medium' : 'text-sm text-muted-foreground',
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
  );
};

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  card<Message>(
    {
      children: [
        cardHeader(
          {
            children: [
              cardTitle({ children: ['Transfer Funds'] }, h),
              cardDescription(
                {
                  children: ['Move money between your connected accounts.'],
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
                  class: 'gap-[21px]',
                  children: [
                    field(
                      {
                        children: [
                          fieldLabel(
                            {
                              for: 'transfer-funds-amount',
                              children: ['Amount to Transfer'],
                            },
                            h,
                          ),
                          inputGroup(
                            {
                              children: [
                                inputGroupAddon(
                                  {
                                    children: [
                                      inputGroupText({ children: ['$'] }, h),
                                    ],
                                  },
                                  h,
                                ),
                                inputGroupInput(
                                  {
                                    id: 'transfer-funds-amount',
                                    value: model.amount,
                                    onInput: (value) =>
                                      UpdatedAmount({ value }),
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
                    field(
                      {
                        children: [
                          fieldLabel(
                            {
                              for: 'transfer-funds-from-account',
                              children: ['From Account'],
                            },
                            h,
                          ),
                          Select.select(
                            {
                              model: model.fromAccount,
                              maybeSelectedValue: Option.some(
                                model.selectedFromAccount,
                              ),
                              toParentMessage: (message) =>
                                GotFromAccountMessage({ message }),
                              items: fromAccounts,
                              itemToValue: (account) => account.value,
                              itemToLabel: (account) => account.label,
                              triggerClass: 'w-full',
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
                              for: 'transfer-funds-to-account',
                              children: ['To Account'],
                            },
                            h,
                          ),
                          Select.select(
                            {
                              model: model.toAccount,
                              maybeSelectedValue: Option.some(
                                model.selectedToAccount,
                              ),
                              toParentMessage: (message) =>
                                GotToAccountMessage({ message }),
                              items: toAccounts,
                              itemToValue: (account) => account.value,
                              itemToLabel: (account) => account.label,
                              triggerClass: 'w-full',
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    item(
                      {
                        variant: 'muted',
                        class: 'flex-col items-stretch',
                        children: [
                          itemContent(
                            {
                              class: 'gap-3',
                              children: [
                                summaryRow(
                                  'Estimated arrival',
                                  'Today, Apr 14',
                                  false,
                                  h,
                                ),
                                separator({}, h),
                                summaryRow(
                                  'Transaction fee',
                                  '$0.00',
                                  false,
                                  h,
                                ),
                                separator({}, h),
                                summaryRow(
                                  'Total amount',
                                  '$1,200.00',
                                  true,
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
            ],
          },
          h,
        ),
        cardFooter(
          {
            children: [
              button({ class: 'w-full', children: ['Confirm Transfer'] }, h),
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
Submodels wired: Select (from account, to account).
PORT NOTEs: none.
*/
