import type { Html } from '@effect/ui/html'

import { Card, Grid, GridSpan, ResizableGroup, Stat } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const stats = [
  { label: 'Components', value: '54 available' },
  { label: 'Templates', value: '28 available' },
  { label: 'Tokens', value: '120 defined' },
  { label: 'Themes', value: '6 published' },
  { label: 'Icons', value: '312 available' },
  { label: 'Patterns', value: '18 documented' },
  { label: 'Contributors', value: '42 active' },
]
const teams = [
  { name: 'Design Systems', members: 8 },
  { name: 'Frontend Platform', members: 12 },
  { name: 'Developer Experience', members: 6 },
  { name: 'Accessibility', members: 4 },
  { name: 'Performance', members: 7 },
  { name: 'Mobile Infrastructure', members: 9 },
]
const metrics = [
  { label: 'Revenue', value: '$48,290' },
  { label: 'Active Users', value: '12,841' },
  { label: 'Conversion', value: '3.2%' },
  { label: 'Avg Response', value: '245ms' },
]
const metricCards = [
  {
    label: 'Monthly recurring revenue',
    value: '$1,284,930',
    delta: { value: '+12.4%', direction: 'up' as const },
    description: 'vs. previous 30 days, net of refunds',
  },
  {
    label: 'Checkout error rate',
    value: '0.42%',
    delta: {
      value: '-0.08%',
      direction: 'down' as const,
      sentiment: 'positive' as const,
    },
    description: 'vs. previous 30 days',
  },
  {
    label: 'Weekly active workspaces',
    value: '18,204',
    delta: { value: '0.0%', direction: 'flat' as const },
    description: 'unchanged since last week',
  },
]
const galleryCards = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of the platform.',
  },
  { title: 'Components', description: 'Browse the full component library.' },
  { title: 'Design Tokens', description: 'Colors, spacing, and typography.' },
  { title: 'Theming', description: 'Customize the look and feel.' },
  { title: 'Accessibility', description: 'Build inclusive experiences.' },
  { title: 'Patterns', description: 'Common UI composition patterns.' },
]

const label = (h: Html.H<any>, text: string) =>
  h.p.class('text-sm font-medium').children(text)
const supporting = (h: Html.H<any>, text: string) =>
  h.p.class('text-xs').children(text)
const body = (h: Html.H<any>, text: string) =>
  h.p.class('text-sm text-muted-foreground').children(text)
const card = (h: Html.H<any>, children: unknown, className?: string) =>
  Card(h, {
    size: 'sm',
    ...(className === undefined ? {} : { className }),
    children: cardParts => [cardParts.content({ children: children as never })],
  })
const tallCard = (h: Html.H<any>, children: unknown) =>
  card(h, children, 'h-20')
const cyanCard = (h: Html.H<any>, children: unknown) =>
  card(
    h,
    children,
    'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/40',
  )
const stack = (h: Html.H<any>, children: readonly unknown[]) =>
  h.div.class('grid gap-1').children(children as never)

const showcase = (h: Html.H<any>) =>
  Grid(h, {
    columns: 3,
    gap: 2,
    width: 400,
    children: Array.from({ length: 12 }, (_, index) =>
      card(h, `Item ${index + 1}`),
    ),
  })
const spanning = (h: Html.H<any>) =>
  Grid(h, {
    columns: 3,
    gap: 4,
    width: '100%',
    maxWidth: 500,
    children: [
      GridSpan(h, {
        rows: 2,
        children: [
          cyanCard(
            h,
            stack(h, [
              label(h, 'Featured Release'),
              supporting(
                h,
                'CreaseUI is now available with new layout primitives, refreshed tokens, and improved theming support across the system.',
              ),
            ]),
          ),
        ],
      }),
      ...stats.map(stat =>
        card(h, [label(h, stat.label), supporting(h, stat.value)]),
      ),
      GridSpan(h, {
        columns: 'full',
        children: [
          cyanCard(
            h,
            stack(h, [
              label(h, 'Community Showcase'),
              supporting(
                h,
                'See how teams are building with CreaseUI across the organization',
              ),
            ]),
          ),
        ],
      }),
    ],
  })
const autoFit = (h: Html.H<any>, key: string) =>
  Card(h, {
    className:
      'h-[400px] w-full max-w-[500px] gap-0 overflow-hidden bg-muted p-0',
    children: [
      ResizableGroup(h, {
        key,
        id: key,
        orientation: 'horizontal',
        withHandle: true,
        label: 'Resize grid',
        className: 'h-full w-full border-0',
        props: { defaultSizes: [90.6, 9.4], minSize: 20 },
        panels: [
          {
            key: 'grid',
            label: 'Grid panel',
            content: h.div.class('h-full overflow-auto p-4').children(
              Grid(h, {
                columns: { minWidth: 180, repeat: 'fit' },
                gap: 4,
                width: '100%',
                children: teams.map(team =>
                  card(
                    h,
                    stack(h, [
                      label(h, team.name),
                      supporting(h, `${team.members} members`),
                    ]),
                  ),
                ),
              }),
            ),
          },
          {
            key: 'empty',
            label: 'Empty panel',
            content: h.div.class('h-full'),
          },
        ],
      }),
    ],
  })
const dashboard = (h: Html.H<any>) =>
  Grid(h, {
    columns: 4,
    gap: 4,
    width: '100%',
    maxWidth: 500,
    children: [
      GridSpan(h, {
        columns: 2,
        rows: 2,
        children: [
          card(h, [
            label(h, 'Weekly Traffic'),
            supporting(
              h,
              'Page views and unique visitors over the last 7 days',
            ),
          ]),
        ],
      }),
      ...metrics.map(metric =>
        card(h, [supporting(h, metric.label), label(h, metric.value)]),
      ),
      GridSpan(h, {
        columns: 'full',
        children: [
          card(h, [
            label(h, 'Recent Activity'),
            supporting(h, 'Latest events across all projects'),
          ]),
        ],
      }),
    ],
  })
const gallery = (h: Html.H<any>) =>
  Grid(h, {
    columns: { minWidth: 180 },
    gap: 5,
    width: '100%',
    maxWidth: 400,
    children: galleryCards.map(item =>
      card(
        h,
        stack(h, [label(h, item.title), supporting(h, item.description)]),
      ),
    ),
  })
const spanColumns = (h: Html.H<any>) =>
  Grid(h, {
    columns: 3,
    gap: 3,
    width: 400,
    children: [
      GridSpan(h, {
        columns: 2,
        children: [tallCard(h, body(h, 'Spans 2 columns'))],
      }),
      tallCard(h, body(h, '1 col')),
      tallCard(h, body(h, '1 col')),
      GridSpan(h, {
        columns: 2,
        children: [tallCard(h, body(h, 'Spans 2 columns'))],
      }),
    ],
  })
const spanShowcase = (h: Html.H<any>) =>
  Grid(h, {
    columns: 4,
    gap: 3,
    width: 400,
    children: [
      GridSpan(h, {
        columns: 3,
        children: [tallCard(h, body(h, 'Spans 3 columns'))],
      }),
      tallCard(h, body(h, '1 col')),
      GridSpan(h, { rows: 2, children: [card(h, body(h, '1 col'))] }),
      GridSpan(h, {
        columns: 3,
        children: [tallCard(h, body(h, 'Full-width row'))],
      }),
      tallCard(h, body(h, '1 col')),
      GridSpan(h, {
        columns: 2,
        children: [tallCard(h, body(h, 'Spans 2 columns'))],
      }),
    ],
  })
const metricsView = (h: Html.H<any>) =>
  Grid(h, {
    columns: { minWidth: 240, max: 3, repeat: 'fit' },
    gap: 4,
    width: '100%',
    children: metricCards.map(metric => card(h, Stat(h, metric))),
  })

const spatialPositions = {
  A: { left: '2%', top: '16px', width: '30%', height: '112px' },
  B: { left: '67%', top: '208px', width: '31%', height: '112px' },
  D: { left: '37%', top: '48px', width: '25%', height: '96px' },
  C: { left: '65%', top: '32px', width: '33%', height: '96px' },
  E: { left: '5%', top: '224px', width: '40%', height: '96px' },
} as const
const spatial = (h: Html.H<any>) =>
  Grid(h, {
    columns: 1,
    gap: 4,
    width: '100%',
    maxWidth: 560,
    children: [
      h.p
        .class('text-sm leading-6 text-muted-foreground')
        .children(
          'Tab into the board. Arrows follow the layout; Home and End follow document order. Ctrl + arrows are left alone.',
        ),
      h.div
        .style({ position: 'relative', height: '336px', width: '100%' })
        .children(
          (['A', 'B', 'D', 'C', 'E'] as const).map((key, index) =>
            h.button
              .key(key)
              .class(
                'rounded-xl text-left outline-none focus-visible:outline-solid focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
              )
              .attrs({ type: 'button', 'aria-label': `Card ${key}` })
              .disabled(key === 'D')
              .style({ position: 'absolute', ...spatialPositions[key] })
              .children(
                card(
                  h,
                  [
                    h.span
                      .class('block text-sm font-semibold')
                      .children(`Card ${key}`),
                    h.span
                      .class('mt-2 block text-xs text-muted-foreground')
                      .children(
                        key === 'D'
                          ? 'Unavailable'
                          : `Document position ${index + 1}`,
                      ),
                  ],
                  'h-full',
                ),
              ),
          ),
        ),
      h.p
        .class('text-sm leading-6 text-muted-foreground')
        .children(
          'Document order: A → B → D → C → E. Right from A goes to C, skipping unavailable D.',
        ),
    ],
  })
const lasso = (h: Html.H<any>) =>
  h.div
    .class('docs-lasso-demo')
    .style({ width: 'min(100%, 420px)', fontSize: '0.875rem' })
    .children(
      h.p
        .style({ margin: '0.75rem 0' })
        .children(
          'Drag from the space between tiles to select. Shift adds; Escape cancels.',
        ),
      h.div
        .style({
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          touchAction: 'none',
          userSelect: 'none',
        })
        .children(
          Array.from({ length: 12 }, (_, index) =>
            h.div
              .key(String(index + 1))
              .style({
                display: 'grid',
                placeItems: 'center',
                height: '56px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--muted)',
                color: 'var(--foreground)',
              })
              .children(`Tile ${index + 1}`),
          ),
        ),
      h.p
        .attr('aria-live', 'polite')
        .style({ margin: '0.75rem 0' })
        .children('No tiles selected'),
    )

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h, context) => {
    const only =
      typeof window === 'undefined'
        ? null
        : new URLSearchParams(window.location.search).get('only')
    if (only !== null && only !== kind)
      return h.div.children('filtered') as never
    const key = `${context.idPrefix}-${kind}`
    const anyH = h as Html.H<any>
    if (kind === 'showcase') return showcase(anyH) as never
    if (kind === 'spanning') return spanning(anyH) as never
    if (kind === 'autoFit') return autoFit(anyH, key) as never
    if (kind === 'dashboard') return dashboard(anyH) as never
    if (kind === 'gallery') return gallery(anyH) as never
    if (kind === 'spanColumns') return spanColumns(anyH) as never
    if (kind === 'spanShowcase') return spanShowcase(anyH) as never
    if (kind === 'spatialFocus') return spatial(anyH) as never
    if (kind === 'lasso') return lasso(anyH) as never
    return metricsView(anyH) as never
  }

const source = exampleApplicationSource({
  imports: `import { Card, Grid, GridSpan } from '@/ui/effect/ui'`,
  body: `Grid(h, {
  columns: 3,
  gap: 2,
  width: 400,
  children: items.map(item =>
    Card(h, { size: 'sm', children: card => [card.content({ children: [item] })] }),
  ),
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Grid, GridSpan } from '@/ui/effect/ui'\n\nGrid(h, { columns, gap, children })`,
  examples: [
    { title: 'Grid', view: view('showcase'), source },
    { title: 'Grid — Column Spanning', view: view('spanning'), source },
    { title: 'Grid — Responsive Auto-Fit', view: view('autoFit'), source },
    { title: 'Grid — Dashboard Layout', view: view('dashboard'), source },
    { title: 'Grid — Card Gallery', view: view('gallery'), source },
    { title: 'GridSpan — Columns', view: view('spanColumns'), source },
    { title: 'Grid Span', view: view('spanShowcase'), source },
    { title: 'Grid — Spatial Focus', view: view('spatialFocus'), source },
    { title: 'Grid — Lasso Selection', view: view('lasso'), source },
    { title: 'Grid — Adaptive Metric Cards', view: view('metrics'), source },
  ],
})
