import { Match as M, Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import * as Chart from '@/lib/echarts'
import * as AreaAxes from '@/demo/charts/cards/area-axes'
import * as AreaDefault from '@/demo/charts/cards/area-default'
import * as AreaGradient from '@/demo/charts/cards/area-gradient'
import * as AreaIcons from '@/demo/charts/cards/area-icons'
import * as AreaInteractive from '@/demo/charts/cards/area-interactive'
import * as AreaLegend from '@/demo/charts/cards/area-legend'
import * as AreaLinear from '@/demo/charts/cards/area-linear'
import * as AreaStacked from '@/demo/charts/cards/area-stacked'
import * as AreaStackedExpand from '@/demo/charts/cards/area-stacked-expand'
import * as AreaStep from '@/demo/charts/cards/area-step'
import { chartsPageShell } from '@/demo/charts/shell'
import * as Select from '@/ui/select'

/* /charts/area — grid of area chart variants. Chart mounts emit ChartMessage
   (mounted/synced) which this page absorbs; interactive variants add their own
   state here. Card modules live in src/demo/charts/cards/. */

// MODEL

export const Model = S.Struct({
  timeRange: S.Union([
    S.Literal('90d'),
    S.Literal('30d'),
    S.Literal('7d'),
  ]),
  timeRangeSelect: Select.Model,
})
export type Model = typeof Model.Type

// MESSAGE

export const GotChartMessage = m('GotChartMessage', {
  message: Chart.ChartMessage,
})
export const GotTimeRangeSelectMessage = m('GotTimeRangeSelectMessage', {
  message: Select.Message,
})

export const Message = S.Union([
  GotChartMessage,
  GotTimeRangeSelectMessage,
])
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({
  timeRange: '90d',
  timeRangeSelect: Select.init({
    id: 'chart-area-interactive-range',
    selectedItem: '90d',
    isAnimated: true,
  }),
})

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotChartMessage: () => [model, []],
      GotTimeRangeSelectMessage: ({ message: childMessage }) => {
        const [timeRangeSelect, selectCommands, maybeOutMessage] =
          Select.update(model.timeRangeSelect, childMessage)
        const timeRange = Option.match(maybeOutMessage, {
          onNone: () => model.timeRange,
          onSome: ({ value }) =>
            value === '30d' || value === '7d' ? value : '90d',
        })
        const chartCommands = Option.isSome(maybeOutMessage)
          ? [
              Command.mapMessage(
                Chart.SyncChart({
                  hostId: AreaInteractive.HOST_ID,
                  variant: timeRange,
                }),
                message => GotChartMessage({ message }),
              ),
            ]
          : []

        return [
          evo(model, {
            timeRange: () => timeRange,
            timeRangeSelect: () => timeRangeSelect,
          }),
          [
            ...Command.mapMessages(selectCommands, message =>
              GotTimeRangeSelectMessage({ message }),
            ),
            ...chartCommands,
          ],
        ]
      },
    }),
  )

// VIEW

export const view = (model: Model): Html => {
  const toMessage = (message: Chart.ChartMessage): Message =>
    GotChartMessage({ message })

  return chartsPageShell<Message>('area', [
    AreaDefault.view(toMessage),
    AreaLinear.view(toMessage),
    AreaStep.view(toMessage),
    AreaStacked.view(toMessage),
    AreaStackedExpand.view(toMessage),
    AreaLegend.view(toMessage),
    AreaGradient.view(toMessage),
    AreaAxes.view(toMessage),
    AreaIcons.view(toMessage),
    AreaInteractive.view({
      timeRange: model.timeRange,
      selectModel: model.timeRangeSelect,
      toChartMessage: toMessage,
      toSelectMessage: message => GotTimeRangeSelectMessage({ message }),
    }),
  ])
}
