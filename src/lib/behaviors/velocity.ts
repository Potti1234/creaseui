import { Schema } from 'effect'

export const Sample = Schema.Struct({
  time: Schema.Finite,
  position: Schema.Finite,
})
export type Sample = typeof Sample.Type

export const Model = Schema.Struct({
  samples: Schema.Array(Sample),
  horizon: Schema.Finite,
  staleAfter: Schema.Finite,
  maxSpeed: Schema.Finite,
  capacity: Schema.Int,
})
export type Model = typeof Model.Type

export type Options = Readonly<{
  horizon?: number
  staleAfter?: number
  maxSpeed?: number
  capacity?: number
}>

const nonnegative = (value: number, fallback: number): number =>
  Number.isFinite(value) && value >= 0 ? value : fallback

export const init = (options: Options = {}): Model => ({
  samples: [],
  horizon: nonnegative(options.horizon ?? 70, 70),
  staleAfter: nonnegative(options.staleAfter ?? 40, 40),
  maxSpeed: nonnegative(options.maxSpeed ?? 8, 8),
  capacity:
    Number.isInteger(options.capacity) && (options.capacity ?? 0) > 0
      ? (options.capacity ?? 20)
      : 20,
})

export const addSample = (
  model: Model,
  time: number,
  position: number,
): Model => {
  const newest = model.samples.at(-1)
  if (
    !Number.isFinite(time) ||
    !Number.isFinite(position) ||
    (newest && time <= newest.time)
  )
    return model
  return {
    ...model,
    samples: [...model.samples, { time, position }].slice(-model.capacity),
  }
}

const linearSlope = (samples: ReadonlyArray<Sample>): number => {
  let meanTime = 0
  let meanPosition = 0
  const count = samples.length
  for (const sample of samples) {
    meanTime += sample.time / count
    meanPosition += sample.position / count
  }
  let covariance = 0
  let variance = 0
  for (const sample of samples) {
    const dt = sample.time - meanTime
    covariance += dt * (sample.position - meanPosition)
    variance += dt * dt
  }
  return variance > 0 ? covariance / variance : 0
}

const leastSquaresVelocity = (samples: ReadonlyArray<Sample>): number => {
  if (samples.length < 2) return 0
  const newest = samples.at(-1)
  if (!newest || samples.length < 4) return linearSlope(samples)
  let s0 = 0
  let s1 = 0
  let s2 = 0
  let s3 = 0
  let s4 = 0
  let x0 = 0
  let x1 = 0
  let x2 = 0
  for (const sample of samples) {
    const t = sample.time - newest.time
    const x = sample.position
    const t2 = t * t
    s0 += 1
    s1 += t
    s2 += t2
    s3 += t2 * t
    s4 += t2 * t2
    x0 += x
    x1 += x * t
    x2 += x * t2
  }
  const determinant =
    s0 * (s2 * s4 - s3 * s3) -
    s1 * (s1 * s4 - s3 * s2) +
    s2 * (s1 * s3 - s2 * s2)
  if (Math.abs(determinant) < 1e-9) return linearSlope(samples)
  const numerator =
    s0 * (x1 * s4 - s3 * x2) -
    x0 * (s1 * s4 - s3 * s2) +
    s2 * (s1 * x2 - x1 * s2)
  return numerator / determinant
}

export const velocity = (model: Model, now: number): number => {
  const newest = model.samples.at(-1)
  if (!Number.isFinite(now) || !newest || now - newest.time > model.staleAfter)
    return 0
  const samples = model.samples.filter(
    sample => newest.time - sample.time <= model.horizon,
  )
  const fitted = leastSquaresVelocity(samples)
  return Math.max(-model.maxSpeed, Math.min(model.maxSpeed, fitted))
}

export const reset = (model: Model): Model => ({ ...model, samples: [] })
