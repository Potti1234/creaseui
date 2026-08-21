import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as Card from '@/ui/card';
import * as Carousel from '@/ui/carousel';

const source = (name: string, count: number, itemSize: number): string => foldkitApplication({
  title: `Carousel — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Card from '@/ui/card'
import * as Carousel from '@/ui/carousel'`,
  model: `export const Model = S.Struct({ carousel: Carousel.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotCarouselMessage = m('GotCarouselMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Carousel.Message })
export const Message = S.Union([GotCarouselMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { carousel: Carousel.init('project-carousel', ${String(count)}) },
  [],
]`,
  update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotCarouselMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [
        { ...model, carousel: Carousel.update(model.carousel, message.message) },
        [],
      ]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Carousel — ${name}',
  body: h.main([h.Class('mx-auto max-w-md p-16')], [
    Carousel.carousel({
      model: model.carousel,
      toParentMessage: message => GotCarouselMessage({ message }),
      ariaLabel: 'Featured projects',
      itemSize: ${String(itemSize)},
      class: 'w-full',
      items: Array.from({ length: ${String(count)} }, (_, index) =>
        Card.card({ children: [
          Card.cardContent({
            class: 'flex aspect-square items-center justify-center p-6 text-4xl font-semibold',
            children: [String(index + 1)],
          }, h),
        ] }, h),
      ),
    }, h),
    h.p([h.Class('mt-4 text-center text-sm text-muted-foreground')], [
      \`Slide \${model.carousel.index + 1} of \${model.carousel.count}\`,
    ]),
  ]),
})`,
});

const cards = <Msg>(count: number, h: HtmlBuilder<Msg>) => Array.from({ length: count }, (_, index) => Card.card({ children: [Card.cardContent({ class: 'flex aspect-square items-center justify-center p-6 text-4xl font-semibold', children: [String(index + 1)] }, h)] }, h));

export const carouselPage = authoredPage({
  slug: 'carousel', title: 'Carousel', kind: 'submodel',
  definition: {
    kind: 'submodel', description: 'Presents an ordered set of slides with swipe, button, and keyboard navigation powered by Embla.',
    architecture: 'Carousel stores the selected snap index in a child Model. Embla runs as an OnMount stream and emits WentTo Messages; delegate those through Carousel.update so browser motion and application state stay synchronized.',
    apiHref: 'https://foldkit.dev/core/on-mount',
    composition: 'Carousel region\n├── CarouselContent (Embla OnMount stream)\n│   └── CarouselItem[]\n├── previous button\n└── next button',
    styling: 'Reserve enough surrounding space for the controls and choose itemSize deliberately. Avoid autoplay unless users can pause it and the content truly benefits.',
    accessibility: 'The region and slides expose carousel/slide descriptions, slide positions, and named direction controls. Keyboard navigation can be disabled only when another complete input path exists.',
    keyboard: [['Arrow keys', 'Moves to the previous or next snap on the active axis.'], ['Home / End', 'Moves to the first or last snap.']],
    examples: [
      {
        title: 'Single slide', description: 'Embla selection events update the child index displayed beneath the carousel.',
        preview: (model, h) => h.div([h.Class('w-full max-w-xs')], [Carousel.carousel({ model: model.carousel, toParentMessage: (message) => State.GotCarouselMessage({ message }), ariaLabel: 'Featured projects', items: cards(3, h) }, h), h.p([h.Class('mt-4 text-center text-sm text-muted-foreground')], [`Slide ${model.carousel.index + 1} of ${model.carousel.count}`])]),
        code: source('Single slide', 3, 100),
      },
      {
        title: 'Two at a time', description: 'A second carousel has its own identity and Model; itemSize changes layout without sharing selection state.',
        preview: (model, h) => h.div([h.Class('w-full max-w-sm')], [Carousel.carousel({ model: model.carouselCompact, toParentMessage: (message) => State.GotCarouselCompactMessage({ message }), ariaLabel: 'Compact projects', itemSize: 50, items: cards(4, h) }, h), h.p([h.Class('mt-4 text-center text-sm text-muted-foreground')], [`Snap ${model.carouselCompact.index + 1}`])]),
        code: source('Two at a time', 4, 50),
      },
    ],
  },
});
