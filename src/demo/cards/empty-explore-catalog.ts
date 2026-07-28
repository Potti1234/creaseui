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
                children: [Icon.icon('audio-lines')],
              }),
              emptyHeader({
                children: [
                  emptyTitle({ children: ['Explore Catalog'] }),
                  emptyDescription({
                    children: [
                      'Check your ISRC codes, metadata, and visual assets before going live.',
                    ],
                  }),
                ],
              }),
              emptyContent({
                children: [button({ children: ['View Catalog'] })],
              }),
            ],
          }),
        ],
      }),
    ],
  })

// Card summary: stateful? no. Submodels wired: none. PORT NOTEs: none.
