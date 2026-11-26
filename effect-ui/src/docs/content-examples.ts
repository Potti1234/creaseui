import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  Button,
  CodeBlock,
  DropdownMenu,
  Lightbox,
  Markdown,
  OverflowList,
  Thumbnail,
} from '#components'
import type { DocsExample } from './types'

const counter = `import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

const Message = UiSchema.TaggedEnum({
  Increment: {},
  Reset: {},
})

export const Counter = Html.component({
  name: 'Counter',
  model: Schema.Number,
  message: Message,
}).make({
  init: () => 0,
  update: {
    Increment: $ => $.set($.model + 1),
    Reset: $ => $.set(0),
  },
  view: (h, count) => h.div.children(
    h.output.children(String(count)),
    h.button.on('click', Message.Increment()).children('Increment'),
    h.button.on('click', Message.Reset()).children('Reset'),
  ),
})`

const codeBlockExample: DocsExample = {
  description:
    'Shows a TypeScript counter with line numbers, highlighted updates, and a copy button.',
  view: h =>
    h.div.style({ display: 'grid', gap: '1rem', minWidth: '0' }).children(
      CodeBlock(h, {
        id: 'docs-example-counter',
        props: { code: counter },
        language: 'typescript',
        title: 'counter.ts',
        width: '100%',
        lineNumbers: true,
        highlightLines: [15, 16, 17, 18],
        maxHeight: 300,
        collapsible: true,
      }),
      CodeBlock(h, {
        id: 'docs-example-shell',
        props: { code: 'npx creaseui add code-block' },
        language: 'bash',
        width: '100%',
      }),
    ),
  source: `CodeBlock(h, {
  id: 'counter-demo',
  props: { code: counter },
  language: 'typescript',
  title: 'counter.ts',
  lineNumbers: true,
  highlightLines: [15, 16, 17, 18],
  maxHeight: 300,
  collapsible: true,
})`,
}

const markdown = [
  '## Formatting',
  '',
  '**Bold text** and *italic text* with ~~strikethrough~~ and `inline code`.',
  '',
  '- First item',
  '- Second item',
  '- Third item',
  '',
  '> A quoted passage with an accent border.',
  '',
  '[Documentation](/docs/components/button)',
  '',
  '## Task List',
  '',
  '- [x] Parse headings',
  '- [x] Parse lists',
  '- [ ] Parse math',
  '',
  '## Code Block',
  '',
  '```typescript',
  'export function greet(name: string) {',
  '  return `Hello, ${name}!`',
  '}',
  '```',
  '',
  '## Data Table',
  '',
  '| CreaseUI feature | Tailwind | StyleX | Pleat |',
  '| :-- | :-: | :-: | :-: |',
  '| Component examples | Yes | Yes | Yes |',
  '| Copyable source | Yes | Yes | Yes |',
].join('\n')
const citedText =
  'Tokyo is the capital of Japan [src-1]. It blends the ultramodern and the traditional [src-2].'
const citationSources = {
  'src-1': {
    title: 'Tokyo — Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Tokyo',
  },
  'src-2': {
    title: 'Japan Travel — Tokyo',
    url: 'https://www.japan.travel/en/destinations/kanto/tokyo/',
  },
}

const markdownExample: DocsExample = {
  description:
    'Renders formatted Markdown, task lists, fenced code, tables, and linked citations.',
  view: h =>
    h.div.style({ display: 'grid', gap: '1rem', minWidth: '0' }).children(
      Markdown(h, {
        id: 'docs-example-markdown',
        source: markdown,
        headingLevelStart: 3,
      }),
      Markdown(h, {
        id: 'docs-example-citations',
        source: citedText,
        density: 'compact',
        sources: citationSources,
        citationStyle: 'number',
      }),
    ),
  source: `Markdown(h, {
  id: 'release-notes',
  source: releaseNotes,
  headingLevelStart: 3,
  sources: citationSources,
  citationStyle: 'number',
})`,
}

const actions = ['Edit', 'Duplicate', 'Share', 'Archive', 'Delete']
const ToolbarMessage = UiSchema.TaggedEnum({
  Resized: { width: Schema.Number },
  MenuChanged: { open: Schema.Boolean },
  Picked: { label: Schema.String },
})
const OverflowToolbar = Html.component({
  name: 'EffectDocsOverflowToolbar',
  model: Schema.Struct({
    width: Schema.Number,
    open: Schema.Boolean,
    picked: Schema.String,
  }),
  message: ToolbarMessage,
}).make({
  init: () => ({ width: 280, open: false, picked: '' }),
  update: {
    Resized: ($, { width }) => $.evolve({ width, open: false }),
    MenuChanged: ($, { open }) => $.evolve({ open }),
    Picked: ($, { label }) => $.evolve({ picked: label, open: false }),
  },
  view: (h, model) =>
    h.div.style({ display: 'grid', gap: '0.75rem', minWidth: '0' }).children(
      h.label
        .style({ display: 'flex', alignItems: 'center', gap: '0.75rem' })
        .children(
          'Toolbar width',
          h.input
            .attrs({
              type: 'range',
              min: '160',
              max: '440',
              value: String(model.width),
            })
            .on('input', ({ value }) =>
              ToolbarMessage.Resized({ width: Number(value) }),
            ),
        ),
      h.div
        .style({
          width: `${model.width}px`,
          maxWidth: '100%',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius)',
          padding: '0.5rem',
        })
        .children(
          OverflowList(h, {
            props: { gap: 2 },
            items: actions.map(label => ({
              key: label,
              content: Button(h, {
                variant: 'outline',
                size: 'sm',
                onPress: ToolbarMessage.Picked({ label }),
              }).children(label),
            })),
            overflowRenderer: hidden =>
              DropdownMenu(h, {
                label: 'More toolbar actions',
                trigger: Button(h, { variant: 'ghost', size: 'sm' }).children(
                  `+${hidden.length} more`,
                ),
                props: {
                  open: model.open,
                  items: hidden.flatMap(({ index }) => {
                    const label = actions[index]
                    return label === undefined ? [] : [{ value: label, label }]
                  }),
                },
                onEmit: event => {
                  if (event._tag === 'RequestedOpen')
                    return ToolbarMessage.MenuChanged({ open: true })
                  if (event._tag === 'RequestedClose')
                    return ToolbarMessage.MenuChanged({ open: false })
                  if (event._tag === 'Picked')
                    return ToolbarMessage.Picked({ label: event.value })
                },
              }),
          }),
        ),
      h.output
        .attr('aria-live', 'polite')
        .children(model.picked === '' ? '' : `Selected ${model.picked}`),
    ),
})

const overflowListExample: DocsExample = {
  description: 'Resize the toolbar to move actions into the overflow menu.',
  view: h => OverflowToolbar(h, { props: {} }),
  source: `OverflowList(h, {
  props: { gap: 2 },
  items: actions.map(label => ({
    key: label,
    content: Button(h, { variant: 'outline', size: 'sm' }).children(label),
  })),
  overflowRenderer: hidden => Badge(h, { variant: 'secondary' }).children('+' + hidden.length),
})`,
}

const galleryMedia = [
  {
    src: new URL('../../../public/lightbox/starry-night.jpg', import.meta.url)
      .href,
    alt: 'The Starry Night by Vincent van Gogh',
    caption: 'Vincent van Gogh, The Starry Night (1889). Public domain.',
  },
  {
    src: new URL('../../../public/lightbox/blue-marble.jpg', import.meta.url)
      .href,
    alt: 'Earth photographed from Apollo 17',
    caption: 'NASA Apollo 17, The Blue Marble (1972). Public domain.',
  },
  {
    src: new URL('../../../public/lightbox/mars.jpg', import.meta.url).href,
    alt: 'Mars and Valles Marineris imaged by Viking',
    caption:
      'NASA Viking orbiter mosaic of Mars and Valles Marineris. Public domain.',
  },
  {
    src: new URL(
      '../../../public/lightbox/hubble-deep-field.jpg',
      import.meta.url,
    ).href,
    alt: 'Hubble Ultra Deep Field showing thousands of galaxies',
    caption:
      'NASA Hubble Ultra Deep Field. Double-click to zoom in and drag to pan.',
  },
]

const GalleryMessage = UiSchema.TaggedEnum({
  Selected: { index: Schema.NullOr(Schema.Number) },
})
const Gallery = Html.component({
  name: 'EffectDocsLightboxGallery',
  model: Schema.NullOr(Schema.Number),
  message: GalleryMessage,
}).make({
  init: () => null,
  update: { Selected: ($, { index }) => $.set(index) },
  view: (h, index) =>
    h.div.style({ display: 'grid', gap: '0.75rem' }).children(
      h.div
        .style({ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' })
        .children(
          galleryMedia.map((media, index) =>
            Thumbnail(h, {
              src: media.src,
              alt: media.alt,
              onClick: GalleryMessage.Selected({ index }),
            }).key(media.alt),
          ),
        ),
      Lightbox(h, {
        key: 'gallery',
        props: { open: index !== null, index: index ?? 0 },
        media: galleryMedia,
        hasZoom: true,
        onEmit: event => {
          if (event._tag === 'Closed')
            return GalleryMessage.Selected({ index: null })
          if (event._tag === 'Selected')
            return GalleryMessage.Selected({ index: event.index })
        },
      }),
      Lightbox(h, {
        key: 'video',
        trigger: Button(h, { variant: 'outline' }).children('Play video'),
        media: {
          src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          alt: 'Flower blooming in time-lapse',
          type: 'video',
        },
      }),
    ),
})

const lightboxExample: DocsExample = {
  description:
    'Open a thumbnail and browse the gallery with the arrow keys. Double-click an image to zoom, then drag to pan.',
  view: h => Gallery(h, { props: {} }),
  source: `Lightbox(h, {
  trigger: Button(h, { variant: 'outline' }).children('Open gallery'),
  media: galleryMedia,
  hasZoom: true,
})`,
}

const ThumbnailMessage = UiSchema.TaggedEnum({
  Removed: { position: Schema.Number },
})
const AttachmentThumbnails = Html.component({
  name: 'EffectDocsAttachmentThumbnails',
  model: Schema.Array(Schema.Number),
  message: ThumbnailMessage,
}).make({
  init: () => [0, 1, 2, 3],
  update: {
    Removed: ($, { position }) =>
      $.set($.model.filter(index => index !== position)),
  },
  view: (h, positions) =>
    h.div.style({ display: 'grid', gap: '1rem' }).children(
      h.div
        .style({ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' })
        .children(
          positions.map(position => {
            const media = galleryMedia[position]
            return media === undefined
              ? undefined
              : Thumbnail(h, {
                  src: media.src,
                  alt: media.alt,
                  onRemove: ThumbnailMessage.Removed({ position }),
                  showRemoveOn: 'always',
                }).key(media.alt)
          }),
          positions.length === 0 ? h.p.children('No attachments') : undefined,
        ),
      h.div
        .style({ display: 'flex', gap: '0.5rem' })
        .children(
          Thumbnail(h, { label: 'report.pdf' }),
          Thumbnail(h, { label: 'uploading.jpg', loading: true }),
        ),
    ),
})

const thumbnailExample: DocsExample = {
  description:
    'Remove image attachments and see the placeholder and loading states.',
  view: h => AttachmentThumbnails(h, { props: {} }),
  source: `Thumbnail(h, {
  src: attachment.src,
  alt: attachment.alt,
  onRemove: Message.Removed({ id: attachment.id }),
  showRemoveOn: 'always',
})`,
}

export const contentExamples: Readonly<Record<string, DocsExample>> = {
  'code-block': codeBlockExample,
  markdown: markdownExample,
  'overflow-list': overflowListExample,
  lightbox: lightboxExample,
  thumbnail: thumbnailExample,
}
