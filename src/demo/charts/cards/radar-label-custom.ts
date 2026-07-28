import type { Html } from 'foldkit/html'
import * as Chart from '@/lib/echarts'
import { DESKTOP, MOBILE, radarCard, radarOption } from './radar-shared'
const HOST_ID = 'chart-radar-label-custom'
Chart.registerChart(HOST_ID, theme =>
  radarOption(theme, { desktop: DESKTOP, mobile: MOBILE, customLabels: true }),
)
export const view = <Msg>(toMessage: (message: Chart.ChartMessage) => Msg): Html =>
  radarCard({ hostId: HOST_ID, title: 'Radar Chart - Custom Label', toMessage })
