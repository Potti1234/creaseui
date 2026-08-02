import { Match as M, Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import { areaChart } from '@/ui/chart'
import {
  card,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitle,
} from '@/ui/card'
import { field, fieldGroup, fieldLabel } from '@/ui/field'
import * as Select from '@/ui/select'
import { separator } from '@/ui/separator'

type Ticker =
  | 'VOO'
  | 'VIG'
  | 'AAPL'
  | 'MSFT'
  | 'GOOGL'
  | 'AMZN'
  | 'TSLA'

const tickers: ReadonlyArray<Ticker> = [
  'VOO',
  'VIG',
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'TSLA',
]

const chartData: Readonly<
  Record<string, ReadonlyArray<Readonly<{ month: string; price: number }>>>
> = {
  VOO: [
    { month: 'Jan', price: 412 },
    { month: 'Feb', price: 438 },
    { month: 'Mar', price: 395 },
    { month: 'Apr', price: 450 },
    { month: 'May', price: 420 },
    { month: 'Jun', price: 462 },
  ],
  AAPL: [
    { month: 'Jan', price: 185 },
    { month: 'Feb', price: 210 },
    { month: 'Mar', price: 172 },
    { month: 'Apr', price: 198 },
    { month: 'May', price: 178 },
    { month: 'Jun', price: 215 },
  ],
}

const defaultData = [
  { month: 'Jan', price: 100 },
  { month: 'Feb', price: 118 },
  { month: 'Mar', price: 95 },
  { month: 'Apr', price: 125 },
  { month: 'May', price: 108 },
  { month: 'Jun', price: 130 },
]
const TickerSelect = Select.create<Ticker>()

export const Model = S.Struct({
  ticker: S.String,
  tickerSelect: Select.Model,
})
export type Model = typeof Model.Type

export const GotTickerSelectMessage = m(
  'GotTickerSelectMessage',
  { message: Select.Message },
)

export const Message = S.Union([GotTickerSelectMessage])
export type Message = typeof Message.Type

type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
]

export const init = (): Model => ({
  ticker: 'VOO',
  tickerSelect: Select.init({
    id: 'stock-performance-ticker',
    isAnimated: true,
  }),
})

export const update = (
  model: Model,
  message: Message,
): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotTickerSelectMessage: ({ message: selectMessage }) => {
        const [tickerSelect, commands, maybeOutMessage] =
          TickerSelect.update(model.tickerSelect, selectMessage)
        const ticker = Option.match(maybeOutMessage, {
          onNone: () => model.ticker,
          onSome: outMessage => outMessage._tag === 'Selected' ? outMessage.value : model.ticker,
        })

        return [
          evo(model, {
            ticker: () => ticker,
            tickerSelect: () => tickerSelect,
          }),
          Command.mapMessages(commands, childMessage =>
            GotTickerSelectMessage({ message: childMessage }),
          ),
        ]
      },
    }),
  )

export const view = (model: Model): Html => {
  const h = html<Message>()
  const data = chartData[model.ticker] ?? defaultData

  return card({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Stock Performance'] }),
          cardDescription({ children: ['6-month price history.'] }),
        ],
      }),
      cardContent({
        class: 'flex flex-col gap-4',
        children: [
          fieldGroup({
            children: [
              field({
                children: [
                  fieldLabel({
                    for: 'stock-performance-ticker',
                    children: ['Ticker'],
                  }),
                  Select.select<Ticker, Ticker, Message>({
                    model: model.tickerSelect,
                    maybeSelectedValue: Option.some(model.ticker as Ticker),
                    toParentMessage: childMessage =>
                      GotTickerSelectMessage({
                        message: childMessage,
                      }),
                    items: tickers,
                    itemToValue: ticker => ticker,
                    itemToLabel: ticker => ticker,
                    triggerClass: 'w-full',
                    ariaLabel: 'Ticker',
                  }),
                ],
              }),
            ],
          }),
          separator(),
          areaChart({
            data: data.map(({ price }) => price),
            class: 'h-[200px] w-full',
          }),
        ],
      }),
    ],
  })
}

/*
  Parent wiring: nest Model from init(), wrap Message in the parent message,
  delegate to update(), map returned commands, and call view(nestedModel).
*/
// Stateful: yes. Submodels: ticker Select. PORT NOTE: Recharts uses @/ui/chart areaChart.
