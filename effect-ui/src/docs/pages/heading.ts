import { Card, Heading, Text } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import './heading.css'

type HeadingExampleKind =
  | 'showcase'
  | 'truncation'
  | 'pageHierarchy'
  | 'cardGrid'

type HeadingFixture = Readonly<{
  title: string
  kind: HeadingExampleKind
}>

const fixtures: Readonly<Record<HeadingExampleKind, HeadingFixture>> = {
  showcase: { title: 'Heading', kind: 'showcase' },
  truncation: { title: 'Heading — Truncation', kind: 'truncation' },
  pageHierarchy: { title: 'Heading — Page Hierarchy', kind: 'pageHierarchy' },
  cardGrid: { title: 'Heading — Card Grid', kind: 'cardGrid' },
}

const render: Record<HeadingExampleKind, DocsExampleImplementation['view']> = {
  showcase: h =>
    h.div
      .class('heading-docs-showcase')
      .children(
        ([1, 2, 3, 4, 5, 6] as const).map(level =>
          Heading(h, { level, children: [`Heading Level ${level}`] }),
        ),
      ),
  truncation: h =>
    h.div.class('heading-docs-truncation').children(
      h.div.class('heading-docs-box').children(
        Heading(h, {
          level: 2,
          maxLines: 1,
          children: [
            'Very Long Heading That Will Be Truncated To One Line With Ellipsis',
          ],
        }),
      ),
      h.div.class('heading-docs-box').children(
        Heading(h, {
          level: 2,
          maxLines: 2,
          children: [
            'Very Long Heading That Will Be Truncated To Two Lines To Keep Card Layout Compact',
          ],
        }),
      ),
    ),
  pageHierarchy: h =>
    h.div.class('heading-docs-page').children(
      h.div.children(
        Heading(h, { level: 1, children: ['Dashboard Overview'] }),
        Text(h, {
          type: 'supporting',
          display: 'block',
          children: ['Last updated 5 minutes ago'],
        }),
      ),
      h.div.children(
        Heading(h, { level: 2, children: ['Recent Activity'] }),
        Text(h, {
          type: 'body',
          display: 'block',
          children: ["Here's what's been happening in your workspace."],
        }),
      ),
      h.div.children(
        Heading(h, { level: 3, children: ['Today'] }),
        Text(h, {
          type: 'body',
          display: 'block',
          children: [
            '• Project Alpha updated',
            h.br,
            '• 3 new comments',
            h.br,
            '• Task completed',
          ],
        }),
      ),
    ),
  cardGrid: h =>
    Card(h, {
      className: 'heading-docs-card',
      children: card => [
        card.content({
          children: [
            h.div.class('heading-docs-card-content').children(
              Heading(h, { level: 3, children: ['Card Title'] }),
              Text(h, {
                type: 'body',
                maxLines: 2,
                display: 'block',
                children: [
                  'This is a card description that might be quite long and needs to be truncated after two lines to keep the card compact and uniform.',
                ],
              }),
              Text(h, {
                type: 'supporting',
                display: 'block',
                children: ['Updated 1 hour ago'],
              }),
            ),
          ],
        }),
      ],
    }),
}

const bodies: Record<HeadingExampleKind, string> = {
  showcase: `h.div.class('heading-docs-showcase').children(
  ([1, 2, 3, 4, 5, 6] as const).map(level =>
    Heading(h, { level, children: [\`Heading Level \${level}\`] }),
  ),
)`,
  truncation: `h.div.class('heading-docs-truncation').children(
  h.div.class('heading-docs-box').children(
    Heading(h, {
      level: 2,
      maxLines: 1,
      children: ['Very Long Heading That Will Be Truncated To One Line With Ellipsis'],
    }),
  ),
  h.div.class('heading-docs-box').children(
    Heading(h, {
      level: 2,
      maxLines: 2,
      children: ['Very Long Heading That Will Be Truncated To Two Lines To Keep Card Layout Compact'],
    }),
  ),
)`,
  pageHierarchy: `h.div.class('heading-docs-page').children(
  h.div.children(
    Heading(h, { level: 1, children: ['Dashboard Overview'] }),
    Text(h, { type: 'supporting', display: 'block', children: ['Last updated 5 minutes ago'] }),
  ),
  h.div.children(
    Heading(h, { level: 2, children: ['Recent Activity'] }),
    Text(h, { type: 'body', display: 'block', children: ["Here's what's been happening in your workspace."] }),
  ),
  h.div.children(
    Heading(h, { level: 3, children: ['Today'] }),
    Text(h, {
      type: 'body',
      display: 'block',
      children: ['• Project Alpha updated', h.br, '• 3 new comments', h.br, '• Task completed'],
    }),
  ),
)`,
  cardGrid: `Card(h, {
  className: 'heading-docs-card',
  children: card => [
    card.content({
      children: [
        h.div.class('heading-docs-card-content').children(
          Heading(h, { level: 3, children: ['Card Title'] }),
          Text(h, {
            type: 'body',
            maxLines: 2,
            display: 'block',
            children: ['This is a card description that might be quite long and needs to be truncated after two lines to keep the card compact and uniform.'],
          }),
          Text(h, { type: 'supporting', display: 'block', children: ['Updated 1 hour ago'] }),
        ),
      ],
    }),
  ],
})`,
}

const sourceFor = (
  kind: HeadingExampleKind,
) => `import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'
import { ${kind === 'cardGrid' ? 'Card, Heading, Text' : kind === 'pageHierarchy' ? 'Heading, Text' : 'Heading'} } from '@/ui/effect/ui'
import './heading.css'

const App = Html.component({
  name: 'HeadingExample',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    h.main.class('mx-auto flex min-h-screen w-full max-w-xl items-center p-8').children(
      ${bodies[kind]},
    ),
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing root')
Layer.launch(BrowserHost.mount(App, {}, root)).pipe(Effect.runFork)`

export const componentDocs = defineComponentDocs({
  usage: `import { Heading } from '@/ui/effect/ui'

Heading(h, { level: 2, children: ['Section title'] })`,
  examples: (
    ['showcase', 'truncation', 'pageHierarchy', 'cardGrid'] as const
  ).map(kind => ({
    title: fixtures[kind].title,
    view: render[kind],
    source: sourceFor(kind),
  })),
})
