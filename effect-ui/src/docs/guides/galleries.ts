import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { EChart } from '#components'
import { registerChart } from '../../behaviors/chart'
import { familyOption, type ChartFamilyKind } from '../pages/chart-echarts'
import { DocsMessage, type DocsGuide } from '../types'
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
    'Tooltip',
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
const galleryKind = (slug: string): ChartFamilyKind =>
  slug === 'tooltip' ? 'bar' : (slug as ChartFamilyKind)
const galleryHostId = (slug: string, example: string) =>
  `gallery-${slug}-${example.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
const customizeGalleryOption = (option: any, slug: string, example: string) => {
  const series = Array.isArray(option.series) ? [...option.series] : []
  const first = { ...(series[0] ?? {}) }
  if ((slug === 'area' || slug === 'line') && example === 'Linear')
    first.smooth = false
  if ((slug === 'area' || slug === 'line') && example === 'Step') {
    first.smooth = false
    first.step = 'end'
  }
  if (
    (slug === 'area' || slug === 'line' || slug === 'bar') &&
    (example.includes('Stacked') ||
      example === 'Multiple' ||
      example === 'Mixed')
  ) {
    const second = {
      ...first,
      data: [80, 200, 120, 190, 130, 140],
      name: 'Mobile',
    }
    if (example.includes('Stacked')) {
      first.stack = 'total'
      second.stack = 'total'
    }
    series.splice(1, 0, second)
  }
  if (slug === 'bar' && example === 'Horizontal') {
    const xAxis = option.xAxis
    option.xAxis = { ...option.yAxis, type: 'value' }
    option.yAxis = { ...xAxis, type: 'category' }
  }
  if (slug === 'bar' && example === 'Negative')
    first.data = [186, -120, 237, -90, 209, -140]
  if (slug === 'pie' && example === 'Simple') first.radius = '70%'
  if (slug === 'radar' && example === 'Lines Only') delete first.areaStyle
  series[0] = first
  option.series = series
  if (example.includes('Legend')) option.legend = { bottom: 0 }
  return option
}

for (const [slug, , examples] of chartGroups) {
  for (const example of examples) {
    registerChart(galleryHostId(slug, example), theme =>
      customizeGalleryOption(
        familyOption(galleryKind(slug), theme),
        slug,
        example,
      ),
    )
  }
}
const galleryChart = (h: any, slug: string, example: string) =>
  EChart(h, {
    hostId: galleryHostId(slug, example),
    ariaLabel: `${example} chart`,
    accessibleAlternative: h.p.children(`${example} chart data.`),
    toMessage: () => DocsMessage.ChartEvent(),
    className: 'w-full',
  }) as never

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
const singularChartTitle = (title: string) =>
  title === 'Chart Tooltips'
    ? 'Chart Tooltip'
    : title.replace(/ Charts$/, ' Chart')
const chartDescription = (slug: string) => {
  if (slug === 'area' || slug === 'line')
    return 'Showing total visitors for the last 6 months'
  if (slug === 'pie') return 'Total visitors by browser'
  if (slug === 'radar') return 'Performance across five dimensions'
  if (slug === 'radial') return 'Visitors by acquisition source'
  return 'January - June 2024'
}
const chartExampleTitle = (title: string, example: string) => {
  const base = singularChartTitle(title)
  return example === 'Default' || example === 'Simple'
    ? base
    : `${base} - ${example}`
}
const chartDetail = (
  slug: string,
  title: string,
  examples: readonly string[],
): DocsGuide => ({
  title,
  description: `${title} gallery`,
  view: h =>
    h.div.class('chart-gallery').children(
      h.header
        .class('chart-gallery-header')
        .children(
          h.h1.children('Beautiful Charts & Graphs'),
          h.p.children(
            'A collection of ready-to-use chart components built with Apache ECharts and Effect UI, styled with CreaseUI. From basic charts to rich data displays.',
          ),
        ),
      h.nav
        .class('chart-gallery-tabs')
        .attr('aria-label', 'Chart types')
        .children(
          chartGroups.map(([value, label]) =>
            h.a
              .attrs({
                href: `/charts/${value}`,
                'aria-current': value === slug ? 'page' : undefined,
              })
              .children(label),
          ),
        ),
      h.div.class('chart-gallery-grid').children(
        examples.map((example, index) =>
          h.article
            .key(example)
            .class('chart-gallery-card')
            .children(
              h.header.children(
                h.h3.children(chartExampleTitle(title, example)),
                h.p.children(chartDescription(slug)),
              ),
              h.div
                .class('chart-gallery-chart')
                .children(galleryChart(h, slug, example)),
              h.footer.children(
                h.p
                  .class('chart-trend')
                  .children('Trending up by 5.2% this month ↗'),
                h.p.children('January - June 2024'),
              ),
            ),
        ),
      ),
      h.p
        .class('chart-gallery-note')
        .children(
          'Live Apache ECharts instances are mounted. Per-variant option details and advanced interactive controls are still being aligned with the Foldkit gallery.',
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

const createPlaceholder = (
  h: Html.H<DocsMessage>,
  title: string,
  tone: 'compact' | 'regular' | 'large' = 'regular',
  lines = 3,
) =>
  h.section
    .key(title)
    .class(`create-card create-placeholder ${tone}`)
    .children(
      h.div
        .class('create-placeholder-head')
        .children(
          h.h2.children(title),
          h.span.class('create-placeholder-icon').children('⋯'),
        ),
      h.div
        .class('create-placeholder-body')
        .children(
          Array.from({ length: lines }, (_, index) =>
            h.span
              .key(String(index))
              .class(
                index === 0 ? 'strong' : index === lines - 1 ? 'short' : '',
              ),
          ),
        ),
      h.div.class('create-placeholder-actions').children(h.span, h.span),
    )

const createColumn = (
  h: Html.H<DocsMessage>,
  key: string,
  ...cards: View.Input<DocsMessage>[]
) =>
  h.div
    .key(key)
    .class('create-column')
    .children(...cards)

const createGuide: DocsGuide = {
  title: 'Create',
  description: 'Create a new Effect UI project with CreaseUI.',
  view: h =>
    h.div.class('create-shell').children(
      h.aside.class('create-panel').children(
        h.div
          .class('create-panel-title')
          .children('Theme', h.span.children('☰')),
        h.nav
          .class('create-tabs')
          .children(
            h.span.attr('aria-current', 'page').children('Tokens'),
            h.span.children('Themes'),
            h.span.children('Color'),
            h.span.children('Shape'),
            h.span.children('Type'),
            h.span.children('Motion'),
          ),
        h.div
          .class('create-mode')
          .children(
            h.span.attr('aria-current', 'page').children('Light'),
            h.span.children('Dark'),
          ),
        ...[
          'primary',
          'primary-foreground',
          'secondary',
          'secondary-foreground',
        ].map(token =>
          h.div
            .key(token)
            .class('create-token')
            .children(
              h.span.class('create-token-swatch'),
              h.div.children(
                h.strong.children(token),
                h.code.children('oklch(0.205 0 0)'),
              ),
            ),
        ),
        h.button.attrs({ type: 'button' }).children('Open Preset'),
        h.div
          .class('create-panel-actions')
          .children(
            h.button.attrs({ type: 'button' }).children('Shuffle'),
            h.button.attrs({ type: 'button' }).children('Reset'),
          ),
        h.button
          .class('create-copy')
          .attrs({ type: 'button' })
          .children('Copy Registry JSON'),
      ),
      h.main.class('create-preview').children(
        h.div
          .class('create-toolbar')
          .children(
            h.nav
              .attr('aria-label', 'Theme tools')
              .children(
                h.span.attr('aria-current', 'page').children('Board'),
                h.span.children('Blocks'),
                h.span.children('Type'),
                h.span.children('Palette'),
              ),
            h.div
              .class('create-scheme')
              .children(
                h.span.attr('aria-current', 'page').children('Auto'),
                h.span.children('Light'),
                h.span.children('Dark'),
              ),
          ),
        createColumn(
          h,
          'activity',
          h.section
            .class('create-card contribution')
            .children(
              h.h2.children('Contribution History'),
              h.p.children('Last 6 months of activity'),
              h.div
                .class('contribution-bars')
                .children(
                  [42, 68, 48, 82, 52, 90].map(height =>
                    h.span
                      .key(String(height))
                      .style({ height: `${String(height)}%` }),
                  ),
                ),
              h.div
                .class('contribution-months')
                .children(
                  ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(month =>
                    h.span.key(month).children(month),
                  ),
                ),
              h.div
                .class('create-card-row')
                .children(
                  h.div.children(
                    h.small.children('UPCOMING'),
                    h.strong.children('May 25, 2024'),
                    h.p.children('$1,000 scheduled'),
                  ),
                  h.div.children(
                    h.small.children('AUTO-SAVE PLAN'),
                    h.strong.children('Accelerated'),
                    h.p.children('Recurring weekly'),
                  ),
                ),
              h.button.attrs({ type: 'button' }).children('View Full Report'),
            ),
          h.section
            .class('create-card distribute')
            .children(
              h.div.class('create-plus').children('+'),
              h.h2.children('Distribute Track'),
              h.p.children(
                'Upload your first master to start reaching listeners on streaming platforms.',
              ),
              h.button.attrs({ type: 'button' }).children('Upload'),
            ),
          createPlaceholder(h, 'QR Connect', 'regular', 3),
          createPlaceholder(h, 'Dividend Income', 'regular', 4),
          createPlaceholder(h, 'Index Investing', 'regular', 4),
          createPlaceholder(h, 'Syncing State', 'compact', 2),
        ),
        createColumn(
          h,
          'payouts',
          h.section
            .class('create-card payout')
            .children(
              h.h2.children('Payout Threshold'),
              h.p.children(
                'Set the minimum balance required before a payout is triggered.',
              ),
              h.label.children('Preferred Currency'),
              h.div
                .class('create-input')
                .children('USD — United States Dollar ⌄'),
              h.div
                .class('create-card-row')
                .children(
                  h.label.children('Minimum Payout Amount'),
                  h.div.class('create-amount').children('$2500.00'),
                ),
              h.div.class('create-slider').children(h.span),
              h.div
                .class('create-card-row create-slider-labels')
                .children(
                  h.span.children('$50 (MIN)'),
                  h.span.children('$10,000 (MAX)'),
                ),
              h.label.children('Notes'),
              h.div
                .class('create-notes')
                .children('Add any notes for this payout configuration…'),
              h.button.attrs({ type: 'button' }).children('Save Threshold'),
            ),
          h.section
            .class('create-card balance')
            .children(
              h.p.children('Claimable Balance'),
              h.strong.children('$0.00'),
              h.span.class('create-status').children('● Pending Setup'),
              h.div
                .class('create-card-row')
                .children(
                  h.span.children('Net Royalties'),
                  h.span.children('$0.00'),
                ),
              h.div
                .class('create-card-row')
                .children(
                  h.span.children('Processing Fee'),
                  h.span.children('-$0.00'),
                ),
            ),
          createPlaceholder(h, 'Preferences', 'regular', 4),
          createPlaceholder(h, 'Savings Progress', 'regular', 3),
          createPlaceholder(h, 'Kitchen Island', 'regular', 5),
        ),
        h.div
          .key('planning')
          .class('create-column wide')
          .children(
            createPlaceholder(h, 'Savings Targets', 'large', 5),
            createPlaceholder(h, 'Recent Transactions', 'large', 6),
            h.div
              .class('create-nested-grid')
              .children(
                h.div
                  .class('create-nested-column')
                  .children(
                    createPlaceholder(h, 'Sidebar Nav', 'regular', 5),
                    createPlaceholder(h, 'FAQ', 'regular', 4),
                  ),
                h.div
                  .class('create-nested-column')
                  .children(
                    createPlaceholder(h, 'Payments', 'regular', 4),
                    createPlaceholder(h, 'Front Door', 'regular', 3),
                  ),
              ),
            createPlaceholder(h, 'Release Catalog', 'large', 4),
          ),
        createColumn(
          h,
          'account',
          createPlaceholder(h, 'Account Access', 'regular', 4),
          createPlaceholder(h, 'Card Overview', 'regular', 5),
          createPlaceholder(h, 'Transfer Funds', 'regular', 5),
          createPlaceholder(h, 'Cover Art', 'compact', 3),
          createPlaceholder(h, 'Loading Card', 'compact', 3),
        ),
        createColumn(
          h,
          'utilities',
          createPlaceholder(h, 'Receiving Method', 'regular', 4),
          createPlaceholder(h, 'Power Usage', 'regular', 4),
          createPlaceholder(h, 'Connect Bank', 'regular', 3),
          createPlaceholder(h, 'Upcoming Payments', 'regular', 4),
          createPlaceholder(h, 'Roller Shades', 'regular', 5),
        ),
      ),
    ),
}
const blocksGuide: DocsGuide = {
  title: 'Blocks',
  description: 'Building Blocks for Effect UI',
  view: h =>
    h.div.class('blocks-gallery').children(
      h.header
        .class('blocks-header')
        .children(
          h.h1.children('Building Blocks for Effect UI'),
          h.p.children(
            'Complete sidebars, dashboards and login layouts. Explore the same blocks across renderers, with live previews you can open full screen.',
          ),
        ),
      h.div
        .class('blocks-toolbar')
        .children(
          h.nav
            .attr('aria-label', 'Block categories')
            .children(
              h.a.attr('aria-current', 'page').children('All blocks'),
              h.a.children('Dashboards'),
              h.a.children('Sidebars'),
              h.a.children('Authentication'),
              h.a.children('Tables'),
            ),
          h.a.class('blocks-playground').children('Table playground ↗'),
        ),
      h.p
        .class('blocks-count')
        .children(`${String(blocks.length)} blocks · Tailwind`),
      h.div.class('blocks-list').children(
        blocks.map(([name, description]) =>
          h.article
            .key(name)
            .class('block-row')
            .children(
              h.header
                .class('block-row-header')
                .children(
                  h.div.children(
                    h.h2.children(name),
                    h.p.children(description),
                  ),
                  h.div
                    .class('block-actions')
                    .children(
                      h.button.attrs({ type: 'button' }).children('Code'),
                      h.a.children('Open ↗'),
                    ),
                ),
              h.div
                .class('block-preview')
                .children(
                  h.div.class('block-preview-sidebar'),
                  h.div
                    .class('block-preview-main')
                    .children(
                      h.div.class('block-preview-bar'),
                      h.div
                        .class('block-preview-content')
                        .children(
                          h.div.class('block-preview-card'),
                          h.div.class('block-preview-card'),
                          h.div.class('block-preview-card wide'),
                        ),
                    ),
                ),
            ),
        ),
      ),
      h.p
        .class('chart-gallery-note')
        .children(
          'Live block iframe previews and copyable per-renderer block source are still pending migration; these rows preserve the catalog and page structure.',
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
