import { Match as M, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { type Html, type HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { button } from '@/ui/button';
import {
  card,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/ui/card';
import { field, fieldGroup, fieldLabel } from '@/ui/field';
import { input } from '@/ui/input';

export const Model = S.Struct({
  goalName: S.String,
  targetAmount: S.String,
  targetDate: S.String,
});
export type Model = typeof Model.Type;

export const UpdatedGoalName = m('UpdatedGoalName', { value: S.String });
export const UpdatedTargetAmount = m('UpdatedTargetAmount', {
  value: S.String,
});
export const UpdatedTargetDate = m('UpdatedTargetDate', {
  value: S.String,
});
export const Message = S.Union([
  UpdatedGoalName,
  UpdatedTargetAmount,
  UpdatedTargetDate,
]);
export type Message = typeof Message.Type;

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const init = (): Model => ({
  goalName: '',
  targetAmount: '$15,000',
  targetDate: 'Dec 2025',
});

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      UpdatedGoalName: ({ value }) => [{ ...model, goalName: value }, []],
      UpdatedTargetAmount: ({ value }) => [
        { ...model, targetAmount: value },
        [],
      ],
      UpdatedTargetDate: ({ value }) => [{ ...model, targetDate: value }, []],
    }),
  );

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  return card(
    {
      children: [
        cardHeader(
          {
            children: [
              cardTitle({ children: ['Set a new milestone'] }, h),
              cardDescription(
                {
                  children: [
                    "Define your financial target and we'll help you pace your savings.",
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
                              for: 'goal-name',
                              children: ['Goal Name'],
                            },
                            h,
                          ),
                          input(
                            {
                              id: 'goal-name',
                              value: model.goalName,
                              onInput: (value) => UpdatedGoalName({ value }),
                              placeholder: 'e.g. New Car, Home Downpayment',
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    h.div(
                      [h.Class('grid grid-cols-2 gap-3')],
                      [
                        field(
                          {
                            children: [
                              fieldLabel(
                                {
                                  for: 'target-amount',
                                  children: ['Target Amount'],
                                },
                                h,
                              ),
                              input(
                                {
                                  id: 'target-amount',
                                  value: model.targetAmount,
                                  onInput: (value) =>
                                    UpdatedTargetAmount({ value }),
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
                                  for: 'target-date',
                                  children: ['Target Date'],
                                },
                                h,
                              ),
                              input(
                                {
                                  id: 'target-date',
                                  value: model.targetDate,
                                  onInput: (value) =>
                                    UpdatedTargetDate({ value }),
                                },
                                h,
                              ),
                            ],
                          },
                          h,
                        ),
                      ],
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
            class: 'flex-col gap-2',
            children: [
              button({ class: 'w-full', children: ['Create Goal'] }, h),
              button(
                {
                  variant: 'outline',
                  class: 'w-full',
                  children: ['Cancel'],
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
};

/*
Minimal wiring:
const model = init()
const [nextModel, commands] = update(model, message)
const cardView = view(model)
*/
// Stateful? yes. Submodels wired: none (local controlled inputs). PORT NOTEs: none.
