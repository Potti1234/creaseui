import type { Html } from 'foldkit/html'
import * as Chart from '@/lib/echarts'
import { pieCard, pieOption } from './pie-shared'
const HOST_ID = 'chart-pie-donut'
Chart.registerChart(HOST_ID, theme => pieOption(theme, { donut: true }))
export const view = <Msg>(toMessage: (message: Chart.ChartMessage) => Msg): Html =>
  pieCard({ hostId: HOST_ID, title: 'Pie Chart - Donut', toMessage })
