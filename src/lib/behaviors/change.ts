import { Schema } from 'effect'

/** Serializable context to carry through parent Messages and Commands. */
export const Context = Schema.Struct({
  reason: Schema.String,
  source: Schema.String,
  attribution: Schema.optionalKey(Schema.String),
})
export type Context = typeof Context.Type

export type Request<Value> = Context & Readonly<{ value: Value }>

type Transition<Value> = Request<Value> & Readonly<{ previous: Value }>

export type Committed<Value> = Transition<Value> & Readonly<{ phase: 'Commit' }>
type Live<Value> = Transition<Value> & Readonly<{ phase: 'Live' }>

type Result<Model, Value> =
  | Readonly<{ status: 'unchanged' | 'vetoed'; model: Model }>
  | Readonly<{ status: 'committed'; model: Model; change: Committed<Value> }>
  | Readonly<{ status: 'live'; model: Model; change: Live<Value> }>

type Options<Model, Value> = Readonly<{
  read: (model: Model) => Value
  write: (model: Model, value: Value) => Model
  beforeWrite?: (proposal: Transition<Value>, model: Model) => boolean
  equal?: (previous: Value, value: Value) => boolean
  phase?: 'Live' | 'Commit'
}>

/** Report an accepted value against the baseline of the interaction. */
export const commit = <Value>(
  previous: Value,
  value: Value,
  context: Context,
  equal: (previous: Value, value: Value) => boolean = Object.is,
): Committed<Value> | undefined =>
  equal(previous, value)
    ? undefined
    : { ...context, previous, value, phase: 'Commit' }

/** Resolve a proposal in the parent update against its current model. */
export const apply = <Model, Value>(
  model: Model,
  request: Request<Value>,
  options: Options<Model, Value>,
): Result<Model, Value> => {
  const {
    read,
    write,
    beforeWrite,
    equal = Object.is,
    phase = 'Commit',
  } = options
  const previous = read(model)
  if (equal(previous, request.value)) return { status: 'unchanged', model }
  if (beforeWrite?.({ ...request, previous }, model) === false)
    return { status: 'vetoed', model }

  const next = write(model, request.value)
  const value = read(next)
  if (equal(previous, value)) return { status: 'unchanged', model: next }
  const change = { ...request, previous, value }
  return phase === 'Live'
    ? { status: 'live', model: next, change: { ...change, phase: 'Live' } }
    : {
        status: 'committed',
        model: next,
        change: { ...change, phase: 'Commit' },
      }
}
