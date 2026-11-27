import type { Html } from '@effect/ui/html'

import { Stat } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './stat.css'

type Item = Readonly<{
  label: string
  value: string
  delta?: {
    value: string
    direction: 'up' | 'down' | 'flat'
    sentiment?: 'positive' | 'negative' | 'neutral'
  }
  description?: string
  size?: 'sm' | 'md' | 'lg'
  media?: boolean
}>

const sparkline = <Msg>(h: Html.H<Msg>) =>
  h
    .el('svg')
    .attrs({
      class: 'stat-docs-sparkline',
      viewBox: '0 0 160 36',
      role: 'img',
      'aria-label': 'Rising trend',
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
    ...(item.media === true ? { media: [sparkline(h)] } : {}),
  })

const render =
  (
    items: ReadonlyArray<Item>,
    layout: 'cards' | 'row' | 'single',
  ): DocsExampleImplementation['view'] =>
  h =>
    h.div
      .class(
        layout === 'cards'
          ? 'stat-docs-cards'
          : layout === 'row'
            ? 'stat-docs-row'
            : 'stat-docs-single',
      )
      .children(
        items.map(item =>
          layout === 'cards'
            ? h.div.class('stat-docs-card').children(stat(h, item))
            : stat(h, item),
        ),
      )

const source = exampleApplicationSource({
  imports: `import { Stat } from '@/ui/effect/ui'
import './stat.css'`,
  body: `Stat(h, {
  label: 'Total revenue',
  value: '$1.28M',
  delta: { value: '+12.4%', direction: 'up' },
  description: 'vs. previous 30 days',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Stat } from '@/ui/effect/ui'

Stat(h, { label: 'Revenue', value: '$1.28M' })`,
  examples: [
    {
      title: 'Stat',
      view: render(
        [
          {
            label: 'Total revenue',
            value: '$1.28M',
            delta: { value: '+12.4%', direction: 'up' },
            description: 'vs. previous 30 days',
          },
          {
            label: 'Error rate',
            value: '0.42%',
            delta: {
              value: '-0.08%',
              direction: 'down',
              sentiment: 'positive',
            },
            description: 'vs. previous 30 days',
          },
          {
            label: 'Active users',
            value: '18,204',
            delta: { value: '0.0%', direction: 'flat' },
            description: 'vs. previous 30 days',
          },
        ],
        'cards',
      ),
      source,
    },
    {
      title: 'Stat — Sizes',
      view: render(
        [
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
        ],
        'row',
      ),
      source,
    },
    {
      title: 'Stat — With Media',
      view: render(
        [
          {
            label: 'Conversion',
            value: '7.8%',
            delta: { value: '+0.9%', direction: 'up' },
            description: 'checkout completion',
            media: true,
          },
        ],
        'single',
      ),
      source,
    },
  ],
})
