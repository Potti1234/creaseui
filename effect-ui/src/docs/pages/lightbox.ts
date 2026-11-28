import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Lightbox } from '#components'
import type { LightboxMedia } from '../../ui/lightbox'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const starryNightMedia: LightboxMedia = {
  src: '/lightbox/starry-night.jpg',
  alt: 'The Starry Night by Vincent van Gogh',
  caption: 'Vincent van Gogh, The Starry Night (1889). Public domain.',
}
const zoomMedia: LightboxMedia = {
  src: '/lightbox/hubble-deep-field.jpg',
  alt: 'Hubble Ultra Deep Field showing thousands of galaxies',
  caption:
    'NASA Hubble Ultra Deep Field. Double-click to zoom in and drag to pan.',
}
const videoMedia: LightboxMedia = {
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  alt: 'Flower blooming in time-lapse',
  type: 'video',
  caption: 'A flower blooming in time-lapse',
}
const galleryMedia: readonly LightboxMedia[] = [
  starryNightMedia,
  {
    src: '/lightbox/blue-marble.jpg',
    alt: 'Earth photographed from Apollo 17',
    caption: 'NASA Apollo 17, The Blue Marble (1972). Public domain.',
  },
  {
    src: '/lightbox/mars.jpg',
    alt: 'Mars and Valles Marineris imaged by Viking',
    caption:
      'NASA Viking orbiter mosaic of Mars and Valles Marineris. Public domain.',
  },
  zoomMedia,
]

const Message = UiSchema.TaggedEnum({
  PickedMedia: { index: Schema.NullOr(Schema.Number) },
})
const GalleryDemo = Html.component({
  name: 'DocsLightboxGalleryDemo',
  props: Schema.Struct({ keyPrefix: Schema.String }),
  model: Schema.Struct({ index: Schema.NullOr(Schema.Number) }),
  message: Message,
}).make({
  init: () => ({ index: null }),
  update: {
    PickedMedia: ($, { index }) => $.evolve({ index }),
  },
  view: (h, model) =>
    h.div.children(
      h.div.class('grid w-[136px] grid-cols-2 gap-2').children(
        galleryMedia.map((media, index) =>
          h.button
            .key(media.alt)
            .class('overflow-hidden rounded-md')
            .attrs({ type: 'button', 'aria-label': media.alt })
            .on('click', Message.PickedMedia({ index }))
            .children(
              h.img
                .class('aspect-square w-full object-cover')
                .attrs({ src: media.src, alt: media.alt }),
            ),
        ),
      ),
      Lightbox(h, {
        key: `${h.props.keyPrefix}-gallery`,
        props: { open: model.index !== null, index: model.index ?? 0 },
        media: galleryMedia,
        onEmit: event => {
          if (event._tag === 'Closed')
            return Message.PickedMedia({ index: null })
          if (event._tag === 'Selected')
            return Message.PickedMedia({ index: event.index })
        },
      }),
    ),
})

const triggerLightbox = (
  h: Parameters<DocsExampleImplementation['view']>[0],
  key: string,
  label: string,
  media: LightboxMedia,
  options: { zoom?: boolean; autoPlay?: boolean } = {},
) =>
  Lightbox(h, {
    key,
    trigger: Button(h, { variant: 'outline' }).children(label),
    media,
    ...(options.zoom === true ? { hasZoom: true } : {}),
    ...(options.autoPlay === true ? { hasAutoPlay: true } : {}),
  })

const view =
  (
    kind: 'showcase' | 'gallery' | 'video' | 'zoom',
  ): DocsExampleImplementation['view'] =>
  (h, context) => {
    const key = `${context.idPrefix}-${kind}`
    if (kind === 'gallery')
      return GalleryDemo(h, {
        key,
        props: { keyPrefix: key },
      }) as never
    return triggerLightbox(
      h,
      key,
      kind === 'video'
        ? 'Play video'
        : kind === 'zoom'
          ? 'Open zoomable image'
          : 'View image',
      kind === 'video'
        ? videoMedia
        : kind === 'zoom'
          ? zoomMedia
          : starryNightMedia,
      { zoom: kind === 'zoom', autoPlay: kind === 'video' },
    ) as never
  }

const source = exampleApplicationSource({
  imports: `import { Button, Lightbox } from '@/ui/effect/ui'`,
  body: `Lightbox(h, {
  key: 'media-viewer',
  trigger: Button(h, { variant: 'outline' }).children('View image'),
  media: {
    src: '/lightbox/starry-night.jpg',
    alt: 'The Starry Night by Vincent van Gogh',
    caption: 'Vincent van Gogh, The Starry Night (1889). Public domain.',
  },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Lightbox } from '@/ui/effect/ui'\n\nLightbox(h, { key, trigger, media })`,
  examples: [
    { title: 'Lightbox', view: view('showcase'), source },
    { title: 'Lightbox — Gallery', view: view('gallery'), source },
    { title: 'Lightbox — Video', view: view('video'), source },
    { title: 'Lightbox — Zoom', view: view('zoom'), source },
  ],
})
