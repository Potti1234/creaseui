import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  Badge,
  Button,
  Card,
  HStack,
  Icon,
  VStack,
  VisuallyHidden,
} from '#components'
import { defineComponentDocs, type DocsMessage } from '../types'
import { exampleApplicationSource } from './source'
import './visually-hidden.css'

const actions = [
  { label: 'Download', icon: 'download' },
  { label: 'Share', icon: 'share' },
  { label: 'Delete', icon: 'trash-2' },
] as const
const items = [
  { name: 'creaseui-core', status: 'Passing', error: false },
  { name: 'creaseui-charts', status: 'Failing', error: true },
  { name: 'creaseui-cli', status: 'Passing', error: false },
] as const
const stats = [
  { label: 'Revenue', value: '$48.2k', delta: '+12%', up: true },
  { label: 'Churn', value: '2.1%', delta: '-4%', up: false },
] as const
const columns = ['Backlog', 'In progress', 'Done'] as const

const supporting = <Msg>(h: Html.H<Msg>, text: string) =>
  h.p.class('vh-docs-supporting').children(text)
const body = <Msg>(h: Html.H<Msg>, text: string) =>
  h.p.class('vh-docs-body').children(text)
const mutedCard = <Msg, R>(h: Html.H<Msg>, children: View.Children<Msg, R>) =>
  h.div.class('vh-docs-muted-card').children(children)

const showcase = (h: Html.H<DocsMessage>) =>
  VStack(h, {
    gap: 5,
    hAlign: 'center',
    children: [
      HStack(h, {
        gap: 6,
        vAlign: 'stretch',
        wrap: 'wrap',
        hAlign: 'center',
        children: [
          mutedCard(h, [
            VStack(h, {
              gap: 4,
              hAlign: 'center',
              children: [
                supporting(h, 'What you see'),
                HStack(h, {
                  gap: 2,
                  children: actions.map(action =>
                    Button(h, {
                      element: h.button.attrs({ 'aria-label': action.label }),
                      variant: 'ghost',
                      size: 'icon',
                    }).children(Icon(h, { name: action.icon, size: 'sm' })),
                  ),
                }),
              ],
            }),
          ]),
          mutedCard(h, [
            VStack(h, {
              gap: 4,
              hAlign: 'start',
              children: [
                HStack(h, {
                  gap: 2,
                  vAlign: 'center',
                  children: [
                    Icon(h, { name: 'volume-2', size: 'sm', tone: 'muted' }),
                    supporting(h, 'What a screen reader hears'),
                  ],
                }),
                VStack(h, {
                  gap: 2,
                  children: actions.map(action =>
                    body(h, `${action.label}, button`),
                  ),
                }),
              ],
            }),
          ]),
        ],
      }),
      VisuallyHidden(h, {
        as: 'div',
        ariaLive: 'polite',
        children: ['Actions available: Download, Share, Delete.'],
      }),
    ],
  })

const LiveMessage = UiSchema.TaggedEnum({ MovedTask: {} })
const LiveDemo = Html.component({
  name: 'DocsVisuallyHiddenLiveDemo',
  model: Schema.Struct({ column: Schema.Number }),
  message: LiveMessage,
}).make({
  init: () => ({ column: 0 }),
  update: {
    MovedTask: $ => $.evolve({ column: ($.model.column + 1) % columns.length }),
  },
  view: (h, model) => {
    const current = columns[model.column] ?? columns[0]
    return VStack(h, {
      gap: 4,
      hAlign: 'start',
      children: [
        supporting(
          h,
          'Drag-and-drop and other visual-only changes are silent to screen readers. A live region narrates them.',
        ),
        HStack(h, {
          gap: 3,
          vAlign: 'center',
          children: [
            Button(h, {
              variant: 'secondary',
              onPress: LiveMessage.MovedTask(),
            }).children('Move task'),
            h.p
              .class('vh-docs-body')
              .children(
                'Task is in ',
                h.span.class('vh-docs-bold').children(current),
              ),
          ],
        }),
        VisuallyHidden(h, {
          as: 'div',
          ariaLive: 'polite',
          children: [`Task moved to ${current}`],
        }),
      ],
    })
  },
})

const heading = (h: Html.H<DocsMessage>) =>
  VStack(h, {
    gap: 3,
    hAlign: 'start',
    children: [
      supporting(
        h,
        'The layout makes this group obvious to sighted users. A hidden heading gives screen-reader users the same landmark to jump to.',
      ),
      VisuallyHidden(h, { as: 'h2', children: ['Build status'] }),
      VStack(h, {
        gap: 2,
        children: items.map(item =>
          mutedCard(h, [
            HStack(h, {
              gap: 3,
              vAlign: 'center',
              children: [
                body(h, item.name),
                Badge(h, {
                  variant: item.error ? 'destructive' : 'secondary',
                  children: [item.status],
                }),
              ],
            }),
          ]),
        ),
      }),
    ],
  })

const supplementary = (h: Html.H<DocsMessage>) =>
  HStack(h, {
    gap: 4,
    wrap: 'wrap',
    children: stats.map(stat =>
      mutedCard(h, [
        VStack(h, {
          gap: 1,
          children: [
            supporting(h, stat.label),
            h.p.class('vh-docs-display').children(stat.value),
            HStack(h, {
              gap: 1,
              vAlign: 'center',
              children: [
                Icon(h, {
                  name: stat.up ? 'arrow-up' : 'arrow-down',
                  size: 'sm',
                  ...(stat.up
                    ? { className: 'vh-docs-up' }
                    : { tone: 'muted' as const }),
                }),
                body(h, stat.delta),
                VisuallyHidden(h, {
                  children: [
                    stat.up ? ' increase' : ' decrease',
                    ' from last month',
                  ],
                }),
              ],
            }),
          ],
        }),
      ]),
    ),
  })

const source = exampleApplicationSource({
  imports: `import { VisuallyHidden } from '@/ui/effect/ui'
import './visually-hidden.css'`,
  body: `VisuallyHidden(h, {
  as: 'div',
  ariaLive: 'polite',
  children: ['Actions available: Download, Share, Delete.'],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { VisuallyHidden } from '@/ui/effect/ui'

VisuallyHidden(h, { as: 'span', children: ['Screen reader context'] })`,
  examples: [
    { title: 'VisuallyHidden', view: h => showcase(h), source },
    {
      title: 'VisuallyHidden — Live Region',
      view: (h, context) =>
        LiveDemo(h, { key: `${context.idPrefix}-live`, props: {} }),
      source,
    },
    {
      title: 'VisuallyHidden — Structural Heading',
      view: h => heading(h),
      source,
    },
    {
      title: 'VisuallyHidden — Supplementary Context',
      view: h => supplementary(h),
      source,
    },
  ],
})
