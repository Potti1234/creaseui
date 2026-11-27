import { Icon } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './icon.css'

type Item = Readonly<{
  name:
    | 'arrow-right'
    | 'badge-check'
    | 'bell'
    | 'bookmark'
    | 'chevron-down'
    | 'clock'
    | 'mail'
    | 'search'
    | 'settings'
    | 'star'
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'muted' | 'primary'
  filled?: boolean
  rotation?: 0 | 90 | 180
  ariaLabel?: string
}>

const fixtures: ReadonlyArray<readonly [string, ReadonlyArray<Item>, string?]> =
  [
    [
      'Icon',
      [
        { name: 'search' },
        { name: 'bell' },
        { name: 'mail' },
        { name: 'settings' },
        { name: 'bookmark' },
        { name: 'star' },
      ],
    ],
    [
      'Sizes',
      [
        { name: 'star', size: '3xs' },
        { name: 'star', size: '2xs' },
        { name: 'star', size: 'xs' },
        { name: 'star', size: 'sm' },
        { name: 'star', size: 'md' },
        { name: 'star', size: 'lg' },
        { name: 'star', size: 'xl' },
      ],
    ],
    [
      'Tone',
      [
        { name: 'clock', size: 'sm' },
        { name: 'clock', size: 'sm', tone: 'muted' },
      ],
    ],
    [
      'With text',
      [{ name: 'badge-check' }, { name: 'arrow-right' }],
      'Verified',
    ],
    [
      'Accessible label',
      [{ name: 'badge-check', size: 'md', ariaLabel: 'Verified account' }],
    ],
    [
      'Filled and rotated',
      [
        { name: 'star', size: 'md' },
        { name: 'star', size: 'md', tone: 'primary', filled: true },
        { name: 'chevron-down', size: 'md' },
        { name: 'chevron-down', size: 'md', rotation: 90 },
        { name: 'chevron-down', size: 'md', rotation: 180 },
      ],
    ],
  ]

type H = Parameters<DocsExampleImplementation['view']>[0]
const icon = (h: H, item: Item) =>
  Icon(h, {
    name: item.name,
    ...(item.size === undefined ? {} : { size: item.size }),
    ...(item.tone === undefined ? {} : { tone: item.tone }),
    ...(item.filled === true ? { filled: true } : {}),
    ...(item.rotation === undefined ? {} : { rotation: item.rotation }),
    ...(item.ariaLabel === undefined ? {} : { ariaLabel: item.ariaLabel }),
  })

const row =
  (
    items: ReadonlyArray<Item>,
    text?: string,
  ): DocsExampleImplementation['view'] =>
  h => {
    const icons = items.map(item => icon(h, item))
    return h.div
      .class('icon-docs-row')
      .children(
        text === undefined ? icons : [icons[0], text, ...icons.slice(1)],
      )
  }

const sourceFor = (items: ReadonlyArray<Item>) =>
  exampleApplicationSource({
    imports: `import { Icon } from '@/ui/effect/ui'
import './icon.css'`,
    body: `h.div.class('icon-docs-row').children(
  ${items.map(item => `Icon(h, { name: '${item.name}' })`).join(',\n  ')},
)`,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Icon } from '@/ui/effect/ui'

Icon(h, { name: 'search' })`,
  examples: fixtures.map(([title, items, text]) => ({
    title,
    view: row(items, text),
    source: sourceFor(items),
  })),
})
