import { Schema } from 'effect'
import { Context } from './change'

export const Change = Schema.Struct({
  ref: Schema.String,
  component: Schema.String,
  label: Schema.optionalKey(Schema.String),
  key: Schema.String,
  value: Schema.Unknown,
  previous: Schema.Unknown,
  ...Context.fields,
  phase: Schema.Literals(['Live', 'Commit']),
  redacted: Schema.Boolean,
})
export type Change = typeof Change.Type

export type Options = Readonly<{
  within?: ((ref: string) => boolean) | ReadonlyArray<string>
  live?: boolean
}>

export const change = (
  input: Omit<Change, 'redacted'> & Readonly<{ secret?: boolean }>,
): Change => {
  const { secret = false, label, ...fields } = input
  return {
    ...fields,
    ...(label === undefined ? {} : { label }),
    value: secret ? '[redacted]' : fields.value,
    previous: secret ? '[redacted]' : fields.previous,
    redacted: secret,
  }
}

export const accepts = (options: Options, change: Change): boolean =>
  change.phase === (options.live === true ? 'Live' : 'Commit') &&
  (options.within === undefined ||
    (typeof options.within === 'function'
      ? options.within(change.ref)
      : options.within.some(prefix => change.ref.startsWith(prefix))))

export const filter = (
  changes: Change | ReadonlyArray<Change>,
  options: Options = {},
): ReadonlyArray<Change> =>
  (Array.isArray(changes) ? changes : [changes]).filter(change =>
    accepts(options, change),
  )
