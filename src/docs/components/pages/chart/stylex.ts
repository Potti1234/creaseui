import * as stylex from '@stylexjs/stylex';
import type { EChartsOption } from 'echarts/types/dist/shared';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { chartData, chartFamilyHostId, chartFamilyKinds, chartFamilyOption, chartFixtures, isChartFamilyKind, chartHostId } from '@/docs/components/pages/chart/shared';
import * as Chart from '@/stylex/chart';
import * as Table from '@/stylex/table';

Chart.registerChart(chartHostId, (theme, variant): EChartsOption => ({ grid: Chart.compactGrid(), series: [{ data: variant === 'quarter' ? [186, 305, 237, 314] : [186, 305, 237, 273, 209, 314], itemStyle: { color: theme.chart2 }, name: 'Revenue', type: 'bar' }], tooltip: Chart.shadcnTooltip(theme), xAxis: Chart.categoryAxis(theme, variant === 'quarter' ? ['Q1', 'Q2', 'Q3', 'Q4'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], { boundaryGap: true }), yAxis: Chart.valueAxis(theme, { showLabels: true }) }));
for (const kind of chartFamilyKinds) Chart.registerChart(chartFamilyHostId(kind), theme => chartFamilyOption(kind, theme));

const styles = stylex.create({
  button: { borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: 1, paddingBlock: '0.5rem', paddingInline: '0.75rem', fontSize: '0.875rem' },
  chart: { maxWidth: '36rem' },
  frame: { display: 'grid', gap: '0.75rem', width: '100%', maxWidth: '36rem' },
  stack: { width: '100%', maxWidth: '36rem' },
});

const table = <Msg>(h: HtmlBuilder<Msg>) => Table.table({ children: [Table.tableCaption({ children: ['Revenue values shown in the chart.'] }, h), Table.tableHeader({ children: [Table.tableRow({ children: [Table.tableHead({ children: ['Period'] }, h), Table.tableHead({ children: ['Revenue'] }, h)] }, h)] }, h), Table.tableBody({ children: [['Jan', '$186k'], ['Feb', '$305k'], ['Mar', '$237k']].map(([period, value]) => Table.tableRow({ children: [Table.tableHead({ scope: 'row', children: [period ?? ''] }, h), Table.tableCell({ children: [value ?? ''] }, h)] }, h)) }, h)] }, h);

const frame = <Msg>(children: ReadonlyArray<Html>, h: HtmlBuilder<Msg>): Html => h.div([h.Class(stylex.props(styles.frame).className ?? '')], children);

export const chartStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const variant = (model as { variant: 'month' | 'quarter' }).variant;
  const kind = chartFixtures[index]?.kind;
  const toMessage = (message: Chart.ChartMessage): Msg => onMessageJson(JSON.stringify(message));
  if (kind === 'bar-svg') return Chart.barChart({ layoutStyle: styles.chart, data: chartData }, h);
  if (kind === 'area-svg') return h.div([h.Class(stylex.props(styles.stack).className ?? '')], [Chart.areaChart({ data: chartData.map(item => item.value) }, h), Chart.chartLegend({ config: { visitors: { label: 'Visitors', color: 'var(--chart-2)' } } }, h)]);
  if (kind === 'lifecycle') {
    const change = onMessageJson(JSON.stringify({ _tag: 'ChangedChartRange', variant: variant === 'month' ? 'quarter' : 'month' }));
    return frame([h.button([h.Type('button'), h.OnClick(change), h.Class(stylex.props(styles.button).className ?? '')], [variant === 'month' ? 'Show quarters' : 'Show months']), Chart.eChart({ accessibleAlternative: table(h), ariaLabel: 'Revenue by period', hostId: chartHostId, toMessage, variant }, h)], h);
  }
  if (kind === 'states') return frame([Chart.eChart({ accessibleAlternative: h.p([], ['Revenue data is loading.']), ariaLabel: 'Loading revenue', hostId: `${chartHostId}-loading`, state: 'loading', toMessage }, h), Chart.eChart({ accessibleAlternative: h.p([], ['No revenue records are available.']), ariaLabel: 'Empty revenue', hostId: `${chartHostId}-empty`, state: 'empty', toMessage }, h), Chart.eChart({ accessibleAlternative: h.p([], ['Revenue service is unavailable.']), ariaLabel: 'Revenue error', hostId: `${chartHostId}-error`, state: 'error', statusText: 'Revenue could not be loaded.', toMessage }, h)], h);
  return kind !== undefined && isChartFamilyKind(kind) ? frame([Chart.eChart({ accessibleAlternative: h.p([], [`${kind} chart showing the documented values.`]), ariaLabel: `${kind} chart example`, hostId: chartFamilyHostId(kind), toMessage }, h)], h) : undefined;
};
