import { Blockquote, Card } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './blockquote.css'

const QUOTE_1 =
  'Design systems are not just about components — they are about creating a shared language between designers and engineers.'
const QUOTE_2 = 'The best way to predict the future is to invent it.'
const QUOTE_3 = 'Simplicity is the ultimate sophistication.'

const testimonials = [
  ['Sarah K.', QUOTE_1],
  ['Marcus T.', QUOTE_2],
  ['Priya L.', QUOTE_3],
] as const

const quotePair = (h: Parameters<DocsExampleImplementation['view']>[0]) => [
  Blockquote(h, { children: [QUOTE_1] }),
  Blockquote(h, { cite: 'Steve Jobs', children: [QUOTE_2] }),
]

const renderPair: DocsExampleImplementation['view'] = h =>
  h.div.class('blockquote-docs-column').children(quotePair(h))

const renderTestimonials: DocsExampleImplementation['view'] = h =>
  h.div.class('blockquote-docs-grid').children(
    testimonials.map(([cite, quote], index) =>
      Card(h, {
        ...(index === 2 ? { className: 'blockquote-docs-spanning-card' } : {}),
        children: card => [
          card.content({
            children: [Blockquote(h, { cite, children: [quote] })],
          }),
        ],
      }),
    ),
  )

const pairBody = `h.div.class('blockquote-docs-column').children(
  Blockquote(h, { children: [quoteOne] }),
  Blockquote(h, { cite: 'Steve Jobs', children: [quoteTwo] }),
)`
const testimonialsBody = `h.div.class('blockquote-docs-grid').children(
  testimonials.map(([cite, quote], index) =>
    Card(h, {
      className: index === 2 ? 'blockquote-docs-spanning-card' : undefined,
      children: card => [
        card.content({ children: [Blockquote(h, { cite, children: [quote] })] }),
      ],
    }),
  ),
)`

export const componentDocs = defineComponentDocs({
  usage: `import { Blockquote } from '@/ui/effect/ui'

Blockquote(h, { cite: 'Author', children: ['Quoted text'] })`,
  examples: [
    {
      title: 'Blockquote — Showcase',
      view: renderPair,
      source: exampleApplicationSource({
        imports: `import { Blockquote } from '@/ui/effect/ui'
import './blockquote.css'

const quoteOne = ${JSON.stringify(QUOTE_1)}
const quoteTwo = ${JSON.stringify(QUOTE_2)}`,
        body: pairBody,
      }),
    },
    {
      title: 'Blockquote — With Attribution',
      view: renderPair,
      source: exampleApplicationSource({
        imports: `import { Blockquote } from '@/ui/effect/ui'
import './blockquote.css'

const quoteOne = ${JSON.stringify(QUOTE_1)}
const quoteTwo = ${JSON.stringify(QUOTE_2)}`,
        body: pairBody,
      }),
    },
    {
      title: 'Blockquote — Testimonials',
      view: renderTestimonials,
      source: exampleApplicationSource({
        imports: `import { Blockquote, Card } from '@/ui/effect/ui'
import './blockquote.css'

const testimonials = ${JSON.stringify(testimonials, null, 2)}`,
        body: testimonialsBody,
      }),
    },
  ],
})
