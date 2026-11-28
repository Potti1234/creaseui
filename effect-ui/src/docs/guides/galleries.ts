import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { EChart } from '#components'
import {
  areaGradient,
  categoryAxis,
  colorWithOpacity,
  compactGrid,
  legendOptions,
  registerChart,
  tooltipOptions,
  valueAxis,
} from '../../behaviors/chart'
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
      'Gradient',
      'Axes',
      'Icons',
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
const customizeGalleryOption = (
  option: any,
  slug: string,
  example: string,
  theme?: any,
) => {
  const series = Array.isArray(option.series) ? [...option.series] : []
  const first = { ...(series[0] ?? {}) }
  if (slug === 'area' && theme !== undefined) {
    const desktopData = [186, 305, 237, 73, 209, 214]
    const mobileData = [80, 200, 120, 190, 130, 140]
    const line = (
      name: string,
      color: string,
      data: readonly number[],
      opacity = 0.4,
    ): any => ({
      name,
      type: 'line',
      smooth: 0.4,
      stack: 'total',
      showSymbol: false,
      lineStyle: { width: 2, color },
      itemStyle: { color },
      areaStyle: { color: colorWithOpacity(color, opacity) },
      data: [...data],
    })
    option.grid = compactGrid()
    option.xAxis = categoryAxis(theme, [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
    ])
    option.yAxis = valueAxis(theme)
    option.tooltip = tooltipOptions(theme)
    if (example === 'Default' || example === 'Linear') {
      const desktopSeries = line('Desktop', theme.chart1, desktopData)
      delete desktopSeries.stack
      if (example === 'Linear') desktopSeries.smooth = false
      option.series = [desktopSeries]
      return option
    }
    if (example === 'Step') {
      const desktopSeries = line('Desktop', theme.chart1, desktopData)
      delete desktopSeries.stack
      delete desktopSeries.smooth
      desktopSeries.step = 'middle'
      option.series = [desktopSeries]
      return option
    }
    if (example === 'Stacked Expanded') {
      const raw = [
        { desktop: 186, mobile: 80, other: 45 },
        { desktop: 305, mobile: 200, other: 100 },
        { desktop: 237, mobile: 120, other: 150 },
        { desktop: 73, mobile: 190, other: 50 },
        { desktop: 209, mobile: 130, other: 100 },
        { desktop: 214, mobile: 140, other: 160 },
      ]
      const share = (
        row: (typeof raw)[number],
        key: 'desktop' | 'mobile' | 'other',
      ) => row[key] / (row.desktop + row.mobile + row.other)
      option.grid = compactGrid({ top: 12 })
      option.yAxis = {
        type: 'value',
        max: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          show: false,
          formatter: (value: number) => `${String(Math.round(value * 100))}%`,
        },
        splitLine: { lineStyle: { color: theme.border, type: 'dashed' } },
      }
      option.tooltip = {
        ...tooltipOptions(theme),
        valueFormatter: (value: number) =>
          `${String(Math.round(Number(value) * 100))}%`,
      }
      option.series = [
        line(
          'Other',
          theme.chart3,
          raw.map(row => share(row, 'other')),
          0.1,
        ),
        line(
          'Mobile',
          theme.chart2,
          raw.map(row => share(row, 'mobile')),
        ),
        line(
          'Desktop',
          theme.chart1,
          raw.map(row => share(row, 'desktop')),
        ),
      ]
      return option
    }
    const mobileSeries = line('Mobile', theme.chart2, mobileData)
    const desktopSeries = line('Desktop', theme.chart1, desktopData)
    if (example === 'Gradient') {
      mobileSeries.areaStyle = { color: areaGradient(theme.chart2) }
      desktopSeries.areaStyle = { color: areaGradient(theme.chart1) }
    }
    if (example === 'Axes') {
      option.grid = compactGrid({ left: 0 })
      option.yAxis = {
        ...valueAxis(theme, { showLabels: true }),
        splitNumber: 2,
      }
    }
    if (example === 'Legend' || example === 'Icons')
      option.legend = legendOptions(theme)
    option.series = [mobileSeries, desktopSeries]
    return option
  }
  if (slug === 'area' || slug === 'line')
    first.data = [186, 305, 237, 73, 209, 214]
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
        theme,
      ),
    )
  }
}
const galleryChart = (h: any, slug: string, example: string) =>
  EChart(h, {
    hostId: galleryHostId(slug, example),
    ariaLabel: `${example} chart`,
    accessibleAlternative: h.p.children(
      `${example === 'Default' ? singularChartTitle(slug) : example} chart showing total visitors for the last 6 months`,
    ),
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
            .class(
              example === 'Interactive'
                ? 'chart-gallery-card interactive'
                : 'chart-gallery-card',
            )
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
                  .children('Trending up by 5.2% this month'),
                h.p.children('January - June 2024'),
              ),
            ),
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

const createHeading = (
  h: Html.H<DocsMessage>,
  title: string,
  subtitle?: string,
  action?: string,
) =>
  h.div.class('create-card-heading').children(
    h.div.children(
      h.h2.children(title),
      subtitle === undefined ? undefined : h.p.children(subtitle),
    ),
    action === undefined
      ? undefined
      : h.button
          .class(
            action?.startsWith('Close')
              ? 'create-icon-action'
              : 'create-text-action',
          )
          .attrs({ type: 'button' })
          .children(action),
  )

const createLine = (h: Html.H<DocsMessage>, label: string, value: string) =>
  h.div
    .key(`${label}-${value}`)
    .class('create-line')
    .children(h.span.children(label), h.strong.children(value))

const createField = (h: Html.H<DocsMessage>, label: string, value = '') =>
  h.div
    .key(label)
    .class('create-field')
    .children(
      h.label.children(label),
      h.div.class('create-input').children(value),
    )

const createActions = (
  h: Html.H<DocsMessage>,
  primary: string,
  secondary?: string,
) =>
  h.div
    .class('create-actions')
    .children(
      secondary === undefined
        ? undefined
        : h.button.attrs({ type: 'button' }).children(secondary),
      h.button.attrs({ type: 'button' }).children(primary),
    )

const createSidebarNavCard = (
  h: Html.H<DocsMessage>,
  key: string,
  sections: ReadonlyArray<readonly [string, ReadonlyArray<string>]>,
) =>
  h.section
    .key(key)
    .class('create-card create-sidebar-nav-card')
    .children(
      ...sections.map(([label, items]) =>
        h.div
          .key(label)
          .class('create-sidebar-nav-group')
          .children(
            h.small.children(label),
            ...items.map((item, index) =>
              h.span
                .key(item)
                .class(label === 'Overview' && index === 0 ? 'selected' : '')
                .children(item),
            ),
          ),
      ),
    )

const createSidebarNavPair = (h: Html.H<DocsMessage>) =>
  h.div
    .key('Sidebar Nav')
    .class('create-sidebar-nav-pair')
    .children(
      createSidebarNavCard(h, 'sidebar-overview', [
        [
          'Overview',
          ['Dashboard', 'Transactions', 'Investments', 'Accounts', 'Spending'],
        ],
        ['Planning', ['Goals', 'Budget', 'Reports', 'Documents']],
      ]),
      createSidebarNavCard(h, 'sidebar-account', [
        [
          'Account',
          ['Profile', 'Billing', 'Notifications', 'Security', 'Appearance'],
        ],
        ['Support', ['Help Center', 'Contact Us', 'Documentation', 'Status']],
      ]),
    )

const createBalanceMiniCard = (
  h: Html.H<DocsMessage>,
  key: string,
  label: string,
  value: string,
  detail?: string,
  action?: string,
) =>
  h.section
    .key(key)
    .class('create-card create-balance-mini-card')
    .children(
      h.p.children(label),
      h.h3.children(value),
      detail === undefined
        ? undefined
        : h.p.class('balance-available').children(detail),
      action === undefined
        ? undefined
        : h.button.attrs({ type: 'button' }).children(action),
    )

const createCardBalanceComposition = (h: Html.H<DocsMessage>) =>
  h.div
    .key('Card Balance')
    .class('create-balance-composition')
    .children(
      createBalanceMiniCard(
        h,
        'card-balance',
        'Card Balance',
        'US$12.94',
        'US$11,337.06 Available',
      ),
      createBalanceMiniCard(
        h,
        'payment-due',
        'Payment Due',
        '1 Apr',
        undefined,
        'Pay Early',
      ),
      h.section
        .key('yearly-activity')
        .class('create-card create-balance-activity-card')
        .children(
          h.div
            .class('balance-activity-head')
            .children(
              h.span.children('Yearly Activity'),
              h.strong.children('+US$0.25 Daily Cash'),
            ),
          h.div
            .class('balance-activity-chart')
            .children(
              ...[24, 33, 21, 36, 27, 30, 39, 24, 33, 42, 27, 48].map(
                (height, index) =>
                  h.i
                    .key(`${String(height)}-${String(index)}`)
                    .style({ height: `${String(height)}px` }),
              ),
            ),
          h.div
            .class('balance-months')
            .children(
              ...[
                'J',
                'F',
                'M',
                'A',
                'M',
                'J',
                'J',
                'A',
                'S',
                'O',
                'N',
                'D',
              ].map((month, index) =>
                h.span.key(`${month}-${index}`).children(month),
              ),
            ),
        ),
    )

const createPlaceholderChildren = (
  h: Html.H<DocsMessage>,
  title: string,
  lines: number,
): View.Input<DocsMessage>[] => {
  if (title === 'Loading Card') {
    return []
  }
  if (title === 'Preferences') {
    return [
      createHeading(
        h,
        'Preferences',
        'Manage your account settings and notifications.',
        'Close Preferences',
      ),
      createField(h, 'Default Currency', 'USD — United States Dollar ⌄'),
      ...[
        [
          'Public Statistics',
          'Allow others to see your total stream count and listening activity',
        ],
        [
          'Email Notifications',
          'Monthly royalty reports and distribution updates',
        ],
      ].map(([name, description]) =>
        h.div
          .key(name ?? '')
          .class('create-toggle-row')
          .children(
            h.div.children(
              h.strong.children(name ?? ''),
              h.p.children(description ?? ''),
            ),
            h.span.class('create-toggle').children(h.span),
          ),
      ),
      createActions(h, 'Save Preferences', 'Reset'),
    ]
  }
  if (title === 'Savings Progress') {
    return [
      h.div
        .class('create-savings-ring')
        .children(h.strong.children('$24,000'), h.p.children('80% of $30,000')),
      h.div
        .class('create-savings-rows')
        .children(
          createLine(h, 'Projected Finish', 'October 2024'),
          createLine(h, 'Monthly Average', '$1,250'),
          createLine(h, 'Top Contributor', 'Auto-Transfer'),
        ),
    ]
  }

  if (title === 'Kitchen Island') {
    return [
      h.div
        .class('create-card-heading create-kitchen-heading')
        .children(
          h.div.children(
            h.h2.children('Kitchen Island'),
            h.p.children('Hue Color Ambient'),
          ),
          h.span.class('create-toggle on').children(h.span),
        ),
      h.div.class('create-chip-row create-scene-row').children(
        ['Cooking', 'Dining', 'Nightlight', 'Focus'].map((scene, index) =>
          h.span
            .key(scene)
            .class(index === 0 ? 'selected' : '')
            .children(scene),
        ),
      ),
      ...[
        ['Brightness', '90%'],
        ['Color Temp', '70%'],
        ['Volume', '30%'],
        ['Fade', '0%'],
      ].map(([label, value]) =>
        h.div
          .key(label ?? '')
          .class('create-slider-row')
          .children(
            h.span.class('create-slider-icon'),
            h.span.class('create-slider-label').children(label ?? ''),
            h.div
              .class('create-slider')
              .children(
                h.i.style({ width: value ?? '0%' }),
                h.span.style({ left: value ?? '0%' }),
              ),
          ),
      ),
    ]
  }

  if (title === 'Savings Targets') {
    return [
      createHeading(
        h,
        'Savings Targets',
        'Active milestones for 2024',
        'New Goal',
      ),
      ...[
        ['Retirement', '$420,000', '65% achieved', '$273,000', '65%'],
        ['Real Estate', '$85,000', '32% achieved', '$27,200', '32%'],
      ].map(([name, target, achieved, saved, width]) =>
        h.div
          .key(name ?? '')
          .class('create-target')
          .children(
            h.div
              .class('create-target-body')
              .children(
                h.small.children(name ?? ''),
                h.strong.class('create-target-value').children(target ?? ''),
                h.div
                  .class('create-progress')
                  .children(h.span.style({ width: width ?? '0%' })),
              ),
            h.div
              .class('create-target-footer')
              .children(
                h.span.children(achieved ?? ''),
                h.span.children(saved ?? ''),
              ),
          ),
      ),
      h.p
        .class('create-warning')
        .children('You have not met your targets for this year.'),
    ]
  }
  if (title === 'Buy Investment') {
    return [
      h.h2.children('Buy Investment'),
      h.div
        .class('create-buy-field')
        .children(
          h.label.children('Amount to Invest'),
          h.div
            .class('create-money-input')
            .children(h.span.children('$'), h.strong.children('1,000.00')),
        ),
      h.div
        .class('create-buy-field')
        .children(
          h.label.children('Order Type'),
          h.div
            .class('create-select-input')
            .children(
              h.span.children('Market Order'),
              h.span.class('create-select-chevron').children('⌄'),
            ),
        ),
      h.p
        .class('create-buy-description')
        .children('Market orders execute at the current price.'),
      createLine(h, 'Estimated Shares', '1.95'),
      createLine(h, 'Buying Power', '$12,450.00'),
      h.button.attrs({ type: 'button' }).children('Review Order'),
      h.p
        .class('create-buy-note')
        .children(
          'Trades are typically executed within minutes during market hours.',
        ),
    ]
  }

  if (title === 'Recent Transactions') {
    return [
      createHeading(
        h,
        'Recent Transactions',
        'Your latest account activity.',
        'View All',
      ),
      ...[
        [
          '☕',
          'Blue Bottle Coffee',
          'Food & Drink',
          'Today, 10:24 AM',
          '-$6.50',
        ],
        ['🛒', 'Whole Foods Market', 'Groceries', 'Yesterday', '-$142.30'],
        ['💳', 'Stripe Payout', 'Income', 'Oct 12', '+$4,200.00'],
        ['🚗', 'Uber Technologies', 'Transport', 'Oct 11', '-$24.10'],
        ['▶', 'Netflix Subscription', 'Entertainment', 'Oct 10', '-$19.99'],
      ].map(([icon, name, category, date, amount]) =>
        h.div
          .key(name ?? '')
          .class('create-transaction')
          .children(
            h.div.class('create-transaction-icon').children(icon ?? ''),
            h.div
              .class('create-transaction-name')
              .children(
                h.strong.children(name ?? ''),
                h.span.children(category ?? ''),
              ),
            h.span.class('create-transaction-date').children(date ?? ''),
            h.strong
              .class(
                `create-transaction-amount ${amount?.startsWith('+') ? 'positive' : ''}`,
              )
              .children(amount ?? ''),
            h.button
              .class('create-transaction-menu')
              .attrs({
                type: 'button',
                'aria-label': `Open actions for ${name ?? 'transaction'}`,
              })
              .children('⋯'),
          ),
      ),
    ]
  }

  if (title === 'Account Access') {
    return [
      createHeading(
        h,
        'Account Access',
        'Update your credentials or re-authenticate.',
      ),
      createField(h, 'Email Address'),
      createField(h, 'Current Password', 'FORGOT?'),
      h.button.attrs({ type: 'button' }).children('Update Security'),
      h.div
        .class('create-danger')
        .children(
          h.strong.children('Danger Zone'),
          h.p.children('Archive account and remove catalog'),
        ),
    ]
  }
  if (title === 'Card Balance') {
    return [
      h.div
        .class('balance-card-grid')
        .children(
          h.div.children(
            h.p.children('Card Balance'),
            h.h3.children('US$12.94'),
            h.p.class('balance-available').children('US$11,337.06 Available'),
          ),
          h.div.children(h.p.children('Payment Due'), h.h3.children('1 Apr')),
        ),
      h.div
        .class('balance-activity-head')
        .children(
          h.span.children('Yearly Activity'),
          h.strong.children('+US$0.25 Daily Cash'),
        ),
      h.div
        .class('balance-activity-chart')
        .children(
          ...[28, 42, 35, 58, 48, 70, 52, 76, 62, 82, 68, 88].map(height =>
            h.i.key(String(height)).style({ height: `${String(height)}%` }),
          ),
        ),
      h.div
        .class('balance-months')
        .children(
          ...['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map(
            (month, index) => h.span.key(`${month}-${index}`).children(month),
          ),
        ),
    ]
  }
  if (title === 'Transfer Funds') {
    return [
      createHeading(
        h,
        'Transfer Funds',
        'Move money between your connected accounts.',
        'Close Transfer Funds',
      ),
      createField(h, 'Amount to Transfer', '$'),
      createField(h, 'From Account', 'Main Checking (··8402) — $12,450.00 ⌄'),
      createField(
        h,
        'To Account',
        'High Yield Savings (··1192) — $42,100.00 ⌄',
      ),
      createLine(h, 'Estimated arrival', 'Today, Apr 14'),
      createLine(h, 'Transaction fee', '$0.00'),
      createLine(h, 'Total amount', '$1,200.00'),
      h.button.attrs({ type: 'button' }).children('Confirm Transfer'),
    ]
  }
  if (title === 'Cover Art') {
    return [
      h.small.class('create-cover-label').children('Cover Art'),
      h.div
        .class('create-upload-box')
        .children(h.span.class('create-image-icon')),
      h.button
        .class('create-upload-button')
        .attrs({ type: 'button' })
        .children('Upload Artwork'),
      h.p
        .class('create-upload-note')
        .children('Minimum 3000 × 3000px\nJPEG or PNG only'),
    ]
  }

  if (title === 'Payout Preferences') {
    return [
      h.button
        .class('create-icon-action create-payout-close')
        .attrs({ type: 'button' })
        .children('Close Receiving Method'),
      h.h2.class('create-payout-title').children('Receiving Method'),
      createField(h, 'Account Holder Name'),
      h.div.class('create-method-grid').children(
        ...[
          ['Bank Transfer', 'SWIFT / IBAN', true],
          ['PayPal', 'Instant Payout', false],
        ].map(([label, description, selected]) =>
          h.div
            .key(String(label))
            .class('create-method-choice')
            .children(
              h.span
                .class(selected ? 'create-radio selected' : 'create-radio')
                .children(''),
              h.div.children(
                h.strong.children(String(label)),
                h.p.children(String(description)),
              ),
            ),
        ),
      ),
      createField(h, 'IBAN / Account Number'),
      h.button.attrs({ type: 'button' }).children('Save Payout Settings'),
    ]
  }

  if (title === 'Power Usage') {
    return [
      createHeading(h, 'Power Usage', 'Whole Home'),
      h.div
        .class('create-power-chart')
        .children(
          ...[32, 76, 84, 65, 92, 78, 103, 86].map((height, index) =>
            h.span.key(String(index)).style({ height: `${String(height)}px` }),
          ),
          h.div
            .class('create-power-times')
            .children(
              ['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p'].map(time =>
                h.small.key(time).children(time),
              ),
            ),
        ),
      h.div.class('create-power-separator'),
      h.div
        .class('create-power-stats')
        .children(
          h.div.children(
            h.span.children('Currently Using'),
            h.strong.children('3.4 kW'),
          ),
          h.div.children(
            h.span.children('Solar Gen'),
            h.strong.children('+1.2 kW'),
          ),
        ),
      h.div
        .class('create-power-footer')
        .children(
          h.span.children('Battery Level'),
          h.div
            .class('create-power-battery')
            .children(
              h.div
                .class('create-progress')
                .children(h.span.style({ width: '85%' })),
              h.strong.children('85%'),
            ),
        ),
    ]
  }

  if (title === 'Connect Bank') {
    return [
      h.div
        .class('create-center-empty')
        .children(
          h.div.class('create-plus').children('+'),
          h.h2.children('Connect Bank'),
          h.p.children(
            'Link your payout method to receive monthly royalty distributions automatically.',
          ),
          h.button.attrs({ type: 'button' }).children('Set Up Payouts'),
        ),
    ]
  }
  if (title === 'Upcoming Payments') {
    return [
      createHeading(
        h,
        'Upcoming Payments',
        'Select a date to view scheduled payments.',
      ),
      h.div.class('create-mini-calendar').children(
        h.div
          .class('create-calendar-header')
          .children(
            h.button.attrs({ type: 'button' }).children('‹'),
            h.strong.children('November 2026'),
            h.button.attrs({ type: 'button' }).children('›'),
          ),
        h.div.class('create-calendar-grid').children(
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
            h.small.key(day).children(day),
          ),
          ...Array.from({ length: 35 }, (_, index) =>
            h.span
              .key(String(index))
              .children(String(index < 30 ? index + 1 : index - 29)),
          ),
        ),
      ),
      ...[
        ['Netflix Subscription', 'Apr 15, 2024', '$19.99'],
        ['Rent Payment', 'Apr 1, 2024', '$2,400.00'],
        ['Auto Insurance', 'Apr 22, 2024', '$186.00'],
      ].map(([name, date, amount]) =>
        h.div
          .key(name ?? '')
          .class('create-transaction')
          .children(
            h.div.children(
              h.strong.children(name ?? ''),
              h.span.children(date ?? ''),
            ),
            h.strong.children(amount ?? ''),
          ),
      ),
    ]
  }
  if (title === 'Roller Shades') {
    return [
      h.div
        .class('create-card-heading')
        .children(
          h.div.children(
            h.h2.children('Living Room'),
            h.p.class('create-shade-subtitle').children('Roller Shades'),
          ),
        ),
      h.div.class('create-shade-visual').children(h.span),
      h.div
        .class('create-shade-control')
        .children(
          h.span.children('Open'),
          h.div.class('create-shade-slider').children(h.i, h.b),
          h.span.children('Close'),
        ),
      h.div.class('create-chip-row create-shade-modes').children(
        ['Open', 'Half', 'Closed'].map((mode, index) =>
          h.span
            .key(mode)
            .class(index === 0 ? 'selected' : '')
            .children(mode),
        ),
      ),
    ]
  }

  if (title === 'Stock Performance') {
    return [
      createHeading(h, 'Stock Performance', '6-month price history.'),
      createField(h, 'Ticker', 'VOO ⌄'),
      h.div.class('create-stock-chart').children(h.span, h.span, h.span),
    ]
  }
  if (title === 'Explore Catalog') {
    return [
      h.div
        .class('create-center-empty')
        .children(
          h.div.class('create-plus').children('⌘'),
          h.h2.children('Explore Catalog'),
          h.p.children(
            'Check your ISRC codes, metadata, and visual assets before going live.',
          ),
          h.button.attrs({ type: 'button' }).children('View Catalog'),
        ),
    ]
  }
  if (title === 'Set a new milestone') {
    return [
      createHeading(
        h,
        'Set a new milestone',
        "Define your financial target and we'll help you pace your savings.",
      ),
      h.label.class('create-goal-field').children(
        h.span.children('Goal Name'),
        h.input.attrs({
          placeholder: 'e.g. New Car, Home Downpayment',
          type: 'text',
        }),
      ),
      h.div
        .class('create-goal-grid')
        .children(
          h.label
            .class('create-goal-field')
            .children(
              h.span.children('Target Amount'),
              h.input.attrs({ placeholder: '$0.00', type: 'text' }),
            ),
          h.label
            .class('create-goal-field')
            .children(
              h.span.children('Target Date'),
              h.input.attrs({ placeholder: 'mm/dd/yyyy', type: 'text' }),
            ),
        ),
      h.button
        .class('create-goal-primary')
        .attrs({ type: 'button' })
        .children('Create Goal'),
      h.button
        .class('create-goal-secondary')
        .attrs({ type: 'button' })
        .children('Cancel'),
    ]
  }
  if (title === 'Social Links') {
    return [
      h.h2.children('Social Links'),
      ...[
        ['Spotify Artist URL', ''],
        ['Instagram Handle', ''],
        ['SoundCloud URL', 'soundcloud.com/username'],
        ['Website', 'https://yoursite.com'],
      ].map(([label, placeholder]) =>
        h.label
          .key(label ?? '')
          .class('create-social-field')
          .children(
            h.span.children(label ?? ''),
            h.div
              .class('create-social-input')
              .children(
                h.i,
                h.input.attrs({ placeholder: placeholder ?? '', type: 'text' }),
              ),
          ),
      ),
      h.div
        .class('create-social-actions')
        .children(
          h.button.attrs({ type: 'button' }).children('Discard'),
          h.button.attrs({ type: 'button' }).children('Save Changes'),
        ),
    ]
  }

  if (title === 'Stocks') {
    return [
      h.div.class('stock-tabs').children(
        ...['Stocks', 'ETFs', 'REITs'].map((tab, index) =>
          h.span
            .key(tab)
            .attr('data-active', index === 0 ? 'true' : 'false')
            .children(tab),
        ),
      ),
      h.div.class('stock-items').children(
        ...[
          [
            'VOO',
            'Vanguard S&P 500 ETF',
            '112 Shares · Jan 2021',
            'ETF',
            '$48,230.40',
          ],
          [
            'VIG',
            'Vanguard Dividend Appreciation',
            '450 Shares · Mar 2022',
            'ETF',
            '$26,033.79',
          ],
          ['AAPL', 'Apple Inc.', '85 Shares · Nov 2020', 'Stock', '$18,488.90'],
          [
            'O',
            'Realty Income Corp',
            '320 Shares · Jun 2023',
            'REIT',
            '$15,136.59',
          ],
        ].map(([symbol, name, meta, type, value]) =>
          h.div
            .key(symbol ?? '')
            .class('stock-row')
            .children(
              h.div.class('stock-symbol').children(symbol ?? ''),
              h.div
                .class('stock-name')
                .children(
                  h.strong.children(name ?? ''),
                  h.p.children(meta ?? ''),
                ),
              h.span.class('stock-type').children(type ?? ''),
              h.div
                .class('stock-value')
                .children(
                  h.span.children('Value'),
                  h.strong.children(value ?? ''),
                ),
            ),
        ),
      ),
    ]
  }
  if (title === 'Notifications') {
    return [
      createHeading(
        h,
        'Notifications',
        'Choose what you want to be notified about.',
      ),
      h.div
        .class('create-notification-check')
        .children(h.i, h.span.children('Select all')),
      ...[
        ['Transaction alerts', 'Deposits, withdrawals, and transfers.'],
        ['Security alerts', 'Login attempts and account changes.'],
        ['Goal milestones', 'Updates at 25%, 50%, 75%, and 100%.'],
        ['Market updates', 'Daily portfolio summary and price alerts.'],
      ].map(([name, description]) =>
        h.div
          .key(name ?? '')
          .class('create-notification-row')
          .children(
            h.i,
            h.div.children(
              h.strong.children(name ?? ''),
              h.p.children(description ?? ''),
            ),
          ),
      ),
      h.button
        .class('create-save-preferences')
        .attrs({ type: 'button' })
        .children('Save Preferences'),
    ]
  }

  if (title === 'Sidebar Nav') {
    return [
      h.div.class('create-sidebar-demo').children(
        h.div
          .class('create-sidebar-brand')
          .children('⌘', h.strong.children('Ledger')),
        ...[
          'Overview',
          'Dashboard',
          'Transactions',
          'Investments',
          'Accounts',
          'Reports',
          'Settings',
        ].map((item, index) =>
          h.span
            .key(item)
            .class(index === 1 ? 'selected' : '')
            .children(item),
        ),
      ),
    ]
  }
  if (title === 'General') {
    return [
      h.div.class('create-chip-row create-general-tabs').children(
        ['General', 'Billing', 'Goals'].map((tab, index) =>
          h.span
            .key(tab)
            .class(index === 0 ? 'selected' : '')
            .children(tab),
        ),
      ),
      h.div
        .class('create-faq-item open')
        .children(
          h.div
            .class('create-faq-question')
            .children(
              h.span.children('How secure is my financial data with Ledger?'),
              h.small.children('⌄'),
            ),
          h.p.children(
            'We use bank-level AES-256 encryption, SOC 2 Type II certified infrastructure, and never store your credentials. All connections use read-only access tokens. We are a SEC registered investment advisor.',
          ),
        ),
      h.div
        .class('create-faq-item')
        .children(
          h.div
            .class('create-faq-question')
            .children(
              h.span.children(
                'How do I connect my bank or investment accounts?',
              ),
              h.small.children('›'),
            ),
        ),
      h.div
        .class('create-faq-item')
        .children(
          h.div
            .class('create-faq-question')
            .children(
              h.span.children('Can I export my data for tax purposes?'),
              h.small.children('›'),
            ),
        ),
      createActions(h, 'Contact Support', 'Learn More'),
    ]
  }

  if (title === 'Home') {
    return [
      h.div
        .class('create-breadcrumb')
        .children(
          h.span.children('Home'),
          h.small.children('›'),
          h.span.class('create-breadcrumb-options').children('⋯'),
          h.small.children('›'),
          h.strong.children('Payments'),
        ),
      ...[
        [
          'Change transfer limit',
          'Adjust how much you can send from your balance.',
        ],
        ['Scheduled transfers', 'Set up a transfer to send at a later date.'],
        ['Direct Debits', 'Set up and manage regular payments.'],
        ['Recurring card payments', 'Manage your repeated card transactions.'],
      ].map(([name, description]) =>
        h.div
          .key(name ?? '')
          .class('create-home-row')
          .children(
            h.div.class('create-home-icon'),
            h.div
              .class('create-home-copy')
              .children(
                h.strong.children(name ?? ''),
                h.p.children(description ?? ''),
              ),
            h.span.class('create-home-chevron').children('›'),
          ),
      ),
    ]
  }

  if (title === 'Front Door') {
    return [
      h.div
        .class('create-card-heading')
        .children(
          h.div.children(
            h.h2.children('Front Door'),
            h.p.class('create-front-door-subtitle').children('Smart Lock Pro'),
          ),
          h.span.class('create-lock-status').children('Locked', h.i),
        ),
      h.div
        .class('create-lock-visual')
        .children(h.span.class('create-live-badge').children('Live')),
    ]
  }

  if (title === 'QR Connect') {
    return [
      h.div
        .class('create-qr-panel')
        .children(
          h.div
            .class('create-qr-grid')
            .children(
              Array.from({ length: 64 }, (_, index) =>
                h.span
                  .key(String(index))
                  .class(
                    [
                      0, 1, 2, 5, 6, 7, 8, 10, 13, 15, 16, 18, 19, 20, 22, 23,
                      24, 27, 28, 31, 32, 34, 37, 38, 40, 42, 43, 44, 45, 47,
                      48, 50, 51, 53, 56, 57, 58, 61, 62, 63,
                    ].includes(index)
                      ? 'filled'
                      : '',
                  ),
              ),
            ),
        ),
      h.h2.children('Scan to connect your mobile device'),
      h.p.children(
        'Open the Ledger mobile app and scan this code to link your device.',
      ),
      h.button.attrs({ type: 'button' }).children('Got it'),
    ]
  }
  if (title === 'Dividend Income') {
    return [
      h.div
        .class('create-card-heading')
        .children(
          h.div.children(
            h.h2.children('Q2 Dividend Income'),
            h.p.children(
              'Quarterly dividend payouts across your portfolio holdings.',
            ),
          ),
          h.button.attrs({ type: 'button' }).children('Close Dividend Income'),
        ),
      ...[
        ['Vanguard VIG', '450 Shares', '$1,842.10'],
        ['S&P 500 VOO', '112 Shares', '$928.40'],
        ['Apple AAPL', '85 Shares', '$340.00'],
        ['Realty Income', '320 Shares', '$1,139.50'],
      ].map(([name, shares, amount]) =>
        h.div
          .key(name ?? '')
          .class('create-dividend-row')
          .children(
            h.div.children(
              h.strong.children(name ?? ''),
              h.span.children(shares ?? ''),
            ),
            h.strong.children(amount ?? ''),
          ),
      ),
    ]
  }
  if (title === 'Dollar-Cost Averaging') {
    return [
      h.h2.children('Dollar-Cost Averaging'),
      h.p
        .class('create-card-subtitle')
        .children('A strategy for building wealth over time.'),
      h.p.children(
        'Over time, this smooths out the average cost of your investments. When prices drop, your fixed amount buys more shares. When prices rise, you buy fewer. The result is a lower average cost per share compared to lump-sum investing during volatile periods.',
      ),
    ]
  }
  if (title === 'Syncing your accounts') {
    return [
      h.div.class('create-sync-icon').children('⟳'),
      h.h2.children('Syncing your accounts'),
      h.p.children(
        "We're pulling in your latest transactions. This usually takes a few seconds.",
      ),
      h.button.attrs({ type: 'button' }).children('Cancel'),
    ]
  }
  return [
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
            .class(index === 0 ? 'strong' : index === lines - 1 ? 'short' : ''),
        ),
      ),
    h.div.class('create-placeholder-actions').children(h.span, h.span),
  ]
}

const createPlaceholder = (
  h: Html.H<DocsMessage>,
  title: string,
  tone: 'compact' | 'regular' | 'large' = 'regular',
  lines = 3,
  height?: number,
) =>
  h.section
    .key(title)
    .class(
      `create-card create-placeholder ${tone} create-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    )
    .style(height === undefined ? {} : { height: `${String(height)}px` })
    .children(...createPlaceholderChildren(h, title, lines))

const createColumn = (
  h: Html.H<DocsMessage>,
  key: string,
  ...cards: View.Input<DocsMessage>[]
) =>
  h.div
    .key(key)
    .class('create-column')
    .children(...cards)

const createTokenRow = (
  h: Html.H<DocsMessage>,
  token: string,
  value: string,
  color: string,
  contrast = '',
) =>
  h.div
    .key(`extra-${token}`)
    .class('create-token')
    .children(
      h.span.class('create-token-swatch').style({ background: color }),
      h.div.children(h.strong.children(token), h.code.children(value)),
      contrast === ''
        ? undefined
        : h.span.class('create-contrast').children(contrast),
    )

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
        h.div.class('create-token-scroll').children(
          h.div.class('create-mode').children(
            h.span
              .attr('aria-current', 'page')
              .on('click', DocsMessage.SelectedTheme({ dark: false }))
              .children('Light'),
            h.span
              .on('click', DocsMessage.SelectedTheme({ dark: true }))
              .children('Dark'),
          ),
          h.div.class('create-token-section').children('Primary'),
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
          h.div.class('create-token-section').children('Secondary'),
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
          h.div.class('create-token-section').children('Accent'),
          ...[
            ['accent', 'oklch(0.923 0 0)', '#ebebeb', ''],
            ['accent-foreground', 'oklch(0.205 0 0)', '#343434', ''],
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
          h.div.class('create-token-section').children('Base'),
          ...[
            ['background', 'oklch(1 0 0)', '#ffffff'],
            ['foreground', 'oklch(0.205 0 0)', '#343434'],
          ].map(([token, value, color]) =>
            createTokenRow(h, token ?? '', value ?? '', color ?? ''),
          ),
          h.div.class('create-token-section').children('Card'),
          ...[
            ['card', 'oklch(1 0 0)', '#ffffff'],
            ['card-foreground', 'oklch(0.205 0 0)', '#343434'],
          ].map(([token, value, color]) =>
            createTokenRow(h, token ?? '', value ?? '', color ?? ''),
          ),
          h.div.class('create-token-section').children('Popover'),
          ...[
            ['popover', 'oklch(1 0 0)', '#ffffff'],
            ['popover-foreground', 'oklch(0.205 0 0)', '#343434'],
          ].map(([token, value, color]) =>
            createTokenRow(h, token ?? '', value ?? '', color ?? ''),
          ),
          h.div.class('create-token-section').children('Muted'),
          ...[
            ['muted', 'oklch(0.923 0 0)', '#ebebeb'],
            ['muted-foreground', 'oklch(0.556 0 0)', '#737373'],
          ].map(([token, value, color]) =>
            createTokenRow(h, token ?? '', value ?? '', color ?? ''),
          ),
          h.div.class('create-token-section').children('Destructive'),
          ...[
            ['destructive', 'oklch(0.577 0.245 27.325)', '#c94436'],
            ['destructive-foreground', 'oklch(0.985 0 0)', '#fafafa'],
          ].map(([token, value, color]) =>
            createTokenRow(h, token ?? '', value ?? '', color ?? ''),
          ),
          h.div.class('create-token-section').children('Border & Input'),
          ...[
            ['border', 'oklch(0.885 0 0)', '#e0e0e0'],
            ['input', 'oklch(0.885 0 0)', '#e0e0e0'],
            ['ring', 'oklch(0.21 0 0)', '#171717'],
          ].map(([token, value, color]) =>
            createTokenRow(h, token ?? '', value ?? '', color ?? ''),
          ),
          h.div.class('create-token-section').children('Chart'),
          ...[
            ['chart-1', 'oklch(0.205 0 0)', '#343434'],
            ['chart-2', 'oklch(0.922 0 0)', '#e9e9e9'],
            ['chart-3', 'oklch(0.556 0 0)', '#737373'],
            ['chart-4', 'oklch(0.72 0 0)', '#a3a3a3'],
            ['chart-5', 'oklch(0.82 0 0)', '#d4d4d4'],
          ].map(([token, value, color]) =>
            createTokenRow(h, token ?? '', value ?? '', color ?? ''),
          ),
          h.div.class('create-token-section').children('Sidebar'),
          ...[
            ['sidebar', 'oklch(0.923 0 0)', '#ebebeb'],
            ['sidebar-foreground', 'oklch(0.205 0 0)', '#343434'],
            ['sidebar-primary', 'oklch(0.21 0 0)', '#171717'],
            ['sidebar-primary-foreground', 'oklch(0.985 0 0)', '#fafafa'],
            ['sidebar-accent', 'oklch(0.923 0 0)', '#ebebeb'],
          ].map(([token, value, color]) =>
            createTokenRow(h, token ?? '', value ?? '', color ?? ''),
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
                h.span
                  .on('click', DocsMessage.SelectedTheme({ dark: false }))
                  .children('Light'),
                h.span
                  .on('click', DocsMessage.SelectedTheme({ dark: true }))
                  .children('Dark'),
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
                'Upload your first master to start reaching listeners on Spotify, Apple Music, and more.',
              ),
              h.button.attrs({ type: 'button' }).children('Create Release'),
            ),
          createPlaceholder(h, 'QR Connect', 'regular', 5, 440),
          createPlaceholder(h, 'Dividend Income', 'regular', 5, 459),
          createPlaceholder(h, 'Dollar-Cost Averaging', 'regular', 4, 271),
          createPlaceholder(h, 'Syncing your accounts', 'regular', 4, 344),
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
              h.span.class('create-status'),
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
              h.div
                .class('create-card-row balance-total')
                .children(
                  h.span.children('Total Ready to Claim'),
                  h.span.children('$0.00 USD'),
                ),
              h.p
                .class('balance-note')
                .children(
                  'Once your bank is connected, balances over $10.00 are automatically eligible for monthly distribution on the 15th of each month.',
                ),
            ),
          createPlaceholder(h, 'Preferences', 'regular', 5, 445),
          createPlaceholder(h, 'Savings Progress', 'regular', 5, 448),
          createPlaceholder(h, 'Kitchen Island', 'regular', 5, 369),
        ),
        h.div
          .key('planning')
          .class('create-column wide')
          .children(
            h.div
              .class('create-split-row')
              .children(
                createPlaceholder(h, 'Savings Targets', 'large', 5, 462),
                createPlaceholder(h, 'Buy Investment', 'large', 5, 462),
              ),
            createPlaceholder(h, 'Recent Transactions', 'large', 6, 406),
            h.div
              .class('create-nested-grid')
              .children(
                h.div
                  .class('create-nested-column')
                  .children(
                    createSidebarNavPair(h),
                    createPlaceholder(h, 'General', 'regular', 4, 426),
                  ),
                h.div
                  .class('create-nested-column')
                  .children(
                    createPlaceholder(h, 'Home', 'regular', 4, 475),
                    createPlaceholder(h, 'Front Door', 'regular', 3, 307),
                  ),
              ),
            createPlaceholder(h, 'Stocks', 'large', 5, 374),
          ),
        createColumn(
          h,
          'account',
          createPlaceholder(h, 'Account Access', 'regular', 5, 415),
          createCardBalanceComposition(h),
          createPlaceholder(h, 'Transfer Funds', 'regular', 6, 579),
          createPlaceholder(h, 'Cover Art', 'regular', 5, 503),
          createPlaceholder(h, 'Loading Card', 'regular', 4, 374),
        ),
        createColumn(
          h,
          'utilities',
          createPlaceholder(h, 'Payout Preferences', 'regular', 5, 429),
          createPlaceholder(h, 'Power Usage', 'regular', 5, 433),
          createPlaceholder(h, 'Connect Bank', 'regular', 4, 382),
          createPlaceholder(h, 'Upcoming Payments', 'regular', 6, 735),
          createPlaceholder(h, 'Roller Shades', 'regular', 4, 362),
        ),
        createColumn(
          h,
          'stocks',
          createPlaceholder(h, 'Stock Performance', 'regular', 5, 414),
          createPlaceholder(h, 'Explore Catalog', 'regular', 4, 382),
          createPlaceholder(h, 'Set a new milestone', 'regular', 4, 393),
          createPlaceholder(h, 'Social Links', 'regular', 5, 455),
          createPlaceholder(h, 'Notifications', 'regular', 5, 446),
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
          h.div
            .class('preview-chart-header')
            .children(
              h.div.children(
                h.h1.children('Total Visitors'),
                h.p.children('Total for the last three months'),
              ),
              h.span.children('Last 3 months'),
            ),
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
              h.span.children('Target'),
              h.span.children('Reviewer'),
            ),
          ...[
            ['Cover page', 'Cover page', 'In Process', '18', 'Eddie Lake'],
            [
              'Table of contents',
              'Table of contents',
              'Done',
              '29',
              'Jamik Tashpulatov',
            ],
            ['Executive summary', 'Narrative', 'Done', '10', 'Assign reviewer'],
            ['Technical approach', 'Narrative', 'Done', '27', 'Eddie Lake'],
            ['Design', 'Narrative', 'In Process', '2', 'Assign reviewer'],
            [
              'Capabilities',
              'Narrative',
              'Not Started',
              '20',
              'Jamik Tashpulatov',
            ],
            ['Integration plan', 'Narrative', 'In Process', '19', 'Eddie Lake'],
            ['Appendix', 'Appendix', 'Not Started', '12', 'Assign reviewer'],
          ].map(([name, type, status, target, reviewer]) =>
            h.div
              .key(name ?? '')
              .class('preview-table-row')
              .children(
                h.span.children(name ?? ''),
                h.span.children(type ?? ''),
                h.b.children(status ?? ''),
                h.span.children(target ?? ''),
                h.span.children(reviewer ?? ''),
              ),
          ),
          h.div
            .class('preview-table-footer')
            .children(
              h.span.children('0 of 8 rows selected.'),
              h.span.children('Rows per page 10'),
              h.span.children('Page 1 of 1'),
              h.span.children('Previous 1 Next'),
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

const blockSidebar = (
  h: Html.H<DocsMessage>,
  product: 'orbit' | 'northwind',
) => {
  const isOrbit = product === 'orbit'
  const items = isOrbit
    ? ['Overview', 'Growth', 'Projects', 'Services', 'Incidents']
    : ['Board', 'Inbox', 'Orders', 'Catalog', 'Checkout', 'Metrics']
  return h.aside.class('exec-sidebar').children(
    h.div
      .class('exec-brand')
      .children(
        isOrbit ? 'OS' : 'NW',
        h.strong.children(isOrbit ? 'Orbit Studio' : 'Northwind'),
      ),
    h.span.class('preview-nav-label').children('Workspace'),
    h.nav.children(
      ...items.map((item, index) =>
        h.a
          .key(item)
          .attr('aria-current', index === 0 ? 'page' : undefined)
          .children(item),
      ),
    ),
    h.div
      .class('exec-user')
      .children(
        isOrbit ? 'AL' : 'JL',
        h.span.children(isOrbit ? 'Alex Lee' : 'Jules Lane'),
      ),
  )
}

const skeletonTitles: Readonly<Record<string, readonly [string, string]>> = {
  'creaseui-project-status': [
    'Project Atlas',
    'Launch status · General availability',
  ],
  'creaseui-service-monitoring': [
    'Service monitoring',
    'Production · all systems checked',
  ],
  'creaseui-incident-console': [
    'Incident console',
    '6 active · 2 require attention',
  ],
  'creaseui-kanban-board': [
    'Sprint board',
    'Atlas release · sprint 14 · 11 open tasks',
  ],
  'creaseui-inbox-table': ['Inbox', '12 unread · synced 1 minute ago'],
  'creaseui-order-detail': [
    'Order #1043',
    'Placed Sep 18 · 2:41 PM · Storefront',
  ],
  'creaseui-checkout-form': ['Checkout', 'Order #1043 · 3 items'],
  'creaseui-data-dashboard': [
    'Data dashboard',
    'Comparison reporting · refreshed 8 minutes ago',
  ],
  'creaseui-card-grid': [
    'Asset catalog',
    'Curated templates, icon sets and fonts',
  ],
}

const dashboardSkeleton = (h: Html.H<DocsMessage>, name: string) =>
  h.div
    .class('preview-shell')
    .children(
      name.startsWith('creaseui-')
        ? blockSidebar(
            h,
            skeletonTitles[name] !== undefined &&
              (name === 'creaseui-project-status' ||
                name === 'creaseui-service-monitoring' ||
                name === 'creaseui-incident-console')
              ? 'orbit'
              : 'northwind',
          )
        : previewSidebar(h),
      h.main
        .class('preview-main')
        .children(
          h.header
            .class('preview-topbar')
            .children(
              h.span.children('☰'),
              h.span.children(
                skeletonTitles[name] !== undefined
                  ? name.startsWith('creaseui-kanban') ||
                    name.startsWith('creaseui-inbox') ||
                    name.startsWith('creaseui-order') ||
                    name.startsWith('creaseui-checkout') ||
                    name.startsWith('creaseui-data') ||
                    name.startsWith('creaseui-card')
                    ? 'Northwind'
                    : 'Orbit Studio'
                  : 'CreaseUI',
              ),
              h.span.children(skeletonTitles[name]?.[0] ?? 'GitHub'),
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
                    h.h1.children(skeletonTitles[name]?.[0] ?? name),
                    h.p.children(
                      skeletonTitles[name]?.[1] ?? 'Live block preview',
                    ),
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

const executivePreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell').children(
    h.aside.class('exec-sidebar').children(
      h.div
        .class('exec-brand')
        .children('OS', h.strong.children('Orbit Studio')),
      h.span.class('preview-nav-label').children('Workspace'),
      h.nav.children(
        ...['Overview', 'Growth', 'Projects', 'Services', 'Incidents'].map(
          (item, index) =>
            h.a
              .key(item)
              .attr('aria-current', index === 0 ? 'page' : undefined)
              .children(item),
        ),
      ),
      h.div.class('exec-user').children('AL', h.span.children('Alex Lee')),
    ),
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Orbit Studio'),
          h.span.children('Executive summary'),
        ),
      h.div.class('exec-content').children(
        h.div.class('exec-body').children(
          h.header
            .class('exec-heading')
            .children(
              h.div.children(
                h.h1.children('Executive summary'),
                h.p.children(
                  'Quarterly business review · updated 12 minutes ago',
                ),
              ),
              h.div
                .class('exec-actions')
                .children(
                  h.span.children('Week'),
                  h.span.attr('aria-current', 'page').children('Quarter'),
                  h.span.children('Export'),
                ),
            ),
          h.div.class('exec-metrics').children(
            ...[
              ['Revenue', '+8.4% QoQ', '$4.82M'],
              ['Gross margin', '-0.6 pts', '71.2%'],
              ['Net retention', '+3.1 pts', '118%'],
              ['Pipeline', '+16% QoQ', '$12.4M'],
            ].map(([label, delta, value]) =>
              h.section
                .key(label ?? '')
                .children(
                  h.div.children(
                    h.span.children(label ?? ''),
                    h.b.children(delta ?? ''),
                  ),
                  h.strong.children(value ?? ''),
                ),
            ),
          ),
          h.section.class('exec-objectives').children(
            h.h2.children('Objective attainment'),
            h.p.children(
              'Company objectives weighted by expected business impact',
            ),
            ...[
              ['Expand enterprise', '78%'],
              ['Improve activation', '64%'],
              ['Reduce infrastructure cost', '41%'],
            ].map(([label, value]) =>
              h.div
                .key(label ?? '')
                .class('exec-objective')
                .children(
                  h.span.children(label ?? ''),
                  h.div.children(h.i.style({ width: value ?? '' })),
                  h.strong.children(value ?? ''),
                ),
            ),
          ),
          h.div
            .class('exec-charts')
            .children(
              h.section.children(
                h.h2.children('Revenue trend'),
                h.p.children('Trailing eight periods'),
                h.div.class('exec-area-chart'),
              ),
              h.section.children(
                h.h2.children('Customer growth'),
                h.p.children('New accounts by period'),
                h.div
                  .class('exec-bar-chart')
                  .children(
                    ...[38, 62, 46, 76, 58, 84, 68, 92].map(height =>
                      h.i.key(String(height)).style({ height: `${height}%` }),
                    ),
                  ),
              ),
            ),
        ),
        h.aside.class('exec-insights').children(
          h.h2.children('What changed & why'),
          h.p.children('Generated from weekly operating data'),
          ...[
            [
              'Enterprise expansion',
              'Pipeline growth is concentrated in larger annual contracts.',
            ],
            [
              'Retention improved',
              'Activation changes reduced early churn by 1.8 points.',
            ],
            [
              'Margin watch',
              'Infrastructure costs grew faster than usage in Europe.',
            ],
          ].map(([title, copy]) =>
            h.section
              .key(title ?? '')
              .children(
                h.strong.children(title ?? ''),
                h.p.children(copy ?? ''),
              ),
          ),
        ),
      ),
    ),
  )

const funnelPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell funnel-shell').children(
    h.aside.class('exec-sidebar').children(
      h.div
        .class('exec-brand')
        .children('OS', h.strong.children('Orbit Studio')),
      h.span.class('preview-nav-label').children('Workspace'),
      h.nav.children(
        ...['Overview', 'Growth', 'Projects', 'Services', 'Incidents'].map(
          item =>
            h.a
              .key(item)
              .attr('aria-current', item === 'Growth' ? 'page' : undefined)
              .children(item),
        ),
      ),
      h.div.class('exec-user').children('AL', h.span.children('Alex Lee')),
    ),
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Orbit Studio'),
          h.span.children('Growth funnel'),
        ),
      h.div.class('funnel-content').children(
        h.header
          .class('exec-heading')
          .children(
            h.div.children(
              h.h1.children('Growth funnel'),
              h.p.children('Acquisition and retention performance'),
            ),
            h.div
              .class('exec-actions')
              .children(
                h.span.children('30 days'),
                h.span.children('All segments'),
              ),
          ),
        h.div.class('exec-metrics').children(
          ...[
            ['Visitor', 'signup', '+1.2 pts', '14.8%'],
            ['Signup', 'active', '+4.8 pts', '62.4%'],
            ['Active', 'paid', '-0.9 pts', '18.1%'],
            ['Overall conversion', '', '+0.2 pts', '1.67%'],
          ].map(([from, to, delta, value]) =>
            h.section
              .key((from ?? '') + (to ?? ''))
              .children(
                h.div.children(
                  h.span.children(
                    `${from ?? ''}${to === '' ? '' : ` → ${to ?? ''}`}`,
                  ),
                  h.b.children(delta ?? ''),
                ),
                h.strong.children(value ?? ''),
              ),
          ),
        ),
        h.section.class('funnel-panel').children(
          h.h2.children('Conversion funnel'),
          h.p.children('Last 30 days · all acquisition channels'),
          ...[
            ['Visited', '100k', '100%'],
            ['Signed up', '72k', '72%'],
            ['Activated', '48k', '48%'],
            ['Subscribed', '21k', '21%'],
          ].map(([label, value, width]) =>
            h.div
              .key(label ?? '')
              .class('funnel-row')
              .children(
                h.span.children(label ?? ''),
                h.div.children(h.i.style({ width: width ?? '' })),
                h.strong.children(value ?? ''),
              ),
          ),
        ),
        h.section
          .class('funnel-panel funnel-chart-panel')
          .children(
            h.h2.children('Conversion over time'),
            h.p.children('Weekly visitor-to-paid conversion'),
            h.div.class('exec-area-chart'),
          ),
        h.section.class('funnel-panel cohort-panel').children(
          h.h2.children('Cohort retention'),
          h.p.children('Weekly activation retention'),
          h.div.class('cohort-table').children(
            h.div
              .class('cohort-row head')
              .children(
                h.span.children('Cohort'),
                h.span.children('Week 0'),
                h.span.children('Week 1'),
                h.span.children('Week 2'),
                h.span.children('Week 3'),
              ),
            ...[
              ['Aug 04', '100%', '68%', '51%', '43%'],
              ['Aug 11', '100%', '71%', '55%', '—'],
              ['Aug 18', '100%', '74%', '—', '—'],
            ].map(row =>
              h.div
                .key(row[0] ?? '')
                .class('cohort-row')
                .children(
                  row.map((cell, index) =>
                    h.span.key(`${row[0] ?? ''}-${index}`).children(cell ?? ''),
                  ),
                ),
            ),
          ),
        ),
      ),
    ),
  )

const kanbanPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell kanban-shell').children(
    blockSidebar(h, 'northwind') as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Northwind'),
          h.span.children('Sprint board'),
        ),
      h.div.class('kanban-content').children(
        h.header
          .class('exec-heading')
          .children(
            h.div.children(
              h.h1.children('Sprint board'),
              h.p.children('Atlas release · sprint 14 · 11 open tasks'),
            ),
            h.div
              .class('exec-actions')
              .children(
                h.span.children('All assignees'),
                h.span.children('This sprint'),
                h.span.children('New task'),
              ),
          ),
        h.div.class('kanban-columns').children(
          ...(
            [
              [
                'Backlog',
                '3',
                [
                  ['Reporting', 'Usage analytics for admin roles', 'MC4'],
                  ['Feature', 'Bulk import wizard for inventory', 'IN2'],
                  ['Design', 'Empty state for archived projects', 'JP1'],
                ],
              ],
              [
                'In progress',
                '3 / 3',
                [
                  ['Feature', 'Keyboard shortcuts for the board', 'AS6'],
                  ['Bug', 'Migration retries on large accounts', 'IN3'],
                  ['Feature', 'Granular notification preferences', 'MC5'],
                ],
              ],
              [
                'Review',
                '2',
                [
                  ['Reporting', 'Session timeline for audit log', 'AS2'],
                  ['QA', 'Regression test for invite flow', 'JP1'],
                ],
              ],
              [
                'Done',
                '3',
                [
                  ['Design', 'Compact density for list views', 'MC8'],
                  ['Ops', 'Webhook replay tooling', 'IN2'],
                  ['Ops', 'Staging environment refresh', 'AS1'],
                ],
              ],
            ] as ReadonlyArray<
              readonly [
                string,
                string,
                ReadonlyArray<readonly [string, string, string]>,
              ]
            >
          ).map(([column, count, cards]) =>
            h.section
              .key(column ?? '')
              .class('kanban-column')
              .children(
                h.header.children(
                  h.h2.children(column ?? ''),
                  h.span.children(count ?? ''),
                ),
                ...(
                  cards as ReadonlyArray<readonly [string, string, string]>
                ).map(([kind, title, owner]) =>
                  h.article
                    .key(title)
                    .children(
                      h.div.children(
                        h.b.children(kind),
                        h.span.children(owner),
                      ),
                      h.strong.children(title),
                    ),
                ),
              ),
          ),
        ),
      ),
    ),
  )

const projectStatusPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell project-shell').children(
    blockSidebar(h, 'orbit') as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Orbit Studio'),
          h.span.children('Projects'),
        ),
      h.div.class('funnel-content project-content').children(
        h.header
          .class('exec-heading')
          .children(
            h.div.children(
              h.h1.children('Project Atlas'),
              h.p.children('Launch status · General availability'),
            ),
            h.div
              .class('exec-actions')
              .children(
                h.span.children('Phase: All'),
                h.span.children('Update status'),
              ),
          ),
        h.div
          .class('project-top-grid')
          .children(
            h.section
              .class('project-panel project-progress')
              .children(
                h.h2.children('Task progress'),
                h.p.children('Weighted by story points · 68% complete'),
                h.div.class('project-donut').children(h.span.children('68%')),
              ),
            h.section
              .class('project-panel')
              .children(
                h.h2.children('Scope burndown'),
                h.p.children('Remaining story points'),
                h.div.class('exec-area-chart'),
              ),
          ),
        h.section.class('project-panel timeline-panel').children(
          h.h2.children('Launch timeline'),
          h.p.children('Release milestones and completion'),
          ...[
            ['Foundation', 'Done'],
            ['Private beta', 'On track'],
            ['General availability', 'At risk'],
          ].map(([label, status], index) =>
            h.div
              .key(label ?? '')
              .class('timeline-row')
              .children(
                h.i.attr(
                  'data-status',
                  index === 0 ? 'done' : index === 1 ? 'track' : 'risk',
                ),
                h.span.children(label ?? ''),
                h.strong.children(status ?? ''),
              ),
          ),
        ),
        h.section.class('project-panel workstream-panel').children(
          h.div
            .class('workstream-head')
            .children(
              h.div.children(
                h.h2.children('Workstreams'),
                h.p.children('All Beta GA'),
              ),
            ),
          h.div
            .class('workstream-row head')
            .children(
              h.span.children('Workstream'),
              h.span.children('Owner'),
              h.span.children('Complete'),
              h.span.children('Due'),
              h.span.children('Status'),
            ),
          ...[
            ['Core platform', 'Maya Chen', '82%', 'Sep 12', 'On track'],
            ['Migration tooling', 'Ibrahim Noor', '63%', 'Sep 18', 'Watch'],
            ['Documentation', 'Jo Park', '48%', 'Sep 24', 'On track'],
            ['Partner rollout', 'Ana Silva', '29%', 'Oct 03', 'Blocked'],
          ].map(row =>
            h.div
              .key(row[0] ?? '')
              .class('workstream-row')
              .children(
                row.map((cell, index) =>
                  h.span.key(`${row[0] ?? ''}-${index}`).children(cell ?? ''),
                ),
              ),
          ),
        ),
        h.section.class('project-panel risk-panel').children(
          h.h2.children('Blockers & risks'),
          ...[
            [
              'Partner API approval',
              'External review is two days behind the launch plan.',
            ],
            [
              'Migration throughput',
              'Large accounts need a second batch window.',
            ],
          ].map(([title, copy]) =>
            h.article
              .key(title ?? '')
              .children(
                h.strong.children(title ?? ''),
                h.p.children(copy ?? ''),
              ),
          ),
        ),
      ),
    ),
  )

const serviceMonitoringPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell service-shell').children(
    blockSidebar(h, 'orbit') as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Orbit Studio'),
          h.span.children('Services'),
        ),
      h.div.class('service-content').children(
        h.div.class('service-main').children(
          h.header
            .class('exec-heading')
            .children(
              h.div.children(
                h.h1.children('Service monitoring'),
                h.p.children('Production · all systems checked 34 seconds ago'),
              ),
              h.div
                .class('exec-actions')
                .children(
                  h.span.children('1h'),
                  h.span.children('1d'),
                  h.span.children('Region: Global'),
                ),
            ),
          h.div.class('exec-metrics').children(
            ...[
              ['Availability', '+0.02 pts', '99.94%'],
              ['P95 latency', '+31ms', '184ms'],
              ['Requests', '+12%', '28.4k/s'],
              ['Error rate', '+0.06 pts', '0.18%'],
            ].map(([label, delta, value]) =>
              h.section
                .key(label ?? '')
                .children(
                  h.div.children(
                    h.span.children(label ?? ''),
                    h.b.children(delta ?? ''),
                  ),
                  h.strong.children(value ?? ''),
                ),
            ),
          ),
          h.div
            .class('service-charts')
            .children(
              h.section.children(
                h.h2.children('Request volume'),
                h.p.children('Requests per second'),
                h.div.class('exec-area-chart'),
              ),
              h.section.children(
                h.h2.children('P95 latency'),
                h.p.children('Milliseconds by interval'),
                h.div
                  .class('exec-bar-chart')
                  .children(
                    ...[42, 58, 45, 72, 64, 82, 70, 88].map(height =>
                      h.i.key(String(height)).style({ height: `${height}%` }),
                    ),
                  ),
              ),
            ),
        ),
        h.aside.class('service-rail').children(
          h.section.children(
            h.h2.children('Active alerts'),
            ...[
              ['Elevated latency', 'api-eu-west · started 8m ago'],
              ['Queue saturation', 'worker-billing · started 21m ago'],
            ].map(([title, copy]) =>
              h.article
                .key(title ?? '')
                .children(
                  h.strong.children(title ?? ''),
                  h.p.children(copy ?? ''),
                ),
            ),
          ),
          h.section.class('service-health').children(
            h.h2.children('Service health'),
            ...[
              ['API gateway', '99.99%', 'Healthy'],
              ['Billing worker', '98.72%', 'Degraded'],
              ['Search index', '99.91%', 'Healthy'],
              ['Email delivery', '99.43%', 'Watch'],
            ].map(([service, uptime, status]) =>
              h.div
                .key(service ?? '')
                .class('service-health-row')
                .children(
                  h.span.children(service ?? ''),
                  h.span.children(uptime ?? ''),
                  h.strong.children(status ?? ''),
                ),
            ),
          ),
        ),
      ),
    ),
  )

const incidentConsolePreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell incident-shell').children(
    blockSidebar(h, 'orbit') as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Orbit Studio'),
          h.span.children('Incidents'),
        ),
      h.div.class('service-content incident-content').children(
        h.div.class('service-main').children(
          h.header
            .class('exec-heading')
            .children(
              h.div.children(
                h.h1.children('Incident console'),
                h.p.children('Coordinate response across production services.'),
              ),
              h.div
                .class('exec-actions incident-actions')
                .children(
                  h.span.children('All'),
                  h.span.children('Triggered'),
                  h.span.children('Create incident'),
                ),
            ),
          h.section.class('incident-list').children(
            h.h2.children('Active incidents'),
            h.div
              .class('incident-filter')
              .children(
                h.span.children('Search incidents'),
                h.span.children('Status: Open'),
              ),
            h.div
              .class('incident-table head')
              .children(
                h.span.children('Incident'),
                h.span.children('Severity'),
                h.span.children('Owner'),
                h.span.children('Status'),
              ),
            ...[
              ['INC-2048 Checkout latency', 'SEV-1', 'Platform', 'Triggered'],
              ['INC-2047 Delayed invoices', 'SEV-2', 'Billing', 'Acknowledged'],
              ['INC-2044 Search freshness', 'SEV-3', 'Search', 'Mitigating'],
              ['INC-2041 Email retries', 'SEV-3', 'Messaging', 'Monitoring'],
            ].map(row =>
              h.div
                .key(row[0] ?? '')
                .class('incident-table')
                .children(
                  row.map((cell, index) =>
                    h.span.key(`${row[0] ?? ''}-${index}`).children(cell ?? ''),
                  ),
                ),
            ),
          ),
        ),
        h.aside.class('service-rail incident-detail').children(
          h.h2.children('Incident INC-2048'),
          h.p.children('Checkout API latency'),
          ...[
            ['Severity', 'SEV-1'],
            ['Owner', 'On-call Platform'],
            ['Started', '14:32 UTC'],
          ].map(([label, value]) =>
            h.div
              .key(label ?? '')
              .class('incident-meta')
              .children(
                h.span.children(label ?? ''),
                h.strong.children(value ?? ''),
              ),
          ),
          h.div.class('incident-timeline').children(
            ...[
              ['14:32', 'Latency alert triggered for checkout API.'],
              ['14:38', 'Database connection pool reached capacity.'],
              ['14:47', 'Traffic shifted away from eu-west-1.'],
            ]
              .reverse()
              .map(([time, copy]) =>
                h.div
                  .key(time ?? '')
                  .children(
                    h.span.children(time ?? ''),
                    h.p.children(copy ?? ''),
                  ),
              ),
          ),
        ),
      ),
    ),
  )

const inboxSidebar = (h: Html.H<DocsMessage>) =>
  h.aside.class('exec-sidebar inbox-sidebar').children(
    h.div
      .class('preview-brand')
      .children(h.b.children('N'), h.span.children('Northwind')),
    h.nav.children(
      ...['Inbox', 'Starred', 'Sent', 'Drafts', 'Archive'].map((item, index) =>
        h.span
          .key(item)
          .attr('data-active', index === 0 ? 'true' : 'false')
          .children(item),
      ),
    ),
    h.nav
      .class('inbox-labels')
      .children(
        ...['Customers', 'Ops', 'Receipts'].map(item =>
          h.span.key(item).children(item),
        ),
      ),
    h.div
      .class('preview-user')
      .children(h.b.children('JL'), h.span.children('Jules Lane')),
  )

const inboxTablePreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell inbox-shell').children(
    inboxSidebar(h) as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Northwind'),
          h.span.children('Inbox'),
        ),
      h.div.class('service-content inbox-content').children(
        h.div.class('inbox-page').children(
          h.header
            .class('exec-heading')
            .children(
              h.div.children(
                h.h1.children('Inbox'),
                h.p.children('Customer and operations mail for Northwind.'),
              ),
              h.div
                .class('exec-actions')
                .children(
                  h.span.children('Search mail'),
                  h.span.children('Compose'),
                ),
            ),
          h.section.class('inbox-list').children(
            h.h2.children('Messages'),
            h.div
              .class('inbox-tabs')
              .children(
                h.span.attr('data-active', 'true').children('All'),
                h.span.children('Unread'),
                h.span.children('Starred'),
                h.strong.children('Newest first'),
              ),
            h.div
              .class('inbox-row head')
              .children(
                h.span.children('Sender'),
                h.span.children('Subject'),
                h.span.children('Tags'),
                h.span.children('Received'),
              ),
            ...[
              ['Nora Patel', 'Re: Q4 restock forecast', 'Customers', '9:41 AM'],
              [
                'Ops Bot',
                'Deploy finished: storefront v2.31',
                'Ops',
                '9:12 AM',
              ],
              ['Kofi Mensah', 'Invoice #2184 paid', 'Receipts', 'Yesterday'],
              [
                'Priya Nair',
                'Question about the trade program',
                'Customers',
                'Yesterday',
              ],
              ['Liam Ortiz', 'Dock schedule for October', 'Ops', 'Monday'],
            ].map(row =>
              h.div
                .key(row[0] ?? '')
                .class('inbox-row')
                .children(
                  row.map((cell, index) =>
                    h.span.key(`${row[0] ?? ''}-${index}`).children(cell ?? ''),
                  ),
                ),
            ),
          ),
        ),
      ),
    ),
  )

const orderDetailPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell order-shell').children(
    blockSidebar(h, 'northwind') as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Northwind'),
          h.span.children('Orders'),
        ),
      h.div.class('service-content order-content').children(
        h.div.class('order-main').children(
          h.header
            .class('exec-heading order-heading')
            .children(
              h.div.children(
                h.h1.children('Order #1043'),
                h.p.children('Placed Sep 18 · 2:41 PM · Storefront'),
                h.div
                  .class('order-status')
                  .children(
                    h.span.children('Paid'),
                    h.span.children('Fulfilling'),
                  ),
              ),
              h.div
                .class('exec-actions')
                .children(
                  h.span.children('Refund'),
                  h.span.children('Print'),
                  h.span.children('Mark fulfilled'),
                ),
            ),
          h.section.class('order-summary').children(
            ...[
              ['Customer', 'Robin Adler', 'robin@adlergoods.com'],
              ['Channel', 'Storefront', 'Web checkout'],
              ['Delivery', 'Express', 'Arrives Sep 22'],
              ['Total', '$248.00', '3 items'],
            ].map(([label, value, detail]) =>
              h.div
                .key(label ?? '')
                .children(
                  h.span.children(label ?? ''),
                  h.strong.children(value ?? ''),
                  h.small.children(detail ?? ''),
                ),
            ),
          ),
          h.section.class('order-lines').children(
            h.h2.children('Line items'),
            h.div
              .class('order-row head')
              .children(
                h.span.children('Item'),
                h.span.children('SKU'),
                h.span.children('Qty'),
                h.span.children('Price'),
                h.span.children('Total'),
              ),
            ...[
              [
                'Canvas Field Jacket',
                'JK-102 · Olive / M',
                '1',
                '$168.00',
                '$168.00',
              ],
              [
                'Merino Crew Sock · 3 pack',
                'SK-310 · Charcoal',
                '2',
                '$32.00',
                '$64.00',
              ],
              ['Enamel Camp Mug', 'MG-205 · Cream', '1', '$16.00', '$16.00'],
            ].map(row =>
              h.div
                .key(row[0] ?? '')
                .class('order-row')
                .children(
                  row.map((cell, index) =>
                    h.span.key(`${row[0] ?? ''}-${index}`).children(cell ?? ''),
                  ),
                ),
            ),
            h.div.class('order-totals').children(
              ...[
                ['Subtotal', '$248.00'],
                ['Shipping', '$12.00'],
                ['Tax', '$0.00'],
                ['Total', '$272.00'],
              ].map(([label, value]) =>
                h.div
                  .key(label ?? '')
                  .children(
                    h.span.children(label ?? ''),
                    h.strong.children(value ?? ''),
                  ),
              ),
            ),
          ),
          h.section
            .class('order-delivery')
            .children(
              h.h2.children('Delivery'),
              h.div
                .class('delivery-cards')
                .children(
                  h.article.children(
                    h.strong.children('Address'),
                    h.p.children('Robin Adler · 44 Beacon St, Boston MA 02108'),
                  ),
                  h.article.children(
                    h.strong.children('Method'),
                    h.p.children('Express · delivered by carrier'),
                  ),
                ),
            ),
        ),
        h.aside.class('service-rail order-activity').children(
          h.h2.children('Activity'),
          h.p.children('Most recent first'),
          h.div.class('incident-timeline').children(
            ...[
              ['Label created', 'UPS 1Z 999 AA1 0123 4567 84 · 4:12 PM'],
              ['Payment captured', '$248.00 on Visa ·· 4242 · 2:44 PM'],
              ['Order placed', 'Storefront checkout · 2:41 PM'],
            ].map(([title, copy]) =>
              h.div
                .key(title ?? '')
                .children(
                  h.strong.children(title ?? ''),
                  h.p.children(copy ?? ''),
                ),
            ),
          ),
        ),
      ),
    ),
  )

const checkoutFormPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell checkout-shell').children(
    blockSidebar(h, 'northwind') as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Northwind'),
          h.span.children('Checkout'),
        ),
      h.div.class('service-content checkout-content').children(
        h.div.class('checkout-main').children(
          h.header
            .class('exec-heading checkout-heading')
            .children(
              h.div.children(
                h.h1.children('Checkout'),
                h.p.children('Order #1043 · 3 items'),
              ),
              h.span.class('checkout-secure').children('Secure'),
            ),
          h.section
            .class('checkout-section')
            .children(
              h.h2.children('Contact'),
              h.p.children('Receipt and tracking go here'),
              h.div
                .class('checkout-grid')
                .children(
                  h.label.children(h.span.children('Email'), h.i),
                  h.label.children(h.span.children('Phone'), h.i),
                ),
            ),
          h.section
            .class('checkout-section shipping-section')
            .children(
              h.h2.children('Shipping'),
              h.div
                .class('checkout-grid')
                .children(
                  h.label.children(h.span.children('First name'), h.i),
                  h.label.children(h.span.children('Last name'), h.i),
                  h.label
                    .class('wide')
                    .children(h.span.children('Address'), h.i),
                  h.label.children(h.span.children('City'), h.i),
                  h.label.children(h.span.children('Postal code'), h.i),
                  h.label
                    .class('wide')
                    .children(
                      h.span.children('Country'),
                      h.i.children('United States'),
                    ),
                ),
            ),
          h.section.class('checkout-section delivery-section').children(
            h.h2.children('Delivery method'),
            h.p.children('Affects the order total'),
            ...[
              ['Standard', 'Free · arrives Sep 28'],
              ['Express', '$12.00 · arrives Sep 22'],
              ['Store pickup', 'Free · South End depot'],
            ].map(([label, detail], index) =>
              h.div
                .key(label ?? '')
                .class('delivery-option')
                .attr('data-active', index === 1 ? 'true' : 'false')
                .children(
                  h.b,
                  h.div.children(
                    h.strong.children(label ?? ''),
                    h.p.children(detail ?? ''),
                  ),
                ),
            ),
          ),
          h.section
            .class('checkout-section payment-section')
            .children(
              h.h2.children('Payment'),
              h.div
                .class('checkout-grid')
                .children(
                  h.label
                    .class('wide')
                    .children(h.span.children('Card number'), h.i),
                  h.label.children(h.span.children('Expiry'), h.i),
                  h.label.children(h.span.children('CVC'), h.i),
                ),
              h.div.class('wallet-divider').children('Or pay with'),
              h.div.class('wallet-button').children('Wallet'),
            ),
        ),
        h.aside.class('service-rail checkout-summary').children(
          h.h2.children('Order summary'),
          h.p.children('Updates as delivery changes'),
          ...[
            ['Canvas Field Jacket', 'Qty 1', '$168.00'],
            ['Merino Crew Sock · 3 pack', 'Qty 2', '$64.00'],
            ['Enamel Camp Mug', 'Qty 1', '$16.00'],
          ].map(([name, qty, price]) =>
            h.div
              .key(name ?? '')
              .class('summary-item')
              .children(
                h.b,
                h.div.children(
                  h.strong.children(name ?? ''),
                  h.p.children(qty ?? ''),
                ),
                h.span.children(price ?? ''),
              ),
          ),
          h.div.class('summary-totals').children(
            ...[
              ['Subtotal', '$248.00'],
              ['Shipping', '$8.00'],
              ['Tax', '$12.40'],
              ['Total', '$268.40'],
            ].map(([label, value]) =>
              h.div
                .key(label ?? '')
                .children(
                  h.span.children(label ?? ''),
                  h.strong.children(value ?? ''),
                ),
            ),
          ),
          h.div.class('pay-button').children('Pay $268.40'),
          h.p
            .class('checkout-note')
            .children('Secure checkout · 30-day returns'),
        ),
      ),
    ),
  )

const dataDashboardPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell data-shell').children(
    blockSidebar(h, 'northwind') as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Northwind'),
          h.span.children('Metrics'),
        ),
      h.div.class('data-content').children(
        h.header
          .class('exec-heading')
          .children(
            h.div.children(
              h.h1.children('Data dashboard'),
              h.p.children('Comparison reporting · refreshed 8 minutes ago'),
            ),
            h.div
              .class('exec-actions')
              .children(h.span.children('Save view'), h.span.children('Share')),
          ),
        h.div
          .class('data-controls')
          .children(
            h.span.children('Last 30 days'),
            h.span.children('All channels'),
            h.span.children('All regions'),
            h.span.children('Compare: prior period'),
            h.strong.children('Export'),
          ),
        h.div.class('data-metrics').children(
          ...[
            [
              'Revenue',
              '+12.1%',
              '$182.4K',
              'vs 7d +4.2%',
              'vs 30d +9.8%',
              'plan −1.2%',
            ],
            [
              'Active sessions',
              '+6.4%',
              '48.2K',
              'vs 7d +1.9%',
              'vs 30d +6.4%',
              'plan +2.0%',
            ],
            [
              'Conversion',
              '−0.3%',
              '3.42%',
              'vs 7d −0.3%',
              'vs 30d +0.4%',
              'plan −0.2%',
            ],
            [
              'Activation',
              '+3.7%',
              '41.8%',
              'vs 7d +0.9%',
              'vs 30d +3.7%',
              'plan +1.4%',
            ],
          ].map(([label, delta, value, a, b, c]) =>
            h.section
              .key(label ?? '')
              .children(
                h.div.children(
                  h.span.children(label ?? ''),
                  h.b.children(delta ?? ''),
                ),
                h.strong.children(value ?? ''),
                h.div.class('data-sparkline'),
                h.footer.children(
                  h.span.children(a ?? ''),
                  h.span.children(b ?? ''),
                  h.span.children(c ?? ''),
                ),
              ),
          ),
        ),
        h.div.class('data-breakdowns').children(
          ...(
            [
              [
                'Breakdown by channel',
                'Channel',
                [
                  ['Organic search', '$74.2K', '$66.8K', '+11.1%'],
                  ['Direct', '$41.9K', '$40.1K', '+4.5%'],
                  ['Referral', '$32.6K', '$35.4K', '−7.9%'],
                  ['Paid social', '$33.7K', '$25.2K', '+33.7%'],
                ],
              ],
              [
                'Breakdown by region',
                'Region',
                [
                  ['North America', '$96.4K', '$88.2K', '+9.3%'],
                  ['Europe', '$58.1K', '$55.6K', '+4.5%'],
                  ['Asia Pacific', '$21.3K', '$19.8K', '+7.6%'],
                  ['Other', '$6.6K', '$7.9K', '−16.5%'],
                ],
              ],
            ] as const
          ).map(([title, first, rows]) =>
            h.section
              .key(title)
              .class('data-table')
              .children(
                h.h2.children(title),
                h.div
                  .class('data-row head')
                  .children(
                    h.span.children(first),
                    h.span.children('This period'),
                    h.span.children('Prior'),
                    h.span.children('Delta'),
                  ),
                ...rows.map(row =>
                  h.div
                    .key(row[0])
                    .class('data-row')
                    .children(
                      row.map((cell, index) =>
                        h.span.key(`${row[0]}-${index}`).children(cell),
                      ),
                    ),
                ),
              ),
          ),
        ),
      ),
    ),
  )

const cardGridPreview = (h: Html.H<DocsMessage>) =>
  h.div.class('exec-shell cards-shell').children(
    blockSidebar(h, 'northwind') as never,
    h.main.class('exec-main').children(
      h.header
        .class('preview-topbar')
        .children(
          h.span.children('☰'),
          h.span.children('Northwind'),
          h.span.children('Catalog'),
        ),
      h.div.class('cards-content').children(
        h.div.class('cards-main').children(
          h.header
            .class('exec-heading')
            .children(
              h.div.children(
                h.h1.children('Asset catalog'),
                h.p.children('Curated templates, icon sets and fonts'),
              ),
              h.div
                .class('exec-actions')
                .children(
                  h.span.children('Newest first'),
                  h.span.children('Upload'),
                ),
            ),
          h.div
            .class('asset-search')
            .children(h.span.children('Search assets'), h.i),
          h.div.class('asset-tabs').children(
            ...['All', 'Templates', 'Icon sets', 'Fonts', 'Presets'].map(
              (item, index) =>
                h.span
                  .key(item)
                  .attr('data-active', index === 0 ? 'true' : 'false')
                  .children(item),
            ),
          ),
          h.div.class('asset-grid').children(
            ...[
              ['Studio Portfolio', 'Template', '$48', 'Saved'],
              ['Field Notes Blog', 'Template', '$32', 'Save'],
              ['Waypoint · 420 icons', 'Icon set', '$24', 'Saved'],
              ['Meridian · 260 icons', 'Icon set', '$18', 'Save'],
              ['Copper Sans family', 'Font', '$64', 'Save'],
              ['Ledger Mono', 'Font', '$40', 'Save'],
              ['Atlas Docs theme', 'Template', '$56', 'Save'],
              ['Ember chart presets', 'Preset', '$12', 'Save'],
            ].map(([title, type, price, action]) =>
              h.article
                .key(title ?? '')
                .children(
                  h.div.class('asset-thumb'),
                  h.strong.children(title ?? ''),
                  h.span.children(type ?? ''),
                  h.footer.children(
                    h.em.children(price ?? ''),
                    h.b
                      .attr('data-saved', action === 'Saved' ? 'true' : 'false')
                      .children(action ?? ''),
                  ),
                ),
            ),
          ),
        ),
        h.aside.class('service-rail saved-rail').children(
          h.h2.children('Saved for later'),
          h.p.children('Two products saved for later'),
          ...[
            ['Studio Portfolio', 'Template', '$48'],
            ['Waypoint · 420 icons', 'Icon set', '$24'],
          ].map(([title, type, price]) =>
            h.div
              .key(title ?? '')
              .class('saved-item')
              .children(
                h.i,
                h.div.children(
                  h.strong.children(title ?? ''),
                  h.p.children(type ?? ''),
                ),
                h.span.children(price ?? ''),
              ),
          ),
          h.div.class('move-cart').children('Move all to cart'),
        ),
      ),
    ),
  )

const blockPreviewView = (h: Html.H<DocsMessage>, name: string) => {
  if (name === 'dashboard-01' || name === 'chart-analytics-dashboard')
    return dashboardPreview(h)
  if (name === 'creaseui-executive-summary') return executivePreview(h)
  if (name === 'creaseui-cohort-funnel') return funnelPreview(h)
  if (name === 'creaseui-project-status') return projectStatusPreview(h)
  if (name === 'creaseui-service-monitoring') return serviceMonitoringPreview(h)
  if (name === 'creaseui-incident-console') return incidentConsolePreview(h)
  if (name === 'creaseui-kanban-board') return kanbanPreview(h)
  if (name === 'creaseui-inbox-table') return inboxTablePreview(h)
  if (name === 'creaseui-order-detail') return orderDetailPreview(h)
  if (name === 'creaseui-checkout-form') return checkoutFormPreview(h)
  if (name === 'creaseui-data-dashboard') return dataDashboardPreview(h)
  if (name === 'creaseui-card-grid') return cardGridPreview(h)
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
            'Complete sidebars, dashboards and login layouts. Explore the same blocks in Tailwind or StyleX, with live previews you can open full screen.',
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
