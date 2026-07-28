import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Chart from '@/lib/echarts'

import * as RadialGrid from '@/demo/charts/cards/radial-grid'
import * as RadialLabel from '@/demo/charts/cards/radial-label'
import * as RadialShape from '@/demo/charts/cards/radial-shape'
import * as RadialSimple from '@/demo/charts/cards/radial-simple'
import * as RadialStacked from '@/demo/charts/cards/radial-stacked'
import * as RadialText from '@/demo/charts/cards/radial-text'
import { chartsPageShell } from '@/demo/charts/shell'

/* /charts/radial — grid of radial chart variants. Chart mounts emit ChartMessage
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

  return chartsPageShell<Message>('radial', [
    RadialSimple.view(toMessage),
    RadialLabel.view(toMessage),
    RadialGrid.view(toMessage),
    RadialText.view(toMessage),
    RadialShape.view(toMessage),
    RadialStacked.view(toMessage),
  ])
}
