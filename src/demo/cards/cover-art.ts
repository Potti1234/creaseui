import { type Html, html } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { buttonVariants } from '@/ui/button'
import {
  card,
  cardContent,
  cardDescription,
  cardFooter,
} from '@/ui/card'
import { item } from '@/ui/item'
import { label } from '@/ui/label'

export const view = <Msg>(): Html => {
  const h = html<Msg>()

  return card({
    children: [
      cardContent({
        class: 'flex flex-col gap-3',
        children: [
          label({
            for: 'cover-art',
            class:
              'text-center text-xs font-normal tracking-wider text-muted-foreground uppercase',
            children: ['Cover Art'],
          }),
          item({
            class: 'aspect-square',
            variant: 'outline',
            children: [
              h.label(
                [
                  h.For('cover-art'),
                  h.Class(
                    'flex size-full cursor-pointer items-center justify-center',
                  ),
                ],
                [
                  Icon.icon<Msg>('image', {
                    class: 'size-10 text-muted-foreground/50',
                  }),
                ],
              ),
            ],
          }),
          h.input([
            h.Id('cover-art'),
            h.Type('file'),
            h.Accept('image/jpeg,image/png'),
            h.Class('sr-only'),
          ]),
        ],
      }),
      cardFooter({
        class: 'flex-col gap-2',
        children: [
          // PORT NOTE: foldkit's Button wrapper has no asChild support, so
          // the file-picker trigger uses its exported variant classes.
          h.label(
            [
              h.For('cover-art'),
              h.Class(
                buttonVariants({
                  variant: 'secondary',
                  class: 'w-full cursor-pointer',
                }),
              ),
            ],
            ['Upload Artwork'],
          ),
          cardDescription({
            class: 'text-center text-xs',
            children: [
              'Minimum 3000 × 3000px',
              h.br([]),
              'JPEG or PNG only',
            ],
          }),
        ],
      }),
    ],
  })
}

// Stateful? no. Submodels wired: none. PORT NOTEs: Button-as-child label substitute.
