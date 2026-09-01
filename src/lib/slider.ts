export type NormalizedRange = Readonly<{
  min: number
  max: number
  step: number
}>

export const normalizeRange = (
  firstBound: number,
  secondBound: number,
  requestedStep = 1,
): NormalizedRange => ({
  min: Math.min(firstBound, secondBound),
  max: Math.max(firstBound, secondBound),
  step: Number.isFinite(requestedStep) && requestedStep > 0 ? requestedStep : 1,
})

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(Number.isFinite(value) ? value : min, max))

const decimalPlaces = (value: number): number => {
  const exponent = value.toString().match(/e-(\d+)$/u)?.[1]
  if (exponent !== undefined) return Number(exponent)
  return value.toString().split('.')[1]?.length ?? 0
}

export const snapRangeValue = (
  value: number,
  range: NormalizedRange,
): number => {
  const snapped = range.min + Math.round((value - range.min) / range.step) * range.step
  const precision = Math.max(decimalPlaces(range.min), decimalPlaces(range.step))
  return Number(clamp(snapped, range.min, range.max).toFixed(precision))
}

export const normalizeRangeValues = (
  values: readonly [number, number],
  range: NormalizedRange,
): readonly [number, number] => {
  const first = snapRangeValue(values[0], range)
  const second = snapRangeValue(values[1], range)
  return first <= second ? [first, second] : [second, first]
}

export const updateRangeValue = (
  values: readonly [number, number],
  index: 0 | 1,
  nextValue: number,
  range: NormalizedRange,
): readonly [number, number] => {
  const next = snapRangeValue(nextValue, range)
  return index === 0
    ? [Math.min(next, values[1]), values[1]]
    : [values[0], Math.max(next, values[0])]
}
