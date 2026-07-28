import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Chart from '@/lib/echarts'
import * as BarActive from '@/demo/charts/cards/bar-active'
import * as BarDefault from '@/demo/charts/cards/bar-default'
import * as BarHorizontal from '@/demo/charts/cards/bar-horizontal'
import * as BarInteractive from '@/demo/charts/cards/bar-interactive'
import * as BarLabel from '@/demo/charts/cards/bar-label'
import * as BarLabelCustom from '@/demo/charts/cards/bar-label-custom'
import * as BarMixed from '@/demo/charts/cards/bar-mixed'
import * as BarMultiple from '@/demo/charts/cards/bar-multiple'
import * as BarNegative from '@/demo/charts/cards/bar-negative'
import * as BarStacked from '@/demo/charts/cards/bar-stacked'
import { evo } from 'foldkit/struct'

import { chartsPageShell } from '@/demo/charts/shell'

/* /charts/bar — grid of bar chart variants. Chart mounts emit ChartMessage
   (mounted/synced) which this page absorbs; interactive variants add their own
   state here. Card modules live in src/demo/charts/cards/. */

// MODEL

export const Model = S.Struct({
  activeSeries: S.Union([S.Literal('desktop'), S.Literal('mobile')]),
})
export type Model = typeof Model.Type

// MESSAGE

export const GotChartMessage = m('GotChartMessage', {
  message: Chart.ChartMessage,
})
export const SelectedSeries = m('SelectedSeries', {
  series: S.Union([S.Literal('desktop'), S.Literal('mobile')]),
})

export const Message = S.Union([GotChartMessage, SelectedSeries])
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({ activeSeries: 'desktop' })

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotChartMessage: () => [model, []],
      SelectedSeries: ({ series }) => [
        evo(model, { activeSeries: () => series }),
        [
          Command.mapMessage(
            Chart.SyncChart({
              hostId: BarInteractive.HOST_ID,
              variant: series,
            }),
            message => GotChartMessage({ message }),
          ),
        ],
      ],
    }),
  )

// VIEW

export const view = (model: Model): Html => {
  const toMessage = (message: Chart.ChartMessage): Message =>
    GotChartMessage({ message })

  return chartsPageShell<Message>('bar', [
    BarDefault.view(toMessage),
    BarHorizontal.view(toMessage),
    BarMultiple.view(toMessage),
    BarStacked.view(toMessage),
    BarLabel.view(toMessage),
    BarLabelCustom.view(toMessage),
    BarMixed.view(toMessage),
    BarActive.view(toMessage),
    BarNegative.view(toMessage),
    BarInteractive.view({
      activeSeries: model.activeSeries,
      onSelect: series => SelectedSeries({ series }),
      toMessage,
    }),
  ])
}
