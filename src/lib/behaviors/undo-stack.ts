import { Schema } from 'effect'

export const Model = <A extends Schema.Top>(entry: A) =>
  Schema.Struct({
    past: Schema.Array(entry),
    future: Schema.Array(entry),
    open: Schema.NullOr(
      Schema.Struct({ group: Schema.String, time: Schema.Number }),
    ),
  })

export type Model<A> = Readonly<{
  past: ReadonlyArray<A>
  future: ReadonlyArray<A>
  open: Readonly<{ group: string; time: number }> | null
}>

export const init = <A>(): Model<A> => ({ past: [], future: [], open: null })

export type Options = Readonly<{ limit?: number }>
export type PushOptions = Options &
  Readonly<{
    group?: string
    now?: number
    groupDelay?: number
  }>

export const seal = <A>(model: Model<A>): Model<A> =>
  model.open === null ? model : { ...model, open: null }

export const push = <A>(
  model: Model<A>,
  present: A,
  options: PushOptions = {},
): Model<A> => {
  const limit = options.limit ?? 100
  if (limit !== Infinity && (!Number.isInteger(limit) || limit < 0)) {
    throw new RangeError('Undo stack limit must be a non-negative integer')
  }
  const { group, now, groupDelay = 500 } = options
  if (group && (now === undefined || !Number.isFinite(now))) {
    throw new RangeError('Grouped pushes require a finite caller-supplied time')
  }
  const joins =
    !!group &&
    model.open?.group === group &&
    now! - model.open.time < groupDelay
  const past = joins ? model.past : [...model.past, present]
  return {
    past: past.slice(Math.max(0, past.length - limit)),
    future: [],
    open: group && limit > 0 ? { group, time: now! } : null,
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
          open: null,
        },
        present: model.past[model.past.length - 1]!,
      }
    : { model: seal(model), present }

export const redo = <A>(
  model: Model<A>,
  present: A,
): Readonly<{ model: Model<A>; present: A }> =>
  canRedo(model)
    ? {
        model: {
          past: [...model.past, present],
          future: model.future.slice(1),
          open: null,
        },
        present: model.future[0]!,
      }
    : { model: seal(model), present }

export const clear = <A>(_model: Model<A>): Model<A> => init()
