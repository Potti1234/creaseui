import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Chart from '@/lib/echarts'

import * as RadarDefault from '@/demo/charts/cards/radar-default'
import * as RadarDots from '@/demo/charts/cards/radar-dots'
import * as RadarGridCircle from '@/demo/charts/cards/radar-grid-circle'
import * as RadarGridCircleFill from '@/demo/charts/cards/radar-grid-circle-fill'
import * as RadarGridCircleNoLines from '@/demo/charts/cards/radar-grid-circle-no-lines'
import * as RadarGridCustom from '@/demo/charts/cards/radar-grid-custom'
import * as RadarGridFill from '@/demo/charts/cards/radar-grid-fill'
import * as RadarGridNone from '@/demo/charts/cards/radar-grid-none'
import * as RadarIcons from '@/demo/charts/cards/radar-icons'
import * as RadarLabelCustom from '@/demo/charts/cards/radar-label-custom'
import * as RadarLegend from '@/demo/charts/cards/radar-legend'
import * as RadarLinesOnly from '@/demo/charts/cards/radar-lines-only'
import * as RadarMultiple from '@/demo/charts/cards/radar-multiple'
import * as RadarRadius from '@/demo/charts/cards/radar-radius'
import { chartsPageShell } from '@/demo/charts/shell'

/* /charts/radar — grid of radar chart variants. Chart mounts emit ChartMessage
   (mounted/synced) which this page absorbs; interactive variants add their own
   state here. Card modules live in src/demo/charts/cards/. */

// MODEL

export const Model = S.Struct({})
export type Model = typeof Model.Type

// MESSAGE

export const GotChartMessage = m('GotChartMessage', {
  message: Chart.ChartMessage,
})

export const Message = S.Union([GotChartMessage])
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({})

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotChartMessage: () => [model, []],
    }),
  )

// VIEW

export const view = (_model: Model): Html => {
  const toMessage = (message: Chart.ChartMessage): Message =>
    GotChartMessage({ message })

  return chartsPageShell<Message>('radar', [
    RadarDefault.view(toMessage),
    RadarMultiple.view(toMessage),
    RadarDots.view(toMessage),
    RadarLinesOnly.view(toMessage),
    RadarLabelCustom.view(toMessage),
    RadarRadius.view(toMessage),
    RadarGridCustom.view(toMessage),
    RadarGridNone.view(toMessage),
    RadarGridCircle.view(toMessage),
    RadarGridCircleNoLines.view(toMessage),
    RadarGridCircleFill.view(toMessage),
    RadarGridFill.view(toMessage),
    RadarLegend.view(toMessage),
    RadarIcons.view(toMessage),
  ])
}
