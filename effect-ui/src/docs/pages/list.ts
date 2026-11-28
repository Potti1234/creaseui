import type { View } from '@effect/ui'

import { Badge, List } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './list.css'

type ListDocsItem = Readonly<{
  key: string
  label: View.Input<DocsMessage>
  description?: View.Input<DocsMessage>
  startContent?: View.Input<DocsMessage>
  endContent?: View.Input<DocsMessage>
}>

const basicItems: ReadonlyArray<ListDocsItem> = [
  {
    key: 'notifications',
    label: 'Notifications',
    description: 'Manage your alerts',
  },
  { key: 'privacy', label: 'Privacy', description: 'Control your data' },
  { key: 'security', label: 'Security', description: 'Password and 2FA' },
]
const featureItems: ReadonlyArray<ListDocsItem> = [
  { key: 'accessible', label: 'Accessible by default' },
  { key: 'themeable', label: 'Themeable with StyleX' },
  { key: 'composable', label: 'Composable and extensible' },
]
const stepItems: ReadonlyArray<ListDocsItem> = [
  {
    key: 'add',
    label: 'Add the component',
    description: 'npx creaseui add list',
  },
  {
    key: 'import',
    label: 'Import components',
    description: "import * as List from '@/ui/list'",
  },
  {
    key: 'build',
    label: 'Start building',
    description: 'Use components in your app',
  },
]

const render =
  (
    items: ReadonlyArray<ListDocsItem>,
    listStyle: 'none' | 'disc' | 'decimal' = 'none',
    hasDividers = false,
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div.class('list-docs-frame').children(
      List(h, {
        id: `${context.idPrefix}-list`,
        items,
        listStyle,
        ...(hasDividers ? { hasDividers: true } : {}),
      }),
    )

const source = exampleApplicationSource({
  imports: `import { List } from '@/ui/effect/ui'
import './list.css'`,
  body: `List(h, {
  id: 'settings-list',
  items: [{ key: 'privacy', label: 'Privacy', description: 'Control your data' }],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { List } from '@/ui/effect/ui'

List(h, { id: 'settings-list', items: [{ key: 'privacy', label: 'Privacy' }] })`,
  examples: [
    { title: 'List', view: render(basicItems), source },
    { title: 'List — Basic', view: render(basicItems), source },
    {
      title: 'List — Bulleted Features',
      view: render(featureItems, 'disc'),
      source,
    },
    {
      title: 'List — Message List',
      view: (h, context) =>
        h.div.class('list-docs-frame').children(
          List(h, {
            id: `${context.idPrefix}-messages`,
            hasDividers: true,
            items: [
              {
                key: 'alex',
                label: 'Alex Johnson',
                description: 'Hey, are we still on for lunch tomorrow?',
                startContent: h.span.class('list-docs-avatar').children('AJ'),
                endContent: Badge(h, { children: ['2'] }),
              },
              {
                key: 'sam',
                label: 'Sam Rivera',
                description: 'I pushed the latest changes to the repo',
                startContent: h.span.class('list-docs-avatar').children('SR'),
              },
              {
                key: 'jordan',
                label: 'Jordan Lee',
                description:
                  'Can you review the design spec when you get a chance?',
                startContent: h.span.class('list-docs-avatar').children('JL'),
                endContent: Badge(h, { children: ['5'] }),
              },
            ],
          }),
        ),
      source,
    },
    {
      title: 'List — Ordered Steps',
      view: render(stepItems, 'decimal'),
      source,
    },
  ],
})
