import type { EChartsOption } from 'echarts/types/dist/shared'

import {
  areaGradient,
  categoryAxis,
  compactGrid,
  legendOptions,
  colorWithOpacity,
  registerChart,
  tooltipOptions,
  valueAxis,
  type ChartTheme,
} from '../../behaviors/chart'

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const
const desktop = [186, 305, 237, 273, 209, 314] as const
const mobile = [80, 200, 120, 190, 130, 140] as const
const stepDesktop = [186, 305, 237, 273, 209, 314] as const
const stepMobile = [80, 200, 120, 190, 130, 140] as const
const demoLabels = Array.from({ length: 30 }, (_, index) => `Apr ${index + 1}`)
const demoDesktop = [
  222, 97, 167, 242, 373, 301, 245, 409, 59, 261, 327, 292, 342, 137, 120, 138,
  446, 364, 243, 89, 137, 224, 138, 387, 215, 75, 383, 122, 315, 454,
] as const
const demoMobile = [
  150, 180, 120, 260, 290, 340, 180, 320, 110, 190, 350, 210, 380, 220, 170,
  190, 360, 410, 180, 150, 200, 170, 230, 290, 250, 130, 420, 180, 240, 380,
] as const
const rtlLabels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'] as const

export type ChartUpstreamKind =
  | 'demo'
  | 'step-basic'
  | 'step-grid'
  | 'step-axis'
  | 'step-tooltip'
  | 'step-legend'
  | 'rtl'
  | 'lifecycle'
export type ChartFamilyKind =
  | 'area'
  | 'bar'
  | 'line'
  | 'pie'
  | 'radar'
  | 'radial'
export const upstreamHostId = (kind: ChartUpstreamKind) => `docs-chart-${kind}`
export const familyHostId = (kind: ChartFamilyKind) =>
  `docs-chart-family-${kind}`

const upstreamOption = (
  kind: ChartUpstreamKind,
  theme: ChartTheme,
  variant = '',
): EChartsOption => {
  const axisLabels = kind === 'rtl' ? rtlLabels : stepLabels
  const desktopBar = {
    data: [...stepDesktop],
    itemStyle: { borderRadius: 4, color: theme.chart2 },
    name: kind === 'rtl' ? 'سطح المكتب' : 'Desktop',
    type: 'bar' as const,
  }
  const mobileBar = {
    data: [...stepMobile],
    itemStyle: { borderRadius: 4, color: theme.chart1 },
    name: kind === 'rtl' ? 'الجوال' : 'Mobile',
    type: 'bar' as const,
  }
  const series = [desktopBar, mobileBar]
  switch (kind) {
    case 'step-basic':
      return {
        series,
        xAxis: {
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          data: [...axisLabels],
          type: 'category',
        },
        yAxis: {
          axisLabel: { show: false },
          splitLine: { show: false },
          type: 'value',
        },
      } as EChartsOption
    case 'step-grid':
      return {
        grid: compactGrid(),
        series,
        xAxis: {
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          data: [...axisLabels],
          type: 'category',
        },
        yAxis: valueAxis(theme),
      } as EChartsOption
    case 'step-axis':
      return {
        grid: compactGrid(),
        series,
        xAxis: categoryAxis(theme, axisLabels, { boundaryGap: true }),
        yAxis: valueAxis(theme),
      } as EChartsOption
    case 'step-tooltip':
      return {
        grid: compactGrid(),
        series,
        tooltip: tooltipOptions(theme),
        xAxis: categoryAxis(theme, axisLabels, { boundaryGap: true }),
        yAxis: valueAxis(theme),
      } as EChartsOption
    case 'step-legend':
    case 'rtl':
      return {
        grid: compactGrid({ bottom: 42 }),
        legend: legendOptions(theme),
        series,
        tooltip: tooltipOptions(theme),
        xAxis: categoryAxis(theme, axisLabels, { boundaryGap: true }),
        yAxis: valueAxis(theme),
      } as EChartsOption
    case 'demo': {
      const active = variant === 'mobile' ? 'mobile' : 'desktop'
      return {
        grid: compactGrid({ left: 12, right: 12, top: 24 }),
        series: [
          {
            data: active === 'mobile' ? [...demoMobile] : [...demoDesktop],
            itemStyle: {
              borderRadius: 2,
              color: active === 'mobile' ? theme.chart1 : theme.chart2,
            },
            name: active === 'mobile' ? 'Mobile' : 'Desktop',
            type: 'bar',
          },
        ],
        tooltip: tooltipOptions(theme),
        xAxis: categoryAxis(theme, demoLabels, { boundaryGap: true }),
        yAxis: valueAxis(theme),
      } as EChartsOption
    }
    case 'lifecycle': {
      const quarter = variant === 'quarter'
      return {
        grid: compactGrid(),
        series: [
          {
            data: quarter
              ? [186, 305, 237, 314]
              : [186, 305, 237, 273, 209, 314],
            itemStyle: { color: theme.chart2 },
            name: 'Revenue',
            type: 'bar',
          },
        ],
        tooltip: tooltipOptions(theme),
        xAxis: categoryAxis(
          theme,
          quarter ? ['Q1', 'Q2', 'Q3', 'Q4'] : labels,
          { boundaryGap: true },
        ),
        yAxis: valueAxis(theme, { showLabels: true }),
      } as EChartsOption
    }
  }
}

export const familyOption = (
  kind: ChartFamilyKind,
  theme: ChartTheme,
): EChartsOption => {
  switch (kind) {
    case 'area':
      return {
        grid: compactGrid(),
        series: [
          {
            areaStyle: { color: areaGradient(theme.chart1) },
            data: desktop,
            itemStyle: { color: theme.chart1 },
            lineStyle: { color: theme.chart1, width: 2 },
            name: 'Desktop',
            showSymbol: false,
            smooth: 0.35,
            type: 'line',
          },
        ],
        tooltip: tooltipOptions(theme),
        xAxis: categoryAxis(theme, labels),
        yAxis: valueAxis(theme),
      } as EChartsOption
    case 'bar':
      return {
        grid: compactGrid({ bottom: 28 }),
        series: [
          {
            data: desktop,
            itemStyle: { borderRadius: 4, color: theme.chart2 },
            name: 'Desktop',
            type: 'bar',
          },
        ],
        tooltip: tooltipOptions(theme),
        xAxis: categoryAxis(theme, labels, { boundaryGap: true }),
        yAxis: valueAxis(theme),
      } as EChartsOption
    case 'line':
      return {
        grid: compactGrid({ bottom: 42 }),
        legend: legendOptions(theme),
        series: [
          {
            data: desktop,
            itemStyle: { color: theme.chart1 },
            lineStyle: { color: theme.chart1, width: 2 },
            name: 'Desktop',
            showSymbol: false,
            smooth: 0.35,
            type: 'line',
          },
          {
            data: mobile,
            itemStyle: { color: theme.chart2 },
            lineStyle: { color: theme.chart2, width: 2 },
            name: 'Mobile',
            showSymbol: false,
            smooth: 0.35,
            type: 'line',
          },
        ],
        tooltip: tooltipOptions(theme),
        xAxis: categoryAxis(theme, labels),
        yAxis: valueAxis(theme),
      } as EChartsOption
    case 'pie':
      return {
        legend: legendOptions(theme),
        series: [
          {
            data: [
              {
                itemStyle: { color: theme.chart1 },
                name: 'Chrome',
                value: 275,
              },
              {
                itemStyle: { color: theme.chart2 },
                name: 'Safari',
                value: 200,
              },
              {
                itemStyle: { color: theme.chart3 },
                name: 'Firefox',
                value: 187,
              },
              { itemStyle: { color: theme.chart4 }, name: 'Edge', value: 173 },
            ],
            label: { color: theme.foreground },
            radius: ['44%', '70%'],
            type: 'pie',
          },
        ],
        tooltip: tooltipOptions(theme, { trigger: 'item' }),
      } as EChartsOption
    case 'radar':
      return {
        radar: {
          axisLine: { lineStyle: { color: theme.border } },
          axisName: {
            color: theme.mutedForeground,
            fontFamily: theme.fontFamily,
            fontSize: 11,
          },
          indicator: ['Speed', 'Quality', 'Coverage', 'Reliability', 'DX'].map(
            name => ({ max: 100, name }),
          ),
          splitArea: { areaStyle: { color: ['transparent'] } },
          splitLine: { lineStyle: { color: theme.border } },
        },
        series: [
          {
            areaStyle: { color: colorWithOpacity(theme.chart1, 0.18) },
            data: [{ name: 'Score', value: [82, 91, 76, 88, 84] }],
            itemStyle: { color: theme.chart1 },
            lineStyle: { color: theme.chart1, width: 2 },
            type: 'radar',
          },
        ],
        tooltip: tooltipOptions(theme, { trigger: 'item' }),
      } as EChartsOption
    case 'radial':
      return {
        angleAxis: { max: 400, startAngle: 90, type: 'value' },
        polar: { radius: ['24%', '88%'] },
        radiusAxis: {
          axisLine: { show: false },
          axisTick: { show: false },
          data: ['Search', 'Direct', 'Social', 'Email'],
          type: 'category',
        },
        series: [
          {
            backgroundStyle: {
              color: colorWithOpacity(theme.mutedForeground, 0.12),
            },
            barWidth: '58%',
            coordinateSystem: 'polar',
            data: [275, 220, 187, 140].map((value, index) => ({
              itemStyle: {
                color: [theme.chart1, theme.chart2, theme.chart3, theme.chart4][
                  index
                ],
              },
              value,
            })),
            name: 'Visitors',
            roundCap: true,
            type: 'bar',
          },
        ],
        tooltip: tooltipOptions(theme, { trigger: 'item' }),
      } as EChartsOption
  }
}

const stepLabels = labels
for (const kind of [
  'demo',
  'step-basic',
  'step-grid',
  'step-axis',
  'step-tooltip',
  'step-legend',
  'rtl',
  'lifecycle',
] as const) {
  registerChart(upstreamHostId(kind), (theme, variant) =>
    upstreamOption(kind, theme, variant),
  )
}
for (const kind of ['area', 'bar', 'line', 'pie', 'radar', 'radial'] as const) {
  registerChart(familyHostId(kind), theme => familyOption(kind, theme))
}
