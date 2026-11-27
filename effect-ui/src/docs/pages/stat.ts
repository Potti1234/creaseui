import { Html } from '@effect/ui/html'
import { Card, Stat } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './stat.css'

type Delta = Readonly<{
  value: string
  direction: 'up' | 'down' | 'flat'
  sentiment?: 'positive' | 'negative' | 'neutral'
}>
type Item = Readonly<{
  label: string
  value: string
  delta?: Delta
  description?: string
  size?: 'sm' | 'md' | 'lg'
  withMedia?: boolean
}>

const cards: ReadonlyArray<Item> = [
  {
    label: 'Total revenue',
    value: '$1.28M',
    delta: { value: '+12.4%', direction: 'up' },
    description: 'vs. previous 30 days',
  },
  {
    label: 'Error rate',
    value: '0.42%',
    delta: { value: '-0.08%', direction: 'down', sentiment: 'positive' },
    description: 'vs. previous 30 days',
  },
  {
    label: 'Active users',
    value: '18,204',
    delta: { value: '0.0%', direction: 'flat' },
    description: 'vs. previous 30 days',
  },
]
const sizes: ReadonlyArray<Item> = [
  {
    label: 'Deploys',
    value: '128',
    delta: { value: '+6', direction: 'up' },
    size: 'sm',
  },
  {
    label: 'Deploys',
    value: '128',
    delta: { value: '+6', direction: 'up' },
    size: 'md',
  },
  {
    label: 'Deploys',
    value: '128',
    delta: { value: '+6', direction: 'up' },
    size: 'lg',
  },
]
const mediaItem: Item = {
  label: 'Conversion',
  value: '7.8%',
  delta: { value: '+0.9%', direction: 'up' },
  description: 'checkout completion',
  withMedia: true,
}

const sparkline = (h: Html.H<DocsMessage>) =>
  h
    .el('svg')
    .attrs({
      viewBox: '0 0 160 36',
      role: 'img',
      'aria-label': 'Rising trend',
      class: 'stat-docs-sparkline',
    })
    .children(
      h.el('polyline').attrs({
        points: '0,28 24,26 48,30 72,18 96,20 120,10 160,8',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '3',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    )

const stat = (h: Html.H<DocsMessage>, item: Item) =>
  Stat(h, {
    label: item.label,
    value: item.value,
    ...(item.delta === undefined ? {} : { delta: item.delta }),
    ...(item.description === undefined
      ? {}
      : { description: item.description }),
    ...(item.size === undefined ? {} : { size: item.size }),
    ...(item.withMedia === true ? { media: [sparkline(h)] } : {}),
  })
const inCard = (h: Html.H<DocsMessage>, item: Item) =>
  Card(h, {
    children: card => [card.content({ children: [stat(h, item)] })],
  })

const statSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Card, Stat } from '@/ui/effect/ui'
import './stat.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Stat } from '@/ui/effect/ui'

Stat(h, { label: 'Revenue', value: '$1.28M' })`,
  examples: [
    {
      title: 'Stat',
      view: h =>
        h.div
          .class('stat-docs-grid')
          .children(cards.map(item => inCard(h, item))),
      source: statSource(`h.div.class('stat-docs-grid').children(
  Card(h, { children: card => [card.content({ children: [Stat(h, { label: 'Total revenue', value: '$1.28M' })] })] }),
)`),
    },
    {
      title: 'Stat — Sizes',
      view: h =>
        h.div.class('stat-docs-row').children(sizes.map(item => stat(h, item))),
      source: statSource(`h.div.class('stat-docs-row').children(
  Stat(h, { label: 'Deploys', value: '128', size: 'sm' }),
  Stat(h, { label: 'Deploys', value: '128', size: 'lg' }),
)`),
    },
    {
      title: 'Stat — With Media',
      view: h => inCard(h, mediaItem),
      source: statSource(`Stat(h, {
  label: 'Conversion',
  value: '7.8%',
  media: [sparkline(h)],
})`),
    },
  ],
})
