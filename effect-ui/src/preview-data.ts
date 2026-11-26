import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { AreaChart, Button, DataGrid, DataTable, EChart } from '#components'
import { categoryAxis, compactGrid, registerChart, valueAxis } from './ui/chart'
import { initDataTable } from './behaviors/data-table'

const chartId = 'effect-preview-review-activity'
registerChart(chartId, (theme, series) => ({
  xAxis: categoryAxis(theme, ['June', 'July', 'August'], { boundaryGap: true }),
  yAxis: valueAxis(theme),
  grid: compactGrid(),
  series: [
    {
      id: 'reviews',
      type: 'bar',
      data: series === 'previous' ? [8, 13, 12] : [14, 21, 25],
      itemStyle: { color: theme.chart2 },
    },
  ],
}))

const reports = [
  { id: 'catalog', name: 'Catalog', state: 'Open' },
  { id: 'dates', name: 'Calendar', state: 'Ready' },
  { id: 'files', name: 'Attachments', state: 'Open' },
]
const files = Array.from({ length: 60 }, (_, index) => ({
  id: `file-${index + 1}`,
  name: `Review ${index + 1}`,
  revision: index + 1,
}))
const Message = UiSchema.TaggedEnum({
  Switched: {},
  Deleted: { keys: Schema.Array(Schema.String) },
  ChartUpdated: { state: Schema.String },
})
export const DataExamples = Html.component({
  name: 'EffectUiDataExamples',
  message: Message,
  model: Schema.Struct({
    previous: Schema.Boolean,
    deleted: Schema.Array(Schema.String),
    chartState: Schema.String,
  }),
}).make({
  init: () => ({ previous: false, deleted: [], chartState: '' }),
  update: {
    Switched: $ => $.evolve({ previous: value => !value }),
    Deleted: ($, { keys }) =>
      $.evolve({ deleted: value => [...value, ...keys] }),
    ChartUpdated: ($, { state }) => $.evolve({ chartState: state }),
  },
  view: (h, model) =>
    h.section
      .class('example')
      .style({ gridColumn: '1 / -1' })
      .children(
        h.h2.children('Tables and charts'),
        DataTable(h, {
          id: 'effect-preview-reports',
          ariaLabel: 'Review reports',
          rows: reports.filter(row => !model.deleted.includes(row.id)),
          rowKey: row => row.id,
          columns: [
            {
              key: 'name',
              header: 'Report',
              get: row => row.name,
              sortValue: row => row.name,
              cell: row => row.name,
            },
            {
              key: 'state',
              header: 'State',
              get: row => row.state,
              filterVariant: 'options',
              options: ['Open', 'Ready'].map(value => ({
                value,
                label: value,
              })),
              cell: row => row.state,
            },
          ],
          variant: 'faceted',
          props: { defaultState: initDataTable(3) },
          enableRowSelection: true,
          enableColumnVisibility: true,
          onEmit: event =>
            event._tag === 'Deleted'
              ? Message.Deleted({ keys: event.keys })
              : undefined,
        }),
        DataGrid(h, {
          id: 'effect-preview-files-grid',
          label: 'Review grid',
          rows: files,
          rowKey: row => row.id,
          height: 240,
          columns: [
            {
              id: 'name',
              header: 'Review name',
              get: row => row.name,
              variant: 'text',
              width: 160,
            },
            {
              id: 'revision',
              header: 'Revision',
              get: row => String(row.revision),
              variant: 'number',
              width: 120,
              numberMin: 0,
            },
          ],
        }),
        Button(h, { variant: 'outline', onPress: Message.Switched() }).children(
          model.previous ? 'Show current activity' : 'Show previous activity',
        ),
        EChart(h, {
          hostId: chartId,
          ariaLabel: 'Reviews per month',
          variant: model.previous ? 'previous' : 'current',
          toMessage: event => Message.ChartUpdated({ state: event._tag }),
          accessibleAlternative: h.p.children(
            model.previous
              ? 'June 8. July 13. August 12.'
              : 'June 14. July 21. August 25.',
          ),
        }),
        h.output.attr('aria-label', 'Chart status').children(model.chartState),
        AreaChart(h, { data: [1, 2, 4, 3, 6], ariaLabel: 'Review trend' }),
      ),
})
