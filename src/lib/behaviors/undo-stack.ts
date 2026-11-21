import { Schema } from 'effect'

export const Model = <A extends Schema.Top>(entry: A) =>
  Schema.Struct({ past: Schema.Array(entry), future: Schema.Array(entry) })

export type Model<A> = Readonly<{
  past: ReadonlyArray<A>
  future: ReadonlyArray<A>
}>

export const init = <A>(): Model<A> => ({ past: [], future: [] })

export const push = <A>(
  model: Model<A>,
  present: A,
  options: Readonly<{ limit?: number }> = {},
): Model<A> => {
  const limit = options.limit ?? Infinity
  if (limit !== Infinity && (!Number.isInteger(limit) || limit < 0)) {
    throw new RangeError('Undo stack limit must be a non-negative integer')
  }
  const past = [...model.past, present]
  return {
    past: past.slice(Math.max(0, past.length - limit)),
    future: [],
  }
}

export const canUndo = <A>(model: Model<A>): boolean => model.past.length > 0
export const canRedo = <A>(model: Model<A>): boolean => model.future.length > 0

export const undo = <A>(
  model: Model<A>,
  present: A,
): Readonly<{ model: Model<A>; present: A }> =>
  canUndo(model)
    ? {
        model: {
          past: model.past.slice(0, -1),
          future: [present, ...model.future],
        },
        present: model.past[model.past.length - 1]!,
      }
    : { model, present }

export const redo = <A>(
  model: Model<A>,
  present: A,
): Readonly<{ model: Model<A>; present: A }> =>
  canRedo(model)
    ? {
        model: {
          past: [...model.past, present],
          future: model.future.slice(1),
        },
        present: model.future[0]!,
      }
    : { model, present }

export const clear = <A>(_model: Model<A>): Model<A> => init()
