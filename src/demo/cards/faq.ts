import { Match as M, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { evo } from 'foldkit/struct';

import * as Accordion from '@/ui/accordion';
import { button } from '@/ui/button';
import { card, cardContent, cardFooter } from '@/ui/card';
import * as Tabs from '@/ui/tabs';

type Question = Readonly<{
  q: string;
  a: string;
}>;

const GENERAL_QUESTIONS: ReadonlyArray<Question> = [
  {
    q: 'How secure is my financial data with Ledger?',
    a: 'We use bank-level AES-256 encryption, SOC 2 Type II certified infrastructure, and never store your credentials. All connections use read-only access tokens. We are a SEC registered investment advisor.',
  },
  {
    q: 'How do I connect my bank or investment accounts?',
    a: 'Go to Settings > Linked Accounts and search for your institution. We support over 12,000 banks and brokerages via Plaid and MX.',
  },
  {
    q: 'Can I export my data for tax purposes?',
    a: 'Yes. Navigate to Reports > Tax Export to download a CSV or PDF summary of your transactions, dividends, and capital gains for any tax year.',
  },
];

const BILLING_QUESTIONS: ReadonlyArray<Question> = [
  {
    q: 'What is the difference between Basic and Pro pricing tiers?',
    a: 'Basic includes budgeting, goal tracking, and up to 3 linked accounts. Pro adds unlimited accounts, dividend tracking, portfolio analysis, and priority support.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Go to Settings > Billing > Manage Plan and click Cancel. Your access continues until the end of your current billing period.',
  },
  {
    q: 'Do you offer a free trial?',
    a: 'Yes. All new accounts start with a 14-day Pro trial. No credit card required.',
  },
];

const GOALS_QUESTIONS: ReadonlyArray<Question> = [
  {
    q: 'How do I set up a custom financial goal?',
    a: "Click New Goal from the Savings Targets card. Choose a category, set a target amount and date, and we'll calculate the monthly contribution needed.",
  },
  {
    q: 'Can I track multiple goals at once?',
    a: 'Yes. Pro accounts can track unlimited goals. Basic accounts support up to 3 active goals.',
  },
  {
    q: 'How are monthly contributions calculated?',
    a: 'We divide the remaining amount by the number of months until your target date, adjusted for your current savings rate and any auto-transfer schedules.',
  },
];

export const Model = S.Struct({
  tabs: Tabs.Model,
  selectedTab: S.String,
  general: Accordion.Model,
  billing: Accordion.Model,
  goals: Accordion.Model,
});
export type Model = typeof Model.Type;

export const GotTabsMessage = m('GotTabsMessage', {
  message: Tabs.Message,
});
export const GotGeneralMessage = m('GotGeneralMessage', {
  message: Accordion.Message,
});
export const GotBillingMessage = m('GotBillingMessage', {
  message: Accordion.Message,
});
export const GotGoalsMessage = m('GotGoalsMessage', {
  message: Accordion.Message,
});

export const Message = S.Union([
  GotTabsMessage,
  GotGeneralMessage,
  GotBillingMessage,
  GotGoalsMessage,
]);
export type Message = typeof Message.Type;

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotTabsMessage: ({ message: tabsMessage }) => {
        const [tabs, commands, maybeSelection] = Tabs.update(
          model.tabs,
          tabsMessage,
        );

        return [
          evo(model, {
            tabs: () => tabs,
            selectedTab: (current) =>
              Option.match(maybeSelection, {
                onNone: () => current,
                onSome: (selection) => selection.value,
              }),
          }),
          Command.mapMessages(commands, (nextMessage) =>
            GotTabsMessage({ message: nextMessage }),
          ),
        ];
      },
      GotGeneralMessage: ({ message: accordionMessage }) => {
        const [general, commands] = Accordion.update(
          model.general,
          accordionMessage,
        );

        return [
          evo(model, { general: () => general }),
          Command.mapMessages(commands, (nextMessage) =>
            GotGeneralMessage({ message: nextMessage }),
          ),
        ];
      },
      GotBillingMessage: ({ message: accordionMessage }) => {
        const [billing, commands] = Accordion.update(
          model.billing,
          accordionMessage,
        );

        return [
          evo(model, { billing: () => billing }),
          Command.mapMessages(commands, (nextMessage) =>
            GotBillingMessage({ message: nextMessage }),
          ),
        ];
      },
      GotGoalsMessage: ({ message: accordionMessage }) => {
        const [goals, commands] = Accordion.update(
          model.goals,
          accordionMessage,
        );

        return [
          evo(model, { goals: () => goals }),
          Command.mapMessages(commands, (nextMessage) =>
            GotGoalsMessage({ message: nextMessage }),
          ),
        ];
      },
    }),
  );

const accordionInit = (id: string): Accordion.Model =>
  Accordion.init({
    id,
    type: 'single',
    items: [
      { value: 'item-0', isOpen: true },
      { value: 'item-1' },
      { value: 'item-2' },
    ],
  });

export const init = (): Model => ({
  tabs: Tabs.init({ id: 'faq-tabs' }),
  selectedTab: 'general',
  general: accordionInit('faq-general'),
  billing: accordionInit('faq-billing'),
  goals: accordionInit('faq-goals'),
});

const questionList = (
  model: Accordion.Model,
  questions: ReadonlyArray<Question>,
  toParentMessage: (message: Accordion.Message) => Message,
  h: HtmlBuilder<Message>,
): Html =>
  Accordion.accordion<Message>(
    {
      model,
      toParentMessage,
      items: questions.map((item, index) => ({
        value: `item-${index}`,
        trigger: item.q,
        content: item.a,
      })),
    },
    h,
  );

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  card<Message>(
    {
      children: [
        cardContent(
          {
            children: [
              Tabs.tabs<Message>(
                {
                  model: model.tabs,
                  selectedValue: model.selectedTab,
                  toParentMessage: (message) => GotTabsMessage({ message }),
                  listClass: 'w-full',
                  triggerClass: 'flex-1',
                  tabs: [
                    {
                      value: 'general',
                      label: 'General',
                      content: questionList(
                        model.general,
                        GENERAL_QUESTIONS,
                        (message) => GotGeneralMessage({ message }),
                        h,
                      ),
                    },
                    {
                      value: 'billing',
                      label: 'Billing',
                      content: questionList(
                        model.billing,
                        BILLING_QUESTIONS,
                        (message) => GotBillingMessage({ message }),
                        h,
                      ),
                    },
                    {
                      value: 'goals',
                      label: 'Goals',
                      content: questionList(
                        model.goals,
                        GOALS_QUESTIONS,
                        (message) => GotGoalsMessage({ message }),
                        h,
                      ),
                    },
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
                  variant: 'outline',
                  class: 'w-full',
                  children: ['Contact Support'],
                },
                h,
              ),
              button(
                { variant: 'link', class: 'w-full', children: ['Learn More'] },
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

// Card summary: stateful? yes. Submodels wired: Tabs and three Accordions. PORT NOTEs: none.
