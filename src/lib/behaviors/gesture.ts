/** Total remaining displacement for discrete per-millisecond deceleration. */
export const projectDistance = (velocity: number, rate: number): number =>
  Number.isFinite(velocity) && rate > 0 && rate < 1
    ? (velocity * rate) / (1 - rate)
    : 0

const tau = 2 * Math.PI

/** Number wedges clockwise from up, with each wedge centered at its heading. */
export const sectorOf = (
  dx: number,
  dy: number,
  count: number,
  {
    deadZone = 18,
    start = 0,
  }: Readonly<{ deadZone?: number; start?: number }> = {},
): number => {
  if (
    !Number.isFinite(dx) ||
    !Number.isFinite(dy) ||
    !Number.isSafeInteger(count) ||
    count < 1 ||
    !Number.isFinite(start) ||
    Math.hypot(dx, dy) <= Math.max(0, deadZone)
  )
    return -1
  const turns = Math.atan2(dx, -dy) / tau - (start % 1)
  const index = Math.round(turns * count) % count
  return (index + count) % count
}

type SpringSample = Readonly<{ position: number; velocity: number }>

/** A damped spring about zero. Response is seconds, time is ms and velocity is distance/ms. */
export const solveSpring = (
  response: number,
  damping: number,
  initialPosition: number,
  initialVelocity: number,
) => {
  const x = Number.isFinite(initialPosition) ? initialPosition : 0
  const v = Number.isFinite(initialVelocity) ? initialVelocity : 0
  const ratio = Number.isFinite(damping) ? Math.max(0, damping) : 1
  const omega =
    tau / ((Number.isFinite(response) && response > 0 ? response : 0.4) * 1000)
  const decay = ratio * omega
  const delta = ratio - 1
  const solve = (): ((time: number) => SpringSample) => {
    if (Math.abs(delta) < 1e-6) {
      const slope = v + decay * x
      return time => {
        const factor = Math.exp(-decay * time)
        const linear = x + slope * time
        return {
          position: factor * linear,
          velocity: factor * (slope - decay * linear),
        }
      }
    }
    if (delta < 0) {
      const frequency = omega * Math.sqrt(1 - ratio * ratio)
      const amplitude = (v + decay * x) / frequency
      return time => {
        const factor = Math.exp(-decay * time)
        const cos = Math.cos(frequency * time)
        const sin = Math.sin(frequency * time)
        const wave = x * cos + amplitude * sin
        return {
          position: factor * wave,
          velocity:
            factor * (frequency * (amplitude * cos - x * sin) - decay * wave),
        }
      }
    }
    const root = Math.sqrt(ratio * ratio - 1)
    const slow = -omega / (ratio + root)
    const fast = -omega * (ratio + root)
    const a = (v - fast * x) / (slow - fast)
    const b = x - a
    return time => {
      const left = a * Math.exp(slow * time)
      const right = b * Math.exp(fast * time)
      return { position: left + right, velocity: slow * left + fast * right }
    }
  }
  const at = solve()
  const sample = (time: number): SpringSample =>
    Number.isFinite(time) && time > 0 ? at(time) : { position: x, velocity: v }
  return {
    sample,
    position: (time: number) => sample(time).position,
    velocity: (time: number) => sample(time).velocity,
  }
}
