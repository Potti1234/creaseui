import { StatusDot } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './status-dot.css'

type Item = Readonly<{
  label: string
  variant: 'success' | 'warning' | 'error' | 'accent' | 'neutral'
  pulsing?: boolean
}>

const variants: ReadonlyArray<Item> = [
  { variant: 'success', label: 'Positive' },
  { variant: 'warning', label: 'Warning' },
  { variant: 'error', label: 'Negative' },
  { variant: 'accent', label: 'Info' },
  { variant: 'neutral', label: 'Neutral' },
]
const pulsing: ReadonlyArray<Item> = [
  { variant: 'success', label: 'Live', pulsing: true },
  { variant: 'warning', label: 'Processing', pulsing: true },
  { variant: 'error', label: 'Error', pulsing: true },
  { variant: 'accent', label: 'Processing', pulsing: true },
  { variant: 'neutral', label: 'Error', pulsing: true },
]
const statuses: ReadonlyArray<Item> = [
  { variant: 'success', label: 'Online' },
  { variant: 'warning', label: 'Away' },
  { variant: 'error', label: 'Offline' },
  { variant: 'neutral', label: 'Unknown' },
]

const dot = (h: Parameters<DocsExampleImplementation['view']>[0], item: Item) =>
  StatusDot(h, {
    variant: item.variant,
    label: item.label,
    ...(item.pulsing === true ? { pulsing: true } : {}),
  })

const row = (items: ReadonlyArray<Item>): DocsExampleImplementation['view'] => {
  return h =>
    h.div.class('status-dot-docs-row').children(items.map(item => dot(h, item)))
}

const list: DocsExampleImplementation['view'] = h =>
  h.div
    .class('status-dot-docs-list')
    .children(
      statuses.map(item =>
        h.div
          .class('status-dot-docs-item')
          .children(
            dot(h, item),
            h.span.class('status-dot-docs-label').children(item.label),
          ),
      ),
    )

const itemSource = (item: Item) => `StatusDot(h, {
  variant: '${item.variant}',
  label: '${item.label}',${item.pulsing === true ? '\n  pulsing: true,' : ''}
})`
const sourceFor = (items: ReadonlyArray<Item>, layout: 'row' | 'list') =>
  exampleApplicationSource({
    imports: `import { StatusDot } from '@/ui/effect/ui'
import './status-dot.css'`,
    body:
      layout === 'row'
        ? `h.div.class('status-dot-docs-row').children(
  ${items.map(itemSource).join(',\n  ')},
)`
        : `h.div.class('status-dot-docs-list').children(
  items.map(item =>
    h.div.class('status-dot-docs-item').children(
      StatusDot(h, { variant: item.variant, label: item.label }),
      h.span.class('status-dot-docs-label').children(item.label),
    ),
  ),
)`,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { StatusDot } from '@/ui/effect/ui'

StatusDot(h, { variant: 'success', label: 'Online' })`,
  examples: [
    {
      title: 'Status Dot',
      view: row(variants),
      source: sourceFor(variants, 'row'),
    },
    {
      title: 'StatusDot — Variants',
      view: row(variants),
      source: sourceFor(variants, 'row'),
    },
    {
      title: 'StatusDot — Pulsing',
      view: row(pulsing),
      source: sourceFor(pulsing, 'row'),
    },
    {
      title: 'StatusDot — Status Indicators',
      view: list,
      source: sourceFor(statuses, 'list'),
    },
  ],
})
