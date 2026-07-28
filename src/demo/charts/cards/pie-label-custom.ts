import type { Html } from 'foldkit/html'
import * as Chart from '@/lib/echarts'
import { pieCard, pieOption } from './pie-shared'
const HOST_ID = 'chart-pie-label-custom'
Chart.registerChart(HOST_ID, theme => pieOption(theme, { label: 'value' }))
export const view = <Msg>(toMessage: (message: Chart.ChartMessage) => Msg): Html =>
  pieCard({ hostId: HOST_ID, title: 'Pie Chart - Custom Label', toMessage })
