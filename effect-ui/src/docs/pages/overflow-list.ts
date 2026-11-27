import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { Badge, Button, OverflowList } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './overflow-list.css'

type Item = Readonly<
  | { kind: 'button'; label: string; variant?: 'primary' | 'destructive' }
  | {
      kind: 'badge'
      label: string
      tone: 'info' | 'success' | 'warning' | 'neutral' | 'error'
    }
>
type Fixture = Readonly<{
  id: string
  items: ReadonlyArray<Item>
  gap: 1 | 2
  maxVisibleItems?: number
  maxRows?: number
  collapseFrom?: 'start'
  container: 'frame' | 'center' | 'card'
  width: number
  minWidth?: number
  indicator: 'moreButton' | 'moreMenu' | 'badge'
}>
const tagNames = [
  'Foldkit',
  'TypeScript',
  'StyleX',
  'Storybook',
  'Vitest',
  'Playwright',
  'ESLint',
  'Prettier',
  'Vite',
  'pnpm',
] as const
const fixtures: ReadonlyArray<Fixture> = [
  {
    id: 'basic',
    items: [
      { kind: 'button', label: 'Edit' },
      { kind: 'button', label: 'Duplicate' },
      { kind: 'button', label: 'Share' },
      { kind: 'button', label: 'Archive' },
      { kind: 'button', label: 'Delete' },
    ],
    gap: 2,
    container: 'frame',
    width: 400,
    indicator: 'moreButton',
  },
  {
    id: 'capped',
    items: [
      { kind: 'button', label: 'Save' },
      { kind: 'button', label: 'Edit' },
      { kind: 'button', label: 'Duplicate' },
      { kind: 'button', label: 'Share' },
      { kind: 'button', label: 'Archive' },
      { kind: 'button', label: 'Delete' },
    ],
    gap: 2,
    maxVisibleItems: 3,
    container: 'center',
    width: 420,
    indicator: 'moreMenu',
  },
  {
    id: 'start',
    items: [
      { kind: 'button', label: 'Step 1' },
      { kind: 'button', label: 'Step 2' },
      { kind: 'button', label: 'Step 3' },
      { kind: 'button', label: 'Step 4' },
      { kind: 'button', label: 'Step 5' },
    ],
    gap: 2,
    collapseFrom: 'start',
    container: 'center',
    width: 300,
    indicator: 'moreButton',
  },
  {
    id: 'multirow',
    items: tagNames.map(label => ({
      kind: 'badge' as const,
      label,
      tone: 'info' as const,
    })),
    gap: 1,
    maxRows: 2,
    container: 'card',
    width: 260,
    minWidth: 120,
    indicator: 'badge',
  },
  {
    id: 'badges',
    items: [
      { kind: 'badge', label: 'Foldkit', tone: 'info' },
      { kind: 'badge', label: 'TypeScript', tone: 'success' },
      { kind: 'badge', label: 'StyleX', tone: 'warning' },
      { kind: 'badge', label: 'Storybook', tone: 'neutral' },
      { kind: 'badge', label: 'Vitest', tone: 'error' },
    ],
    gap: 1,
    container: 'card',
    width: 300,
    minWidth: 80,
    indicator: 'badge',
  },
  {
    id: 'dropdown',
    items: [
      { kind: 'button', label: 'Save', variant: 'primary' },
      { kind: 'button', label: 'Edit' },
      { kind: 'button', label: 'Duplicate' },
      { kind: 'button', label: 'Share' },
      { kind: 'button', label: 'Archive' },
      { kind: 'button', label: 'Delete', variant: 'destructive' },
    ],
    gap: 2,
    container: 'card',
    width: 350,
    minWidth: 100,
    indicator: 'moreMenu',
  },
]
const badgeVariant = (
  tone: 'info' | 'success' | 'warning' | 'neutral' | 'error',
) =>
  tone === 'info'
    ? ('default' as const)
    : tone === 'success'
      ? ('secondary' as const)
      : tone === 'warning'
        ? ('outline' as const)
        : tone === 'neutral'
          ? ('ghost' as const)
          : ('destructive' as const)
const itemView = (
  h: Html.H<DocsMessage>,
  item: Item,
): View.Content<DocsMessage> =>
  (item.kind === 'badge'
    ? Badge(h, { variant: badgeVariant(item.tone) }).children(item.label)
    : Button(h, {
        variant:
          item.variant === 'primary'
            ? 'default'
            : item.variant === 'destructive'
              ? 'destructive'
              : 'secondary',
        size: 'sm',
      }).children(item.label)) as unknown as View.Content<DocsMessage>
const renderer =
  (h: Html.H<DocsMessage>, fixture: Fixture, _key: string) =>
  (
    overflowItems: ReadonlyArray<{
      item: View.Content<DocsMessage> | string
      index: number
    }>,
  ): View.Content<DocsMessage> => {
    if (fixture.indicator === 'badge')
      return Badge(h, { variant: 'ghost' }).children(
        `+${overflowItems.length}`,
      ) as unknown as View.Content<DocsMessage>
    return Button(h, { variant: 'ghost', size: 'sm' }).children(
      fixture.indicator === 'moreButton'
        ? `+${overflowItems.length} more`
        : `+${overflowItems.length}`,
    ) as unknown as View.Content<DocsMessage>
  }
const example =
  (fixture: Fixture): DocsExampleImplementation['view'] =>
  (h, context) => {
    const key = `${context.idPrefix}-${fixture.id}`
    const list = OverflowList(h, {
      key,
      props: {
        gap: fixture.gap,
        ...(fixture.maxVisibleItems === undefined
          ? {}
          : { maxVisibleItems: fixture.maxVisibleItems }),
        ...(fixture.maxRows === undefined ? {} : { maxRows: fixture.maxRows }),
        ...(fixture.collapseFrom === undefined
          ? {}
          : { collapseFrom: fixture.collapseFrom }),
      },
      items: fixture.items.map((item, index) => ({
        key: `${index}-${item.label}`,
        content: itemView(h, item),
      })),
      overflowRenderer: renderer(h, fixture, key),
    })
    const width = `${fixture.width}px`
    if (fixture.container === 'frame')
      return h.div
        .class('overflow-docs-frame')
        .style({ maxWidth: width })
        .children(list)
    if (fixture.container === 'center')
      return h.div
        .class('overflow-docs-center')
        .style({ width })
        .children(h.div.class('overflow-docs-card').children(list))
    return h.div
      .class('overflow-docs-card', 'overflow-docs-resizable')
      .style({ width, minWidth: `${fixture.minWidth ?? 80}px` })
      .children(list)
  }
const source = exampleApplicationSource({
  imports: `import { OverflowList } from '@/ui/effect/ui'
import './overflow-list.css'`,
  body: `OverflowList(h, {
  key: 'actions',
  props: { gap: 2 },
  items,
  overflowRenderer: overflowItems => Button(h, { variant: 'ghost', size: 'sm' }).children(\`+\${overflowItems.length} more\`),
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { OverflowList } from '@/ui/effect/ui'\n\nOverflowList(h, { key: 'items', props: { gap: 2 }, items, overflowRenderer })`,
  examples: [
    { title: 'OverflowList', view: example(fixtures[0]!), source },
    {
      title: 'OverflowList — Capped Toolbar',
      view: example(fixtures[1]!),
      source,
    },
    {
      title: 'OverflowList — Collapse From Start',
      view: example(fixtures[2]!),
      source,
    },
    {
      title: 'OverflowList — Multi-row Tags',
      view: example(fixtures[3]!),
      source,
    },
    { title: 'OverflowList — Badge Tags', view: example(fixtures[4]!), source },
    {
      title: 'OverflowList — Dropdown Actions',
      view: example(fixtures[5]!),
      source,
    },
  ],
})
