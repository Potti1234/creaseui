import { Card, Skeleton } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './skeleton.css'

const demo =
  (rtl = false): DocsExampleImplementation['view'] =>
  h =>
    h.div
      .class(`skeleton-docs-row${rtl ? ' skeleton-docs-rtl' : ''}`)
      .children(
        Skeleton(h, { shape: 'circle', className: 'sk-circle-12' }),
        h.div
          .class('skeleton-docs-column skeleton-docs-gap2')
          .children(
            Skeleton(h, { className: 'sk-w62' }),
            Skeleton(h, { className: 'sk-w50' }),
          ),
      )

const avatar: DocsExampleImplementation['view'] = h =>
  h.div
    .class('skeleton-docs-row skeleton-docs-fit')
    .children(
      Skeleton(h, { shape: 'circle', className: 'sk-circle-10' }),
      h.div
        .class('skeleton-docs-grid')
        .children(
          Skeleton(h, { className: 'sk-w37' }),
          Skeleton(h, { className: 'sk-w25' }),
        ),
    )

const card: DocsExampleImplementation['view'] = h =>
  Card(h, {
    className: 'skeleton-docs-xs',
    children: parts => [
      parts.header({
        children: [
          Skeleton(h, { className: 'sk-w2thirds' }),
          Skeleton(h, { className: 'sk-whalf' }),
        ],
      }),
      parts.content({
        children: [Skeleton(h, { className: 'sk-video' })],
      }),
    ],
  })

const text: DocsExampleImplementation['view'] = h =>
  h.div
    .class('skeleton-docs-column skeleton-docs-gap2 skeleton-docs-xs')
    .children(
      Skeleton(h, { className: 'sk-line' }),
      Skeleton(h, { className: 'sk-line' }),
      Skeleton(h, { className: 'sk-w3quarter' }),
    )

const form: DocsExampleImplementation['view'] = h =>
  h.div
    .class('skeleton-docs-column skeleton-docs-gap7 skeleton-docs-xs')
    .children(
      h.div
        .class('skeleton-docs-column skeleton-docs-gap3')
        .children(
          Skeleton(h, { className: 'sk-w20' }),
          Skeleton(h, { className: 'sk-input' }),
        ),
      h.div
        .class('skeleton-docs-column skeleton-docs-gap3')
        .children(
          Skeleton(h, { className: 'sk-w24' }),
          Skeleton(h, { className: 'sk-input' }),
        ),
      Skeleton(h, { className: 'sk-w24' }),
    )

const table: DocsExampleImplementation['view'] = h =>
  h.div
    .class('skeleton-docs-column skeleton-docs-gap2 skeleton-docs-sm')
    .children(
      [0, 1, 2, 3, 4].map(() =>
        h.div
          .class('skeleton-docs-flex')
          .children(
            Skeleton(h, { className: 'sk-table-a' }),
            Skeleton(h, { className: 'sk-table-b' }),
            Skeleton(h, { className: 'sk-table-c' }),
          ),
      ),
    )

const skeletonSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Card, Skeleton } from '@/ui/effect/ui'
import './skeleton.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Skeleton } from '@/ui/effect/ui'

Skeleton(h, { shape: 'circle', className: 'sk-circle-12' })`,
  examples: [
    {
      title: 'Basic',
      view: demo(),
      source: skeletonSource(`h.div.class('skeleton-docs-row').children(
  Skeleton(h, { shape: 'circle', className: 'sk-circle-12' }),
  h.div.children(Skeleton(h, { className: 'sk-w62' })),
)`),
    },
    {
      title: 'Avatar',
      view: avatar,
      source:
        skeletonSource(`h.div.class('skeleton-docs-row skeleton-docs-fit').children(
  Skeleton(h, { shape: 'circle', className: 'sk-circle-10' }),
)`),
    },
    {
      title: 'Card',
      view: card,
      source: skeletonSource(`Card(h, {
  className: 'skeleton-docs-xs',
  children: parts => [parts.content({ children: [Skeleton(h, { className: 'sk-video' })] })],
})`),
    },
    {
      title: 'Text',
      view: text,
      source:
        skeletonSource(`h.div.class('skeleton-docs-column skeleton-docs-gap2').children(
  Skeleton(h, { className: 'sk-line' }),
)`),
    },
    {
      title: 'Form',
      view: form,
      source:
        skeletonSource(`h.div.class('skeleton-docs-column skeleton-docs-gap7').children(
  Skeleton(h, { className: 'sk-input' }),
)`),
    },
    {
      title: 'Table',
      view: table,
      source:
        skeletonSource(`h.div.class('skeleton-docs-column skeleton-docs-gap2').children(
  rows.map(() => Skeleton(h, { className: 'sk-table-a' })),
)`),
    },
    {
      title: 'RTL',
      view: demo(true),
      source:
        skeletonSource(`h.div.class('skeleton-docs-row skeleton-docs-rtl').children(
  Skeleton(h, { shape: 'circle', className: 'sk-circle-12' }),
)`),
    },
  ],
})
