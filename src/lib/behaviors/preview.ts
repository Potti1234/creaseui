import { Schema as S } from 'effect'

export const Model = S.Struct({ key: S.NullOr(S.String) })
export type Model = typeof Model.Type

export const init = (): Model => ({ key: null })

export const show = (model: Model, key: string, current: string): Model => {
  const preview = key === current ? null : key
  return preview === model.key ? model : { key: preview }
}

export const clear = (model: Model, key?: string): Model =>
  key === undefined || key === model.key ? init() : model

export const value = (model: Model, current: string): string =>
  model.key ?? current
