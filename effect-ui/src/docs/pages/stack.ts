import type { Html } from '@effect/ui/html'

import { Avatar, Badge, Button, HStack, StackItem, VStack } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './stack.css'

const supporting = <Msg>(h: Html.H<Msg>, text: string) =>
  h.p.class('stack-docs-supporting').children(text)
const badge = <Msg>(h: Html.H<Msg>, label: string) =>
  Badge(h, { variant: 'secondary', children: [label] })
const cardLabel = <Msg>(h: Html.H<Msg>, label: string) =>
  h.div.class('stack-docs-card').children(supporting(h, label))
const avatar = (h: Html.H<DocsMessage>, key: string, initials: string) =>
  Avatar(h, { key, props: {}, alt: '', fallbackContent: [initials] })

const directions: DocsExampleImplementation['view'] = h =>
  HStack(h, {
    gap: 10,
    hAlign: 'center',
    children: [
      HStack(h, {
        gap: 2,
        vAlign: 'center',
        children: [
          badge(h, 'Horizontal'),
          badge(h, 'Horizontal'),
          badge(h, 'Horizontal'),
        ],
      }),
      VStack(h, {
        gap: 2,
        children: [
          badge(h, 'Vertical'),
          badge(h, 'Vertical'),
          badge(h, 'Vertical'),
        ],
      }),
    ],
  })

const rows = [
  ['Start (left)', 'start'],
  ['Center', 'center'],
  ['End (right)', 'end'],
] as const

const alignment: DocsExampleImplementation['view'] = h =>
  VStack(h, {
    gap: 3,
    width: '100%',
    maxWidth: 500,
    children: rows.map(([label, hAlign]) =>
      h.div.class('stack-docs-card').children(
        VStack(h, {
          gap: 4,
          children: [
            supporting(h, label),
            HStack(h, {
              gap: 1,
              hAlign,
              children: [
                Button(h, { variant: 'secondary', size: 'sm' }).children(
                  'Cancel',
                ),
                Button(h, { size: 'sm' }).children('Save'),
              ],
            }),
          ],
        }),
      ),
    ),
  })

const users = [
  ['Olivia Chen', 'Engineering Lead', 'OC'],
  ['Marcus Rivera', 'Product Designer', 'MR'],
  ['Aisha Patel', 'Marketing Manager', 'AP'],
] as const

const fillItem: DocsExampleImplementation['view'] = (h, context) =>
  VStack(h, {
    gap: 3,
    width: '100%',
    maxWidth: 300,
    children: users.map(([name, role, initials], index) =>
      HStack(h, {
        gap: 3,
        vAlign: 'center',
        children: [
          StackItem(h, {
            size: 'static',
            children: [avatar(h, `${context.idPrefix}-${index}`, initials)],
          }),
          StackItem(h, {
            size: 'fill',
            children: [
              VStack(h, {
                gap: 0,
                children: [
                  h.p.class('stack-docs-name').children(name),
                  supporting(h, role),
                ],
              }),
            ],
          }),
          StackItem(h, {
            size: 'static',
            children: [
              Button(h, { variant: 'secondary', size: 'sm' }).children('View'),
            ],
          }),
        ],
      }),
    ),
  })

const hBasic: DocsExampleImplementation['view'] = h =>
  HStack(h, {
    gap: 2,
    vAlign: 'center',
    children: [
      badge(h, 'Foldkit'),
      badge(h, 'TypeScript'),
      badge(h, 'Node.js'),
    ],
  })

const showcaseGroups = [
  ['HAlign: start', 2, 'start', ['Foldkit', 'TypeScript', 'Node.js']],
  ['HAlign: center', 4, 'center', ['Design', 'Engineering', 'Product']],
  ['HAlign: between', 2, 'between', ['Start', 'Middle', 'End']],
] as const

const hShowcase: DocsExampleImplementation['view'] = h =>
  VStack(h, {
    gap: 6,
    width: '100%',
    maxWidth: 400,
    children: showcaseGroups.map(([label, gap, hAlign, items]) =>
      VStack(h, {
        gap: 2,
        children: [
          supporting(h, label),
          HStack(h, {
            gap,
            hAlign,
            children: items.map(item => badge(h, item)),
          }),
        ],
      }),
    ),
  })

const vBasic: DocsExampleImplementation['view'] = h =>
  VStack(h, {
    gap: 3,
    children: [
      h.h5.class('stack-docs-heading').children('Weekly Report'),
      h.p
        .class('stack-docs-body')
        .children('VStack arranges its children in a vertical column.'),
      h.p
        .class('stack-docs-body')
        .children('The gap prop controls the spacing between each item.'),
    ],
  })

const vShowcase: DocsExampleImplementation['view'] = h =>
  HStack(h, {
    gap: 10,
    hAlign: 'center',
    children: (
      [
        ['gap=2', 2],
        ['gap=4', 4],
        ['gap=6', 6],
      ] as const
    ).map(([label, gap]) =>
      VStack(h, {
        gap: 2,
        children: [
          supporting(h, label),
          VStack(h, {
            gap,
            children: [
              badge(h, 'Step 1'),
              badge(h, 'Step 2'),
              badge(h, 'Step 3'),
            ],
          }),
        ],
      }),
    ),
  })

const itemFill: DocsExampleImplementation['view'] = h =>
  HStack(h, {
    gap: 3,
    vAlign: 'center',
    width: '100%',
    maxWidth: 400,
    children: [
      StackItem(h, { size: 'static', children: [cardLabel(h, 'Static')] }),
      StackItem(h, {
        size: 'fill',
        children: [cardLabel(h, 'Fills remaining space')],
      }),
    ],
  })

const itemShowcase: DocsExampleImplementation['view'] = h =>
  HStack(h, {
    gap: 3,
    vAlign: 'center',
    width: '100%',
    maxWidth: 500,
    children: [
      StackItem(h, {
        size: 'static',
        children: [cardLabel(h, 'Static Width')],
      }),
      StackItem(h, {
        size: 'fill',
        children: [cardLabel(h, 'Fills remaining space')],
      }),
      StackItem(h, {
        size: 'static',
        children: [cardLabel(h, 'Static Width')],
      }),
    ],
  })

const source = exampleApplicationSource({
  imports: `import { Badge, HStack, VStack } from '@/ui/effect/ui'
import './stack.css'`,
  body: `HStack(h, {
  gap: 2,
  vAlign: 'center',
  children: [Badge(h, { variant: 'secondary', children: ['Foldkit'] })],
})`,
})

const examples: ReadonlyArray<
  readonly [string, DocsExampleImplementation['view']]
> = [
  ['Stack — Directions', directions],
  ['Stack — Alignment', alignment],
  ['Stack — Fill Item', fillItem],
  ['HStack — Basic', hBasic],
  ['H Stack', hShowcase],
  ['VStack — Basic', vBasic],
  ['V Stack', vShowcase],
  ['StackItem — Fill', itemFill],
  ['Stack Item', itemShowcase],
]

export const componentDocs = defineComponentDocs({
  usage: `import { HStack, VStack } from '@/ui/effect/ui'

HStack(h, { gap: 2, children: [] })`,
  examples: examples.map(([title, view]) => ({ title, view, source })),
})
