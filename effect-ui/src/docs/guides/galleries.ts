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
  ...(
    [
      ['01', 'A simple sidebar with navigation grouped by section.'],
      ['02', 'A sidebar with collapsible sections.'],
      ['03', 'A sidebar with submenus.'],
      ['04', 'A floating sidebar with submenus.'],
      ['05', 'A sidebar with collapsible submenus.'],
      ['06', 'A sidebar with submenus as dropdowns.'],
      ['07', 'A sidebar that collapses to icons.'],
      ['08', 'An inset sidebar with secondary navigation.'],
      ['09', 'Collapsible nested sidebars.'],
      ['10', 'A sidebar in a popover.'],
      ['11', 'A sidebar with a collapsible file tree.'],
      ['12', 'A sidebar with a calendar.'],
      ['13', 'A sidebar in a dialog.'],
      ['14', 'A sidebar on the right.'],
      ['15', 'A left and right sidebar.'],
      ['16', 'A sidebar with a sticky site header.'],
    ] as const
  ).map(([id, description]) => [`sidebar-${id}`, description] as const),
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
        h.div.class('create-token-section').children('PRIMARY'),
        ...[
          ['primary', 'oklch(0.21 0 0)', '#171717', ''],
          ['primary-foreground', 'oklch(0.985 0 0)', '#fafafa', '17.0'],
        ].map(([token, value, color, contrast]) =>
          h.div
            .key(token ?? '')
            .class('create-token')
            .children(
              h.span
                .class('create-token-swatch')
                .style({ background: color ?? '' }),
              h.div.children(
                h.strong.children(token ?? ''),
                h.code.children(value ?? ''),
              ),
              contrast === ''
                ? undefined
                : h.span.class('create-contrast').children(contrast ?? ''),
            ),
        ),
        h.div.class('create-token-section').children('SECONDARY'),
        ...[
          ['secondary', 'oklch(0.923 0 0)', '#ebebeb', ''],
          ['secondary-foreground', 'oklch(0.205 0 0)', '#343434', '14.3'],
        ].map(([token, value, color, contrast]) =>
          h.div
            .key(token ?? '')
            .class('create-token')
            .children(
              h.span
                .class('create-token-swatch')
                .style({ background: color ?? '' }),
              h.div.children(
                h.strong.children(token ?? ''),
                h.code.children(value ?? ''),
              ),
              contrast === ''
                ? undefined
                : h.span.class('create-contrast').children(contrast ?? ''),
            ),
        ),
        h.div.class('create-token-section').children('ACCENT'),
        ...[
          ['accent', 'oklch(0.923 0 0)', '#ebebeb', ''],
          ['accent-foreground', 'oklch(0.205 0 0)', '#343434', ''],
          ['muted', 'oklch(0.923 0 0)', '#ebebeb', ''],
          ['muted-foreground', 'oklch(0.556 0 0)', '#737373', ''],
        ].map(([token, value, color]) =>
          h.div
            .key(token ?? '')
            .class('create-token')
            .children(
              h.span
                .class('create-token-swatch')
                .style({ background: color ?? '' }),
              h.div.children(
                h.strong.children(token ?? ''),
                h.code.children(value ?? ''),
              ),
            ),
        ),
        h.div
          .class('create-preset-row')
          .children('--preset c4zq0t03xwdr50pnkMhUR…'),
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

const previewMetric = (
  h: Html.H<DocsMessage>,
  label: string,
  value: string,
  delta: string,
  detail: string,
) =>
  h.section
    .key(label)
    .class('preview-metric')
    .children(
      h.div.children(h.span.children(label), h.b.children(delta)),
      h.strong.children(value),
      h.p.children(detail),
      h.small.children(
        label === 'Total Revenue'
          ? 'Visitors for the last 6 months'
          : label === 'New Customers'
            ? 'Acquisition needs attention'
            : label === 'Active Accounts'
              ? 'Engagement exceed targets'
              : 'Meets growth projections',
      ),
    )

const previewSidebar = (h: Html.H<DocsMessage>, compact = false) =>
  h.aside.class('preview-sidebar', compact ? 'compact' : '').children(
    h.div.class('preview-brand').children('A', h.strong.children('Acme Inc.')),
    h.button.attrs({ type: 'button' }).children('⌘ Quick Create'),
    h.span.class('preview-nav-label').children('Platform'),
    h.nav.children(
      ...[
        ['Dashboard', '⌘'],
        ['Lifecycle', '↻'],
        ['Analytics', '◉'],
        ['Projects', '▣'],
        ['Team', '✦'],
      ].map(([item, icon], index) =>
        h.a
          .key(item ?? '')
          .attr('aria-current', index === 0 ? 'page' : undefined)
          .children(h.span.children(icon ?? ''), item ?? ''),
      ),
    ),
    h.span.class('preview-nav-label').children('Documents'),
    h.nav.class('preview-secondary').children(
      ...[
        ['Data Library', '▤'],
        ['Reports', '▥'],
        ['Word Assistant', '▧'],
      ].map(([item, icon]) =>
        h.a.key(item ?? '').children(h.span.children(icon ?? ''), item ?? ''),
      ),
    ),
    h.nav.class('preview-secondary bottom').children(
      ...[
        ['Settings', '⚙'],
        ['Get Help', '?'],
        ['Search', '⌕'],
      ].map(([item, icon]) =>
        h.a.key(item ?? '').children(h.span.children(icon ?? ''), item ?? ''),
      ),
    ),
    h.div
      .class('preview-user')
      .children(
        'sc',
        h.span.children('CreaseUI', h.small.children('m@example.com')),
      ),
  )

const dashboardPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('preview-shell').children(
    previewSidebar(h),
    h.main.class('preview-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Acme Inc. › Documents'),
          h.a.children('GitHub'),
        ),
      h.div.class('preview-content').children(
        h.div
          .class('preview-metrics')
          .children(
            previewMetric(
              h,
              'Total Revenue',
              '$1,250.00',
              '+12.5%',
              'Trending up this month',
            ),
            previewMetric(
              h,
              'New Customers',
              '1,234',
              '-20%',
              'Down 20% this period',
            ),
            previewMetric(
              h,
              'Active Accounts',
              '45,678',
              '+12.5%',
              'Strong user retention',
            ),
            previewMetric(
              h,
              'Growth Rate',
              '4.5%',
              '+4.5%',
              'Steady performance increase',
            ),
          ),
        h.section.class('preview-panel preview-chart').children(
          h.div.children(
            h.h1.children('Total Visitors'),
            h.p.children('Total for the last three months'),
          ),
          h.span.children('Last 3 months ⌄'),
          h.div.class('preview-line-chart').children(
            h
              .el('svg')
              .attrs({ viewBox: '0 0 760 180', preserveAspectRatio: 'none' })
              .children(
                ...[35, 70, 105, 140].map(y =>
                  h.el('line').attrs({
                    x1: '0',
                    x2: '760',
                    y1: String(y),
                    y2: String(y),
                    stroke: 'var(--border)',
                    'stroke-dasharray': '3 3',
                  }),
                ),
                h.el('path').attrs({
                  d: 'M0 105 C40 82 75 112 115 105 S185 78 220 75 S285 88 325 72 S390 58 430 70 S500 45 545 62 S625 82 665 70 S725 84 760 62 L760 180 L0 180 Z',
                  fill: 'rgba(249,115,22,.13)',
                  stroke: 'none',
                }),
                h.el('path').attrs({
                  d: 'M0 105 C40 82 75 112 115 105 S185 78 220 75 S285 88 325 72 S390 58 430 70 S500 45 545 62 S625 82 665 70 S725 84 760 62',
                  fill: 'none',
                  stroke: '#f97316',
                  'stroke-width': '2',
                }),
                h.el('path').attrs({
                  d: 'M0 130 C45 112 78 136 118 132 S180 118 225 120 S286 102 330 108 S390 115 435 100 S505 98 550 110 S620 132 670 122 S730 112 760 108 L760 180 L0 180 Z',
                  fill: 'rgba(16,185,129,.13)',
                  stroke: 'none',
                }),
                h.el('path').attrs({
                  d: 'M0 130 C45 112 78 136 118 132 S180 118 225 120 S286 102 330 108 S390 115 435 100 S505 98 550 110 S620 132 670 122 S730 112 760 108',
                  fill: 'none',
                  stroke: '#10b981',
                  'stroke-width': '2',
                }),
              ),
          ),
          h.footer.children(
            h.span.children('■ Desktop'),
            h.span.children('■ Mobile'),
          ),
        ),
        h.section.class('preview-panel preview-table').children(
          h.div.children(
            h.h1.children('Document sections'),
            h.button.attrs({ type: 'button' }).children('☷ Customize Columns'),
          ),
          h.div
            .class('preview-tabs')
            .children(
              h.span.class('active').children('Outline'),
              h.span.children('Past Performance'),
              h.span.children('Key Personnel'),
            ),
          h.div
            .class('preview-table-head')
            .children(
              h.span.children('Header'),
              h.span.children('Section Type'),
              h.span.children('Status'),
            ),
          ...[
            ['Introduction', 'Technical', 'Done'],
            ['Architecture', 'Design', 'In Process'],
            ['Launch plan', 'Marketing', 'Draft'],
            ['Analytics spec', 'Technical', 'Review'],
          ].map(([name, type, status]) =>
            h.div
              .key(name ?? '')
              .class('preview-table-row')
              .children(
                h.span.children(name ?? ''),
                h.span.children(type ?? ''),
                h.b.children(status ?? ''),
              ),
          ),
        ),
      ),
    ),
  )

const sidebarOnlyPreview = (h: Html.H<DocsMessage>, name: string) =>
  h.div
    .class('preview-shell sparse')
    .children(
      previewSidebar(h, name === 'sidebar-07'),
      name === 'sidebar-14' || name === 'sidebar-15'
        ? previewSidebar(h, name === 'sidebar-15')
        : undefined,
      h.main
        .class('preview-main')
        .children(
          h.header
            .class('preview-topbar')
            .children(
              h.span.children('☰'),
              h.span.children('Build your application'),
              h.span.children('⌘K'),
            ),
          h.div
            .class('preview-empty')
            .children(
              h.strong.children(name),
              h.p.children('Select a page from the sidebar to get started.'),
            ),
        ),
    )

const loginPreview = (h: Html.H<DocsMessage>, split: boolean) =>
  h.main
    .class('preview-login', split ? 'split' : '')
    .children(
      split ? h.div.class('preview-login-visual') : undefined,
      h.section
        .class('preview-login-card')
        .children(
          h.h1.children('Welcome back'),
          h.p.children('Enter your email to sign in to your account'),
          h.label.children('Email'),
          h.div.class('preview-input').children('m@example.com'),
          h.label.children('Password'),
          h.div.class('preview-input').children('••••••••'),
          h.button.attrs({ type: 'button' }).children('Login'),
          h.p
            .class('preview-login-foot')
            .children("Don't have an account? Sign up"),
        ),
    )

const tablePreview = (h: Html.H<DocsMessage>) =>
  h.main.class('preview-table-page').children(
    h.header.children(
      h.h1.children('Tasks'),
      h.p.children('Manage and track your product roadmap.'),
    ),
    h.div
      .class('preview-toolbar')
      .children(
        h.span.children('Filter tasks…'),
        h.span.children('Status ⌄'),
        h.span.children('Priority ⌄'),
        h.span.children('View ⌄'),
      ),
    h.section.class('preview-panel preview-table tall').children(
      ...[
        ['TASK-8782', 'Documentation', 'In Progress'],
        ['TASK-7878', 'Design', 'Backlog'],
        ['TASK-4562', 'Development', 'Todo'],
        ['TASK-2314', 'Research', 'Done'],
        ['TASK-9812', 'Marketing', 'Review'],
        ['TASK-1042', 'Infrastructure', 'Done'],
      ].map(([id, type, status]) =>
        h.div
          .key(id ?? '')
          .class('preview-table-row')
          .children(
            h.span.children(id ?? ''),
            h.span.children(type ?? ''),
            h.b.children(status ?? ''),
          ),
      ),
    ),
  )

const dashboardSkeleton = (h: Html.H<DocsMessage>, name: string) =>
  h.div
    .class('preview-shell')
    .children(
      previewSidebar(h),
      h.main
        .class('preview-main')
        .children(
          h.header
            .class('preview-topbar')
            .children(
              h.span.children('☰'),
              h.span.children('CreaseUI'),
              h.span.children('GitHub'),
            ),
          h.div
            .class('preview-content')
            .children(
              h.div
                .class('preview-metrics')
                .children(
                  previewMetric(
                    h,
                    'Revenue',
                    '$24.5k',
                    '+8%',
                    'Up from last month',
                  ),
                  previewMetric(
                    h,
                    'Orders',
                    '1,284',
                    '+12%',
                    'Strong conversion',
                  ),
                  previewMetric(
                    h,
                    'Active users',
                    '8,492',
                    '+4%',
                    'Steady retention',
                  ),
                  previewMetric(h, 'Latency', '128ms', '-9%', 'Within target'),
                ),
              h.section
                .class('preview-panel preview-chart')
                .children(
                  h.div.children(
                    h.h1.children(name),
                    h.p.children('Live block preview'),
                  ),
                  h.div
                    .class('preview-line-chart')
                    .children(
                      h.span.class('line one'),
                      h.span.class('line two'),
                    ),
                ),
              h.div
                .class('preview-two-up')
                .children(
                  h.section.class('preview-panel'),
                  h.section.class('preview-panel'),
                ),
            ),
        ),
    )

const blockPreviewView = (h: Html.H<DocsMessage>, name: string) => {
  if (name === 'dashboard-01' || name === 'chart-analytics-dashboard')
    return dashboardPreview(h)
  if (name.startsWith('sidebar-') || name === 'app-shell-01')
    return sidebarOnlyPreview(h, name)
  if (name === 'login-03') return loginPreview(h, false)
  if (name === 'login-04') return loginPreview(h, true)
  if (name.startsWith('tablecn')) return tablePreview(h)
  return dashboardSkeleton(h, name)
}

const blockPreviewGuide = (name: string, description: string): DocsGuide => ({
  title: name,
  description,
  view: h => blockPreviewView(h, name),
})

const blockCategory = (name: string) =>
  name.startsWith('sidebar-') || name === 'app-shell-01'
    ? 'sidebar'
    : name.startsWith('login-')
      ? 'login'
      : name.startsWith('tablecn')
        ? 'table'
        : 'dashboard'

const blockCategories = [
  ['all', 'All blocks'],
  ['dashboard', 'Dashboards'],
  ['sidebar', 'Sidebars'],
  ['login', 'Authentication'],
  ['table', 'Tables'],
] as const

const blocksGuide: DocsGuide = {
  title: 'Blocks',
  description: 'Building Blocks for Effect UI',
  view: (h, context) => {
    const selectedCategory = context?.blockCategory ?? 'all'
    const visibleBlocks = blocks.filter(
      ([name]) =>
        selectedCategory === 'all' || blockCategory(name) === selectedCategory,
    )
    return h.div.class('blocks-gallery').children(
      h.header
        .class('blocks-header')
        .children(
          h.h1.children('Building Blocks for Effect UI'),
          h.p.children(
            'Complete sidebars, dashboards and login layouts. Explore the same blocks across renderers, with live previews you can open full screen.',
          ),
        ),
      h.div.class('blocks-toolbar').children(
        h.nav.attr('aria-label', 'Block categories').children(
          blockCategories.map(([category, label]) =>
            h.button
              .key(category)
              .attrs({
                type: 'button',
                'aria-pressed': String(category === selectedCategory),
              })
              .on('click', () =>
                DocsMessage.SelectedBlockCategory({ category }),
              )
              .children(label),
          ),
        ),
        h.a
          .class('blocks-playground')
          .attr('href', '/blocks-stylex/table')
          .children('Table playground ↗'),
      ),
      h.p
        .class('blocks-count')
        .children(`${String(visibleBlocks.length)} blocks · Tailwind`),
      h.div.class('blocks-list').children(
        visibleBlocks.map(([name, description]) =>
          h.article
            .key(name)
            .class('block-row')
            .attrs({ id: name, 'data-block': name })
            .children(
              h.header.class('block-row-header').children(
                h.div.children(h.h2.children(name), h.p.children(description)),
                h.div.class('block-actions').children(
                  h.button.attrs({ type: 'button' }).children('Code'),
                  h.a
                    .attrs({
                      href: `/blocks/preview/tailwind--${name}`,
                      target: '_blank',
                      rel: 'noreferrer',
                    })
                    .children('Open ↗'),
                ),
              ),
              h.iframe.class('block-preview-frame').attrs({
                src: `/blocks/preview/tailwind--${name}`,
                title: `${name} — Tailwind preview`,
                loading: 'lazy',
              }),
            ),
        ),
      ),
      h.p
        .class('chart-gallery-note')
        .children(
          'Block previews are live Effect UI reconstructions; copyable per-renderer block source is still pending migration.',
        ),
    )
  },
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
  '/blocks/sidebar': blocksGuide,
  '/blocks-stylex': blocksGuide,
  '/blocks-stylex/table': blocksGuide,
  ...Object.fromEntries(
    blocks.flatMap(([name, description]) => {
      const guide = blockPreviewGuide(name, description)
      const entries = [[`/blocks/preview/tailwind--${name}`, guide] as const]
      return name.startsWith('sidebar-')
        ? [...entries, [`/blocks/preview/${name.slice(8)}`, guide] as const]
        : entries
    }),
  ),
}
