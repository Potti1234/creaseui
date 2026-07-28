import { type Html, html } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { button } from '@/ui/button'
import {
  card,
  cardAction,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitle,
} from '@/ui/card'
import { barChart } from '@/ui/chart'
import {
  item,
  itemContent,
  itemDescription,
  itemGroup,
  itemTitle,
} from '@/ui/item'

const holdings = [
  {
    name: 'Vanguard VIG',
    shares: '450 Shares',
    amount: '$1,842.10',
    data: [
      { label: 'Q1', value: 380 },
      { label: 'Q2', value: 420 },
      { label: 'Q3', value: 390 },
      { label: 'Q4', value: 652 },
    ],
  },
  {
    name: 'S&P 500 VOO',
    shares: '112 Shares',
    amount: '$928.40',
    data: [
      { label: 'Q1', value: 180 },
      { label: 'Q2', value: 210 },
      { label: 'Q3', value: 320 },
      { label: 'Q4', value: 218 },
    ],
  },
  {
    name: 'Apple AAPL',
    shares: '85 Shares',
    amount: '$340.00',
    data: [
      { label: 'Q1', value: 60 },
      { label: 'Q2', value: 70 },
      { label: 'Q3', value: 120 },
      { label: 'Q4', value: 90 },
    ],
  },
  {
    name: 'Realty Income',
    shares: '320 Shares',
    amount: '$1,139.50',
    data: [
      { label: 'Q1', value: 240 },
      { label: 'Q2', value: 260 },
      { label: 'Q3', value: 280 },
      { label: 'Q4', value: 360 },
    ],
  },
]

export const view = <Msg>(): Html => {
  const h = html<Msg>()

  return card({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Q2 Dividend Income'] }),
          cardDescription({
            children: [
              'Quarterly dividend payouts across your portfolio holdings.',
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
          itemGroup({
            class: 'gap-3',
            children: holdings.map(holding =>
              item({
                variant: 'muted',
                children: [
                  itemContent({
                    children: [
                      itemTitle({ children: [holding.name] }),
                      itemDescription({ children: [holding.shares] }),
                    ],
                  }),
                  barChart({
                    data: holding.data,
                    showXAxisLabels: false,
                    class: 'hidden h-8 w-24 md:block',
                  }),
                  h.span(
                    [
                      h.Class(
                        'hidden text-sm font-semibold tabular-nums md:block',
                      ),
                    ],
                    [holding.amount],
                  ),
                ],
              }),
            ),
          }),
        ],
      }),
    ],
  })
}

// Stateful: no. Submodels: none. PORT NOTE: Recharts mini charts use @/ui/chart barChart; icon-sm is matched with a size-8 class.
