import { Heading, Text } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './text.css'

type Row = Readonly<{
  type?: 'body' | 'large' | 'label' | 'supporting' | 'code'
  color?: 'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  display?: 'inline' | 'block'
  maxLines?: number
  wordBreak?: 'break-all' | 'break-word'
  textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty'
  hasStrikethrough?: boolean
  hasTabularNumbers?: boolean
  content: string
}>

const LONG_TEXT =
  'The design system provides a consistent set of typography tokens, spacing scales, and color palettes that ensure every surface in the product feels cohesive regardless of which team built it.'

const showcase: ReadonlyArray<Row> = [
  { type: 'body', content: 'Body: The bulk of content' },
  { type: 'large', content: 'Large: Emphasized content' },
  { type: 'label', content: 'Label: Form and chart labels' },
  { type: 'supporting', content: 'Supporting: Helper text' },
  { type: 'code', content: 'Code: const x = 42;' },
]
const colors: ReadonlyArray<Row> = [
  {
    type: 'body',
    color: 'primary',
    content: 'Primary — Default for headings and body text',
  },
  {
    type: 'body',
    color: 'secondary',
    content: 'Secondary — Supporting details and metadata',
  },
  {
    type: 'body',
    color: 'accent',
    content: 'Accent — Links, emphasis, and accent-colored text',
  },
  {
    type: 'body',
    color: 'disabled',
    content: 'Disabled — Unavailable or inactive content',
  },
  {
    type: 'body',
    color: 'placeholder',
    content: 'Placeholder — Empty field hints',
  },
]
const types: ReadonlyArray<Row> = [
  { type: 'body', content: 'Body text for paragraphs and general content' },
  { type: 'large', content: 'Large text for introductions and callouts' },
  { type: 'label', content: 'Label text for form fields and section titles' },
  { type: 'supporting', content: 'Supporting text for captions and metadata' },
  { type: 'code', content: 'const theme = defineTheme({})' },
  {
    type: 'body',
    hasStrikethrough: true,
    content: 'Body text with strikethrough decoration',
  },
  {
    type: 'body',
    hasTabularNumbers: true,
    content: '1,234.56  78.90  100,000.00',
  },
]
const typeLabels = [
  'Body text',
  'Large text',
  'Label text',
  'Supporting text',
  'Code text',
  'Strikethrough',
  'Tabular numbers',
]
const weights: ReadonlyArray<Row> = [
  { type: 'body', weight: 'normal', display: 'block', content: 'Normal' },
  { type: 'body', weight: 'medium', display: 'block', content: 'Medium' },
  { type: 'body', weight: 'semibold', display: 'block', content: 'Semibold' },
  { type: 'body', weight: 'bold', display: 'block', content: 'Bold' },
]
const truncation: ReadonlyArray<Row> = [
  { maxLines: 1, content: '1 line' },
  { maxLines: 2, content: '2 lines' },
  { maxLines: 3, content: '3 lines' },
]
const wrapBoxes: ReadonlyArray<
  readonly [string, 'wrap' | 'nowrap' | 'balance' | 'pretty', string, boolean]
> = [
  [
    'Wrap (default)',
    'wrap',
    'This text wraps normally at word boundaries when it reaches the edge.',
    false,
  ],
  [
    'Nowrap',
    'nowrap',
    'This text does not wrap and will overflow its container.',
    true,
  ],
  [
    'Balance',
    'balance',
    'This text is balanced for better visual appearance across lines.',
    false,
  ],
  [
    'Pretty',
    'pretty',
    'This text uses pretty wrap to avoid orphans at the end of paragraphs.',
    false,
  ],
]

type H = Parameters<DocsExampleImplementation['view']>[0]
const textRow = (h: H, row: Row) =>
  Text(h, {
    ...(row.type === undefined ? {} : { type: row.type }),
    ...(row.color === undefined ? {} : { color: row.color }),
    ...(row.weight === undefined ? {} : { weight: row.weight }),
    ...(row.display === undefined ? {} : { display: row.display }),
    ...(row.maxLines === undefined ? {} : { maxLines: row.maxLines }),
    ...(row.wordBreak === undefined ? {} : { wordBreak: row.wordBreak }),
    ...(row.textWrap === undefined ? {} : { textWrap: row.textWrap }),
    ...(row.hasStrikethrough === true ? { hasStrikethrough: true } : {}),
    ...(row.hasTabularNumbers === true ? { hasTabularNumbers: true } : {}),
    children: [row.content],
  })

const simpleColumn =
  (
    rows: ReadonlyArray<Row>,
    tight = false,
  ): DocsExampleImplementation['view'] =>
  h =>
    h.div
      .class(tight ? 'text-docs-column-tight' : 'text-docs-column')
      .children(rows.map(row => textRow(h, row)))

const boxed = (
  h: H,
  label: string,
  text: ReturnType<typeof textRow>,
  clipped = false,
) =>
  h.div.children(
    Text(h, { type: 'label', display: 'block', children: [label] }),
    h.div
      .class(`text-docs-box${clipped ? ' text-docs-clipped' : ''}`)
      .children(text),
  )

const viewHeadingLevels: DocsExampleImplementation['view'] = h =>
  h.div
    .class('text-docs-column')
    .children(
      ([1, 2, 3, 4, 5, 6] as const).map(level =>
        Heading(h, { level, children: [`Heading ${level}`] }),
      ),
    )

const viewInline: DocsExampleImplementation['view'] = h =>
  Text(h, {
    type: 'body',
    display: 'block',
    children: [
      'Design tokens are ',
      Text(h, { type: 'code', children: ['themeable'] }),
      ' and shared across every surface.',
    ],
  })

const viewTypes: DocsExampleImplementation['view'] = h =>
  h.div.class('text-docs-column').children(
    types.map((row, index) =>
      h.div.children(
        Text(h, {
          type: 'supporting',
          color: 'secondary',
          children: [typeLabels[index] ?? ''],
        }),
        textRow(h, { ...row, display: 'block' }),
      ),
    ),
  )

const viewTruncation: DocsExampleImplementation['view'] = h =>
  h.div.class('text-docs-column text-docs-constrain-75').children(
    truncation.map(row =>
      h.div.children(
        Text(h, {
          type: 'supporting',
          color: 'secondary',
          display: 'block',
          children: [row.content],
        }),
        h.div.class('text-docs-box').children(
          Text(h, {
            type: 'body',
            ...(row.maxLines === undefined ? {} : { maxLines: row.maxLines }),
            children: [LONG_TEXT],
          }),
        ),
      ),
    ),
  )

const viewWordBreak: DocsExampleImplementation['view'] = h =>
  h.div.class('text-docs-column text-docs-constrain-100').children(
    boxed(
      h,
      'Break-word (default for multi-line)',
      Text(h, {
        type: 'body',
        maxLines: 2,
        wordBreak: 'break-word',
        children: [
          'This is a verylongunbreakableword for a break-word example',
        ],
      }),
    ),
    boxed(
      h,
      'Break-all (default for single-line)',
      Text(h, {
        type: 'body',
        maxLines: 2,
        wordBreak: 'break-all',
        children: ['Breaks anywhere: abcdefghijklmnopqrstuvwxyz0123456789'],
      }),
    ),
  )

const viewWrap: DocsExampleImplementation['view'] = h =>
  h.div
    .class('text-docs-column text-docs-constrain-100')
    .children(
      wrapBoxes.map(([label, wrap, content, clipped]) =>
        boxed(
          h,
          label,
          Text(h, { type: 'body', textWrap: wrap, children: [content] }),
          clipped,
        ),
      ),
    )

const textSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Heading, Text } from '@/ui/effect/ui'
import './text.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Text } from '@/ui/effect/ui'

Text(h, { type: 'body', children: ['Body text'] })`,
  examples: [
    {
      title: 'Text',
      view: simpleColumn(showcase, true),
      source: textSource(`h.div.class('text-docs-column-tight').children(
  Text(h, { type: 'body', children: ['Body: The bulk of content'] }),
  Text(h, { type: 'large', children: ['Large: Emphasized content'] }),
)`),
    },
    {
      title: 'Text — Colors',
      view: simpleColumn(colors),
      source: textSource(`h.div.class('text-docs-column').children(
  Text(h, { type: 'body', color: 'primary', children: ['Primary — Default for headings and body text'] }),
  Text(h, { type: 'body', color: 'secondary', children: ['Secondary — Supporting details and metadata'] }),
)`),
    },
    {
      title: 'Text — Heading Levels',
      view: viewHeadingLevels,
      source: textSource(`h.div.class('text-docs-column').children(
  [1, 2, 3, 4, 5, 6].map(level => Heading(h, { level, children: [\`Heading \${level}\`] })),
)`),
    },
    {
      title: 'Text — Inline',
      view: viewInline,
      source: textSource(`Text(h, {
  type: 'body',
  display: 'block',
  children: [
    'Design tokens are ',
    Text(h, { type: 'code', children: ['themeable'] }),
    ' and shared across every surface.',
  ],
})`),
    },
    {
      title: 'Text — Types',
      view: viewTypes,
      source: textSource(`h.div.class('text-docs-column').children(
  Text(h, { type: 'body', display: 'block', children: ['Body text for paragraphs and general content'] }),
  Text(h, { type: 'large', display: 'block', children: ['Large text for introductions and callouts'] }),
)`),
    },
    {
      title: 'Text — Weight',
      view: simpleColumn(weights),
      source: textSource(`h.div.class('text-docs-column').children(
  Text(h, { type: 'body', weight: 'normal', display: 'block', children: ['Normal'] }),
  Text(h, { type: 'body', weight: 'medium', display: 'block', children: ['Medium'] }),
)`),
    },
    {
      title: 'Text — Truncation',
      view: viewTruncation,
      source:
        textSource(`h.div.class('text-docs-column text-docs-constrain-75').children(
  h.div.class('text-docs-box').children(
    Text(h, { type: 'body', maxLines: 1, children: [LONG_TEXT] }),
  ),
)`),
    },
    {
      title: 'Text — Word Break',
      view: viewWordBreak,
      source:
        textSource(`h.div.class('text-docs-column text-docs-constrain-100').children(
  Text(h, { type: 'body', maxLines: 2, wordBreak: 'break-word', children: ['This is a verylongunbreakableword for a break-word example'] }),
)`),
    },
    {
      title: 'Text — Wrap',
      view: viewWrap,
      source:
        textSource(`h.div.class('text-docs-column text-docs-constrain-100').children(
  Text(h, { type: 'body', textWrap: 'balance', children: ['This text is balanced for better visual appearance across lines.'] }),
)`),
    },
  ],
})
