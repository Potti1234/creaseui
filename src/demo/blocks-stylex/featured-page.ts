import type { Html, HtmlBuilder } from 'foldkit/html'
import { Schema as S } from 'effect'
import { m } from 'foldkit/message'

import { badge } from '@/stylex/badge'
import { button, buttonLink } from '@/stylex/button'
import * as TableState from '@/lib/tanstack-table-state'
import { fieldSeparator } from '@/stylex/field'
import { input } from '@/stylex/input'
import { icon } from '@/stylex/composition/icon'
import * as ECharts from '@/stylex/integrations/echarts'
import { tanStackDataTable, type TanStackDataTableColumn } from '@/stylex/tanstack/data-table'
import {
  box,
  dashboardShell,
  grid,
  inline,
  metricGrid,
  section,
  stack,
  tableRegion,
  text,
  toolbar,
} from '@/stylex/composition'
import {
  sidebar,
  sidebarContent,
  sidebarFooter,
  sidebarGroup,
  sidebarGroupContent,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuItem,
  sidebarMenuSub,
  sidebarMenuSubButton,
  sidebarMenuSubItem,
} from '@/stylex/sidebar'
import {
  cohortFunnelDashboard,
  executiveSummaryDashboard,
  incidentConsoleDashboard,
  projectStatusDashboard,
  serviceMonitoringDashboard,
} from './astryx-inspired-dashboards'
import { chartAnalyticsDashboard } from './chart-analytics-dashboard'
import { featuredVisitorsChart } from './dashboard-echarts'

type Block = Readonly<{
  description: string
  name: string
  preview: (model: Model, h: HtmlBuilder<Message>) => Html
}>

export const Model = TableState.Model
export type Model = TableState.Model
export const GotEChartMessage = m('GotBlocksStyleXEChartMessage', { message: ECharts.ChartMessage })
export const Message = S.Union([TableState.Message, GotEChartMessage])
export type Message = typeof Message.Type
export const init = (): Model => TableState.init({
  columnOrder: ['select', 'header', 'type', 'status', 'target', 'reviewer', 'actions'],
  pageSize: 10,
  pinnedColumnIds: [],
  sorting: [],
})
export const update = (model: Model, message: Message): readonly [Model, readonly []] =>
  message._tag === 'GotBlocksStyleXEChartMessage' ? [model, []] : [TableState.update(model, message), []]

const metricCard = <Message>(
  label: string,
  value: string,
  change: string,
  trend: string,
  detail: string,
  h: HtmlBuilder<Message>,
): Html =>
  box(
    {
      children: [
        stack(
          {
            children: [
              inline(
                {
                  align: 'center',
                  children: [
                    text({ children: [label], tone: 'secondary', variant: 'caption' }, h),
                    badge({ children: [change], variant: 'outline' }, h),
                  ],
                  justify: 'between',
                  width: 'full',
                },
                h,
              ),
              text({ as: 'div', children: [value], variant: 'headingMd' }, h),
              text({ children: [trend], variant: 'label' }, h),
              text({ children: [detail], tone: 'secondary', variant: 'caption' }, h),
            ],
            gap: 'sm',
          },
          h,
        ),
      ],
      padding: 'md',
      radius: 'lg',
      surface: 'card',
    },
    h,
  )

type DashboardRow = Readonly<{
  header: string
  id: string
  reviewer: string
  status: 'Done' | 'In Process' | 'Not Started'
  target: number
  type: string
}>

const dashboardRows: ReadonlyArray<DashboardRow> = [
  { id: '1', header: 'Cover page', type: 'Cover page', status: 'In Process', target: 18, reviewer: 'Eddie Lake' },
  { id: '2', header: 'Table of contents', type: 'Table of contents', status: 'Done', target: 29, reviewer: 'Jamik Tashpulatov' },
  { id: '3', header: 'Executive summary', type: 'Narrative', status: 'Done', target: 10, reviewer: 'Assign reviewer' },
  { id: '4', header: 'Technical approach', type: 'Narrative', status: 'Done', target: 27, reviewer: 'Eddie Lake' },
  { id: '5', header: 'Design', type: 'Narrative', status: 'In Process', target: 2, reviewer: 'Assign reviewer' },
  { id: '6', header: 'Capabilities', type: 'Narrative', status: 'Not Started', target: 20, reviewer: 'Jamik Tashpulatov' },
  { id: '7', header: 'Integration plan', type: 'Narrative', status: 'In Process', target: 19, reviewer: 'Eddie Lake' },
  { id: '8', header: 'Appendix', type: 'Appendix', status: 'Not Started', target: 12, reviewer: 'Assign reviewer' },
]

const dashboardColumns = (h: HtmlBuilder<Message>): ReadonlyArray<TanStackDataTableColumn<DashboardRow, Message>> => [
  { id: 'header', header: 'Header', value: (row) => row.header },
  { id: 'type', header: 'Section Type', value: (row) => row.type, cell: (row) => text({ children: [row.type], tone: 'secondary', variant: 'caption' }, h) },
  { id: 'status', header: 'Status', value: (row) => row.status, cell: (row) => badge({ children: [row.status], variant: row.status === 'Done' ? 'secondary' : 'outline' }, h) },
  { id: 'target', header: 'Target', value: (row) => row.target },
  { id: 'reviewer', header: 'Reviewer', value: (row) => row.reviewer },
  { id: 'actions', header: '', value: () => '', cell: () => button({ children: [icon({ ariaLabel: 'Open row actions', name: 'ellipsis' }, h)], size: 'icon', variant: 'ghost' }, h), canGroup: false, canHide: false, canSort: false },
]

const dashboardTable = (model: Model, h: HtmlBuilder<Message>): Html =>
  tanStackDataTable<DashboardRow, Message>(
    {
      ariaLabel: 'Document sections',
      columns: dashboardColumns(h),
      enableColumnOrder: false,
      enableColumnVisibility: true,
      enableDensity: false,
      enableRowPinning: false,
      enableRowSelection: true,
      filterPlaceholder: 'Filter sections…',
      model,
      pageSizeOptions: [5, 10, 20],
      rowKey: (row) => row.id,
      rows: dashboardRows,
      toParentMessage: (message) => message,
    },
    h,
  )

const dashboard = (model: Model, h: HtmlBuilder<Message>): Html =>
  dashboardShell(
    {
      navigation: sidebar(
        {
          children: [
            sidebarHeader({ children: [inline({ align: 'center', children: [badge({ children: ['A'], variant: 'default' }, h), text({ children: ['Acme Inc.'], variant: 'label' }, h)], gap: 'sm' }, h)] }, h),
            sidebarContent(
              {
                children: [
                  sidebarGroup({ children: [sidebarGroupContent({ children: [sidebarMenu({ children: [sidebarMenuItem({ children: [sidebarMenuButton({ children: [icon({ name: 'circle-plus' }, h), 'Quick Create'], variant: 'primary' }, h)] }, h)] }, h)] }, h)] }, h),
                  sidebarGroup(
                    {
                      children: [
                        sidebarGroupLabel({ children: ['Platform'] }, h),
                        sidebarGroupContent({ children: [sidebarMenu({ children: [
                          ['Dashboard', 'gauge'],
                          ['Lifecycle', 'list'],
                          ['Analytics', 'radar'],
                          ['Projects', 'file'],
                          ['Team', 'group'],
                        ].map(([label, iconName], index) => sidebarMenuItem({ children: [sidebarMenuButton({ children: [icon({ name: iconName ?? 'circle' }, h), label ?? ''], isActive: index === 0 }, h)] }, h)) }, h)] }, h),
                      ],
                    },
                    h,
                  ),
                  sidebarGroup({ children: [sidebarGroupLabel({ children: ['Documents'] }, h), sidebarGroupContent({ children: [sidebarMenu({ children: [
                    ['Data Library', 'database'],
                    ['Reports', 'file-chart-column'],
                    ['Word Assistant', 'file-pen-line'],
                  ].map(([label, iconName]) => sidebarMenuItem({ children: [sidebarMenuButton({ children: [icon({ name: iconName ?? 'file' }, h), label ?? ''] }, h)] }, h)) }, h)] }, h)], spacing: 'later' }, h),
                  sidebarGroup({ children: [sidebarGroupContent({ children: [sidebarMenu({ children: [
                    ['Settings', 'settings-2'],
                    ['Get Help', 'circle-help'],
                    ['Search', 'search'],
                  ].map(([label, iconName]) => sidebarMenuItem({ children: [sidebarMenuButton({ children: [icon({ name: iconName ?? 'circle' }, h), label ?? ''] }, h)] }, h)) }, h)] }, h)], spacing: 'later' }, h),
                ],
              },
              h,
            ),
            sidebarFooter({ children: [sidebarMenu({ children: [sidebarMenuItem({ children: [sidebarMenuButton({ children: [badge({ children: ['SC'], variant: 'outline' }, h), stack({ children: [text({ children: ['shadcn'], variant: 'label' }, h), text({ children: ['m@example.com'], tone: 'secondary', variant: 'caption' }, h)], gap: 'none' }, h), icon({ name: 'chevrons-up-down' }, h)], size: 'lg' }, h)] }, h)] }, h)] }, h),
          ],
          collapsible: 'none',
        },
        h,
      ),
      header: [
        inline(
          {
            children: [
              inline({ align: 'center', children: [icon({ name: 'blocks' }, h), text({ as: 'h1', children: ['Documents'], variant: 'headingSm' }, h)], gap: 'sm' }, h),
              button({ children: ['GitHub'], size: 'sm', variant: 'ghost' }, h),
            ],
            align: 'center',
            justify: 'between',
            width: 'full',
          },
          h,
        ),
      ],
      content: [
        metricGrid({ children: [
          metricCard('Total Revenue', '$1,250.00', '+12.5%', 'Trending up this month ↗', 'Visitors for the last 6 months', h),
          metricCard('New Customers', '1,234', '-20%', 'Down 20% this period ↘', 'Acquisition needs attention', h),
          metricCard('Active Accounts', '45,678', '+12.5%', 'Strong user retention ↗', 'Engagement exceed targets', h),
          metricCard('Growth Rate', '4.5%', '+4.5%', 'Steady performance increase ↗', 'Meets growth projections', h),
        ] }, h),
        section(
          {
            actions: [badge({ children: ['Last 3 months'], variant: 'outline' }, h)],
            children: [featuredVisitorsChart((message) => GotEChartMessage({ message }), h)],
            description: 'Total for the last three months',
            heading: 'Total Visitors',
            surface: 'card',
          },
          h,
        ),
        tableRegion(
          {
            actions: [button({ children: [icon({ name: 'sliders-horizontal' }, h), 'Customize Columns'], size: 'sm', variant: 'outline' }, h)],
            children: [dashboardTable(model, h)],
            heading: 'Document sections',
            toolbar: [toolbar({ children: [inline({ children: [button({ children: ['Outline'], size: 'sm', variant: 'secondary' }, h), button({ children: ['Past Performance'], size: 'sm', variant: 'ghost' }, h), button({ children: ['Key Personnel'], size: 'sm', variant: 'ghost' }, h)], gap: 'xs', wrap: true }, h)], label: 'Document views' }, h)],
          },
          h,
        ),
      ],
      navigationWidth: 'wide',
    },
    h,
  )

const sidebarIcon = (label: string): string => ({
  Documentation: 'book-open',
  Models: 'bot',
  Playground: 'square-terminal',
  Settings: 'settings-2',
  'Design Engineering': 'frame',
  'Sales & Marketing': 'chart-pie',
  Travel: 'map',
}[label] ?? 'circle')

const simpleSidebar = <Message>(
  options: Readonly<{ brand: string; groups: ReadonlyArray<Readonly<{ label: string; items: ReadonlyArray<string> }>>; nested?: boolean }>,
  h: HtmlBuilder<Message>,
): Html =>
  sidebar(
    {
      children: [
        sidebarHeader({ children: [sidebarMenu({ children: [sidebarMenuItem({ children: [sidebarMenuButton({ children: [options.brand], isActive: true, size: 'lg' }, h)] }, h)] }, h)] }, h),
        sidebarContent({
          children: options.groups.map((group) =>
            sidebarGroup(
              {
                children: [
                  sidebarGroupLabel({ children: [group.label] }, h),
                  sidebarGroupContent(
                    {
                      children: [
                        sidebarMenu(
                          {
                            children: group.items.map((item, index) =>
                              sidebarMenuItem(
                                {
                                  children: [
                                    sidebarMenuButton({ children: [icon({ name: sidebarIcon(item) }, h), item], isActive: index === 0 && group.label === 'Platform' }, h),
                                    ...(options.nested === true && index === 1
                                      ? [
                                          sidebarMenuSub(
                                            {
                                              children: ['History', 'Starred'].map((label) =>
                                                sidebarMenuSubItem({ children: [sidebarMenuSubButton({ children: [label], href: '#' }, h)] }, h),
                                              ),
                                            },
                                            h,
                                          ),
                                        ]
                                      : []),
                                  ],
                                },
                                h,
                              ),
                            ),
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
          ),
        }, h),
        sidebarFooter({ children: [sidebarMenu({ children: [sidebarMenuItem({ children: [sidebarMenuButton({ children: ['shadcn'], size: 'lg' }, h)] }, h)] }, h)] }, h),
      ],
      collapsible: 'none',
    },
    h,
  )

const sidebarPreview = <Message>(nested: boolean, h: HtmlBuilder<Message>): Html =>
  grid(
    {
      children: [
        simpleSidebar({ brand: 'Acme Inc.', groups: [{ label: 'Platform', items: ['Playground', 'Models', 'Documentation', 'Settings'] }, { label: 'Projects', items: ['Design Engineering', 'Sales & Marketing', 'Travel'] }], nested }, h),
        stack(
          {
            children: [
              inline({ children: [button({ children: ['☰'], size: 'icon', variant: 'ghost' }, h), text({ children: [nested ? 'Project workspace' : 'Dashboard'], tone: 'secondary', variant: 'caption' }, h)], gap: 'sm' }, h),
              box({ children: [], minHeight: 'skeleton', radius: 'lg', surface: 'muted' }, h),
            ],
            gap: 'md',
            padding: 'md',
          },
          h,
        ),
      ],
      columns: 'sidebarWide',
      width: 'full',
    },
    h,
  )

const documentationPreview = <Message>(_noop: Message, h: HtmlBuilder<Message>): Html => {
  const groups = [
    { items: ['Installation', 'Project Structure'], title: 'Getting Started' },
    { items: ['Routing', 'Data Fetching', 'Rendering', 'Caching', 'Styling', 'Optimizing', 'Configuring'], title: 'Build Your Application' },
    { items: ['Components', 'File Conventions', 'Functions', 'CLI'], title: 'API Reference' },
  ]

  return grid(
    {
      children: [
        sidebar(
          {
            children: [
              sidebarHeader({ children: [sidebarMenu({ children: [sidebarMenuItem({ children: [sidebarMenuButton({ children: [icon({ name: 'gallery-vertical-end', size: 'md' }, h), stack({ children: [text({ children: ['Documentation'], variant: 'label' }, h), text({ children: ['v1.0.0'], variant: 'caption' }, h)], gap: 'none' }, h)], size: 'lg' }, h)] }, h)] }, h)] }, h),
              sidebarContent({ children: groups.map((group) => sidebarGroup({ children: [sidebarGroupContent({ children: [sidebarMenu({ children: [sidebarMenuItem({ children: [sidebarMenuButton({ children: [group.title] }, h), sidebarMenuSub({ children: group.items.map((item) => sidebarMenuSubItem({ children: [sidebarMenuSubButton({ children: [item], href: '#', isActive: item === 'Data Fetching' }, h)] }, h)) }, h)] }, h)] }, h)] }, h)] }, h)) }, h),
            ],
            collapsible: 'none',
          },
          h,
        ),
        stack(
          {
            children: [
              inline({ align: 'center', children: [button({ children: [icon({ ariaLabel: 'Open navigation', name: 'blocks' }, h)], size: 'icon', variant: 'ghost' }, h), text({ children: ['Build Your Application'], tone: 'secondary', variant: 'caption' }, h), text({ children: ['›'], tone: 'secondary' }, h), text({ children: ['Data Fetching'], variant: 'caption' }, h)], gap: 'sm' }, h),
              box({ children: [], minHeight: 'skeleton', radius: 'lg', surface: 'muted' }, h),
            ],
            gap: 'md',
            padding: 'md',
          },
          h,
        ),
      ],
      columns: 'sidebarWide',
      width: 'full',
    },
    h,
  )
}

const loginForm = <Message>(noop: Message, h: HtmlBuilder<Message>): Html =>
  stack(
    {
      align: 'stretch',
      children: [
        stack({ align: 'center', children: [text({ as: 'h3', children: ['Welcome back'], variant: 'headingMd' }, h), text({ children: ['Login to your Acme Inc account'], tone: 'secondary' }, h)], gap: 'xs' }, h),
        input({ id: 'blocks-email', label: 'Email', onInput: () => noop, placeholder: 'm@example.com', value: '' }, h),
        stack({ children: [inline({ children: [text({ children: ['Password'], variant: 'label' }, h), text({ children: ['Forgot your password?'], variant: 'caption' }, h)], justify: 'between', width: 'full' }, h), input({ id: 'blocks-password', onInput: () => noop, type: 'password', value: '' }, h)], gap: 'xs' }, h),
        button({ children: ['Login'] }, h),
        fieldSeparator({ children: ['Or continue with'] }, h),
        button({ children: [icon({ name: 'code-xml' }, h), 'Login with GitHub'], variant: 'outline' }, h),
        text({ align: 'center', children: ["Don't have an account? Sign up"], variant: 'caption' }, h),
      ],
      gap: 'md',
      width: 'full',
    },
    h,
  )

const loginMuted = <Message>(noop: Message, h: HtmlBuilder<Message>): Html =>
  box(
    {
      children: [
        stack(
          {
            align: 'center',
            children: [
              inline({ children: [badge({ children: ['A'] }, h), text({ children: ['Acme Inc.'], variant: 'label' }, h)], gap: 'sm' }, h),
              box({ children: [loginForm(noop, h)], padding: 'lg', width: 'form' }, h),
            ],
            gap: 'lg',
            width: 'full',
          },
          h,
        ),
      ],
      contentAlignment: 'center',
      minHeight: 'blocksHero',
      padding: 'xl',
      surface: 'muted',
    },
    h,
  )

const loginImage = <Message>(noop: Message, h: HtmlBuilder<Message>): Html =>
  box(
    {
      children: [
        box(
          {
            children: [
              grid(
                {
                  children: [
                    box({ children: [stack({ align: 'center', children: [box({ children: [loginForm(noop, h)], width: 'form' }, h)], justify: 'center' }, h)], minHeight: 'full', padding: 'xl', surface: 'page' }, h),
                    box({ children: [stack({ align: 'center', children: [icon({ ariaLabel: 'Image placeholder', name: 'image', size: 'md' }, h)], justify: 'center' }, h)], minHeight: 'full', padding: 'xl', surface: 'muted' }, h),
                  ],
                  columns: 'loginSplit',
                  width: 'full',
                },
                h,
              ),
            ],
            radius: 'lg',
            surface: 'card',
            width: 'login',
          },
          h,
        ),
      ],
      contentAlignment: 'center',
      minHeight: 'blockPreview',
      padding: 'xl',
      surface: 'muted',
    },
    h,
  )

const ignoredMessage = (model: Model): Message => TableState.ChangedPage({ pageIndex: model.pageIndex })

const blocks: ReadonlyArray<Block> = [
  { description: 'A dashboard with sidebar, charts and data table.', name: 'dashboard-01', preview: dashboard },
  { description: 'A sidebar that collapses to icons.', name: 'sidebar-07', preview: (_model, h) => sidebarPreview(false, h) },
  { description: 'A sidebar with submenus.', name: 'sidebar-03', preview: (model, h) => documentationPreview(ignoredMessage(model), h) },
  { description: 'A login page with a muted background color.', name: 'login-03', preview: (model, h) => loginMuted(ignoredMessage(model), h) },
  { description: 'A login page with form and image.', name: 'login-04', preview: (model, h) => loginImage(ignoredMessage(model), h) },
  { description: 'Executive scorecard, objectives, trends and a narrative insight rail.', name: 'astryx-executive-summary', preview: (_model, h) => executiveSummaryDashboard((message) => GotEChartMessage({ message }), h) },
  { description: 'Growth funnel, conversion trend and weekly cohort retention.', name: 'astryx-cohort-funnel', preview: (_model, h) => cohortFunnelDashboard((message) => GotEChartMessage({ message }), h) },
  { description: 'Launch milestones, weighted task progress, workstreams and risks.', name: 'astryx-project-status', preview: (_model, h) => projectStatusDashboard((message) => GotEChartMessage({ message }), h) },
  { description: 'Live service health, traffic metrics and an operational triage rail.', name: 'astryx-service-monitoring', preview: (_model, h) => serviceMonitoringDashboard((message) => GotEChartMessage({ message }), h) },
  { description: 'Dense incident rows with filtering and a dedicated inspector panel.', name: 'astryx-incident-console', preview: (_model, h) => incidentConsoleDashboard(h) },
  { description: 'Real Apache ECharts rendered inside constrained StyleX analytics recipes.', name: 'chart-analytics-dashboard', preview: (_model, h) => chartAnalyticsDashboard((message) => GotEChartMessage({ message }), h) },
]

const blockSection = (block: Block, model: Model, h: HtmlBuilder<Message>): Html =>
  stack(
    {
      as: 'section',
      children: [
        box(
          {
            children: [
              inline(
                {
                  align: 'center',
                  children: [
                    inline({ align: 'center', children: [inline({ children: [button({ children: ['Preview'], size: 'sm', variant: 'outline' }, h), button({ children: ['Code'], size: 'sm', variant: 'ghost' }, h)], gap: 'none' }, h), text({ as: 'h2', children: [block.description], variant: 'label' }, h)], gap: 'md' }, h),
                    inline({ align: 'center', children: [button({ children: [icon({ ariaLabel: `Preview ${block.name}`, name: 'tv' }, h)], size: 'icon', variant: 'outline' }, h), button({ children: [icon({ ariaLabel: `Refresh ${block.name}`, name: 'refresh-cw' }, h)], size: 'icon', variant: 'outline' }, h), button({ children: [`>_ npx shadcn add ${block.name}`], size: 'sm', variant: 'outline' }, h), button({ children: ['Open in v0'], size: 'sm' }, h)], gap: 'sm', wrap: true }, h),
                  ],
                  justify: 'between',
                  width: 'full',
                  wrap: true,
                },
                h,
              ),
            ],
            visibility: 'desktop',
          },
          h,
        ),
        box({ children: [inline({ children: [text({ as: 'h2', children: [block.description], variant: 'label' }, h), text({ children: [block.name], tone: 'secondary', variant: 'caption' }, h)], justify: 'between', width: 'full' }, h)], visibility: 'mobile' }, h),
        box({ children: [block.preview(model, h)], contain: 'paint', minHeight: 'blockPreview', overflowX: 'auto', padding: 'xs', radius: 'lg', surface: 'card', width: 'full' }, h),
      ],
      gap: 'md',
      data: { block: block.name },
      rendering: 'eager',
    },
    h,
  )

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  box(
    {
      as: 'main',
      children: [
        stack(
          {
            children: [
              box(
                {
                  children: [
                    stack(
                      {
                        align: 'center',
                        children: [
                          badge({ children: ['New Questionnaire component →'], variant: 'secondary' }, h),
                          text({ align: 'center', as: 'h1', children: ['Building Blocks for the Web'], variant: 'hero' }, h),
                          text({ align: 'center', as: 'p', children: ['Clean, modern building blocks. Copy and paste into your apps. Works with all React frameworks. Open Source. Free forever.'], measure: 'hero', tone: 'primary' }, h),
                          inline({ children: [button({ children: ['Browse Blocks'] }, h), button({ children: ['View Components'], variant: 'ghost' }, h)], gap: 'sm' }, h),
                        ],
                        gap: 'lg',
                        justify: 'center',
                      },
                      h,
                    ),
                  ],
                  minHeight: 'blocksHero',
                  padding: 'lg',
                },
                h,
              ),
              inline({ align: 'center', children: [inline({ children: ['Featured', 'Sidebar', 'Login', 'Signup'].map((label) => button({ children: [label], size: 'sm', variant: label === 'Featured' ? 'ghost' : 'link' }, h)), gap: 'sm' }, h), inline({ align: 'center', children: [buttonLink({ children: ['TanStack Table lab'], href: '/blocks-stylex/table', size: 'sm', variant: 'outline' }, h), box({ children: [button({ children: ['Browse all blocks'], size: 'sm', variant: 'secondary' }, h)], visibility: 'desktop' }, h)], gap: 'sm' }, h)], justify: 'between', width: 'full', wrap: true }, h),
              ...blocks.map((block) => blockSection(block, model, h)),
            ],
            gap: 'xxl',
            padding: 'xl',
          },
          h,
        ),
      ],
      minHeight: 'createPage',
      surface: 'page',
      width: 'content',
    },
    h,
  )
