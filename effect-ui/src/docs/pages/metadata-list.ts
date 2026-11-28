import { Badge, MetadataList } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './metadata-list.css'

const basicItems = [
  { key: 'name', label: 'Name', definition: 'MetadataList' },
  { key: 'status', label: 'Status', definition: 'Active' },
  { key: 'owner', label: 'Owner', definition: 'Joey' },
]
const collapsibleItems = [
  ...basicItems,
  { key: 'created', label: 'Created', definition: 'Jan 15, 2026' },
  { key: 'updated', label: 'Updated', definition: 'Mar 26, 2026' },
  { key: 'priority', label: 'Priority', definition: 'Tier 1' },
]
const horizontalItems = [
  { key: 'status', label: 'Status', definition: 'Active' },
  { key: 'type', label: 'Type', definition: 'Premium' },
  { key: 'owner', label: 'Owner', definition: 'Joey' },
  { key: 'created', label: 'Created', definition: 'Jan 15, 2026' },
]

const simple =
  (
    items: typeof basicItems,
    extra: Readonly<{
      maxNumOfItems?: number
      orientation?: 'horizontal' | 'vertical'
    }> = {},
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div.class('metadata-docs-frame').children(
      MetadataList(h, {
        key: `${context.idPrefix}-metadata`,
        props: {},
        id: `${context.idPrefix}-metadata`,
        items,
        ...extra,
      }),
    )

const source = exampleApplicationSource({
  imports: `import { MetadataList } from '@/ui/effect/ui'
import './metadata-list.css'`,
  body: `MetadataList(h, {
  key: 'metadata',
  props: {},
  id: 'metadata',
  items: [{ key: 'status', label: 'Status', definition: 'Active' }],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { MetadataList } from '@/ui/effect/ui'

MetadataList(h, {
  key: 'metadata',
  props: {},
  id: 'metadata',
  items: [{ key: 'status', label: 'Status', definition: 'Active' }],
})`,
  examples: [
    { title: 'MetadataList', view: simple(basicItems), source },
    { title: 'MetadataList — Basic', view: simple(basicItems), source },
    {
      title: 'MetadataList — Collapsible',
      view: simple(collapsibleItems, { maxNumOfItems: 3 }),
      source,
    },
    {
      title: 'MetadataList — Horizontal',
      view: simple(horizontalItems, { orientation: 'horizontal' }),
      source,
    },
    {
      title: 'MetadataList — Multi-Column',
      view: (h, context) =>
        h.div.class('metadata-docs-frame').children(
          MetadataList(h, {
            key: `${context.idPrefix}-metadata`,
            props: {},
            id: `${context.idPrefix}-metadata`,
            columns: 'multi',
            items: [
              { key: 'name', label: 'Name', definition: 'MetadataList' },
              { key: 'status', label: 'Status', definition: 'Active' },
              { key: 'owner', label: 'Owner', definition: 'Joey' },
              { key: 'created', label: 'Created', definition: 'Jan 15, 2026' },
              {
                key: 'tags',
                label: 'Tags',
                definition: h.div
                  .class('metadata-docs-tokens')
                  .children(
                    Badge(h, { variant: 'secondary', children: ['component'] }),
                    Badge(h, { variant: 'secondary', children: ['xds'] }),
                  ),
              },
              { key: 'priority', label: 'Priority', definition: 'Tier 1' },
            ],
          }),
        ),
      source,
    },
  ],
})
