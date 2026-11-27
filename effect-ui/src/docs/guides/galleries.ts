import type { DocsGuide } from '../types'
import { section } from './setup'

const chartGroups = [
  [
    'area',
    'Area Charts',
    [
      'Default',
      'Linear',
      'Step',
      'Stacked',
      'Stacked Expanded',
      'Legend',
      'Icons',
      'Axes',
      'Gradient',
      'Interactive',
    ],
  ],
  [
    'bar',
    'Bar Charts',
    [
      'Default',
      'Horizontal',
      'Multiple',
      'Stacked',
      'Label',
      'Custom Label',
      'Mixed',
      'Negative',
      'Active',
      'Interactive',
    ],
  ],
  [
    'line',
    'Line Charts',
    [
      'Default',
      'Linear',
      'Step',
      'Multiple',
      'Dots',
      'Dots Colors',
      'Custom Dots',
      'Label',
      'Custom Label',
      'Interactive',
    ],
  ],
  [
    'pie',
    'Pie Charts',
    [
      'Simple',
      'Donut',
      'Donut Active',
      'Donut Text',
      'Label',
      'Custom Label',
      'Label List',
      'Legend',
      'Stacked',
      'No Separator',
      'Interactive',
    ],
  ],
  [
    'radar',
    'Radar Charts',
    [
      'Default',
      'Dots',
      'Lines Only',
      'Multiple',
      'Legend',
      'Icons',
      'Grid Circle',
      'Grid Circle Fill',
      'Grid Circle No Lines',
      'Grid Fill',
      'Grid Custom',
      'Grid None',
      'Custom Label',
      'Radius',
    ],
  ],
  [
    'radial',
    'Radial Charts',
    ['Simple', 'Grid', 'Label', 'Shape', 'Stacked', 'Text'],
  ],
  [
    'tooltip',
    'Chart Tooltips',
    [
      'Default',
      'Advanced',
      'Formatter',
      'Icons',
      'Line Indicator',
      'No Indicator',
      'Custom Label',
      'Label Formatter',
      'No Label',
    ],
  ],
] as const
const sparkline = (h: any, kind: string) =>
  h.div
    .class('flex h-28 items-end gap-1 rounded-md border bg-muted/30 p-3')
    .children(
      Array.from({ length: 12 }, (_, index) =>
        h.div
          .key(String(index))
          .class(
            kind === 'line' || kind === 'area'
              ? 'w-full rounded-full bg-chart-1/70'
              : 'w-full rounded-t-sm bg-chart-1/80',
          )
          .style({
            height: `${String(22 + ((index * 17 + kind.length * 9) % 58))}%`,
          }),
      ),
    )
const chartIndex: DocsGuide = {
  title: 'Charts',
  description: 'Chart examples built with the CreaseUI chart components.',
  view: h =>
    h.div.children(
      ...chartGroups.map(([slug, title, examples]) =>
        section(
          h,
          slug,
          title,
          h.a
            .class('docs-inline-link')
            .attr('href', `/charts/${slug}`)
            .children(`Open ${title}`),
          h.p
            .class('docs-muted')
            .children(`${String(examples.length)} examples`),
        ),
      ),
    ),
}
const chartDetail = (
  slug: string,
  title: string,
  examples: readonly string[],
): DocsGuide => ({
  title,
  description: `${title} gallery`,
  view: h =>
    h.div.children(
      h.nav
        .class('docs-breadcrumb')
        .attr('aria-label', 'Breadcrumb')
        .children(
          h.a.attr('href', '/charts').children('Charts'),
          h.span.attr('aria-hidden', 'true').children('/'),
          h.span.attr('aria-current', 'page').children(title),
        ),
      h.div.class('grid gap-6 md:grid-cols-2').children(
        examples.map((example, index) =>
          h.article
            .key(example)
            .class('rounded-xl border bg-card shadow-xs')
            .children(
              h.header
                .class('border-b p-4')
                .children(
                  h.h3.class('font-medium').children(example),
                  h.p
                    .class('text-sm text-muted-foreground')
                    .children(`${title} example ${String(index + 1)}`),
                ),
              h.div.class('p-4').children(sparkline(h, slug) as never),
            ),
        ),
      ),
      h.div
        .class('docs-pending')
        .children(
          h.p.children(
            'Interactive ECharts parity for the full gallery is pending; the Effect UI chart examples are available on the Chart component page.',
          ),
        ),
    ),
})
const blocks = [
  ['dashboard-01', 'A dashboard with sidebar, charts and a document table.'],
  [
    'creaseui-executive-summary',
    'An executive scorecard with objectives, trends and insights.',
  ],
  [
    'creaseui-cohort-funnel',
    'An acquisition funnel with conversion trends and cohort retention.',
  ],
  [
    'creaseui-project-status',
    'Project milestones, progress, workstreams and risks.',
  ],
  [
    'creaseui-service-monitoring',
    'Service health, traffic metrics and active alerts.',
  ],
  [
    'creaseui-incident-console',
    'An incident table with a dedicated inspector panel.',
  ],
  [
    'creaseui-kanban-board',
    'Four status lanes of task cards under a shared sprint toolbar.',
  ],
  [
    'creaseui-inbox-table',
    'A mail queue that indexes a reading pane with a live reply composer.',
  ],
  [
    'creaseui-order-detail',
    'A single record with line items, totals and an activity rail.',
  ],
  [
    'creaseui-checkout-form',
    'A sectioned checkout form beside an order summary that recalculates.',
  ],
  [
    'creaseui-data-dashboard',
    'Sparkline tiles with period-over-period deltas and segment breakdowns.',
  ],
  [
    'creaseui-card-grid',
    'A browsable catalog grid with search, filter tabs and a real empty state.',
  ],
  [
    'tablecn',
    "sadmann7/tablecn's data table with a diceui-style action bar for row multi-select.",
  ],
  ['tablecn-grid', "sadmann7/tablecn's editable data grid."],
  [
    'chart-analytics-dashboard',
    'An analytics dashboard with six Apache ECharts visualizations.',
  ],
  ...Array.from(
    { length: 16 },
    (_, i) =>
      [
        `sidebar-${String(i + 1).padStart(2, '0')}`,
        'A sidebar application layout.',
      ] as const,
  ),
  [
    'app-shell-01',
    'An app shell with a top navigation, sidebar and elevated content.',
  ],
  ['login-03', 'A centered login form on a muted background.'],
  ['login-04', 'A split login layout with a form and image panel.'],
] as const

const createGuide: DocsGuide = {
  title: 'Create',
  description: 'Create a new Effect UI project with CreaseUI.',
  view: h =>
    h.div.children(
      section(
        h,
        'create-project',
        'Create project',
        h.p.children(
          'Install the components and renderer source into an Effect UI application with the shadcn CLI.',
        ),
        h.pre.children(
          h.code.children(
            'npx shadcn@latest add @crease-effect/effect-button\nnpx creaseui-lint init',
          ),
        ),
      ),
    ),
}
const blocksGuide: DocsGuide = {
  title: 'Blocks',
  description: 'Building Blocks for Effect UI',
  view: h =>
    h.div.children(
      h.div.class('grid gap-4 md:grid-cols-2 xl:grid-cols-3').children(
        blocks.map(([name, description]) =>
          h.article
            .key(name)
            .class('overflow-hidden rounded-xl border bg-card shadow-xs')
            .children(
              h.div
                .class(
                  'flex h-32 items-center justify-center border-b bg-muted/40',
                )
                .children(
                  h.div
                    .class('grid w-4/5 grid-cols-3 gap-2')
                    .children(
                      h.div.class('h-16 rounded-md border bg-background'),
                      h.div
                        .class('col-span-2 grid gap-2')
                        .children(
                          h.div.class('h-7 rounded-md border bg-background'),
                          h.div.class('h-7 rounded-md border bg-background'),
                        ),
                    ),
                ),
              h.div
                .class('p-4')
                .children(
                  h.h3.class('font-mono text-sm font-medium').children(name),
                  h.p
                    .class('mt-1 text-sm text-muted-foreground')
                    .children(description),
                ),
            ),
        ),
      ),
      h.div
        .class('docs-pending')
        .children(
          h.p.children(
            'Live block preview pages and copyable per-renderer block source are pending migration.',
          ),
        ),
    ),
}
export const galleryGuides: Readonly<Record<string, DocsGuide>> = {
  '/create': createGuide,
  '/charts': chartIndex,
  ...Object.fromEntries(
    chartGroups.map(([slug, title, examples]) => [
      `/charts/${slug}`,
      chartDetail(slug, title, examples),
    ]),
  ),
  '/blocks': blocksGuide,
}
