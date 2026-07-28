import * as Chart from '@/lib/echarts'
import { registerTooltipCard, tooltipCardView } from '@/demo/charts/cards/tooltip-default'

const HOST_ID = 'chart-tooltip-formatter'
registerTooltipCard(HOST_ID, 'formatter')

export const view = <Msg>(toMessage: (message: Chart.ChartMessage) => Msg) =>
  tooltipCardView({
    hostId: HOST_ID,
    title: 'Tooltip - Formatter',
    description: 'Tooltip with custom formatter .',
    toMessage,
  })
