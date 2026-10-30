import { Match as M, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Layer = S.Literals(['foundation', 'system', 'application'])
export type Layer = typeof Layer.Type

export const Renderer = S.Literals(['tailwind', 'stylex', 'pleat'])
export type Renderer = typeof Renderer.Type

export const Screen = S.Literals(['list', 'board', 'composer'])
export type Screen = typeof Screen.Type

export const Model = S.Struct({
  layer: Layer,
  renderer: Renderer,
  screen: Screen,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseLayer: { layer: Layer },
  ChoseRenderer: { renderer: Renderer },
  ChoseScreen: { screen: Screen },
})
export type Message = typeof Message.Type

export const init = (): Update.Return<Model, Message> => ({
  model: { layer: 'foundation', renderer: 'tailwind', screen: 'list' },
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseLayer: ({ layer }) => ({ model: { ...model, layer } }),
      ChoseRenderer: ({ renderer }) => ({ model: { ...model, renderer } }),
      ChoseScreen: ({ screen }) => ({ model: { ...model, screen } }),
    }),
  )
