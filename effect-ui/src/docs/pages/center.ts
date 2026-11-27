import { Button, Card, Center, HStack, Icon, VStack } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
type IconName =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'list'
  | 'link'
  | 'image'
  | 'inbox'

import './center.css'

const centeredContent: DocsExampleImplementation['view'] = h =>
  Center(h, {
    axis: 'both',
    width: '100%',
    height: 240,
    children: [
      VStack(h, {
        gap: 2,
        hAlign: 'center',
        children: [
          h.h4.class('center-docs-heading').children('Centered content'),
          h.p
            .class('center-docs-body')
            .children('Horizontally and vertically aligned.'),
        ],
      }),
    ],
  })

const iconButton = (
  h: Parameters<DocsExampleImplementation['view']>[0],
  name: IconName,
  label: string,
) =>
  Button(h, { variant: 'ghost', size: 'icon-sm' })
    .attrs({ 'aria-label': label })
    .children(Icon(h, { name, size: 'sm' }))

const horizontalContent: DocsExampleImplementation['view'] = h =>
  Card(h, {
    size: 'sm',
    className: 'center-docs-card-wide',
    children: card => [
      card.content({
        children: [
          Center(h, {
            axis: 'horizontal',
            width: '100%',
            children: [
              HStack(h, {
                gap: 0,
                vAlign: 'center',
                children: [
                  iconButton(h, 'bold', 'Bold'),
                  iconButton(h, 'italic', 'Italic'),
                  iconButton(h, 'underline', 'Underline'),
                  iconButton(h, 'list', 'List'),
                  iconButton(h, 'link', 'Link'),
                  iconButton(h, 'image', 'Image'),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })

const insideCardContent: DocsExampleImplementation['view'] = h =>
  Card(h, {
    size: 'sm',
    className: 'center-docs-card',
    children: card => [
      card.content({
        children: [
          Center(h, {
            height: 200,
            children: [
              VStack(h, {
                gap: 2,
                hAlign: 'center',
                children: [
                  Icon(h, { name: 'inbox', size: 'lg', tone: 'muted' }),
                  h.p.class('center-docs-heading').children('No messages yet'),
                  h.p
                    .class('center-docs-small-body')
                    .children('Messages from your team will appear here.'),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })

const sourceImports = `import { Button, Card, Center, HStack, Icon, VStack } from '@/ui/effect/ui'
type IconName = 'bold' | 'italic' | 'underline' | 'list' | 'link' | 'image' | 'inbox'

import './center.css'`

export const componentDocs = defineComponentDocs({
  usage: `import { Center } from '@/ui/effect/ui'

Center(h, { axis: 'both', width: '100%', height: 240, children: [content] })`,
  examples: [
    {
      title: 'Center',
      view: centeredContent,
      source: exampleApplicationSource({
        imports: sourceImports,
        body: `Center(h, {
  axis: 'both',
  width: '100%',
  height: 240,
  children: [
    VStack(h, {
      gap: 2,
      hAlign: 'center',
      children: [
        h.h4.class('center-docs-heading').children('Centered content'),
        h.p.class('center-docs-body').children('Horizontally and vertically aligned.'),
      ],
    }),
  ],
})`,
      }),
    },
    {
      title: 'Center — Horizontal Center',
      view: horizontalContent,
      source: exampleApplicationSource({
        imports: sourceImports,
        body: `Card(h, {
  size: 'sm',
  className: 'center-docs-card-wide',
  children: card => [
    card.content({
      children: [
        Center(h, {
          axis: 'horizontal',
          width: '100%',
          children: [HStack(h, { gap: 0, vAlign: 'center', children: formattingButtons(h) })],
        }),
      ],
    }),
  ],
})`,
      }),
    },
    {
      title: 'Center — Vertical & Horizontal Center',
      view: insideCardContent,
      source: exampleApplicationSource({
        imports: sourceImports,
        body: `Card(h, {
  size: 'sm',
  className: 'center-docs-card',
  children: card => [
    card.content({
      children: [
        Center(h, {
          height: 200,
          children: [
            VStack(h, {
              gap: 2,
              hAlign: 'center',
              children: [
                Icon(h, { name: 'inbox', size: 'lg', tone: 'muted' }),
                h.p.class('center-docs-heading').children('No messages yet'),
                h.p.class('center-docs-small-body').children('Messages from your team will appear here.'),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
})`,
      }),
    },
  ],
})
