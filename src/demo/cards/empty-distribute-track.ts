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
                children: [Icon.icon('plus')],
              }),
              emptyHeader({
                children: [
                  emptyTitle({ children: ['Distribute Track'] }),
                  emptyDescription({
                    children: [
                      'Upload your first master to start reaching listeners on Spotify, Apple Music, and more.',
                    ],
                  }),
                ],
              }),
              emptyContent({
                children: [button({ children: ['Create Release'] })],
              }),
            ],
          }),
        ],
      }),
    ],
  })

// Card summary: stateful? no. Submodels wired: none. PORT NOTEs: none.
