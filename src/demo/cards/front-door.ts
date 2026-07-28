import { type Html, html } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { badge } from '@/ui/badge'
import {
  card,
  cardAction,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitle,
} from '@/ui/card'

export const view = <Msg>(): Html => {
  const h = html<Msg>()

  return card({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Front Door'] }),
          cardDescription({ children: ['Smart Lock Pro'] }),
          cardAction({
            children: [
              h.div(
                [
                  h.Class(
                    'flex items-center gap-1.5 text-sm text-muted-foreground',
                  ),
                ],
                [
                  'Locked',
                  Icon.icon<Msg>('lock', { class: 'size-4' }),
                ],
              ),
            ],
          }),
        ],
      }),
      cardContent({
        children: [
          h.div(
            [
              h.Class(
                'relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--border)_10px,var(--border)_11px)]',
              ),
            ],
            [
              badge({
                variant: 'destructive',
                class: 'absolute top-2 right-2',
                children: ['Live'],
              }),
            ],
          ),
        ],
      }),
    ],
  })
}

// Stateful? no. Submodels wired: none. PORT NOTEs: none.
