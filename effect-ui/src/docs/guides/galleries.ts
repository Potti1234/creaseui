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
const customizeGalleryOption = (option: any, slug: string, example: string) => {
  const series = Array.isArray(option.series) ? [...option.series] : []
  const first = { ...(series[0] ?? {}) }
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
      data: [80, 200, 174, 190, 130, 140],
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
  h.div
    .class('create-card-heading')
    .children(
      h.div.children(
        h.h2.children(title),
        subtitle === undefined ? undefined : h.p.children(subtitle),
      ),
      action === undefined
        ? undefined
        : h.button.attrs({ type: 'button' }).children(action),
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

const createPlaceholderChildren = (
  h: Html.H<DocsMessage>,
  title: string,
  lines: number,
): View.Input<DocsMessage>[] => {
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
        .class('create-savings-total')
        .children(h.strong.children('$24,000'), h.p.children('80% of $30,000')),
      h.div.class('create-progress').children(h.span.style({ width: '80%' })),
      createLine(h, 'Projected Finish', 'October 2024'),
      createLine(h, 'Monthly Average', '$1,250'),
      createLine(h, 'Top Contributor', 'Auto-Transfer'),
    ]
  }
  if (title === 'Kitchen Island') {
    return [
      createHeading(h, 'Kitchen Island', 'Hue Color Ambient'),
      h.div
        .class('create-toggle-row')
        .children(
          h.strong.children('Kitchen Island enabled'),
          h.span.class('create-toggle on').children(h.span),
        ),
      h.div
        .class('create-chip-row')
        .children(
          ['Cooking', 'Dining', 'Nightlight', 'Focus'].map(scene =>
            h.span.key(scene).children(scene),
          ),
        ),
      ...['Brightness', 'Color Temp', 'Volume', 'Fade'].map(label =>
        h.div
          .key(label)
          .class('create-slider-row')
          .children(
            h.span.children(label),
            h.div.class('create-slider').children(h.span),
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
        ['RETIREMENT', '$420,000', '65% achieved', '$273,000', '65%'],
        ['REAL ESTATE', '$85,000', '32% achieved', '$27,200', '32%'],
      ].map(([name, target, achieved, saved, width]) =>
        h.div
          .key(name ?? '')
          .class('create-target')
          .children(
            h.small.children(name ?? ''),
            h.div
              .class('create-line')
              .children(
                h.strong.children(target ?? ''),
                h.span.children(achieved ?? ''),
              ),
            h.div
              .class('create-progress')
              .children(h.span.style({ width: width ?? '0%' })),
            h.p.children(saved ?? ''),
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
      createField(h, 'Amount to Invest', '$'),
      h.div.class('create-chip-row').children(
        ['Market Order', 'Limit Order', 'Stop Order'].map((order, index) =>
          h.span
            .key(order)
            .class(index === 0 ? 'selected' : '')
            .children(order),
        ),
      ),
      h.p.children('Market orders execute at the current price.'),
      createLine(h, 'Estimated Shares', '1.95'),
      createLine(h, 'Buying Power', '$12,450.00'),
      h.button.attrs({ type: 'button' }).children('Review Order'),
      h.p.children(
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
        ['Blue Bottle Coffee', 'Food & Drink', 'Today, 10:24 AM', '-$6.50'],
        ['Whole Foods Market', 'Groceries', 'Yesterday', '-$142.30'],
        ['Stripe Payout', 'Income', 'Oct 12', '+$4,200.00'],
        ['Uber Technologies', 'Transport', 'Oct 11', '-$24.10'],
        ['Netflix Subscription', 'Entertainment', 'Oct 10', '-$19.99'],
      ].map(([name, category, date, amount]) =>
        h.div
          .key(name ?? '')
          .class('create-transaction')
          .children(
            h.div.children(
              h.strong.children(name ?? ''),
              h.span.children(category ?? ''),
            ),
            h.span.children(date ?? ''),
            h.strong
              .class(amount?.startsWith('+') ? 'positive' : '')
              .children(amount ?? ''),
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
      h.small.children('COVER ART'),
      h.div
        .class('create-upload-box')
        .children(
          h.div.class('create-plus').children('+'),
          h.h2.children('Upload Artwork'),
          h.p.children('Minimum 3000 × 3000px'),
          h.p.children('JPEG or PNG only'),
        ),
    ]
  }
  if (title === 'Payout Preferences') {
    return [
      createHeading(
        h,
        'Payout Preferences',
        'Receiving Method',
        'Close Receiving Method',
      ),
      createField(h, 'Account Holder Name'),
      h.div.class('create-method-grid').children(
        ['Bank Transfer', 'SWIFT / IBAN', 'PayPal', 'Instant Payout'].map(
          (method, index) =>
            h.div
              .key(method)
              .class(index === 0 ? 'selected' : '')
              .children(method),
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
          [35, 48, 31, 66, 82, 57, 73, 44].map((height, index) =>
            h.span.key(String(index)).style({ height: `${String(height)}%` }),
          ),
        ),
      h.div
        .class('create-power-times')
        .children(
          ['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p'].map(time =>
            h.span.key(time).children(time),
          ),
        ),
      createLine(h, 'Currently Using', '3.4 kW'),
      createLine(h, 'Solar Gen', '+1.2 kW'),
      createLine(h, 'Battery Level', '85%'),
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
        h.strong.children('November 2026'),
        h.div.class('create-calendar-grid').children(
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
            h.small.key(day).children(day),
          ),
          ...Array.from({ length: 35 }, (_, index) =>
            h.span
              .key(String(index))
              .children(index < 5 ? '' : index > 34 ? '' : String(index - 4)),
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
      createHeading(h, 'Living Room', 'Roller Shades', 'OPEN'),
      h.div.class('create-shade-visual').children(h.span),
      h.div.class('create-chip-row').children(
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
      createField(h, 'Goal Name'),
      createField(h, 'Target Amount'),
      createField(h, 'Target Date'),
      createActions(h, 'Create Goal', 'Cancel'),
    ]
  }
  if (title === 'Social Links') {
    return [
      h.h2.children('Social Links'),
      createField(h, 'Spotify Artist URL'),
      createField(h, 'Instagram Handle'),
      createField(h, 'SoundCloud URL'),
      createField(h, 'Website'),
      createActions(h, 'Save Changes', 'Discard'),
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
        .class('create-line')
        .children(
          h.span.children('Select all'),
          h.span.class('create-toggle').children(h.span),
        ),
      ...[
        ['Transaction alerts', 'Deposits, withdrawals, and transfers.'],
        ['Security alerts', 'Login attempts and account changes.'],
        ['Goal milestones', 'Updates at 25%, 50%, 75%, and 100%.'],
        ['Market updates', 'Daily portfolio summary and price alerts.'],
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
      h.button.attrs({ type: 'button' }).children('Save Preferences'),
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
      h.div.class('create-chip-row').children(
        ['General', 'Billing', 'Goals'].map((tab, index) =>
          h.span
            .key(tab)
            .class(index === 0 ? 'selected' : '')
            .children(tab),
        ),
      ),
      ...[
        [
          'How secure is my financial data with Ledger?',
          'We use bank-level AES-256 encryption, SOC 2 Type II certified infrastructure, and never store your credentials. All connections use read-only access tokens. We are a SEC registered investment advisor.',
        ],
        [
          'How do I connect my bank or investment accounts?',
          'Go to Settings > Linked Accounts and search for your institution. We support over 12,000 banks and brokerages via Plaid and MX.',
        ],
        [
          'Can I export my data for tax purposes?',
          'Yes. Navigate to Reports > Tax Export to download a CSV or PDF summary of your transactions, dividends, and capital gains for any tax year.',
        ],
      ].map(([question, answer]) =>
        h.details
          .key(question ?? '')
          .class('create-faq-item')
          .children(
            h.summary.children(question ?? ''),
            h.p.children(answer ?? ''),
          ),
      ),
      createActions(h, 'Learn More', 'Contact Support'),
    ]
  }
  if (title === 'Home') {
    return [
      createHeading(h, 'Home', 'Account options', 'Payments'),
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
          .class('create-toggle-row')
          .children(
            h.div.children(
              h.strong.children(name ?? ''),
              h.p.children(description ?? ''),
            ),
            h.span.children('›'),
          ),
      ),
    ]
  }
  if (title === 'Front Door') {
    return [
      createHeading(h, 'Front Door', 'Smart Lock Pro', 'Locked'),
      h.div
        .class('create-lock-visual')
        .children(
          h.div.class('create-lock-icon').children('●'),
          h.strong.children('Live'),
        ),
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
    .class(`create-card create-placeholder ${tone}`)
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
                    createPlaceholder(h, 'Sidebar Nav', 'regular', 5, 1002),
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
          createPlaceholder(h, 'Card Balance', 'regular', 4, 336),
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

const blockPreviewView = (h: Html.H<DocsMessage>, name: string) => {
  if (name === 'dashboard-01' || name === 'chart-analytics-dashboard')
    return dashboardPreview(h)
  if (name === 'creaseui-executive-summary') return executivePreview(h)
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
