import type { EChartsOption } from 'echarts/types/dist/shared';
import { Option } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Chart from '@/lib/echarts';
import * as Select from '@/ui/select';
import {
  card,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitle,
} from '@/ui/card';

export const HOST_ID = 'chart-area-interactive';

export type TimeRange = '90d' | '30d' | '7d';

const TIME_RANGES: ReadonlyArray<
  Readonly<{ value: TimeRange; label: string }>
> = [
  { value: '90d', label: 'Last 3 months' },
  { value: '30d', label: 'Last 30 days' },
  { value: '7d', label: 'Last 7 days' },
];

const DATA = [
  ['2024-04-01', 222, 150],
  ['2024-04-02', 97, 180],
  ['2024-04-03', 167, 120],
  ['2024-04-04', 242, 260],
  ['2024-04-05', 373, 290],
  ['2024-04-06', 301, 340],
  ['2024-04-07', 245, 180],
  ['2024-04-08', 409, 320],
  ['2024-04-09', 59, 110],
  ['2024-04-10', 261, 190],
  ['2024-04-11', 327, 350],
  ['2024-04-12', 292, 210],
  ['2024-04-13', 342, 380],
  ['2024-04-14', 137, 220],
  ['2024-04-15', 120, 170],
  ['2024-04-16', 138, 190],
  ['2024-04-17', 446, 360],
  ['2024-04-18', 364, 410],
  ['2024-04-19', 243, 180],
  ['2024-04-20', 89, 150],
  ['2024-04-21', 137, 200],
  ['2024-04-22', 224, 170],
  ['2024-04-23', 138, 230],
  ['2024-04-24', 387, 290],
  ['2024-04-25', 215, 250],
  ['2024-04-26', 75, 130],
  ['2024-04-27', 383, 420],
  ['2024-04-28', 122, 180],
  ['2024-04-29', 315, 240],
  ['2024-04-30', 454, 380],
  ['2024-05-01', 165, 220],
  ['2024-05-02', 293, 310],
  ['2024-05-03', 247, 190],
  ['2024-05-04', 385, 420],
  ['2024-05-05', 481, 390],
  ['2024-05-06', 498, 520],
  ['2024-05-07', 388, 300],
  ['2024-05-08', 149, 210],
  ['2024-05-09', 227, 180],
  ['2024-05-10', 293, 330],
  ['2024-05-11', 335, 270],
  ['2024-05-12', 197, 240],
  ['2024-05-13', 197, 160],
  ['2024-05-14', 448, 490],
  ['2024-05-15', 473, 380],
  ['2024-05-16', 338, 400],
  ['2024-05-17', 499, 420],
  ['2024-05-18', 315, 350],
  ['2024-05-19', 235, 180],
  ['2024-05-20', 177, 230],
  ['2024-05-21', 82, 140],
  ['2024-05-22', 81, 120],
  ['2024-05-23', 252, 290],
  ['2024-05-24', 294, 220],
  ['2024-05-25', 201, 250],
  ['2024-05-26', 213, 170],
  ['2024-05-27', 420, 460],
  ['2024-05-28', 233, 190],
  ['2024-05-29', 78, 130],
  ['2024-05-30', 340, 280],
  ['2024-05-31', 178, 230],
  ['2024-06-01', 178, 200],
  ['2024-06-02', 470, 410],
  ['2024-06-03', 103, 160],
  ['2024-06-04', 439, 380],
  ['2024-06-05', 88, 140],
  ['2024-06-06', 294, 250],
  ['2024-06-07', 323, 370],
  ['2024-06-08', 385, 320],
  ['2024-06-09', 438, 480],
  ['2024-06-10', 155, 200],
  ['2024-06-11', 92, 150],
  ['2024-06-12', 492, 420],
  ['2024-06-13', 81, 130],
  ['2024-06-14', 426, 380],
  ['2024-06-15', 307, 350],
  ['2024-06-16', 371, 310],
  ['2024-06-17', 475, 520],
  ['2024-06-18', 107, 170],
  ['2024-06-19', 341, 290],
  ['2024-06-20', 408, 450],
  ['2024-06-21', 169, 210],
  ['2024-06-22', 317, 270],
  ['2024-06-23', 480, 530],
  ['2024-06-24', 132, 180],
  ['2024-06-25', 141, 190],
  ['2024-06-26', 434, 380],
  ['2024-06-27', 448, 490],
  ['2024-06-28', 149, 200],
  ['2024-06-29', 103, 160],
  ['2024-06-30', 446, 400],
] as const;

const firstDate: Readonly<Record<TimeRange, string>> = {
  '90d': '2024-04-01',
  '30d': '2024-05-31',
  '7d': '2024-06-23',
};

const formatDate = (date: string): string =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

const isTimeRange = (value: string): value is TimeRange =>
  value === '90d' || value === '30d' || value === '7d';

Chart.registerChart(HOST_ID, (theme, variant): EChartsOption => {
  const timeRange = isTimeRange(variant) ? variant : '90d';
  const filtered = DATA.filter(([date]) => date >= firstDate[timeRange]);

  return {
    grid: Chart.compactGrid({ bottom: 44 }),
    xAxis: {
      ...Chart.categoryAxis(
        theme,
        filtered.map(([date]) => formatDate(date)),
      ),
      axisLabel: {
        color: theme.mutedForeground,
        fontSize: 12,
        fontFamily: theme.fontFamily,
        margin: 10,
        hideOverlap: true,
      },
    },
    yAxis: Chart.valueAxis(theme),
    tooltip: Chart.shadcnTooltip(theme),
    legend: Chart.shadcnLegend(theme),
    series: [
      {
        name: 'Mobile',
        type: 'line',
        smooth: 0.4,
        stack: 'total',
        showSymbol: false,
        lineStyle: { width: 2, color: theme.chart2 },
        itemStyle: { color: theme.chart2 },
        areaStyle: { color: Chart.areaGradient(theme.chart2) },
        data: filtered.map(([, , mobile]) => mobile),
      },
      {
        name: 'Desktop',
        type: 'line',
        smooth: 0.4,
        stack: 'total',
        showSymbol: false,
        lineStyle: { width: 2, color: theme.chart1 },
        itemStyle: { color: theme.chart1 },
        areaStyle: { color: Chart.areaGradient(theme.chart1) },
        data: filtered.map(([, desktop]) => desktop),
      },
    ],
  };
});

export type ViewProps<Msg> = Readonly<{
  timeRange: TimeRange;
  selectedTimeRange: TimeRange;
  selectModel: Select.Model;
  toChartMessage: (message: Chart.ChartMessage) => Msg;
  toSelectMessage: (message: Select.Message) => Msg;
}>;

export const view = <Msg>(props: ViewProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  return card(
    {
      class: 'pt-0',
      children: [
        cardHeader(
          {
            class:
              'flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row',
            children: [
              h.div(
                [h.Class('grid flex-1 gap-1')],
                [
                  cardTitle({ children: ['Area Chart - Interactive'] }, h),
                  cardDescription(
                    {
                      children: [
                        'Showing total visitors for the last 3 months',
                      ],
                    },
                    h,
                  ),
                ],
              ),
              Select.select(
                {
                  model: props.selectModel,
                  maybeSelectedValue: Option.some(props.selectedTimeRange),
                  toParentMessage: props.toSelectMessage,
                  items: TIME_RANGES,
                  itemToValue: (range) => range.value,
                  itemToLabel: (range) => range.label,
                  triggerClass:
                    'hidden w-[160px] rounded-lg sm:ml-auto sm:flex',
                  ariaLabel: 'Select a value',
                },
                h,
              ),
            ],
          },
          h,
        ),
        cardContent(
          {
            class: 'px-2 pt-4 sm:px-6 sm:pt-6',
            children: [
              Chart.chart(
                {
                  hostId: HOST_ID,
                  variant: props.timeRange,
                  ariaLabel:
                    'Interactive area chart showing desktop and mobile visitors for the selected time range',
                  toMessage: props.toChartMessage,
                  class: 'aspect-auto h-[250px] w-full',
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
  );
};

/*
  Minimal wiring:
  - Model: { timeRange: '90d', timeRangeSelect: Select.init({ id,
    '90d', isAnimated: true }) }.
  - Delegate Select.Message through Select.update; when its Selected OutMessage
    arrives, update timeRange and return Chart.SyncChart({ hostId: HOST_ID,
    variant: timeRange }) mapped into the page's ChartMessage arm.
  - Render view({ timeRange, selectModel, toChartMessage, toSelectMessage }).
*/
