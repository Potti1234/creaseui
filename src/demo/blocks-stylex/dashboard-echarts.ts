import type { EChartsOption } from 'echarts/types/dist/shared'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Chart from '@/stylex/integrations/echarts'

const HOSTS = {
  cohortConversion: 'stylex-cohort-conversion',
  executiveCustomers: 'stylex-executive-customers',
  executiveRevenue: 'stylex-executive-revenue',
  featuredVisitors: 'stylex-featured-visitors',
  projectBurndown: 'stylex-project-burndown',
  projectProgress: 'stylex-project-progress',
  serviceLatency: 'stylex-service-latency',
  serviceRequests: 'stylex-service-requests',
} as const

const lineOption = (
  theme: Chart.ChartTheme,
  data: ReadonlyArray<number>,
  labels: ReadonlyArray<string>,
  name: string,
): EChartsOption => ({
  grid: Chart.compactGrid(),
  series: [{ areaStyle: { color: Chart.areaGradient(theme.chart1, { from: 0.38, to: 0.03 }) }, data: [...data], itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name, showSymbol: false, smooth: 0.4, type: 'line' }],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, labels),
  yAxis: Chart.valueAxis(theme),
})

const barOption = (
  theme: Chart.ChartTheme,
  data: ReadonlyArray<number>,
  labels: ReadonlyArray<string>,
  name: string,
): EChartsOption => ({
  grid: Chart.compactGrid(),
  series: [{ data: [...data], itemStyle: { borderRadius: 4, color: theme.chart2 }, name, type: 'bar' }],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, labels, { boundaryGap: true }),
  yAxis: Chart.valueAxis(theme),
})

Chart.registerChart(HOSTS.executiveRevenue, (theme) => lineOption(theme, [42, 48, 45, 57, 63, 68, 74, 82], ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'], 'Revenue'))
Chart.registerChart(HOSTS.executiveCustomers, (theme) => barOption(theme, [18, 26, 31, 39], ['W1', 'W2', 'W3', 'W4'], 'New accounts'))
Chart.registerChart(HOSTS.featuredVisitors, (theme): EChartsOption => ({
  grid: Chart.compactGrid({ bottom: 42 }),
  legend: Chart.shadcnLegend(theme),
  series: [
    { areaStyle: { color: Chart.colorWithOpacity(theme.chart1, 0.22) }, data: [222, 360, 285, 520, 405, 590, 470, 635, 510, 680, 560, 735], itemStyle: { color: theme.chart1 }, lineStyle: { color: theme.chart1, width: 2 }, name: 'Desktop', showSymbol: false, smooth: 0.35, type: 'line' },
    { areaStyle: { color: Chart.colorWithOpacity(theme.chart2, 0.18) }, data: [150, 230, 190, 340, 285, 390, 330, 455, 370, 480, 410, 520], itemStyle: { color: theme.chart2 }, lineStyle: { color: theme.chart2, width: 2 }, name: 'Mobile', showSymbol: false, smooth: 0.35, type: 'line' },
  ],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: Chart.categoryAxis(theme, ['Apr 1', 'Apr 15', 'May 1', 'May 15', 'Jun 1', 'Jun 15', 'Jul 1', 'Jul 15', 'Aug 1', 'Aug 15', 'Sep 1', 'Sep 15']),
  yAxis: Chart.valueAxis(theme, { showLabels: true }),
}))
Chart.registerChart(HOSTS.cohortConversion, (theme) => lineOption(theme, [1.1, 1.3, 1.25, 1.48, 1.42, 1.61, 1.57, 1.67], ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], 'Conversion'))
Chart.registerChart(HOSTS.projectBurndown, (theme) => lineOption(theme, [120, 113, 96, 88, 75, 61, 47, 38], ['D1', 'D3', 'D5', 'D7', 'D9', 'D11', 'D13', 'D15'], 'Remaining points'))
Chart.registerChart(HOSTS.projectProgress, (theme): EChartsOption => ({
  series: [{ data: [{ itemStyle: { color: theme.chart1 }, name: 'Complete', value: 68 }, { itemStyle: { color: Chart.colorWithOpacity(theme.mutedForeground, 0.12) }, name: 'Remaining', value: 32 }], label: { show: false }, radius: ['56%', '78%'], silent: true, type: 'pie' }],
  tooltip: Chart.shadcnTooltip(theme, { trigger: 'item' }),
}))
Chart.registerChart(HOSTS.serviceRequests, (theme) => lineOption(theme, [18, 22, 21, 25, 29, 27, 32, 28], ['00', '08', '16', '24', '32', '40', '48', '56'], 'Requests'))
Chart.registerChart(HOSTS.serviceLatency, (theme) => barOption(theme, [120, 142, 184, 151], ['00', '15', '30', '45'], 'P95 latency'))

type ToMessage<Message> = (message: Chart.ChartMessage) => Message

const render = <Message>(hostId: string, ariaLabel: string, toMessage: ToMessage<Message>, h: HtmlBuilder<Message>, size?: Chart.EChartSize): Html =>
  Chart.eChart({ accessibleAlternative: h.p([], [ariaLabel]), ariaLabel, hostId, ...(size === undefined ? {} : { size }), toMessage }, h)

export const executiveRevenueChart = <Message>(toMessage: ToMessage<Message>, h: HtmlBuilder<Message>): Html => render(HOSTS.executiveRevenue, 'Area chart of executive revenue trend', toMessage, h)
export const executiveCustomerChart = <Message>(toMessage: ToMessage<Message>, h: HtmlBuilder<Message>): Html => render(HOSTS.executiveCustomers, 'Bar chart of new customer growth', toMessage, h)
export const featuredVisitorsChart = <Message>(toMessage: ToMessage<Message>, h: HtmlBuilder<Message>): Html => render(HOSTS.featuredVisitors, 'Area chart comparing desktop and mobile visitors for the last three months', toMessage, h, 'wide')
export const cohortConversionChart = <Message>(toMessage: ToMessage<Message>, h: HtmlBuilder<Message>): Html => render(HOSTS.cohortConversion, 'Area chart of weekly conversion rate', toMessage, h, 'wide')
export const projectBurndownChart = <Message>(toMessage: ToMessage<Message>, h: HtmlBuilder<Message>): Html => render(HOSTS.projectBurndown, 'Area chart of remaining project story points', toMessage, h)
export const projectProgressChart = <Message>(toMessage: ToMessage<Message>, h: HtmlBuilder<Message>): Html => render(HOSTS.projectProgress, 'Donut chart showing 68 percent project completion', toMessage, h, 'square')
export const serviceRequestChart = <Message>(toMessage: ToMessage<Message>, h: HtmlBuilder<Message>): Html => render(HOSTS.serviceRequests, 'Area chart of service request volume', toMessage, h)
export const serviceLatencyChart = <Message>(toMessage: ToMessage<Message>, h: HtmlBuilder<Message>): Html => render(HOSTS.serviceLatency, 'Bar chart of service P95 latency', toMessage, h)
