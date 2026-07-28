import { type Html } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { button } from '@/ui/button'
import { card, cardContent } from '@/ui/card'
import {
  empty,
  emptyContent,
  emptyDescription,
  emptyHeader,
  emptyMedia,
  emptyTitle,
} from '@/ui/empty'

export const view = <Msg>(): Html =>
  card({
    children: [
      cardContent({
        children: [
          empty({
            class: 'p-4',
            children: [
              emptyMedia({
                variant: 'icon',
                children: [Icon.icon('credit-card')],
              }),
              emptyHeader({
                children: [
                  emptyTitle({ children: ['Connect Bank'] }),
                  emptyDescription({
                    children: [
                      'Link your payout method to receive monthly royalty distributions automatically.',
                    ],
                  }),
                ],
              }),
              emptyContent({
                children: [button({ children: ['Set Up Payouts'] })],
              }),
            ],
          }),
        ],
      }),
    ],
  })

// Card summary: stateful? no. Submodels wired: none. PORT NOTEs: none.
