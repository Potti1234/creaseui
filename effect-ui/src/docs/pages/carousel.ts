import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import Autoplay from 'embla-carousel-autoplay'
import { Schema } from 'effect'

import { Card, Carousel } from '#components'
import { createCarouselBehavior } from '../../behaviors/carousel'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const AutoplayCarouselBehavior = createCarouselBehavior({
  name: 'DocsAutoplayCarousel',
  plugins: [Autoplay({ delay: 2000, stopOnInteraction: true })],
})

type Kind =
  | 'basic'
  | 'sizes'
  | 'spacing'
  | 'orientation'
  | 'options'
  | 'api'
  | 'plugins'
  | 'rtl'

const labels: Record<Kind, string> = {
  basic: 'Featured projects',
  sizes: 'Sized slides',
  spacing: 'Spaced slides',
  orientation: 'Vertical slides',
  options: 'Looping slides',
  api: 'API slides',
  plugins: 'Autoplay slides',
  rtl: 'RTL slides',
}

const Message = UiSchema.TaggedEnum({
  SelectedSlide: { index: Schema.Number, count: Schema.Number },
})
const CarouselDemo = Html.component({
  name: 'DocsCarouselDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ index: Schema.Number, count: Schema.Number }),
  message: Message,
}).make({
  init: () => ({ index: 0, count: 5 }),
  update: {
    SelectedSlide: ($, { index, count }) => $.evolve({ index, count }),
  },
  view: (h, model) => {
    const kind = h.props.kind as Kind
    const vertical = kind === 'orientation'
    const rtl = kind === 'rtl'
    const slide = (index: number) => {
      const card = Card(h, {
        ...(vertical ? { className: 'h-full' } : {}),
        children: parts => [
          parts.content({
            className: `flex ${vertical ? 'h-full' : 'aspect-square'} items-center justify-center p-6 text-4xl font-semibold`,
            children: [String(index + 1)] as never,
          }),
        ],
      })
      return {
        key: String(index),
        content: kind === 'spacing' ? h.div.class('p-2').children(card) : card,
      }
    }
    const carousel = Carousel(h, {
      id: `${h.props.idPrefix}-carousel`,
      label: labels[kind],
      items: Array.from({ length: 5 }, (_, index) => slide(index)),
      itemSize: kind === 'sizes' ? index => (index === 0 ? 50 : 33.34) : 100,
      ...(vertical ? { orientation: 'vertical' as const } : {}),
      ...(rtl ? { direction: 'rtl' as const } : {}),
      className: vertical ? 'h-[200px] w-full' : 'w-full',
      ...(kind === 'plugins' ? { behavior: AutoplayCarouselBehavior } : {}),
      props: {
        ...(kind === 'options' ? { loop: true } : {}),
      },
      onEmit: {
        Selected: ({ state }) =>
          Message.SelectedSlide({ index: state.index, count: state.count }),
      },
    })
    return h.div
      .class('mx-auto w-full max-w-xs')
      .attrs({ dir: rtl ? 'rtl' : undefined })
      .children(
        carousel,
        kind === 'api'
          ? h.p
              .class('py-2 text-center text-sm text-muted-foreground')
              .children(`Slide ${model.index + 1} of ${model.count}`)
          : undefined,
      )
  },
})

const view =
  (kind: Kind): DocsExampleImplementation['view'] =>
  (h, context) =>
    CarouselDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    }) as never

const source = exampleApplicationSource({
  imports: `import { Card, Carousel } from '@/ui/effect/ui'`,
  body: `Carousel(h, {
  id: 'featured-projects',
  label: 'Featured projects',
  items: slides.map(slide => ({ key: slide.id, content: slide.content })),
  itemSize: 100,
  props: {},
  onEmit: { Selected: ({ state }) => SelectedSlide({ state }) },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Carousel } from '@/ui/effect/ui'\n\nCarousel(h, { id, label, items, props, onEmit })`,
  examples: [
    { title: 'Demo', view: view('basic'), source },
    { title: 'Sizes', view: view('sizes'), source },
    { title: 'Spacing', view: view('spacing'), source },
    { title: 'Orientation', view: view('orientation'), source },
    { title: 'Options', view: view('options'), source },
    { title: 'API', view: view('api'), source },
    { title: 'Plugins', view: view('plugins'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
