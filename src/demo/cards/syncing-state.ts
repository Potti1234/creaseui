import { type Html } from 'foldkit/html'

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
import { spinner } from '@/ui/spinner'

export const view = <Msg>(): Html =>
  card({
    children: [
      cardContent({
        class: 'p-0',
        children: [
          empty({
            class: 'p-4',
            children: [
              emptyHeader({
                children: [
                  emptyMedia({
                    variant: 'icon',
                    children: [spinner()],
                  }),
                  emptyTitle({ children: ['Syncing your accounts'] }),
                  emptyDescription({
                    children: [
                      "We're pulling in your latest transactions. This usually takes a few seconds.",
                    ],
                  }),
                ],
              }),
              emptyContent({
                children: [
                  button({ variant: 'outline', children: ['Cancel'] }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })

// Card summary: stateful? no. Submodels wired: none. PORT NOTEs: none.
