import { type Html, html } from 'foldkit/html'

import { card, cardContent, cardHeader } from '@/ui/card'
import { skeleton } from '@/ui/skeleton'

export const view = <Msg>(): Html => {
  const h = html<Msg>()

  return card({
    children: [
      cardHeader({
        children: [
          skeleton({ class: 'h-5 w-32' }),
          skeleton({ class: 'h-4 w-48' }),
        ],
      }),
      cardContent({
        class: 'flex flex-col gap-4',
        children: [
          skeleton({ class: 'h-32 w-full rounded-lg' }),
          h.div(
            [h.Class('flex flex-col gap-2')],
            [
              skeleton({ class: 'h-4 w-full' }),
              skeleton({ class: 'h-4 w-3/4' }),
              skeleton({ class: 'h-4 w-1/2' }),
            ],
          ),
          h.div(
            [h.Class('flex gap-2')],
            [
              skeleton({ class: 'h-9 flex-1 rounded-md' }),
              skeleton({ class: 'h-9 flex-1 rounded-md' }),
            ],
          ),
        ],
      }),
    ],
  })
}

// Card summary: stateful? no. Submodels wired: none. PORT NOTEs: none.
